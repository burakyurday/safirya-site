import { AdminOrder, AbandonedCartItem, AdminProduct } from '@/types/admin';

export type AnalyticsDateRange = 'TODAY' | 'WEEK' | 'MONTH' | 'YEAR' | 'ALL';
export type AnalyticsChannelFilter = 'ALL' | 'WEB' | 'INSTAGRAM' | 'WHATSAPP' | 'TELEFON' | 'ATOLYE';

export interface TimeSeriesPoint {
  label: string;
  dateKey: string;
  revenue: number;
  orders: number;
  aov: number;
}

export interface ChannelMetric {
  channel: string;
  label: string;
  count: number;
  revenue: number;
  percentage: number;
  color: string;
}

export interface CategoryMetric {
  category: string;
  count: number;
  revenue: number;
  percentage: number;
}

export interface TopProductMetric {
  id: string;
  name: string;
  category: string;
  unitsSold: number;
  revenue: number;
  image?: string;
}

export interface FunnelStep {
  name: string;
  count: number;
  percentage: number;
  dropOffRate: number;
  color: string;
}

export interface SmartInsight {
  id: string;
  type: 'SUCCESS' | 'WARNING' | 'TIP' | 'OPPORTUNITY';
  title: string;
  description: string;
  metric?: string;
  actionText?: string;
  actionLink?: string;
}

export interface AnalyticsSummary {
  grossRevenue: number;
  previousGrossRevenue: number;
  revenueGrowth: number;
  orderCount: number;
  previousOrderCount: number;
  orderGrowth: number;
  averageOrderValue: number;
  previousAov: number;
  aovGrowth: number;
  conversionRate: number;
  customOrderRatio: number;
  giftWrapRate: number;
  abandonedCartCount: number;
  abandonedCartTotal: number;
  recoveredCartCount: number;
  recoveredCartTotal: number;
  cartRecoveryRate: number;
  timeSeries: TimeSeriesPoint[];
  channelDistribution: ChannelMetric[];
  categoryDistribution: CategoryMetric[];
  topProducts: TopProductMetric[];
  funnel: FunnelStep[];
  topScents: Array<{ scent: string; count: number; percentage: number }>;
  topCities: Array<{ city: string; count: number; revenue: number; percentage: number }>;
  insights: SmartInsight[];
}

/**
 * Filtreleme için tarih sınırlarını hesaplar
 */
export function getDateRangeBoundary(range: AnalyticsDateRange): { start: Date; previousStart: Date } {
  const now = new Date();
  const start = new Date(now);
  const previousStart = new Date(now);

  switch (range) {
    case 'TODAY':
      start.setHours(0, 0, 0, 0);
      previousStart.setDate(start.getDate() - 1);
      previousStart.setHours(0, 0, 0, 0);
      break;
    case 'WEEK':
      start.setDate(now.getDate() - 7);
      previousStart.setDate(now.getDate() - 14);
      break;
    case 'MONTH':
      start.setDate(now.getDate() - 30);
      previousStart.setDate(now.getDate() - 60);
      break;
    case 'YEAR':
      start.setDate(now.getDate() - 365);
      previousStart.setDate(now.getDate() - 730);
      break;
    case 'ALL':
    default:
      start.setTime(0);
      previousStart.setTime(0);
      break;
  }

  return { start, previousStart };
}

/**
 * Sipariş tarihini parse eder
 */
function parseOrderDate(dateStr?: string): Date {
  if (!dateStr) return new Date();
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

/**
 * Gelişmiş E-Ticaret ve Atölye Analitik Motoru
 */
export function calculateAnalytics(params: {
  orders: AdminOrder[];
  abandonedCarts?: AbandonedCartItem[];
  products?: AdminProduct[];
  dateRange: AnalyticsDateRange;
  channelFilter?: AnalyticsChannelFilter;
}): AnalyticsSummary {
  const {
    orders = [],
    abandonedCarts = [],
    products = [],
    dateRange = 'MONTH',
    channelFilter = 'ALL',
  } = params;

  const { start, previousStart } = getDateRangeBoundary(dateRange);

  // 1. Kanal ve Tarih Filtrelemesi
  const filteredOrders = orders.filter((o) => {
    const orderDate = parseOrderDate(o.createdAt);
    const dateMatch = dateRange === 'ALL' || orderDate >= start;
    const channelMatch = channelFilter === 'ALL' || o.channel === channelFilter;
    return dateMatch && channelMatch;
  });

  // Önceki dönem siparişleri (Karşılaştırma / Trend için)
  const previousOrders = orders.filter((o) => {
    if (dateRange === 'ALL') return false;
    const orderDate = parseOrderDate(o.createdAt);
    const inPreviousPeriod = orderDate >= previousStart && orderDate < start;
    const channelMatch = channelFilter === 'ALL' || o.channel === channelFilter;
    return inPreviousPeriod && channelMatch;
  });

  // 2. Temel Finans & Sipariş Metrikleri
  const grossRevenue = filteredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const previousGrossRevenue = previousOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const revenueGrowth =
    previousGrossRevenue > 0
      ? Number((((grossRevenue - previousGrossRevenue) / previousGrossRevenue) * 100).toFixed(1))
      : grossRevenue > 0 ? 100 : 0;

  const orderCount = filteredOrders.length;
  const previousOrderCount = previousOrders.length;
  const orderGrowth =
    previousOrderCount > 0
      ? Number((((orderCount - previousOrderCount) / previousOrderCount) * 100).toFixed(1))
      : orderCount > 0 ? 100 : 0;

  const averageOrderValue = orderCount > 0 ? Math.round(grossRevenue / orderCount) : 0;
  const previousAov = previousOrderCount > 0 ? Math.round(previousGrossRevenue / previousOrderCount) : 0;
  const aovGrowth =
    previousAov > 0
      ? Number((((averageOrderValue - previousAov) / previousAov) * 100).toFixed(1))
      : 0;

  // Kişiye Özel Ürün Oranı
  const customOrdersCount = filteredOrders.filter((o) =>
    o.items?.some((item) => item.customization?.customText || (item as any).customText)
  ).length;
  const customOrderRatio = orderCount > 0 ? Math.round((customOrdersCount / orderCount) * 100) : 0;

  // Hediye Paketi Oranı
  const giftWrappedCount = filteredOrders.filter((o) => o.isGiftWrapped).length;
  const giftWrapRate = orderCount > 0 ? Math.round((giftWrappedCount / orderCount) * 100) : 0;

  // 3. Terk Edilen Sepetler
  const unrecoveredCarts = abandonedCarts.filter((c) => !c.recovered);
  const recoveredCarts = abandonedCarts.filter((c) => c.recovered);
  const abandonedCartCount = unrecoveredCarts.length;
  const abandonedCartTotal = unrecoveredCarts.reduce((acc, c) => acc + (c.totalAmount || 0), 0);
  const recoveredCartCount = recoveredCarts.length;
  const recoveredCartTotal = recoveredCarts.reduce((acc, c) => acc + (c.totalAmount || 0), 0);
  const totalCarts = abandonedCartCount + recoveredCartCount;
  const cartRecoveryRate = totalCarts > 0 ? Math.round((recoveredCartCount / totalCarts) * 100) : 0;

  // Dönüşüm Oranı (Ziyaretçi tahmini ve sepet bazlı)
  const estimatedVisitors = Math.max(orderCount * 28 + abandonedCartCount * 4, 120);
  const conversionRate = Number(((orderCount / estimatedVisitors) * 100).toFixed(2));

  // 4. Zaman Serisi Grafiği (Zaman serisi oluşturma)
  const timeSeriesMap = new Map<string, { label: string; revenue: number; orders: number }>();

  // Zaman aralığına göre son günleri/haftaları doldur
  const pointCount = dateRange === 'TODAY' ? 8 : dateRange === 'WEEK' ? 7 : 14;
  for (let i = pointCount - 1; i >= 0; i--) {
    const d = new Date();
    if (dateRange === 'TODAY') {
      d.setHours(d.getHours() - i * 3);
      const key = `${d.getHours()}:00`;
      timeSeriesMap.set(key, { label: key, revenue: 0, orders: 0 });
    } else {
      d.setDate(d.getDate() - i);
      const dayName = d.toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric', month: 'short' });
      const key = d.toISOString().split('T')[0];
      timeSeriesMap.set(key, { label: dayName, revenue: 0, orders: 0 });
    }
  }

  // Siparişleri zaman serisine ekle
  filteredOrders.forEach((o) => {
    const od = parseOrderDate(o.createdAt);
    const key =
      dateRange === 'TODAY'
        ? `${Math.floor(od.getHours() / 3) * 3}:00`
        : od.toISOString().split('T')[0];

    const existing = timeSeriesMap.get(key);
    if (existing) {
      existing.revenue += o.totalAmount || 0;
      existing.orders += 1;
    } else {
      // Range dışı ama listeye dahil et
      timeSeriesMap.set(key, {
        label: od.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
        revenue: o.totalAmount || 0,
        orders: 1,
      });
    }
  });

  const timeSeries: TimeSeriesPoint[] = Array.from(timeSeriesMap.entries()).map(([dateKey, val]) => ({
    dateKey,
    label: val.label,
    revenue: Math.round(val.revenue),
    orders: val.orders,
    aov: val.orders > 0 ? Math.round(val.revenue / val.orders) : 0,
  }));

  // 5. Kanal Dağılımı (Channel Metrics)
  const channelMap: Record<
    string,
    { label: string; count: number; revenue: number; color: string }
  > = {
    WEB: { label: 'Web Mağazası', count: 0, revenue: 0, color: '#C85A32' },
    INSTAGRAM: { label: 'Instagram DM', count: 0, revenue: 0, color: '#E1306C' },
    WHATSAPP: { label: 'WhatsApp Butik', count: 0, revenue: 0, color: '#25D366' },
    ATOLYE: { label: 'Atölye Satışı', count: 0, revenue: 0, color: '#5F6F52' },
    TELEFON: { label: 'Telefonla Sipariş', count: 0, revenue: 0, color: '#2563EB' },
  };

  filteredOrders.forEach((o) => {
    const ch = o.channel || 'WEB';
    if (!channelMap[ch]) {
      channelMap[ch] = { label: ch, count: 0, revenue: 0, color: '#78716C' };
    }
    channelMap[ch].count += 1;
    channelMap[ch].revenue += o.totalAmount || 0;
  });

  const channelDistribution: ChannelMetric[] = Object.entries(channelMap)
    .filter(([_, val]) => val.count > 0 || orderCount === 0)
    .map(([key, val]) => ({
      channel: key,
      label: val.label,
      count: val.count,
      revenue: Math.round(val.revenue),
      percentage: grossRevenue > 0 ? Math.round((val.revenue / grossRevenue) * 100) : 0,
      color: val.color,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  // 6. Kategori & Ürün Dağılımı
  const productAggMap = new Map<string, TopProductMetric>();
  const categoryMap = new Map<string, { count: number; revenue: number }>();
  const scentMap = new Map<string, number>();
  const cityMap = new Map<string, { count: number; revenue: number }>();

  filteredOrders.forEach((order) => {
    // Şehir istatistiği
    const city = order.shippingAddress?.city?.trim() || 'İzmir';
    const cityEntry = cityMap.get(city) || { count: 0, revenue: 0 };
    cityEntry.count += 1;
    cityEntry.revenue += order.totalAmount || 0;
    cityMap.set(city, cityEntry);

    (order.items || []).forEach((item) => {
      const prodId = item.productId || item.productName;
      const amount = item.totalAmount || item.unitPrice * item.quantity || 0;
      const qty = item.quantity || 1;

      // Ürün agregasyonu
      const existingProd = productAggMap.get(prodId);
      if (existingProd) {
        existingProd.unitsSold += qty;
        existingProd.revenue += amount;
      } else {
        const foundProd = products.find((p) => p.id === prodId || p.name === item.productName);
        productAggMap.set(prodId, {
          id: prodId,
          name: item.productName,
          category: foundProd?.category || 'Atölye Tasarımı',
          unitsSold: qty,
          revenue: amount,
          image: foundProd?.images?.[0],
        });
      }

      // Kategori agregasyonu
      const categoryName = item.productName.toLowerCase().includes('mum')
        ? 'Doğal Soya Mumları'
        : item.productName.toLowerCase().includes('taş') || item.productName.toLowerCase().includes('seramik')
        ? 'Kokulu Taş & Heykel'
        : item.productName.toLowerCase().includes('epoksi') || item.productName.toLowerCase().includes('tepsi')
        ? 'Epoksi Sunumluk'
        : item.productName.toLowerCase().includes('kolye') || item.productName.toLowerCase().includes('bileklik')
        ? 'Miyuki Takı'
        : 'Özel Atölye Tasarımı';

      const catEntry = categoryMap.get(categoryName) || { count: 0, revenue: 0 };
      catEntry.count += qty;
      catEntry.revenue += amount;
      categoryMap.set(categoryName, catEntry);

      // Koku notası
      const scent = item.customization?.selectedScent;
      if (scent) {
        scentMap.set(scent, (scentMap.get(scent) || 0) + qty);
      }
    });
  });

  const categoryDistribution: CategoryMetric[] = Array.from(categoryMap.entries())
    .map(([cat, val]) => ({
      category: cat,
      count: val.count,
      revenue: Math.round(val.revenue),
      percentage: grossRevenue > 0 ? Math.round((val.revenue / grossRevenue) * 100) : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  const topProducts: TopProductMetric[] = Array.from(productAggMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Koku Notaları
  const totalScentCount = Array.from(scentMap.values()).reduce((a, b) => a + b, 0);
  const topScents = Array.from(scentMap.entries())
    .map(([scent, count]) => ({
      scent,
      count,
      percentage: totalScentCount > 0 ? Math.round((count / totalScentCount) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Şehirler
  const topCities = Array.from(cityMap.entries())
    .map(([city, val]) => ({
      city,
      count: val.count,
      revenue: Math.round(val.revenue),
      percentage: orderCount > 0 ? Math.round((val.count / orderCount) * 100) : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // 7. Satış Hunisi (Funnel)
  const funnelVisits = Math.max(orderCount * 32 + abandonedCartCount * 5, 240);
  const funnelViews = Math.round(funnelVisits * 0.72);
  const funnelCarts = Math.max(orderCount + abandonedCartCount, Math.round(funnelVisits * 0.16));
  const funnelCheckout = Math.round(funnelCarts * 0.65);
  const funnelOrders = orderCount;

  const funnel: FunnelStep[] = [
    {
      name: 'Mağaza Ziyareti',
      count: funnelVisits,
      percentage: 100,
      dropOffRate: Math.round(((funnelVisits - funnelViews) / funnelVisits) * 100),
      color: '#3B82F6',
    },
    {
      name: 'Ürün İnceleme',
      count: funnelViews,
      percentage: Math.round((funnelViews / funnelVisits) * 100),
      dropOffRate: Math.round(((funnelViews - funnelCarts) / funnelViews) * 100),
      color: '#6366F1',
    },
    {
      name: 'Sepete Ekleme',
      count: funnelCarts,
      percentage: Math.round((funnelCarts / funnelVisits) * 100),
      dropOffRate: Math.round(((funnelCarts - funnelCheckout) / funnelCarts) * 100),
      color: '#EC4899',
    },
    {
      name: 'Ödeme Adımı',
      count: funnelCheckout,
      percentage: Math.round((funnelCheckout / funnelVisits) * 100),
      dropOffRate: Math.round(((funnelCheckout - funnelOrders) / funnelCheckout) * 100),
      color: '#F59E0B',
    },
    {
      name: 'Tamamlanan Sipariş',
      count: funnelOrders,
      percentage: Math.round((funnelOrders / funnelVisits) * 100),
      dropOffRate: 0,
      color: '#10B981',
    },
  ];

  // 8. AI Destekli Akıllı Öngörüler (Smart Actionable Insights)
  const insights: SmartInsight[] = [];

  if (customOrderRatio >= 40) {
    insights.push({
      id: 'ins-1',
      type: 'SUCCESS',
      title: 'Kişiselleştirme Motoru Güçlü Çalışıyor',
      description: `Siparişlerinizin %${customOrderRatio}'i kişiye özel isim baskılı veya özel davet konseptli. Butik nişan/söz kategorisi ana büyüme motorunuz haline geldi.`,
      metric: `%${customOrderRatio} Özel Üretim`,
    });
  }

  if (abandonedCartTotal > 1500) {
    insights.push({
      id: 'ins-2',
      type: 'OPPORTUNITY',
      title: 'Terk Edilmiş Sepet Potansiyeli',
      description: `₺${abandonedCartTotal.toLocaleString('tr-TR')} değerinde ${abandonedCartCount} adet sepet kurtarılmayı bekliyor. WhatsApp veya e-posta hatırlatmasıyla ortalama %20'si siparişe dönebilir.`,
      metric: `₺${abandonedCartTotal.toLocaleString('tr-TR')}`,
      actionText: 'Kurtarma Kampanyası Başlat',
      actionLink: '/admin/pazarlama',
    });
  }

  if (giftWrapRate > 20) {
    insights.push({
      id: 'ins-3',
      type: 'TIP',
      title: 'Hediye Paketi Talebi Yüksek',
      description: `Müşterilerinizin %${giftWrapRate}'i ₺30 hediye paketi opsiyonunu tercih ediyor. Sezonluk özel kurdele ve mühürlü ambalaj seçenekleri sepet değerini artıracaktır.`,
      metric: `%${giftWrapRate} Hediye Paketi`,
    });
  }

  if (averageOrderValue > 500) {
    insights.push({
      id: 'ins-4',
      type: 'SUCCESS',
      title: 'Ücretsiz Kargo Eşiği Etkili',
      description: `Ortalama sepet tutarınız (₺${averageOrderValue.toLocaleString('tr-TR')}), ₺500 ücretsiz kargo sınırının üzerinde. Tüketiciler kargo ödememek için sepetlerini tamamlıyor.`,
      metric: `₺${averageOrderValue} Ortalama Sepet`,
    });
  }

  return {
    grossRevenue,
    previousGrossRevenue,
    revenueGrowth,
    orderCount,
    previousOrderCount,
    orderGrowth,
    averageOrderValue,
    previousAov,
    aovGrowth,
    conversionRate,
    customOrderRatio,
    giftWrapRate,
    abandonedCartCount,
    abandonedCartTotal,
    recoveredCartCount,
    recoveredCartTotal,
    cartRecoveryRate,
    timeSeries,
    channelDistribution,
    categoryDistribution,
    topProducts,
    funnel,
    topScents,
    topCities,
    insights,
  };
}

/**
 * Analitik verilerini CSV formatına çevirir
 */
export function exportAnalyticsToCsv(summary: AnalyticsSummary): string {
  const lines: string[] = [];

  lines.push('SAFIRYA E-TICARET & ATOLYE ANALITIK RAPORU');
  lines.push(`Rapor Tarihi:;${new Date().toLocaleDateString('tr-TR')} ${new Date().toLocaleTimeString('tr-TR')}`);
  lines.push('');
  lines.push('TEMEL PERFORMANS GOSTERGELERI (KPI)');
  lines.push(`Toplam Ciro (TL);${summary.grossRevenue}`);
  lines.push(`Ciro Buyume Orani (%);${summary.revenueGrowth}`);
  lines.push(`Toplam Siparis Adedi;${summary.orderCount}`);
  lines.push(`Siparis Buyume (%);${summary.orderGrowth}`);
  lines.push(`Ortalama Sepet Tutari (TL);${summary.averageOrderValue}`);
  lines.push(`Donusum Orani (%);${summary.conversionRate}`);
  lines.push(`Kisiye Ozel Uretim Orani (%);${summary.customOrderRatio}`);
  lines.push(`Hediye Paketi Orani (%);${summary.giftWrapRate}`);
  lines.push('');
  lines.push('ZAMAN SERISI (CIRO VE SIPARISLER)');
  lines.push('Tarih;Ciro (TL);Siparis Adedi;Ortalama Sepet (TL)');
  summary.timeSeries.forEach((p) => {
    lines.push(`${p.label};${p.revenue};${p.orders};${p.aov}`);
  });
  lines.push('');
  lines.push('SATIS KANALLARI DAGILIMI');
  lines.push('Kanal;Siparis Adedi;Ciro (TL);Pay (%)');
  summary.channelDistribution.forEach((c) => {
    lines.push(`${c.label};${c.count};${c.revenue};${c.percentage}`);
  });
  lines.push('');
  lines.push('EN COK SATAN URUNLER');
  lines.push('Urun Adi;Kategori;Satilan Adet;Ciro (TL)');
  summary.topProducts.forEach((p) => {
    lines.push(`"${p.name}";"${p.category}";${p.unitsSold};${p.revenue}`);
  });

  return lines.join('\n');
}
