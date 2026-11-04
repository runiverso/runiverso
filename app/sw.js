/* Runiverso App · funciona sin conexión. Sube la versión al cambiar archivos. */
const CACHE = "runiverso-app-v10";
const SHELL = ["./", "./index.html", "./app.css?v=10", "./app.js?v=10", "./data.js?v=2", "../carteles/carteles.js", "./manifest.webmanifest", "./icons/icon-192.png", "../favicon.svg"];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin && !url.hostname.endsWith("gstatic.com") && !url.hostname.endsWith("googleapis.com")) return;
  // Red primero (datos al día) y, sin conexión, lo guardado
  e.respondWith(fetch(req).then((res) => { if (res.ok) { const cp = res.clone(); caches.open(CACHE).then((c) => c.put(req, cp)); } return res; }).catch(() => caches.match(req).then((r) => r || caches.match("./index.html"))));
});
