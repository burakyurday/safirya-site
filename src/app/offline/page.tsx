'use client';

import React from 'react';
import Link from 'next/link';
import { WifiOff, RefreshCw, ShoppingBag, Heart, Phone, ArrowLeft } from 'lucide-react';

export default function OfflinePage() {
  const handleRetry = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-[75vh] bg-[#FAF8F5] text-[#231B18] flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-2xl border border-[#E2DCD3] shadow-xs text-center space-y-6">
        
        {/* İkon */}
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-[#C85A32] flex items-center justify-center mx-auto">
          <WifiOff className="w-8 h-8" />
        </div>

        {/* Metin */}
        <div className="space-y-2">
          <span className="text-[10px] uppercase tracking-widest text-[#C85A32] font-bold">
            Çevrimdışı Mod
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#231B18]">
            İnternet Bağlantınız Kesildi
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            Şu anda çevrimdışısınız. Ancak endişelenmeyin; sepetinizdeki ürünler ve beğendiğiniz favoriler cihazınızda güvende saklanmaktadır.
          </p>
        </div>

        {/* Butonlar */}
        <div className="space-y-3 pt-2">
          <button
            onClick={handleRetry}
            className="w-full py-3 bg-[#C85A32] hover:bg-[#B34E2A] text-white text-xs font-semibold rounded-lg transition shadow-xs flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Yeniden Bağlanmayı Dene</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/sepet"
              className="py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-[#231B18] text-xs font-medium rounded-lg transition flex items-center justify-center gap-1.5 border border-stone-200"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Sepetime Git</span>
            </Link>

            <Link
              href="/favoriler"
              className="py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-[#231B18] text-xs font-medium rounded-lg transition flex items-center justify-center gap-1.5 border border-stone-200"
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Favorilerim</span>
            </Link>
          </div>
        </div>

        {/* Acil İletişim */}
        <div className="pt-4 border-t border-stone-100 text-xs text-stone-500">
          <span>Acil sipariş veya özel üretim talebi için: </span>
          <a
            href="tel:+905438981639"
            className="font-semibold text-[#231B18] hover:text-[#C85A32] inline-flex items-center gap-1 ml-1"
          >
            <Phone className="w-3 h-3 text-[#C85A32]" />
            <span>0532 555 72 34</span>
          </a>
        </div>
      </div>
    </div>
  );
}
