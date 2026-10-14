'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    categoryName?: string;
    brand?: string;
    price: number;
    discountPrice?: number;
    discountRate?: number;
    preparationDays?: number;
    isCustomizable?: boolean;
    scentNotes?: string[];
    rating?: number;
    reviewCount?: number;
    image: string;
    isBestSeller?: boolean;
  };
  variant?: 'default' | 'simple';
}

export function ProductCard({ product, variant = 'simple' }: ProductCardProps) {
  const { addToCart, toggleFavorite, isFavorite } = useStore();
  const favorite = isFavorite(product.id);

  // Gösterilecek fiyatlar
  const hasDiscount = product.discountPrice !== undefined && product.discountPrice < product.price;
  const currentPrice = hasDiscount ? product.discountPrice! : product.price;
  const oldPrice = hasDiscount ? product.price : undefined;

  return (
    <div className="group flex flex-col bg-transparent transition-all duration-300">

      {/* ── Görsel Alanı ── */}
      <div className="relative aspect-square sm:aspect-[4/5] overflow-hidden bg-[#FAF8F5] rounded-xs border border-stone-200/80">
        <Link href={`/urunler/${product.slug}`} tabIndex={-1} className="block w-full h-full">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-700 ease-out"
          />
        </Link>

        {/* İndirim Rozeti */}
        {hasDiscount && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <span className="bg-[#C85A32] text-white text-[10px] font-medium tracking-wider uppercase px-2 py-0.5 rounded-none shadow-2xs">
              İndirim
            </span>
          </div>
        )}

        {/* Sağ üst: Yuvarlak Beyaz Favori Butonu */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleFavorite(product.id);
          }}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/95 hover:bg-white shadow-xs flex items-center justify-center transition-all z-10 ${
            favorite ? 'text-red-500' : 'text-stone-600 hover:text-red-500'
          }`}
          aria-label={favorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
        >
          <Heart className={`w-4 h-4 stroke-[1.6] ${favorite ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* ── Ürün Bilgileri (Minimal & Sade) ── */}
      <div className="pt-2.5 pb-1 flex-1 flex flex-col justify-between">
        <div>
          {/* Marka Adı (RAKLE / SAFİRYA) */}
          <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-[#7A7067] block">
            {product.brand || 'SAFİRYA'}
          </span>

          {/* Ürün Başlığı */}
          <Link href={`/urunler/${product.slug}`} className="block mt-0.5">
            <h3 className="font-serif text-xs sm:text-[13px] font-normal text-[#231B18] group-hover:text-[#C85A32] transition-colors line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* ── Fiyat Alanı ── */}
        <div className="pt-1.5 flex items-baseline gap-2">
          {hasDiscount ? (
            <>
              <span className="text-xs sm:text-sm font-semibold text-[#C85A32]">
                {currentPrice.toFixed(2)} TL
              </span>
              <span className="text-[11px] sm:text-xs text-[#7A7067] line-through">
                {oldPrice!.toFixed(2)} TL
              </span>
            </>
          ) : (
            <span className="text-xs sm:text-sm font-semibold text-[#231B18]">
              {currentPrice.toFixed(2)} TL
            </span>
          )}
        </div>
      </div>

    </div>
  );
}
