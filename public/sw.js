// ─── Service Worker — Icône Pointage ──────────────────────────────────────
// Gère le cache et le comportement offline de la PWA.

const CACHE_NAME = "icone-pointage-v1";

// Ressources à mettre en cache lors de l'installation
const PRECACHE_ASSETS = [
  "/",
  "/login",
  "/manifest.json",
  "/icons/icon-192x192.svg",
  "/icons/icon-512x512.svg",
];

// ─── Installation ──────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  // Forcer l'activation immédiate sans attendre que les anciens onglets soient fermés
  self.skipWaiting();
});

// ─── Activation ────────────────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ─── Stratégie : Network First avec fallback cache ─────────────────────────
// Important : Le pointage DOIT toujours passer par le réseau (pas de cache API).
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Les routes API ne sont JAMAIS mises en cache
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({ message: "Connexion Internet requise pour le pointage.", code: "OFFLINE" }),
          { status: 503, headers: { "Content-Type": "application/json" } }
        );
      })
    );
    return;
  }

  // Pour les autres ressources : Network First, fallback cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Mettre à jour le cache si la requête réussit
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        return response;
      })
      .catch(() => {
        // Fallback sur le cache
        return caches.match(request).then((cached) => {
          if (cached) return cached;
          // Page offline si rien en cache
          return caches.match("/offline");
        });
      })
  );
});
