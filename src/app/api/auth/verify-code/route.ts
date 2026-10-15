import { NextResponse } from 'next/server';
import { verifyCode } from '@/lib/auth/verificationStore';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, code, type = 'register' } = body as {
      email?: string;
      code?: string;
      type?: 'register' | 'reset_password' | 'login';
    };

    if (!email || !code) {
      return NextResponse.json(
        { success: false, error: 'E-posta ve doğrulama kodu zorunludur.' },
        { status: 400 }
      );
    }

    const result = verifyCode(email, code, type);

    if (!result.valid) {
      return NextResponse.json(
        { success: false, error: result.reason || 'Doğrulama kodu geçersiz.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Doğrulama başarılı.',
    });
  } catch (error: any) {
    console.error('Doğrulama hatası:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Doğrulama gerçekleştirilemedi.' },
      { status: 500 }
    );
  }
}
