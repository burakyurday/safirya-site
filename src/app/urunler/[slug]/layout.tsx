import React from 'react';
import type { Metadata } from 'next';
import {
  JsonLd,
  getProductSchema,
  getBreadcrumbSchema,
  ProductSchemaInput,
} from '@/components/seo/JsonLd';
import { ALL_CATALOG_PRODUCTS } from '@/lib/catalog';

const CATEGORY_MATERIALS: Record<string, string> = {
  'Doğal Mumlar':
    '%100 Doğal Bitkisel Soya Vaksı, Çıtırdayan Ahşap Fitil, IFRA Sertifikalı Saf Esansiyel Yağlar',
  'Epoksi Tasarımlar':
    'Masif Doğal Fırınlanmış Ceviz Ağacı, Kristal Berrak Epoksi Reçine, Gıdaya Uygun Doğal Ahşap Yağı',
  'Miyuki Boncuk Takı':
    'Orijinal Japon Miyuki Delica Cam Boncuk, Yüksek Mukavemetli Dokuma İpi, 24K Altın Kaplama Klips',
  'Kokulu Taş & Seramik':
    'Özel Heykelsi Taş Döküm Harcı, Doğal Seramik Tozu, Kalıcı Konsantre Aromaterapi Esansı',
  'Hediye Setleri':
    'Bitkisel Soya Mumu, El Dökümü Epoksi Sunumluk, İsimli Kraft Hediye Kutusu, Zanaat Mührü',
};

function resolveProduct(slug: string): ProductSchemaInput & {
  title: string;
  categoryName: string;
} {
  const found = ALL_CATALOG_PRODUCTS.find((p) => p.slug === slug);

  if (found) {
    const material =
      CATEGORY_MATERIALS[found.categoryName] ||
      'Safirya Atölyesi Doğal Zanaat Malzemeleri';

    return {
      title: `${found.name} | Safirya Atölye`,
      name: found.name,
      description:
        found.description ||
        `${found.name} - Safirya atölyesinde zanaatkar ellerle hazırlanan %100 el emeği tasarım. Doğal ve kişiselleştirilebilir hediyelik koleksiyon parçası.`,
      slug: found.slug,
      price: found.price,
      discountPrice: found.discountPrice,
      categoryName: found.categoryName,
      image: found.image,
      rating: found.rating || 4.9,
      reviewCount: found.reviewCount || 36,
      sku: found.id,
      material,
    };
  }

  // Fallback for custom or newly added slugs
  return {
    title: 'El Yapımı Zanaat Tasarımı | Safirya Atölye',
    name: 'Safirya El Emeği Tasarım Ürünü',
    description:
      'Safirya atölyesinde zanaatkar ellerle hazırlanan %100 el emeği tasarım parçası. İzmir Karşıyaka merkezli atölye üretimi.',
    slug,
    price: 250,
    categoryName: 'El Yapımı Tasarım',
    image:
      'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    reviewCount: 24,
    material: 'Doğal Bitkisel Malzemeler, El İşi Zanaat',
  };
}

export async function generateStaticParams() {
  return ALL_CATALOG_PRODUCTS.map((p) => ({
    slug: p.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = resolveProduct(slug);
  const canonicalUrl = `/urunler/${slug}`;

  return {
    title: product.title,
    description: product.description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: product.title,
      description: product.description,
      url: canonicalUrl,
      type: 'article',
      images: [
        {
          url: product.image,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.title,
      description: product.description,
      images: [product.image],
    },
  };
}

export default async function ProductLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = resolveProduct(slug);

  const productSchema = getProductSchema(product);
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Anasayfa', item: '/' },
    { name: 'Koleksiyonlar', item: '/kategoriler' },
    { name: product.categoryName, item: '/kategoriler' },
    { name: product.name, item: `/urunler/${slug}` },
  ]);

  return (
    <>
      <JsonLd data={productSchema} />
      <JsonLd data={breadcrumbSchema} />
      {children}
    </>
  );
}
