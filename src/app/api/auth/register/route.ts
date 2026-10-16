import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyCode } from '@/lib/auth/verificationStore';
import { createUserSessionToken, USER_COOKIE_NAME } from '@/lib/auth/userAuth';
import {
  isAuthorizedAdminEmail,
  createAdminToken,
  ADMIN_COOKIE_NAME,
} from '@/lib/adminAuth';
import { UserProfile } from '@/types/user';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, code } = body as {
      name?: string;
      email?: string;
      password?: string;
      code?: string;
    };

    // 1. Girdi Kontrolleri
    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Lütfen adınızı ve soyadınızı giriniz.' },
        { status: 400 }
      );
    }

    if (!email || !email.trim()) {
      return NextResponse.json(
        { success: false, error: 'Lütfen geçerli bir e-posta adresi giriniz.' },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Şifreniz en az 6 karakterden oluşmalıdır.' },
        { status: 400 }
      );
    }

    if (!code || !code.trim()) {
      return NextResponse.json(
        { success: false, error: 'Lütfen e-postanıza gönderilen 6 haneli doğrulama kodunu giriniz.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanName = name.trim();

    // 2. Doğrulama Kodunu Kontrol Et
    const codeResult = verifyCode(cleanEmail, code.trim(), 'register');
    if (!codeResult.valid) {
      return NextResponse.json(
        { success: false, error: codeResult.reason || 'Doğrulama kodu geçersiz veya süresi dolmuş.' },
        { status: 400 }
      );
    }

    // 3. Supabase Auth ile Kullanıcı Oluştur
    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: 'Kimlik doğrulama sunucusu yapılandırılmamış.' },
        { status: 500 }
      );
    }

    const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      password: password,
      email_confirm: true,
      user_metadata: {
        name: cleanName,
      },
    });

    if (createError) {
      // E-posta zaten kayıtlıysa kullanıcı dostu mesaj dön
      if (createError.message.includes('already registered') || createError.message.includes('already exists')) {
        return NextResponse.json(
          { success: false, error: 'Bu e-posta adresiyle zaten kayıtlı bir hesap var. Giriş yapabilirsiniz.' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { success: false, error: createError.message || 'Kullanıcı hesabı oluşturulamadı.' },
        { status: 400 }
      );
    }

    const authUser = createData.user;
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: 'Hesap oluşturulurken beklenmeyen bir durum oluştu.' },
        { status: 500 }
      );
    }

    // 4. Yönetici Yetki Kontrolü
    const isAdmin = await isAuthorizedAdminEmail(cleanEmail);

    const profile: UserProfile = {
      id: authUser.id,
      name: cleanName,
      email: cleanEmail,
      role: isAdmin ? 'ADMIN' : 'CUSTOMER',
      isAdmin: isAdmin,
      isVerified: true,
      createdAt: authUser.created_at || new Date().toISOString(),
    };

    // 5. Güvenli Oturum Token'ı Üret ve HTTP-Only Cookie Olarak Kaydet
    const sessionToken = await createUserSessionToken({
      id: profile.id,
      email: profile.email,
      name: profile.name,
      role: profile.role,
      isAdmin: profile.isAdmin,
    });

    const response = NextResponse.json({
      success: true,
      user: profile,
      isAdmin,
      message: 'Hesabınız başarıyla oluşturuldu ve doğrulandı.',
    });

    response.cookies.set(USER_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 gün
    });

    // Eğer yetkili bir yönetici ise admin çerezini de ayarla
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
    console.error('Kayıt API hatası:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Hesap oluşturulurken hata meydana geldi.' },
      { status: 500 }
    );
  }
}
