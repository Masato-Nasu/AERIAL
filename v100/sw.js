// sw.js (scoped to /v100/ only)
const CACHE = 'aerial-v100-scoped-1760277587703';
const ASSETS = [
  './',
  './index.html?v=100',
  './hum-theremin-recorder.html?v=100',
  './manifest.json?v=100',
  '../icon-192.png',
  '../icon-512.png',
  '../Chime.mp3'
];
self.addEventListener('install', (e) => {
  e.waitUntil((async()=>{
    const c = await caches.open(CACHE);
    for (const u of ASSETS) { try { await c.add(u); } catch(e){} }
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', (e) => {
  e.waitUntil((async()=>{
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.pathname.endsWith('.html') || url.pathname.endsWith('/v100/') || url.pathname.endsWith('/v100')) {
    e.respondWith((async()=>{
      try {
        const net = await fetch(e.request, {cache:'no-store'});
        const c = await caches.open(CACHE); c.put(e.request, net.clone());
        return net;
      } catch {
        const c = await caches.open(CACHE);
        return (await c.match(e.request)) || new Response('Offline', {status:503});
      }
    })());
  } else {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
  }
});
