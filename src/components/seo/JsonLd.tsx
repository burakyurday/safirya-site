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
 * Root Schema: Organization & LocalBusiness (CraftStore)
 */
export function getLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': ['Store', 'HomeGoodsStore', 'LocalBusiness'],
    '@id': `${SITE_URL}/#store`,
    name: 'Safirya El Yapımı Tasarım Atölyesi',
    alternateName: ['Safirya Atölye', 'Safirya Craft Studio'],
    description:
      'Doğal soya mumları, kalıcı kokulu taş objeler, el dökümü epoksi ahşap sunumluklar ve el dokuması Japon Miyuki boncuk takılar üreten Kadıköy merkezli zanaat atölyesi.',
    url: SITE_URL,
    logo: `${SITE_URL}/icon.svg`,
    image: `${SITE_URL}/opengraph-image`,
    telephone: '+90 (212) 555 7234',
    email: 'destek@safirya.tr',
    priceRange: '₺₺',
    currenciesAccepted: 'TRY',
    paymentAccepted: 'Cash, Credit Card, Bank Transfer, İyzico',
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
      latitude: 40.9880,
      longitude: 29.0260,
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
        name: 'İstanbul',
      },
      {
        '@type': 'Country',
        name: 'Türkiye',
      },
    ],
    sameAs: [
      'https://instagram.com/safirya.craft',
      'https://pinterest.com/safiryacraft',
    ],
    makesOffer: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Kişiye Özel Söz, Nişan ve Kurumsal Hediyelik Üretimi',
          description: 'Toplu alımlarda baremli indirim, özel koku ve isim baskılı tasarım hizmeti.',
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
    alternateName: 'Safirya.tr',
    description: 'El Emeği, Doğallık ve Zarafetin Buluştuğu Zanaat Atölyesi',
    publisher: {
      '@id': `${SITE_URL}/#store`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/kategoriler?q={search_term_string}`,
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
    image: [product.image.startsWith('http') ? product.image : `${SITE_URL}${product.image}`],
    url: productUrl,
    sku: product.sku || product.slug,
    category: product.categoryName || 'El Yapımı Tasarım',
    brand: {
      '@type': 'Brand',
      name: 'Safirya',
      logo: `${SITE_URL}/icon.svg`,
    },
    material: 'Doğal Soya Vaksı, Ceviz Ağacı, Epoksi Reçine, Japon Miyuki Delica Boncuk',
    countryOfOrigin: 'TR',
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
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
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
  };
}
