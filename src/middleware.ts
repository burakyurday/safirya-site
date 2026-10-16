import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const ADMIN_COOKIE_NAME = 'safirya_admin_token';

const getJwtSecret = () => {
  const secret = process.env.ADMIN_JWT_SECRET || 'safirya_craft_super_secret_production_key_2026_xyz987_secured';
  return new TextEncoder().encode(secret);
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isApiAdmin = pathname.startsWith('/api/admin');
  const isAdminPage = pathname.startsWith('/admin');

  // 1. Yönetici Kontrolleri
  if (isAdminPage || isApiAdmin) {
    const isLoginPage = pathname === '/admin/giris' || pathname === '/admin/login' || pathname === '/api/admin/auth/login';
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

    // Normal kullanıcı oturumu (safirya_user_token) üzerinden admin yetkisi kontrolü
    if (!isAuthenticated) {
      const userToken = request.cookies.get('safirya_user_token')?.value;
      if (userToken) {
        try {
          const userSecret =
            process.env.USER_JWT_SECRET ||
            process.env.ADMIN_JWT_SECRET ||
            'safirya_user_session_secret_dev_key_2026_abc123';
          const { payload } = await jwtVerify(userToken, new TextEncoder().encode(userSecret));
          if (payload.role === 'ADMIN' || payload.isAdmin === true) {
            isAuthenticated = true;
          }
        } catch {
          // geçersiz token
        }
      }
    }

    // A. API Admin Rotaları Koruması (/api/admin/*)
    if (isApiAdmin && !isLoginPage) {
      if (!isAuthenticated) {
        return NextResponse.json(
          { success: false, error: 'Yetkisiz erişim. Yönetici oturumu gereklidir.' },
          { status: 401 }
        );
      }
    }

    // B. Admin Sayfa Rotaları Koruması (/admin/*)
    if (isAdminPage) {
      // Zaten giriş yapmışsa /admin/giris sayfasından ana panele yönlendir
      if (isLoginPage && isAuthenticated) {
        const returnUrl = request.nextUrl.searchParams.get('returnUrl') || '/admin';
        return NextResponse.redirect(new URL(returnUrl, request.url));
      }

      // Giriş yapmamışsa /admin sayfalarından /admin/giris'e yönlendir
      if (!isLoginPage && !isAuthenticated) {
        const loginUrl = new URL('/admin/giris', request.url);
        loginUrl.searchParams.set('returnUrl', pathname);
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  // 2. Güvenlik Başlıkları ile Devam Et
  const response = NextResponse.next();

  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), browsing-topics=()'
  );
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  );

  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
