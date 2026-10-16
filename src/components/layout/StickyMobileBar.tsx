'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, MessageCircle, Layers, Heart, Home, ShieldCheck } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { SystemSettingsData } from '@/lib/settings';

interface Props {
  settings: SystemSettingsData;
}

export function StickyMobileBar({ settings }: Props) {
  const pathname = usePathname();
  const { cartCount, favoritesCount, setIsCartOpen, currentUser } = useStore();

  // Admin sayfalarında veya ödeme sayfasında alt çubuğu gizle
  if (pathname?.startsWith('/admin') || pathname === '/odeme' || pathname === '/tesekkurler') {
    return null;
  }

  const isProductPage = pathname?.startsWith('/urunler/');

  // Eğer ürün sayfasındaysa, ürün sayfasının kendi özel "Sepete Ekle" çubuğu gösterilir
  // (veya genel çubuk onunla uyumlu çalışır).
  if (isProductPage) {
    return null;
  }

  const whatsappCleanNumber = (settings.whatsappNumber || '+905438981639').replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${whatsappCleanNumber}?text=${encodeURIComponent(
    'Merhaba, Safirya atölyenizden ürünler ve kişiye özel sipariş hakkında bilgi almak istiyorum.'
  )}`;

  const isAdmin = Boolean(currentUser && (currentUser.isAdmin || currentUser.role === 'ADMIN'));

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#F6F3EC]/95 backdrop-blur-md border-t border-[#E2DCD3] px-3 py-2 shadow-lg md:hidden transition-transform duration-300"
      role="navigation"
      aria-label="Mobil Hızlı Eylemler"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Anasayfa */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center p-1.5 transition ${
            pathname === '/' ? 'text-[#C85A32]' : 'text-[#231B18]/70 hover:text-[#231B18]'
          }`}
        >
          <Home className="w-4.5 h-4.5 stroke-[1.5]" />
          <span className="text-[9px] font-medium uppercase tracking-wider mt-1">Anasayfa</span>
        </Link>

        {/* Kategoriler */}
        <Link
          href="/kategoriler"
          className={`flex flex-col items-center justify-center p-1.5 transition ${
            pathname?.startsWith('/kategoriler')
              ? 'text-[#C85A32]'
              : 'text-[#231B18]/70 hover:text-[#231B18]'
          }`}
        >
          <Layers className="w-4.5 h-4.5 stroke-[1.5]" />
          <span className="text-[9px] font-medium uppercase tracking-wider mt-1">Koleksiyon</span>
        </Link>

        {/* Orta Buton: Admin Girişinde Yönetim Paneline Geçiş Butonu, Normal Ziyaretçide WhatsApp Canlı Destek */}
        {isAdmin ? (
          <a
            href="/api/admin/auth/switch"
            className="flex flex-col items-center justify-center p-1.5 -mt-3.5 group"
            aria-label="Yönetim Paneline Geçiş Yap"
            title="Yönetim Paneline Giriş Yap"
          >
            <div className="w-11 h-11 rounded-full bg-[#231B18] text-[#C85A32] border border-[#C85A32]/40 flex items-center justify-center shadow-md group-active:scale-95 transition-transform">
              <ShieldCheck className="w-5 h-5 stroke-[1.8]" />
            </div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#C85A32] mt-1">Admin Panel</span>
          </a>
        ) : (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center p-1.5 -mt-3.5 group"
            aria-label="WhatsApp Canlı Destek"
          >
            <div className="w-11 h-11 rounded-full bg-[#5F6F52] text-white flex items-center justify-center shadow-md group-active:scale-95 transition-transform">
              <MessageCircle className="w-5 h-5 fill-current" />
            </div>
            <span className="text-[9px] font-medium uppercase tracking-wider text-[#5F6F52] mt-1">WhatsApp</span>
          </a>
        )}

        {/* Favoriler */}
        <Link
          href="/favoriler"
          className={`flex flex-col items-center justify-center p-1.5 transition relative ${
            pathname === '/favoriler' ? 'text-[#C85A32]' : 'text-[#231B18]/70 hover:text-[#231B18]'
          }`}
        >
          <div className="relative">
            <Heart className="w-4.5 h-4.5 stroke-[1.5]" />
            {favoritesCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#C85A32] text-white text-[9px] w-3.5 h-3.5 rounded-xs flex items-center justify-center font-medium">
                {favoritesCount}
              </span>
            )}
          </div>
          <span className="text-[9px] font-medium uppercase tracking-wider mt-1">Favoriler</span>
        </Link>

        {/* Sepetim */}
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="flex flex-col items-center justify-center p-1.5 text-[#231B18]/70 hover:text-[#231B18] transition relative"
          aria-label="Sepeti Aç"
        >
          <div className="relative">
            <ShoppingBag className="w-4.5 h-4.5 stroke-[1.5] text-[#231B18]" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#C85A32] text-white text-[9px] w-3.5 h-3.5 rounded-xs flex items-center justify-center font-medium">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[9px] font-medium uppercase tracking-wider text-[#231B18] mt-1">Sepet</span>
        </button>
      </div>
    </div>
  );
}
