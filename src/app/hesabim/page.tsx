'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import Link from 'next/link';
import { User, Package, Heart, LogOut, ArrowRight, ShieldCheck, Mail } from 'lucide-react';

export default function HesabimIndexPage() {
  const router = useRouter();
  const { currentUser, logoutUser, setAuthModalView, setIsAuthModalOpen, favoritesCount } = useStore();

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
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xs bg-[#5F6F52]/10 text-[#5F6F52] text-xs font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Doğrulanmış Hesap</span>
                </span>
                <button
                  type="button"
                  onClick={logoutUser}
                  className="px-3 py-1 text-xs text-red-600 hover:bg-red-50 rounded-xs transition border border-red-200"
                >
                  Çıkış Yap
                </button>
              </div>
            </div>

            {/* Menü Kartları */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                href="/hesabim/siparislerim"
                className="p-5 rounded-xs border border-stone-200 bg-white hover:border-[#231B18] transition group space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xs bg-[#FAF8F5] border border-stone-200 flex items-center justify-center text-[#C85A32]">
                    <Package className="w-5 h-5" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-[#231B18] group-hover:translate-x-1 transition" />
                </div>
                <h3 className="font-serif text-base font-normal text-[#231B18]">
                  Siparişlerim
                </h3>
                <p className="text-xs text-[#7A7067]">
                  Atölyeden verdiğiniz tüm el yapımı siparişlerinizi ve canlı üretim aşamalarını inceleyin.
                </p>
              </Link>

              <Link
                href="/favoriler"
                className="p-5 rounded-xs border border-stone-200 bg-white hover:border-[#231B18] transition group space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xs bg-[#FAF8F5] border border-stone-200 flex items-center justify-center text-[#C85A32]">
                    <Heart className="w-5 h-5" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-[#231B18] group-hover:translate-x-1 transition" />
                </div>
                <h3 className="font-serif text-base font-normal text-[#231B18]">
                  Favorilerim ({favoritesCount})
                </h3>
                <p className="text-xs text-[#7A7067]">
                  Beğendiğiniz mumları, Miyuki takıları ve epoksi sunumlukları tek bir yerde saklayın.
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
