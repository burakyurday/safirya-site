'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, Mic, Star, Check, Sparkles, AlertCircle } from 'lucide-react';
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
  'Kahvaltılık Seti',
  'Hediye Setleri',
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

  // Modal açıldığında odaklan ve ürün listesini yükle
  useEffect(() => {
    if (isSearchOpen) {
      setCatalogProducts(getClientCatalogProducts());
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 80);
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
      .slice(0, 5);
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#231B18]/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={() => setIsSearchOpen(false)}
    >
      <div
        className="w-full max-w-[820px] bg-[#F6F3EC] rounded-xs shadow-2xl border border-[#E2DCD3] p-5 sm:p-7 overflow-hidden text-[#231B18] relative animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Ürün ve Koleksiyon Arama"
      >
        {/* Üst Arama Input Çubuğu */}
        <form onSubmit={handleSearchSubmit} className="mb-6">
          <div className="bg-[#EFECE6] rounded-xs border border-[#E2DCD3] px-4 py-3 flex items-center gap-3 shadow-xs focus-within:border-[#231B18] transition-colors">
            <Search className="w-5 h-5 text-[#7A7067] shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Doğal mum, Miyuki takı, epoksi, koku veya ürün ara..."
              className="flex-1 text-[#231B18] text-sm sm:text-base placeholder-[#7A7067] focus:outline-hidden bg-transparent font-normal"
              autoComplete="off"
            />
            <div className="flex items-center gap-2 text-[#7A7067]">
              {/* Sesli Arama Butonu */}
              <button
                type="button"
                onClick={handleVoiceSearch}
                title="Sesle Ara"
                aria-label="Sesle Ara"
                className={`transition p-1 rounded-xs ${
                  isListening
                    ? 'text-red-600 animate-pulse bg-red-100'
                    : 'hover:text-[#231B18]'
                }`}
              >
                <Mic className="w-4 h-4" />
              </button>

              <div className="h-4 w-px bg-[#E2DCD3]" />

              {/* Temizle / Kapat Butonu */}
              <button
                type="button"
                onClick={() => {
                  if (query || selectedScent) {
                    setQuery('');
                    setSelectedScent('');
                    inputRef.current?.focus();
                  } else {
                    setIsSearchOpen(false);
                  }
                }}
                title={query || selectedScent ? 'Aramayı Temizle' : 'Kapat'}
                aria-label={query || selectedScent ? 'Aramayı Temizle' : 'Kapat'}
                className="hover:text-[#C85A32] transition p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>

        {/* Ana Gövde (2 Sütun) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 pb-5">
          {/* Sol Sütun: Hızlı Keşfet & Filtreler */}
          <div className="md:col-span-5 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-normal text-[#231B18]">
                Hızlı Keşfet
              </h3>
              {(query || selectedScent) && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setSelectedScent('');
                    inputRef.current?.focus();
                  }}
                  className="text-[11px] text-[#C85A32] hover:underline"
                >
                  Filtreleri Sıfırla
                </button>
              )}
            </div>

            {/* Popüler Aramalar */}
            <div className="space-y-2.5">
              <h4 className="text-xs uppercase tracking-wider font-medium text-[#7A7067]">
                Popüler Aramalar
              </h4>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SEARCHES.map((item) => {
                  const isCurrent = query.toLowerCase() === item.toLowerCase();
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setQuery(item);
                        setSelectedScent('');
                        inputRef.current?.focus();
                      }}
                      className={`px-3 py-1.5 rounded-xs text-xs font-medium transition ${
                        isCurrent
                          ? 'border border-[#231B18] bg-[#231B18] text-[#F6F3EC]'
                          : 'bg-[#EFECE6] border border-[#E2DCD3] text-[#231B18] hover:border-[#231B18]'
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Koku Notalarına Göre */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs uppercase tracking-wider font-medium text-[#7A7067]">
                  Koku Notalarına Göre
                </h4>
                {selectedScent && (
                  <span className="text-[10px] text-[#C85A32] font-medium">
                    {selectedScent} seçili
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {SCENT_NOTES.map((scent) => {
                  const isSelected = selectedScent === scent;
                  return (
                    <button
                      key={scent}
                      type="button"
                      onClick={() => {
                        setSelectedScent(isSelected ? '' : scent);
                        inputRef.current?.focus();
                      }}
                      className={`px-3 py-1.5 rounded-xs text-xs font-medium transition ${
                        isSelected
                          ? 'border border-[#C85A32] text-[#C85A32] bg-[#F8ECE6] font-semibold'
                          : 'bg-[#EFECE6] border border-[#E2DCD3] text-[#231B18] hover:border-[#231B18]'
                      }`}
                    >
                      {scent}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* İpucu */}
            <div className="p-3 bg-[#EFECE6]/80 rounded-xs border border-[#E2DCD3] text-xs text-[#7A7067] leading-relaxed flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-[#C85A32] shrink-0 mt-0.5" />
              <span>
                Atölyemizde kişiye özel hazırlanan soya mumları, Japon Miyuki takılar ve epoksi sunumluklar için anahtar kelimelerle arayabilirsiniz.
              </span>
            </div>
          </div>

          {/* Sağ Sütun: Canlı Ürün Sonuçları */}
          <div className="md:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-normal text-[#231B18]">
                {isFiltering ? (
                  <span>
                    Arama Sonuçları{' '}
                    <span className="text-sm font-sans text-[#7A7067]">
                      ({displayProducts.length})
                    </span>
                  </span>
                ) : (
                  <span>Öne Çıkan Parçalar</span>
                )}
              </h3>
              {isFiltering && (
                <span className="text-xs text-[#7A7067]">
                  Canlı Sonuçlar
                </span>
              )}
            </div>

            {/* Ürün Listesi */}
            {displayProducts.length > 0 ? (
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {displayProducts.map((prod) => {
                  const isAdded = addedId === prod.id;
                  const finalPrice = prod.discountPrice || prod.price;
                  const hasDiscount = Boolean(prod.discountPrice && prod.discountPrice < prod.price);

                  return (
                    <div
                      key={prod.id}
                      className="flex items-center gap-3.5 p-2 bg-[#EFECE6] rounded-xs border border-[#E2DCD3] hover:border-stone-400 group transition duration-200"
                    >
                      {/* Ürün Görseli */}
                      <Link
                        href={`/urunler/${prod.slug}`}
                        onClick={() => setIsSearchOpen(false)}
                        className="shrink-0 w-14 h-14 rounded-xs overflow-hidden bg-[#FAF8F5] border border-[#E2DCD3]"
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
                        <div className="flex items-center justify-between gap-2">
                          <Link
                            href={`/urunler/${prod.slug}`}
                            onClick={() => setIsSearchOpen(false)}
                            className="font-serif text-xs sm:text-sm font-normal text-[#231B18] truncate group-hover:text-[#C85A32] transition block"
                            title={prod.name}
                          >
                            {prod.name}
                          </Link>
                          <div className="flex items-center gap-1 text-[11px] font-semibold text-[#231B18] shrink-0">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            <span>{prod.rating.toFixed(1)}</span>
                          </div>
                        </div>

                        {/* Tagler ve Kategori */}
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span className="px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider bg-[#231B18] text-[#F6F3EC]">
                            {prod.categoryName}
                          </span>
                          {prod.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider bg-[#F6F3EC] text-[#7A7067] border border-[#E2DCD3]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* Fiyat */}
                        <div className="flex items-baseline gap-2 mt-1">
                          {hasDiscount && (
                            <span className="text-xs text-[#7A7067] line-through">
                              {prod.price} TL
                            </span>
                          )}
                          <span className="text-xs font-semibold text-[#231B18]">
                            {finalPrice} TL
                          </span>
                        </div>
                      </div>

                      {/* Sepete Ekle Butonu */}
                      <button
                        type="button"
                        onClick={() => handleAddToCart(prod)}
                        className={`shrink-0 px-2.5 py-1.5 rounded-xs text-[10px] font-medium uppercase tracking-wider transition flex items-center gap-1 ${
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
                  );
                })}
              </div>
            ) : (
              /* Arama Sonucu Bulunamadı Durumu */
              <div className="py-10 px-4 text-center space-y-3 bg-[#EFECE6]/50 rounded-xs border border-[#E2DCD3]">
                <div className="w-12 h-12 mx-auto rounded-full bg-[#EFECE6] border border-[#E2DCD3] flex items-center justify-center text-[#7A7067]">
                  <AlertCircle className="w-6 h-6 text-[#C85A32]" />
                </div>
                <div>
                  <p className="font-serif text-base text-[#231B18]">
                    {query ? `"${query}" ile eşleşen ürün bulunamadı` : 'Kriterlere uygun ürün bulunamadı'}
                  </p>
                  <p className="text-xs text-[#7A7067] max-w-xs mx-auto mt-1">
                    Yazımı kontrol edebilir, koku notasını değiştirebilir veya aşağıdaki önerilere göz atabilirsiniz.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-1.5 pt-2">
                  {POPULAR_SEARCHES.slice(0, 4).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setQuery(item);
                        setSelectedScent('');
                        inputRef.current?.focus();
                      }}
                      className="px-2.5 py-1 text-xs bg-[#EFECE6] hover:bg-[#231B18] hover:text-[#F6F3EC] border border-[#E2DCD3] rounded-xs transition"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Alt Kısım: Tüm Sonuçları Gör Linki */}
        <div className="pt-3.5 border-t border-[#E2DCD3] flex items-center justify-between">
          {query.trim() ? (
            <Link
              href={`/arama?q=${encodeURIComponent(query.trim())}`}
              onClick={() => setIsSearchOpen(false)}
              className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-medium text-[#231B18] hover:text-[#C85A32] transition group"
            >
              <span>&ldquo;{query.trim()}&rdquo; İçin Tüm Sonuçları Gör ({filteredProducts.length})</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          ) : (
            <Link
              href="/kategoriler"
              onClick={() => setIsSearchOpen(false)}
              className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-medium text-[#231B18] hover:text-[#C85A32] transition group"
            >
              <span>Tüm Koleksiyonlara Göz At</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          )}

          <span className="text-[11px] text-[#7A7067] hidden sm:inline">
            Kapatmak için <kbd className="px-1.5 py-0.5 rounded-xs bg-[#EFECE6] border border-[#E2DCD3] text-[10px]">ESC</kbd>
          </span>
        </div>
      </div>
    </div>
  );
}
