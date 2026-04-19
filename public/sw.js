// Basic Service-Worker fuer "App-like"-Erlebnis und Offline-Resilienz.
//
// Strategie:
//   - App-Shell (HTML/JS/CSS/Icon) wird Cache-First geladen — App startet
//     auch ohne Netzwerk, sobald sie einmal besucht wurde.
//   - Ollama-Calls (localhost:11434) gehen IMMER ans Netzwerk — kein Caching,
//     da Antworten Modell-/Input-spezifisch und nicht idempotent sind.
//   - Andere Same-Origin-Requests: Network-First mit Cache-Fallback.
//
// Bewusst minimal gehalten: kein Workbox, keine Auto-Update-Magie. Bei
// Code-Aenderungen reicht ein harter Reload (Strg+F5).

// Version-String aendert sich mit jedem Release — aeltere Caches werden im
// activate-Handler automatisch entfernt, neue Version laedt frischen App-Shell.
const CACHE_VERSION = "mps-v2";
const APP_SHELL = ["/", "/index.html", "/icon.svg", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Ollama-Calls: niemals cachen, immer Netzwerk.
  if (url.hostname === "localhost" && url.port === "11434") {
    return; // default browser handling
  }

  // Nur GET, nur same-origin
  if (event.request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          // Erfolgreiche GETs in Cache stellen (best effort)
          if (response.ok && response.type === "basic") {
            const clone = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match("/index.html") as Promise<Response>);
    }),
  );
});
