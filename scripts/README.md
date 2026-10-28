# Scripts

Python helpers that prepare the app's data from the raw teacher recordings.
They are not part of the web build — you run them by hand when the recordings
or the language script change. Both need `ffmpeg`/`ffprobe` on your PATH.

## `build_audio_manifest.py`

Reads the raw recordings from `Audio Recordings/` (git-ignored) and produces:

- `public/audio/tutorial/<key>.m4a` and `public/audio/nontutorial/<key>.m4a` —
  every clip re-encoded to ~64 kbps mono AAC (fine for a single voice, ~3x
  smaller than the 128k+ originals). Filenames are opaque hashes so sloka
  numbers never appear in a URL.
- `public/data/manifest.json` — the single source of truth for which slokas and
  bundles exist in each mode, whether each is enabled, and which audio key it
  maps to.

```bash
python3 scripts/build_audio_manifest.py --probe-only   # print the plan, no encoding
python3 scripts/build_audio_manifest.py                # encode + write manifest
```

The script resolves all the messy bits of the raw files (mixed extensions, two
naming schemes for Pūrvapīṭhikā, gaps, the combined 8–12 clip). The decisions it
bakes in are documented at the top of the file; change them there.

Missing files (e.g. Namalu sloka with no recording, non-tutorial bundles 27–30
and 51–52, Uttarapīṭhikā bundles) are written to the manifest as `enabled: false`
placeholders. When the teacher sends them, drop the file in, re-run, and they
turn on automatically.

## `build_text_skeleton.py`

Reads `manifest.json` and writes `public/data/text-content.json` — the per-sloka
multi-language text, keyed by `(section, slokaNumber)` so it always lines up with
the audio. It seeds every language field with a placeholder.

```bash
python3 scripts/build_text_skeleton.py
```

Paste the real language script over the placeholders. Re-running merges: real
text you already added is preserved, new sloka numbers are added.
