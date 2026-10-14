'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { ProductCard } from '@/components/catalog/ProductCard';
import {
  getClientCatalogProducts,
  filterCatalogProducts,
  CatalogProductItem,
} from '@/lib/catalog';
import { JsonLd, getBreadcrumbSchema } from '@/components/seo/JsonLd';

const CATEGORIES = [
  { id: 'all', label: 'Tüm Koleksiyonlar' },
  { id: 'Doğal Mumlar', label: 'Doğal Mumlar' },
  { id: 'Epoksi Tasarımlar', label: 'Epoksi Tasarımlar' },
  { id: 'Miyuki Boncuk Takı', label: 'Miyuki Boncuk Takı' },
  { id: 'Kokulu Taş & Seramik', label: 'Kokulu Taş & Seramik' },
  { id: 'Sofra & Yaşam', label: 'Sofra & Yaşam' },
];

const SORT_OPTIONS = [
  { value: 'recommended', label: 'Önerilen Sıralama' },
  { value: 'price-asc', label: 'Fiyat: Düşükten Yükseğe' },
  { value: 'price-desc', label: 'Fiyat: Yüksekten Düşüğe' },
  { value: 'rating', label: 'En Yüksek Puanlı' },
];

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';

  const [inputVal, setInputVal] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recommended');

  const allProducts = useMemo(() => getClientCatalogProducts(), []);

  // Filtreleme
  const searchFiltered = useMemo(() => {
    return filterCatalogProducts(allProducts, initialQuery);
  }, [allProducts, initialQuery]);

  const finalFiltered = useMemo(() => {
    let list = [...searchFiltered];

    if (selectedCategory !== 'all') {
      list = list.filter((p) => p.categoryName === selectedCategory);
    }

    if (sortBy === 'price-asc') {
      list.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
    } else if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    }

    return list;
  }, [searchFiltered, selectedCategory, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      router.push(`/arama?q=${encodeURIComponent(inputVal.trim())}`);
    } else {
      router.push('/arama');
    }
  };

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Anasayfa', item: '/' },
    { name: 'Arama Sonuçları', item: '/arama' },
  ]);

  return (
    <div className="bg-white min-h-[75vh] py-8 sm:py-12 text-[#231B18]">
      <JsonLd data={breadcrumbSchema} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#7A7067] mb-6">
          <Link href="/" className="hover:text-[#C85A32] transition">
            Anasayfa
          </Link>
          <span>/</span>
          <span className="text-[#231B18] font-medium">Arama Sonuçları</span>
        </nav>

        {/* Başlık ve Arama Kutusu */}
        <div className="max-w-2xl mx-auto text-center mb-10 space-y-4">
          <span className="text-[11px] font-sans uppercase tracking-[0.25em] text-[#7A7067] font-medium block">
            Safirya Arama
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-[#231B18]">
            {initialQuery ? (
              <span>
                &ldquo;{initialQuery}&rdquo; İçin Sonuçlar
              </span>
            ) : (
              <span>Tüm Atölye Tasarımları</span>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-[#7A7067]">
            {finalFiltered.length} adet benzersiz el yapımı ürün listeleniyor.
          </p>

          {/* Sayfa İçi Arama Çubuğu */}
          <form onSubmit={handleSearchSubmit} className="pt-2">
            <div className="bg-[#FAF8F5] rounded-xs border border-stone-200 px-4 py-2.5 flex items-center gap-3 shadow-2xs focus-within:border-[#231B18] transition-colors">
              <Search className="w-5 h-5 text-[#7A7067] shrink-0" />
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Başka bir ürün veya koku ara..."
                className="flex-1 bg-transparent text-sm text-[#231B18] placeholder-[#7A7067] focus:outline-hidden"
              />
              {inputVal && (
                <button
                  type="button"
                  onClick={() => {
                    setInputVal('');
                    router.push('/arama');
                  }}
                  className="p-1 text-[#7A7067] hover:text-[#C85A32] transition"
                  title="Temizle"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#231B18] text-[#FAF8F5] text-xs uppercase tracking-wider font-medium rounded-xs hover:bg-[#C85A32] transition"
              >
                Ara
              </button>
            </div>
          </form>
        </div>

        {/* Kategori ve Sıralama Filtreleri */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-y border-stone-200/80 mb-8">
          {/* Kategori Butonları */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xs text-xs font-medium whitespace-nowrap transition ${
                    isSelected
                      ? 'bg-[#231B18] text-white'
                      : 'bg-[#FAF8F5] border border-stone-200 text-[#231B18] hover:border-stone-400'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Sıralama Seçimi */}
          <div className="flex items-center gap-2 shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#7A7067]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs bg-transparent border border-stone-200 rounded-xs px-2.5 py-1.5 text-[#231B18] focus:outline-hidden"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Ürünler Izgarası veya Boş Durum */}
        {finalFiltered.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {finalFiltered.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  id: product.id,
                  name: product.name,
                  slug: product.slug,
                  categoryName: product.categoryName,
                  price: product.price,
                  discountPrice: product.discountPrice,
                  discountRate: product.discountRate,
                  rating: product.rating,
                  reviewCount: product.reviewCount,
                  image: product.image,
                  isBestSeller: product.isBestSeller,
                }}
              />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#FAF8F5] border border-stone-200 flex items-center justify-center text-[#7A7067]">
              <Search className="w-8 h-8 text-[#C85A32]" />
            </div>
            <h2 className="font-serif text-xl text-[#231B18]">
              Aradığınız kriterlere uygun ürün bulunamadı
            </h2>
            <p className="text-xs sm:text-sm text-[#7A7067] leading-relaxed">
              Farklı bir arama terimi deneyebilir, kategori filtresini kaldırabilir veya popüler koleksiyonlarımıza göz atabilirsiniz.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-2">
              <Link
                href="/kategoriler/dogal-mumlar"
                className="px-3 py-1.5 bg-[#FAF8F5] border border-stone-200 rounded-xs text-xs font-medium hover:border-stone-400 transition"
              >
                Doğal Mumlar
              </Link>
              <Link
                href="/kategoriler/epoksi-tasarimlar"
                className="px-3 py-1.5 bg-[#FAF8F5] border border-stone-200 rounded-xs text-xs font-medium hover:border-stone-400 transition"
              >
                Epoksi Tasarımlar
              </Link>
              <Link
                href="/kategoriler/miyuki-taki"
                className="px-3 py-1.5 bg-[#FAF8F5] border border-stone-200 rounded-xs text-xs font-medium hover:border-stone-400 transition"
              >
                Miyuki Takılar
              </Link>
              <Link
                href="/cok-satanlar"
                className="px-3 py-1.5 bg-[#231B18] text-white rounded-xs text-xs font-medium hover:bg-[#C85A32] transition"
              >
                Çok Satanlar
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center text-sm text-[#7A7067]">
          Arama sonuçları yükleniyor...
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
