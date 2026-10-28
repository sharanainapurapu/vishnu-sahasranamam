// Service worker: cache audio clips so repeat practice (infinite loop) and
// re-visits replay from disk instead of re-downloading. This is what makes the
// large per-file audio set feel fast — a clip is fetched once, then served
// locally. It also means the only network cost is the first play of each clip.
//
// Scope: only audio under /audio/ is cached here. HTML/JS/CSS use the normal
// browser cache + Vite's hashed filenames.

const CACHE = 'vsn-audio-v1'
const AUDIO_RE = /\/audio\/(tutorial|nontutorial)\/[^/]+\.m4a$/

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  if (event.request.method !== 'GET' || !AUDIO_RE.test(url.pathname)) return

  // Cache-first: audio clips are immutable (content-hashed filenames), so once
  // cached we never need to re-fetch.
  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const hit = await cache.match(event.request)
      if (hit) return hit
      const res = await fetch(event.request)
      if (res.ok) cache.put(event.request, res.clone())
      return res
    })
  )
})
