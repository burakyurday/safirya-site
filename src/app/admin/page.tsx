'use client';

import React from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Package,
  Receipt,
  ShoppingCart,
  Plus,
  ArrowRight,
  Clock,
  ChevronRight,
  MessageSquareQuote,
  CheckCircle2,
} from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';

export default function AdminDashboardPage() {
  const {
    products,
    orders,
    abandonedCarts,
    quoteRequests = [],
  } = useAdmin();

  // Sipariş İstatistikleri
  const totalOrderAmount = orders.reduce((acc, o) => acc + o.totalAmount, 0);
  const inProductionCount = orders.filter(
    (o) => o.stage === 'ATOLYEDE_URETIMDE' || o.stage === 'SIPARIS_ALINDI'
  ).length;
  const pendingQuotesCount = quoteRequests.filter((q) => q.status === 'BEKLEMEDE').length;

  // Terkedilen sepet potansiyeli
  const unrecoveredCarts = abandonedCarts.filter((c) => !c.recovered);
  const abandonedTotal = unrecoveredCarts.reduce((acc, c) => acc + c.totalAmount, 0);

  // Aşama Etiketleri
  const stageLabels: Record<string, { label: string; style: string }> = {
    SIPARIS_ALINDI: { label: 'Sipariş Alındı', style: 'bg-stone-100 text-stone-700 border-stone-200' },
    ATOLYEDE_URETIMDE: { label: 'Atölyede Hazırlanıyor', style: 'bg-[#C85A32]/10 text-[#C85A32] border-[#C85A32]/30' },
    KALITE_KONTROL_PAKETLEME: { label: 'Paketleniyor', style: 'bg-amber-50 text-amber-800 border-amber-200' },
    KARGOYA_VERILDI: { label: 'Kargoya Verildi', style: 'bg-[#5F6F52]/10 text-[#5F6F52] border-[#5F6F52]/30' },
    TESLIM_EDILDI: { label: 'Teslim Edildi', style: 'bg-[#5F6F52]/15 text-[#5F6F52] border-[#5F6F52]/30 font-medium' },
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* 1. ÜST BAŞLIK VE HIZLI EYLEMLER */}
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-[#E2DCD3] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] tracking-widest text-[#C85A32] uppercase font-bold">
            Safirya Atölye Yönetimi
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#231B18] font-normal mt-1">
            Atölye & Sipariş Özeti
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Mağazanızın anlık sipariş hacmi, atölye hazırlık aşamaları ve müşteri talepleri.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/admin/urunler/yeni"
            className="px-4 py-2 rounded-md bg-[#C85A32] hover:bg-[#B34E2A] text-white text-xs font-medium transition shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Yeni Ürün Ekle</span>
          </Link>

          <Link
            href="/admin/siparisler/yeni"
            className="px-4 py-2 rounded-md bg-[#231B18] hover:bg-[#2C221E] text-white text-xs font-medium transition flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Manuel Sipariş Gir</span>
          </Link>
        </div>
      </div>

      {/* 2. BUTİK KPI KARTLARI (4 KART) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Sipariş Hacmi */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2DCD3] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold">
              Toplam Sipariş Hacmi
            </span>
            <div className="w-8 h-8 rounded-md bg-[#5F6F52]/10 text-[#5F6F52] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl font-normal text-[#231B18] mt-2">
            ₺{totalOrderAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            {orders.length} adet tamamlanmış & aktif sipariş
          </div>
        </div>

        {/* KPI 2: Atölyede Üretimde */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2DCD3] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold">
              Atölyede Hazırlanan
            </span>
            <div className="w-8 h-8 rounded-md bg-[#C85A32]/10 text-[#C85A32] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl font-normal text-[#231B18] mt-2">
            {inProductionCount} Sipariş
          </div>
          <div className="text-[11px] text-[#C85A32] font-medium mt-1">
            Döküm, kuruma ve paketleme bandında
          </div>
        </div>

        {/* KPI 3: Bekleyen Teklif & Talepler */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2DCD3] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold">
              Bekleyen Müşteri Talepleri
            </span>
            <div className="w-8 h-8 rounded-md bg-stone-100 text-stone-600 flex items-center justify-center">
              <MessageSquareQuote className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl font-normal text-[#231B18] mt-2">
            {pendingQuotesCount} Talep
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            Özel tasarım & toplu söz/nişan hediyesi
          </div>
        </div>

        {/* KPI 4: Aktif Ürün Kataloğu */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2DCD3] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold">
              Katalogdaki Ürünler
            </span>
            <div className="w-8 h-8 rounded-md bg-stone-100 text-stone-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl font-normal text-[#231B18] mt-2">
            {products.length} Ürün
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            Aktif satıştaki zanaat kreasyonları
          </div>
        </div>
      </div>

      {/* 3. ANA İÇERİK: SON SİPARİŞLER (SOL 2 KOLON) & BİLDİRİMLER (SAĞ 1 KOLON) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sol Kolon: Son Siparişler Tablosu */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E2DCD3] p-6 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-[#E2DCD3]">
            <div>
              <h2 className="font-serif text-lg text-[#231B18] font-normal">
                Son Gelen Siparişler
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Vitrin ve atölye siparişlerinin güncel durumu
              </p>
            </div>
            <Link
              href="/admin/siparisler"
              className="text-xs font-medium text-[#C85A32] hover:underline flex items-center gap-1"
            >
              <span>Tümünü Gör</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-[#E2DCD3]/60 mt-2">
            {orders.slice(0, 5).map((order) => {
              const currentStage = stageLabels[order.stage] || stageLabels.SIPARIS_ALINDI;

              return (
                <div
                  key={order.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF8F5] px-2 rounded-lg transition"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-[#231B18]">
                        {order.orderNumber}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-sm bg-[#EFECE6] text-stone-700 font-medium">
                        {order.channel}
                      </span>
                      {order.isGiftWrapped && (
                        <span className="text-[10px] px-2 py-0.5 rounded-sm bg-[#C85A32]/10 text-[#C85A32] font-medium">
                          Hediye Paketi
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-stone-600">
                      <span className="font-medium text-[#231B18]">{order.customerName}</span>
                      <span className="text-stone-400"> &bull; </span>
                      <span>{order.items.length} Kalem Ürün</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <span
                      className={`text-[11px] px-2.5 py-0.5 rounded-sm border ${currentStage.style}`}
                    >
                      {currentStage.label}
                    </span>

                    <div className="text-right">
                      <div className="text-xs font-semibold text-[#231B18]">
                        ₺{order.totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </div>
                      <span className="text-[10px] text-stone-500">
                        {order.invoiceStatus === 'OLUSTURULDU' ? 'Faturalandı' : 'Bekliyor'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sağ Kolon: Hatırlatmalar & Hızlı Eylemler */}
        <div className="space-y-6">
          
          {/* Kart 1: Özel Teklif Talepleri */}
          <div className="bg-white rounded-2xl border border-[#E2DCD3] p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2DCD3]">
              <div className="flex items-center gap-2">
                <MessageSquareQuote className="w-4 h-4 text-[#C85A32]" />
                <h3 className="font-serif text-base text-[#231B18] font-normal">
                  Özel Talepler
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-[#C85A32]">
                {pendingQuotesCount} Bekliyor
              </span>
            </div>

            <div className="divide-y divide-[#E2DCD3]/60 my-2">
              {quoteRequests.slice(0, 3).map((quote) => (
                <div key={quote.id} className="py-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-[#231B18] truncate max-w-[140px]">
                      {quote.customerName}
                    </span>
                    <span className="text-[10px] text-stone-500 font-mono">
                      {quote.requestedQuantity} Adet
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-500 truncate mt-0.5">
                    {quote.eventType || quote.productType || 'Özel Sipariş Talebi'}
                  </div>
                </div>
              ))}
              {quoteRequests.length === 0 && (
                <div className="py-4 text-center text-xs text-stone-500">
                  Şu an bekleyen özel teklif talebi bulunmuyor.
                </div>
              )}
            </div>

            <Link
              href="/admin/ozel-talepler"
              className="w-full block py-2 rounded-md bg-[#FAF8F5] hover:bg-[#EFECE6] text-center text-xs font-medium text-[#231B18] border border-[#E2DCD3] transition mt-2"
            >
              Talepleri Yönet →
            </Link>
          </div>

          {/* Kart 2: Terkedilen Sepet Fırsatları */}
          <div className="bg-white rounded-2xl border border-[#E2DCD3] p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2DCD3]">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-[#5F6F52]" />
                <h3 className="font-serif text-base text-[#231B18] font-normal">
                  Terkedilen Sepetler
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-[#5F6F52]">
                ₺{abandonedTotal.toLocaleString('tr-TR')}
              </span>
            </div>

            <div className="divide-y divide-[#E2DCD3]/60 my-2">
              {unrecoveredCarts.slice(0, 2).map((cart) => (
                <div key={cart.id} className="py-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-stone-700 truncate max-w-[140px]">
                      {cart.customerEmail}
                    </span>
                    <span className="font-semibold text-[#231B18]">
                      ₺{cart.totalAmount.toLocaleString('tr-TR')}
                    </span>
                  </div>
                  <div className="text-[10px] text-stone-400 mt-0.5">
                    {cart.abandonedAt}
                  </div>
                </div>
              ))}
              {unrecoveredCarts.length === 0 && (
                <div className="py-4 text-center text-xs text-stone-500">
                  Bekleyen sepet bulunmuyor.
                </div>
              )}
            </div>

            <Link
              href="/admin/pazarlama"
              className="w-full block py-2 rounded-md bg-[#FAF8F5] hover:bg-[#EFECE6] text-center text-xs font-medium text-[#231B18] border border-[#E2DCD3] transition mt-2"
            >
              Pazarlama & Sepet Kurtarma →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
