'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  RotateCcw,
  Home,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to console or error reporting service
    console.error('Safirya Atölyesi Sayfa Hatası:', error);
  }, [error]);

  return (
    <div className="bg-white min-h-[75vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Görsel / İkon Alanı */}
        <div className="relative inline-block">
          <div className="w-20 h-20 rounded-full bg-[#FAF8F5] border border-stone-200 flex items-center justify-center mx-auto shadow-xs">
            <AlertTriangle className="w-10 h-10 text-[#C85A32] stroke-[1.5]" />
          </div>
          <span className="absolute -top-1 -right-1 px-2.5 py-0.5 rounded-xs bg-[#C85A32] text-white text-[10px] uppercase font-mono tracking-wider font-medium">
            HATA
          </span>
        </div>

        {/* Başlık ve Açıklama */}
        <div className="space-y-3">
          <span className="text-xs uppercase tracking-widest font-medium text-[#C85A32] block">
            Atölyede Geçici Bir Aksaklık
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#231B18]">
            Beklenmeyen Bir Durum Oluştu
          </h1>
          <p className="text-xs sm:text-sm text-[#7A7067] max-w-lg mx-auto leading-relaxed">
            Atölyemizdeki el emeği koleksiyonları ve sayfayı yüklerken beklenmedik bir aksaklık meydana geldi. 
            İşlemi yeniden deneyebilir ya da atölyemizi keşfetmeye ana sayfadan devam edebilirsiniz.
          </p>
          {error?.digest && (
            <div className="pt-1">
              <span className="inline-block px-3 py-1 rounded-xs bg-[#FAF8F5] border border-stone-200 text-[#7A7067] text-[11px] font-mono">
                Hata Referans Kodu: {error.digest}
              </span>
            </div>
          )}
        </div>

        {/* Ana Aksiyon Butonları */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xs bg-[#231B18] hover:bg-[#3A2E29] text-white text-xs uppercase tracking-widest font-medium transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Tekrar Dene</span>
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xs bg-white border border-[#231B18] text-[#231B18] hover:bg-[#231B18] hover:text-white text-xs uppercase tracking-widest font-medium transition"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Anasayfaya Dön</span>
          </Link>
        </div>

        {/* Yardım ve İletişim Önerileri */}
        <div className="pt-8 border-t border-stone-200">
          <span className="text-[11px] uppercase tracking-[0.2em] font-medium text-[#7A7067] block mb-4">
            Yardıma mı İhtiyacınız Var?
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            <Link
              href="/sayfa/iletisim"
              className="flex items-center gap-3 p-3.5 rounded-xs bg-[#FAF8F5] border border-stone-200 hover:border-[#231B18] transition group"
            >
              <div className="p-2 rounded-xs bg-white border border-stone-200 shrink-0">
                <Sparkles className="w-4 h-4 text-[#C85A32]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-serif text-sm font-normal text-[#231B18] group-hover:text-[#C85A32] transition truncate">
                  Atölye İletişim &amp; Destek
                </h3>
                <p className="text-[11px] text-[#7A7067] truncate">
                  Bize mesaj iletin, yardımcı olalım
                </p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#231B18] group-hover:translate-x-0.5 transition" />
            </Link>

            <Link
              href="/siparis-takip"
              className="flex items-center gap-3 p-3.5 rounded-xs bg-[#FAF8F5] border border-stone-200 hover:border-[#231B18] transition group"
            >
              <div className="p-2 rounded-xs bg-white border border-stone-200 shrink-0">
                <Home className="w-4 h-4 text-[#231B18]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-serif text-sm font-normal text-[#231B18] group-hover:text-[#C85A32] transition truncate">
                  Sipariş Durumu Sorgulama
                </h3>
                <p className="text-[11px] text-[#7A7067] truncate">
                  Mevcut siparişinizin kargo aşaması
                </p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#231B18] group-hover:translate-x-0.5 transition" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
