import React from 'react';
import type { Metadata } from 'next';
import {
  JsonLd,
  getProductSchema,
  getBreadcrumbSchema,
  ProductSchemaInput,
} from '@/components/seo/JsonLd';

interface ProductMetaEntry extends ProductSchemaInput {
  title: string;
}

const PRODUCT_CATALOG: Record<string, ProductMetaEntry> = {
  'dogal-mum-epoksi-kisiye-ozel-hediye-seti': {
    title: 'Doğal Mum & Epoksi Kişiselleştirilebilir Hediye Seti',
    name: 'Doğal Mum & Epoksi Kişiselleştirilebilir Hediye Seti',
    description:
      'Bitkisel soya mumu ve el dökümü epoksi sunumluk ile hazırlanan özel isim baskılı hediyelik set. %100 el emeği zanaat.',
    slug: 'dogal-mum-epoksi-kisiye-ozel-hediye-seti',
    price: 649,
    discountPrice: 549,
    categoryName: 'Hediye Setleri',
    image:
      'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    reviewCount: 52,
  },
  'safir-gece-soya-mumu': {
    title: 'Safir Gece Botanik Soya Mumu',
    name: 'Safir Gece Botanik Soya Mumu',
    description:
      'Lavanta, sandal ağacı ve vanilya esanslı doğal bitkisel soya mumu. Parafinsiz, dumansız 50 saat temiz yanış.',
    slug: 'safir-gece-soya-mumu',
    price: 249,
    discountPrice: 189,
    categoryName: 'Doğal Mumlar',
    image:
      'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    reviewCount: 42,
  },
  'safir-okyanus-dalgali-epoksi-sunumluk': {
    title: 'Safir Okyanus Dalgalı Epoksi Sunumluk & Tepsi',
    name: 'Safir Okyanus Dalgalı Epoksi Sunumluk & Tepsi',
    description:
      'Doğal ceviz ağacı ve safir mavi reçine dalgalarıyla zanaatkar üretimi epoksi sunumluk tepsi.',
    slug: 'safir-okyanus-dalgali-epoksi-sunumluk',
    price: 950,
    discountPrice: 855,
    categoryName: 'Epoksi Tasarımlar',
    image:
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
    rating: 5.0,
    reviewCount: 19,
  },
  'safir-geometrik-miyuki-bileklik': {
    title: 'Safir & Altın Geometrik Desenli Miyuki Bileklik',
    name: 'Safir & Altın Geometrik Desenli Miyuki Bileklik',
    description:
      'Orijinal Japon Miyuki Delica boncuklarla elde dokunan 24K altın kaplama kapamalı zarafet bilekliği.',
    slug: 'safir-geometrik-miyuki-bileklik',
    price: 420,
    categoryName: 'Miyuki Boncuk Takı',
    image:
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    reviewCount: 35,
  },
  'kisiye-ozel-isimli-soya-mumu': {
    title: 'Kişiye Özel İsimli Söz/Nişan Soya Mumu',
    name: 'Kişiye Özel İsimli Söz/Nişan Soya Mumu',
    description:
      'Özel isim ve tarih etiketli, kraft kutulu hediyelik doğal soya mumu. Söz, nişan ve etkinlik hediyeliği.',
    slug: 'kisiye-ozel-isimli-soya-mumu',
    price: 289,
    discountPrice: 239,
    categoryName: 'Doğal Mumlar',
    image:
      'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    reviewCount: 45,
  },
  'minimalist-kadin-figurlu-kokulu-tas': {
    title: 'Venüs Heykel Tasarımlı Kokulu Taş Obje',
    name: 'Venüs Heykel Tasarımlı Kokulu Taş Obje',
    description:
      'Özel taş tozu ve kalıcı esansla hazırlanan heykelsi dekoratif kokulu taş obje.',
    slug: 'minimalist-kadin-figurlu-kokulu-tas',
    price: 240,
    categoryName: 'Kokulu Taş & Seramik',
    image:
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    reviewCount: 28,
  },
  'miyuki-renkli-sans-bilekligi': {
    title: 'Miyuki Renkli Şans Bilekliği',
    name: 'Miyuki Renkli Şans Bilekliği',
    description:
      'Renkli Japon Delica boncuklarla elde dokunmuş, ayarlanabilir asansörlü şans bilekliği.',
    slug: 'miyuki-renkli-sans-bilekligi',
    price: 199,
    discountPrice: 149,
    categoryName: 'Miyuki Boncuk Takı',
    image:
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    reviewCount: 40,
  },
  'miyuki-coklu-el-emegi-bileklik': {
    title: 'Miyuki Çoklu El Emeği Bileklik',
    name: 'Miyuki Çoklu El Emeği Bileklik',
    description: 'Çoklu sıra dokuma özel tasarım Miyuki zanaat bilekliği.',
    slug: 'miyuki-coklu-el-emegi-bileklik',
    price: 249,
    discountPrice: 189,
    categoryName: 'Miyuki Boncuk Takı',
    image:
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    reviewCount: 45,
  },
  'lavanta-ozlu-seramik-obje': {
    title: 'Lavanta Özlü Seramik & Taş Obje',
    name: 'Lavanta Özlü Seramik & Taş Obje',
    description: 'Doğal lavanta esansı ile kokulandırılmış el yapımı seramik obje.',
    slug: 'lavanta-ozlu-seramik-obje',
    price: 185,
    categoryName: 'Kokulu Taş & Seramik',
    image:
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    reviewCount: 14,
  },
  'emerald-dalgali-epoksi-tepsi': {
    title: 'Emerald Dalgalı Epoksi Tepsi Seti',
    name: 'Emerald Dalgalı Epoksi Tepsi Seti',
    description:
      'Zümrüt yeşili reçine ve ceviz ağacının benzersiz uyumu ile üretilen epoksi tepsi seti.',
    slug: 'emerald-dalgali-epoksi-tepsi',
    price: 1200,
    discountPrice: 980,
    categoryName: 'Epoksi Tasarımlar',
    image:
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    reviewCount: 11,
  },
  'cicekli-pastel-miyuki-kolye': {
    title: 'Çiçekli Pastel Miyuki Kolye',
    name: 'Çiçekli Pastel Miyuki Kolye',
    description: 'Pastel tonlarda Japon cam boncuklarla işlenmiş zarif çiçek desenli kolye.',
    slug: 'cicekli-pastel-miyuki-kolye',
    price: 380,
    categoryName: 'Miyuki Boncuk Takı',
    image:
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
    rating: 4.7,
    reviewCount: 19,
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = PRODUCT_CATALOG[slug] || {
    title: 'El Yapımı Tasarım Ürün',
    name: 'El Yapımı Tasarım Parçası',
    description:
      'Safirya atölyesinde zanaatkar ellerle hazırlanan %100 el emeği tasarım parçası.',
    slug,
    price: 250,
    image:
      'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',
  };

  const canonicalUrl = `/urunler/${slug}`;

  return {
    title: product.title,
    description: product.description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${product.title} | Safirya Atölye`,
      description: product.description,
      url: canonicalUrl,
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
  const product = PRODUCT_CATALOG[slug] || {
    title: 'El Yapımı Tasarım Ürün',
    name: 'El Yapımı Tasarım Parçası',
    description:
      'Safirya atölyesinde zanaatkar ellerle hazırlanan %100 el emeği tasarım parçası.',
    slug,
    price: 250,
    image:
      'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',
    categoryName: 'El Yapımı Tasarım',
  };

  const productSchema = getProductSchema(product);
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Anasayfa', item: '/' },
    { name: 'Katalog', item: '/kategoriler' },
    { name: product.categoryName || 'Kategori', item: '/kategoriler' },
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
