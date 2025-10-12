// sw 9.5
const V='v9.5'; const CACHE='aerial-'+V;
const ASSETS=['./','./index.html?v=9.5','./app-v95.html?v=9.5','./audio-diagnostics.html?v=9.5','./manifest.json?v=9.5','./icon-192.png','./icon-512.png','./Chime.mp3'];
self.addEventListener('install',e=>{e.waitUntil((async()=>{const c=await caches.open(CACHE);for(const u of ASSETS){try{await c.add(u)}catch{}}await self.skipWaiting()})())});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{const ks=await caches.keys();await Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)));await self.clients.claim()})())});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const url=new URL(e.request.url);
  if(url.pathname.endsWith('.html')||url.pathname==='/'){e.respondWith((async()=>{try{const net=await fetch(e.request);const c=await caches.open(CACHE);c.put(e.request,net.clone());return net}catch{const c=await caches.open(CACHE);return (await c.match(e.request))||new Response('Offline',{status:503})}})());}
  else{e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));}
});
