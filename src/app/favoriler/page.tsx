'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, ArrowRight } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { ProductCard } from '@/components/catalog/ProductCard';

import { initialProducts } from '@/context/AdminContext';

const catalogProducts = initialProducts.map((p) => ({
  id: p.id,
  name: p.name,
  slug: p.slug,
  categoryName: p.category,
  brand: 'SAFİRYA',
  price: p.price,
  discountPrice: p.discountPrice,
  discountRate: p.discountRate,
  preparationDays: p.preparationDays,
  isCustomizable: p.isCustomizable,
  scentNotes: p.scentNotes,
  rating: 5,
  reviewCount: 24,
  image: p.images[0] || 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',
  isBestSeller: p.isBestSeller,
}));

export default function FavoritesPage() {
  const { favorites } = useStore();

  const favoriteProducts = catalogProducts.filter((p) =>
    favorites.includes(p.id)
  );

  return (
    <div className="bg-white min-h-[70vh] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-10">
          <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] font-medium text-[#7A7067] mb-2">
            <Heart className="w-3.5 h-3.5 fill-current text-[#C85A32]" />
            <span>Beğendiğiniz Tasarımlar ({favorites.length})</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#231B18]">
            Favori Ürünlerim
          </h1>
          <p className="text-xs sm:text-sm text-[#7A7067] mt-2">
            Atölyemizden ilham alıp daha sonra incelemek veya sipariş vermek üzere kaydettiğiniz el emeği tasarımlar.
          </p>
        </div>

        {favoriteProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {favoriteProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xs border border-stone-200 max-w-md mx-auto p-8 space-y-4">
            <Heart className="w-10 h-10 text-stone-300 mx-auto stroke-[1.5]" />
            <h3 className="font-serif text-lg font-normal text-[#231B18]">
              Favori Listeniz Henüz Boş
            </h3>
            <p className="text-xs text-[#7A7067]">
              Koleksiyonlarımızdaki ürünleri kalp ikonuna tıklayarak favorilerinize ekleyebilirsiniz.
            </p>
            <div className="pt-2">
              <Link
                href="/kategoriler"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xs bg-[#231B18] hover:bg-[#3A2E29] text-white text-xs uppercase tracking-widest font-medium transition"
              >
                <span>Koleksiyonları Keşfet</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
