// Service Worker para EKKLESIA Music - Modo Offline y Rendimiento en Escenario
const CACHE_NAME = 'ekklesia-music-v1';
const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/church-icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('SW Precache warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // No interceptar peticiones de tiempo real ni sincronización de escenario ni Gemini API
  if (
    url.pathname.startsWith('/api/live-sync') ||
    url.pathname.startsWith('/api/gemini') ||
    url.pathname.startsWith('/api/download-apk') ||
    event.request.method !== 'GET'
  ) {
    return;
  }

  // Estrategia Stale-While-Revalidate para Canciones, Artistas y Biblia
  if (
    url.pathname.startsWith('/api/songs') ||
    url.pathname.startsWith('/api/artists') ||
    url.pathname.startsWith('/api/bible')
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          const fetchPromise = fetch(event.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => cachedResponse);

          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // Para archivos estáticos de Next.js (_next/static/), Cache-First
  if (url.pathname.startsWith('/_next/static/') || url.pathname.match(/\.(png|jpg|jpeg|svg|gif|woff2|woff|ttf|css|js)$/)) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((res) => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
          }
          return res;
        });
      })
    );
    return;
  }

  // Estrategia Network-First con fallback a cache para páginas HTML
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request).then((res) => {
        if (res) return res;
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('/');
        }
      });
    })
  );
});
