'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard } from '@/components/catalog/ProductCard';
import { CatalogProductItem } from '@/lib/catalog';

interface FeaturedProductsCarouselProps {
  products: CatalogProductItem[];
}

export function FeaturedProductsCarousel({ products }: FeaturedProductsCarouselProps) {
  const [carouselIndex, setCarouselIndex] = useState(0);

  if (!products || products.length === 0) {
    return null;
  }

  const nextSlide = () => {
    if (products.length <= 4) return;
    setCarouselIndex((prev) => (prev + 1 >= products.length - 3 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    if (products.length <= 4) return;
    setCarouselIndex((prev) => (prev - 1 < 0 ? Math.max(0, products.length - 4) : prev - 1));
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      <div className="text-center mb-8">
        <h2 className="font-serif text-2xl sm:text-3xl text-[#231B18] font-normal tracking-tight">
          Sizin İçin Seçtiklerimiz
        </h2>
        <div className="w-12 h-0.5 bg-[#C85A32] mx-auto mt-2" />
      </div>

      <div className="relative">
        {/* Desktop Oklar */}
        {products.length > 4 && (
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
                typeof window !== 'undefined' && window.innerWidth >= 768 && products.length > 4
                  ? `translateX(-${carouselIndex * 20}%)`
                  : 'none',
            }}
          >
            {products.map((prod) => (
              <div key={prod.id} className="min-w-[200px] sm:min-w-[220px] md:min-w-0 shrink-0">
                <ProductCard product={prod} variant="simple" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
