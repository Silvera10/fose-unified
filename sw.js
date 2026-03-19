/* ══════════════════════════════════════════════════════════
   FOSE Unified — Service Worker

   Estrategia: Network-First con fallback a cache.
   - Siempre intenta cargar la versión más nueva de la red.
   - Si la red falla (offline), sirve desde caché.
   - Cuando hay una actualización, notifica al usuario.
   ══════════════════════════════════════════════════════════ */

const CACHE_VERSION = 'fose-v2';

// Archivos esenciales a pre-cachear en la instalación
const PRECACHE = [
  './',
  './index.html',
  './css/fose.css',
  './img/escudo_colombia.png'
];

// ── INSTALL: pre-cachear archivos esenciales ──
self.addEventListener('install', event => {
  console.log('[SW] Instalando...');
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()) // Activar inmediatamente
  );
});

// ── ACTIVATE: limpiar caches viejos ──
self.addEventListener('activate', event => {
  console.log('[SW] Activado');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim()) // Tomar control inmediato
  );
});

// ── FETCH: Network-First ──
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Solo cachear requests del mismo origen
  if (url.origin !== location.origin) return;

  // No cachear requests de Supabase ni APIs externas
  if (url.href.includes('supabase') || url.href.includes('api')) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Clonar respuesta para guardar en caché
        const clone = response.clone();
        caches.open(CACHE_VERSION).then(cache => {
          cache.put(event.request, clone);
        });
        return response;
      })
      .catch(() => {
        // Sin red → servir desde caché
        return caches.match(event.request).then(cached => {
          return cached || new Response('Sin conexión', { status: 503 });
        });
      })
  );
});

// ── MESSAGE: responder a mensajes del cliente ──
self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
