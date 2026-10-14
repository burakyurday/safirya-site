import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CategoryClient, CatalogProduct } from '@/components/catalog/CategoryClient';
import { JsonLd, getBreadcrumbSchema } from '@/components/seo/JsonLd';

interface Props {
  params: Promise<{ slug: string }>;
}

// ──────────────────────────────────────────
// Mock veri havuzu (DB'ye geçince prisma sorgusuna dönüşecek)
// ──────────────────────────────────────────
const MOCK_PRODUCTS: Record<string, CatalogProduct[]> = {
  'dogal-mumlar': [
    {
      id: 'sfr-mum-1',
      name: 'Vanilyalı & Tarçın Doğal Soy Mum',
      slug: 'safir-gece-soya-mumu',
      categoryName: 'Soya Mumu',
      price: 249,
      discountPrice: 189,
      discountRate: 15,
      preparationDays: 1,
      isCustomizable: true,
      scentNotes: ['Vanilya', 'Tarçın'],
      rating: 4.9,
      reviewCount: 42,
      image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',
      isBestSeller: true,
    },
    {
      id: 'sfr-mum-2',
      name: 'Okyanus Esintili Epoksi Tepsi',
      slug: 'safir-okyanus-dalgali-epoksi-sunumluk',
      categoryName: 'Ev Dekor',
      price: 549,
      discountPrice: 499,
      discountRate: 15,
      preparationDays: 1,
      isCustomizable: true,
      scentNotes: [],
      rating: 4.9,
      reviewCount: 48,
      image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
      isBestSeller: true,
    },
    {
      id: 'sfr-mum-3',
      name: 'Miyuki Boncuklu El Örmesi Bileklik',
      slug: 'safir-geometrik-miyuki-bileklik',
      categoryName: 'Miyuki',
      price: 349,
      discountPrice: 189,
      discountRate: 15,
      preparationDays: 1,
      isCustomizable: true,
      scentNotes: [],
      rating: 4.9,
      reviewCount: 42,
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
      isBestSeller: false,
    },
    {
      id: 'sfr-mum-4',
      name: 'Kişiye Özel İsimli Soya Mumu',
      slug: 'kisiye-ozel-isimli-soya-mumu',
      categoryName: 'Soya Mumu',
      price: 289,
      discountPrice: 239,
      discountRate: 20,
      preparationDays: 1,
      isCustomizable: true,
      scentNotes: ['Vanilya', 'Sandal Ağacı'],
      rating: 4.9,
      reviewCount: 45,
      image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80',
      isBestSeller: false,
    },
    {
      id: 'sfr-mum-5',
      name: 'Miyuki Renkli Şans Bilekliği',
      slug: 'miyuki-renkli-sans-bilekligi',
      categoryName: 'Miyuki',
      price: 199,
      discountPrice: 149,
      discountRate: 20,
      preparationDays: 1,
      isCustomizable: true,
      scentNotes: [],
      rating: 4.9,
      reviewCount: 40,
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
      isBestSeller: false,
    },
    {
      id: 'sfr-mum-6',
      name: 'Miyuki Çoklu El Emeği Bileklik',
      slug: 'miyuki-coklu-el-emegi-bileklik',
      categoryName: 'Miyuki',
      price: 249,
      discountPrice: 189,
      discountRate: 15,
      preparationDays: 1,
      isCustomizable: false,
      scentNotes: [],
      rating: 4.9,
      reviewCount: 45,
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
      isBestSeller: false,
    },
  ],
  'kokulu-tas': [
    {
      id: 'sfr-kt-1',
      name: 'Venüs Heykel Tasarımlı Kokulu Taş',
      slug: 'minimalist-kadin-figurlu-kokulu-tas',
      categoryName: 'Kokulu Taş',
      price: 240,
      preparationDays: 3,
      isCustomizable: true,
      scentNotes: ['Yasemin', 'Beyaz Misk'],
      rating: 4.9,
      reviewCount: 28,
      image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
      isBestSeller: false,
    },
    {
      id: 'sfr-kt-2',
      name: 'Lavanta Özlü Seramik Obje',
      slug: 'lavanta-ozlu-seramik-obje',
      categoryName: 'Kokulu Taş',
      price: 185,
      preparationDays: 2,
      isCustomizable: false,
      scentNotes: ['Lavanta'],
      rating: 4.8,
      reviewCount: 14,
      image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
      isBestSeller: false,
    },
  ],
  'epoksi-tasarimlar': [
    {
      id: 'sfr-ep-1',
      name: 'Safir Okyanus Dalgalı Epoksi Sunumluk',
      slug: 'safir-okyanus-dalgali-epoksi-sunumluk',
      categoryName: 'Epoksi',
      price: 950,
      discountPrice: 855,
      discountRate: 10,
      preparationDays: 5,
      isCustomizable: true,
      scentNotes: [],
      rating: 5.0,
      reviewCount: 19,
      image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
      isBestSeller: true,
    },
    {
      id: 'sfr-ep-2',
      name: 'Emerald Dalgalı Epoksi Tepsi Seti',
      slug: 'emerald-dalgali-epoksi-tepsi',
      categoryName: 'Epoksi',
      price: 1200,
      discountPrice: 980,
      discountRate: 18,
      preparationDays: 7,
      isCustomizable: true,
      scentNotes: [],
      rating: 4.9,
      reviewCount: 11,
      image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
      isBestSeller: false,
    },
  ],
  'miyuki-taki': [
    {
      id: 'sfr-myk-1',
      name: 'Safir & Altın Geometrik Miyuki Bileklik',
      slug: 'safir-geometrik-miyuki-bileklik',
      categoryName: 'Miyuki',
      price: 420,
      preparationDays: 2,
      isCustomizable: false,
      scentNotes: [],
      rating: 4.8,
      reviewCount: 35,
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
      isBestSeller: true,
    },
    {
      id: 'sfr-myk-2',
      name: 'Çiçekli Pastel Miyuki Kolye',
      slug: 'cicekli-pastel-miyuki-kolye',
      categoryName: 'Miyuki',
      price: 380,
      preparationDays: 3,
      isCustomizable: true,
      scentNotes: [],
      rating: 4.7,
      reviewCount: 22,
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
      isBestSeller: false,
    },
  ],
};

const CATEGORY_META: Record<string, { title: string; desc: string }> = {
  'dogal-mumlar': {
    title: 'El Emeği Tasarımlar & Mumlar',
    desc: '%100 doğal soya vaksından, ahşap fitilli ve saf esansiyel yağlarla atölyemizde tek tek dökülür.',
  },
  'kokulu-tas': {
    title: 'Kokulu Taş & Seramik',
    desc: 'Özel taş tozu formülüyle hazırlanan heykelsi figürler ve kalıcı esans hapseden dekoratif objeler.',
  },
  'epoksi-tasarimlar': {
    title: 'Epoksi Ahşap Tasarımlar',
    desc: 'Doğal ceviz kütük zemin üzerine el dökümü safir reçine dalgalarıyla hazırlanan şık sunum tepsileri.',
  },
  'miyuki-taki': {
    title: 'Miyuki Boncuk Dokuma Takı',
    desc: 'Orijinal Japon Miyuki Delica boncuklarıyla elde ilmek ilmek işlenen geometrik bileklik ve kolyeler.',
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const meta = CATEGORY_META[slug];
  if (!meta) {
    return { title: 'Koleksiyon' };
  }
  const canonicalUrl = `/kategoriler/${slug}`;
  return {
    title: meta.title,
    description: meta.desc,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${meta.title} | Safirya Atölye`,
      description: meta.desc,
      url: canonicalUrl,
    },
  };
}

// ──────────────────────────────────────────
// Server Component – veri getirir, istemci bileşene iletir
// ──────────────────────────────────────────
export default async function CategoryDetailPage({ params }: Props) {
  const { slug } = await params;

  const meta = CATEGORY_META[slug];
  const products = MOCK_PRODUCTS[slug];

  if (!meta && !products) notFound();

  const categoryMeta = meta ?? { title: 'Atölye Koleksiyonu', desc: '' };
  const categoryProducts = products ?? [];

  // Tüm benzersiz koku notaları
  const allScentNotes = Array.from(
    new Set(categoryProducts.flatMap((p) => p.scentNotes))
  ).sort();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://safirya.tr';

  // Schema: BreadcrumbList
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Anasayfa', item: '/' },
    { name: 'Kategoriler', item: '/kategoriler' },
    { name: categoryMeta.title, item: `/kategoriler/${slug}` },
  ]);

  // Schema: CollectionPage & ItemList
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: categoryMeta.title,
    description: categoryMeta.desc,
    url: `${siteUrl}/kategoriler/${slug}`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: categoryProducts.map((p, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${siteUrl}/urunler/${p.slug}`,
        name: p.name,
      })),
    },
  };

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={collectionSchema} />
      <CategoryClient
        slug={slug}
        categoryTitle={categoryMeta.title}
        categoryDesc={categoryMeta.desc}
        initialProducts={categoryProducts}
        allScentNotes={allScentNotes}
      />
    </>
  );
}
