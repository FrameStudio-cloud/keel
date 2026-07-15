const CACHE = "keel-v1"

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(["/", "/offline"]))
  )
})

self.addEventListener("fetch", (e) => {
  if (e.request.url.includes("/api/") || e.request.url.includes("/auth/")) {
    return
  }
  e.respondWith(
    caches.match(e.request).then((r) => r || fetch(e.request))
  )
})

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  )
})
