# Helper scripts

Python helpers used to extract audio and calibrate sloka timestamps. They are not part of the web app build.

Run every script from the repo root, because input and output paths are relative to it:

```bash
python3 scripts/calculate_timestamps.py
```

For npm commands (`npm run dev`, `npm run build`, ...) see [../docs/scripts.md](../docs/scripts.md).

## Scripts

| Script | Purpose | Input | Output |
|---|---|---|---|
| `analyze_video_text.py` | Detect sloka boundaries from on-screen text changes | `public/audio/full_slokas.mp4` | `scripts/data/sloka_timestamps_detected.json` |
| `audio_silence_detection.py` | Extract audio and detect silences between slokas | `public/audio/full_slokas.mp4` | `temp_audio.wav` (temporary, git-ignored) |
| `calculate_timestamps.py` | Interpolate timestamps from manual calibration points | calibration points in the script | `scripts/data/sloka_timestamps_accurate.json` |
| `extract_subtitles.py` | Read subtitle/metadata tracks from the source MP4 | `public/audio/full_slokas.mp4` | console output |
| `manual_timestamp_tool.py` | Extract sample frames and create a CSV for manual timestamping | `public/audio/full_slokas.mp4` | `timestamp_samples/` (git-ignored), `scripts/data/timestamps_template.csv` |
| `split_audio_simple.py` | Legacy: equal-duration split of the full MP3 | `public/audio/vishnu_sahasranamam_full.mp3` | `scripts/data/sloka_timestamps.json` |
| `split_audio_smart.py` | Legacy: silence-based split into per-sloka MP3s | `public/audio/vishnu_sahasranamam_full.mp3` | per-sloka MP3s and `timestamps.json` in `public/audio/` |

Notes:

- The source `public/audio/*.mp4` file is large and git-ignored; place it there locally before running the video-based scripts.
- `split_audio_simple.py` and `split_audio_smart.py` belong to the old per-sloka MP3 approach. The app now plays a single self-hosted file, `public/audio/full_slokas.m4a` (see [../docs/audio.md](../docs/audio.md)). `split_audio_smart.py` still writes into `public/audio/`, so anything it produces would be deployed.
- `manual_timestamp_tool.py` mentions `convert_csv_to_json.py`, which does not exist in this repo.

## Data files (`scripts/data/`)

| File | Description |
|---|---|
| `scripts/data/slokas-sample.json` | Sloka text in Sanskrit, Tamil, Telugu, Kannada, Malayalam and Hindi for all 109 slokas. Kept as the source for the v2 language scripts; not loaded by the app. |
| `scripts/data/sloka_timestamps.json` | Historical timestamp output from the equal-duration split. |
| `scripts/data/sloka_timestamps_final.json` | Historical calibrated timestamps (see [../docs/timestamp-calibration.md](../docs/timestamp-calibration.md)). |
| `scripts/data/timestamps_template.csv` | Template for entering sloka start times manually. |
| `scripts/data/sloka_tracking_template.csv` | Template for tracking sloka progress while calibrating. |

The app loads its data at runtime from `public/data/slokas-complete.json`.
