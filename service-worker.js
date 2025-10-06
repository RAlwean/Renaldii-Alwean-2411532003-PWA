const CACHE_NAME = "weancorp-cache-v1";
const urlsToCache = [
  "index.html",
  "about.html",
  "contact.html",
  "offline.html",
  "style.css",
  "background.jpg",
  "icon-192.png",
  "icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => { if (key !== CACHE_NAME) return caches.delete(key); })
    ))
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).then(fetchRes => {
        return caches.open(CACHE_NAME).then(cache => {
          try { cache.put(event.request, fetchRes.clone()); } catch(e) {}
          return fetchRes;
        });
      }).catch(() => {
        if (event.request.mode === 'navigate') return caches.match('offline.html');
      });
    })
  );
});
