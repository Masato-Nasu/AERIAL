// v101 SW: 最新HTML常時取得 + キャッシュ制御
const CACHE = 'aerial-v101-' + Date.now();
const ASSETS = [
  './', './hum-theremin-recorder.html?v=101',
  '../icon-192.png','../icon-512.png','../Chime.mp3'
];

self.addEventListener('install', e => e.waitUntil((async()=>{
  const c = await caches.open(CACHE);
  for (const u of ASSETS) { try { await c.add(u); } catch(_){} }
  await self.skipWaiting();
})()));

self.addEventListener('activate', e => e.waitUntil((async()=>{
  for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
  await self.clients.claim();
})()));

self.addEventListener('message', e => { if (e.data === 'SKIP_WAITING') self.skipWaiting(); });

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  const isHTML = url.pathname.endsWith('.html') || url.pathname.endsWith('/v101/') || url.pathname.endsWith('/v101');
  if (isHTML) {
    e.respondWith((async ()=>{
      try {
        const net = await fetch(new Request(e.request, {cache:'no-store'}));
        const c = await caches.open(CACHE); c.put(e.request, net.clone());
        return net;
      } catch {
        return (await caches.match(e.request)) || new Response('Offline', {status:503});
      }
    })());
  } else {
    e.respondWith((async ()=>{
      const cached = await caches.match(e.request);
      const p = fetch(e.request).then(r=>{caches.open(CACHE).then(c=>c.put(e.request,r.clone())); return r;}).catch(()=>null);
      return cached || p || new Response('Offline', {status:503});
    })());
  }
});
