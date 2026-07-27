const CACHE_VERSION = 'golden-land-pwa-v2';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;
const APP_SHELL = ['/', '/offline.html', '/image/logo.png', '/manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => !key.startsWith(CACHE_VERSION)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

function isApiRequest(url) {
  return url.pathname.startsWith('/api/') || url.pathname.includes('/api/v1/');
}

function isStaticAsset(request, url) {
  return request.destination === 'style'
    || request.destination === 'script'
    || request.destination === 'image'
    || request.destination === 'font'
    || url.pathname.startsWith('/assets/')
    || url.pathname.startsWith('/image/');
}

async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);
  const networkPromise = fetch(request)
    .then(async (response) => {
      if (response && response.ok) {
        const cache = await caches.open(RUNTIME_CACHE);
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached);

  return cached || networkPromise;
}

async function navigationFallback(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(RUNTIME_CACHE);
    cache.put(request, response.clone());
    return response;
  } catch {
    return (await caches.match(request)) || caches.match('/offline.html');
  }
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin || isApiRequest(url)) return;

  if (request.mode === 'navigate') {
    event.respondWith(navigationFallback(request));
    return;
  }

  if (isStaticAsset(request, url)) {
    event.respondWith(staleWhileRevalidate(request));
  }
});
