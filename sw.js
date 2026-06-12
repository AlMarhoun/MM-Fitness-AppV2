const CACHE_NAME = "mm-fitness-app-v26-nutrition-engine";
const ASSETS = [
  "./manifest.json",
  "./src/styles.css?v=26",
  "./src/app.js?v=26",
  "./src/motion.js?v=25",
  "./src/nutritionEngine.js?v=26",
  "./src/activities.js?v=19",
  "./src/history.js?v=26",
  "./src/performance.js?v=18",
  "./src/progressCockpit.js?v=23",
  "./src/readiness.js?v=24",
  "./src/avatarEditor.js?v=24",
  "./src/roles.js",
  "./src/permissions.js",
  "./src/profile.js",
  "./src/adminData.js",
  "./src/sync.js",
  "./src/supabase.js",
  "./src/auth.js",
  "./src/db.js",
  "./src/storage.js",
  "./src/sessionPersistence.js",
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
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(ASSETS.map(async (asset) => {
        try {
          const response = await fetch(asset, { cache: "reload" });
          if (response.ok && !response.redirected) await cache.put(asset, response);
        } catch {
          // A single optional asset must not prevent the service worker from installing.
        }
      }))
    )
  );
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

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;

  // Let Safari handle page navigation directly. Vercel redirects /index.html to /,
  // and iOS rejects redirected navigation responses served by a service worker.
  if (event.request.mode === "navigate") return;

  if (url.pathname.includes("/src/")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok && !response.redirected) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }
  event.respondWith(
    caches.match(event.request).then((cached) =>
      cached || fetch(event.request).then((response) => {
        if (response.ok && !response.redirected) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
    )
  );
});
