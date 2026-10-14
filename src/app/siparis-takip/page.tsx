import React from 'react';
import type { Metadata } from 'next';
import { OrderTrackingClient } from '@/components/orders/OrderTrackingClient';
import { JsonLd, getBreadcrumbSchema } from '@/components/seo/JsonLd';

export const metadata: Metadata = {
  title: 'Canlı Sipariş Takibi & Atölye Üretim Bandı',
  description:
    'Safirya sipariş numaranız ve e-posta adresinizle ürünlerinizin döküm, kalite kontrol, paketleme ve kargo aşamalarını anlık fotoğraflarla takip edin.',
  alternates: {
    canonical: '/siparis-takip',
  },
  openGraph: {
    title: 'Canlı Sipariş Takibi | Safirya Atölye',
    description: 'Atölye üretim aşamalarını ve kargo durumunuzu anlık fotoğraflarla takip edin.',
    url: '/siparis-takip',
  },
};

export default function OrderTrackingPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Anasayfa', item: '/' },
    { name: 'Sipariş Takibi', item: '/siparis-takip' },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <OrderTrackingClient />
    </>
  );
}
