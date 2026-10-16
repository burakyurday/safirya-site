import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyCode } from '@/lib/auth/verificationStore';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, code, newPassword } = body as {
      email?: string;
      code?: string;
      newPassword?: string;
    };

    if (!email || !email.trim()) {
      return NextResponse.json(
        { success: false, error: 'Lütfen e-posta adresinizi giriniz.' },
        { status: 400 }
      );
    }

    if (!code || !code.trim()) {
      return NextResponse.json(
        { success: false, error: 'Lütfen 6 haneli doğrulama kodunu giriniz.' },
        { status: 400 }
      );
    }

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Yeni şifreniz en az 6 karakter olmalıdır.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Doğrulama Kodunu Kontrol Et
    const codeResult = verifyCode(cleanEmail, code.trim(), 'reset_password');
    if (!codeResult.valid) {
      return NextResponse.json(
        { success: false, error: codeResult.reason || 'Doğrulama kodu geçersiz veya süresi dolmuş.' },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: 'Kimlik doğrulama servisi yapılandırılmamış.' },
        { status: 500 }
      );
    }

    // 2. Kullanıcıyı Supabase Auth'ta bul
    const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError || !usersData?.users) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı sorgulanırken hata oluştu.' },
        { status: 500 }
      );
    }

    const matchedUser = usersData.users.find((u) => u.email?.toLowerCase() === cleanEmail);
    if (!matchedUser) {
      return NextResponse.json(
        { success: false, error: 'Bu e-posta adresine ait bir kullanıcı bulunamadı.' },
        { status: 404 }
      );
    }

    // 3. Şifreyi Supabase üzerinde güvenle güncelle
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(matchedUser.id, {
      password: newPassword,
    });

    if (updateError) {
      return NextResponse.json(
        { success: false, error: updateError.message || 'Şifre güncellenemedi.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Şifreniz başarıyla güncellendi. Yeni şifrenizle giriş yapabilirsiniz.',
    });
  } catch (error: any) {
    console.error('Şifre sıfırlama hatası:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Şifre sıfırlanırken hata oluştu.' },
      { status: 500 }
    );
  }
}
