const CACHE_NAME = "potager-v21";
const ASSETS = [
  "./",
  "./index.html",
  "./style.css?v=21",
  "./app.js?v=21",
  "./manifest.json?v=21",
  "./icon-192.png?v=21",
  "./icon-512.png?v=21",
  "./icon-maskable-512.png?v=21",
  "./apple-touch-icon.png?v=21",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) {
    // Requêtes externes (météo, géocodage) : toujours réseau, jamais mises en cache,
    // pour ne pas servir de prévisions périmées.
    return;
  }
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
