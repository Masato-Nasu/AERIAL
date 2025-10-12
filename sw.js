// sw.js v8.5 — AERIAL SonicWeather BGM + Shake Chime (no mic)
const SW_VERSION = 'v8.5';
const CACHE = 'aerial-' + SW_VERSION;
const ASSETS = [
  './',
  './index.html?v=8.5',
  './hum-theremin-recorder.html?v=8.5',
  './manifest.json?v=8.5',
  './icon-192.png',
  './icon-512.png',
  './Chime.mp3'
];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    const added = new Set();
    for (const url of ASSETS) {
      const u = new URL(url, self.location).toString();
      if (added.has(u)) continue;
      try { await cache.add(u); added.add(u); } catch(e){}
    }
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.pathname.endsWith('.html') || url.pathname === '/' ) {
    e.respondWith((async () => {
      try { const net = await fetch(e.request); const cache = await caches.open(CACHE); cache.put(e.request, net.clone()); return net; }
      catch { const cache = await caches.open(CACHE); const cached = await cache.match(e.request); return cached || new Response('Offline', { status: 503 }); }
    })());
  } else {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
  }
});
self.addEventListener('message', (e) => { if (e.data === 'SKIP_WAITING') self.skipWaiting(); });
