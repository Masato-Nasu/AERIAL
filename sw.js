// sw.js v8.2a — AERIAL
const SW_VERSION = 'v8.2c';
const CACHE = 'aerial-' + SW_VERSION;
const ASSETS = [
  './',
  './index.html?v=8.2c',
  './hum-theremin-recorder.html?v=8.2c',
  './manifest.json?v=8.2c',
  './icon-192.png',
  './icon-512.png',
  './Chime.mp3'
];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    try {
      const cache = await caches.open(CACHE);
      const added = new Set();
      for (const url of ASSETS) {
        const u = new URL(url, self.location).toString();
        if (added.has(u)) continue;
        try { await cache.add(u); added.add(u); } catch(e){ /* ignore */ }
      }
      try {
        const hasUp = await cache.match('./Chime.mp3');
        if (!hasUp) { await cache.add('./chime.mp3'); }
      } catch(e){}
      await self.skipWaiting();
    } catch(err) {
      await self.skipWaiting();
    }
  })());
});
self.addEventListener('activate', (e) => { e.waitUntil((async () => { const keys = await caches.keys(); await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))); await self.clients.claim(); })()); });
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  if (url.pathname.endsWith('.html') || url.pathname === '/' ) {
    e.respondWith((async () => {
      try { const net = await fetch(e.request); const cache = await caches.open(CACHE); cache.put(e.request, net.clone()); return net; }
      catch { const cache = await caches.open(CACHE); const cached = await cache.match(e.request); return cached || new Response('Offline', { status: 503 }); }
    })());
  } else { e.respondWith(caches.match(e.request).then(res => res || fetch(e.request))); }
});
self.addEventListener('message', (e) => { if (e.data === 'SKIP_WAITING') self.skipWaiting(); });
