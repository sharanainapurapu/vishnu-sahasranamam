# Audio

## Model

Every sloka (tutorial mode) or bundle of ~6–7 slokas (non-tutorial mode) is its
own short clip. There is no single long track and no timestamp seeking — a clip
plays from start to end. The clips live under:

```
public/audio/tutorial/<key>.m4a      # one per individual sloka
public/audio/nontutorial/<key>.m4a   # one per bundle
```

Filenames are opaque hashes (not sloka numbers). The mapping from sloka → clip
lives in [`public/data/manifest.json`](../public/data/manifest.json).

## Encoding

All clips are re-encoded to ~64 kbps mono AAC by `build_audio_manifest.py`. For
a single speaking voice this is indistinguishable from the 128k+ originals and
roughly a third of the size. The source recordings stay in the git-ignored
`Audio Recordings/` folder; only the encoded output is committed.

The full encoded set is large (tutorial clips are long teaching recordings —
several hours in total). See the loading strategy below for why that is fine.

## Loading strategy

The app never downloads the whole set. It:

1. loads only the manifest + text on open (tiny),
2. fetches a clip on demand, as a `Blob` → `blob:` object URL
   ([`src/utils/audioLoader.js`](../src/utils/audioLoader.js)),
3. prefetches the next clip in a range while the current one plays, and
4. caches played clips in a service worker ([`public/sw.js`](../public/sw.js)),
   so the infinite repeat loop and re-visits replay from disk with no extra
   network.

So the only network cost is the first play of each clip a learner actually uses.

## Download protection

Serving via `blob:` URLs, opaque filenames, and the service-worker cache means
there is no obvious "save audio as" target and no plain file URL in the page.
This deters casual copying. It is **not** DRM: any audio a browser can play has
been downloaded, so a determined user can still capture it. True protection
would require signed URLs or encrypted streaming behind a backend, which this
static GitHub Pages site intentionally does not use.

## Regenerating

When the teacher shares new or corrected recordings, drop them into
`Audio Recordings/` and re-run:

```bash
python3 scripts/build_audio_manifest.py
python3 scripts/build_text_skeleton.py   # if new sloka numbers appeared
```
