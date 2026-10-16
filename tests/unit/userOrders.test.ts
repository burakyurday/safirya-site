// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { createUserSessionToken, USER_COOKIE_NAME } from '@/lib/auth/userAuth';

// Mock Supabase & Prisma for clean unit tests
vi.mock('@/lib/prisma', () => ({
  default: {
    order: {
      findMany: vi.fn().mockResolvedValue([
        {
          id: 'ord-db-1',
          orderNumber: 'SFR-2026-1001',
          guestName: 'Test Müşterisi',
          guestEmail: 'test.musteri@safirya.tr',
          guestPhone: '05551234567',
          shippingAddress: 'Kadıköy / İstanbul',
          totalAmount: 450,
          subtotal: 405,
          discountTotal: 0,
          shippingFee: 45,
          stage: 'ATOLYEDE_URETIMDE',
          paymentMethod: 'KREDI_KARTI',
          paymentStatus: 'ODENDI',
          cargoCompany: null,
          trackingCode: null,
          trackingUrl: null,
          isGiftWrapped: false,
          giftNote: null,
          createdAt: new Date('2026-10-15T10:00:00Z'),
          items: [
            {
              id: 'item-1',
              productName: 'Doğal Kehribar Soya Mumu',
              variantName: '210g Cam Kavanoz',
              quantity: 1,
              unitPrice: 405,
              totalAmount: 405,
              customization: {
                customText: 'Selin & Emre',
                selectedScent: 'Vanilya',
              },
            },
          ],
          stagePhotos: [],
        },
      ]),
      findUnique: vi.fn().mockImplementation(({ where }) => {
        if (where?.orderNumber === 'SFR-2026-1001') {
          return Promise.resolve({
            id: 'ord-db-1',
            orderNumber: 'SFR-2026-1001',
            guestName: 'Test Müşterisi',
            guestEmail: 'test.musteri@safirya.tr',
            guestPhone: '05551234567',
            shippingAddress: 'Kadıköy / İstanbul',
            totalAmount: 450,
            stage: 'ATOLYEDE_URETIMDE',
            paymentMethod: 'KREDI_KARTI',
            createdAt: new Date('2026-10-15T10:00:00Z'),
            items: [],
            stagePhotos: [],
          });
        }
        return Promise.resolve(null);
      }),
    },
  },
}));

vi.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    storage: {
      from: vi.fn().mockReturnValue({
        download: vi.fn().mockResolvedValue({
          data: null,
        }),
      }),
    },
  },
}));

// Import routes after mocks are established
import { GET as getMyOrders } from '@/app/api/orders/me/route';
import { POST as trackOrder } from '@/app/api/orders/track/route';

describe('Kullanıcı Siparişleri & Supabase Bulut Entegrasyonu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('giriş yapılmadığında /api/orders/me 401 Unauthorized dönmelidir', async () => {
    const req = new NextRequest('http://localhost:3000/api/orders/me', {
      method: 'GET',
    });

    const res = await getMyOrders(req);
    expect(res.status).toBe(401);

    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('giriş yapınız');
    expect(data.orders).toEqual([]);
  });

  it('geçersiz oturum tokenı ile /api/orders/me 401 dönmelidir', async () => {
    const req = new NextRequest('http://localhost:3000/api/orders/me', {
      method: 'GET',
      headers: {
        cookie: `${USER_COOKIE_NAME}=gecersiz_sahte_token_xyz`,
      },
    });

    const res = await getMyOrders(req);
    expect(res.status).toBe(401);

    const data = await res.json();
    expect(data.success).toBe(false);
  });

  it('geçerli kullanıcı oturumu ile /api/orders/me başarıyla 200 dönmeli ve siparişleri listelemelidir', async () => {
    const token = await createUserSessionToken({
      id: 'usr-test-123',
      email: 'test.musteri@safirya.tr',
      name: 'Test Müşterisi',
      phone: '05551234567',
    });

    const req = new NextRequest('http://localhost:3000/api/orders/me', {
      method: 'GET',
      headers: {
        cookie: `${USER_COOKIE_NAME}=${token}`,
      },
    });

    const res = await getMyOrders(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.orders)).toBe(true);
    expect(data.orders.length).toBe(1);
    expect(data.orders[0].orderNumber).toBe('SFR-2026-1001');
    expect(data.orders[0].stageLabel).toBe('Atölyede Üretimde');
    expect(data.orders[0].items[0].customText).toBe('Selin & Emre');
  });

  it('/api/orders/track eksik sipariş no veya e-posta durumunda 400 dönmelidir', async () => {
    const reqWithoutEmail = new NextRequest('http://localhost:3000/api/orders/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderNumber: 'SFR-2026-1001' }),
    });

    const res = await trackOrder(reqWithoutEmail);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.success).toBe(false);
  });

  it('/api/orders/track geçersiz e-posta formatında 400 dönmelidir', async () => {
    const req = new NextRequest('http://localhost:3000/api/orders/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderNumber: 'SFR-2026-1001',
        email: 'gecersiz-eposta-adresi',
      }),
    });

    const res = await trackOrder(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('geçerli bir e-posta');
  });

  it('/api/orders/track doğru sipariş numarası ve e-posta ile başarıyla 200 dönmelidir', async () => {
    const req = new NextRequest('http://localhost:3000/api/orders/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderNumber: 'SFR-2026-1001',
        email: 'test.musteri@safirya.tr',
      }),
    });

    const res = await trackOrder(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.order.orderNumber).toBe('SFR-2026-1001');
    expect(data.order.currentStageIndex).toBe(1);
  });

  it('/api/orders/track bulunamayan veya e-posta eşleşmeyen sipariş için 404 dönmelidir', async () => {
    const req = new NextRequest('http://localhost:3000/api/orders/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderNumber: 'SFR-9999-BULUNAMAYAN',
        email: 'baskasi@safirya.tr',
      }),
    });

    const res = await trackOrder(req);
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('eşleşen bir sipariş bulunamadı');
  });
});
