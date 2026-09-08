/*
 * Offline support for Sunny Town. The point is a car ride with no signal, not
 * a full offline-first app, so the strategy is deliberately simple:
 * navigations go to the network first, everything else is served from cache
 * while a fresh copy is fetched in the background.
 */
// Bump whenever the app shell or playback architecture changes. This release
// replaces browser speech with bundled MP3 clips, so retaining v1 would leave
// an installed iPhone running the silent JavaScript indefinitely.
const CACHE = "sunny-town-v6";
const APP_SHELL = ["/", "/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png"];
const AUDIO_MANIFEST = "/audio/manifest.json";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then(async (cache) => {
        await cache.addAll([...APP_SHELL, AUDIO_MANIFEST]);
        const response = await fetch(AUDIO_MANIFEST);
        const clips = await response.json();
        // cache.addAll uses normal full-file GETs. Audio elements request byte
        // ranges (206), and partial responses cannot be stored by Cache API.
        // Pre-caching the 2.2 MB library is what makes spoken words genuinely
        // available on a car ride with no signal.
        await cache.addAll(clips);
      })
      .catch(() => undefined)
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put("/", copy));
          return response;
        })
        .catch(() => caches.match("/").then((cached) => cached ?? Response.error())),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          // Cache API rejects 206 Partial Content responses from <audio>.
          if (response.ok && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached ?? network;
    }),
  );
});
