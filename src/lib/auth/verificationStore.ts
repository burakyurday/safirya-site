interface VerificationEntry {
  email: string;
  code: string;
  type: string;
  expiresAt: number;
}

// In-memory verification storage across API calls in the same server instance
// Global declaration ensures it survives hot reloads in Next.js development
declare global {
  // eslint-disable-next-line no-var
  var __safirya_verification_codes: Map<string, VerificationEntry> | undefined;
}

const codesStore =
  global.__safirya_verification_codes ||
  (global.__safirya_verification_codes = new Map<string, VerificationEntry>());

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

  if (entry.code.trim() !== code.trim()) {
    return {
      valid: false,
      reason: 'Girdiğiniz doğrulama kodu hatalı. Lütfen kontrol edip tekrar deneyiniz.',
    };
  }

  // Başarılı doğrulama sonrası kodu temizle
  codesStore.delete(key);
  return { valid: true };
}
