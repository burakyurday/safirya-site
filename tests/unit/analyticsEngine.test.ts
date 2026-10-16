import { describe, it, expect } from 'vitest';
import {
  calculateAnalytics,
  getDateRangeBoundary,
  exportAnalyticsToCsv,
} from '@/lib/analyticsEngine';
import { AdminOrder } from '@/types/admin';

describe('analyticsEngine - E-Ticaret ve Atölye Analitik Motoru', () => {
  const mockOrders: AdminOrder[] = [
    {
      id: 'ord-1',
      orderNumber: 'SFR-2026-101',
      channel: 'WEB',
      customerName: 'Ayşe Yılmaz',
      customerEmail: 'ayse@example.com',
      customerPhone: '0532 555 72 34',
      shippingAddress: {
        fullName: 'Ayşe Yılmaz',
        phone: '0532 555 72 34',
        city: 'İzmir',
        district: 'Karşıyaka',
        address: 'Bostanlı Mah.',
      },
      subtotal: 1000,
      discountTotal: 0,
      shippingFee: 0,
      isGiftWrapped: true,
      giftWrapFee: 30,
      totalAmount: 1030,
      stage: 'TESLIM_EDILDI',
      paymentStatus: 'ODENDI',
      paymentMethod: 'KREDI_KARTI',
      invoiceStatus: 'OLUSTURULDU',
      createdAt: new Date().toISOString(),
      items: [
        {
          productName: 'Kişiye Özel İsimli Soya Mumu',
          quantity: 2,
          unitPrice: 500,
          totalAmount: 1000,
          customization: {
            customText: 'Ayşe & Ali',
            selectedScent: 'Fransız Lavantası',
          },
        },
      ],
    },
    {
      id: 'ord-2',
      orderNumber: 'SFR-2026-102',
      channel: 'INSTAGRAM',
      customerName: 'Can Demir',
      customerEmail: 'can@example.com',
      customerPhone: '0533 111 22 33',
      shippingAddress: {
        fullName: 'Can Demir',
        phone: '0533 111 22 33',
        city: 'İstanbul',
        district: 'Kadıköy',
        address: 'Moda Cad.',
      },
      subtotal: 450,
      discountTotal: 0,
      shippingFee: 45,
      isGiftWrapped: false,
      giftWrapFee: 0,
      totalAmount: 495,
      stage: 'SIPARIS_ALINDI',
      paymentStatus: 'ODENDI',
      paymentMethod: 'KREDI_KARTI',
      invoiceStatus: 'OLUSTURULDU',
      createdAt: new Date().toISOString(),
      items: [
        {
          productName: 'Doğal Kehribar Cam Kavanoz Soya Mumu',
          quantity: 1,
          unitPrice: 450,
          totalAmount: 450,
        },
      ],
    },
  ];

  it('tarih sınırlarını doğru üretmelidir', () => {
    const today = getDateRangeBoundary('TODAY');
    expect(today.start).toBeInstanceOf(Date);
    expect(today.previousStart).toBeInstanceOf(Date);
    expect(today.start.getTime()).toBeGreaterThan(today.previousStart.getTime());

    const month = getDateRangeBoundary('MONTH');
    expect(month.start.getTime()).toBeGreaterThan(month.previousStart.getTime());
  });

  it('temel KPI metriklerini (Ciro, Sipariş Adedi, AOV) doğru hesaplamalıdır', () => {
    const summary = calculateAnalytics({
      orders: mockOrders,
      dateRange: 'ALL',
      channelFilter: 'ALL',
    });

    expect(summary.orderCount).toBe(2);
    expect(summary.grossRevenue).toBe(1030 + 495);
    expect(summary.averageOrderValue).toBe(Math.round((1030 + 495) / 2));
    expect(summary.customOrderRatio).toBe(50); // 1 tanesi kişiselleştirilmiş
    expect(summary.giftWrapRate).toBe(50); // 1 tanesi hediye paketli
  });

  it('kanal filtrelemesi doğru çalışmalıdır', () => {
    const webSummary = calculateAnalytics({
      orders: mockOrders,
      dateRange: 'ALL',
      channelFilter: 'WEB',
    });

    expect(webSummary.orderCount).toBe(1);
    expect(webSummary.grossRevenue).toBe(1030);

    const igSummary = calculateAnalytics({
      orders: mockOrders,
      dateRange: 'ALL',
      channelFilter: 'INSTAGRAM',
    });

    expect(igSummary.orderCount).toBe(1);
    expect(igSummary.grossRevenue).toBe(495);
  });

  it('koku notası ve şehir dağılımını hesaplamalıdır', () => {
    const summary = calculateAnalytics({
      orders: mockOrders,
      dateRange: 'ALL',
    });

    expect(summary.topScents.length).toBeGreaterThan(0);
    expect(summary.topScents[0].scent).toBe('Fransız Lavantası');

    expect(summary.topCities.some((c) => c.city === 'İzmir')).toBe(true);
    expect(summary.topCities.some((c) => c.city === 'İstanbul')).toBe(true);
  });

  it('CSV dışa aktarım formatını üretmelidir', () => {
    const summary = calculateAnalytics({
      orders: mockOrders,
      dateRange: 'ALL',
    });

    const csv = exportAnalyticsToCsv(summary);
    expect(csv).toContain('SAFIRYA E-TICARET & ATOLYE ANALITIK RAPORU');
    expect(csv).toContain('Toplam Ciro (TL)');
    expect(csv).toContain('Kişiye Özel İsimli Soya Mumu');
  });
});
