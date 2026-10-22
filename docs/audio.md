# Audio File

The app plays `full_slokas.m4a`, served from this folder (same origin as the app).

**File Details:**
- Size: ~34MB
- Duration: 36.7 minutes (2200 seconds)
- Format: M4A (AAC, 128 kbps, 44.1 kHz stereo), audio stream copied unchanged from the original MP4
- Contains: 152 sloka segments across 3 sections

The audio timeline is identical to the original MP4, so the timestamps in
`sloka_timestamps_final.json` and `../data/slokas-complete.json` apply as-is.
`src/components/Player.jsx` loads it via `${import.meta.env.BASE_URL}audio/full_slokas.m4a`,
which resolves to `/audio/...` in dev and `/vsn/audio/...` on GitHub Pages.

## Why not Google Drive?

The audio was previously streamed from Google Drive. Drive returns an HTML page
(not the media file) to browser media requests, which caused
`NotSupportedError: The element has no supported sources`.

## Regenerating

If the source MP4 changes, re-extract the audio without re-encoding (keeps the timeline exact):

```bash
ffmpeg -y -i full_slokas.mp4 -vn -map 0:a:0 -c:a copy -movflags +faststart public/audio/full_slokas.m4a
```

Do not commit the MP4 (it is >100MB and git-ignored).
