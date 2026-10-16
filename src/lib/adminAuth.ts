import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';
import { supabaseAdmin } from '@/lib/supabase';
import prisma from '@/lib/prisma';
import { verifyUserSessionToken } from '@/lib/auth/userAuth';

export const ADMIN_COOKIE_NAME = 'safirya_admin_token';

// Secret key for JWT signing - reads from process.env or fallback secure secret
const getJwtSecret = () => {
  const secret = process.env.ADMIN_JWT_SECRET || 'safirya_craft_super_secret_production_key_2026_xyz987_secured';
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
 * Checks both safirya_admin_token and safirya_user_token (with admin role)
 */
export async function getAdminSessionServer(): Promise<AdminSession | null> {
  try {
    const cookieStore = await cookies();

    // 1. Önce doğrudan Admin JWT çerezini kontrol et
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    if (token) {
      const adminSession = await verifyAdminToken(token);
      if (adminSession) return adminSession;
    }

    // 2. Vitrinden giriş yapıp panele geçen yetkililer için kullanıcı oturum çerezini kontrol et
    const userToken = cookieStore.get('safirya_user_token')?.value;
    if (userToken) {
      const userPayload = await verifyUserSessionToken(userToken);
      if (userPayload?.email) {
        const isAuth = await isAuthorizedAdminEmail(userPayload.email);
        if (isAuth || userPayload.role === 'ADMIN' || userPayload.isAdmin) {
          return {
            username: userPayload.email,
            role: 'ADMIN',
            name: userPayload.name || 'Safirya Yönetici',
          };
        }
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Validates admin credentials against environment variables or dev fallback
 */
export function validateAdminCredentials(username: string, pass: string): boolean {
  const envUser = process.env.ADMIN_USERNAME;
  const envPass = process.env.ADMIN_PASSWORD;

  const configuredUser = (envUser || 'admin@safirya.tr').trim().toLowerCase();
  const configuredPass = (envPass || 'S6568!').trim();

  return (
    username.trim().toLowerCase() === configuredUser &&
    pass.trim() === configuredPass
  );
}

// ==========================================
// YÖNETİM PANELİ YETKİLENDİRME (ADMIN ROLLERİ)
// ==========================================

export interface AuthorizedAdminRecord {
  email: string;
  name?: string;
  role: 'ADMIN';
  addedAt: string;
  addedBy?: string;
  isPrimary?: boolean;
}

const ADMIN_DATA_FILE = path.join(process.cwd(), 'data', 'authorized-admins.json');

// In-memory cache for fast lookups (15 second TTL)
let cachedAdmins: { list: AuthorizedAdminRecord[]; expiresAt: number } | null = null;

export function invalidateAdminCache(): void {
  cachedAdmins = null;
}

/**
 * Promise timeout sarmalayıcısı - dış servis gecikmelerinin sistemi kilitlemesini önler
 */
function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(fallback), ms);
    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch(() => {
        clearTimeout(timer);
        resolve(fallback);
      });
  });
}

/**
 * Birincil süper yönetici e-posta adreslerini döndürür.
 */
export function getPrimaryAdminEmails(): string[] {
  const envUser = (process.env.ADMIN_USERNAME || 'admin@safirya.tr').trim().toLowerCase();
  const defaults = ['admin@safirya.tr', envUser];
  return Array.from(new Set(defaults.filter(Boolean)));
}

/**
 * Dosyadan yetkili yönetici kayıtlarını okur.
 */
function readStoredAdmins(): AuthorizedAdminRecord[] {
  try {
    if (fs.existsSync(ADMIN_DATA_FILE)) {
      const raw = fs.readFileSync(ADMIN_DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('authorized-admins.json okuma hatası:', e);
  }
  return [];
}

/**
 * Yetkili yönetici kayıtlarını kalıcı dosyaya yazar.
 */
function writeStoredAdmins(admins: AuthorizedAdminRecord[]): void {
  try {
    const dir = path.dirname(ADMIN_DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(ADMIN_DATA_FILE, JSON.stringify(admins, null, 2), 'utf-8');
  } catch (e) {
    console.warn('authorized-admins.json yazma uyarısı (read-only ortam veya yetki kısıtı):', e);
  }
}

/**
 * Supabase Auth ve Veritabanından admin yetkisine sahip kullanıcıları çeker (paralel sorgu).
 */
async function fetchCloudAdmins(): Promise<AuthorizedAdminRecord[]> {
  const records: AuthorizedAdminRecord[] = [];

  const taskAuth = (async () => {
    if (!supabaseAdmin) return;
    try {
      const { data } = await supabaseAdmin.auth.admin.listUsers();
      if (data?.users && Array.isArray(data.users)) {
        for (const u of data.users) {
          const role = String(u.user_metadata?.role || u.app_metadata?.role || '').toLowerCase();
          if (role === 'admin' && u.email) {
            records.push({
              email: u.email.toLowerCase().trim(),
              name: (u.user_metadata?.name as string) || u.email.split('@')[0],
              role: 'ADMIN',
              addedAt: u.created_at || new Date().toISOString(),
              addedBy: 'Supabase Auth',
              isPrimary: false,
            });
          }
        }
      }
    } catch {
      // sessizce geç
    }
  })();

  const taskDb = (async () => {
    if (!supabaseAdmin) return;
    try {
      const { data } = await supabaseAdmin
        .from('users')
        .select('email, name, role, createdAt')
        .eq('role', 'ADMIN');
      if (data && Array.isArray(data)) {
        for (const u of data) {
          if (u.email) {
            const clean = u.email.toLowerCase().trim();
            if (!records.some((r) => r.email === clean)) {
              records.push({
                email: clean,
                name: u.name || clean.split('@')[0],
                role: 'ADMIN',
                addedAt: u.createdAt || new Date().toISOString(),
                addedBy: 'Veritabanı',
                isPrimary: false,
              });
            }
          }
        }
      }
    } catch {
      // sessizce geç
    }
  })();

  await withTimeout(Promise.allSettled([taskAuth, taskDb]), 2000, null);
  return records;
}

/**
 * Panelde listelenecek tüm yetkili yöneticilerin detaylı listesini döndürür.
 * (.env birincil adminleri + Supabase Cloud + Veritabanı + Yerel Dosya birleştirilir)
 */
export async function listAuthorizedAdmins(skipCache = false): Promise<AuthorizedAdminRecord[]> {
  const now = Date.now();
  if (!skipCache && cachedAdmins && cachedAdmins.expiresAt > now) {
    return cachedAdmins.list;
  }

  const primaryEmails = getPrimaryAdminEmails();
  const stored = readStoredAdmins();
  const cloudAdmins = await fetchCloudAdmins();

  const map = new Map<string, AuthorizedAdminRecord>();

  // 1. Birincil Yöneticileri Ekle
  for (const pEmail of primaryEmails) {
    const existing = stored.find((s) => s.email.toLowerCase().trim() === pEmail);
    map.set(pEmail, {
      email: pEmail,
      name: existing?.name || (pEmail === 'admin@safirya.tr' ? 'Safirya Ana Yönetici' : 'Süper Yönetici'),
      role: 'ADMIN',
      addedAt: existing?.addedAt || '2026-01-01T00:00:00.000Z',
      isPrimary: true,
      addedBy: 'Sistem (.env)',
    });
  }

  // 2. Buluttan (Supabase Auth & DB) gelenleri ekle
  for (const c of cloudAdmins) {
    if (!map.has(c.email)) {
      map.set(c.email, c);
    }
  }

  // 3. Yerel Dosyadan gelenleri ekle
  for (const s of stored) {
    const cleanEmail = s.email.toLowerCase().trim();
    if (!map.has(cleanEmail)) {
      map.set(cleanEmail, {
        ...s,
        email: cleanEmail,
        isPrimary: false,
      });
    }
  }

  const list = Array.from(map.values());
  cachedAdmins = { list, expiresAt: now + 15000 }; // 15 saniye önbellek
  return list;
}

/**
 * Yetkili tüm yönetici e-posta adreslerinin listesini döndürür (küçük harfli).
 */
export async function getAuthorizedAdminEmails(): Promise<string[]> {
  const admins = await listAuthorizedAdmins();
  return admins.map((a) => a.email.toLowerCase().trim());
}

/**
 * Verilen e-posta adresinin yetkili bir yönetici olup olmadığını kontrol eder.
 */
export async function isAuthorizedAdminEmail(email?: string | null): Promise<boolean> {
  if (!email || typeof email !== 'string') return false;
  const clean = email.toLowerCase().trim();
  if (!clean) return false;

  const adminEmails = await getAuthorizedAdminEmails();
  return adminEmails.includes(clean);
}

/**
 * Sisteme yeni bir yönetici e-postası yetkisi tanımlar.
 */
export async function addAuthorizedAdmin(
  email: string,
  options?: { name?: string; addedBy?: string }
): Promise<{ success: boolean; error?: string; admin?: AuthorizedAdminRecord }> {
  const cleanEmail = (email || '').toLowerCase().trim();

  // E-posta format doğrulaması
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!cleanEmail || !emailRegex.test(cleanEmail)) {
    return { success: false, error: 'Lütfen geçerli bir e-posta adresi giriniz.' };
  }

  const existingEmails = await getAuthorizedAdminEmails();
  if (existingEmails.includes(cleanEmail)) {
    return { success: false, error: 'Bu e-posta adresi zaten yönetici yetkisine sahiptir.' };
  }

  const newAdmin: AuthorizedAdminRecord = {
    email: cleanEmail,
    name: options?.name?.trim() || cleanEmail.split('@')[0],
    role: 'ADMIN',
    addedAt: new Date().toISOString(),
    addedBy: options?.addedBy || 'Yönetim Paneli',
    isPrimary: false,
  };

  // 1. Yerel Dosyaya Kaydet
  const stored = readStoredAdmins();
  if (!stored.some((s) => s.email.toLowerCase().trim() === cleanEmail)) {
    stored.push(newAdmin);
    writeStoredAdmins(stored);
  }

  // Önbelleği temizle
  invalidateAdminCache();

  // 2. Supabase Auth ve DB Senkronizasyonu (Zaman aşımı korumalı)
  await withTimeout(
    syncUserAdminRole(cleanEmail, true, newAdmin.name),
    3000,
    null
  );

  return { success: true, admin: newAdmin };
}

/**
 * Bir yöneticinin yetkisini kaldırır.
 */
export async function removeAuthorizedAdmin(
  email: string
): Promise<{ success: boolean; error?: string }> {
  const cleanEmail = (email || '').toLowerCase().trim();

  const primaryEmails = getPrimaryAdminEmails();
  if (primaryEmails.includes(cleanEmail)) {
    return { success: false, error: 'Birincil süper yönetici yetkisi kaldırılamaz.' };
  }

  const stored = readStoredAdmins();
  const filtered = stored.filter((s) => s.email.toLowerCase().trim() !== cleanEmail);
  writeStoredAdmins(filtered);

  // Önbelleği temizle
  invalidateAdminCache();

  // Supabase Auth ve DB Senkronizasyonu
  await withTimeout(
    syncUserAdminRole(cleanEmail, false),
    3000,
    null
  );

  return { success: true };
}

/**
 * Kullanıcının rolünü harici servislerde (Supabase Auth & Database) günceller (paralel).
 */
async function syncUserAdminRole(email: string, makeAdmin: boolean, displayName?: string): Promise<void> {
  const tasks: Promise<any>[] = [];

  // 1. Supabase Auth (auth.users)
  if (supabaseAdmin) {
    tasks.push(
      (async () => {
        try {
          const { data } = await supabaseAdmin.auth.admin.listUsers();
          const existingUser = data?.users?.find((u) => u.email?.toLowerCase().trim() === email);

          if (existingUser) {
            await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
              user_metadata: {
                ...existingUser.user_metadata,
                role: makeAdmin ? 'admin' : 'customer',
                name: displayName || existingUser.user_metadata?.name,
              },
              app_metadata: {
                ...existingUser.app_metadata,
                role: makeAdmin ? 'admin' : 'customer',
              },
            });
          } else if (makeAdmin) {
            await supabaseAdmin.auth.admin.createUser({
              email,
              email_confirm: true,
              user_metadata: {
                role: 'admin',
                name: displayName || email.split('@')[0],
              },
              app_metadata: {
                role: 'admin',
              },
            });
          }
        } catch (sbErr) {
          console.warn('Supabase auth senkronizasyon uyarısı:', sbErr);
        }
      })()
    );
  }

  // 2. Supabase Veritabanı (public.users)
  if (supabaseAdmin) {
    tasks.push(
      (async () => {
        try {
          const { data: dbUser } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('email', email)
            .maybeSingle();

          if (dbUser?.id) {
            await supabaseAdmin
              .from('users')
              .update({
                role: makeAdmin ? 'ADMIN' : 'CUSTOMER',
                name: displayName || undefined,
                updatedAt: new Date().toISOString(),
              })
              .eq('id', dbUser.id);
          } else if (makeAdmin) {
            await supabaseAdmin.from('users').insert({
              id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              email,
              name: displayName || email.split('@')[0],
              role: 'ADMIN',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          }
        } catch (dbErr) {
          console.warn('Supabase DB users tablosu senkronizasyon uyarısı:', dbErr);
        }
      })()
    );
  }

  // 3. Prisma DB Güncellemesi (varsa)
  tasks.push(
    (async () => {
      try {
        await withTimeout(
          prisma.user.updateMany({
            where: { email: { equals: email, mode: 'insensitive' } },
            data: { role: makeAdmin ? 'ADMIN' : 'CUSTOMER' },
          }),
          2000,
          null
        );
      } catch {
        // sessizce geç
      }
    })()
  );

  await Promise.allSettled(tasks);
}
