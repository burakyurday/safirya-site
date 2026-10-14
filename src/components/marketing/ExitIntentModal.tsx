'use client';

import React, { useState, useEffect } from 'react';
import { Clock, X, Check, Copy, Flame } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { SystemSettingsData } from '@/lib/settings';

interface Props {
  settings?: SystemSettingsData;
}

export function ExitIntentModal({ settings }: Props) {
  const { applyCoupon, setIsCartOpen } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 dakika geri sayım

  // Admin ayarları veya default ayarlar
  const couponCode = settings?.exitIntentCouponCode || 'SAFIRYA10';
  const title = settings?.exitIntentTitle || 'Atölyemizden Ayrılmadan Önce %10 Tanışma İndirimi!';
  const subtitle = 'İlk siparişinize özel kehribar sıcaklığında hoş geldin fırsatı. El emeği mum ve epoksi tasarımlarımızda geçerlidir.';

  useEffect(() => {
    // Daha önce kapatıldıysa veya oturumda gösterildiyse tekrar tetikleme
    const alreadyShown = sessionStorage.getItem('safirya_exit_intent_shown');
    if (alreadyShown) return;

    const handleMouseLeave = (e: MouseEvent) => {
      // Mouse sayfanın en tepesine doğru çıkış yaparsa (sekme kapatma/URL barına yönelme)
      if (e.clientY <= 10) {
        setIsOpen(true);
        sessionStorage.setItem('safirya_exit_intent_shown', 'true');
        document.removeEventListener('mouseleave', handleMouseLeave);
      }
    };

    // Kullanıcı sayfada en az 4 saniye vakit geçirdikten sonra tetikleyiciyi aktif et
    const timer = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave);
    }, 4000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Geri sayım sayacı
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleApply = () => {
    navigator.clipboard.writeText(couponCode);
    setCopied(true);
    applyCoupon(couponCode);
    setTimeout(() => {
      setIsOpen(false);
      setIsCartOpen(true);
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#231B18]/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="relative w-full max-w-lg bg-[#F6F3EC] rounded-xs p-8 sm:p-10 shadow-2xl border border-[#E2DCD3] text-[#231B18] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Kapat Butonu */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-5 right-5 p-1.5 rounded-xs text-[#7A7067] hover:text-[#231B18] hover:bg-[#EFECE6] transition"
          aria-label="Kapat"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Rozet */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xs bg-[#F8ECE6] border border-[#C85A32]/20 text-[#C85A32] text-[10px] font-medium uppercase tracking-widest mb-4">
          <Flame className="w-3.5 h-3.5" />
          <span>Atölye Tanışma Teklifi</span>
        </div>

        {/* Başlık & Açıklama */}
        <h3 className="font-serif text-2xl sm:text-3xl font-normal text-[#231B18] leading-snug">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-[#554D46] mt-3 leading-relaxed">
          {subtitle}
        </p>

        {/* Geri Sayım Kutusu */}
        <div className="flex items-center justify-center gap-2 mt-6 py-2 px-4 bg-[#EFECE6] rounded-xs border border-[#E2DCD3] text-[#231B18] text-xs font-medium">
          <Clock className="w-4 h-4 text-[#C85A32]" />
          <span>Geçerlilik süresi:</span>
          <span className="font-mono text-sm font-semibold text-[#C85A32] bg-[#F6F3EC] px-2 py-0.5 rounded-xs border border-[#E2DCD3]">
            {formatTime(timeLeft)}
          </span>
        </div>

        {/* Kupon Kodu Alanı */}
        <div className="mt-6 p-4 rounded-xs bg-[#EFECE6] border border-[#E2DCD3] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <span className="text-[10px] font-medium uppercase tracking-widest text-[#7A7067]">
              İndirim Kupon Kodunuz
            </span>
            <div className="text-xl font-bold tracking-widest text-[#231B18] mt-0.5 font-mono">
              {couponCode}
            </div>
          </div>

          <button
            onClick={handleApply}
            className="w-full sm:w-auto px-6 py-3 rounded-xs bg-[#C85A32] hover:bg-[#B34E29] text-white font-medium text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Uygulandı</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Kuponu Al & Uygula</span>
              </>
            )}
          </button>
        </div>

        {/* Alt Bilgi */}
        <p className="text-center text-[10px] text-[#7A7067] mt-4">
          Kupon sepette otomatik uygulanır. Minimum ₺250 sepet tutarında geçerlidir.
        </p>
      </div>
    </div>
  );
}
