import { NextRequest, NextResponse } from 'next/server';
import {
  validateAdminCredentials,
  createAdminToken,
  ADMIN_COOKIE_NAME,
} from '@/lib/adminAuth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Kullanıcı adı / e-posta ve parola gereklidir.' },
        { status: 400 }
      );
    }

    const isValid = validateAdminCredentials(username, password);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Hatalı kullanıcı adı veya parola. Lütfen tekrar deneyiniz.' },
        { status: 401 }
      );
    }

    const token = await createAdminToken({
      username: username.trim().toLowerCase(),
      role: 'ADMIN',
      name: 'Safirya Yönetim',
    });

    const response = NextResponse.json({
      success: true,
      message: 'Giriş başarılı.',
    });

    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 gün
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: 'Sunucu hatası oluştu. Lütfen tekrar deneyiniz.' },
      { status: 500 }
    );
  }
}
