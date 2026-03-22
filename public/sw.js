const CACHE_NAME = 'philiastore-v1';
const STATIC_ASSETS = [
  '/',
  '/boutique',
  '/manifest.json',
  '/logo.png',
  '/offline.html',
];

// Install : pré-cache les assets statiques
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  // Forcer l'activation immédiate sans attendre que les anciens SW ferment
  self.skipWaiting();
});

// Activate : nettoie les anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  // Prendre le contrôle immédiatement de tous les clients
  self.clients.claim();
});

// Fetch : stratégie selon le type de requête
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non-GET et les extensions de navigateur
  if (request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;

  // Requêtes Supabase → Network First avec fallback cache
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(networkFirstWithCache(request));
    return;
  }

  // Assets statiques (JS, CSS, images, fonts) → Cache First
  const isStaticAsset =
    url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|ico)$/i);

  if (isStaticAsset) {
    event.respondWith(cacheFirstWithNetwork(request));
    return;
  }

  // Navigation HTML → Network First avec fallback /offline.html
  if (request.mode === 'navigate') {
    event.respondWith(navigationWithOfflineFallback(request));
    return;
  }

  // Tout le reste → Network First avec fallback cache
  event.respondWith(networkFirstWithCache(request));
});

// Cache First : on sert depuis le cache, sinon on va sur le réseau et on met en cache
async function cacheFirstWithNetwork(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Pas de réponse réseau ni de cache — retourner une réponse vide
    return new Response('', { status: 503, statusText: 'Service Unavailable' });
  }
}

// Network First : on essaie le réseau, on met en cache, sinon on sert le cache
async function networkFirstWithCache(request) {
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response(JSON.stringify({ error: 'Hors ligne' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Navigation avec fallback /offline.html si réseau indisponible
async function navigationWithOfflineFallback(request) {
  try {
    const response = await fetch(request);
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;

    const offlinePage = await caches.match('/offline.html');
    if (offlinePage) return offlinePage;

    return new Response('<h1>Hors ligne</h1>', {
      status: 503,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }
}
