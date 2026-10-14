'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircle2,
  Copy,
  Check,
  PackageCheck,
  ArrowRight,
  Sparkles,
  MessageCircle,
  Home,
  ShieldCheck,
} from 'lucide-react';
import { trackPurchase } from '@/lib/analytics';

function ThankYouContent() {
  const searchParams = useSearchParams();
  const orderNumberParam = searchParams.get('order') || searchParams.get('siparis');

  const [copied, setCopied] = useState(false);
  const [orderData, setOrderData] = useState<{
    orderNumber: string;
    customerName?: string;
    email?: string;
    totalAmount?: number;
    shippingAddress?: string;
    date?: string;
    items?: Array<{ name: string; quantity: number; price: number }>;
  } | null>(null);

  useEffect(() => {
    try {
      const existing = localStorage.getItem('safirya_orders');
      if (existing) {
        const orders = JSON.parse(existing);
        const match = orderNumberParam
          ? orders.find((o: any) => o.orderNumber === orderNumberParam)
          : orders[0];

        if (match) {
          setOrderData(match);
          // Analytics purchase takibi
          trackPurchase({
            orderNumber: match.orderNumber,
            totalAmount: match.totalAmount || 0,
            items: match.items || [],
          });
        }
      }
    } catch {
      // Local storage okunamadı
    }
  }, [orderNumberParam]);

  const displayOrderNumber = orderData?.orderNumber || orderNumberParam || 'SFR-2026-8921';

  const copyOrderNumber = () => {
    navigator.clipboard.writeText(displayOrderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-[80vh] bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* Ana Teşekkür Kartı (Clean Minimalist White) */}
        <div className="bg-white rounded-xs border border-stone-200 p-8 sm:p-10 text-center space-y-6">
          <div className="w-16 h-16 bg-[#FEF5C8] text-[#231B18] rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-[0.2em] font-medium text-[#7A7067] block mb-2">
              Siparişiniz Başarıyla Alındı
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#231B18] tracking-tight">
              Teşekkür Ederiz, Siparişiniz Atölyemize Ulaştı
            </h1>
            <p className="text-xs sm:text-sm text-[#7A7067] mt-2 max-w-md mx-auto leading-relaxed">
              {orderData?.email ? (
                <>Sipariş detayları ve faturanız <strong className="text-[#231B18]">{orderData.email}</strong> adresine gönderildi.</>
              ) : (
                <>Sipariş detaylarınız kayıtlı e-posta adresinize gönderildi.</>
              )}{' '}
              Zanaatkar ustalarımız el emeği ürünlerinizi özenle hazırlamaya başladı.
            </p>
          </div>

          {/* Benzersiz Sipariş Numarası Vurgusu */}
          <div className="p-4 rounded-xs bg-[#FAF8F5] border border-stone-200 flex items-center justify-between gap-4 max-w-md mx-auto">
            <div className="text-left">
              <span className="text-[10px] uppercase tracking-widest text-[#7A7067] block">
                Sipariş Numaranız
              </span>
              <span className="text-lg sm:text-xl font-mono font-medium text-[#231B18] tracking-wider">
                {displayOrderNumber}
              </span>
            </div>
            <button
              type="button"
              onClick={copyOrderNumber}
              className="px-3.5 py-2 rounded-xs bg-white border border-stone-300 hover:border-[#231B18] text-xs uppercase tracking-wider text-[#231B18] flex items-center gap-1.5 transition active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#C85A32]" />
                  <span>Kopyalandı</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-stone-500" />
                  <span>Kopyala</span>
                </>
              )}
            </button>
          </div>

          {/* Atölye Hazırlık Aşamaları Önizlemesi */}
          <div className="p-5 rounded-xs bg-[#FAF8F5] border border-stone-200 text-left space-y-3">
            <span className="text-xs uppercase tracking-wider font-semibold text-[#231B18] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#C85A32]" />
              Sıradaki Atölye Aşamaları
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
              <div className="p-3 rounded-xs bg-white border border-stone-200">
                <span className="font-medium text-[#231B18] block">1. Kalıp & Döküm</span>
                <span className="text-[11px] text-[#7A7067]">Doğal vaks ve esans hazırlığı</span>
              </div>
              <div className="p-3 rounded-xs bg-white border border-stone-200">
                <span className="font-medium text-[#231B18] block">2. Kalite Kontrol</span>
                <span className="text-[11px] text-[#7A7067]">Form kontrolü & mühürleme</span>
              </div>
              <div className="p-3 rounded-xs bg-white border border-stone-200">
                <span className="font-medium text-[#231B18] block">3. Özel Paketleme</span>
                <span className="text-[11px] text-[#7A7067]">Darbe emici ambalaj</span>
              </div>
            </div>
          </div>

          {/* Aksiyon Butonları */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href={`/siparis-takip?orderNumber=${displayOrderNumber}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xs bg-[#231B18] hover:bg-[#3A2E29] text-white text-xs uppercase tracking-widest font-medium transition"
            >
              <PackageCheck className="w-4 h-4" />
              <span>Siparişi Canlı Takip Et</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/kategoriler"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xs bg-white border border-[#231B18] text-[#231B18] hover:bg-[#231B18] hover:text-white text-xs uppercase tracking-widest font-medium transition"
            >
              <Home className="w-4 h-4" />
              <span>Alışverişe Devam Et</span>
            </Link>
          </div>

          {/* Güvenlik & Destek Notu */}
          <div className="pt-4 border-t border-stone-200 flex flex-wrap items-center justify-center gap-4 text-xs text-[#7A7067]">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-[#15803D]" />
              Hasarsız Teslimat Garantisi
            </span>
            <span>•</span>
            <a
              href="https://wa.me/905325557234"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[#231B18] hover:text-[#C85A32] font-medium transition"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#15803D]" />
              WhatsApp Destek: 0532 555 7234
            </a>
          </div>

        </div>

      </div>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center bg-white">
          <div className="text-center space-y-2">
            <div className="w-6 h-6 border-2 border-[#231B18] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-[#7A7067]">Sipariş onayınız yükleniyor...</p>
          </div>
        </div>
      }
    >
      <ThankYouContent />
    </Suspense>
  );
}
