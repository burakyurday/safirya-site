import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Safirya | El Yapımı Tasarım Atölyesi',
    short_name: 'Safirya',
    description:
      'Doğal soya mumları, kokulu taşlar, epoksi sunumluklar ve Miyuki boncuk takılar üreten online butik zanaat atölyesi.',
    start_url: '/?source=pwa',
    scope: '/',
    id: 'safirya-craft-pwa',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#FAF8F5',
    theme_color: '#231B18',
    lang: 'tr',
    dir: 'ltr',
    categories: ['shopping', 'lifestyle', 'crafts', 'home'],
    icons: [
      {
        src: '/icons/icon-192x192.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512x512.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icons/icon-maskable-512x512.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
    shortcuts: [
      {
        name: 'Katalog & Ürünler',
        short_name: 'Katalog',
        description: 'Tüm el yapımı doğal mum ve zanaat ürünlerini keşfedin',
        url: '/kategoriler',
        icons: [{ src: '/icons/icon-192x192.svg', sizes: '192x192', type: 'image/svg+xml' }],
      },
      {
        name: 'Atölye Kulübü & Puanlarım',
        short_name: 'Kulüp',
        description: 'Safir Puan bakiyeniz ve VIP seviye ayrıcalıklarınız',
        url: '/hesabim/sadakat',
        icons: [{ src: '/icons/icon-192x192.svg', sizes: '192x192', type: 'image/svg+xml' }],
      },
      {
        name: 'Siparişimi Takip Et',
        short_name: 'Sipariş Takip',
        description: 'Atölye üretim bandı ve kargo canlı durumunu sorgulayın',
        url: '/siparis-takip',
        icons: [{ src: '/icons/icon-192x192.svg', sizes: '192x192', type: 'image/svg+xml' }],
      },
      {
        name: 'Alışveriş Sepetim',
        short_name: 'Sepetim',
        description: 'Sepetinizdeki ürünleri ve indirimleri görüntüleyin',
        url: '/sepet',
        icons: [{ src: '/icons/icon-192x192.svg', sizes: '192x192', type: 'image/svg+xml' }],
      },
    ],
  };
}
