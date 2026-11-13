/* Runiverso App · funciona sin conexión. Sube la versión al cambiar archivos. */
const CACHE = "runiverso-app-v42";
const SHELL = ["./", "./index.html", "./app.css?v=39", "./app.js?v=42", "./data.js?v=92b1f78d", "../carteles/carteles.js?v=a3fef577", "./mapa.js?v=1", "./mapa-es.js?v=1", "./manifest.webmanifest", "./icons/icon-192.png", "../favicon.svg"];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin && !url.hostname.endsWith("gstatic.com") && !url.hostname.endsWith("googleapis.com") && !url.hostname.endsWith("cdnjs.cloudflare.com")) return;
  // Red primero (datos al día) y, sin conexión, lo guardado
  e.respondWith(fetch(req, req.mode === "navigate" ? { cache: "no-cache" } : undefined).then((res) => { if (res.ok) { const cp = res.clone(); caches.open(CACHE).then((c) => c.put(req, cp)); } return res; }).catch(() => caches.match(req).then((r) => r || caches.match("./index.html"))));
});

// Avisos de carreras
self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) { d = { title: "Runiverso", body: e.data ? e.data.text() : "" }; }
  e.waitUntil(self.registration.showNotification(d.title || "Runiverso", { body: d.body || "", icon: "icons/icon-192.png", badge: "icons/icon-192.png", tag: d.tag || "runiverso", data: { url: d.url || "./" } }));
});
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || "./";
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((cs) => {
    for (const c of cs) if (c.url.includes("/app/") && "focus" in c) { c.navigate(url); return c.focus(); }
    return self.clients.openWindow(url);
  }));
});
