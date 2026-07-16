const CACHE = "keel-v2"
const ASSET_CACHE = "keel-assets-v2"

self.addEventListener("install", (e) => {
  self.skipWaiting()
})

self.addEventListener("activate", (e) => {
  e.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE && k !== ASSET_CACHE).map((k) => caches.delete(k)))
      ),
    ])
  )
})

self.addEventListener("fetch", (e) => {
  const { url } = e.request
  if (url.includes("/api/") || url.includes("/auth/")) return

  if (url.match(/\/assets\/.+\.[a-f0-9]{8,}\./)) {
    e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request).then((res) => { const clone = res.clone(); caches.open(ASSET_CACHE).then((c) => c.put(e.request, clone)); return res })))
    return
  }

  if (e.request.mode === "navigate" || url.match(/\.html$/) || !url.match(/\.[a-zA-Z0-9]+$/)) {
    e.respondWith(
      fetch(e.request).then((res) => { const clone = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, clone)); return res }).catch(() => caches.match(e.request).then((r) => r || caches.match("/")))
    )
    return
  }

  e.respondWith(
    caches.match(e.request).then((r) => r || fetch(e.request))
  )
})
