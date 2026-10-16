'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import Link from 'next/link';
import { User, Package, Heart, LogOut, ArrowRight, ShieldCheck, Mail, Sparkles } from 'lucide-react';

export default function HesabimIndexPage() {
  const router = useRouter();
  const { currentUser, logoutUser, setAuthModalView, setIsAuthModalOpen, favoritesCount, loyaltyAccount } = useStore();

  return (
    <div className="bg-white min-h-[70vh] py-12 text-[#231B18]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {currentUser ? (
          /* Giriş Yapmış Kullanıcı Özeti */
          <div className="space-y-6">
            <div className="bg-[#FAF8F5] rounded-xs border border-[#E2DCD3] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#231B18] text-[#F6F3EC] flex items-center justify-center font-serif text-2xl font-normal">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="font-serif text-xl sm:text-2xl font-normal text-[#231B18]">
                    {currentUser.name}
                  </h1>
                  <p className="text-xs text-[#7A7067] flex items-center gap-1.5 mt-0.5">
                    <Mail className="w-3.5 h-3.5 text-stone-400" />
                    <span>{currentUser.email}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {Boolean(currentUser.isAdmin || currentUser.role === 'ADMIN') ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xs bg-[#C85A32]/15 text-[#C85A32] text-xs font-bold border border-[#C85A32]/30">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Yönetici Yetkilisi</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xs bg-[#5F6F52]/10 text-[#5F6F52] text-xs font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Doğrulanmış Hesap</span>
                  </span>
                )}
                <button
                  type="button"
                  onClick={logoutUser}
                  className="px-3 py-1 text-xs text-red-600 hover:bg-red-50 rounded-xs transition border border-red-200"
                >
                  Çıkış Yap
                </button>
              </div>
            </div>

            {/* Yönetici Portalı Geçiş Kartı - Yalnızca Admin İse Görünür */}
            {Boolean(currentUser.isAdmin || currentUser.role === 'ADMIN') && (
              <div className="bg-gradient-to-r from-[#231B18] via-[#2F211C] to-[#1C1513] text-white p-5 rounded-xl border border-stone-800 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-lg bg-[#C85A32]/20 border border-[#C85A32]/40 text-[#C85A32] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-6 h-6 text-[#C85A32]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-base font-normal text-[#F6F3EC]">Yönetim Portalı Yetkisi</span>
                      <span className="px-2 py-0.5 rounded-full bg-[#C85A32] text-white text-[10px] font-bold uppercase tracking-wider">
                        Aktif
                      </span>
                    </div>
                    <p className="text-xs text-stone-300 mt-0.5">
                      Bu hesap yönetim paneli yetkisine sahiptir. Siparişleri, ürün kataloğunu ve atölye üretim bandını yönetebilirsiniz.
                    </p>
                  </div>
                </div>

                <a
                  href="/api/admin/auth/switch"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-md bg-[#C85A32] hover:bg-[#B34E2A] text-white text-xs font-semibold uppercase tracking-wider transition shadow-sm hover:shadow-md shrink-0 cursor-pointer"
                >
                  <span>Yönetim Paneline Geçiş Yap</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            )}

            {/* Atölye Kulübü Rozeti & Puan Özeti */}
            <Link
              href="/hesabim/sadakat"
              className="bg-gradient-to-r from-amber-50/80 via-stone-50 to-[#FAF8F5] border border-amber-200/80 p-4 rounded-xl flex items-center justify-between gap-4 hover:border-[#C85A32] transition group shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#C85A32]/10 text-[#C85A32] flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#231B18]">Safirya Atölye Kulübü</span>
                    <span className="text-[10px] font-semibold bg-[#C85A32] text-white px-2 py-0.5 rounded-full">
                      {loyaltyAccount?.currentTier || 'BRONZ'} Seviye
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 mt-0.5">
                    Mevcut Bakiye: <strong className="text-[#C85A32]">{loyaltyAccount?.pointsBalance || 100} Safir Puan</strong> (₺{((loyaltyAccount?.pointsBalance || 100) * 0.5).toFixed(2)} İndirim)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs font-semibold text-[#C85A32] group-hover:translate-x-1 transition shrink-0">
                <span>Puan Detayı</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            {/* Menü Kartları */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link
                href="/hesabim/siparislerim"
                className="p-5 rounded-xl border border-stone-200 bg-white hover:border-[#231B18] transition group space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-[#FAF8F5] border border-stone-200 flex items-center justify-center text-[#C85A32]">
                    <Package className="w-5 h-5" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-[#231B18] group-hover:translate-x-1 transition" />
                </div>
                <h3 className="font-serif text-base font-normal text-[#231B18]">
                  Siparişlerim
                </h3>
                <p className="text-xs text-[#7A7067]">
                  Atölyeden verdiğiniz tüm siparişleri ve canlı üretim aşamalarını inceleyin.
                </p>
              </Link>

              <Link
                href="/hesabim/sadakat"
                className="p-5 rounded-xl border border-stone-200 bg-white hover:border-[#231B18] transition group space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-[#FAF8F5] border border-stone-200 flex items-center justify-center text-[#C85A32]">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-[#231B18] group-hover:translate-x-1 transition" />
                </div>
                <h3 className="font-serif text-base font-normal text-[#231B18]">
                  Atölye Kulübü
                </h3>
                <p className="text-xs text-[#7A7067]">
                  Safir Puan bakiyeniz, seviye ayrıcalıklarınız ve arkadaş davet kodunuz.
                </p>
              </Link>

              <Link
                href="/favoriler"
                className="p-5 rounded-xl border border-stone-200 bg-white hover:border-[#231B18] transition group space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-[#FAF8F5] border border-stone-200 flex items-center justify-center text-[#C85A32]">
                    <Heart className="w-5 h-5" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-[#231B18] group-hover:translate-x-1 transition" />
                </div>
                <h3 className="font-serif text-base font-normal text-[#231B18]">
                  Favorilerim ({favoritesCount})
                </h3>
                <p className="text-xs text-[#7A7067]">
                  Beğendiğiniz mumları, takıları ve epoksi sunumlukları tek bir yerde saklayın.
                </p>
              </Link>
            </div>
          </div>
        ) : (
          /* Giriş Yapılmamış Durum */
          <div className="bg-white p-8 rounded-xs border border-stone-200 text-center max-w-md mx-auto space-y-6">
            <div className="w-14 h-14 rounded-full bg-[#FAF8F5] border border-stone-200 text-[#231B18] flex items-center justify-center mx-auto">
              <User className="w-6 h-6 text-[#231B18]" />
            </div>

            <div className="space-y-1">
              <h1 className="font-serif text-2xl font-normal text-[#231B18]">
                Safirya Hesabım
              </h1>
              <p className="text-xs text-[#7A7067]">
                Atölye hesabınıza giriş yaparak siparişlerinizi canlı takip edebilir, favorilerinizi yönetebilirsiniz.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setAuthModalView('login');
                  setIsAuthModalOpen(true);
                }}
                className="w-full py-3 rounded-xs bg-[#231B18] hover:bg-[#C85A32] text-white text-xs uppercase tracking-widest font-medium transition cursor-pointer"
              >
                Giriş Yap
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthModalView('register');
                  setIsAuthModalOpen(true);
                }}
                className="w-full py-3 rounded-xs border border-stone-300 hover:border-[#231B18] text-[#231B18] hover:bg-[#FAF8F5] text-xs uppercase tracking-widest font-medium transition cursor-pointer"
              >
                Yeni Hesap Oluştur
              </button>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalView('forgot_password');
                    setIsAuthModalOpen(true);
                  }}
                  className="text-xs text-[#7A7067] hover:text-[#C85A32] underline"
                >
                  Şifremi Unuttum
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-200">
              <Link
                href="/siparis-takip"
                className="text-xs text-[#7A7067] hover:text-[#231B18] transition"
              >
                Üyeliksiz Verilen Siparişleri Takip Et →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
