import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createUserSessionToken, USER_COOKIE_NAME } from '@/lib/auth/userAuth';
import { UserProfile } from '@/types/user';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body as { email?: string; password?: string };

    if (!email || !email.trim()) {
      return NextResponse.json(
        { success: false, error: 'Lütfen e-posta adresinizi giriniz.' },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { success: false, error: 'Lütfen şifrenizi giriniz.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Kimlik doğrulama servisi yapılandırılmamış.' },
        { status: 500 }
      );
    }

    // 1. Supabase Auth ile Şifreli Giriş Doğrulaması (Bcrypt Hash kontrolü sunucuda yapılır)
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: password,
    });

    if (signInError || !signInData.user) {
      return NextResponse.json(
        { success: false, error: 'Girdiğiniz e-posta veya şifre hatalı. Lütfen kontrol edip tekrar deneyiniz.' },
        { status: 401 }
      );
    }

    const authUser = signInData.user;
    const name = (authUser.user_metadata?.name as string) || cleanEmail.split('@')[0] || 'Safirya Üyesi';
    const phone = (authUser.user_metadata?.phone as string) || undefined;

    const profile: UserProfile = {
      id: authUser.id,
      name,
      email: cleanEmail,
      phone,
      isVerified: Boolean(authUser.email_confirmed_at),
      createdAt: authUser.created_at || new Date().toISOString(),
    };

    // 2. Güvenli Oturum Token'ı Üret ve HTTP-Only Cookie Olarak Kaydet
    const sessionToken = await createUserSessionToken({
      id: profile.id,
      email: profile.email,
      name: profile.name,
      phone: profile.phone,
    });

    const response = NextResponse.json({
      success: true,
      user: profile,
      message: 'Giriş başarılı.',
    });

    response.cookies.set(USER_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 gün
    });

    return response;
  } catch (error: any) {
    console.error('Giriş API hatası:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Giriş yapılırken bir hata oluştu.' },
      { status: 500 }
    );
  }
}
