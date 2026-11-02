const CACHE_NAME = 'barbercuts-v1'
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-light-32x32.png',
  '/icon-dark-32x32.png',
  '/icon.svg',
  '/apple-icon.png',
  '/placeholder-logo.png',
  '/placeholder-user.jpg',
  '/globals.css',
]

// Pages à mettre en cache pour le mode hors-ligne
const PAGES_TO_CACHE = ['/marketplace', '/salon/barber-cuts-cocody', '/salon/anchor-crown-le-barbier-marin']

// Installation du service worker — mise en cache des assets statiques
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([...STATIC_ASSETS, ...PAGES_TO_CACHE])
    })
  )
  self.skipWaiting()
})

// Activation — nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      )
    })
  )
  self.clients.claim()
})

// Stratégie de mise en cache : Cache First pour les assets statiques, Network First pour les pages
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Ignorer les requêtes non-GET
  if (request.method !== 'GET') return

  // Assets statiques : Cache First
  if (STATIC_ASSETS.includes(url.pathname) || url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request).then((response) => {
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone))
          return response
        })
      })
    )
    return
  }

  // Pages et API : Network First avec fallback cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        const responseClone = response.clone()
        if (response.ok && url.origin === self.location.origin) {
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone))
        }
        return response
      })
      .catch(() => {
        return caches.match(request).then((cached) => {
          if (cached) return cached
          // Si c'est une page HTML et qu'on est hors-ligne, afficher la page d'accueil en cache
          if (request.destination === 'document') {
            return caches.match('/')
          }
          return new Response('Hors-ligne', { status: 503, statusText: 'Hors-ligne' })
        })
      })
  )
})

// Écouter les messages du client (ex: skipWaiting, sync)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
