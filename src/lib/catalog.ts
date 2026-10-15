import prisma from '@/lib/prisma';

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  icon: string | null;
}

export const fallbackCategories: CategoryItem[] = [
  {
    id: 'cat-mum',
    name: 'Doğal Mumlar',
    slug: 'dogal-mumlar',
    description: '%100 soya vaksı ve ahşap fitilli atölye mumları',
    imageUrl: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=400&q=80',
    icon: 'Flame',
  },
  {
    id: 'cat-tas',
    name: 'Kokulu Taş & Seramik',
    slug: 'kokulu-tas',
    description: 'Heykelsi figürler ve kalıcı koku hapseden taş objeler',
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80',
    icon: 'Gem',
  },
  {
    id: 'cat-epoksi',
    name: 'Epoksi Tasarımlar',
    slug: 'epoksi-tasarimlar',
    description: 'Doğal ahşap ve reçine sunumluklar, tepsiler',
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=400&q=80',
    icon: 'Palette',
  },
  {
    id: 'cat-miyuki',
    name: 'Miyuki Boncuk Takı',
    slug: 'miyuki-taki',
    description: 'Japon Delica boncuklarla elde dokunmuş bileklikler',
    imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400&q=80',
    icon: 'Sparkles',
  },
];

export async function getCategories(): Promise<CategoryItem[]> {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return fallbackCategories;
  }

  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    if (categories && categories.length > 0) {
      return categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        imageUrl: c.imageUrl,
        icon: c.icon,
      }));
    }
  } catch {
    // Veritabanı henüz hazır değilse varsayılan liste kullanılır
  }

  return fallbackCategories;
}

export interface CatalogProductItem {
  id: string;
  name: string;
  slug: string;
  categoryName: string;
  categorySlug?: string;
  brand?: string;
  price: number;
  discountPrice?: number;
  discountRate?: number;
  preparationDays?: number;
  isCustomizable?: boolean;
  scentNotes: string[];
  tags: string[];
  rating: number;
  reviewCount: number;
  image: string;
  isBestSeller?: boolean;
  isFeatured?: boolean;
  description?: string;
}

export const ALL_CATALOG_PRODUCTS: CatalogProductItem[] = [
  {
    id: 'sfr-cat-numune',
    name: 'Söz & Nişan Toplu Sipariş Numune Deneyim Kiti',
    slug: 'soz-nisan-numune-deneyim-kiti',
    categoryName: 'Özel Tasarım & Hediyelik',
    categorySlug: 'ozel-hediyelik',
    brand: 'SAFİRYA',
    price: 250,
    discountPrice: 250,
    discountRate: 0,
    preparationDays: 1,
    isCustomizable: false,
    scentNotes: ['Lavanta & Sandal', 'Madagaskar Vanilyası', 'İncir & Sedir'],
    tags: ['Numune Kiti', 'Toplu Sipariş', 'Söz & Nişan', 'Geri İadeli Kupon'],
    rating: 5.0,
    reviewCount: 88,
    image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80',
    isBestSeller: true,
    isFeatured: true,
    description: '3 adet mini doğal soya mumu, 2 kokulu taş numunesi, gerçek kraft ve şeffaf etiket örnekleri ve toplu siparişinizde birebir düşebileceğiniz ₺250 değerinde VIP hediye çeki içerir.',
  },
  {
    id: 'sfr-cat-1',
    name: 'Doğal Kehribar Cam Kavanoz Soya Mumu (210g)',
    slug: 'dogal-kehribar-cam-kavanoz-soya-mumu',
    categoryName: 'Doğal Mumlar',
    categorySlug: 'dogal-mumlar',
    brand: 'SAFİRYA',
    price: 380,
    discountPrice: 323,
    discountRate: 15,
    preparationDays: 2,
    isCustomizable: true,
    scentNotes: ['Lavanta', 'Sandal Ağacı', 'Vanilya', 'Odunsu'],
    tags: ['Soya Mumu', 'Ahşap Fitil', 'Kişiselleştirilebilir', 'Mum'],
    rating: 4.9,
    reviewCount: 42,
    image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',
    isBestSeller: true,
    isFeatured: true,
    description: '%100 doğal soya vaksı, ahşap fitilli ve saf esansiyel yağlarla dökülen el yapımı mum.',
  },
  {
    id: 'sfr-cat-2',
    name: 'Kişiye Özel İsimli Söz/Nişan Soya Mumu',
    slug: 'kisiye-ozel-isimli-soya-mumu',
    categoryName: 'Doğal Mumlar',
    categorySlug: 'dogal-mumlar',
    brand: 'SAFİRYA',
    price: 319,
    discountPrice: 271,
    discountRate: 15,
    preparationDays: 3,
    isCustomizable: true,
    scentNotes: ['Lavanta', 'Madagaskar Vanilyası', 'Çiçeksi'],
    tags: ['Soya Mumu', 'Toplu Sipariş', 'Söz & Nişan', 'Hediyelik', 'Mum'],
    rating: 4.9,
    reviewCount: 56,
    image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80',
    isBestSeller: true,
    isFeatured: true,
    description: 'Özel kraft etiketli, kuru çiçek ve keten ipli kişiselleştirilebilir nişan & söz hatırası.',
  },
  {
    id: 'sfr-cat-3',
    name: 'Safir Gece Botanik Soya Mumu',
    slug: 'safir-gece-soya-mumu',
    categoryName: 'Doğal Mumlar',
    categorySlug: 'dogal-mumlar',
    brand: 'SAFİRYA',
    price: 380,
    discountPrice: 323,
    discountRate: 15,
    preparationDays: 2,
    isCustomizable: true,
    scentNotes: ['Lavanta', 'Sandal Ağacı', 'Vanilya', 'Odunsu'],
    tags: ['Botanik Mum', 'Soya Mumu', 'Atölye Serisi', 'Mum'],
    rating: 4.9,
    reviewCount: 42,
    image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',
    isBestSeller: true,
    isFeatured: true,
    description: 'Lavanta, sandal ağacı ve vanilya notaları ile huzur dolu atölye esintisi.',
  },
  {
    id: 'sfr-cat-4',
    name: 'Doğal Mum & Epoksi Kişiselleştirilebilir Hediye Seti',
    slug: 'dogal-mum-epoksi-kisiye-ozel-hediye-seti',
    categoryName: 'Epoksi Tasarımlar',
    categorySlug: 'epoksi-tasarimlar',
    brand: 'SAFİRYA',
    price: 429,
    discountPrice: 349,
    discountRate: 18,
    preparationDays: 2,
    isCustomizable: true,
    scentNotes: ['Vanilya & Karamel', 'Fransız Lavantası', 'Ferah'],
    tags: ['Hediye Seti', 'Epoksi', 'Soya Mumu', 'Özel Tasarım'],
    rating: 4.9,
    reviewCount: 124,
    image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',
    isBestSeller: true,
    isFeatured: true,
    description: 'Bitkisel soya mumu ve el dökümü epoksi sunumluk ile hazırlanan özel isim baskılı hediyelik set.',
  },
  {
    id: 'sfr-cat-5',
    name: 'Safir Okyanus Dalgalı Epoksi Sunumluk & Tepsi',
    slug: 'safir-okyanus-dalgali-epoksi-sunumluk',
    categoryName: 'Epoksi Tasarımlar',
    categorySlug: 'epoksi-tasarimlar',
    brand: 'SAFİRYA',
    price: 950,
    discountPrice: 855,
    discountRate: 10,
    preparationDays: 5,
    isCustomizable: true,
    scentNotes: [],
    tags: ['Epoksi Tepsi', 'Ceviz Ağacı', 'Sunumluk', 'Mavi Dalga', 'Epoksi'],
    rating: 5.0,
    reviewCount: 48,
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
    isBestSeller: true,
    isFeatured: true,
    description: 'Doğal ceviz ağacı ve safir mavi reçinenin büyüleyici dalga uyumu.',
  },
  {
    id: 'sfr-cat-6',
    name: 'Ceviz Ağacı & Zümrüt Reçine Sunum Tepsisi',
    slug: 'emerald-dalgali-epoksi-tepsi',
    categoryName: 'Epoksi Tasarımlar',
    categorySlug: 'epoksi-tasarimlar',
    brand: 'SAFİRYA',
    price: 950,
    discountPrice: 890,
    discountRate: 6,
    preparationDays: 5,
    isCustomizable: true,
    scentNotes: [],
    tags: ['Epoksi Tepsi', 'Zümrüt Yeşili', 'Masif Ahşap', 'Reçine', 'Epoksi'],
    rating: 4.8,
    reviewCount: 19,
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
    isFeatured: true,
    description: 'Ultra şeffaf döküm reçine, kurutulmuş çiçekler ve mermer efektli el emeği sunumluk.',
  },
  {
    id: 'sfr-cat-7',
    name: 'Safir & Altın Geometrik Desenli Miyuki Bileklik',
    slug: 'safir-geometrik-miyuki-bileklik',
    categoryName: 'Miyuki Boncuk Takı',
    categorySlug: 'miyuki-taki',
    brand: 'SAFİRYA',
    price: 420,
    discountPrice: 349,
    discountRate: 16,
    preparationDays: 2,
    isCustomizable: false,
    scentNotes: [],
    tags: ['Miyuki Takılar', 'Japon Delica', 'El Dokuması', 'Bileklik', 'Miyuki'],
    rating: 4.9,
    reviewCount: 42,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
    isBestSeller: true,
    isFeatured: true,
    description: 'Orijinal Japon Miyuki Delica boncuklarıyla mikron düzeyinde elde dokuma bileklik.',
  },
  {
    id: 'sfr-cat-8',
    name: 'Miyuki Renkli Şans Bilekliği',
    slug: 'miyuki-renkli-sans-bilekligi',
    categoryName: 'Miyuki Boncuk Takı',
    categorySlug: 'miyuki-taki',
    brand: 'SAFİRYA',
    price: 199,
    discountPrice: 149,
    discountRate: 25,
    preparationDays: 1,
    isCustomizable: true,
    scentNotes: [],
    tags: ['Miyuki Takılar', 'Şans Bilekliği', 'Bileklik', 'Renkli Boncuk', 'Miyuki'],
    rating: 4.9,
    reviewCount: 40,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
    isFeatured: true,
    description: 'Renkli Japon Delica boncuklarla elde dokunmuş, ayarlanabilir asansörlü şans bilekliği.',
  },
  {
    id: 'sfr-cat-9',
    name: 'Miyuki Çoklu El Emeği Bileklik',
    slug: 'miyuki-coklu-el-emegi-bileklik',
    categoryName: 'Miyuki Boncuk Takı',
    categorySlug: 'miyuki-taki',
    brand: 'SAFİRYA',
    price: 249,
    discountPrice: 189,
    discountRate: 24,
    preparationDays: 1,
    isCustomizable: false,
    scentNotes: [],
    tags: ['Miyuki Takılar', 'Bileklik', 'Miyuki Boncuk', 'Takı'],
    rating: 4.9,
    reviewCount: 45,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
    description: 'Çoklu sıra dokuma özel tasarım Miyuki zanaat bilekliği.',
  },
  {
    id: 'sfr-cat-10',
    name: 'Venüs Heykel Tasarımlı Dekoratif Kokulu Taş',
    slug: 'minimalist-kadin-figurlu-kokulu-tas',
    categoryName: 'Kokulu Taş & Seramik',
    categorySlug: 'kokulu-tas',
    brand: 'SAFİRYA',
    price: 240,
    discountPrice: 199,
    discountRate: 17,
    preparationDays: 3,
    isCustomizable: true,
    scentNotes: ['Yasemin', 'Beyaz Misk', 'Pudra', 'Çiçeksi'],
    tags: ['Kokulu Taş', 'Heykel Büstü', 'Dekoratif Obje', 'Seramik', 'Taş'],
    rating: 4.9,
    reviewCount: 28,
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    isBestSeller: true,
    isFeatured: true,
    description: 'Özel taş tozu formülüyle dökülmüş, kalıcı yasemin ve beyaz misk esanslı heykelsi obje.',
  },
  {
    id: 'sfr-cat-11',
    name: 'Lavanta Özlü Seramik Obje & Buhurdanlık',
    slug: 'lavanta-ozlu-seramik-obje',
    categoryName: 'Kokulu Taş & Seramik',
    categorySlug: 'kokulu-tas',
    brand: 'SAFİRYA',
    price: 220,
    discountPrice: 185,
    discountRate: 16,
    preparationDays: 2,
    isCustomizable: false,
    scentNotes: ['Lavanta', 'Ferah', 'Çiçeksi'],
    tags: ['Kokulu Taş', 'Seramik', 'Lavanta', 'Buhurdanlık', 'Taş'],
    rating: 4.8,
    reviewCount: 14,
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    description: 'Doğal lavanta esansı ile kokulandırılmış el yapımı seramik obje.',
  },
  {
    id: 'sfr-cat-12',
    name: "Safirya x Bengi Kurtcebe Pomodoro 2'li Peçete 45x45 cm",
    slug: 'dogal-kehribar-cam-kavanoz-soya-mumu',
    categoryName: 'Sofra & Yaşam',
    categorySlug: 'dogal-mumlar',
    brand: 'SAFİRYA',
    price: 499.99,
    preparationDays: 1,
    isCustomizable: false,
    scentNotes: [],
    tags: ['Sofra', 'Keten Peçete', 'Bengi Kurtcebe', 'Mutfak', 'Peçete'],
    rating: 4.9,
    reviewCount: 22,
    image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',
    isFeatured: true,
    description: '%100 doğal keten kumaş üzerine özel baskı tasarım peçete takımı.',
  },
  {
    id: 'sfr-cat-13',
    name: "Safirya x Bengi Kurtcebe Pomodoro Keten Nakış İşlemeli 2'li Amerikan Servisi",
    slug: 'kisiye-ozel-isimli-soya-mumu',
    categoryName: 'Sofra & Yaşam',
    categorySlug: 'dogal-mumlar',
    brand: 'SAFİRYA',
    price: 699.99,
    preparationDays: 2,
    isCustomizable: false,
    scentNotes: [],
    tags: ['Sofra', 'Amerikan Servisi', 'Nakış İşleme', 'Keten', 'Mutfak'],
    rating: 4.9,
    reviewCount: 18,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
    isFeatured: true,
    description: 'El nakışı işlemeli zarif ve dayanıklı keten sofra servis takımı.',
  },
  {
    id: 'sfr-cat-14',
    name: "Toskana Jar 3'lü Saklama Kavanoz Seti",
    slug: 'dogal-kehribar-cam-kavanoz-soya-mumu',
    categoryName: 'Mutfak & Dekor',
    categorySlug: 'dogal-mumlar',
    brand: 'SAFİRYA',
    price: 1325.67,
    discountPrice: 861.69,
    discountRate: 35,
    preparationDays: 2,
    isCustomizable: false,
    scentNotes: [],
    tags: ['Kavanoz Seti', 'Mutfak', 'Cam Kavanoz', 'Bambu Kapak', 'Kavanoz'],
    rating: 4.9,
    reviewCount: 29,
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
    isBestSeller: true,
    isFeatured: true,
    description: 'Bambu kapaklı yüksek kaliteli cam kavanoz seti 970 cc / 625 cc / 400 cc.',
  },
  {
    id: 'sfr-cat-15',
    name: "Siena Bambu Kare Tablalı 4'lü Kahvaltılık Seti",
    slug: 'safir-okyanus-dalgali-epoksi-sunumluk',
    categoryName: 'Sofra & Yaşam',
    categorySlug: 'epoksi-tasarimlar',
    brand: 'SAFİRYA',
    price: 1425.69,
    discountPrice: 926.83,
    discountRate: 35,
    preparationDays: 2,
    isCustomizable: false,
    scentNotes: [],
    tags: ['Kahvaltılık Seti', 'Bambu', 'Sofra', 'Sunumluk', 'Mutfak'],
    rating: 4.8,
    reviewCount: 17,
    image: 'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=800&q=80',
    isBestSeller: true,
    description: 'Doğal bambu sunum tablası ile porselen kapaklı 4 parçalı kahvaltılık takımı.',
  },
  {
    id: 'sfr-cat-16',
    name: 'Balkabağı & Vanilya Aromalı Mum',
    slug: 'dogal-kehribar-cam-kavanoz-soya-mumu',
    categoryName: 'Doğal Mumlar',
    categorySlug: 'dogal-mumlar',
    brand: 'SAFİRYA',
    price: 220,
    discountPrice: 189,
    discountRate: 14,
    preparationDays: 1,
    isCustomizable: false,
    scentNotes: ['Vanilya', 'Narenciye', 'Ferah', 'Tatlı'],
    tags: ['Soya Mumu', 'Balkabağı', 'Vanilya', 'Doğal Esans', 'Mum'],
    rating: 4.8,
    reviewCount: 12,
    image: 'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=800&q=80',
    description: 'Sonbahar ve kış esintili tatlı vanilya ve balkabağı kokusu.',
  },
  {
    id: 'sfr-cat-17',
    name: 'Vanilya & Kahve Çekirdekli Soya Mumu',
    slug: 'safir-gece-soya-mumu',
    categoryName: 'Doğal Mumlar',
    categorySlug: 'dogal-mumlar',
    brand: 'SAFİRYA',
    price: 269,
    discountPrice: 229,
    discountRate: 15,
    preparationDays: 1,
    isCustomizable: false,
    scentNotes: ['Vanilya', 'Kahve', 'Odunsu'],
    tags: ['Soya Mumu', 'Kahve Çekirdekli', 'Vanilya', 'Hızlı Teslimat', 'Mum'],
    rating: 4.9,
    reviewCount: 18,
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    description: 'Taze kavrulmuş kahve çekirdekleri ve vanilya esansıyla enerji dolu koku.',
  },
  {
    id: 'sfr-cat-18',
    name: 'Mini Vanilya Kokulu Hediye Mum',
    slug: 'dogal-mum-epoksi-kisiye-ozel-hediye-seti',
    categoryName: 'Doğal Mumlar',
    categorySlug: 'dogal-mumlar',
    brand: 'SAFİRYA',
    price: 99,
    discountPrice: 85,
    discountRate: 14,
    preparationDays: 1,
    isCustomizable: true,
    scentNotes: ['Vanilya', 'Tatlı'],
    tags: ['Soya Mumu', 'Toplu Siparişe Uygun', 'Hediye', 'Mini Mum', 'Mum'],
    rating: 4.7,
    reviewCount: 34,
    image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80',
    description: 'Etkinlik ve düğün davetleri için mini kavanozda doğal vanilya kokulu soya mumu.',
  },
  {
    id: 'sfr-cat-19',
    name: "Glam Gümüş 4'lü Kavanoz Mum Seti",
    slug: 'safir-gece-soya-mumu',
    categoryName: 'Doğal Mumlar',
    categorySlug: 'dogal-mumlar',
    brand: 'SAFİRYA',
    price: 1157.98,
    discountPrice: 752.69,
    discountRate: 35,
    preparationDays: 2,
    isCustomizable: false,
    scentNotes: ['Vanilya', 'Lavanta', 'Sandal Ağacı', 'Odunsu'],
    tags: ['Mum Seti', 'Soya Mumu', 'Hediye Seti', 'Kavanoz Mum', 'Mum'],
    rating: 4.8,
    reviewCount: 31,
    image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80',
    isFeatured: true,
    description: "Özel metalize kavanozlarda 4 farklı koku içeren lüks hediye seti.",
  },
  {
    id: 'sfr-cat-20',
    name: "Splendid El Yapımı Dondurmalık Seti 2'li",
    slug: 'safir-okyanus-dalgali-epoksi-sunumluk',
    categoryName: 'Mutfak & Dekor',
    categorySlug: 'dogal-mumlar',
    brand: 'SAFİRYA',
    price: 1056.43,
    discountPrice: 686.68,
    discountRate: 35,
    preparationDays: 3,
    isCustomizable: false,
    scentNotes: [],
    tags: ['Mutfak', 'Cam Set', 'Dondurmalık', 'El Yapımı', 'Sofra'],
    rating: 4.9,
    reviewCount: 15,
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
    description: 'Kendinden renkli cam üfleme el yapımı cup dondurmalık ve tatlı sunum seti.',
  },
  {
    id: 'sfr-cat-21',
    name: 'Safirya Anneanne Sofraları Porselen 18 Parça Kahvaltı Seti',
    slug: 'safir-geometrik-miyuki-bileklik',
    categoryName: 'Sofra & Yaşam',
    categorySlug: 'dogal-mumlar',
    brand: 'SAFİRYA',
    price: 5999.99,
    preparationDays: 4,
    isCustomizable: false,
    scentNotes: [],
    tags: ['Kahvaltı Seti', 'Porselen', 'Sofra', 'Vintage', 'Mutfak'],
    rating: 5.0,
    reviewCount: 8,
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    isFeatured: true,
    description: 'Geleneksel desenler ve modern zarafetin birleştiği 6 kişilik porselen kahvaltı takımı.',
  },
  {
    id: 'sfr-cat-22',
    name: 'Çiçekli Pastel Miyuki Kolye',
    slug: 'cicekli-pastel-miyuki-kolye',
    categoryName: 'Miyuki Boncuk Takı',
    categorySlug: 'miyuki-taki',
    brand: 'SAFİRYA',
    price: 380,
    discountPrice: 320,
    discountRate: 15,
    preparationDays: 2,
    isCustomizable: false,
    scentNotes: [],
    tags: ['Miyuki Takılar', 'Kolye', 'Miyuki Boncuk', 'Takı', 'Çiçekli'],
    rating: 4.7,
    reviewCount: 19,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
    description: 'Pastel tonlarda Japon cam boncuklarla işlenmiş zarif çiçek desenli kolye.',
  },
];

/**
 * Türkçe karakter uyumlu normalizasyon
 */
export function normalizeTurkish(text: string): string {
  if (!text) return '';
  return text
    .toLocaleLowerCase('tr-TR')
    .replace(/İ/g, 'i')
    .replace(/I/g, 'ı')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .toLowerCase()
    .trim();
}

/**
 * Ürünleri arama metnine ve koku notasına göre filtreleyen arama motoru
 */
export function filterCatalogProducts(
  products: CatalogProductItem[],
  query: string,
  scentNote?: string
): CatalogProductItem[] {
  const cleanQuery = query ? query.trim() : '';
  const cleanScent = scentNote ? scentNote.trim() : '';

  if (!cleanQuery && !cleanScent) {
    return products;
  }

  const queryTokens = cleanQuery ? cleanQuery.split(/\s+/).filter(Boolean) : [];
  const normScent = cleanScent ? normalizeTurkish(cleanScent) : '';

  return products.filter((item) => {
    // 1. Koku notası kontrolü
    if (normScent) {
      const scentMatches = (item.scentNotes || []).some((s) =>
        normalizeTurkish(s).includes(normScent)
      );
      const tagMatches = (item.tags || []).some((t) =>
        normalizeTurkish(t).includes(normScent)
      );
      const nameMatches = normalizeTurkish(item.name).includes(normScent);
      if (!scentMatches && !tagMatches && !nameMatches) {
        return false;
      }
    }

    // 2. Arama kelimeleri kontrolü (Tüm token'lar eşleşmeli)
    if (queryTokens.length > 0) {
      const searchableFields = [
        item.name,
        item.categoryName,
        item.brand || '',
        item.description || '',
        ...(item.tags || []),
        ...(item.scentNotes || []),
      ];

      const fullNormalizedText = searchableFields
        .map((f) => normalizeTurkish(f))
        .join(' ');

      const fullTurkishLower = searchableFields
        .map((f) => f.toLocaleLowerCase('tr-TR'))
        .join(' ');

      const allTokensMatch = queryTokens.every((token) => {
        const normToken = normalizeTurkish(token);
        const lowerToken = token.toLocaleLowerCase('tr-TR');
        return (
          fullNormalizedText.includes(normToken) ||
          fullTurkishLower.includes(lowerToken)
        );
      });

      if (!allTokensMatch) {
        return false;
      }
    }

    return true;
  });
}

/**
 * İstemci tarafında hem varsayılan kataloğu hem de localStorage'daki admin ürünlerini birleştirir
 */
export function getClientCatalogProducts(): CatalogProductItem[] {
  if (typeof window === 'undefined') return ALL_CATALOG_PRODUCTS;

  try {
    const saved = localStorage.getItem('safirya_admin_products');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const adminItems: CatalogProductItem[] = parsed.map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug || p.id,
          categoryName: p.category || 'Atölye Tasarımı',
          price: Number(p.price) || 0,
          discountPrice: p.discountPrice ? Number(p.discountPrice) : undefined,
          discountRate: p.discountRate ? Number(p.discountRate) : undefined,
          rating: Number(p.rating) || 4.9,
          reviewCount: Number(p.reviewCount) || 12,
          image:
            p.images?.[0] ||
            'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',
          scentNotes: Array.isArray(p.scentNotes) ? p.scentNotes : [],
          tags: [
            p.category || 'Atölye',
            ...(Array.isArray(p.scentNotes) ? p.scentNotes : []),
          ].filter(Boolean),
          isFeatured: Boolean(p.isFeatured),
          isBestSeller: Boolean(p.isBestSeller),
          isCustomizable: Boolean(p.isCustomizable),
          description: p.shortDesc || p.description || '',
        }));

        const existingIds = new Set(adminItems.map((i) => i.id));
        return [
          ...adminItems,
          ...ALL_CATALOG_PRODUCTS.filter((i) => !existingIds.has(i.id)),
        ];
      }
    }
  } catch {}

  return ALL_CATALOG_PRODUCTS;
}

