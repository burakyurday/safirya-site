'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Truck,
  Lock,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { ProductCard } from '@/components/catalog/ProductCard';
import { JsonLd, getFaqSchema } from '@/components/seo/JsonLd';
import { initialConceptBanners } from '@/context/AdminContext';
import { ConceptBannersMap, ConceptBannerItem } from '@/types/admin';
import { getClientCatalogProducts, CatalogProductItem } from '@/lib/catalog';

// ── SSS (FAQ) Verileri ──
const HOME_FAQS = [
  {
    question: 'Soya mumu ile geleneksel parafin mumu arasındaki fark nedir?',
    answer:
      'Soya mumları %100 doğal soya fasulyesi yağından elde edilir. Petrol türevi olan parafin mumlarının aksine toksik madde, siyah is veya kanserojen kurum yaymaz. %30 ila %50 daha uzun süre temiz yanar ve evcil hayvan dostudur.',
  },
  {
    question: 'Söz, nişan ve nikah için toplu siparişlerde hazırlık süreci nasıldır?',
    answer:
      '10 adetten 500+ adede kadar toplu siparişlerinizde atölyemiz 1-3 iş günü içerisinde numune ve üretim sürecini tamamlar. Kişiye özel isim etiketi, koku seçimi ve kraft hediye kutulaması tamamen ücretsiz olarak sunulur.',
  },
  {
    question: 'Kırılabilir ürünlerde kargo hasar garantiniz var mı?',
    answer:
      'Evet. Tüm siparişlerimiz darbe emici hava yastıklı ambalajlarla paketlenir. Kargo sürecinde ezilme veya kırılma olması halinde, hiçbir ek ücret talep edilmeksizin hasarlı ürünün yerine yenisi 24 saat içinde kargoya verilir.',
  },
  {
    question: 'Atölyenizden siparişleri elden teslim alabilir miyiz?',
    answer:
      'Safirya atölyemiz İzmir Karşıyaka merkezli olup yalnızca online e-ticaret üzerinden hizmet vermektedir. Fiziksel mağazamız veya elden teslimatımız bulunmamaktadır; tüm el emeği siparişleriniz sigortalı ve koruyucu özel ambalajında doğrudan adresinize kargo ile ulaştırılmaktadır.',
  },
];

const faqSchemaData = getFaqSchema(HOME_FAQS);

export default function HomePage() {
  const [banners, setBanners] = useState<ConceptBannersMap>(initialConceptBanners);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [products, setProducts] = useState<CatalogProductItem[]>([]);

  // Dinamik Katalog & Supabase Bulut / LocalStorage Senkronizasyonu
  useEffect(() => {
    setProducts(getClientCatalogProducts());

    if (typeof window !== 'undefined') {
      // 1. Önce localStorage'dan hızlıca yükle (anlık gösterim)
      const saved = localStorage.getItem('safirya_concept_banners');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setBanners({ ...initialConceptBanners, ...parsed });
        } catch {}
      }

      // 2. Ardından sunucudan / buluttan (Supabase) en güncel bannerları çek (Tüm cihazlar & Mobil eşitlenir)
      fetch('/api/banners')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.banners && Object.keys(data.banners).length > 0) {
            setBanners((prev) => {
              const updated = { ...prev, ...data.banners };
              try {
                localStorage.setItem('safirya_concept_banners', JSON.stringify(updated));
              } catch {}
              return updated;
            });
          }
        })
        .catch((err) => {
          console.warn('Bulut banner senkronizasyon hatası:', err);
        });

      const handleUpdate = (e: Event) => {
        const customEvent = e as CustomEvent<ConceptBannersMap>;
        if (customEvent.detail) {
          setBanners(customEvent.detail);
        }
      };

      const handleProductsUpdate = () => {
        setProducts(getClientCatalogProducts());
      };

      window.addEventListener('safirya_concept_banners_updated', handleUpdate);
      window.addEventListener('safirya_products_updated', handleProductsUpdate);
      return () => {
        window.removeEventListener('safirya_concept_banners_updated', handleUpdate);
        window.removeEventListener('safirya_products_updated', handleProductsUpdate);
      };
    }
  }, []);

  const hero = banners.hero || initialConceptBanners.hero;
  const cat1 = banners.category_1 || initialConceptBanners.category_1;
  const cat2 = banners.category_2 || initialConceptBanners.category_2;
  const cat3 = banners.category_3 || initialConceptBanners.category_3;
  const show1 = banners.showcase_1 || initialConceptBanners.showcase_1;
  const show2 = banners.showcase_2 || initialConceptBanners.showcase_2;

  // Seçilmiş ve Vitrin Ürünleri
  const selectedProducts = products.length > 0 ? products : [];

  const showcase1CategorySlug = show1.categorySlug || 'dogal-mumlar';
  let showcase1Products = products
    .filter((p) => p.categorySlug === showcase1CategorySlug || p.categoryName?.toLowerCase().includes('mum'))
    .slice(0, 3);
  if (showcase1Products.length === 0) {
    showcase1Products = products.slice(0, 3);
  }

  const showcase2CategorySlug = show2.categorySlug || 'epoksi-tasarimlar';
  let showcase2Products = products
    .filter(
      (p) =>
        p.categorySlug === showcase2CategorySlug ||
        p.categorySlug === 'kokulu-tas' ||
        p.categorySlug === 'miyuki-taki' ||
        p.categoryName?.toLowerCase().includes('epoksi') ||
        p.categoryName?.toLowerCase().includes('taş')
    )
    .slice(0, 3);
  if (showcase2Products.length === 0) {
    showcase2Products = products.slice(3, 6).length > 0 ? products.slice(3, 6) : products.slice(0, 3);
  }

  // Carousel kontrol fonksiyonları
  const nextSlide = () => {
    if (selectedProducts.length <= 4) return;
    setCarouselIndex((prev) => (prev + 1 >= selectedProducts.length - 3 ? 0 : prev + 1));
  };
  const prevSlide = () => {
    if (selectedProducts.length <= 4) return;
    setCarouselIndex((prev) => (prev - 1 < 0 ? Math.max(0, selectedProducts.length - 4) : prev - 1));
  };

  return (
    <div className="bg-white text-[#231B18] pb-20 space-y-12 sm:space-y-16">

      {/* ════════════════════════════════════════════════════════════════
          1. KONSEPT ALANI 1: ANA HERO BANNER
      ════════════════════════════════════════════════════════════════ */}
      <section className="w-full">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          
          {hero.imageUrl || hero.mobileImageUrl ? (
            /* Görsel Yüklüyse: Tam Ekran Konsept Banner */
            <div className="relative w-full overflow-hidden rounded-xs bg-stone-100 min-h-[380px] sm:min-h-[480px] lg:min-h-[540px] flex items-center group">
              <picture className="absolute inset-0 w-full h-full">
                {hero.mobileImageUrl && (
                  <source media="(max-width: 767px)" srcSet={hero.mobileImageUrl} />
                )}
                {hero.imageUrl && (
                  <source media="(min-width: 768px)" srcSet={hero.imageUrl} />
                )}
                <img
                  src={hero.imageUrl || hero.mobileImageUrl}
                  alt={hero.title || 'Safirya Banner'}
                  className="w-full h-full object-cover group-hover:scale-101 transition-transform duration-700"
                />
              </picture>
              <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-white/80 via-white/40 to-transparent sm:w-2/3" />
              
              <div className="relative z-10 p-6 sm:p-14 max-w-xl space-y-3 sm:space-y-4">
                {hero.tag && (
                  <span className="inline-block bg-[#C85A32] text-white text-[10px] sm:text-xs font-semibold tracking-widest uppercase px-3 py-1">
                    {hero.tag}
                  </span>
                )}
                <h1 className="font-serif text-2xl sm:text-5xl text-[#231B18] font-normal leading-tight">
                  {hero.title || 'SAFİRYA ATÖLYE'}
                </h1>
                {hero.subtitle && (
                  <p className="text-xs sm:text-sm text-[#54473F] max-w-md">
                    {hero.subtitle}
                  </p>
                )}
                <div className="pt-2">
                  <Link
                    href={hero.buttonLink || '/kategoriler'}
                    className="inline-block bg-[#231B18] hover:bg-[#C85A32] text-white text-xs uppercase tracking-widest font-medium px-6 sm:px-8 py-3 sm:py-3.5 rounded-none transition shadow-sm"
                  >
                    {hero.buttonText || 'ALIŞVERİŞE BAŞLA'}
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            /* Görsel Henüz Boşken: Sıcak ve Estetik Atölye Vitrin Alanı */
            <div className="w-full bg-gradient-to-br from-[#FAF8F5] via-[#F4EFE6] to-[#EDE7DC] border border-[#E2DCD3] rounded-xs p-8 sm:p-16 flex flex-col items-center justify-center text-center min-h-[340px] sm:min-h-[460px] relative overflow-hidden">
              <div className="relative z-10 max-w-2xl space-y-4">
                <span className="inline-block bg-[#C85A32] text-white text-[10px] sm:text-xs font-semibold tracking-widest uppercase px-3.5 py-1 rounded-xs">
                  {hero.tag || 'SAFİRYA ATÖLYESİ'}
                </span>
                <h1 className="font-serif text-3xl sm:text-5xl text-[#231B18] font-normal leading-tight">
                  {hero.title || 'El Emeği Zanaatkar Tasarımlar & Doğal Mumlar'}
                </h1>
                <p className="text-xs sm:text-sm text-[#7A7067] max-w-lg mx-auto leading-relaxed">
                  {hero.subtitle || 'İzmir Karşıyaka atölyemizde özenle hazırlanan %100 doğal soya mumları, kokulu taşlar, epoksi sunumluklar ve Miyuki takılar.'}
                </p>
                <div className="pt-3">
                  <Link
                    href={hero.buttonLink || '/kategoriler'}
                    className="inline-block bg-[#231B18] hover:bg-[#C85A32] text-white text-xs uppercase tracking-widest font-medium px-8 py-3.5 rounded-xs transition shadow-sm"
                  >
                    {hero.buttonText || 'KOLEKSİYONU KEŞFET'}
                  </Link>
                </div>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          2. GÜVEN ROZETLERİ (Garanti, Kargo, Güvenli - 3 Sütun)
      ════════════════════════════════════════════════════════════════ */}
      <section className="border-y border-stone-200/80 bg-[#FAF8F5]/60 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 divide-y md:divide-y-0 md:divide-x divide-stone-200">
            
            {/* 1. Kargo Hasar Garantisi */}
            <div className="flex items-center gap-4 pt-3 md:pt-0 md:px-4">
              <div className="w-11 h-11 rounded-full bg-white border border-stone-200 flex items-center justify-center text-[#C85A32] shrink-0 shadow-2xs">
                <ShieldCheck className="w-5 h-5 stroke-[1.8]" />
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#231B18]">
                  Kargo Hasar Garantisi
                </h2>
                <p className="text-xs text-[#7A7067] mt-0.5">
                  Özel korumalı ambalaj. Hasarlı gelen ürün anında yenisiyle değiştirilir.
                </p>
              </div>
            </div>

            {/* 2. ₺500 Üzeri Ücretsiz Kargo */}
            <div className="flex items-center gap-4 pt-3 md:pt-0 md:px-4">
              <div className="w-11 h-11 rounded-full bg-white border border-stone-200 flex items-center justify-center text-[#5F6F52] shrink-0 shadow-2xs">
                <Truck className="w-5 h-5 stroke-[1.8]" />
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#231B18]">
                  ₺500 Üzeri Ücretsiz Kargo
                </h2>
                <p className="text-xs text-[#7A7067] mt-0.5">
                  Atölye tazeliğinde 1-3 iş gününde özenle kargoya teslimat.
                </p>
              </div>
            </div>

            {/* 3. Güvenli Ödeme */}
            <div className="flex items-center gap-4 pt-3 md:pt-0 md:px-4">
              <div className="w-11 h-11 rounded-full bg-white border border-stone-200 flex items-center justify-center text-[#231B18] shrink-0 shadow-2xs">
                <Lock className="w-5 h-5 stroke-[1.8]" />
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#231B18]">
                  Güvenli Ödeme Altyapısı
                </h2>
                <p className="text-xs text-[#7A7067] mt-0.5">
                  256-Bit SSL şifreleme ve 3D Secure ile güvenli kartlı ödeme.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          3. KONSEPT ALANI 2: 3'LÜ KATEGORİ VİTRİNİ
      ════════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="text-center mb-8">
          <span className="text-[11px] font-sans uppercase tracking-[0.2em] text-[#C85A32] font-semibold block mb-1">
            ÖZEL ATÖLYE SEÇKİSİ
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#231B18] font-normal tracking-tight">
            Kategorilerimize Göz Atın
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {[
            { banner: cat1, fallbackTitle: 'Doğal Mumlar', defaultLink: '/kategoriler/dogal-mumlar' },
            { banner: cat2, fallbackTitle: 'Kokulu Taş & Seramik', defaultLink: '/kategoriler/kokulu-tas' },
            { banner: cat3, fallbackTitle: 'Epoksi & Takı', defaultLink: '/kategoriler/epoksi-tasarimlar' },
          ].map(({ banner, fallbackTitle, defaultLink }, idx) => (
            <div key={idx} className="group">
              
              {/* Kart Görsel Alanı (1:1 Kare) */}
              <div className="relative aspect-square w-full overflow-hidden rounded-xs bg-[#FAF8F5] border border-stone-200/80 flex items-center justify-center">
                {banner.imageUrl || banner.mobileImageUrl ? (
                  <>
                    <picture className="w-full h-full">
                      {banner.mobileImageUrl && (
                        <source media="(max-width: 767px)" srcSet={banner.mobileImageUrl} />
                      )}
                      {banner.imageUrl && (
                        <source media="(min-width: 768px)" srcSet={banner.imageUrl} />
                      )}
                      <img
                        src={banner.imageUrl || banner.mobileImageUrl}
                        alt={banner.title || fallbackTitle}
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700"
                      />
                    </picture>
                    <div className="absolute inset-0 bg-black/15 group-hover:bg-black/25 transition-colors" />
                    
                    {/* Görsel Üstü Buton */}
                    <div className="absolute inset-x-0 bottom-6 flex justify-center">
                      <Link
                        href={banner.buttonLink || defaultLink}
                        className="bg-white/95 text-[#231B18] hover:bg-white text-[11px] uppercase tracking-widest font-medium px-5 py-2.5 rounded-none shadow-sm transition"
                      >
                        {banner.buttonText || 'KOLEKSİYONU KEŞFET'}
                      </Link>
                    </div>
                  </>
                ) : (
                  <div className="p-8 text-center space-y-3 flex flex-col items-center justify-center h-full">
                    <div className="w-12 h-12 rounded-full bg-[#C85A32]/10 border border-[#C85A32]/20 flex items-center justify-center text-[#C85A32] mb-1">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <h3 className="font-serif text-lg text-[#231B18]">
                      {banner.title || fallbackTitle}
                    </h3>
                    <Link
                      href={banner.buttonLink || defaultLink}
                      className="bg-[#231B18] hover:bg-[#C85A32] text-white text-[11px] uppercase tracking-widest font-medium px-5 py-2.5 rounded-xs shadow-xs transition"
                    >
                      {banner.buttonText || 'İNCELE'}
                    </Link>
                  </div>
                )}
              </div>

              {/* Başlık (Kartın Altında) */}
              <div className="pt-3.5 text-center">
                <Link
                  href={banner.buttonLink || defaultLink}
                  className="font-serif text-sm sm:text-base text-[#231B18] hover:text-[#C85A32] transition-colors"
                >
                  {banner.title || fallbackTitle}
                </Link>
              </div>

            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          4. "SİZİN İÇİN SEÇTİKLERİMİZ" (Ürün Sliderı / Grid)
      ════════════════════════════════════════════════════════════════ */}
      {selectedProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="text-center mb-8">
            <h2 className="font-serif text-2xl sm:text-3xl text-[#231B18] font-normal tracking-tight">
              Sizin İçin Seçtiklerimiz
            </h2>
            <div className="w-12 h-0.5 bg-[#C85A32] mx-auto mt-2" />
          </div>

          <div className="relative">
            {/* Desktop Oklar */}
            {selectedProducts.length > 4 && (
              <>
                <button
                  onClick={prevSlide}
                  className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white border border-stone-200 shadow-md items-center justify-center text-[#231B18] hover:text-[#C85A32] transition cursor-pointer"
                  aria-label="Önceki Ürünler"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextSlide}
                  className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white border border-stone-200 shadow-md items-center justify-center text-[#231B18] hover:text-[#C85A32] transition cursor-pointer"
                  aria-label="Sonraki Ürünler"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Ürün Listesi */}
            <div className="overflow-x-auto md:overflow-hidden pb-4 md:pb-0 scrollbar-none">
              <div
                className="flex md:grid md:grid-cols-4 lg:grid-cols-5 gap-4 transition-transform duration-500 ease-out"
                style={{
                  transform:
                    typeof window !== 'undefined' && window.innerWidth >= 768 && selectedProducts.length > 4
                      ? `translateX(-${carouselIndex * 20}%)`
                      : 'none',
                }}
              >
                {selectedProducts.map((prod) => (
                  <div key={prod.id} className="min-w-[200px] sm:min-w-[220px] md:min-w-0 shrink-0">
                    <ProductCard product={prod} variant="simple" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════════════
          5. KONSEPT ALANI 3: VİTRİN 1 (Mum & Doğal Koleksiyon)
      ════════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
          
          {/* Sol: Büyük Konsept Afişi (%50 Genişlik) */}
          <div className="lg:col-span-6">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xs bg-[#FAF8F5] border border-stone-200/80 flex items-center justify-center group">
              {show1.imageUrl || show1.mobileImageUrl ? (
                <>
                  <picture className="w-full h-full">
                    {show1.mobileImageUrl && (
                      <source media="(max-width: 767px)" srcSet={show1.mobileImageUrl} />
                    )}
                    {show1.imageUrl && (
                      <source media="(min-width: 768px)" srcSet={show1.imageUrl} />
                    )}
                    <img
                      src={show1.imageUrl || show1.mobileImageUrl}
                      alt={show1.title || 'Safirya Vitrin'}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
                    />
                  </picture>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent flex flex-col justify-end p-5 sm:p-8 text-white">
                    {show1.subtitle && (
                      <span className="text-[10px] sm:text-[11px] font-sans uppercase tracking-[0.2em] text-white/90 font-medium">
                        {show1.subtitle}
                      </span>
                    )}
                    {show1.title && (
                      <h3 className="font-serif text-2xl sm:text-3xl font-normal text-white mt-1">
                        {show1.title}
                      </h3>
                    )}
                    <div className="pt-2 sm:pt-3">
                      <Link
                        href={show1.buttonLink || '/kategoriler/dogal-mumlar'}
                        className="inline-block bg-white text-[#231B18] hover:bg-stone-100 text-xs uppercase tracking-widest font-medium px-5 sm:px-6 py-2 sm:py-2.5 transition shadow-sm"
                      >
                        {show1.buttonText || 'KEŞFEDİN'}
                      </Link>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-8 text-center space-y-3 max-w-sm">
                  <div className="w-12 h-12 rounded-full bg-[#C85A32]/10 border border-[#C85A32]/20 mx-auto flex items-center justify-center text-[#C85A32]">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-2xl font-normal text-[#231B18]">
                    {show1.title || 'Doğal Mum Koleksiyonu'}
                  </h3>
                  <p className="text-xs text-[#7A7067]">
                    %100 soya vaksı, ahşap fitil ve saf esans yağlarıyla dökülen atölye serisi.
                  </p>
                  <div className="pt-2">
                    <Link
                      href={show1.buttonLink || '/kategoriler/dogal-mumlar'}
                      className="inline-block bg-[#231B18] hover:bg-[#C85A32] text-white text-xs uppercase tracking-widest font-medium px-6 py-2.5 rounded-xs transition"
                    >
                      {show1.buttonText || 'KOLEKSİYONU İNCELE'}
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sağ: 3 Adet Ürün Kartı (%50 Genişlik) */}
          <div className="lg:col-span-6">
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              {showcase1Products.map((prod) => (
                <ProductCard key={prod.id} product={prod} variant="simple" />
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          6. KONSEPT ALANI 4: VİTRİN 2 (Epoksi & Taş Koleksiyonu)
      ════════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
          
          {/* Sol: Büyük Konsept Afişi (%50 Genişlik) */}
          <div className="lg:col-span-6">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xs bg-[#FAF8F5] border border-stone-200/80 flex items-center justify-center group">
              {show2.imageUrl || show2.mobileImageUrl ? (
                <>
                  <picture className="w-full h-full">
                    {show2.mobileImageUrl && (
                      <source media="(max-width: 767px)" srcSet={show2.mobileImageUrl} />
                    )}
                    {show2.imageUrl && (
                      <source media="(min-width: 768px)" srcSet={show2.imageUrl} />
                    )}
                    <img
                      src={show2.imageUrl || show2.mobileImageUrl}
                      alt={show2.title || 'Safirya Vitrin'}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
                    />
                  </picture>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent flex flex-col justify-end p-5 sm:p-8 text-white">
                    {show2.subtitle && (
                      <span className="text-[10px] sm:text-[11px] font-sans uppercase tracking-[0.2em] text-white/90 font-medium">
                        {show2.subtitle}
                      </span>
                    )}
                    {show2.title && (
                      <h3 className="font-serif text-2xl sm:text-3xl font-normal text-white mt-1">
                        {show2.title}
                      </h3>
                    )}
                    <div className="pt-2 sm:pt-3">
                      <Link
                        href={show2.buttonLink || '/kategoriler/epoksi-tasarimlar'}
                        className="inline-block bg-white text-[#231B18] hover:bg-stone-100 text-xs uppercase tracking-widest font-medium px-5 sm:px-6 py-2 sm:py-2.5 transition shadow-sm"
                      >
                        {show2.buttonText || 'KEŞFEDİN'}
                      </Link>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-8 text-center space-y-3 max-w-sm">
                  <div className="w-12 h-12 rounded-full bg-[#5F6F52]/10 border border-[#5F6F52]/20 mx-auto flex items-center justify-center text-[#5F6F52]">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-2xl font-normal text-[#231B18]">
                    {show2.title || 'Epoksi & Zanaat Objeleri'}
                  </h3>
                  <p className="text-xs text-[#7A7067]">
                    Doğal fırınlanmış ahşap ve ultra şeffaf epoksi reçine ile elde üretilen dekoratif sunumluklar.
                  </p>
                  <div className="pt-2">
                    <Link
                      href={show2.buttonLink || '/kategoriler/epoksi-tasarimlar'}
                      className="inline-block bg-[#231B18] hover:bg-[#5F6F52] text-white text-xs uppercase tracking-widest font-medium px-6 py-2.5 rounded-xs transition"
                    >
                      {show2.buttonText || 'KOLEKSİYONU İNCELE'}
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sağ: 3 Adet Ürün Kartı (%50 Genişlik) */}
          <div className="lg:col-span-6">
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              {showcase2Products.map((prod) => (
                <ProductCard key={prod.id} product={prod} variant="simple" />
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          7. SIKÇA SORULAN SORULAR (SEO & Yapısal Bilgilendirme)
      ════════════════════════════════════════════════════════════════ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <JsonLd data={faqSchemaData} />

        <div className="text-center mb-8">
          <span className="text-[11px] font-sans uppercase tracking-[0.2em] text-[#C85A32] font-semibold block mb-1">
            MERAK EDİLENLER
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#231B18] font-normal tracking-tight">
            Sıkça Sorulan Sorular
          </h2>
          <div className="w-12 h-0.5 bg-[#C85A32] mx-auto mt-2" />
        </div>

        <div className="space-y-4">
          {HOME_FAQS.map((faq, i) => (
            <details
              key={i}
              className="group border border-stone-200 rounded-xs bg-[#FAF8F5]/40 transition-colors [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer items-center justify-between p-4 sm:p-5 text-sm sm:text-base font-medium text-[#231B18]">
                <h3 className="font-serif text-sm sm:text-base text-[#231B18] pr-4">
                  {faq.question}
                </h3>
                <span className="shrink-0 transition duration-300 group-open:-rotate-180 text-[#7A7067]">
                  <ChevronRight className="w-4 h-4 rotate-90" />
                </span>
              </summary>
              <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-[#7A7067] leading-relaxed border-t border-stone-100">
                <p>{faq.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </section>

    </div>
  );
}
