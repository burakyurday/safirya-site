'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { TopBar } from '@/components/layout/TopBar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { LiveSearchModal } from '@/components/layout/LiveSearchModal';
import { CartDrawer } from '@/components/layout/CartDrawer';
import { ExitIntentModal } from '@/components/marketing/ExitIntentModal';
import { StickyMobileBar } from '@/components/layout/StickyMobileBar';
import { CookieBanner } from '@/components/layout/CookieBanner';
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics';
import { SystemSettingsData } from '@/lib/settings';
import { CategoryItem } from '@/lib/catalog';

interface Props {
  children: React.ReactNode;
  settings: SystemSettingsData;
  categories: CategoryItem[];
}

export function StorefrontShell({ children, settings, categories }: Props) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) {
    // Admin rotalarında mağaza header/footer'ı gösterilmez
    return <>{children}</>;
  }

  return (
    <>
      {/* 0. Analytics Entegrasyonu */}
      <GoogleAnalytics />

      {/* 1. Üst Duyuru Bandı */}
      <TopBar settings={settings} />

      {/* 2. Ana Header */}
      <Header categories={categories} />

      {/* Ana Sayfa İçeriği - Mobil alt çubuk payı için pb-16 md:pb-0 */}
      <main className="flex-1 w-full pb-16 md:pb-0">{children}</main>

      {/* 3. Footer */}
      <Footer settings={settings} />

      {/* 4. Sabit Mobil CTA Çubuğu */}
      <StickyMobileBar settings={settings} />

      {/* 5. Modallar, Çekmeceler ve Bildirimler */}
      <LiveSearchModal />
      <CartDrawer
        freeShippingThreshold={settings.freeShippingThreshold}
        giftWrapFee={settings.giftWrapFee}
      />
      <ExitIntentModal settings={settings} />
      <CookieBanner />
    </>
  );
}
