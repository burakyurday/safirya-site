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
        userAgent: ['Googlebot', 'Bingbot', 'YandexBot', 'Applebot', 'Baiduspider'],
        allow: '/',
        disallow: ['/admin/', '/api/', '/hesabim/', '/sepet', '/odeme'],
      },
      {
        // Generative Engine Optimization (GEO) & AI Search Crawlers
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'PerplexityBot',
          'ClaudeBot',
          'anthropic-ai',
          'Google-Extended',
          'Cohere-ai',
          'FacebookBot',
          'meta-externalagent',
        ],
        allow: ['/', '/llms.txt', '/llms-full.txt'],
        disallow: ['/admin/', '/api/', '/hesabim/', '/sepet', '/odeme'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
