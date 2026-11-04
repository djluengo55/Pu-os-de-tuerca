// Guarda el juego en el teléfono para que se pueda jugar sin internet.
// Con internet baja siempre la versión nueva; sin internet usa lo guardado.
const CACHE = 'punos-v1';
const FILES = ['./', 'index.html', 'estilo.css', 'juego.js', 'three.module.min.js', 'manifest.webmanifest', 'icono.svg', 'icono-192.png', 'icono-512.png'];
self.addEventListener('install', (e) => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES))); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.open(CACHE).then((c) =>
    fetch(e.request)
      .then((r) => { if (r && (r.ok || r.type === 'opaque')) c.put(e.request, r.clone()); return r; })
      .catch(() => c.match(e.request, { ignoreSearch: true }))
  ));
});
