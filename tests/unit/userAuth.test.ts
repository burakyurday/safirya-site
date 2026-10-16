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
});
