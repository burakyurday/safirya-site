import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createUserSessionToken, USER_COOKIE_NAME } from '@/lib/auth/userAuth';
import {
  isAuthorizedAdminEmail,
  createAdminToken,
  ADMIN_COOKIE_NAME,
  validateAdminCredentials,
} from '@/lib/adminAuth';
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

    let authenticatedUser: { id: string; name: string; email: string; phone?: string; isVerified: boolean; createdAt: string } | null = null;

    // 1. Supabase Auth ile Şifreli Giriş Doğrulaması
    if (supabase) {
      try {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: password,
        });

        if (!signInError && signInData?.user) {
          const authUser = signInData.user;
          const name = (authUser.user_metadata?.name as string) || cleanEmail.split('@')[0] || 'Safirya Üyesi';
          const phone = (authUser.user_metadata?.phone as string) || undefined;

          authenticatedUser = {
            id: authUser.id,
            name,
            email: cleanEmail,
            phone,
            isVerified: Boolean(authUser.email_confirmed_at),
            createdAt: authUser.created_at || new Date().toISOString(),
          };
        }
      } catch (err) {
        console.warn('Supabase auth sign-in warning:', err);
      }
    }

    // 2. Eğer Supabase Auth başarısız olduysa, .env Fallback Admin Girişi Kontrolü
    if (!authenticatedUser) {
      if (validateAdminCredentials(cleanEmail, password)) {
        authenticatedUser = {
          id: 'admin-master',
          name: 'Safirya Atölye Yönetici',
          email: cleanEmail,
          isVerified: true,
          createdAt: new Date().toISOString(),
        };
      }
    }

    if (!authenticatedUser) {
      return NextResponse.json(
        { success: false, error: 'Girdiğiniz e-posta veya şifre hatalı. Lütfen kontrol edip tekrar deneyiniz.' },
        { status: 401 }
      );
    }

    // 3. Yönetici Yetki Kontrolü
    const isAdmin = await isAuthorizedAdminEmail(cleanEmail);

    const profile: UserProfile = {
      id: authenticatedUser.id,
      name: authenticatedUser.name,
      email: cleanEmail,
      phone: authenticatedUser.phone,
      role: isAdmin ? 'ADMIN' : 'CUSTOMER',
      isAdmin: isAdmin,
      isVerified: authenticatedUser.isVerified,
      createdAt: authenticatedUser.createdAt,
    };

    // 4. Güvenli Kullanıcı Oturum Token'ı Üret
    const sessionToken = await createUserSessionToken({
      id: profile.id,
      email: profile.email,
      name: profile.name,
      phone: profile.phone,
      role: profile.role,
      isAdmin: profile.isAdmin,
    });

    const response = NextResponse.json({
      success: true,
      user: profile,
      isAdmin,
      message: isAdmin ? 'Yönetici oturumu açıldı.' : 'Giriş başarılı.',
    });

    // Kullanıcı Çerezini Ayarla (30 gün)
    response.cookies.set(USER_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    });

    // Eğer admin yetkilisi ise admin çerezini de ayarla (7 gün)
    if (isAdmin) {
      const adminToken = await createAdminToken({
        username: cleanEmail,
        role: 'ADMIN',
        name: profile.name,
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
    console.error('Giriş API hatası:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Giriş yapılırken bir hata oluştu.' },
      { status: 500 }
    );
  }
}
