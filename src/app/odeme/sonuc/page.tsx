'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Package,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  RefreshCw,
  PhoneCall,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';

function PaymentResultContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  const orderNumber = searchParams.get('oid') || searchParams.get('orderNumber') || '';
  const isSuccess = status === 'success' || status === 'ok';

  const { clearCart } = useStore();
  const [copied, setCopied] = useState(false);

  // PayTR iframe içinden yönlendirilmişse ana pencereyi bu sayfaya taşı (iframe breakout)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.top && window.top !== window.self) {
      try {
        window.top.location.href = window.location.href;
      } catch {}
    }
  }, []);

  // Başarılı ödeme durumunda sepeti otomatik temizle
  useEffect(() => {
    if (isSuccess) {
      clearCart();
    }
  }, [isSuccess, clearCart]);

  const copyOrderNumber = () => {
    if (!orderNumber) return;
    navigator.clipboard.writeText(orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isSuccess) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl w-full bg-white border border-[#E2DCD3] rounded-xs p-8 sm:p-12 text-center space-y-6 shadow-sm">
          
          {/* Başarı İkonu */}
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <span className="text-[11px] font-sans uppercase tracking-[0.2em] font-semibold text-[#C85A32] block mb-2">
              ÖDEME ONAYLANDI
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl text-[#231B18] font-normal leading-tight">
              Teşekkür Ederiz, Siparişiniz Alındı!
            </h1>
            <p className="text-xs sm:text-sm text-[#7A7067] mt-2 leading-relaxed max-w-md mx-auto">
              PayTR 3D Secure güvencesiyle kart ödemeniz başarıyla tamamlandı. Zanaatkar ustalarımız atölyemizde siparişinizi hazırlamaya başladı.
            </p>
          </div>

          {/* Sipariş Numarası Kartı */}
          {orderNumber && (
            <div className="bg-[#FAF8F5] border border-[#E2DCD3] rounded-xs p-4 flex items-center justify-between gap-4 max-w-sm mx-auto">
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#7A7067] block">
                  Sipariş Numaranız
                </span>
                <span className="font-mono text-base font-semibold text-[#231B18]">
                  #{orderNumber}
                </span>
              </div>
              <button
                onClick={copyOrderNumber}
                className="px-3 py-1.5 rounded-xs border border-[#E2DCD3] bg-white hover:bg-stone-50 text-xs text-[#231B18] flex items-center gap-1.5 transition cursor-pointer"
                title="Kopyala"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Kopyalandı' : 'Kopyala'}</span>
              </button>
            </div>
          )}

          {/* Güvenlik & Bilgilendirme */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left pt-2">
            <div className="bg-[#FAF8F5]/80 p-3.5 rounded-xs border border-stone-200/60 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-semibold text-[#231B18] block">3D Secure Koruması</span>
                <p className="text-[11px] text-[#7A7067] mt-0.5">İşleminiz banka onaylı şifreleme ile güvence altına alındı.</p>
              </div>
            </div>

            <div className="bg-[#FAF8F5]/80 p-3.5 rounded-xs border border-stone-200/60 flex items-start gap-3">
              <Package className="w-5 h-5 text-[#C85A32] shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-semibold text-[#231B18] block">Kargoya Hazırlık</span>
                <p className="text-[11px] text-[#7A7067] mt-0.5">1-3 iş günü içinde özel korumalı kutusunda kargolanacaktır.</p>
              </div>
            </div>
          </div>

          {/* Butonlar */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/siparis-takip"
              className="w-full sm:w-auto px-6 py-3 rounded-xs bg-[#231B18] hover:bg-[#C85A32] text-white text-xs uppercase tracking-widest font-medium transition inline-flex items-center justify-center gap-2"
            >
              <span>Siparişimi Takip Et</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/kategoriler"
              className="w-full sm:w-auto px-6 py-3 rounded-xs border border-[#E2DCD3] hover:bg-stone-50 text-[#231B18] text-xs uppercase tracking-widest font-medium transition inline-flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Alışverişe Devam Et</span>
            </Link>
          </div>

        </div>
      </div>
    );
  }

  // Başarısız Durum
  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full bg-white border border-red-200 rounded-xs p-8 sm:p-12 text-center space-y-6 shadow-sm">
        
        {/* Hata İkonu */}
        <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto shadow-xs">
          <XCircle className="w-8 h-8" />
        </div>

        <div>
          <span className="text-[11px] font-sans uppercase tracking-[0.2em] font-semibold text-red-600 block mb-2">
            ÖDEME TAMAMLANAMADI
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#231B18] font-normal leading-tight">
            Ödeme İşlemi Bankanız Tarafından Onaylanmadı
          </h1>
          <p className="text-xs sm:text-sm text-[#7A7067] mt-2 leading-relaxed max-w-md mx-auto">
            Kart bilgileriniz veya 3D Secure doğrulaması sırasında bir hata oluştu. Hesabınızdan herhangi bir çekim yapılmamıştır.
          </p>
        </div>

        {orderNumber && (
          <div className="bg-stone-50 border border-stone-200 rounded-xs p-3 text-xs text-[#7A7067] max-w-sm mx-auto">
            Referans No: <strong className="font-mono text-[#231B18]">#{orderNumber}</strong>
          </div>
        )}

        <div className="bg-[#FAF8F5] border border-[#E2DCD3] rounded-xs p-4 text-left text-xs text-[#54473F] space-y-2 max-w-md mx-auto">
          <span className="font-semibold text-[#231B18] block">Olası Nedenler & Çözümler:</span>
          <ul className="list-disc list-inside space-y-1 text-[11px]">
            <li>Kartınızın internetten alışveriş yetkisinin açık olduğundan emin olunuz.</li>
            <li>Kart limitinizin sipariş tutarını karşıladığını kontrol ediniz.</li>
            <li>Banka tarafından cep telefonunuza gönderilen 3D Secure SMS kodunu doğru girdiğinizden emin olunuz.</li>
            <li>Farklı bir kart ile deneyebilir veya <strong>Havale / EFT</strong> seçeneğini kullanabilirsiniz.</li>
          </ul>
        </div>

        {/* Butonlar */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/odeme"
            className="w-full sm:w-auto px-6 py-3 rounded-xs bg-[#C85A32] hover:bg-[#A04523] text-white text-xs uppercase tracking-widest font-medium transition inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Tekrar Dene</span>
          </Link>

          <Link
            href="https://wa.me/905412345678"
            target="_blank"
            className="w-full sm:w-auto px-6 py-3 rounded-xs border border-[#E2DCD3] hover:bg-stone-50 text-[#231B18] text-xs uppercase tracking-widest font-medium transition inline-flex items-center justify-center gap-2"
          >
            <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
            <span>Atölye Destek Hattı</span>
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin text-[#C85A32] mx-auto" />
            <span className="text-xs text-[#7A7067]">Ödeme sonucu kontrol ediliyor...</span>
          </div>
        </div>
      }
    >
      <PaymentResultContent />
    </Suspense>
  );
}
