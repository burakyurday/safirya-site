import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import { getCategories } from '@/lib/catalog';
import { JsonLd, getBreadcrumbSchema } from '@/components/seo/JsonLd';

export const metadata: Metadata = {
  title: 'Atölye Koleksiyonları & Kategoriler',
  description:
    'Doğal soya mumları, kokulu taşlar, epoksi ahşap sunumluklar ve el dokuması Miyuki boncuk takılar. İzmir Karşıyaka atölyemizden zanaatkar dokunuşuyla üretilen tüm kategorileri keşfedin.',
  alternates: {
    canonical: '/kategoriler',
  },
  openGraph: {
    title: 'Atölye Koleksiyonları | Safirya',
    description: 'Doğal soya mumları, kokulu taşlar, epoksi sunumluklar ve Miyuki takılar.',
    url: '/kategoriler',
  },
};

export default async function CategoriesPage() {
  const categories = await getCategories();

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Anasayfa', item: '/' },
    { name: 'Kategoriler', item: '/kategoriler' },
  ]);

  return (
    <div className="bg-white min-h-[70vh]">
      <JsonLd data={breadcrumbSchema} />
      
      {/* ── Üst Başlık ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8 text-center border-b border-stone-100">
        <span className="text-[11px] font-sans uppercase tracking-[0.25em] text-[#7A7067] font-medium block">
          Safirya Atölye
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#231B18] mt-2">
          Kategorilerimize Göz Atın
        </h1>
        <p className="text-xs sm:text-sm text-[#7A7067] mt-2 max-w-xl mx-auto leading-relaxed">
          İzmir Karşıyaka atölyemizde doğal soya vaksı, masif ahşap reçine ve Japon cam boncuklarla tek tek şekillendirilen koleksiyonlarımız.
        </p>
      </div>

      {/* ── Kategori Kartları Izgarası (3 Sütunlu Sade Düzen) ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/kategoriler/${cat.slug}`}
              className="group flex flex-col bg-white border border-stone-200/80 hover:border-stone-400 rounded-xs overflow-hidden transition-all duration-300"
            >
              {/* Görsel Alanı (1:1 Kare) */}
              <div className="aspect-square w-full overflow-hidden bg-[#FAF8F5] relative">
                {cat.imageUrl ? (
                  <img
                    src={cat.imageUrl}
                    alt={`${cat.name} - Safirya`}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-700 ease-out"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-300">
                    <span className="text-xs uppercase font-mono">Görsel Yok</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Bilgi Alanı */}
              <div className="p-5 text-center flex-1 flex flex-col justify-between">
                <div>
                  <h2 className="font-serif text-lg sm:text-xl font-normal text-[#231B18] group-hover:text-[#C85A32] transition">
                    {cat.name}
                  </h2>
                  {cat.description && (
                    <p className="text-xs text-[#7A7067] mt-1.5 line-clamp-2 leading-relaxed">
                      {cat.description}
                    </p>
                  )}
                </div>

                <div className="pt-4 flex items-center justify-center gap-1.5 text-[11px] font-medium uppercase tracking-widest text-[#231B18] group-hover:text-[#C85A32] transition">
                  <span>Koleksiyonu Keşfet</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
