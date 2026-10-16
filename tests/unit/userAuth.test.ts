// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { createUserSessionToken, verifyUserSessionToken } from '@/lib/auth/userAuth';

describe('userAuth - JWT Oturum Yönetimi', () => {
  it('geçerli kullanıcı bilgisiyle JWT token üretmeli ve doğrulamalıdır', async () => {
    const payload = {
      id: 'usr-test-123',
      email: 'test@safirya.tr',
      name: 'Test Kullanıcı',
      phone: '+90 532 555 72 34',
    };

    const token = await createUserSessionToken(payload);
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(50);

    const verified = await verifyUserSessionToken(token);
    expect(verified).not.toBeNull();
    expect(verified?.id).toBe(payload.id);
    expect(verified?.email).toBe(payload.email);
    expect(verified?.name).toBe(payload.name);
    expect(verified?.phone).toBe(payload.phone);
  });

  it('bozuk veya geçersiz JWT token için null dönmelidir', async () => {
    const verified = await verifyUserSessionToken('invalid.token.here');
    expect(verified).toBeNull();
  });

  it('USER_JWT_SECRET ve ADMIN_JWT_SECRET tanımlı olmadığında bile güvenli fallback ile token üretebilmelidir', async () => {
    const originalUserSecret = process.env.USER_JWT_SECRET;
    const originalAdminSecret = process.env.ADMIN_JWT_SECRET;
    const originalNodeEnv = process.env.NODE_ENV;

    try {
      delete process.env.USER_JWT_SECRET;
      delete process.env.ADMIN_JWT_SECRET;
      (process.env as any).NODE_ENV = 'production';

      const token = await createUserSessionToken({
        id: 'usr-fallback-test',
        email: 'fallback@safirya.tr',
        name: 'Fallback Kullanıcı',
      });

      expect(typeof token).toBe('string');
      const verified = await verifyUserSessionToken(token);
      expect(verified?.email).toBe('fallback@safirya.tr');
    } finally {
      process.env.USER_JWT_SECRET = originalUserSecret;
      process.env.ADMIN_JWT_SECRET = originalAdminSecret;
      (process.env as any).NODE_ENV = originalNodeEnv;
    }
  });
});

