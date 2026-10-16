'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Settings,
  ExternalLink,
  Menu,
  X,
  ChevronRight,
  Receipt,
  Layers,
  MessageSquareQuote,
  Package,
  Plus,
  Megaphone,
  Image as ImageIcon,
  LogOut,
  ShieldCheck,
  Printer,
  Boxes,
  BarChart3,
  Crown,
} from 'lucide-react';

import { AdminProvider, useAdmin } from '@/context/AdminContext';

function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { orders, abandonedCarts, quoteRequests, products, settings } = useAdmin();

  // Giriş sayfalarında admin çerçevesini gizle
  const isLoginPage = pathname === '/admin/giris' || pathname === '/admin/login';
  if (isLoginPage) {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    if (confirm('Yönetim panelinden güvenli çıkış yapmak istediğinize emin misiniz?')) {
      try {
        await fetch('/api/admin/auth/logout', { method: 'POST' });
      } catch {}
      window.location.href = '/admin/giris';
    }
  };

  // Kurtarılmamış sepetler
  const activeAbandonedCarts = abandonedCarts.filter((c) => !c.recovered).length;
  // Bekleyen özel teklif talepleri
  const pendingQuotesCount = (quoteRequests || []).filter((q) => q.status === 'BEKLEMEDE').length;
  // Hazırlık / üretim aşamasındaki aktif siparişler
  const inProductionCount = orders.filter(
    (o) => o.stage === 'ATOLYEDE_URETIMDE' || o.stage === 'SIPARIS_ALINDI'
  ).length;

  // Sadeleştirilmiş, son kullanıcı ve butik mağaza odaklı menü
  const navItems = [
    {
      title: 'Genel Bakış',
      href: '/admin',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      title: 'Gelişmiş Analitik',
      href: '/admin/analitik',
      icon: BarChart3,
      badge: 'Canlı',
      badgeColor: 'bg-emerald-600 text-white',
    },
    {
      title: 'Siparişler',
      href: '/admin/siparisler',
      icon: Receipt,
      badge: inProductionCount > 0 ? `${inProductionCount} Aktif` : null,
      badgeColor: 'bg-[#C85A32] text-white',
    },
    {
      title: 'Ürün Kataloğu',
      href: '/admin/urunler',
      icon: Package,
      badge: products.length > 0 ? `${products.length}` : null,
      badgeColor: 'bg-white/10 text-stone-300',
    },
    {
      title: 'Üretim Bandı',
      href: '/admin/uretim-bandi',
      icon: Layers,
      badge: inProductionCount > 0 ? `${inProductionCount}` : null,
      badgeColor: 'bg-[#5F6F52] text-white',
    },
    {
      title: 'Etiket Montajlama',
      href: '/admin/etiket-montaj',
      icon: Printer,
      badge: 'A4',
      badgeColor: 'bg-orange-600 text-white',
    },
    {
      title: 'Silikon Kalıp & Kapasite',
      href: '/admin/kalip-takip',
      icon: Boxes,
      badge: null,
    },
    {
      title: 'Özel Talepler & Teklifler',
      href: '/admin/ozel-talepler',
      icon: MessageSquareQuote,
      badge: pendingQuotesCount > 0 ? `${pendingQuotesCount} Yeni` : null,
      badgeColor: 'bg-amber-600 text-white',
    },
    {
      title: 'Müşteri & Tedarikçi (Cari)',
      href: '/admin/cariler',
      icon: Users,
      badge: null,
    },
    {
      title: 'Pazarlama & Kuponlar',
      href: '/admin/pazarlama',
      icon: Megaphone,
      badge: activeAbandonedCarts > 0 ? `${activeAbandonedCarts} Sepet` : null,
      badgeColor: 'bg-rose-600 text-white',
    },
    {
      title: 'Sadakat & Atölye Kulübü',
      href: '/admin/sadakat',
      icon: Crown,
      badge: 'VIP',
      badgeColor: 'bg-amber-600 text-white',
    },
    {
      title: 'Vitrin & Konsept Tasarımı',
      href: '/admin/konsept-tasarimlari',
      icon: ImageIcon,
      badge: null,
      badgeColor: null,
    },
    {
      title: 'Mağaza & ERP Ayarları',
      href: '/admin/ayarlar',
      icon: Settings,
      badge: null,
    },
  ];

  const isItemActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    if (href === '/admin/urunler') return pathname === '/admin/urunler' || pathname.startsWith('/admin/urunler/');
    if (href === '/admin/siparisler') return pathname === '/admin/siparisler' || pathname.startsWith('/admin/siparisler/');
    return pathname.startsWith(href);
  };

  const activeTitle = navItems.find((item) => isItemActive(item.href))?.title || 'Yönetim';

  return (
    <div className="min-h-screen bg-[#F6F3EC] text-[#231B18] flex flex-col lg:flex-row font-sans selection:bg-[#C85A32]/20 print:bg-white print:block">
      
      {/* 1. MASAÜSTÜ SOL MENÜ (Derin Espresso #231B18) */}
      <aside className="no-print hidden lg:flex lg:flex-col w-64 bg-[#231B18] text-white shrink-0 border-r border-[#2C221E] shadow-xl">
        
        {/* Logo & Marka */}
        <div className="p-6 border-b border-white/5">
          <Link href="/admin" className="flex items-center gap-3 group">
            {settings?.logoUrl ? (
              <div className="flex flex-col">
                <img
                  src={settings.logoDarkUrl || settings.logoUrl}
                  alt={settings.logoText || 'Safirya'}
                  className="h-8 w-auto max-w-[130px] object-contain transition group-hover:opacity-90"
                />
                <span className="text-[10px] tracking-widest text-[#C85A32] uppercase font-bold mt-1.5">
                  Yönetim Portalı
                </span>
              </div>
            ) : (
              <div>
                <span className="font-serif text-xl tracking-wider text-[#F6F3EC] font-normal block">
                  {settings?.logoText || 'SAFİRYA'}
                </span>
                <span className="text-[9px] tracking-widest text-[#C85A32] uppercase font-semibold block mt-0.5">
                  Atölye Yönetimi
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Menü Linkleri */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          <div className="text-[10px] uppercase tracking-widest text-stone-400 px-3 pb-2 font-medium">
            Mağaza Yönetimi
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = isItemActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#C85A32] text-white shadow-xs'
                    : 'text-stone-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 transition ${
                      isActive ? 'text-white' : 'text-stone-400 group-hover:text-white'
                    }`}
                  />
                  <span>{item.title}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-sm ${
                      item.badgeColor || 'bg-white/10 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Alt Bilgi, Vitrine Geçiş & Çıkış */}
        <div className="p-4 border-t border-white/5 space-y-2 bg-[#1C1513]">
          <Link
            href="/"
            target="_blank"
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-medium text-stone-300 bg-white/5 hover:bg-white/10 hover:text-white border border-white/5 transition"
          >
            <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
            <span>Müşteri Vitrinini Aç</span>
          </Link>

          <div className="flex items-center justify-between gap-2 px-1 pt-2">
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-7 h-7 rounded-full bg-[#C85A32]/20 border border-[#C85A32]/40 flex items-center justify-center text-[#C85A32] font-semibold text-xs shrink-0">
                S
              </div>
              <div className="truncate">
                <div className="text-xs font-medium text-stone-200 truncate">
                  Safirya Atölye
                </div>
                <div className="text-[10px] text-stone-400 truncate">
                  {settings?.contactEmail || 'admin@safirya.tr'}
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-md hover:bg-white/10 text-stone-400 hover:text-rose-400 transition shrink-0 cursor-pointer"
              title="Güvenli Çıkış Yap"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. MOBİL ÜST BAR */}
      <div className="no-print lg:hidden bg-[#231B18] text-white p-4 flex items-center justify-between border-b border-[#2C221E] sticky top-0 z-40">
        <Link href="/admin" className="flex items-center gap-2">
          {settings?.logoUrl ? (
            <img
              src={settings.logoDarkUrl || settings.logoUrl}
              alt={settings.logoText || 'Safirya'}
              className="h-7 w-auto max-w-[120px] object-contain"
            />
          ) : (
            <span className="font-serif text-lg tracking-wider text-[#F6F3EC]">
              {settings?.logoText || 'SAFİRYA'}
            </span>
          )}
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLogout}
            className="p-2 rounded-md bg-white/5 text-stone-300 hover:text-rose-400 transition"
            title="Çıkış Yap"
          >
            <LogOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-md bg-white/5 text-white hover:bg-white/10 transition"
            aria-label="Menüyü Aç"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobil Açılır Menü */}
      {isMobileMenuOpen && (
        <div className="no-print lg:hidden bg-[#231B18] text-white border-b border-[#2C221E] px-4 py-3 space-y-1 z-40">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = isItemActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium ${
                  isActive ? 'bg-[#C85A32] text-white' : 'text-stone-300 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.title}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-sm ${
                      item.badgeColor || 'bg-white/10 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-3 border-t border-white/5 flex items-center justify-between">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-2 py-2 text-xs text-stone-300 hover:text-white"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Müşteri Vitrinini Aç</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 py-2 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Çıkış</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. ANA İÇERİK ALANI */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto print:overflow-visible print:block print:w-full print:m-0 print:p-0">
        
        {/* Üst Bar (Masaüstü Breadcrumb & Hızlı Eylemler) */}
        <header className="no-print hidden lg:flex items-center justify-between h-16 px-8 bg-white border-b border-[#E2DCD3] sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
            <Link href="/admin" className="hover:text-[#C85A32] transition">
              Safirya Panel
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-[#231B18] font-semibold">
              {activeTitle}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium mr-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Güvenli Oturum</span>
            </div>

            <Link
              href="/admin/urunler/yeni"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md border border-[#E2DCD3] bg-[#FAF8F5] hover:border-[#231B18] text-[#231B18] text-xs font-medium transition"
            >
              <Plus className="w-3.5 h-3.5 text-[#C85A32]" />
              <span>Yeni Ürün Ekle</span>
            </Link>

            <Link
              href="/admin/siparisler/yeni"
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-[#C85A32] hover:bg-[#B34E2A] text-white text-xs font-medium transition shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Yeni Sipariş Gir</span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-medium transition ml-1 cursor-pointer"
              title="Yönetim Panelinden Çıkış Yap"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Çıkış</span>
            </button>
          </div>
        </header>

        {/* Sayfa İçeriği */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      <AdminShell>{children}</AdminShell>
    </AdminProvider>
  );
}
