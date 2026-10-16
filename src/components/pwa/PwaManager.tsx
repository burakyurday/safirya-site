'use client';

import React, { useEffect, useState } from 'react';
import { Download, X, Sparkles, Share, PlusSquare } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PwaManager() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [showIosModal, setShowIosModal] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Service Worker Kaydı
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('[Safirya PWA] Service Worker kayıt başarılı:', registration.scope);
          })
          .catch((error) => {
            console.warn('[Safirya PWA] Service Worker kayıt hatası:', error);
          });
      });
    }

    // 2. Standalone (PWA modunda mı çalışıyor?) kontrolü
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(isStandaloneMode);

    if (isStandaloneMode) {
      return; // Zaten yüklü
    }

    // 3. iOS Tespiti
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // Daha önce kapatıldı mı kontrolü
    const dismissedTime = localStorage.getItem('safirya_pwa_dismissed');
    if (dismissedTime) {
      const daysSinceDismissed = (Date.now() - Number(dismissedTime)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        return; // 7 gün boyunca tekrar rahatsız etme
      }
    }

    // 4. Android / Chrome Install Prompt Dinleyicisi
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Kullanıcı siteyi 5 saniye gezdikten sonra kibarca göster
      setTimeout(() => {
        setShowInstallBanner(true);
      }, 5000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // iOS için 10 saniye sonra banner'ı göster
    if (isIosDevice && !isStandaloneMode) {
      const timer = setTimeout(() => {
        setShowInstallBanner(true);
      }, 8000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosModal(true);
      return;
    }

    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    try {
      localStorage.setItem('safirya_pwa_dismissed', Date.now().toString());
    } catch {}
  };

  if (isStandalone || !showInstallBanner) {
    return null;
  }

  return (
    <>
      {/* 1. Altta Çıkan Yükleme Bildirimi */}
      <aside
        aria-label="Safirya mobil uygulama yükleme bildirimi"
        className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-50 animate-slideUp bg-[#231B18] text-white p-4 rounded-2xl shadow-2xl border border-white/15 flex items-center justify-between gap-3 backdrop-blur-md"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D96B27] to-[#C85A32] flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-xs font-semibold text-white flex items-center gap-1.5">
              <span>Safirya Atölye Uygulaması</span>
            </div>
            <p className="text-[11px] text-stone-300 line-clamp-1">
              Ana ekranınıza ekleyin, hızlı ve çevrimdışı alışveriş yapın.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleInstallClick}
            className="px-3 py-1.5 bg-[#C85A32] hover:bg-[#B34E2A] text-white text-xs font-semibold rounded-lg transition shadow-xs flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Yükle</span>
          </button>
          <button
            onClick={handleDismiss}
            aria-label="Yükleme bildirimini kapat"
            className="p-1.5 text-stone-400 hover:text-white rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* 2. iOS Safari Kurulum Rehberi Modalı */}
      {showIosModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="ios-pwa-modal-title"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-4 animate-fadeIn"
        >
          <div className="bg-[#FAF8F5] text-[#231B18] p-6 rounded-2xl max-w-sm w-full border border-stone-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C85A32]" />
                <h3 id="ios-pwa-modal-title" className="font-serif text-lg font-normal text-[#231B18]">
                  iPhone’a Nasıl Yüklenir?
                </h3>
              </div>
              <button
                onClick={() => setShowIosModal(false)}
                aria-label="Kurulum rehberini kapat"
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Safari tarayıcısında sadece 2 adımda Safirya’yı ana ekranınıza bağımsız bir uygulama olarak ekleyebilirsiniz:
            </p>

            <ol className="space-y-3 text-xs text-stone-700">
              <li className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-stone-200">
                <span className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center font-bold text-[10px]">
                  1
                </span>
                <span className="flex-1">
                  Alt menüdeki <strong className="text-[#C85A32]">Paylaş</strong> (<Share className="w-3.5 h-3.5 inline mx-0.5" />) butonuna dokunun.
                </span>
              </li>

              <li className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-stone-200">
                <span className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center font-bold text-[10px]">
                  2
                </span>
                <span className="flex-1">
                  Menüyü aşağı kaydırıp <strong className="text-[#C85A32]">Ana Ekrana Ekle</strong> (<PlusSquare className="w-3.5 h-3.5 inline mx-0.5" />) seçeneğini seçin.
                </span>
              </li>
            </ol>

            <button
              onClick={() => {
                setShowIosModal(false);
                setShowInstallBanner(false);
              }}
              className="w-full py-2.5 bg-[#231B18] text-white text-xs font-semibold rounded-lg hover:bg-[#3A2E29] transition"
            >
              Anladım
            </button>
          </div>
        </div>
      )}
    </>
  );
}
