const CACHE_NAME = "mm-fitness-app-v11-upload-ready";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./src/styles.css?v=11",
  "./src/app.js?v=11",
  "./src/supabase.js",
  "./src/auth.js",
  "./src/db.js",
  "./src/storage.js",
  "./assets/brand/mm-logo-signature-reference.png?v=8",
  "./assets/brand/mm-logo-splash-reference.png?v=8",
  "./assets/brand/mm-logo-nav-reference.png?v=8",
  "./assets/icons/favicon.png",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/icons/maskable-icon-512.png",
  "./assets/icons/apple-touch-icon-180.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) {
    event.respondWith(fetch(event.request));
    return;
  }
  event.respondWith(
    caches.match(event.request).then((cached) =>
      cached || fetch(event.request).catch(() => caches.match("./index.html"))
    )
  );
});
