import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ProductCard } from '@/components/catalog/ProductCard';
import {
  JsonLd,
  getBreadcrumbSchema,
  getItemListSchema,
} from '@/components/seo/JsonLd';

export const metadata: Metadata = {
  title: 'Çok Satanlar Koleksiyonu',
  description:
    'Safirya atölyesinin en çok sevilen ve tercih edilen doğal botanik soya mumları, el dökümü epoksi sunumlukları ve Japon Miyuki takıları.',
  alternates: {
    canonical: '/cok-satanlar',
  },
  openGraph: {
    title: 'Çok Satanlar | Safirya Atölye',
    description: 'En çok tercih edilen el yapımı tasarımlar.',
    url: '/cok-satanlar',
  },
};

const bestSellers = [
  {
    id: 'sfr-1',
    name: 'Safir Gece Botanik Soya Mumu (210g Kehribar Cam)',
    slug: 'dogal-kehribar-cam-kavanoz-soya-mumu',
    categoryName: 'Doğal Mumlar',
    brand: 'SAFİRYA',
    price: 380.0,
    discountPrice: 323.0,
    discountRate: 15,
    preparationDays: 2,
    image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',
    isBestSeller: true,
  },
  {
    id: 'sfr-3',
    name: 'Safir Okyanus Dalgalı Doğal Ahşap Epoksi Sunumluk',
    slug: 'safir-okyanus-dalgali-epoksi-sunumluk',
    categoryName: 'Epoksi Tasarımlar',
    brand: 'SAFİRYA',
    price: 950.0,
    discountPrice: 855.0,
    discountRate: 10,
    preparationDays: 5,
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
    isBestSeller: true,
  },
  {
    id: 'sfr-4',
    name: 'Safir & Altın Geometrik Desenli Japon Miyuki Boncuk Bileklik',
    slug: 'safir-geometrik-miyuki-bileklik',
    categoryName: 'Miyuki Boncuk Takı',
    brand: 'SAFİRYA',
    price: 420.0,
    discountPrice: 349.0,
    preparationDays: 2,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
    isBestSeller: true,
  },
  {
    id: 'sfr-2',
    name: 'Venüs & David Heykel Tasarımlı Dekoratif Kokulu Taş Seti',
    slug: 'kisiye-ozel-isimli-soya-mumu',
    categoryName: 'Kokulu Taş & Seramik',
    brand: 'SAFİRYA',
    price: 240.0,
    discountPrice: 199.0,
    preparationDays: 3,
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    isBestSeller: true,
  },
  {
    id: 'sfr-5',
    name: 'Toskana Jar 3\'lü Bambu Kapaklı Saklama Kavanoz Seti',
    slug: 'dogal-kehribar-cam-kavanoz-soya-mumu',
    categoryName: 'Mutfak',
    brand: 'SAFİRYA',
    price: 1325.67,
    discountPrice: 861.69,
    preparationDays: 2,
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
    isBestSeller: true,
  },
  {
    id: 'sfr-6',
    name: 'Siena Bambu Kare Tablalı 4\'lü Kahvaltılık Seti',
    slug: 'safir-okyanus-dalgali-epoksi-sunumluk',
    categoryName: 'Sofra',
    brand: 'SAFİRYA',
    price: 1425.69,
    discountPrice: 926.83,
    preparationDays: 2,
    image: 'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=800&q=80',
    isBestSeller: true,
  },
  {
    id: 'sfr-7',
    name: 'Safirya x Bengi Kurtcebe Pomodoro 2\'li Keten Peçete Seti',
    slug: 'safir-gece-soya-mumu',
    categoryName: 'Sofra',
    brand: 'SAFİRYA',
    price: 499.99,
    preparationDays: 1,
    image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80',
    isBestSeller: true,
  },
  {
    id: 'sfr-8',
    name: 'Glam Gümüş 4\'lü Kavanoz Mum Seti Mor - Kırmızı 110 gr',
    slug: 'kisiye-ozel-isimli-soya-mumu',
    categoryName: 'Mum',
    brand: 'SAFİRYA',
    price: 1157.98,
    discountPrice: 752.69,
    preparationDays: 2,
    image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',
    isBestSeller: true,
  },
];

export default function BestSellersPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Anasayfa', item: '/' },
    { name: 'Çok Satanlar', item: '/cok-satanlar' },
  ]);

  const itemListSchema = getItemListSchema(
    'Safirya Çok Satanlar Koleksiyonu',
    'İzmir Karşıyaka atölyemizde müşterilerimizin en çok tercih ettiği, doğal malzemeler ve zanaatkar dokunuşuyla üretilen favori parçalar.',
    '/cok-satanlar',
    bestSellers
  );

  return (
    <div className="bg-white min-h-[70vh]">
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={itemListSchema} />

      {/* ── Üst Başlık ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8 border-b border-stone-100 text-center">
        {/* Breadcrumb */}
        <nav className="flex items-center justify-center gap-2 text-xs text-[#7A7067] mb-4">
          <Link href="/" className="hover:text-[#C85A32] transition">Anasayfa</Link>
          <span>/</span>
          <span className="text-[#231B18] font-medium">Çok Satanlar</span>
        </nav>

        <span className="text-[11px] font-sans uppercase tracking-[0.25em] text-[#7A7067] font-semibold block">
          Atölye Seçkisi
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#231B18] mt-2">
          Çok Satanlar Koleksiyonu
        </h1>
        <p className="text-xs sm:text-sm text-[#7A7067] mt-2 max-w-xl mx-auto leading-relaxed">
          İzmir Karşıyaka atölyemizde müşterilerimizin en çok tercih ettiği, doğal malzemeler ve zanaatkar dokunuşuyla üretilen favori parçalar.
        </p>
      </div>

      {/* ── Ürün Izgarası (4 Sütunlu Sade Düzen) ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-7">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} variant="simple" />
          ))}
        </div>
      </div>
    </div>
  );
}
