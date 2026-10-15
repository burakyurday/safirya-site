interface VerificationEntry {
  email: string;
  code: string;
  type: string;
  expiresAt: number;
  attempts: number;
}

interface RequestRateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory verification storage across API calls in the same server instance
declare global {
  var __safirya_verification_codes: Map<string, VerificationEntry> | undefined;
  var __safirya_code_rate_limits: Map<string, RequestRateLimitEntry> | undefined;
}

const codesStore =
  global.__safirya_verification_codes ||
  (global.__safirya_verification_codes = new Map<string, VerificationEntry>());

const rateLimitsStore =
  global.__safirya_code_rate_limits ||
  (global.__safirya_code_rate_limits = new Map<string, RequestRateLimitEntry>());

const MAX_VERIFY_ATTEMPTS = 5;
const MAX_REQUESTS_PER_WINDOW = 3;
const REQUEST_WINDOW_MS = 10 * 60 * 1000; // 10 dakika

/**
 * Belirli bir e-posta için kod isteme sınırını kontrol eder.
 */
export function checkCodeRequestRateLimit(email: string): { allowed: boolean; remainingMinutes?: number } {
  const cleanEmail = email.toLowerCase().trim();
  const now = Date.now();
  const record = rateLimitsStore.get(cleanEmail);

  if (record && record.resetAt > now) {
    if (record.count >= MAX_REQUESTS_PER_WINDOW) {
      const remainingMinutes = Math.ceil((record.resetAt - now) / 60000);
      return { allowed: false, remainingMinutes };
    }
    record.count += 1;
  } else {
    rateLimitsStore.set(cleanEmail, {
      count: 1,
      resetAt: now + REQUEST_WINDOW_MS,
    });
  }

  return { allowed: true };
}

/**
 * 6 haneli rastgele sayısal doğrulama kodu üretir ve kaydeder (10 dakika geçerli)
 */
export function createVerificationCode(
  email: string,
  type: 'register' | 'reset_password' | 'login'
): string {
  const cleanEmail = email.toLowerCase().trim();
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 dakika

  codesStore.set(`${cleanEmail}_${type}`, {
    email: cleanEmail,
    code,
    type,
    expiresAt,
    attempts: 0,
  });

  return code;
}

/**
 * Gönderilen doğrulama kodunu kontrol eder ve geçerliyse siler
 */
export function verifyCode(
  email: string,
  code: string,
  type: 'register' | 'reset_password' | 'login'
): { valid: boolean; reason?: string } {
  const cleanEmail = email.toLowerCase().trim();
  const key = `${cleanEmail}_${type}`;
  const entry = codesStore.get(key);

  if (!entry) {
    return {
      valid: false,
      reason: 'Doğrulama kodu bulunamadı veya süresi doldu. Lütfen tekrar kod talep ediniz.',
    };
  }

  if (Date.now() > entry.expiresAt) {
    codesStore.delete(key);
    return {
      valid: false,
      reason: 'Doğrulama kodunun 10 dakikalık süresi dolmuştur. Lütfen yeni bir kod isteyiniz.',
    };
  }

  // Brute-force koruması: Hatalı deneme sayacı
  entry.attempts = (entry.attempts || 0) + 1;

  if (entry.attempts >= MAX_VERIFY_ATTEMPTS) {
    codesStore.delete(key);
    return {
      valid: false,
      reason:
        'Çok fazla hatalı deneme yapıldı. Güvenlik nedeniyle bu doğrulama kodu iptal edildi. Lütfen yeni bir kod talep ediniz.',
    };
  }

  if (entry.code.trim() !== code.trim()) {
    const remaining = MAX_VERIFY_ATTEMPTS - entry.attempts;
    return {
      valid: false,
      reason: `Girdiğiniz doğrulama kodu hatalı. Lütfen kontrol edip tekrar deneyiniz. (Kalan deneme hakkı: ${remaining})`,
    };
  }

  // Başarılı doğrulama sonrası kodu temizle
  codesStore.delete(key);
  return { valid: true };
}
