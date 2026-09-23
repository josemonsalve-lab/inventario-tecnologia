/* Service worker: deja la app disponible sin internet. */
const CACHE = "inventario-v45";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./logo-rex.png", "./jspdf.umd.min.js", "./xlsx.mini.min.js", "./icon-192.png", "./icon-512.png", "./icon-maskable.png"];

self.addEventListener("install", e => {
  /* Se guarda archivo por archivo: si falta uno en el servidor, la actualización
     igual se instala en vez de quedar bloqueada con la versión anterior. */
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.all(SHELL.map(u => c.add(u).catch(err => console.warn("sin cachear:", u, err)))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;

  // La API de Supabase nunca se cachea: siempre datos frescos.
  if (!e.request.url.startsWith(location.origin)) return;

  // config.js primero desde la red, para que un cambio de credenciales se tome al instante.
  if (new URL(e.request.url).pathname.endsWith("/config.js")) {
    e.respondWith(fetch(e.request).then(res => {
      const copia = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copia));
      return res;
    }).catch(() => caches.match(e.request)));
    return;
  }
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      if (res.ok && new URL(e.request.url).origin === location.origin) {
        const copia = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copia));
      }
      return res;
    }).catch(() => caches.match("./index.html")))
  );
});
