// public/sw.js
const CACHE_NAME = 'auraos-grand-launch-v1.0'; // Grand Launch version. This forces a cache update.
// Define the essential app shell assets to be cached
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/favicon.ico',
  '/videos/hero-poster.jpg',
  '/images/social-share.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Service Worker: Caching app shell failed during install:', error);
        throw error; // This ensures that a failed cache install will cause the SW to not install.
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
          return null;
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Using a robust Network Falling Back to Cache strategy for SPAs.
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // CRITICAL: Ignore API requests, non-GET requests, and requests to other origins.
  if (url.origin !== self.origin || url.pathname.startsWith('/api/') || request.method !== 'GET') {
    return; // Do nothing, let the browser handle it.
  }

  event.respondWith(
    // 1. Try the network first.
    fetch(request)
      .then(networkResponse => {
        // If we get a valid response, cache it and return it.
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // 2. If the network fails, try to serve from the cache.
        return caches.match(request).then(cachedResponse => {
          // If the request is in the cache, return it.
          if (cachedResponse) {
            return cachedResponse;
          }

          // 3. THE FIX for SPAs: If it's a navigation request (e.g., for /showcase)
          // and it's not in the cache, serve the main index.html ('/') from the cache.
          // This allows the client-side router to take over.
          if (request.mode === 'navigate') {
            return caches.match('/');
          }

          // For other failed requests (e.g., images not in cache), just fail with a proper response.
          return new Response("Resource not available in cache and network is down.", {
            status: 404,
            statusText: "Not Found",
            headers: new Headers({ "Content-Type": "text/plain" }),
          });
        });
      })
  );
});
