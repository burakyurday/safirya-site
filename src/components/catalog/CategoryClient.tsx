'use client';

import React, { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  SlidersHorizontal,
  X,
  ChevronDown,
  ArrowUpDown,
} from 'lucide-react';
import { ProductCard } from '@/components/catalog/ProductCard';

export interface CatalogProduct {
  id: string;
  name: string;
  slug: string;
  categoryName: string;
  brand?: string;
  price: number;
  discountPrice?: number;
  discountRate?: number;
  preparationDays: number;
  isCustomizable: boolean;
  scentNotes: string[];
  colorOptions?: string[];
  rating: number;
  reviewCount: number;
  image: string;
  isBestSeller: boolean;
}

interface CategoryClientProps {
  slug: string;
  categoryTitle: string;
  categoryDesc: string;
  initialProducts: CatalogProduct[];
  allScentNotes: string[];
}

const DELIVERY_OPTIONS = [
  { id: 'same-day', label: 'Aynı Gün Kargo', days: 1 },
  { id: '1-3-day', label: '1-3 Gün Atölye Üretimi', days: 3 },
];

const SORT_OPTIONS = [
  { value: 'recommended', label: 'Önerilen Sıralama' },
  { value: 'best-seller', label: 'Çok Satanlar' },
  { value: 'price-asc', label: 'Fiyat: Artan' },
  { value: 'price-desc', label: 'Fiyat: Azalan' },
];

function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group select-none">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${
          checked ? 'bg-[#C85A32]' : 'bg-stone-200'
        }`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-xs transform transition-transform duration-200 ${
            checked ? 'translate-x-4.5' : 'translate-x-0.5'
          }`}
        />
      </button>
      <span className="text-xs text-[#231B18] font-medium">{label}</span>
    </label>
  );
}

export function CategoryClient({
  slug,
  categoryTitle,
  categoryDesc,
  initialProducts,
  allScentNotes,
}: CategoryClientProps) {
  const [selectedScents, setSelectedScents] = useState<string[]>([]);
  const [onlyCustomizable, setOnlyCustomizable] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(2500);
  const [sortBy, setSortBy] = useState('recommended');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const maxPrice = useMemo(
    () => Math.max(...initialProducts.map((p) => p.price), 2500),
    [initialProducts]
  );

  const activeFilters = useMemo(() => {
    const filters: { label: string; clear: () => void }[] = [];
    selectedScents.forEach((s) =>
      filters.push({ label: s, clear: () => toggleScent(s) })
    );
    if (onlyCustomizable)
      filters.push({
        label: 'Kişiselleştirilebilir',
        clear: () => setOnlyCustomizable(false),
      });
    if (selectedDelivery.length > 0)
      selectedDelivery.forEach((d) => {
        const opt = DELIVERY_OPTIONS.find((o) => o.id === d);
        if (opt)
          filters.push({
            label: opt.label,
            clear: () => toggleDelivery(d),
          });
      });
    return filters;
  }, [selectedScents, onlyCustomizable, selectedDelivery]);

  const toggleScent = useCallback((scent: string) => {
    setSelectedScents((prev) =>
      prev.includes(scent) ? prev.filter((s) => s !== scent) : [...prev, scent]
    );
  }, []);

  const toggleDelivery = useCallback((id: string) => {
    setSelectedDelivery((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  }, []);

  const clearAll = () => {
    setSelectedScents([]);
    setOnlyCustomizable(false);
    setSelectedDelivery([]);
    setPriceMin(0);
    setPriceMax(2500);
  };

  const filteredProducts = useMemo(() => {
    let products = [...initialProducts];

    if (selectedScents.length > 0)
      products = products.filter((p) =>
        selectedScents.some((s) => p.scentNotes.includes(s))
      );

    if (onlyCustomizable)
      products = products.filter((p) => p.isCustomizable);

    if (selectedDelivery.length > 0) {
      const maxDays = Math.max(
        ...selectedDelivery.map(
          (id) => DELIVERY_OPTIONS.find((o) => o.id === id)?.days ?? 99
        )
      );
      products = products.filter((p) => p.preparationDays <= maxDays);
    }

    products = products.filter((p) => {
      const price = p.discountPrice ?? p.price;
      return price >= priceMin && price <= priceMax;
    });

    switch (sortBy) {
      case 'best-seller':
        products.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
        break;
      case 'price-asc':
        products.sort(
          (a, b) => (a.discountPrice ?? a.price) - (b.discountPrice ?? b.price)
        );
        break;
      case 'price-desc':
        products.sort(
          (a, b) => (b.discountPrice ?? b.price) - (a.discountPrice ?? a.price)
        );
        break;
      default:
        break;
    }

    return products;
  }, [
    initialProducts,
    selectedScents,
    onlyCustomizable,
    selectedDelivery,
    priceMin,
    priceMax,
    sortBy,
  ]);

  const FilterPanel = () => (
    <div className="space-y-6">
      <div className="border-b border-stone-100 pb-3">
        <h3 className="text-xs uppercase font-semibold tracking-widest text-[#231B18]">Filtreler</h3>
      </div>

      {/* Koku Notaları */}
      {allScentNotes.length > 0 && (
        <div className="space-y-2.5">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-[#7A7067]">
            Koku Profili
          </p>
          <div className="space-y-2">
            {allScentNotes.map((scent) => (
              <label key={scent} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedScents.includes(scent)}
                  onChange={() => toggleScent(scent)}
                  className="w-3.5 h-3.5 rounded-none border-stone-300 accent-[#C85A32] cursor-pointer"
                />
                <span className="text-xs text-[#231B18] group-hover:text-[#C85A32] transition-colors">
                  {scent}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Kişiselleştirme */}
      <div className="border-t border-stone-100 pt-4">
        <ToggleSwitch
          checked={onlyCustomizable}
          onChange={setOnlyCustomizable}
          label="İsim/Etiket Yazılabilir"
        />
      </div>

      {/* Teslimat Hızı */}
      <div className="border-t border-stone-100 pt-4 space-y-2.5">
        <p className="text-[11px] uppercase tracking-wider font-semibold text-[#7A7067]">
          Atölye Hazırlık Süresi
        </p>
        <div className="space-y-2">
          {DELIVERY_OPTIONS.map((opt) => (
            <label key={opt.id} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedDelivery.includes(opt.id)}
                onChange={() => toggleDelivery(opt.id)}
                className="w-3.5 h-3.5 rounded-none border-stone-300 accent-[#C85A32] cursor-pointer"
              />
              <span className="text-xs text-[#231B18] group-hover:text-[#C85A32] transition-colors">
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Fiyat Aralığı */}
      <div className="border-t border-stone-100 pt-4 space-y-3">
        <p className="text-[11px] uppercase tracking-wider font-semibold text-[#7A7067]">
          Fiyat Aralığı (TL)
        </p>
        <input
          type="range"
          min={0}
          max={maxPrice}
          value={priceMax}
          onChange={(e) => setPriceMax(Number(e.target.value))}
          className="w-full accent-[#C85A32] cursor-pointer"
        />
        <div className="flex items-center justify-between text-xs font-mono text-[#231B18]">
          <span>0 TL</span>
          <span className="font-semibold text-[#C85A32]">{priceMax} TL</span>
        </div>
      </div>

      {/* Filtreleri Temizle */}
      {activeFilters.length > 0 && (
        <button
          onClick={clearAll}
          className="w-full py-2 border border-stone-300 text-xs font-medium uppercase tracking-wider text-[#231B18] hover:bg-[#231B18] hover:text-white transition rounded-xs"
        >
          Filtreleri Temizle
        </button>
      )}
    </div>
  );

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#7A7067] mb-6">
          <Link href="/" className="hover:text-[#C85A32] transition">Anasayfa</Link>
          <span>/</span>
          <Link href="/kategoriler" className="hover:text-[#C85A32] transition">Kategoriler</Link>
          <span>/</span>
          <span className="text-[#231B18] font-medium">{categoryTitle}</span>
        </nav>

        {/* Sayfa Başlığı */}
        <div className="border-b border-stone-100 pb-6 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#231B18]">
              {categoryTitle}
            </h1>
            {categoryDesc && (
              <p className="text-xs sm:text-sm text-[#7A7067] mt-1.5 max-w-2xl leading-relaxed">
                {categoryDesc}
              </p>
            )}
          </div>
          <span className="text-xs text-[#7A7067] font-mono shrink-0">
            {filteredProducts.length} Ürün Listeleniyor
          </span>
        </div>

        {/* Filtre Barı & Sıralama */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          {/* Aktif filtre etiketleri */}
          <div className="flex flex-wrap items-center gap-2">
            {activeFilters.map((f) => (
              <span
                key={f.label}
                className="inline-flex items-center gap-1.5 text-xs bg-[#FAF8F5] border border-stone-200 text-[#231B18] px-2.5 py-1 rounded-xs"
              >
                <span>{f.label}</span>
                <button
                  onClick={f.clear}
                  className="hover:text-[#C85A32] transition"
                  title="Filtreyi Kaldır"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {/* Mobil Filtre Butonu */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider border border-[#231B18] px-3 py-1.5 rounded-xs text-[#231B18]"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filtreler</span>
            </button>

            {/* Sıralama Seçimi */}
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs font-medium uppercase tracking-wider text-[#231B18] bg-white border border-stone-200 rounded-xs px-3 py-1.5 focus:outline-none focus:border-[#231B18] cursor-pointer"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Ana Izgara: Sol Filtre Sidebar, Sağ Ürünler */}
        <div className="flex gap-8 items-start">
          
          {/* Desktop Filtre Sidebar */}
          <aside className="hidden lg:block w-56 shrink-0 sticky top-24 bg-white border border-stone-200/80 rounded-xs p-5">
            <FilterPanel />
          </aside>

          {/* Ürün Listesi */}
          <div className="flex-1">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-5 sm:gap-6">
                {filteredProducts.map((p) => (
                  <ProductCard key={p.id} product={p} variant="simple" />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center border border-dashed border-stone-300 rounded-xs p-8 bg-[#FAF8F5]">
                <p className="text-sm font-serif text-[#231B18] mb-1">
                  Seçilen filtrelere uygun ürün bulunamadı.
                </p>
                <p className="text-xs text-[#7A7067] mb-4">
                  Filtreleri temizleyerek tüm koleksiyonu görüntüleyebilirsiniz.
                </p>
                <button
                  onClick={clearAll}
                  className="px-5 py-2 bg-[#231B18] text-white text-xs uppercase tracking-wider font-medium rounded-xs hover:bg-[#3A2E29] transition"
                >
                  Filtreleri Sıfırla
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Mobil Filtre Modalı */}
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
              onClick={() => setIsMobileFilterOpen(false)}
            />
            <div className="relative ml-auto w-80 max-w-full bg-white h-full p-6 overflow-y-auto shadow-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-5">
                  <h3 className="font-serif text-lg text-[#231B18]">Filtreler</h3>
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="p-1 text-stone-500 hover:text-[#C85A32]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <FilterPanel />
              </div>

              <div className="pt-6 mt-6 border-t border-stone-100">
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-full bg-[#231B18] text-white py-2.5 text-xs uppercase tracking-widest font-medium rounded-xs hover:bg-[#3A2E29]"
                >
                  {filteredProducts.length} Ürünü Göster
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
