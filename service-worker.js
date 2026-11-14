const CACHE_NAME = "va-rovieng-v74";
const APP_SHELL = [
  "./",
  "./index.html",
  "./presentations.html",
  "./styles.css",
  "./script.js",
  "./manifest.webmanifest",
  "./images/va-rovieng-logo-cropped.png",
  "./images/project-area-map.jpg",
  "./images/hero-processing-equipment.png",
  "./images/hero-drill-core-samples.png",
  "./images/hero-mineral-sample.png",
  "./images/copper-sample.jpg",
  "./images/gold-sample.jpg",
  "./images/va-rovieng-favicon-48.png",
  "./images/va-rovieng-icon-180.png",
  "./images/va-rovieng-icon-192.png",
  "./images/va-rovieng-icon-512.png",
];
const APP_SHELL_PATHS = new Set(
  APP_SHELL.map((path) => new URL(path, self.location.href).pathname),
);

self.addEventListener("install", (event) => {
  const appShellRequests = APP_SHELL.map(
    (path) => new Request(new URL(path, self.location.href), { cache: "reload" }),
  );

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(appShellRequests))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((cacheName) => cacheName.startsWith("va-rovieng-") && cacheName !== CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  const networkResponse = fetch(event.request);
  const cacheUpdate = networkResponse.then(
    (response) => {
      if (
        response.ok &&
        response.type === "basic" &&
        APP_SHELL_PATHS.has(requestUrl.pathname)
      ) {
        return caches
          .open(CACHE_NAME)
          .then((cache) =>
            cache.put(new Request(event.request.url), response.clone()),
          );
      }
    },
    () => undefined,
  );
  event.waitUntil(
    cacheUpdate.catch((error) => {
      console.error("Service worker cache update failed:", error);
    }),
  );

  event.respondWith(
    networkResponse.catch((error) =>
      caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        throw error;
      }),
    ),
  );
});
