'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Award,
  Crown,
  Gem,
  Gift,
  ArrowRight,
  Copy,
  Check,
  Share2,
  Calendar,
  MessageSquare,
  ShoppingBag,
  ChevronRight,
  Info,
  Clock,
  ArrowLeft,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import {
  LOYALTY_TIERS,
  LOYALTY_CONFIG,
  LoyaltyTierKey,
} from '@/types/loyalty';
import { getNextTierProgress, calculatePointsDiscount } from '@/lib/loyalty';

export default function LoyaltyClubPage() {
  const { currentUser, loyaltyAccount, setIsAuthModalOpen, setAuthModalView } = useStore();
  const [copied, setCopied] = useState(false);

  // Giriş yapılmamışsa üyelik daveti göster
  if (!currentUser) {
    return (
      <div className="bg-[#FBF9F5] min-h-[75vh] py-16 text-[#231B18] px-4">
        <div className="max-w-xl mx-auto bg-white p-8 sm:p-10 rounded-2xl border border-[#E2DCD3] shadow-xs text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#C85A32]/10 text-[#C85A32] flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase tracking-widest text-[#C85A32] font-bold">
              Safirya Atölye Kulübü
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl text-[#231B18] font-normal">
              Ayrıcalıklı Zanaat Dünyasına Katılın
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-md mx-auto">
              Safirya Atölye Kulübü üyeleri her el yapımı siparişte Safir Puan kazanır, ücretsiz kargo ve sürpriz zanaat hediyeleriyle ödüllendirilir.
            </p>
          </div>

          <div className="p-4 bg-amber-50/70 border border-amber-200/60 rounded-xl text-left flex items-start gap-3">
            <Gift className="w-5 h-5 text-[#C85A32] shrink-0 mt-0.5" />
            <div className="text-xs text-amber-950">
              <strong className="block font-semibold">100 Hoş Geldin Puanı (₺50 İndirim):</strong>
              Hemen ücretsiz üye olun, anında 100 Safir Puan kazanın ve ilk siparişinizde indirim olarak kullanın.
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setAuthModalView('register');
                setIsAuthModalOpen(true);
              }}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-[#C85A32] hover:bg-[#B34E2A] text-white text-xs font-semibold transition shadow-xs"
            >
              Üye Ol & 100 Puan Kazan
            </button>
            <button
              onClick={() => {
                setAuthModalView('login');
                setIsAuthModalOpen(true);
              }}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-[#231B18] text-xs font-semibold transition"
            >
              Zaten Üyeyim, Giriş Yap
            </button>
          </div>
        </div>
      </div>
    );
  }

  const account = loyaltyAccount || {
    id: `loyalty-${currentUser.id}`,
    userId: currentUser.id,
    pointsBalance: 100,
    lifetimePoints: 100,
    totalSpent: 0,
    currentTier: 'BRONZ' as LoyaltyTierKey,
    referralCode: 'SFR-KULUP-100',
    transactions: [],
  };

  const currentTierConfig = LOYALTY_TIERS[account.currentTier] || LOYALTY_TIERS.BRONZ;
  const progress = getNextTierProgress(account.totalSpent);
  const discountValue = calculatePointsDiscount(account.pointsBalance);

  const handleCopyCode = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(account.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getTierIcon = (key: LoyaltyTierKey) => {
    switch (key) {
      case 'PLATIN':
        return <Gem className="w-4 h-4 text-emerald-700" />;
      case 'ALTIN':
        return <Crown className="w-4 h-4 text-yellow-700" />;
      case 'GUMUS':
        return <Award className="w-4 h-4 text-slate-700" />;
      case 'BRONZ':
      default:
        return <Sparkles className="w-4 h-4 text-amber-700" />;
    }
  };

  return (
    <div className="bg-[#FAF8F5] min-h-[80vh] py-10 text-[#231B18]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        
        {/* Üst Geri Butonu & Başlık */}
        <div className="flex items-center justify-between">
          <Link
            href="/hesabim"
            className="text-xs text-stone-500 hover:text-[#231B18] transition flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Hesabıma Dön</span>
          </Link>

          <span className="text-[11px] font-semibold text-[#C85A32] bg-[#C85A32]/10 px-2.5 py-0.5 rounded-full">
            Safirya Atölye Kulübü
          </span>
        </div>

        {/* 1. HERO KULÜP KARTI */}
        <div className="bg-gradient-to-br from-[#231B18] via-[#2F2420] to-[#1F1714] text-white p-6 sm:p-8 rounded-2xl shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#C85A32]/10 rounded-full blur-3xl -translate-y-12 translate-x-12 pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/15">
                  {getTierIcon(account.currentTier)}
                  <span>{currentTierConfig.name}</span>
                </span>
                <span className="text-[11px] text-stone-400">
                  {currentTierConfig.pointsMultiplier}x Puan Çarpanı
                </span>
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl font-normal text-white">
                Hoş Geldiniz, {currentUser.name}
              </h1>
              <p className="text-xs text-stone-300 mt-1">
                Atölye Kulübü üyesi olarak her alışverişinizde Safir Puan kazanır, biriktirdiğiniz puanları sepetinizde anında harcarsınız.
              </p>
            </div>

            {/* Puan Kutusu */}
            <div className="bg-white/10 border border-white/15 p-5 rounded-xl text-center md:text-right shrink-0 backdrop-blur-xs">
              <span className="text-[10px] uppercase tracking-wider text-amber-300 font-bold block">
                Kullanılabilir Bakiye
              </span>
              <div className="font-serif text-3xl sm:text-4xl font-normal text-white mt-1">
                {account.pointsBalance}{' '}
                <span className="text-sm font-sans font-normal text-stone-300">Puan</span>
              </div>
              <div className="text-xs font-medium text-amber-200 mt-0.5">
                = ₺{discountValue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} Değerinde
              </div>
              <Link
                href="/kategoriler"
                className="inline-flex items-center gap-1 mt-3 text-[11px] font-semibold text-white bg-[#C85A32] hover:bg-[#B34E2A] px-3.5 py-1.5 rounded-md transition shadow-xs"
              >
                <span>Puanları Harca</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* İlerleme Çubuğu */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-stone-300">
                Mevcut Seviye: <strong>{currentTierConfig.name}</strong>
              </span>
              <span className="text-amber-300 font-medium">
                {progress.nextTier ? (
                  <>
                    {progress.nextTier.name} için ₺{progress.neededSpend.toLocaleString('tr-TR')} harcama kaldı
                  </>
                ) : (
                  'Tebrikler! En üst Platin seviyesindesiniz.'
                )}
              </span>
            </div>

            <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#C85A32] to-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${progress.progressPercentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-stone-400 mt-1.5">
              <span>Toplam Harcama: ₺{account.totalSpent.toLocaleString('tr-TR')}</span>
              <span>İlerleme: %{progress.progressPercentage}</span>
            </div>
          </div>
        </div>

        {/* 2. ARKADAŞINI DAVET ET & PUAN KAZAN */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2DCD3] shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-[10px] uppercase tracking-wider text-[#C85A32] font-bold">
              Kazan - Kazan Programı
            </span>
            <h3 className="font-serif text-lg font-normal text-[#231B18]">
              Arkadaşını Atölyeye Davet Et, İkiniz de 100 Puan (₺50) Kazanın!
            </h3>
            <p className="text-xs text-stone-600 max-w-lg">
              Özel davet kodunuzla kayıt olup ilk siparişini veren her arkadaşınız için hesabınıza anında 100 Safir Puan yüklenir.
            </p>
          </div>

          {/* Kod Kopyalama */}
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <div className="bg-stone-50 border border-stone-200 px-3.5 py-2 rounded-lg font-mono text-xs font-bold text-[#231B18] tracking-wider text-center flex-1 sm:flex-initial">
              {account.referralCode}
            </div>
            <button
              onClick={handleCopyCode}
              className="px-3.5 py-2 rounded-lg bg-[#231B18] hover:bg-[#2C221E] text-white text-xs font-medium transition flex items-center gap-1.5 shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Kopyalandı!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Kodu Kopyala</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 3. NASIL PUAN KAZANILIR? */}
        <div className="space-y-3">
          <h2 className="font-serif text-xl font-normal text-[#231B18]">
            Safir Puan Nasıl Kazanılır?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-[#E2DCD3] shadow-2xs space-y-2">
              <div className="w-9 h-9 rounded-lg bg-[#C85A32]/10 text-[#C85A32] flex items-center justify-center font-bold">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-[#231B18]">Alışveriş Yap</h4>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                Her ₺10 harcamanızda 1 Safir Puan kazanın. Kulüp seviyeniz yükseldikçe 2 kata kadar fazla puan biriktirin.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#E2DCD3] shadow-2xs space-y-2">
              <div className="w-9 h-9 rounded-lg bg-[#5F6F52]/10 text-[#5F6F52] flex items-center justify-center font-bold">
                <MessageSquare className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-[#231B18]">Fotoğraflı Yorum</h4>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                Teslim aldığınız el yapımı ürünlere fotoğraflı değerlendirme yazın, anında +50 Safir Puan kazanın.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#E2DCD3] shadow-2xs space-y-2">
              <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                <Calendar className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-[#231B18]">Doğum Günü Hediyesi</h4>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                Doğum günü haftanızda atölyemizden sürpriz kutlama puanı hesabınıza otomatik yüklenir.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#E2DCD3] shadow-2xs space-y-2">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                <Share2 className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-[#231B18]">Arkadaşını Getir</h4>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                Davet kodunuzla alışveriş yapan her arkadaşınız için +100 Safir Puan (₺50 İndirim) kazanın.
              </p>
            </div>
          </div>
        </div>

        {/* 4. KULÜP SEVİYELERİ & AYRICALIKLAR */}
        <div className="space-y-3">
          <h2 className="font-serif text-xl font-normal text-[#231B18]">
            Kulüp Seviyeleri ve Ayrıcalıklar
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(Object.keys(LOYALTY_TIERS) as LoyaltyTierKey[]).map((tierKey) => {
              const tier = LOYALTY_TIERS[tierKey];
              const isCurrent = account.currentTier === tierKey;

              return (
                <div
                  key={tierKey}
                  className={`p-5 rounded-2xl border transition relative flex flex-col justify-between ${
                    isCurrent
                      ? 'bg-white border-[#C85A32] ring-2 ring-[#C85A32]/20 shadow-xs'
                      : 'bg-white border-[#E2DCD3]'
                  }`}
                >
                  <div>
                    {isCurrent && (
                      <span className="inline-block text-[9px] font-bold uppercase tracking-wider bg-[#C85A32] text-white px-2 py-0.5 rounded-full mb-2">
                        Mevcut Seviyeniz
                      </span>
                    )}

                    <div className="flex items-center gap-2 mb-2">
                      <span className="p-1 rounded-md bg-stone-100">{getTierIcon(tierKey)}</span>
                      <h4 className="font-serif text-base text-[#231B18] font-semibold">{tier.name}</h4>
                    </div>

                    <div className="text-[11px] font-medium text-stone-500 mb-3">
                      {tier.maxSpend ? `₺${tier.minSpend} - ₺${tier.maxSpend}` : `₺${tier.minSpend}+ Harcama`}
                    </div>

                    <ul className="space-y-2 text-xs text-stone-600">
                      {tier.perks.map((perk, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 text-[11px]">
                          <span className="text-[#C85A32] font-bold">✓</span>
                          <span>{perk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-100 text-[10px] text-stone-400 text-center font-medium">
                    {tier.pointsMultiplier}x Puan Katsayısı
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5. PUAN HAREKETLERİ GEÇMİŞİ */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2DCD3] shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-normal text-[#231B18]">
              Puan Hareketleri Geçmişi
            </h3>
            <span className="text-xs text-stone-400">
              Toplam {account.transactions.length} işlem
            </span>
          </div>

          {account.transactions.length > 0 ? (
            <div className="divide-y divide-stone-100">
              {account.transactions.map((tx) => (
                <div key={tx.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-medium text-[#231B18]">{tx.description}</div>
                    <div className="text-[10px] text-stone-400 mt-0.5 flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(tx.createdAt).toLocaleDateString('tr-TR')}</span>
                      {tx.orderNumber && <span>• Sipariş: {tx.orderNumber}</span>}
                    </div>
                  </div>

                  <div
                    className={`font-serif text-sm font-semibold ${
                      tx.points > 0 ? 'text-emerald-700' : 'text-stone-700'
                    }`}
                  >
                    {tx.points > 0 ? `+${tx.points}` : tx.points} Puan
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-stone-400 text-xs">
              Henüz bir puan hareketiniz bulunmuyor. İlk siparişinizi vererek puan kazanmaya başlayabilirsiniz!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
