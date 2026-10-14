import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://safirya.tr';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/hesabim/',
          '/sepet',
          '/odeme',
          '/*?*coupon=',
          '/*?*utm_',
        ],
      },
      {
        userAgent: ['Googlebot', 'Bingbot', 'YandexBot', 'Applebot'],
        allow: '/',
        disallow: ['/admin/', '/api/', '/hesabim/', '/sepet', '/odeme'],
      },
      {
        // Generative Engine Optimization (GEO) & AI Crawlers
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'PerplexityBot',
          'ClaudeBot',
          'anthropic-ai',
          'Google-Extended',
          'Cohere-ai',
        ],
        allow: ['/', '/llms.txt', '/llms-full.txt'],
        disallow: ['/admin/', '/api/', '/hesabim/', '/sepet', '/odeme'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
