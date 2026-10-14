import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const ADMIN_COOKIE_NAME = 'safirya_admin_token';

const getJwtSecret = () => {
  const secret = process.env.ADMIN_JWT_SECRET || 'safirya_craft_super_secret_production_key_2026_xyz987';
  return new TextEncoder().encode(secret);
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Sadece /admin yollarını koru
  if (pathname.startsWith('/admin')) {
    const isLoginPage = pathname === '/admin/giris' || pathname === '/admin/login';
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;

    let isAuthenticated = false;

    if (token) {
      try {
        const secret = getJwtSecret();
        const { payload } = await jwtVerify(token, secret);
        if (payload.role === 'ADMIN') {
          isAuthenticated = true;
        }
      } catch {
        isAuthenticated = false;
      }
    }

    // 1. Zaten giriş yapmış ve /admin/giris sayfasına gidiyorsa -> /admin paneline yönlendir
    if (isLoginPage && isAuthenticated) {
      const returnUrl = request.nextUrl.searchParams.get('returnUrl') || '/admin';
      return NextResponse.redirect(new URL(returnUrl, request.url));
    }

    // 2. Giriş yapmamış ve korumalı bir /admin sayfasına gitmeye çalışıyorsa -> /admin/giris'e yönlendir
    if (!isLoginPage && !isAuthenticated) {
      const loginUrl = new URL('/admin/giris', request.url);
      loginUrl.searchParams.set('returnUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
