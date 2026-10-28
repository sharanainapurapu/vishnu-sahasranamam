// On-demand audio loading with caching.
//
// Goals (see docs/audio.md):
//   - Never download the whole 200+ MB set up front. Fetch a clip only when it
//     is about to play, and prefetch just the next one.
//   - Play from a blob: object URL instead of a plain file URL. There is no
//     "right click → save" target and no obvious source in the DOM. Combined
//     with the service worker + obscured filenames this is the realistic
//     deter-casual-download ceiling for a static GitHub Pages site. It is NOT
//     DRM and cannot stop a determined user.
//   - Repeat practice (infinite loop) re-plays from the in-memory/SW cache, so
//     it costs zero extra network after the first fetch.

const base = () => import.meta.env.BASE_URL || '/'

// audioKey -> { url: objectURL, promise } so concurrent requests dedupe and a
// replay reuses the same blob URL.
const cache = new Map()

const fileUrl = (mode, audioKey) => {
  const folder = mode === 'nonTutorial' ? 'nontutorial' : 'tutorial'
  return `${base()}audio/${folder}/${audioKey}.m4a`
}

const fetchBlobUrl = async (mode, audioKey) => {
  const res = await fetch(fileUrl(mode, audioKey))
  if (!res.ok) throw new Error(`Audio fetch failed (${res.status}) for ${audioKey}`)
  const blob = await res.blob()
  return URL.createObjectURL(blob)
}

// Return a playable object URL for the given clip, fetching + caching as needed.
export const getAudioUrl = (mode, audioKey) => {
  if (!audioKey) return Promise.reject(new Error('No audioKey'))
  const id = `${mode}:${audioKey}`
  const hit = cache.get(id)
  if (hit) return hit.promise

  const promise = fetchBlobUrl(mode, audioKey).then((url) => {
    cache.set(id, { url, promise }) // overwrite with resolved url for cleanup
    return url
  })
  cache.set(id, { url: null, promise })
  return promise
}

// Warm the cache for the next clip without blocking playback. Errors are
// swallowed — a failed prefetch just means a normal fetch when it is played.
export const prefetchAudio = (mode, audioKey) => {
  if (!audioKey) return
  getAudioUrl(mode, audioKey).catch(() => {})
}

// Optional: free object URLs we no longer need. Kept simple — the data set is
// bounded and browsers reclaim these on unload, but exposing this lets a future
// caller trim memory if needed.
export const releaseAudio = (mode, audioKey) => {
  const id = `${mode}:${audioKey}`
  const hit = cache.get(id)
  if (hit?.url) URL.revokeObjectURL(hit.url)
  cache.delete(id)
}
