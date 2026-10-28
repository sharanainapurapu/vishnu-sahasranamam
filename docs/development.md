# 🛠️ Development Guide

Complete guide for developing, testing, and deploying the Vishnu Sahasranamam Learning App.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Development Commands](#development-commands)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have:

- **Node.js** 16.x or higher ([Download](https://nodejs.org/))
- **npm** 8.x or higher (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))
- **GitHub account** (for deployment)

Check your versions:
```bash
node --version   # Should be v16.x or higher
npm --version    # Should be 8.x or higher
git --version    # Any recent version
```

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/sharanainapurapu/vsn.git
cd vsn
```

### 2. Install Dependencies

```bash
npm install
```

This installs:
- React 18
- Vite 4
- Tailwind CSS 3
- Lucide React (icons)
- gh-pages (deployment)

---

## Development Commands

### Start Development Server

```bash
npm run dev
```

**What it does:**
- Starts Vite dev server on `http://localhost:5174`
- Enables Hot Module Replacement (HMR)
- Auto-reloads on file changes
- Uses `BASE_URL = "/"` for local paths

**When to use:** Daily development work

---

### Build for Production

```bash
npm run build
```

**What it does:**
- Creates optimized production build in `dist/` folder
- Minifies JavaScript and CSS
- Uses `BASE_URL = "/vsn/"` for GitHub Pages
- Generates source maps

**Output:**
```
dist/
├── index.html           # Main HTML (0.48 KB)
├── assets/
│   ├── index-*.js       # Bundled JS (~158 KB)
│   └── index-*.css      # Bundled CSS (~19 KB)
└── data/
    └── slokas-complete.json
```

**When to use:** Before deploying to production

---

### Preview Production Build

```bash
npm run preview
```

**What it does:**
- Serves the `dist/` folder locally
- Runs on `http://localhost:4173`
- Tests production build before deploying

**When to use:** To verify production build works correctly

---

### Clean Build Artifacts

```bash
npm run clean
```

**What it does:**
- Removes `dist/` folder
- Removes `node_modules/.cache/`
- Fresh start for builds

**When to use:** When you encounter build issues

---

## Testing

### Test Locally (Development Mode)

```bash
npm run test:local
```

**This is an alias for:** `npm run dev`

**What to test:**
- ✅ App loads on http://localhost:5174
- ✅ Slokas display correctly
- ✅ Audio plays from `public/audio/full_slokas.m4a`
- ✅ Range selector works
- ✅ Auto-play functions
- ✅ Progress saves in localStorage
- ✅ Language switcher works

---

### Test Production Build Locally

```bash
npm run test:build
```

**What it does:**
- Builds production version
- Serves it on http://localhost:4173

**What to test:**
- ✅ All features work as in dev mode
- ✅ Paths are correct (`/vsn/` base)
- ✅ No console errors
- ✅ Performance is optimized

---

### Manual Testing Checklist

**Before Every Deployment:**

- [ ] Development server starts without errors
- [ ] All slokas load (152 total)
- [ ] Audio plays correctly
- [ ] Range mode works (e.g., 1-10)
- [ ] Auto-play continues through range
- [ ] Repeat functionality works
- [ ] Language switcher changes text
- [ ] Progress is saved and restored
- [ ] Production build has no errors
- [ ] Preview mode works correctly

---

## Deployment

### Deploy to GitHub Pages

```bash
npm run deploy
```

**What it does:**
1. Runs `npm run build` (via predeploy hook)
2. Creates/updates `gh-pages` branch
3. Pushes `dist/` contents to `gh-pages` branch
4. GitHub Pages serves from that branch

**Live URL:** https://sharanainapurapu.github.io/vsn/

**When to use:** After testing and ready to publish

---

### Deploy Locally (Without GitHub)

```bash
npm run deploy:local
```

**What it does:**
- Builds production version
- Serves it on `http://localhost:3000`
- Uses `serve` package (installed on-demand)

**When to use:** 
- Test production build without deploying
- Demo the app offline
- Share with local network

---

### Manual Deployment Steps

If `npm run deploy` doesn't work, deploy manually:

```bash
# 1. Build
npm run build

# 2. Create gh-pages branch (first time only)
git checkout -b gh-pages

# 3. Copy dist contents to root
cp -r dist/* .

# 4. Commit
git add .
git commit -m "Deploy to GitHub Pages"

# 5. Push
git push origin gh-pages --force

# 6. Go back to main
git checkout main
```

---

## Project Structure

```
vsn/
├── .github/workflows/deploy.yml    # GitHub Pages deployment
├── docs/                           # Project documentation (see docs/README.md)
│   ├── README.md                   # Docs index
│   ├── development.md
│   ├── deployment.md
│   ├── scripts.md
│   ├── features.md
│   ├── audio.md
│   ├── data-format.md
│   ├── timestamp-calibration.md
│   └── archive/                    # Older guides and reports
├── public/                         # Static assets (copied to dist/)
│   ├── audio/
│   │   └── full_slokas.m4a         # Full audio (AAC, ~34 MB)
│   ├── images/
│   │   └── swamiji.png             # Header image
│   └── data/
│       └── slokas-complete.json    # 152 entries with timestamps + text
├── scripts/                        # Python helpers (not part of the build)
│   ├── README.md
│   ├── *.py
│   └── data/                       # Templates, old timestamp outputs, future-version text
├── src/
│   ├── components/
│   │   ├── Player.jsx              # Audio player with timestamp seeking
│   │   ├── SlokaDisplay.jsx        # Displays sloka text
│   │   ├── RangeSelector.jsx       # Range and repeat settings
│   │   ├── SlokaGrid.jsx           # Grid view of all slokas
│   │   └── LanguageSelector.jsx    # Language switcher
│   ├── utils/
│   │   ├── slokaLabels.js          # Sloka label + section grouping helpers
│   │   └── sectionTheme.js         # Section names + color theme (single source)
│   ├── config.js                   # Feature flags + v1 release gating
│   ├── App.jsx                     # Main app component
│   ├── main.jsx                    # Entry point
│   └── index.css                   # Global styles with Tailwind
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── dist/                           # Build output (generated)
└── node_modules/                   # Dependencies (generated)
```

---

## Configuration Files

### vite.config.js

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/vsn/' : '/',
})
```

**Key settings:**
- `base: '/vsn/'` - GitHub Pages base path (production)
- `base: '/'` - Local development base path

**To change repo name:**
If you fork to `my-app`, change to: `base: '/my-app/'`

---

### package.json Scripts Explained

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `vite` | Start development server |
| `build` | `vite build` | Build for production |
| `preview` | `vite preview` | Preview production build |
| `predeploy` | `npm run build` | Auto-runs before deploy |
| `deploy` | `gh-pages -d dist` | Deploy to GitHub Pages |
| `deploy:local` | Build + serve locally | Test production locally |
| `clean` | Remove build artifacts | Clean slate |
| `test:local` | Alias for `dev` | Development testing |
| `test:build` | Build + preview | Production testing |

---

## Environment Variables

### Vite Built-in Variables

Available in your code via `import.meta.env`:

```javascript
import.meta.env.MODE        // 'development' or 'production'
import.meta.env.BASE_URL    // '/' or '/vsn/'
import.meta.env.PROD        // true in production
import.meta.env.DEV         // true in development
```

**Example usage in code:**
```javascript
const basePath = import.meta.env.BASE_URL
fetch(`${basePath}data/slokas-complete.json`)
```

---

## Troubleshooting

### Issue: "npm run dev" fails

**Solution:**
```bash
npm run clean
rm -rf node_modules
npm install
npm run dev
```

---

### Issue: Build fails

**Error:** `vite: not found`

**Solution:**
```bash
npm install
```

---

### Issue: Blank page on GitHub Pages

**Possible causes:**
1. Wrong base path in `vite.config.js`
2. Data file not loading
3. Cache issue

**Solutions:**
```bash
# 1. Check vite.config.js has correct repo name
# 2. Clear cache and rebuild
npm run clean
npm run build
npm run deploy

# 3. Hard refresh browser (Ctrl+F5 or Cmd+Shift+R)
```

---

### Issue: Localhost works, but GitHub Pages doesn't

**Cause:** Different base paths

**Solution:** Use `import.meta.env.BASE_URL` in all fetch calls:
```javascript
// ❌ Wrong
fetch('/data/file.json')
fetch('./data/file.json')

// ✅ Correct
const base = import.meta.env.BASE_URL
fetch(`${base}data/file.json`)
```

---

### Issue: Audio doesn't play

**Possible causes:**
1. `public/audio/full_slokas.m4a` missing or not deployed
2. Network issue
3. Stale cached bundle (hard refresh)

**Solutions:**
1. Check `public/audio/full_slokas.m4a` exists (see [audio.md](audio.md) to regenerate)
2. In DevTools Network tab, the audio request should return 200/206 with `audio/mp4` content-type
3. Test with browser console open (F12)

---

### Issue: Changes not showing after deploy

**Solution:**
```bash
# 1. Clear gh-pages branch
git push origin --delete gh-pages

# 2. Clean and redeploy
npm run clean
npm run deploy

# 3. Wait 2-3 minutes for GitHub Pages to rebuild
# 4. Hard refresh browser
```

---

## Performance Optimization

### Current Bundle Sizes

```
index.html:       0.48 KB (gzipped: 0.31 KB)
index-*.css:     19.30 KB (gzipped: 4.23 KB)
index-*.js:     158.70 KB (gzipped: 50.73 KB)
```

### Tips for Optimization

1. **Lazy load components** (future):
```javascript
const Player = lazy(() => import('./components/Player'))
```

2. **Optimize images**: Use WebP format for any images

3. **Enable service worker**: For offline capability

4. **Audio size**: Audio is a ~34MB AAC file; re-encode to mono 96 kbps (`-c:a aac -b:a 96k -ac 1`) if a smaller file is needed

---

## Git Workflow

### Daily Development

```bash
# 1. Pull latest changes
git pull origin main

# 2. Create feature branch
git checkout -b feature/your-feature

# 3. Make changes and test
npm run dev

# 4. Commit changes
git add .
git commit -m "Add your feature"

# 5. Push to GitHub
git push origin feature/your-feature

# 6. Create Pull Request on GitHub
```

### Quick Deploy

```bash
# On main branch
git add .
git commit -m "Update feature"
git push origin main
npm run deploy
```

---

## Maintenance

### Update Dependencies

```bash
# Check outdated packages
npm outdated

# Update all to latest
npm update

# Update specific package
npm install react@latest
```

### Security Audit

```bash
# Check for vulnerabilities
npm audit

# Fix automatically
npm audit fix

# Fix with breaking changes
npm audit fix --force
```

---

## Additional Resources

- **Vite Docs**: https://vitejs.dev/
- **React Docs**: https://react.dev/
- **Tailwind CSS**: https://tailwindcss.com/
- **GitHub Pages**: https://pages.github.com/

---

## Support

For issues or questions:
1. Check this guide first
2. Search existing GitHub issues
3. Create new issue with details
4. Include error messages and console logs

**Repository:** https://github.com/sharanainapurapu/vsn
**Live App:** https://sharanainapurapu.github.io/vsn/

---

**Last Updated:** October 22, 2026
