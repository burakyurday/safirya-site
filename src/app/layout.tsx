import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { getSystemSettings } from '@/lib/settings';
import { getCategories } from '@/lib/catalog';
import { StoreProvider } from '@/context/StoreContext';
import { StorefrontShell } from '@/components/layout/StorefrontShell';
import {
  JsonLd,
  getLocalBusinessSchema,
  getWebSiteSchema,
} from '@/components/seo/JsonLd';
import { PwaManager } from '@/components/pwa/PwaManager';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://safirya.tr';

export const viewport: Viewport = {
  themeColor: '#231B18',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Safirya | El Yapımı Tasarım Atölyesi',
    template: '%s | Safirya Atölye',
  },
  description:
    'İzmir Karşıyaka merkezli bağımsız online zanaat atölyesi. %100 doğal soya mumları, kalıcı kokulu taş objeler, masif ceviz epoksi sunumluk tepsiler ve el dokuması Japon Miyuki boncuk takılar. Türkiye geneli sigortalı hasarsız teslimat.',
  keywords: [
    'Safirya',
    'Safirya Atölye',
    'El Yapımı Mum',
    'Doğal Soya Mumu',
    'İzmir Mum Atölyesi',
    'Karşıyaka Zanaat Tasarım',
    'Kokulu Taş Figür',
    'Epoksi Ahşap Tepsi',
    'Miyuki Boncuk Bileklik',
    'Japon Delica Boncuk Takı',
    'Toplu Hediyelik Sipariş',
    'Söz Nişan Hediyelikleri',
    'Nikah Şekeri Alternatifi',
    'Kurumsal Hediye Seti',
    'Kişiye Özel İsimli Mum',
    'İzmir Zanaat Atölyesi',
    'İzmir El Sanatları',
  ],
  authors: [{ name: 'Safirya Tasarım Atölyesi', url: siteUrl }],
  creator: 'Safirya',
  publisher: 'Safirya Atölye',
  category: 'Home Goods & Handcrafted Gifts',
  classification: 'Handmade Crafts, Soy Candles, Resin Art, Beaded Jewelry',
  formatDetection: {
    email: true,
    address: true,
    telephone: true,
  },
  alternates: {
    canonical: '/',
    languages: {
      'tr-TR': '/',
      tr: '/',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: siteUrl,
    siteName: 'Safirya El Yapımı Tasarım Atölyesi',
    title: 'Safirya | El Yapımı Tasarım Atölyesi',
    description:
      'Doğal soya mumları, kalıcı kokulu taşlar, ahşap epoksi sunumluklar ve el dokuması Miyuki takılar. İzmir Karşıyaka atölyemizden zarafet ve el emeğiyle.',
    images: [
      {
        url: `${siteUrl}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: 'Safirya El Yapımı Tasarım Atölyesi',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Safirya | El Yapımı Tasarım Atölyesi',
    description:
      'Doğal soya mumları, kokulu taşlar, ahşap epoksi sunumluklar ve el dokuması Miyuki takılar. %100 el yapımı zanaat.',
    images: [`${siteUrl}/opengraph-image`],
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icons/icon-192x192.svg', sizes: '192x192', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/icons/icon-192x192.svg', sizes: '192x192', type: 'image/svg+xml' },
      { url: '/apple-icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: ['/icon.svg'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Safirya',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  other: {
    'geo.region': 'TR-35',
    'geo.placename': 'Karşıyaka, İzmir, Türkiye',
    'geo.position': '38.4559;27.1105',
    ICBM: '38.4559, 27.1105',
    'DC.title': 'Safirya El Yapımı Tasarım Atölyesi',
    'DC.creator': 'Safirya',
    'DC.subject':
      'Doğal Soya Mumu, Kokulu Taş, Epoksi Ahşap Tepsi, Miyuki Boncuk Takı, Karşıyaka İzmir Atölyesi',
    'DC.description':
      'İzmir Karşıyaka atölyemizde özenle üretilen doğal soya mumları, kokulu taşlar, epoksi sunumluklar ve Miyuki takılar.',
    'DC.publisher': 'Safirya Atölye',
    'DC.language': 'tr',
    'DC.coverage': 'Karşıyaka, İzmir, Türkiye',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, categories] = await Promise.all([
    getSystemSettings(),
    getCategories(),
  ]);

  const localBusinessSchema = getLocalBusinessSchema();
  const webSiteSchema = getWebSiteSchema();

  return (
    <html lang="tr" className={`h-full antialiased ${cormorant.variable} ${plusJakarta.variable}`} data-scroll-behavior="smooth">
      <head>
        <JsonLd data={localBusinessSchema} />
        <JsonLd data={webSiteSchema} />
      </head>
      <body className="min-h-screen flex flex-col bg-white text-[#231B18] font-sans selection:bg-[#C85A32]/20 selection:text-[#231B18]">
        <StoreProvider>
          <StorefrontShell settings={settings} categories={categories}>
            {children}
          </StorefrontShell>
          <PwaManager />
        </StoreProvider>
      </body>

    </html>
  );
}
