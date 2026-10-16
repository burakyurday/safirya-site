'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  Heart,
  User,
  ShoppingBag,
  ChevronDown,
  Menu,
  X,
  Bell,
  ArrowRight,
  LogOut,
  Package,
  KeyRound,
  UserPlus,
  LogIn,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { CategoryItem } from '@/lib/catalog';
import { NotificationDropdown } from '@/components/layout/NotificationDropdown';

interface HeaderProps {
  categories: CategoryItem[];
}

export function Header({ categories }: HeaderProps) {
  const {
    cartCount,
    favoritesCount,
    setIsCartOpen,
    setIsSearchOpen,
    currentUser,
    logoutUser,
    setIsAuthModalOpen,
    setAuthModalView,
    unreadNotificationsCount,
  } = useStore();

  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const [brandLogo, setBrandLogo] = useState<string | null>(null);
  const [brandText, setBrandText] = useState('SAFİRYA');

  const userMenuRef = useRef<HTMLDivElement>(null);

  // Logo yükleme
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const logo = localStorage.getItem('safirya_brand_logo');
      const text = localStorage.getItem('safirya_brand_logo_text');
      if (logo) setBrandLogo(logo);
      if (text) setBrandText(text);
    }
  }, []);

  // Kullanıcı menüsü dışına tıklandığında kapatma
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-stone-200/70 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Mobil Menü Butonu */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xs text-[#231B18] hover:bg-[#FAF8F5] transition"
              aria-label="Menüyü Aç"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="group flex items-center gap-2">
              {brandLogo ? (
                <Image
                  src={brandLogo}
                  alt={brandText}
                  width={190}
                  height={40}
                  className="h-8 sm:h-10 w-auto object-contain transition-transform group-hover:scale-102"
                />
              ) : (
                <span className="font-serif text-2xl sm:text-[1.85rem] font-medium tracking-[0.25em] text-[#231B18] group-hover:text-[#C85A32] transition-colors uppercase">
                  {brandText}
                </span>
              )}
            </Link>
          </div>

          {/* Orta Ana Menü */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-3">
            {/* 1. SOFRA & KOKU / KATEGORİLER */}
            <div
              className="relative"
              onMouseEnter={() => setIsCategoryMenuOpen(true)}
              onMouseLeave={() => setIsCategoryMenuOpen(false)}
            >
              <button
                className={`flex items-center gap-1 px-3 py-2 text-xs uppercase tracking-widest font-medium transition-colors ${
                  isCategoryMenuOpen
                    ? 'text-[#C85A32]'
                    : 'text-[#231B18] hover:text-[#C85A32]'
                }`}
              >
                <span>SOFRA & YAŞAM</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    isCategoryMenuOpen ? 'rotate-180 text-[#C85A32]' : 'text-stone-400'
                  }`}
                />
              </button>

              {/* Koleksiyonlar Dropdown */}
              {isCategoryMenuOpen && (
                <div className="absolute top-full left-0 w-80 pt-2 z-50">
                  <div className="bg-white rounded-xs shadow-xl border border-stone-200 p-3 space-y-1 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7A7067]">
                      Kategoriler
                    </div>
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/kategoriler/${cat.slug}`}
                        onClick={() => setIsCategoryMenuOpen(false)}
                        className="flex items-center justify-between p-2.5 rounded-xs hover:bg-[#FAF8F5] transition group border border-transparent"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-serif font-medium text-[#231B18] group-hover:text-[#C85A32] transition">
                            {cat.name}
                          </p>
                          {cat.description && (
                            <p className="text-[11px] text-[#7A7067] line-clamp-1 mt-0.5">
                              {cat.description}
                            </p>
                          )}
                        </div>
                        <ArrowRight className="w-3 h-3 text-[#7A7067] group-hover:text-[#C85A32] group-hover:translate-x-0.5 transition" />
                      </Link>
                    ))}
                    <div className="pt-2 border-t border-stone-100 px-2">
                      <Link
                        href="/kategoriler"
                        onClick={() => setIsCategoryMenuOpen(false)}
                        className="text-[11px] font-medium uppercase tracking-wider text-[#C85A32] hover:underline flex items-center justify-between py-1"
                      >
                        <span>Tüm Kategorilere Göz At</span>
                        <span>→</span>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. DOĞAL MUMLAR */}
            <Link
              href="/kategoriler/dogal-mumlar"
              className="px-3 py-2 text-xs uppercase tracking-widest font-medium text-[#231B18] hover:text-[#C85A32] transition-colors"
            >
              MUTFAK & DEKOR
            </Link>

            {/* 3. EV & YAŞAM */}
            <Link
              href="/kategoriler/epoksi-tasarimlar"
              className="px-3 py-2 text-xs uppercase tracking-widest font-medium text-[#231B18] hover:text-[#C85A32] transition-colors"
            >
              EV & YAŞAM
            </Link>

            {/* 4. HEDİYE SETLERİ */}
            <Link
              href="/kisiye-ozel-toplu-siparis"
              className="px-3 py-2 text-xs uppercase tracking-widest font-medium text-[#231B18] hover:text-[#C85A32] transition-colors"
            >
              HEDİYE SETLERİ
            </Link>

            {/* 5. KOLEKSİYONLAR */}
            <Link
              href="/cok-satanlar"
              className="px-3 py-2 text-xs uppercase tracking-widest font-medium text-[#231B18] hover:text-[#C85A32] transition-colors"
            >
              KOLEKSİYONLAR
            </Link>
          </nav>

          {/* Sağ Aksiyon İkonları (Arama, Bildirimler, Hesap, Favoriler, Sepet) */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            
            {/* 1. Bildirim Zili - SADECE GİRİŞ YAPILMIŞSA GÖRÜNÜR */}
            {currentUser && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="p-2 text-[#231B18] hover:text-[#C85A32] transition relative group"
                  title="Bildirimler"
                  aria-label="Bildirimler"
                >
                  <Bell className="w-5 h-5 stroke-[1.4]" />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute top-1 right-1 bg-[#C85A32] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                      {unreadNotificationsCount}
                    </span>
                  )}
                </button>

                {/* Bildirim Paneli */}
                {isNotificationOpen && (
                  <NotificationDropdown onClose={() => setIsNotificationOpen(false)} />
                )}
              </div>
            )}

            {/* 2. Arama */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-[#231B18] hover:text-[#C85A32] transition"
              aria-label="Arama"
              title="Ürün Ara"
            >
              <Search className="w-5 h-5 stroke-[1.4]" />
            </button>

            {/* 3. Kullanıcı Hesabı & Dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="p-2 text-[#231B18] hover:text-[#C85A32] transition flex items-center gap-1"
                aria-label="Hesap Menüsü"
                title={currentUser ? currentUser.name : 'Giriş Yap / Kayıt Ol'}
              >
                {currentUser ? (
                  <div className="w-6 h-6 rounded-full bg-[#231B18] text-[#F6F3EC] flex items-center justify-center text-xs font-semibold">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                ) : (
                  <User className="w-5 h-5 stroke-[1.4]" />
                )}
              </button>

              {/* Kullanıcı Menüsü Açılır Kartı */}
              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xs shadow-2xl border border-stone-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150 text-[#231B18]">
                  {currentUser ? (
                    /* Giriş Yapılmış Durum */
                    <div>
                      <div className="p-3.5 bg-[#FAF8F5] border-b border-stone-200">
                        <p className="font-serif text-sm font-medium text-[#231B18] truncate">
                          {currentUser.name}
                        </p>
                        <p className="text-[11px] text-[#7A7067] truncate mt-0.5">
                          {currentUser.email}
                        </p>
                      </div>

                      <div className="p-1 space-y-0.5 text-xs">
                        <Link
                          href="/hesabim/siparislerim"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xs hover:bg-[#FAF8F5] transition text-[#231B18]"
                        >
                          <Package className="w-4 h-4 text-[#C85A32]" />
                          <span>Siparişlerim</span>
                        </Link>
                        <Link
                          href="/favoriler"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xs hover:bg-[#FAF8F5] transition text-[#231B18]"
                        >
                          <Heart className="w-4 h-4 text-[#C85A32]" />
                          <span>Favorilerim ({favoritesCount})</span>
                        </Link>
                      </div>

                      <div className="p-1 border-t border-stone-100">
                        <button
                          type="button"
                          onClick={() => {
                            logoutUser();
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xs hover:bg-red-50 text-red-600 transition text-xs font-medium cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Çıkış Yap</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Giriş Yapılmamış Durum - Giriş, Kayıt ve Şifre Sıfırlama Seçenekleri */
                    <div className="p-3 space-y-3">
                      <div className="text-center pb-2 border-b border-stone-100">
                        <p className="font-serif text-sm font-medium text-[#231B18]">
                          Safirya Hesabım
                        </p>
                        <p className="text-[11px] text-[#7A7067] mt-0.5">
                          Atölye ayrıcalıklarından yararlanın
                        </p>
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setAuthModalView('login');
                            setIsAuthModalOpen(true);
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full flex items-center justify-center gap-2 py-2 rounded-xs bg-[#231B18] text-white hover:bg-[#C85A32] transition font-medium uppercase tracking-wider text-[11px] cursor-pointer"
                        >
                          <LogIn className="w-3.5 h-3.5" />
                          <span>Giriş Yap</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setAuthModalView('register');
                            setIsAuthModalOpen(true);
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full flex items-center justify-center gap-2 py-2 rounded-xs border border-stone-300 hover:border-[#231B18] text-[#231B18] hover:bg-[#FAF8F5] transition font-medium uppercase tracking-wider text-[11px] cursor-pointer"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Kayıt Ol</span>
                        </button>

                        <div className="pt-1 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setAuthModalView('forgot_password');
                              setIsAuthModalOpen(true);
                              setIsUserMenuOpen(false);
                            }}
                            className="text-[11px] text-[#7A7067] hover:text-[#C85A32] hover:underline flex items-center justify-center gap-1 mx-auto cursor-pointer"
                          >
                            <KeyRound className="w-3 h-3" />
                            <span>Şifremi Unuttum</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 4. Favoriler */}
            <Link
              href="/favoriler"
              className="p-2 text-[#231B18] hover:text-[#C85A32] transition relative group"
              aria-label="Favorilerim"
              title="Favorilerim"
            >
              <Heart className="w-5 h-5 stroke-[1.4] group-hover:scale-105 transition-transform" />
              {favoritesCount > 0 && (
                <span className="absolute top-1 right-1 bg-[#C85A32] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-medium">
                  {favoritesCount}
                </span>
              )}
            </Link>

            {/* 5. Sepet Çantası */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="p-2 text-[#231B18] hover:text-[#C85A32] transition relative group"
              aria-label="Sepetim"
              title="Sepetim"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.4] group-hover:scale-105 transition-transform" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-[#C85A32] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-medium">
                  {cartCount}
                </span>
              )}
            </button>

          </div>
        </div>
      </div>

      {/* Mobil Menü Çekmecesi */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-6 space-y-4">
          {/* Mobil Kullanıcı Alanı */}
          <div className="p-3 bg-[#FAF8F5] rounded-xs border border-stone-200 flex items-center justify-between">
            {currentUser ? (
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#231B18] text-[#F6F3EC] flex items-center justify-center font-semibold text-xs">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#231B18]">{currentUser.name}</p>
                  <p className="text-[10px] text-[#7A7067]">{currentUser.email}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#7A7067]" />
                <span className="text-xs text-[#231B18] font-medium">Giriş Yapılmadı</span>
              </div>
            )}

            {currentUser ? (
              <button
                type="button"
                onClick={() => {
                  logoutUser();
                  setIsMobileMenuOpen(false);
                }}
                className="text-[11px] text-red-600 font-medium hover:underline"
              >
                Çıkış Yap
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalView('login');
                    setIsAuthModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="px-2.5 py-1 text-[10px] uppercase font-medium bg-[#231B18] text-white rounded-xs"
                >
                  Giriş Yap
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalView('register');
                    setIsAuthModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="px-2.5 py-1 text-[10px] uppercase font-medium border border-stone-300 text-[#231B18] rounded-xs"
                >
                  Kayıt Ol
                </button>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7A7067]">
              Koleksiyonlar
            </div>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/kategoriler/${cat.slug}`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-xs text-xs font-serif text-[#231B18] hover:bg-[#FAF8F5] transition"
              >
                <span>{cat.name}</span>
                <ArrowRight className="w-3 h-3 text-[#7A7067]" />
              </Link>
            ))}
            <div className="pt-2 border-t border-stone-100 space-y-1">
              <Link
                href="/cok-satanlar"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 text-xs uppercase tracking-wider text-[#231B18] hover:text-[#C85A32]"
              >
                Çok Satanlar
              </Link>
              <Link
                href="/kisiye-ozel-toplu-siparis"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 text-xs uppercase tracking-wider text-[#231B18] hover:text-[#C85A32]"
              >
                Özel & Toplu Sipariş
              </Link>
              <Link
                href="/hesabim/siparislerim"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 text-xs uppercase tracking-wider text-[#231B18] hover:text-[#C85A32]"
              >
                Siparişlerim & Takip
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
