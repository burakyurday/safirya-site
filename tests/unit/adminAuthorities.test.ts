// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  isAuthorizedAdminEmail,
  addAuthorizedAdmin,
  removeAuthorizedAdmin,
  listAuthorizedAdmins,
  createAdminToken,
  ADMIN_COOKIE_NAME,
  verifyAdminToken,
} from '@/lib/adminAuth';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/admin/auth/switch/route';
import { createUserSessionToken, USER_COOKIE_NAME } from '@/lib/auth/userAuth';

const TEST_ADMIN_FILE = path.join(process.cwd(), 'data', 'authorized-admins.json');

describe('Admin Authorities & Yetkilendirme Sistemi', { timeout: 15000 }, () => {
  let originalFileContent: string | null = null;

  beforeAll(() => {
    if (fs.existsSync(TEST_ADMIN_FILE)) {
      originalFileContent = fs.readFileSync(TEST_ADMIN_FILE, 'utf-8');
    } else {
      originalFileContent = null;
    }
  });

  beforeEach(() => {
    // Testler başlamadan önce yetkili listesini sıfırla
    const dir = path.dirname(TEST_ADMIN_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(TEST_ADMIN_FILE, '[]', 'utf-8');
  });

  afterAll(() => {
    // Test sonrasında varsa orijinal dosyayı geri yükle veya temizle
    if (originalFileContent !== null) {
      fs.writeFileSync(TEST_ADMIN_FILE, originalFileContent, 'utf-8');
    } else if (fs.existsSync(TEST_ADMIN_FILE)) {
      fs.unlinkSync(TEST_ADMIN_FILE);
    }
  });

  it('varsayılan süper yönetici (admin@safirya.tr) her zaman yetkili olmalıdır', async () => {
    const isPrimaryAdmin = await isAuthorizedAdminEmail('admin@safirya.tr');
    expect(isPrimaryAdmin).toBe(true);

    const isPrimaryUpper = await isAuthorizedAdminEmail('ADMIN@SAFIRYA.TR ');
    expect(isPrimaryUpper).toBe(true);
  });

  it('yetkisi olmayan sıradan bir e-posta için false dönmelidir', async () => {
    const isCustomerAdmin = await isAuthorizedAdminEmail('musteri.test@example.com');
    expect(isCustomerAdmin).toBe(false);
  });

  it('geçersiz e-posta adreslerini reddetmelidir', async () => {
    const result = await addAuthorizedAdmin('gecersiz-email');
    expect(result.success).toBe(false);
    expect(result.error).toContain('geçerli bir e-posta');
  });

  it('yeni bir e-posta adresine başarıyla admin yetkisi vermeli ve doğrulamalıdır', async () => {
    const testEmail = `atolye.yetkili.${Date.now()}@safirya.tr`;

    // Önce yetkisiz olmalı
    const beforeAdd = await isAuthorizedAdminEmail(testEmail);
    expect(beforeAdd).toBe(false);

    // Yetki ver
    const addResult = await addAuthorizedAdmin(testEmail, {
      name: 'Atölye Sorumlusu Test',
      addedBy: 'Birim Testi',
    });
    expect(addResult.success).toBe(true);
    expect(addResult.admin?.email).toBe(testEmail);

    // Şimdi yetkili olmalı
    const afterAdd = await isAuthorizedAdminEmail(testEmail);
    expect(afterAdd).toBe(true);

    // Listede görünmeli
    const list = await listAuthorizedAdmins();
    const found = list.find((a) => a.email === testEmail);
    expect(found).toBeDefined();
    expect(found?.name).toBe('Atölye Sorumlusu Test');
    expect(found?.isPrimary).toBe(false);

    // Tekrar eklenmek istendiğinde hata vermeli
    const duplicateAdd = await addAuthorizedAdmin(testEmail);
    expect(duplicateAdd.success).toBe(false);
    expect(duplicateAdd.error).toContain('zaten');
  });

  it('birincil süper yöneticinin silinmesini engellemelidir', async () => {
    const removePrimary = await removeAuthorizedAdmin('admin@safirya.tr');
    expect(removePrimary.success).toBe(false);
    expect(removePrimary.error).toContain('kaldırılamaz');
  });

  it('eklenen yetkili yöneticinin yetkisini başarıyla kaldırabilmelidir', async () => {
    const testEmail = `gecici.yetkili.${Date.now()}@safirya.tr`;

    await addAuthorizedAdmin(testEmail, { name: 'Geçici Yetkili' });
    expect(await isAuthorizedAdminEmail(testEmail)).toBe(true);

    const removeResult = await removeAuthorizedAdmin(testEmail);
    expect(removeResult.success).toBe(true);

    expect(await isAuthorizedAdminEmail(testEmail)).toBe(false);
  });

  it('admin yetkisi verilen kullanıcı normal sitede oturum açtığında /api/admin/auth/switch ile panele geçiş yapabilmelidir', async () => {
    const adminEmail = `gecis.yonetici.${Date.now()}@safirya.tr`;

    // 1. Admin yetkisi tanımla
    await addAuthorizedAdmin(adminEmail, { name: 'Geçiş Yöneticisi' });

    // 2. Normal site kullanıcısı olarak oturum açmış kullanıcı JWT'si
    const userToken = await createUserSessionToken({
      id: 'usr-switch-test',
      email: adminEmail,
      name: 'Geçiş Yöneticisi',
    });

    // 3. GET /api/admin/auth/switch isteği (Tuşa tıklama simülasyonu)
    const req = new NextRequest('http://localhost:3000/api/admin/auth/switch', {
      headers: {
        cookie: `${USER_COOKIE_NAME}=${userToken}`,
      },
    });

    const res = await GET(req);

    // /admin sayfasına yönlendirmeli
    expect(res.status).toBe(307);
    const location = res.headers.get('location');
    expect(location).toContain('/admin');

    // Admin çerezi üretilmiş olmalı
    const setCookie = res.headers.get('set-cookie');
    expect(setCookie).toContain(ADMIN_COOKIE_NAME);

    // Çerezin doğrulanabilir admin oturumu içerdiğini kontrol et
    const tokenMatch = setCookie?.match(new RegExp(`${ADMIN_COOKIE_NAME}=([^;]+)`));
    expect(tokenMatch).not.toBeNull();
    const tokenValue = tokenMatch![1];

    const adminSession = await verifyAdminToken(tokenValue);
    expect(adminSession?.username).toBe(adminEmail);
    expect(adminSession?.role).toBe('ADMIN');
  });

  it('yetkisi olmayan normal müşteri switch tuşunu çağırırsa yetkisiz uyarısı ile yönlendirilmelidir', async () => {
    const userToken = await createUserSessionToken({
      id: 'usr-customer-test',
      email: 'sade.musteri@safirya.tr',
      name: 'Sade Müşteri',
    });

    const req = new NextRequest('http://localhost:3000/api/admin/auth/switch', {
      headers: {
        cookie: `${USER_COOKIE_NAME}=${userToken}`,
      },
    });

    const res = await GET(req);
    expect(res.status).toBe(307);
    const location = res.headers.get('location');
    expect(location).toContain('/hesabim');
    expect(location).toContain('error=unauthorized_admin');
  });
});
