import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyUserSessionToken, createUserSessionToken, USER_COOKIE_NAME } from '@/lib/auth/userAuth';
import { UserProfile } from '@/types/user';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(USER_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Oturum bulunamadı. Lütfen giriş yapınız.' },
        { status: 401 }
      );
    }

    const sessionPayload = await verifyUserSessionToken(token);
    if (!sessionPayload) {
      return NextResponse.json(
        { success: false, error: 'Oturumunuzun süresi dolmuş.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, phone } = body as { name?: string; phone?: string };

    const updatedName = (name && name.trim()) || sessionPayload.name;
    const updatedPhone = phone !== undefined ? phone.trim() : sessionPayload.phone;

    if (supabaseAdmin) {
      await supabaseAdmin.auth.admin.updateUserById(sessionPayload.id, {
        user_metadata: {
          name: updatedName,
          phone: updatedPhone,
        },
      });
    }

    const updatedProfile: UserProfile = {
      id: sessionPayload.id,
      name: updatedName,
      email: sessionPayload.email,
      phone: updatedPhone,
      isVerified: true,
      createdAt: new Date().toISOString(),
    };

    const newSessionToken = await createUserSessionToken({
      id: updatedProfile.id,
      email: updatedProfile.email,
      name: updatedProfile.name,
      phone: updatedProfile.phone,
    });

    const response = NextResponse.json({
      success: true,
      user: updatedProfile,
      message: 'Profiliniz başarıyla güncellendi.',
    });

    response.cookies.set(USER_COOKIE_NAME, newSessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error('Profil güncelleme hatası:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Profil güncellenemedi.' },
      { status: 500 }
    );
  }
}
