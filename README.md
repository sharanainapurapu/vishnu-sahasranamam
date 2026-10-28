# Vishnu Sahasranamam Learning App for Kids — v1

A calm, interactive web app that helps children learn the Vishnu Sahasranamam through audio playback, verse-by-verse practice, and range-based repetition.

**Live App:** https://sharanainapurapu.github.io/vsn/

![Status](https://img.shields.io/badge/Status-Live-brightgreen)
![Version](https://img.shields.io/badge/Version-v1-blue)
![Deployed](https://img.shields.io/badge/Deployed-GitHub%20Pages-blue)

## What's in v1

v1 is a focused first release. It intentionally exposes a small, polished slice while the rest of the content is prepared:

- **Verses available:** only the first 10 verses of the Sahasranamam are enabled (grid, range dropdowns, and player are all limited to these).
- **Language:** English transliteration only. The other scripts (Sanskrit, Tamil, Telugu, Kannada, Malayalam, Hindi) appear in the switcher but are disabled with a "coming soon" note.
- **Playback speed:** 1x only. 0.5x / 0.75x / 2x are shown but disabled with a "coming soon" note.

These limits live behind simple flags and are easy to expand in later versions.

## Features

- **Verse-by-verse playback** - tap a verse to hear it once, with timestamp-accurate seeking into a single audio file.
- **Whole-range block repeat** - repeat the entire selected range 1, 3, 5, 10, or infinite times. Repeat applies to the range as a block, not per verse.
- **Practice range** - pick a From/To range and auto-play through it hands-free.
- **Color-coded sections** - each section (Purvapithika, Dhyanam, Sahasranamam, Uttarapithika) has its own accent color, shown on the verse card, the range dropdowns, and the footer legend.
- **Stable verse layout** - each verse keeps the same line-break shape on phone, tablet, and desktop (the font auto-scales to fit), so students memorize one consistent visual.
- **Responsive & accessible** - mobile-friendly and verified against WCAG 2.1 AA color-contrast and labeling checks.
- **Progress tracking** - completed verses are saved in the browser.

## Quick Start

```bash
git clone https://github.com/sharanainapurapu/vsn.git
cd vsn
npm install
npm run dev
```

Open the URL Vite prints (typically http://localhost:5173).

### Build for production

```bash
npm run build       # outputs to dist/
```

Deployment is automatic: pushing to `main` triggers a GitHub Actions workflow that
builds and publishes to GitHub Pages. See [docs/deployment.md](docs/deployment.md).

## Configuration (v1 gating)

The release limits are controlled in a couple of small places:

- `src/config.js` - `SHOW_LANGUAGES`, `LIMIT_RELEASE`, and `isSlokaEnabled()` (which verses are exposed). v1 enables only `section_3` (Sahasranamam) numbers 1-10.
- `src/components/Player.jsx` - `ENABLED_SPEEDS` (v1 = `[1]`).
- `src/components/LanguageSelector.jsx` - `ENABLED_LANGUAGES` (v1 = `['english']`).

To release more in a future version: widen `isSlokaEnabled()`, add speeds to `ENABLED_SPEEDS`, and add languages to `ENABLED_LANGUAGES`.

## Project Structure

```
vsn/
  docs/                            # Project documentation (see docs/README.md)
  public/
    audio/full_slokas.m4a          # Full audio (AAC, same timeline as source)
    images/swamiji.png             # Header image
    data/slokas-complete.json      # 152 entries with timestamps + text
  scripts/                         # Python helpers (not part of the build)
  src/
    components/
      Player.jsx                   # Audio player, block-repeat, speed control
      SlokaDisplay.jsx             # Verse card: per-section color + auto-fit layout
      RangeSelector.jsx            # From/To range, repeat (incl. infinite)
      SlokaGrid.jsx                # Grid of enabled verses + color-coded legend
      LanguageSelector.jsx         # Language switcher (English enabled in v1)
    utils/
      slokaLabels.js               # Verse label + section grouping helpers
      sectionTheme.js              # Single source of truth for section names + colors
    config.js                      # Feature flags + release gating
    App.jsx                        # Main app component
    main.jsx                       # Entry point
    index.css                      # Global styles with Tailwind
  index.html
  package.json
  vite.config.js
  tailwind.config.js
  postcss.config.js
```

## Content Structure

The data (`public/data/slokas-complete.json`) is organized into four sections plus an intro:

| Section | Name | Entries |
|---|---|---|
| intro | Introduction | 1 |
| section_1 | Purvapithika | 1-23 |
| section_2 | Dhyanam | 1-6 |
| section_3 | Sahasranamam | 1-108 |
| section_4 | Uttarapithika | 1-14 |

English transliteration text is sourced from [Bhajan Mala](https://www.bhajanmala.com/nodes/125). Each verse stores explicit line breaks so its on-screen shape is fixed across devices.

## Audio

A single audio track (`public/audio/full_slokas.m4a`, AAC extracted from the original video, same timeline) is served alongside the app. Playback seeks to each verse's startTime/endTime. Timestamps were manually calibrated. See [docs/timestamp-calibration.md](docs/timestamp-calibration.md).

## Documentation

- [docs/README.md](docs/README.md) - docs index
- [docs/development.md](docs/development.md) - local development
- [docs/deployment.md](docs/deployment.md) - deploying to GitHub Pages
- [docs/features.md](docs/features.md) - feature details
- [docs/audio.md](docs/audio.md) - the self-hosted audio file
- [scripts/README.md](scripts/README.md) - Python helper scripts

## Tech Stack

React 18 - Vite 4 - Tailwind CSS 3 - Lucide React - HTML5 Audio API - GitHub Pages

## Credits

- **Sloka reference:** [Bhajan Mala](https://www.bhajanmala.com/nodes/125)
- **Audio & timestamps:** user-provided recording, manually calibrated
- Made with devotion for a young learner.

**Repository:** https://github.com/sharanainapurapu/vsn
**Live App:** https://sharanainapurapu.github.io/vsn/
