// sw.js v18-2
const CACHE='aerial-v18-2';
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['./','./index.html?v=18.2','./manifest.json?v=18.2','./hum-theremin-recorder.html?v=18.2','./Chime.mp3']))));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));
