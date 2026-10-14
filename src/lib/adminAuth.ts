import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

export const ADMIN_COOKIE_NAME = 'safirya_admin_token';

// Secret key for JWT signing - reads from process.env or fallback secure dev secret
const getJwtSecret = () => {
  const secret = process.env.ADMIN_JWT_SECRET || 'safirya_craft_super_secret_production_key_2026_xyz987';
  return new TextEncoder().encode(secret);
};

export interface AdminSession {
  username: string;
  role: 'ADMIN';
  name: string;
}

/**
 * Creates and signs an Admin JWT session token (valid for 7 days)
 */
export async function createAdminToken(payload: AdminSession): Promise<string> {
  const secret = getJwtSecret();
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

/**
 * Verifies the admin token and returns the session payload if valid
 */
export async function verifyAdminToken(token: string): Promise<AdminSession | null> {
  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret);
    if (payload.role === 'ADMIN' && typeof payload.username === 'string') {
      return {
        username: payload.username,
        role: 'ADMIN',
        name: (payload.name as string) || 'Safirya Yönetim',
      };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Server-side helper to check if current request has a valid admin session
 */
export async function getAdminSessionServer(): Promise<AdminSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifyAdminToken(token);
  } catch {
    return null;
  }
}

/**
 * Validates admin credentials against environment variables
 */
export function validateAdminCredentials(username: string, pass: string): boolean {
  const configuredUser = (process.env.ADMIN_USERNAME || 'admin@safirya.tr').trim().toLowerCase();
  const configuredPass = (process.env.ADMIN_PASSWORD || 'Safirya2026!Craft').trim();

  return (
    username.trim().toLowerCase() === configuredUser &&
    pass.trim() === configuredPass
  );
}
