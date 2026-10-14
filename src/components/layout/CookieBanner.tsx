'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie, ShieldCheck, ChevronDown, Check } from 'lucide-react';

export function CookieBanner() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [consentPrefs, setConsentPrefs] = useState({
    necessary: true,
    analytics: true,
    marketing: false,
  });

  useEffect(() => {
    setMounted(true);
    const existing = localStorage.getItem('safirya_cookie_consent');
    if (!existing) {
      // Sayfa yüklendikten 800ms sonra yumuşakça göster
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!mounted || !visible) return null;

  const saveConsent = (type: 'all' | 'necessary' | 'custom') => {
    let payload;
    if (type === 'all') {
      payload = { necessary: true, analytics: true, marketing: true };
    } else if (type === 'necessary') {
      payload = { necessary: true, analytics: false, marketing: false };
    } else {
      payload = consentPrefs;
    }

    try {
      localStorage.setItem('safirya_cookie_consent', JSON.stringify(payload));
      window.dispatchEvent(new CustomEvent('safirya_cookie_consent_updated', { detail: payload }));
    } catch {
      // storage unavailable
    }

    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Çerez ve Gizlilik Bildirimi"
      className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-lg z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="bg-[#1B2A4A] text-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-[#2A3F6D] space-y-4">
        
        {/* Başlık ve İkon */}
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-[#D96B27]/20 text-[#D96B27] flex items-center justify-center shrink-0">
            <Cookie className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              Çerez & Gizlilik Tercihleriniz
            </h3>
            <p className="text-xs text-gray-300 mt-1 leading-relaxed">
              Sizlere el emeği atölyemizde kusursuz bir alışveriş deneyimi sunmak, sepetinizi korumak ve güvenli ödeme sağlamak amacıyla KVKK kapsamında çerezler kullanmaktayız. Detaylı bilgi için{' '}
              <Link
                href="/sayfa/gizlilik-ve-kvkk"
                className="text-[#D96B27] underline underline-offset-2 hover:text-white transition"
              >
                Gizlilik ve KVKK Politikamızı
              </Link>{' '}
              inceleyebilirsiniz.
            </p>
          </div>
        </div>

        {/* Detaylı Tercihler Alanı (Açılır/Kapanır) */}
        {showPreferences && (
          <div className="bg-white/5 rounded-2xl p-3.5 space-y-2.5 text-xs border border-white/10 animate-in fade-in duration-200">
            {/* Zorunlu Çerezler */}
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">Zorunlu Çerezler</span>
                <span className="text-[11px] text-gray-400">Sepet, oturum ve güvenlik için zorunludur.</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
                Her Zaman Aktif
              </span>
            </div>

            {/* Analitik Çerezler */}
            <div className="flex items-center justify-between pt-1 border-t border-white/5">
              <div>
                <span className="font-bold text-white block">Analitik Çerezler</span>
                <span className="text-[11px] text-gray-400">Site performansını ve ziyaretçi trafiğini ölçer.</span>
              </div>
              <input
                type="checkbox"
                checked={consentPrefs.analytics}
                onChange={(e) =>
                  setConsentPrefs({ ...consentPrefs, analytics: e.target.checked })
                }
                className="w-4 h-4 rounded accent-[#D96B27]"
              />
            </div>

            {/* Pazarlama Çerezleri */}
            <div className="flex items-center justify-between pt-1 border-t border-white/5">
              <div>
                <span className="font-bold text-white block">Pazarlama & Kişiselleştirme</span>
                <span className="text-[11px] text-gray-400">İlgi alanlarınıza uygun el yapımı öneriler sunar.</span>
              </div>
              <input
                type="checkbox"
                checked={consentPrefs.marketing}
                onChange={(e) =>
                  setConsentPrefs({ ...consentPrefs, marketing: e.target.checked })
                }
                className="w-4 h-4 rounded accent-[#D96B27]"
              />
            </div>
          </div>
        )}

        {/* Aksiyon Butonları */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => saveConsent(showPreferences ? 'custom' : 'all')}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#D96B27] hover:bg-[#C2581A] text-white text-xs font-bold transition shadow-sm active:scale-95 text-center flex items-center justify-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{showPreferences ? 'Seçilenleri Kaydet' : 'Tümünü Kabul Et'}</span>
          </button>

          <button
            type="button"
            onClick={() => saveConsent('necessary')}
            className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition text-center"
          >
            Yalnızca Gerekli
          </button>

          <button
            type="button"
            onClick={() => setShowPreferences(!showPreferences)}
            className="py-2.5 px-2.5 rounded-xl text-gray-400 hover:text-white text-xs font-medium transition text-center flex items-center justify-center gap-1"
          >
            <span>Ayarlar</span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform ${
                showPreferences ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>

      </div>
    </div>
  );
}
