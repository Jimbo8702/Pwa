const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/index.js",
  "/styles.css",
  "/manifest.webmanifest",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

const CACHE_NAME = "app-cache-v1";
const TRANSACTION_CACHE = "Transaction-Cache";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(FILES_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", function (event) {
  const currentCaches = [CACHE_NAME, TRANSACTION_CACHE];
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return cacheNames.filter(
          (cacheName) => !currentCaches.includes(cacheName)
        );
      })
      .then((cachesToDelete) => {
        return Promise.all(
          cachesToDelete.map((cacheToDelete) => {
            return caches.delete(cacheToDelete);
          })
        );
      })
      .then(() => self.clients.claim())
  );
});
self.addEventListener("fetch", (event) => {
  if (event.request.url.includes("/api/transaction")) {
    if (event.request.method == "Post") {
      if (!navigator.online) {
        let temp = event.request;
        event.respondWith(
          caches.open(TRANSACTION_CACHE).then((cache) => cache.addAll(temp))
        );
      } else {
        event.respondWith(
          caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              fetch("/api/transaction", {
                method: "POST",
                body: event.request.body,
              });
            }
            return;
          })
        );
      }
    }
  }
});
