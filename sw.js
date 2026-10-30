// Caches the app, the image-model scripts and the model weights after the first
// online visit, so the hunt still works if the classroom Wi-Fi drops.
const CACHE = 'safety-hunt-v1';
const SHELL = ['./', 'index.html', 'style.css', 'app.js', 'data.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Network first for our own files (so edits show up), cache first for CDN/model files.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const own = new URL(e.request.url).origin === self.location.origin;
  e.respondWith(own
    ? fetch(e.request).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return res; })
        .catch(() => caches.match(e.request))
    : caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
        if (res.ok || res.type === 'opaque') { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
        return res;
      })));
});
