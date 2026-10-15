import type { MetadataRoute } from 'next';
import { ALL_CATALOG_PRODUCTS, fallbackCategories } from '@/lib/catalog';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://safirya.tr';
  const now = new Date();

  // 1. Ana Statik Rotalar
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
      images: [
        `${baseUrl}/opengraph-image`,
        'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1200&q=80',
      ],
    },
    {
      url: `${baseUrl}/kategoriler`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/cok-satanlar`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/kisiye-ozel-toplu-siparis`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.95,
      images: [
        'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1200&q=80',
      ],
    },
    {
      url: `${baseUrl}/siparis-takip`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/favoriler`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // 2. Kategori Sayfaları (Görsellerle Birlikte)
  const categoryRoutes: MetadataRoute.Sitemap = fallbackCategories.map((cat) => ({
    url: `${baseUrl}/kategoriler/${cat.slug}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.88,
    images: cat.imageUrl ? [cat.imageUrl] : undefined,
  }));

  // 3. Tüm Ürün Sayfaları (Görsel Sitemap Entegrasyonuyla)
  const productRoutes: MetadataRoute.Sitemap = ALL_CATALOG_PRODUCTS.map((prod) => ({
    url: `${baseUrl}/urunler/${prod.slug}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: prod.isBestSeller || prod.isFeatured ? 0.9 : 0.85,
    images: prod.image ? [prod.image] : undefined,
  }));

  // 4. Kurumsal & Hukuki CMS Sayfaları
  const cmsSlugs = [
    'hakkimizda',
    'iletisim',
    'gizlilik-ve-kvkk',
    'kullanim-kosullari',
    'mesafeli-satis-sozlesmesi',
    'iade-kosullari',
  ];
  const cmsRoutes: MetadataRoute.Sitemap = cmsSlugs.map((slug) => ({
    url: `${baseUrl}/sayfa/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: slug === 'hakkimizda' || slug === 'iletisim' ? 0.8 : 0.6,
  }));

  return [
    ...staticRoutes,
    ...categoryRoutes,
    ...productRoutes,
    ...cmsRoutes,
  ];
}
