import { NextRequest, NextResponse } from 'next/server';
import { verifyUserSessionToken, USER_COOKIE_NAME } from '@/lib/auth/userAuth';
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

    const profile: UserProfile = {
      id: payload.id,
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      isVerified: true,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      user: profile,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Oturum doğrulanamadı.', user: null },
      { status: 500 }
    );
  }
}
