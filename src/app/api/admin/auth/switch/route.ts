import { NextRequest, NextResponse } from 'next/server';
import { verifyUserSessionToken, USER_COOKIE_NAME } from '@/lib/auth/userAuth';
import {
  isAuthorizedAdminEmail,
  createAdminToken,
  ADMIN_COOKIE_NAME,
} from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

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

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Geçiş yapılırken hata oluştu.' },
      { status: 500 }
    );
  }
}
