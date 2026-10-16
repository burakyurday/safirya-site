import React from 'react';
import type { Metadata } from 'next';
import { CustomQuoteClient } from '@/components/catalog/CustomQuoteClient';
import {
  JsonLd,
  getBreadcrumbSchema,
  getFaqSchema,
} from '@/components/seo/JsonLd';

export const metadata: Metadata = {
  title: 'Kişiye Özel & Toplu Sipariş Teklifi',
  description:
    'Söz, nişan, nikah, düğün ve kurumsal etkinlikleriniz için el yapımı botanik soya mumları, kokulu taşlar ve epoksi hediyelikler. 10 adetten 500+ adede kadar atölyemizden özel indirimli teklif alın.',
  alternates: {
    canonical: '/kisiye-ozel-toplu-siparis',
  },
  openGraph: {
    title: 'Kişiye Özel & Toplu Sipariş Teklifi | Safirya Atölye',
    description:
      'Söz, nişan ve kurumsal etkinlikleriniz için baremli indirim avantajıyla kişiye özel tasarımlar atölyemizde hazırlanır.',
    url: '/kisiye-ozel-toplu-siparis',
  },
};

const TOPLU_SIPARIS_FAQS = [
  {
    question: 'Toplu hediyelik siparişlerinde minimum sipariş adedi nedir?',
    answer:
      'Kişiselleştirilebilir söz, nişan ve kurumsal siparişlerde minimum sipariş adedimiz 10 adettir. 10 adet üzeri siparişlerde baremli indirim uygulanır.',
  },
  {
    question: 'Ürünlerin üzerine isim, tarih veya logo baskısı yapılıyor mu?',
    answer:
      'Evet. Kraft etiket, şeffaf asetat veya pleksi ayna üzerine çiftlerin isimleri, nişan tarihi ya da firma logosu ücretsiz olarak profesyonel kalitede basılmaktadır.',
  },
  {
    question: 'Toplu siparişlerde hazırlık ve kargo süresi ne kadar sürer?',
    answer:
      '10-50 adet arası siparişler 3-4 iş gününde, 100+ adet arası siparişler ise 5-7 iş gününde atölyemizde özenle hazırlanıp darbe emici özel ambalajlarla kargoya verilir.',
  },
  {
    question: 'Sipariş öncesi numune talep edebilir miyim?',
    answer:
      'Evet, 50 adet ve üzeri toplu sipariş planlayan müşterilerimize atölyemizden numune ürün veya koku deneme kiti gönderilmektedir.',
  },
];

export default function CustomQuotePage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://safirya.tr';

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Anasayfa', item: '/' },
    { name: 'Kişiye Özel & Toplu Sipariş', item: '/kisiye-ozel-toplu-siparis' },
  ]);

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Kişiye Özel & Toplu Hediyelik Tasarım Hizmeti',
    provider: {
      '@type': 'LocalBusiness',
      name: 'Safirya El Yapımı Tasarım Atölyesi',
      url: siteUrl,
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Karşıyaka (Online Zanaat Atölyesi)',
        addressLocality: 'Karşıyaka',
        addressRegion: 'İzmir',
        addressCountry: 'TR',
      },
    },
    serviceType: 'Handmade Event Favors & Corporate Gifts',
    areaServed: {
      '@type': 'Country',
      name: 'TR',
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'TRY',
      price: '189.00',
      description: 'Baremli toptan indirim oranları (10+, 50+, 100+ adet)',
    },
  };

  const faqSchema = getFaqSchema(TOPLU_SIPARIS_FAQS);

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={serviceSchema} />
      <JsonLd data={faqSchema} />
      <CustomQuoteClient />
    </>
  );
}
