import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { UserProfile } from '@/types/user';

export const USER_COOKIE_NAME = 'safirya_user_token';

// JWT anahtarını ortam değişkeninden alır; tanımlı değilse güvenli varsayılan anahtar kullanır
const getUserJwtSecret = () => {
  const secret =
    process.env.USER_JWT_SECRET ||
    process.env.ADMIN_JWT_SECRET ||
    'safirya_user_session_secret_dev_key_2026_abc123';

  return new TextEncoder().encode(secret);
};

export interface UserSessionPayload {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role?: 'ADMIN' | 'CUSTOMER' | 'ATELIER_STAFF';
  isAdmin?: boolean;
}

/**
 * Kullanıcı için 30 günlük güvenli oturum JWT token'ı üretir.
 */
export async function createUserSessionToken(payload: UserSessionPayload): Promise<string> {
  const secret = getUserJwtSecret();
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret);
}

/**
 * Kullanıcı oturum token'ını doğrular.
 */
export async function verifyUserSessionToken(token: string): Promise<UserSessionPayload | null> {
  try {
    const secret = getUserJwtSecret();
    const { payload } = await jwtVerify(token, secret);
    if (typeof payload.id === 'string' && typeof payload.email === 'string') {
      return {
        id: payload.id,
        email: payload.email,
        name: (payload.name as string) || 'Safirya Üyesi',
        phone: (payload.phone as string) || undefined,
        role: (payload.role as any) || undefined,
        isAdmin: Boolean(payload.isAdmin || payload.role === 'ADMIN'),
      };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Sunucu tarafında (Server Components & API Routes) aktif kullanıcı oturumunu okur.
 */
export async function getUserSessionServer(): Promise<UserProfile | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(USER_COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = await verifyUserSessionToken(token);
    if (!payload) return null;

    return {
      id: payload.id,
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      role: payload.role,
      isAdmin: payload.isAdmin,
      isVerified: true,
      createdAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}
