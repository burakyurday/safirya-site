'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  Calendar,
  Filter,
  Download,
  Printer,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Gift,
  Flame,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Share2,
  RefreshCw,
  Compass,
} from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import {
  calculateAnalytics,
  exportAnalyticsToCsv,
  AnalyticsDateRange,
  AnalyticsChannelFilter,
} from '@/lib/analyticsEngine';

export default function AdminAnalyticsDashboardPage() {
  const { orders = [], abandonedCarts = [], products = [] } = useAdmin();

  // Filtre durumları
  const [dateRange, setDateRange] = useState<AnalyticsDateRange>('MONTH');
  const [channelFilter, setChannelFilter] = useState<AnalyticsChannelFilter>('ALL');
  const [chartMetric, setChartMetric] = useState<'REVENUE' | 'ORDERS'>('REVENUE');
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  // Analitik hesaplaması
  const summary = useMemo(() => {
    return calculateAnalytics({
      orders,
      abandonedCarts,
      products,
      dateRange,
      channelFilter,
    });
  }, [orders, abandonedCarts, products, dateRange, channelFilter]);

  // CSV İndirme
  const handleExportCsv = () => {
    const csvContent = exportAnalyticsToCsv(summary);
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `safirya-analitik-raporu-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Zaman Serisi Grafik Verisi & SVG Ölçekleme
  const timeSeries = summary.timeSeries;
  const maxRevenue = Math.max(...timeSeries.map((p) => p.revenue), 100);
  const maxOrders = Math.max(...timeSeries.map((p) => p.orders), 5);
  const chartMax = chartMetric === 'REVENUE' ? maxRevenue : maxOrders;

  const chartHeight = 220;
  const chartWidth = 700;
  const paddingX = 40;
  const paddingY = 25;
  const innerWidth = chartWidth - paddingX * 2;
  const innerHeight = chartHeight - paddingY * 2;

  const points = timeSeries.map((pt, idx) => {
    const val = chartMetric === 'REVENUE' ? pt.revenue : pt.orders;
    const x = paddingX + (idx / Math.max(timeSeries.length - 1, 1)) * innerWidth;
    const y = chartHeight - paddingY - (val / chartMax) * innerHeight;
    return { x, y, pt, val };
  });

  // SVG Çizgi Yolu
  const pathD = points.reduce((acc, p, idx) => {
    return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  // SVG Alan (Area Gradient) Yolu
  const areaD =
    points.length > 0
      ? `${pathD} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${
          chartHeight - paddingY
        } Z`
      : '';

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* 1. ÜST BAŞLIK & KONTROL ARAÇLARI */}
      <div className="bg-white p-6 rounded-2xl border border-[#E2DCD3] shadow-2xs flex flex-col xl:flex-row xl:items-center justify-between gap-6 print:border-none print:shadow-none">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] tracking-widest text-[#C85A32] uppercase font-bold">
              Safirya İş Zekası & Raporlama
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Canlı Veri
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#231B18] font-normal mt-1">
            Gelişmiş Analitik Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl">
            Ciro büyümesi, sepet dönüşüm hunisi, atölye kişiselleştirme performansı ve AI odaklı optimizasyon tavsiyeleri.
          </p>
        </div>

        {/* Eylem Butonları */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 print:hidden">
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-[#231B18] text-xs font-medium transition flex items-center gap-1.5 border border-stone-200"
            title="Tüm verileri CSV formatında indirin"
          >
            <Download className="w-3.5 h-3.5 text-stone-600" />
            <span>CSV İndir</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-[#231B18] text-xs font-medium transition flex items-center gap-1.5 border border-stone-200"
          >
            <Printer className="w-3.5 h-3.5 text-stone-600" />
            <span>Yazdır / PDF</span>
          </button>

          <Link
            href="/admin/siparisler"
            className="px-4 py-2 rounded-lg bg-[#C85A32] hover:bg-[#B34E2A] text-white text-xs font-medium transition shadow-xs flex items-center gap-1.5"
          >
            <span>Siparişleri İncele</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 2. TARİH VE KANAL FİLTRELEME ÇUBUĞU */}
      <div className="bg-white p-4 rounded-xl border border-[#E2DCD3] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        {/* Tarih Aralığı Butonları */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-semibold text-stone-500 mr-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> Dönem:
          </span>
          {(
            [
              { id: 'TODAY', label: 'Bugün' },
              { id: 'WEEK', label: 'Son 7 Gün' },
              { id: 'MONTH', label: 'Son 30 Gün' },
              { id: 'YEAR', label: 'Bu Yıl' },
              { id: 'ALL', label: 'Tüm Zamanlar' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              onClick={() => setDateRange(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                dateRange === item.id
                  ? 'bg-[#231B18] text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Satış Kanalı Filtresi */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-xs font-medium text-stone-600">Kanal:</span>
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value as AnalyticsChannelFilter)}
            className="text-xs bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-stone-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#C85A32]"
          >
            <option value="ALL">Tüm Satış Kanalları</option>
            <option value="WEB">Web Mağazası</option>
            <option value="INSTAGRAM">Instagram DM</option>
            <option value="WHATSAPP">WhatsApp Butik</option>
            <option value="ATOLYE">Atölye Satışı</option>
            <option value="TELEFON">Telefon</option>
          </select>
        </div>
      </div>

      {/* 3. TEMEL KPI KARTLARI (4 ADET) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Toplam Ciro */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2DCD3] shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold">
              Brüt Satış Cirosu
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#C85A32]/10 text-[#C85A32] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-normal text-[#231B18] mt-2">
            ₺{summary.grossRevenue.toLocaleString('tr-TR')}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span
              className={`inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded ${
                summary.revenueGrowth >= 0
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-rose-50 text-rose-700'
              }`}
            >
              {summary.revenueGrowth >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              %{Math.abs(summary.revenueGrowth)}
            </span>
            <span className="text-[11px] text-stone-500">önceki döneme göre</span>
          </div>
        </div>

        {/* KPI 2: Toplam Sipariş */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2DCD3] shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold">
              Net Sipariş Sayısı
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#5F6F52]/10 text-[#5F6F52] flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-normal text-[#231B18] mt-2">
            {summary.orderCount} <span className="text-base text-stone-500 font-sans">adet</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span
              className={`inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded ${
                summary.orderGrowth >= 0
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-rose-50 text-rose-700'
              }`}
            >
              {summary.orderGrowth >= 0 ? '+' : ''}%{summary.orderGrowth}
            </span>
            <span className="text-[11px] text-stone-500">sipariş hacmi</span>
          </div>
        </div>

        {/* KPI 3: Ortalama Sepet Tutarı (AOV) */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2DCD3] shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold">
              Ortalama Sepet (AOV)
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-normal text-[#231B18] mt-2">
            ₺{summary.averageOrderValue.toLocaleString('tr-TR')}
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              {summary.averageOrderValue >= 500 ? '₺500 baremi aşıldı' : 'Hedef: ₺500'}
            </span>
            <span className="text-[11px] text-stone-500">kargo ücretsiz eşiği</span>
          </div>
        </div>

        {/* KPI 4: Dönüşüm & Sepet Kurtarma */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2DCD3] shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold">
              Dönüşüm & Sepet
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-normal text-[#231B18] mt-2">
            %{summary.conversionRate}
          </div>
          <div className="flex items-center justify-between text-[11px] text-stone-500 mt-2">
            <span>Terk: {summary.abandonedCartCount} sepet</span>
            <span className="text-emerald-700 font-medium">Kurtarma: %{summary.cartRecoveryRate}</span>
          </div>
        </div>
      </div>

      {/* 4. ANA GRAFİK: ZAMAN SERİSİ & KANAL DAĞILIMI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Grafiği (2 Kolon) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#E2DCD3] shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-base font-semibold text-[#231B18] flex items-center gap-2">
                <span>Ciro & Sipariş Zaman Serisi Eğrisi</span>
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Seçilen döneme ait günlük/haftalık satış hacmi ve sipariş trendi
              </p>
            </div>

            {/* Metrik Seçici (Ciro vs Sipariş) */}
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg">
              <button
                onClick={() => setChartMetric('REVENUE')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                  chartMetric === 'REVENUE'
                    ? 'bg-white text-[#C85A32] shadow-xs'
                    : 'text-stone-600 hover:text-[#231B18]'
                }`}
              >
                Ciro (₺)
              </button>
              <button
                onClick={() => setChartMetric('ORDERS')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                  chartMetric === 'ORDERS'
                    ? 'bg-white text-[#5F6F52] shadow-xs'
                    : 'text-stone-600 hover:text-[#231B18]'
                }`}
              >
                Sipariş (Adet)
              </button>
            </div>
          </div>

          {/* İnteraktif SVG Grafik */}
          <div className="relative w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-auto min-w-[500px] overflow-visible select-none"
            >
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C85A32" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#C85A32" stopOpacity="0.01" />
                </linearGradient>
                <linearGradient id="orderGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5F6F52" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#5F6F52" stopOpacity="0.01" />
                </linearGradient>
              </defs>

              {/* Yatay Kılavuz Çizgileri */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const y = paddingY + ratio * innerHeight;
                const val = Math.round(chartMax * (1 - ratio));
                return (
                  <g key={ratio}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={chartWidth - paddingX}
                      y2={y}
                      stroke="#F3F0EA"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={paddingX - 8}
                      y={y + 3}
                      textAnchor="end"
                      fontSize="9"
                      fill="#A8A29E"
                      fontFamily="sans-serif"
                    >
                      {chartMetric === 'REVENUE' ? `₺${val}` : `${val}`}
                    </text>
                  </g>
                );
              })}

              {/* Alan ve Çizgi Grafiği */}
              {areaD && (
                <path
                  d={areaD}
                  fill={`url(#${chartMetric === 'REVENUE' ? 'revenueGradient' : 'orderGradient'})`}
                />
              )}
              {pathD && (
                <path
                  d={pathD}
                  fill="none"
                  stroke={chartMetric === 'REVENUE' ? '#C85A32' : '#5F6F52'}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Veri Noktaları */}
              {points.map((p, idx) => {
                const isHovered = hoveredPointIndex === idx;
                return (
                  <g
                    key={idx}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredPointIndex(idx)}
                    onMouseLeave={() => setHoveredPointIndex(null)}
                  >
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isHovered ? 6 : 4}
                      fill="#FFFFFF"
                      stroke={chartMetric === 'REVENUE' ? '#C85A32' : '#5F6F52'}
                      strokeWidth={isHovered ? 3 : 2}
                      className="transition-all duration-150"
                    />
                    <text
                      x={p.x}
                      y={chartHeight - 6}
                      textAnchor="middle"
                      fontSize="9"
                      fill={isHovered ? '#231B18' : '#78716C'}
                      fontWeight={isHovered ? 'bold' : 'normal'}
                    >
                      {p.pt.label}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip Bilgisi */}
            {hoveredPointIndex !== null && points[hoveredPointIndex] && (
              <div className="mt-2 p-3 bg-stone-900 text-white rounded-lg shadow-lg flex items-center justify-between text-xs animate-fadeIn">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#C85A32]" />
                  <span className="font-semibold">{points[hoveredPointIndex].pt.label}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span>
                    Ciro:{' '}
                    <strong className="text-amber-300">
                      ₺{points[hoveredPointIndex].pt.revenue.toLocaleString('tr-TR')}
                    </strong>
                  </span>
                  <span>
                    Sipariş: <strong>{points[hoveredPointIndex].pt.orders} adet</strong>
                  </span>
                  <span>
                    Ort. Sepet: <strong>₺{points[hoveredPointIndex].pt.aov}</strong>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Satış Kanalları Dağılımı (1 Kolon) */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2DCD3] shadow-2xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#231B18]">Satış Kanalları Dağılımı</h2>
            <p className="text-xs text-stone-500 mt-0.5">Siparişlerin geldiği iletişim ve mağaza mecraları</p>

            <div className="space-y-4 mt-6">
              {summary.channelDistribution.map((ch) => (
                <div key={ch.channel} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#231B18] flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: ch.color }}
                      />
                      {ch.label}
                    </span>
                    <span className="font-bold text-[#231B18]">
                      ₺{ch.revenue.toLocaleString('tr-TR')}{' '}
                      <span className="text-stone-400 font-normal">({ch.percentage}%)</span>
                    </span>
                  </div>
                  <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(ch.percentage, 4)}%`,
                        backgroundColor: ch.color,
                      }}
                    />
                  </div>
                  <div className="text-[10px] text-stone-400 text-right">{ch.count} tamamlanmış sipariş</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-stone-100 text-center">
            <span className="text-xs text-stone-500">
              En yüksek ciro getiren kanal:{' '}
              <strong className="text-[#231B18]">
                {summary.channelDistribution[0]?.label || 'Web Mağazası'}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* 5. DÖNÜŞÜM HUNİSİ (FUNNEL) & ATÖLYE ZANAAT ÖZELLİKLERİ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Satış Hunisi (Funnel) */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2DCD3] shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-[#231B18]">E-Ticaret Dönüşüm Hunisi</h2>
              <p className="text-xs text-stone-500 mt-0.5">Ziyaretten ödemeye kadar aşama aşama müşteri yolculuğu</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
              %{summary.conversionRate} Dönüşüm
            </span>
          </div>

          <div className="space-y-3 mt-4">
            {summary.funnel.map((step, idx) => (
              <div key={step.name} className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-[#231B18] flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-white border border-stone-200 text-stone-600 flex items-center justify-center font-bold text-[10px]">
                      {idx + 1}
                    </span>
                    {step.name}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-[#231B18]">{step.count.toLocaleString('tr-TR')}</span>
                    <span className="text-stone-400">({step.percentage}%)</span>
                  </div>
                </div>

                <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${step.percentage}%`,
                      backgroundColor: step.color,
                    }}
                  />
                </div>

                {step.dropOffRate > 0 && (
                  <div className="text-[10px] text-stone-500 mt-1.5 flex items-center justify-between">
                    <span>Bir sonraki aşamaya geçmeyen:</span>
                    <span className="text-rose-600 font-semibold">-%{step.dropOffRate} kayıp</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Butik Atölye & Kişiselleştirme İstatistikleri */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2DCD3] shadow-2xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#231B18] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C85A32]" />
              <span>Butik Zanaat & Kişiselleştirme Metrikleri</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              İsim baskılı özel söz/nişan siparişleri, koku tercihleri ve hediye paketi oranları
            </p>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-3.5 bg-amber-50/70 border border-amber-200/60 rounded-xl">
                <span className="text-[10px] uppercase tracking-wider text-amber-800 font-bold">
                  Kişiye Özel Üretim
                </span>
                <div className="font-serif text-2xl text-amber-950 font-normal mt-1">
                  %{summary.customOrderRatio}
                </div>
                <div className="text-[11px] text-amber-900/80 mt-0.5">İsim & tarih baskılı siparişler</div>
              </div>

              <div className="p-3.5 bg-rose-50/70 border border-rose-200/60 rounded-xl">
                <span className="text-[10px] uppercase tracking-wider text-rose-800 font-bold">
                  Hediye Paketi Talebi
                </span>
                <div className="font-serif text-2xl text-rose-950 font-normal mt-1">
                  %{summary.giftWrapRate}
                </div>
                <div className="text-[11px] text-rose-900/80 mt-0.5">₺30 mühürlü ambalaj seçimi</div>
              </div>
            </div>

            {/* En Çok Tercih Edilen Koku Notaları */}
            <div className="mt-5">
              <span className="text-xs font-semibold text-stone-700 block mb-2 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-[#C85A32]" /> En Popüler Koku Notaları
              </span>
              <div className="space-y-2">
                {summary.topScents.length > 0 ? (
                  summary.topScents.map((s) => (
                    <div key={s.scent} className="flex items-center justify-between text-xs">
                      <span className="text-stone-700">{s.scent}</span>
                      <span className="font-semibold text-[#231B18]">
                        {s.count} adet (%{s.percentage})
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-stone-400 py-1">Fransız Lavantası, Amber & Sandal Ağacı</div>
                )}
              </div>
            </div>

            {/* Bölgesel Dağılım (Top İller) */}
            <div className="mt-5">
              <span className="text-xs font-semibold text-stone-700 block mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#5F6F52]" /> En Çok Sipariş Verilen İller
              </span>
              <div className="flex flex-wrap gap-2">
                {summary.topCities.map((city) => (
                  <span
                    key={city.city}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-stone-100 text-[#231B18] border border-stone-200"
                  >
                    <span>{city.city}</span>
                    <strong className="text-stone-500">%{city.percentage}</strong>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>Ortalama Atölye Hazırlık Süresi:</span>
            <strong className="text-[#231B18]">1.8 İş Günü</strong>
          </div>
        </div>
      </div>

      {/* 6. EN ÇOK SATAN ÜRÜNLER TABLOSU */}
      <div className="bg-white p-6 rounded-2xl border border-[#E2DCD3] shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-[#231B18]">En Çok Satan & En Karlı Ürünler</h2>
            <p className="text-xs text-stone-500 mt-0.5">Ciroya ve sipariş hacmine en büyük katkıyı sağlayan ürünler</p>
          </div>
          <Link
            href="/admin/urunler"
            className="text-xs font-semibold text-[#C85A32] hover:underline flex items-center gap-1"
          >
            <span>Tüm Ürünleri Yönet</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-2">Ürün</th>
                <th className="py-3 px-2">Kategori</th>
                <th className="py-3 px-2 text-center">Satılan Adet</th>
                <th className="py-3 px-2 text-right">Elde Edilen Ciro</th>
                <th className="py-3 px-2 text-right">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {summary.topProducts.map((prod, idx) => (
                <tr key={prod.id} className="hover:bg-stone-50/80 transition">
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-md bg-stone-100 border border-stone-200 shrink-0 overflow-hidden relative">
                        {prod.image ? (
                          <Image src={prod.image} alt={prod.name} fill className="object-cover" sizes="36px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-400">
                            <Package className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-[#231B18] line-clamp-1">{prod.name}</div>
                        <div className="text-[10px] text-stone-400">Sıra #{idx + 1}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-stone-600">{prod.category}</td>
                  <td className="py-3 px-2 text-center font-semibold text-[#231B18]">{prod.unitsSold} adet</td>
                  <td className="py-3 px-2 text-right font-serif text-sm font-semibold text-[#231B18]">
                    ₺{prod.revenue.toLocaleString('tr-TR')}
                  </td>
                  <td className="py-3 px-2 text-right">
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> Yüksek Talep
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7. AI DESTEKLİ AKILLI ÖNGÖRÜLER & OPTİMİZASYON TAVSİYELERİ */}
      <div className="bg-gradient-to-br from-stone-900 to-[#231B18] text-white p-6 sm:p-7 rounded-2xl shadow-md border border-stone-800">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-amber-400 animate-spin-slow" />
          <h2 className="font-serif text-xl font-normal text-white">
            Safirya AI - Akıllı Atölye ve Satış Tavsiyeleri
          </h2>
        </div>
        <p className="text-xs text-stone-400 max-w-2xl mb-6">
          Canlı verileriniz ve sipariş geçmişiniz analiz edilerek atölye verimliliği ve ciro artışı için üretilen eyleme dönüştürülebilir öngörüler.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {summary.insights.map((ins) => (
            <div
              key={ins.id}
              className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      ins.type === 'SUCCESS'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : ins.type === 'OPPORTUNITY'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-blue-500/20 text-blue-300'
                    }`}
                  >
                    <Lightbulb className="w-3 h-3" />
                    {ins.title}
                  </span>
                  {ins.metric && <span className="text-xs font-serif text-white font-semibold">{ins.metric}</span>}
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">{ins.description}</p>
              </div>

              {ins.actionText && ins.actionLink && (
                <div className="mt-4 pt-3 border-t border-white/10">
                  <Link
                    href={ins.actionLink}
                    className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition flex items-center gap-1"
                  >
                    <span>{ins.actionText}</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
