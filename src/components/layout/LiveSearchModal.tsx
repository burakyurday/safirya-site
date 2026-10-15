'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, Mic, Star, Check, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import {
  getClientCatalogProducts,
  filterCatalogProducts,
  CatalogProductItem,
} from '@/lib/catalog';

const POPULAR_SEARCHES = [
  'Soya Mumları',
  'Miyuki Takılar',
  'Epoksi Tepsi',
  'Kokulu Taş',
  'Hediye Setleri',
  'Kahvaltılık',
];

const SCENT_NOTES = [
  'Vanilya',
  'Lavanta',
  'Sandal Ağacı',
  'Odunsu',
  'Çiçeksi',
  'Ferah',
  'Narenciye',
];

export function LiveSearchModal() {
  const { isSearchOpen, setIsSearchOpen, addToCart } = useStore();
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [selectedScent, setSelectedScent] = useState<string>('');
  const [catalogProducts, setCatalogProducts] = useState<CatalogProductItem[]>([]);
  const [addedId, setAddedId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Modal açıldığında katalog ürünlerini yükle ve odaklan
  useEffect(() => {
    if (isSearchOpen) {
      setCatalogProducts(getClientCatalogProducts());
      // Mobil cihazlarda ani klavye fırlamasını ve kaymasını önlemek için güvenli odaklanma
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus({ preventScroll: true });
        }
      }, 100);

      document.body.style.overflow = 'hidden';
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = '';
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isSearchOpen]);

  // ESC tuşu ile kapatma
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setIsSearchOpen]);

  // Canlı Filtreleme Mantığı
  const filteredProducts = useMemo(() => {
    return filterCatalogProducts(catalogProducts, query, selectedScent);
  }, [catalogProducts, query, selectedScent]);

  // Arama yapılmadığında gösterilecek öne çıkan parçalar
  const defaultFeaturedProducts = useMemo(() => {
    return catalogProducts
      .filter((p) => p.isFeatured || p.isBestSeller)
      .slice(0, 6);
  }, [catalogProducts]);

  const isFiltering = query.trim().length > 0 || selectedScent.length > 0;
  const displayProducts = isFiltering ? filteredProducts : defaultFeaturedProducts;

  // Arama formunu gönderme (Enter tuşu ile)
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsSearchOpen(false);
      router.push(`/arama?q=${encodeURIComponent(query.trim())}`);
    }
  };

  // Sepete ekleme işlemi ve buton geri bildirimi
  const handleAddToCart = (prod: CatalogProductItem) => {
    addToCart({
      id: prod.id,
      name: prod.name,
      price: prod.discountPrice || prod.price,
      originalPrice: prod.discountPrice ? prod.price : undefined,
      image: prod.image,
    });
    setAddedId(prod.id);
    setTimeout(() => {
      setAddedId((current) => (current === prod.id ? null : current));
    }, 1500);
  };

  // Sesli Arama (Web Speech API)
  const handleVoiceSearch = () => {
    if (typeof window === 'undefined') return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Tarayıcınız sesli arama özelliğini desteklemiyor.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'tr-TR';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript) {
          setQuery(transcript);
          setSelectedScent('');
        }
      };
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  if (!isSearchOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center sm:p-4 md:p-6 bg-[#231B18]/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={() => setIsSearchOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Ürün ve Koleksiyon Arama"
    >
      {/* 
        Mobil: Tam Ekran (100dvh) ve Sıfır Boşluk - Klavye Açıldığında Taşmaz ve Yazılabilir
        Masaüstü: 820px Genişliğinde Ortalanmış Şık Kart
      */}
      <div
        className="w-full h-[100dvh] sm:h-auto sm:max-h-[88vh] sm:max-w-[820px] bg-[#F6F3EC] sm:rounded-xs shadow-2xl border-0 sm:border sm:border-[#E2DCD3] flex flex-col overflow-hidden text-[#231B18] relative animate-in slide-in-from-top-2 sm:zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. ÜST ARAMA ÇUBUĞU (Mobilde ve Masaüstünde Sabit) */}
        <div className="shrink-0 p-3 sm:p-5 border-b border-[#E2DCD3] bg-[#F6F3EC]">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="flex-1 bg-white rounded-xs border border-[#E2DCD3] px-3.5 py-2.5 sm:py-3 flex items-center gap-2.5 shadow-2xs focus-within:border-[#231B18] transition-colors">
              <Search className="w-5 h-5 text-[#7A7067] shrink-0" />
              
              {/* 
                ÖNEMLİ MOBİL DÜZELTMESİ:
                Font size 'text-base' (16px) tutulmalıdır. 
                iOS Safari font-size < 16px olduğunda ekranı otomatik %130 zoomlar,
                bu da arama kutusunu devasa yapar ve yazmayı engeller.
              */}
              <input
                ref={inputRef}
                type="text"
                inputMode="search"
                enterKeyHint="search"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck="false"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Mum, epoksi, Miyuki veya koku ara..."
                className="flex-1 text-[#231B18] text-base placeholder-[#7A7067] focus:outline-none bg-transparent font-normal min-w-0"
              />

              <div className="flex items-center gap-1.5 text-[#7A7067] shrink-0">
                {/* Sesli Arama */}
                <button
                  type="button"
                  onClick={handleVoiceSearch}
                  title="Sesle Ara"
                  aria-label="Sesle Ara"
                  className={`p-1 rounded-xs transition ${
                    isListening
                      ? 'text-red-600 animate-pulse bg-red-100'
                      : 'hover:text-[#231B18]'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                </button>

                {/* Temizle Butonu */}
                {(query || selectedScent) && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('');
                      setSelectedScent('');
                      inputRef.current?.focus();
                    }}
                    title="Temizle"
                    aria-label="Temizle"
                    className="p-1 text-stone-400 hover:text-[#C85A32] transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Mobilde Kolay Kapatma Butonu */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(false)}
              className="px-2.5 py-2 text-xs uppercase tracking-wider font-semibold text-[#7A7067] hover:text-[#231B18] shrink-0 sm:hidden cursor-pointer"
            >
              Kapat
            </button>

            {/* Masaüstünde Kapatma Butonu */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(false)}
              className="hidden sm:flex p-2 text-stone-400 hover:text-[#231B18] transition shrink-0"
              title="Kapat (ESC)"
              aria-label="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </form>

          {/* Hızlı Filtre Çipleri (Mobilde tek satırda yatay kaydırılabilir, dikey yeri işgal etmez) */}
          <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#7A7067] shrink-0">
              Popüler:
            </span>
            {POPULAR_SEARCHES.map((item) => {
              const isSelected = query.toLowerCase() === item.toLowerCase();
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setQuery(item);
                    setSelectedScent('');
                  }}
                  className={`px-2.5 py-1 rounded-xs text-[11px] font-medium whitespace-nowrap shrink-0 transition cursor-pointer ${
                    isSelected
                      ? 'bg-[#231B18] text-[#F6F3EC]'
                      : 'bg-white border border-[#E2DCD3] text-[#231B18] hover:border-[#231B18]'
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>

          {/* Koku Notaları Çipleri */}
          <div className="mt-1.5 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#7A7067] shrink-0">
              Koku:
            </span>
            {SCENT_NOTES.map((scent) => {
              const isSelected = selectedScent === scent;
              return (
                <button
                  key={scent}
                  type="button"
                  onClick={() => {
                    setSelectedScent(isSelected ? '' : scent);
                  }}
                  className={`px-2 py-0.5 rounded-xs text-[10px] font-medium whitespace-nowrap shrink-0 transition cursor-pointer ${
                    isSelected
                      ? 'bg-[#C85A32] text-white'
                      : 'bg-[#EFECE6] border border-[#E2DCD3] text-[#7A7067] hover:text-[#231B18]'
                  }`}
                >
                  {scent}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. ANA İÇERİK & CANLI ÜRÜN SONUÇLARI (Akıcı ve Bağımsız Kaydırma) */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-3.5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-sm sm:text-base font-normal text-[#231B18]">
              {isFiltering ? (
                <span>
                  Arama Sonuçları{' '}
                  <span className="text-xs font-sans text-[#7A7067]">
                    ({displayProducts.length} ürün)
                  </span>
                </span>
              ) : (
                <span>Öne Çıkan Atölye Parçaları</span>
              )}
            </h3>

            {(query || selectedScent) && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setSelectedScent('');
                  inputRef.current?.focus();
                }}
                className="text-[11px] text-[#C85A32] hover:underline font-medium"
              >
                Filtreleri Temizle
              </button>
            )}
          </div>

          {/* Ürün Listesi */}
          {displayProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              {displayProducts.map((prod) => {
                const isAdded = addedId === prod.id;
                const finalPrice = prod.discountPrice || prod.price;
                const hasDiscount = Boolean(
                  prod.discountPrice && prod.discountPrice < prod.price
                );

                return (
                  <div
                    key={prod.id}
                    className="flex items-center gap-3 p-2.5 bg-white rounded-xs border border-[#E2DCD3] hover:border-stone-400 group transition duration-200"
                  >
                    {/* Ürün Görseli */}
                    <Link
                      href={`/urunler/${prod.slug}`}
                      onClick={() => setIsSearchOpen(false)}
                      className="shrink-0 w-16 h-16 rounded-xs overflow-hidden bg-[#FAF8F5] border border-[#E2DCD3]"
                    >
                      <img
                        src={prod.image}
                        alt={`${prod.name} - Safirya`}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    </Link>

                    {/* Ürün Bilgisi */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <Link
                          href={`/urunler/${prod.slug}`}
                          onClick={() => setIsSearchOpen(false)}
                          className="font-serif text-xs sm:text-sm font-normal text-[#231B18] truncate group-hover:text-[#C85A32] transition block"
                          title={prod.name}
                        >
                          {prod.name}
                        </Link>
                        <div className="flex items-center gap-0.5 text-[10px] font-semibold text-[#231B18] shrink-0">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          <span>{prod.rating.toFixed(1)}</span>
                        </div>
                      </div>

                      {/* Kategori */}
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="px-1.5 py-0.2 text-[9px] font-semibold uppercase tracking-wider bg-[#231B18] text-[#F6F3EC]">
                          {prod.categoryName}
                        </span>
                        {prod.scentNotes?.[0] && (
                          <span className="text-[10px] text-[#7A7067] truncate">
                            • {prod.scentNotes[0]}
                          </span>
                        )}
                      </div>

                      {/* Fiyat ve Buton */}
                      <div className="flex items-center justify-between mt-1.5">
                        <div className="flex items-baseline gap-1.5">
                          {hasDiscount && (
                            <span className="text-[11px] text-[#7A7067] line-through">
                              {prod.price} TL
                            </span>
                          )}
                          <span className="text-xs font-semibold text-[#231B18]">
                            {finalPrice} TL
                          </span>
                        </div>

                        {/* Sepete Ekle Butonu */}
                        <button
                          type="button"
                          onClick={() => handleAddToCart(prod)}
                          className={`shrink-0 px-2 py-1 rounded-xs text-[10px] font-medium uppercase tracking-wider transition flex items-center gap-1 ${
                            isAdded
                              ? 'bg-emerald-700 text-white border border-emerald-700'
                              : 'border border-[#231B18] text-[#231B18] hover:bg-[#231B18] hover:text-[#F6F3EC]'
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>Eklendi</span>
                            </>
                          ) : (
                            <span>+ Ekle</span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Sonuç Bulunamadı */
            <div className="py-10 px-4 text-center space-y-3 bg-white rounded-xs border border-[#E2DCD3]">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#FAF8F5] border border-[#E2DCD3] flex items-center justify-center text-[#7A7067]">
                <AlertCircle className="w-6 h-6 text-[#C85A32]" />
              </div>
              <div>
                <p className="font-serif text-base text-[#231B18]">
                  {query ? `"${query}" ile eşleşen ürün bulunamadı` : 'Kriterlere uygun ürün bulunamadı'}
                </p>
                <p className="text-xs text-[#7A7067] max-w-xs mx-auto mt-1">
                  Yazımı kontrol edebilir veya aşağıdaki popüler kelimelerden birini seçebilirsiniz.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-1.5 pt-2">
                {POPULAR_SEARCHES.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setQuery(item);
                      setSelectedScent('');
                      inputRef.current?.focus();
                    }}
                    className="px-2.5 py-1 text-xs bg-[#FAF8F5] hover:bg-[#231B18] hover:text-[#F6F3EC] border border-[#E2DCD3] rounded-xs transition"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 3. ALT ÇUBUK (Tüm Sonuçları Gör) */}
        <div className="shrink-0 p-3 sm:p-4 border-t border-[#E2DCD3] bg-[#FAF8F5] flex items-center justify-between">
          {query.trim() ? (
            <Link
              href={`/arama?q=${encodeURIComponent(query.trim())}`}
              onClick={() => setIsSearchOpen(false)}
              className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-medium text-[#231B18] hover:text-[#C85A32] transition group"
            >
              <span>&ldquo;{query.trim()}&rdquo; İçin Tüm Sonuçları Gör ({filteredProducts.length})</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : (
            <Link
              href="/kategoriler"
              onClick={() => setIsSearchOpen(false)}
              className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-medium text-[#231B18] hover:text-[#C85A32] transition group"
            >
              <span>Tüm Koleksiyonlara Göz At</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}

          <span className="text-[11px] text-[#7A7067] hidden sm:inline">
            Kapatmak için <kbd className="px-1.5 py-0.5 rounded-xs bg-white border border-[#E2DCD3] text-[10px]">ESC</kbd>
          </span>
        </div>
      </div>
    </div>
  );
}
