import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

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

import fs from 'fs';
import path from 'path';
import { supabaseAdmin } from '@/lib/supabase';
import prisma from '@/lib/prisma';

const ADMIN_DATA_FILE = path.join(process.cwd(), 'data', 'authorized-admins.json');

/**
 * Birincil süper yönetici e-posta adreslerini döndürür.
 */
export function getPrimaryAdminEmails(): string[] {
  const envUser = (process.env.ADMIN_USERNAME || 'admin@safirya.tr').trim().toLowerCase();
  const defaults = ['admin@safirya.tr', envUser];
  return Array.from(new Set(defaults.filter(Boolean)));
}

/**
 * Dosyadan veya veritabanından yetkili yönetici kayıtlarını okur.
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
    console.error('authorized-admins.json yazma hatası:', e);
  }
}

/**
 * Yetkili tüm yönetici e-posta adreslerinin listesini döndürür (küçük harfli).
 */
export async function getAuthorizedAdminEmails(): Promise<string[]> {
  const primaryEmails = getPrimaryAdminEmails();
  const stored = readStoredAdmins();
  const storedEmails = stored.map((a) => a.email.toLowerCase().trim());

  const set = new Set<string>([...primaryEmails, ...storedEmails]);
  return Array.from(set);
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
 * Panelde listelenecek tüm yetkili yöneticilerin detaylı listesini döndürür.
 */
export async function listAuthorizedAdmins(): Promise<AuthorizedAdminRecord[]> {
  const primaryEmails = getPrimaryAdminEmails();
  const stored = readStoredAdmins();

  const list: AuthorizedAdminRecord[] = [];

  // 1. Birincil Yöneticileri Ekle
  for (const pEmail of primaryEmails) {
    const existing = stored.find((s) => s.email.toLowerCase().trim() === pEmail);
    list.push({
      email: pEmail,
      name: existing?.name || (pEmail === 'admin@safirya.tr' ? 'Safirya Ana Yönetici' : 'Süper Yönetici'),
      role: 'ADMIN',
      addedAt: existing?.addedAt || '2026-01-01T00:00:00.000Z',
      isPrimary: true,
      addedBy: 'Sistem (.env)',
    });
  }

  // 2. Eklenen Diğer Yetkilileri Ekle
  for (const s of stored) {
    const cleanEmail = s.email.toLowerCase().trim();
    if (!primaryEmails.includes(cleanEmail)) {
      list.push({
        ...s,
        email: cleanEmail,
        isPrimary: false,
      });
    }
  }

  return list;
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

  const stored = readStoredAdmins();
  stored.push(newAdmin);
  writeStoredAdmins(stored);

  // Supabase ve Prisma DB senkronizasyonu
  await syncUserAdminRole(cleanEmail, true, newAdmin.name);

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

  if (filtered.length === stored.length) {
    return { success: false, error: 'Bu e-posta adresi yetkili yöneticiler listesinde bulunamadı.' };
  }

  writeStoredAdmins(filtered);

  // Supabase ve Prisma DB senkronizasyonu
  await syncUserAdminRole(cleanEmail, false);

  return { success: true };
}

/**
 * Kullanıcının rolünü harici servislerde (Supabase Auth) günceller.
 */
async function syncUserAdminRole(email: string, makeAdmin: boolean, displayName?: string): Promise<void> {
  // 1. Supabase Auth Güncellemesi
  if (supabaseAdmin) {
    try {
      const { data } = await supabaseAdmin.auth.admin.listUsers();
      const user = data?.users?.find((u) => u.email?.toLowerCase().trim() === email);
      if (user) {
        await supabaseAdmin.auth.admin.updateUserById(user.id, {
          user_metadata: {
            ...user.user_metadata,
            role: makeAdmin ? 'admin' : 'customer',
            name: displayName || user.user_metadata?.name,
          },
          app_metadata: {
            ...user.app_metadata,
            role: makeAdmin ? 'admin' : 'customer',
          },
        });
      }
    } catch (sbErr) {
      console.warn('Supabase rol senkronizasyon uyarısı:', sbErr);
    }
  }
}
