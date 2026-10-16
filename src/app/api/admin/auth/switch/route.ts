import { NextRequest, NextResponse } from 'next/server';
import {
  verifyUserSessionToken,
  createUserSessionToken,
  USER_COOKIE_NAME,
} from '@/lib/auth/userAuth';
import {
  isAuthorizedAdminEmail,
  createAdminToken,
  ADMIN_COOKIE_NAME,
} from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/auth/switch
 * Doğrudan link tıklamaları (<a href="/api/admin/auth/switch">) ile
 * kullanıcı oturumunu doğrulayıp admin çerezini ayarlar ve yönetim paneline yönlendirir.
 */
export async function GET(req: NextRequest) {
  try {
    const userToken = req.cookies.get(USER_COOKIE_NAME)?.value;
    if (!userToken) {
      const loginUrl = new URL('/hesabim/giris', req.url);
      loginUrl.searchParams.set('returnUrl', '/admin');
      return NextResponse.redirect(loginUrl);
    }

    const payload = await verifyUserSessionToken(userToken);
    if (!payload?.email) {
      const loginUrl = new URL('/hesabim/giris', req.url);
      loginUrl.searchParams.set('returnUrl', '/admin');
      return NextResponse.redirect(loginUrl);
    }

    const isAdmin = await isAuthorizedAdminEmail(payload.email);
    if (!isAdmin) {
      const hesabimUrl = new URL('/hesabim', req.url);
      hesabimUrl.searchParams.set('error', 'unauthorized_admin');
      return NextResponse.redirect(hesabimUrl);
    }

    // Admin JWT oturum token'ı oluştur
    const adminToken = await createAdminToken({
      username: payload.email,
      role: 'ADMIN',
      name: payload.name,
    });

    const response = NextResponse.redirect(new URL('/admin', req.url));

    // Admin çerezini ayarla (7 gün)
    response.cookies.set(ADMIN_COOKIE_NAME, adminToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    // Kullanıcı JWT'sinde rol henüz ADMIN olarak güncellenmemişse senkronize et
    if (!payload.isAdmin || payload.role !== 'ADMIN') {
      const updatedUserToken = await createUserSessionToken({
        ...payload,
        isAdmin: true,
        role: 'ADMIN',
      });
      response.cookies.set(USER_COOKIE_NAME, updatedUserToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60,
      });
    }

    return response;
  } catch (error: any) {
    console.error('Admin geçiş hatası (GET):', error);
    return NextResponse.redirect(new URL('/admin/giris', req.url));
  }
}

/**
 * POST /api/admin/auth/switch
 * AJAX istekleri ile geçiş yapıp JSON yanıt döner.
 */
export async function POST(req: NextRequest) {
  try {
    const userToken = req.cookies.get(USER_COOKIE_NAME)?.value;
    if (!userToken) {
      return NextResponse.json(
        { success: false, error: 'Oturum bulunamadı. Lütfen önce giriş yapınız.' },
        { status: 401 }
      );
    }

    const payload = await verifyUserSessionToken(userToken);
    if (!payload?.email) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz kullanıcı oturumu.' },
        { status: 401 }
      );
    }

    const isAdmin = await isAuthorizedAdminEmail(payload.email);
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Bu hesap için yönetim paneli yetkisi bulunmuyor.' },
        { status: 403 }
      );
    }

    const adminToken = await createAdminToken({
      username: payload.email,
      role: 'ADMIN',
      name: payload.name,
    });

    const response = NextResponse.json({
      success: true,
      redirectUrl: '/admin',
      message: 'Yönetim paneline yönlendiriliyorsunuz.',
    });

    response.cookies.set(ADMIN_COOKIE_NAME, adminToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    // Kullanıcı JWT'sinde rol henüz ADMIN olarak güncellenmemişse senkronize et
    if (!payload.isAdmin || payload.role !== 'ADMIN') {
      const updatedUserToken = await createUserSessionToken({
        ...payload,
        isAdmin: true,
        role: 'ADMIN',
      });
      response.cookies.set(USER_COOKIE_NAME, updatedUserToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60,
      });
    }

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Geçiş yapılırken hata oluştu.' },
      { status: 500 }
    );
  }
}
