// Safirya PWA Service Worker (v1.0.0)
const CACHE_NAME = 'safirya-pwa-v1';
const OFFLINE_FALLBACK_URL = '/offline';

const PRECACHE_ASSETS = [
  '/',
  '/offline',
  '/icon.svg',
  '/icons/icon-192x192.svg',
  '/icons/icon-512x512.svg',
  '/icons/icon-maskable-512x512.svg',
  '/manifest.webmanifest',
];

// 1. Kurulum (Install Event) - Çekirdek Varlıkları Önbelleğe Al
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

// 2. Aktivasyon (Activate Event) - Eski Önbellekleri Temizle
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. İstek Yakalama (Fetch Event)
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Sadece GET isteklerini önbellekle
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // Chrome eklentileri veya harici kaynakları yoksay
  if (url.origin !== self.origin) {
    return;
  }

  // A. Sayfa Gezintisi (Navigation / HTML)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Başarılı sayfayı dinamik önbelleğe kopyala
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(async () => {
          // Ağ koptuysa önce önbelleğe bak, yoksa çevrimdışı fallback göster
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          const offlinePage = await caches.match(OFFLINE_FALLBACK_URL);
          return offlinePage || Response.error();
        })
    );
    return;
  }

  // B. Statik Varlıklar (Görseller, Fontlar, CSS, SVG)
  if (
    request.destination === 'image' ||
    request.destination === 'font' ||
    request.destination === 'style' ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg')
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          // Arka planda güncelle (Stale-While-Revalidate)
          fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(request, networkResponse);
                });
              }
            })
            .catch(() => {});
          return cached;
        }

        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clone);
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // C. Standart İstekler (Network-First)
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
