import { NextRequest, NextResponse } from 'next/server';
import { verifyUserSessionToken, USER_COOKIE_NAME } from '@/lib/auth/userAuth';
import {
  isAuthorizedAdminEmail,
  createAdminToken,
  ADMIN_COOKIE_NAME,
} from '@/lib/adminAuth';
import { UserProfile } from '@/types/user';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(USER_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ success: false, user: null });
    }

    const payload = await verifyUserSessionToken(token);
    if (!payload) {
      const response = NextResponse.json({ success: false, user: null });
      response.cookies.delete(USER_COOKIE_NAME);
      return response;
    }

    const isAdmin = await isAuthorizedAdminEmail(payload.email);

    const profile: UserProfile = {
      id: payload.id,
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      role: isAdmin ? 'ADMIN' : (payload.role || 'CUSTOMER'),
      isAdmin: isAdmin,
      isVerified: true,
      createdAt: new Date().toISOString(),
    };

    const response = NextResponse.json({
      success: true,
      user: profile,
      isAdmin,
    });

    // Eğer kullanıcı bir admin ise ve henüz admin token çerezi yoksa çerezi ayarla
    const currentAdminToken = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
    if (isAdmin && !currentAdminToken) {
      const adminToken = await createAdminToken({
        username: payload.email,
        role: 'ADMIN',
        name: payload.name,
      });

      response.cookies.set(ADMIN_COOKIE_NAME, adminToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Oturum doğrulanamadı.', user: null },
      { status: 500 }
    );
  }
}
