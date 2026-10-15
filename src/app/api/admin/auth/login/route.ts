import { NextRequest, NextResponse } from 'next/server';
import {
  validateAdminCredentials,
  createAdminToken,
  ADMIN_COOKIE_NAME,
} from '@/lib/adminAuth';

interface LoginAttemptRecord {
  count: number;
  lockedUntil: number;
}

// In-memory brute force protection across requests
const loginAttempts = new Map<string, LoginAttemptRecord>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 dakika

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    const forwardedFor = req.headers.get('x-forwarded-for') || '';
    const ip = forwardedFor.split(',')[0].trim() || 'ip_unknown';
    const cleanUser = (username || '').trim().toLowerCase();
    const rateLimitKey = `${ip}_${cleanUser}`;

    // 1. Kilitlenme Durumu Kontrolü
    const now = Date.now();
    const attemptRecord = loginAttempts.get(rateLimitKey);
    if (attemptRecord && attemptRecord.lockedUntil > now) {
      const remainingMinutes = Math.ceil((attemptRecord.lockedUntil - now) / 60000);
      return NextResponse.json(
        {
          error: `Güvenlik Koruması: Çok fazla hatalı deneme yapıldı. Lütfen ${remainingMinutes} dakika sonra tekrar deneyiniz.`,
        },
        { status: 429 }
      );
    }

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Kullanıcı adı / e-posta ve parola gereklidir.' },
        { status: 400 }
      );
    }

    const isValid = validateAdminCredentials(username, password);

    if (!isValid) {
      const currentAttempts = (attemptRecord && attemptRecord.lockedUntil <= now ? 0 : attemptRecord?.count || 0) + 1;
      const isLocked = currentAttempts >= MAX_ATTEMPTS;

      loginAttempts.set(rateLimitKey, {
        count: currentAttempts,
        lockedUntil: isLocked ? now + LOCKOUT_DURATION : 0,
      });

      if (isLocked) {
        return NextResponse.json(
          {
            error: 'Çok fazla hatalı giriş denemesi yapıldı. Hesabınız güvenlik nedeniyle 15 dakika kilitlendi.',
          },
          { status: 429 }
        );
      }

      const remaining = MAX_ATTEMPTS - currentAttempts;
      return NextResponse.json(
        {
          error: `Hatalı kullanıcı adı veya parola. (Kalan deneme hakkı: ${remaining})`,
        },
        { status: 401 }
      );
    }

    // Başarılı girişte deneme sayacını sıfırla
    loginAttempts.delete(rateLimitKey);

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
