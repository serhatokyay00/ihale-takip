self.addEventListener("install", (e) => self.skipWaiting());
self.addEventListener("activate", (e) => self.clients.claim());
self.addEventListener("fetch", (e) => {
  // ag oncelikli, offline'da basarisiz olursa sessizce gecer
  e.respondWith(fetch(e.request).catch(() => new Response("", { status: 200 })));
});
