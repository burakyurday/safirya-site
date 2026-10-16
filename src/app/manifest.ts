import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Safirya El Yapımı Tasarım Atölyesi',
    short_name: 'Safirya',
    description:
      'Doğal soya mumları, kokulu taşlar, epoksi sunumluklar ve Miyuki boncuk takılar üreten İzmir Karşıyaka merkezli online zanaat atölyesi.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FAF8F5',
    theme_color: '#1B2A4A',
    lang: 'tr',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/apple-icon.svg',
        sizes: '180x180',
        type: 'image/svg+xml',
      },
    ],
  };
}
