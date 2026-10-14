import type { MetadataRoute } from 'next';

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
    },
    {
      url: `${baseUrl}/kategoriler`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
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

  // 2. Kategori Sayfaları
  const categorySlugs = [
    'dogal-mumlar',
    'kokulu-tas',
    'epoksi-tasarimlar',
    'miyuki-taki',
  ];
  const categoryRoutes: MetadataRoute.Sitemap = categorySlugs.map((slug) => ({
    url: `${baseUrl}/kategoriler/${slug}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.85,
  }));

  // 3. Ürün Sayfaları
  const productSlugs = [
    'dogal-mum-epoksi-kisiye-ozel-hediye-seti',
    'safir-gece-soya-mumu',
    'safir-okyanus-dalgali-epoksi-sunumluk',
    'safir-geometrik-miyuki-bileklik',
    'kisiye-ozel-isimli-soya-mumu',
    'minimalist-kadin-figurlu-kokulu-tas',
    'miyuki-renkli-sans-bilekligi',
    'miyuki-coklu-el-emegi-bileklik',
    'lavanta-ozlu-seramik-obje',
    'emerald-dalgali-epoksi-tepsi',
    'cicekli-pastel-miyuki-kolye',
  ];
  const productRoutes: MetadataRoute.Sitemap = productSlugs.map((slug) => ({
    url: `${baseUrl}/urunler/${slug}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.85,
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
