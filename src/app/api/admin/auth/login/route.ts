import { NextRequest, NextResponse } from 'next/server';
import {
  validateAdminCredentials,
  createAdminToken,
  ADMIN_COOKIE_NAME,
} from '@/lib/adminAuth';
import { supabase } from '@/lib/supabase';

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

    let isValid = false;
    let adminDisplayName = 'Safirya Yönetim';

    // A. Önce Supabase Auth ile Şifreli Doğrulama
    if (supabase) {
      try {
        const { data: sbData, error: sbError } = await supabase.auth.signInWithPassword({
          email: cleanUser,
          password: password,
        });

        if (!sbError && sbData?.user) {
          const userMeta = sbData.user.user_metadata || {};
          const appMeta = sbData.user.app_metadata || {};
          const userRole = userMeta.role || appMeta.role;

          // Admin yetkisi kontrolü: role admin veya admin@safirya.tr veya env ADMIN_USERNAME
          const configuredAdminUser = (process.env.ADMIN_USERNAME || 'admin@safirya.tr').trim().toLowerCase();
          const isEligibleAdmin =
            userRole === 'admin' ||
            userRole === 'ADMIN' ||
            cleanUser === configuredAdminUser ||
            cleanUser === 'admin@safirya.tr';

          if (isEligibleAdmin) {
            isValid = true;
            adminDisplayName = userMeta.name || 'Safirya Atölye Yönetici';
          }
        }
      } catch (sbErr) {
        console.warn('Supabase auth sign-in warning:', sbErr);
      }
    }

    // B. Eğer Supabase Auth ile doğrulanmadıysa, .env Fallback Kontrolü
    if (!isValid) {
      isValid = validateAdminCredentials(username, password);
    }

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
      username: cleanUser,
      role: 'ADMIN',
      name: adminDisplayName,
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
  } catch (error: any) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: error?.message || 'Giriş yapılırken sunucu hatası oluştu. Lütfen tekrar deneyiniz.' },
      { status: 500 }
    );
  }
}
