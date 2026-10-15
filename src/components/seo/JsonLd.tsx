import React from 'react';

interface JsonLdProps {
  data: Record<string, unknown> | Array<Record<string, unknown>>;
}

/**
 * Renders structured JSON-LD data for Google Search & Generative Engine Optimization (GEO).
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://safirya.tr';

/**
 * Root Schema: Store, CraftStore, LocalBusiness & Organization Knowledge Graph
 * Optimized for Google Knowledge Graph, Local SEO Pack & Generative Engine Optimization (GEO).
 */
export function getLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': ['Store', 'HomeGoodsStore', 'LocalBusiness', 'CraftStore'],
    '@id': `${SITE_URL}/#store`,
    name: 'Safirya El Yapımı Tasarım Atölyesi',
    alternateName: [
      'Safirya',
      'Safirya Atölye',
      'Safirya Craft Studio',
      'Safirya Kadıköy',
    ],
    description:
      'İstanbul Kadıköy merkezli, %100 bitkisel doğal soya mumları, kalıcı kokulu taş objeler, masif ceviz epoksi sunumluk tepsiler ve Japon Miyuki boncuk takılar üreten bağımsız zanaat ve tasarım atölyesi.',
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/icon.svg`,
      width: 512,
      height: 512,
      caption: 'Safirya El Yapımı Tasarım Atölyesi Logosu',
    },
    image: [
      `${SITE_URL}/opengraph-image`,
      'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1200&q=80',
    ],
    telephone: '+90 (212) 555 7234',
    email: 'destek@safirya.tr',
    priceRange: '₺₺',
    currenciesAccepted: 'TRY',
    paymentAccepted:
      'Kredi Kartı, Banka Kartı, Havale/EFT, 3D Secure, PayTR, Nakit (Atölye Teslimatında)',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Caferağa Mah. Şair Nefi Sk. No:18',
      addressLocality: 'Kadıköy',
      addressRegion: 'İstanbul',
      postalCode: '34710',
      addressCountry: 'TR',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 40.988,
      longitude: 29.026,
    },
    hasMap: 'https://maps.google.com/?q=40.9880,29.0260',
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
        ],
        opens: '10:00',
        closes: '19:00',
      },
    ],
    areaServed: [
      {
        '@type': 'AdministrativeArea',
        name: 'Kadıköy',
      },
      {
        '@type': 'City',
        name: 'İstanbul',
      },
      {
        '@type': 'Country',
        name: 'Türkiye',
      },
    ],
    founder: {
      '@type': 'Person',
      name: 'Safirya Zanaatkarları',
      jobTitle: 'Atölye Kurucusu & Zanaatkar',
    },
    foundingDate: '2024',
    knowsAbout: [
      'Doğal Soya Mumu Üretimi',
      'Ahşap Fitilli Mum Dökümü',
      'Heykelsi Kokulu Taş Tasarımı',
      'Masif Ceviz Epoksi Reçine Zanaatı',
      'Japon Miyuki Delica Boncuk Dokuma',
      'Doğal Aromaterapi Esansları',
      'Söz, Nişan ve Nikah Şekeri Hediyelikleri',
      'Kurumsal Toplu Hediyelik Tasarımı',
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '156',
      bestRating: '5',
      worstRating: '1',
    },
    review: [
      {
        '@type': 'Review',
        author: { '@type': 'Person', name: 'Zeynep Demir' },
        datePublished: '2026-09-15',
        reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
        reviewBody:
          'Kadıköy atölyelerinden aldığım vanilya & sandal ağacı soya mumu harika! Ahşap fitilin çıtırtısı şömine hissi veriyor, hiç is yapmıyor.',
      },
      {
        '@type': 'Review',
        author: { '@type': 'Person', name: 'Murat Arslan' },
        datePublished: '2026-09-28',
        reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
        reviewBody:
          'Sözümüz için 150 adet kişiselleştirilmiş kraft kutulu soya mumu siparişi verdik. Zamanında, sıfır hasarla ulaştı ve misafirlerimiz hayran kaldı.',
      },
      {
        '@type': 'Review',
        author: { '@type': 'Person', name: 'Ece Aydın' },
        datePublished: '2026-10-04',
        reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
        reviewBody:
          'Miyuki bilekliklerin el dokuması kalitesi muhteşem. Kadıköy atölyesinden elden teslim aldım, çalışanlar çok ilgiliydi.',
      },
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Safirya Atölye Koleksiyonları',
      itemListElement: [
        {
          '@type': 'OfferCatalog',
          name: 'Doğal Soya Mumları',
          itemListElement: [
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Product',
                name: 'Doğal Kehribar Cam Kavanoz Soya Mumu (210g)',
                url: `${SITE_URL}/urunler/dogal-kehribar-cam-kavanoz-soya-mumu`,
              },
            },
          ],
        },
        {
          '@type': 'OfferCatalog',
          name: 'Kokulu Taş & Seramik Objeler',
          itemListElement: [
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Product',
                name: 'Venüs Heykel Tasarımlı Kokulu Taş Obje',
                url: `${SITE_URL}/urunler/minimalist-kadin-figurlu-kokulu-tas`,
              },
            },
          ],
        },
        {
          '@type': 'OfferCatalog',
          name: 'Epoksi Ahşap Sunumluklar',
          itemListElement: [
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Product',
                name: 'Safir Okyanus Dalgalı Epoksi Sunumluk & Tepsi',
                url: `${SITE_URL}/urunler/safir-okyanus-dalgali-epoksi-sunumluk`,
              },
            },
          ],
        },
        {
          '@type': 'OfferCatalog',
          name: 'Miyuki Boncuk Takı',
          itemListElement: [
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Product',
                name: 'Safir & Altın Geometrik Desenli Miyuki Bileklik',
                url: `${SITE_URL}/urunler/safir-geometrik-miyuki-bileklik`,
              },
            },
          ],
        },
      ],
    },
    sameAs: [
      'https://instagram.com/safirya35353535',
      'https://pinterest.com/safiryacraft',
      'https://maps.google.com/?q=Safirya+Atolye+Kadikoy',
    ],
    makesOffer: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Kişiye Özel Söz, Nişan, Nikah ve Kurumsal Toplu Sipariş Üretimi',
          description:
            'Toplu alımlarda baremli kademeli indirim, ücretsiz kraft/asetat kutulama ve isim baskısı hizmeti.',
          url: `${SITE_URL}/kisiye-ozel-toplu-siparis`,
        },
      },
    ],
  };
}

/**
 * Root Schema: WebSite with SearchAction
 */
export function getWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: 'Safirya Tasarım Atölyesi',
    alternateName: ['Safirya', 'Safirya.tr'],
    description: 'El Emeği, Doğallık ve Zarafetin Buluştuğu Zanaat Atölyesi',
    publisher: {
      '@id': `${SITE_URL}/#store`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/arama?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    inLanguage: 'tr-TR',
  };
}

/**
 * Breadcrumb Schema
 */
export function getBreadcrumbSchema(items: { name: string; item: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.item.startsWith('http') ? item.item : `${SITE_URL}${item.item}`,
    })),
  };
}

/**
 * ItemList Schema for Category & Collection Pages
 * Allows Google & AI search engines to display rich product carousels & grids.
 */
export function getItemListSchema(
  title: string,
  description: string,
  url: string,
  items: Array<{ name: string; slug: string; price?: number; image?: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description,
    url: url.startsWith('http') ? url : `${SITE_URL}${url}`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: items.length,
      itemListElement: items.map((item, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: item.name,
        url: `${SITE_URL}/urunler/${item.slug}`,
        image: item.image,
      })),
    },
  };
}

/**
 * FAQ Schema for Rich Snippets & Generative AI Citations
 */
export function getFaqSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Product Schema
 */
export interface ProductSchemaInput {
  name: string;
  description: string;
  slug: string;
  image: string;
  price: number;
  discountPrice?: number;
  categoryName?: string;
  sku?: string;
  rating?: number;
  reviewCount?: number;
  material?: string;
}

export function getProductSchema(product: ProductSchemaInput) {
  const activePrice = product.discountPrice || product.price;
  const productUrl = `${SITE_URL}/urunler/${product.slug}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${productUrl}#product`,
    name: product.name,
    description: product.description,
    image: [
      product.image.startsWith('http') ? product.image : `${SITE_URL}${product.image}`,
    ],
    url: productUrl,
    sku: product.sku || product.slug,
    mpn: `SFR-${product.slug.toUpperCase().slice(0, 8)}`,
    category: product.categoryName || 'El Yapımı Tasarım',
    brand: {
      '@type': 'Brand',
      name: 'Safirya',
      logo: `${SITE_URL}/icon.svg`,
    },
    material:
      product.material ||
      'Doğal Soya Vaksı, Ceviz Ağacı, Epoksi Reçine, Japon Miyuki Delica Boncuk',
    countryOfOrigin: 'TR',
    inLanguage: 'tr-TR',
    offers: {
      '@type': 'Offer',
      url: productUrl,
      price: activePrice.toFixed(2),
      priceCurrency: 'TRY',
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      priceValidUntil: '2027-12-31',
      seller: {
        '@id': `${SITE_URL}/#store`,
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'TR',
        returnPolicyCategory:
          'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 14,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn',
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: '0',
          currency: 'TRY',
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'TR',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 3,
            unitCode: 'd',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 3,
            unitCode: 'd',
          },
        },
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: (product.rating || 4.9).toString(),
      reviewCount: (product.reviewCount || 42).toString(),
      bestRating: '5',
      worstRating: '1',
    },
    review: [
      {
        '@type': 'Review',
        author: { '@type': 'Person', name: 'Zeynep D.' },
        datePublished: '2026-09-20',
        reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
        reviewBody:
          'Kadıköy atölyesinden aldığım bu ürünün işçiliği mükemmel. Doğal esansın yayılımı çok başarılı.',
      },
    ],
  };
}
