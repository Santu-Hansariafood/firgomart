const CORE_CACHE = "firgomart-core-v2"
const RUNTIME_CACHE = "firgomart-runtime-v2"

const CORE_ASSETS = ["/", "/manifest.json", "/favicon.ico"]

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CORE_CACHE).then(cache => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting())
  )
})

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => {
      if (![CORE_CACHE, RUNTIME_CACHE].includes(k)) return caches.delete(k)
    }))).then(() => self.clients.claim())
  )
})

self.addEventListener("fetch", event => {
  const req = event.request
  const url = new URL(req.url)

  if (req.method !== "GET") return

  if (url.origin === self.location.origin) {
    if (url.pathname.startsWith("/_next/") || url.pathname.startsWith("/assets/")) {
      event.respondWith(cacheFirst(req))
      return
    }
  }

  if (req.mode === "navigate") {
    event.respondWith(networkFirst(req))
    return
  }

  if (req.destination === "image" || req.destination === "style" || req.destination === "script") {
    event.respondWith(staleWhileRevalidate(req))
    return
  }
})

async function cacheFirst(req) {
  const cache = await caches.open(RUNTIME_CACHE)
  const match = await cache.match(req)
  if (match) return match
  const res = await fetch(req)
  cache.put(req, res.clone())
  return res
}

async function networkFirst(req) {
  const cache = await caches.open(RUNTIME_CACHE)
  try {
    const res = await fetch(req)
    cache.put(req, res.clone())
    return res
  } catch {
    const match = await cache.match(req)
    return match || caches.match("/")
  }
}

async function staleWhileRevalidate(req) {
  const cache = await caches.open(RUNTIME_CACHE)
  const cached = await cache.match(req)
  const fetchPromise = fetch(req).then(res => {
    cache.put(req, res.clone())
    return res
  }).catch(() => cached)
  return cached || fetchPromise
}
