// sw.js v20 — AERIAL Distributable (force update)
const V='v20.0'; const CACHE='aerial-'+V;
const ASSETS=[
  './',
  './index.html?v=20',
  './hum-theremin-recorder.html?v=20',
  './manifest.json?v=20',
  './icon-192.png',
  './icon-512.png',
  './Chime.mp3'
];

self.addEventListener('install', e => {
  e.waitUntil((async()=>{
    const c = await caches.open(CACHE);
    for (const u of ASSETS){ try{ await c.add(u); }catch{} }
    await self.skipWaiting(); // 直ちに新SWへ
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async()=>{
    const ks = await caches.keys();
    await Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))); // 旧キャッシュ全削除
    await self.clients.claim(); // 直ちに制御権を取得
  })());
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.pathname.endsWith('.html') || url.pathname === '/') {
    // ネット優先 + キャッシュ更新
    e.respondWith((async()=>{
      try{
        const net = await fetch(e.request, {cache:'no-store'});
        const c = await caches.open(CACHE); c.put(e.request, net.clone());
        return net;
      }catch{
        const c = await caches.open(CACHE);
        return (await c.match(e.request)) || new Response('Offline', {status:503});
      }
    })());
  } else {
    // キャッシュ優先（無ければネット）
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
  }
});
