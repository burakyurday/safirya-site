import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CategoryClient, CatalogProduct } from '@/components/catalog/CategoryClient';
import {
  JsonLd,
  getBreadcrumbSchema,
  getItemListSchema,
} from '@/components/seo/JsonLd';
import { ALL_CATALOG_PRODUCTS } from '@/lib/catalog';

interface Props {
  params: Promise<{ slug: string }>;
}

const CATEGORY_META: Record<string, { title: string; desc: string }> = {
  'dogal-mumlar': {
    title: 'Doğal Soya Mumları & Botanik Mum Koleksiyonu',
    desc: '%100 doğal bitkisel soya vaksından, ahşap fitilli ve saf esansiyel aromaterapi yağlarıyla Kadıköy atölyemizde tek tek elde dökülür.',
  },
  'kokulu-tas': {
    title: 'Kokulu Taş & Seramik Heykelsi Objeler',
    desc: 'Özel heykeltıraş taş tozu formülüyle hazırlanan heykelsi figürler ve haftalarca kalıcı koku hapseden dekoratif el yapımı objeler.',
  },
  'epoksi-tasarimlar': {
    title: 'Epoksi & Masif Ahşap Tasarımlar',
    desc: 'Fırınlanmış asırlık doğal ceviz kütük zemin üzerine el dökümü safir okyanus reçine dalgalarıyla hazırlanan şık sunum tepsileri ve bardak altlıkları.',
  },
  'miyuki-taki': {
    title: 'El Dokuması Japon Miyuki Boncuk Takı',
    desc: 'Orijinal Japon Miyuki Delica cam boncuklarıyla elde ilmek ilmek işlenen geometrik bileklikler, nazar desenli tasarımlar ve kolyeler.',
  },
};

export async function generateStaticParams() {
  return [
    { slug: 'dogal-mumlar' },
    { slug: 'kokulu-tas' },
    { slug: 'epoksi-tasarimlar' },
    { slug: 'miyuki-taki' },
  ];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const meta = CATEGORY_META[slug];
  if (!meta) {
    return { title: 'Koleksiyon' };
  }
  const canonicalUrl = `/kategoriler/${slug}`;
  return {
    title: `${meta.title} | Safirya Atölye`,
    description: meta.desc,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${meta.title} | Safirya Atölye`,
      description: meta.desc,
      url: canonicalUrl,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${meta.title} | Safirya Atölye`,
      description: meta.desc,
    },
  };
}

export default async function CategoryDetailPage({ params }: Props) {
  const { slug } = await params;

  const meta = CATEGORY_META[slug];
  if (!meta) notFound();

  // Load from ALL_CATALOG_PRODUCTS
  const matchedCatalog = ALL_CATALOG_PRODUCTS.filter(
    (p) => p.categorySlug === slug
  );

  const categoryProducts: CatalogProduct[] = matchedCatalog.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    categoryName: p.categoryName,
    brand: p.brand || 'SAFİRYA',
    price: p.price,
    discountPrice: p.discountPrice,
    discountRate: p.discountRate,
    preparationDays: p.preparationDays || 2,
    isCustomizable: Boolean(p.isCustomizable),
    scentNotes: p.scentNotes || [],
    rating: p.rating || 4.9,
    reviewCount: p.reviewCount || 24,
    image: p.image,
    isBestSeller: Boolean(p.isBestSeller),
  }));

  // Tüm benzersiz koku notaları
  const allScentNotes = Array.from(
    new Set(categoryProducts.flatMap((p) => p.scentNotes))
  ).sort();

  // Schema: BreadcrumbList
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Anasayfa', item: '/' },
    { name: 'Kategoriler', item: '/kategoriler' },
    { name: meta.title, item: `/kategoriler/${slug}` },
  ]);

  // Schema: ItemList for rich snippets
  const itemListSchema = getItemListSchema(
    meta.title,
    meta.desc,
    `/kategoriler/${slug}`,
    categoryProducts
  );

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={itemListSchema} />
      <CategoryClient
        slug={slug}
        categoryTitle={meta.title}
        categoryDesc={meta.desc}
        initialProducts={categoryProducts}
        allScentNotes={allScentNotes}
      />
    </>
  );
}
