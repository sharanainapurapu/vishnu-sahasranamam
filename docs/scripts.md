# 📜 Quick Scripts Reference

Quick reference for all npm scripts and common commands.

## 🚀 Quick Start

```bash
npm install          # Install dependencies
npm run dev          # Start development server
npm run deploy       # Deploy to GitHub Pages
```

---

## 📦 NPM Scripts

### Development

```bash
npm run dev
# Starts: http://localhost:5174
# Auto-reload on file changes
# Uses BASE_URL = "/"
```

### Build

```bash
npm run build
# Creates: dist/ folder
# Uses BASE_URL = "/vsn/"
# Minified and optimized
```

### Preview

```bash
npm run preview
# Serves: http://localhost:4173
# Tests production build locally
```

### Deploy

```bash
npm run deploy
# 1. Builds production
# 2. Pushes to gh-pages branch
# 3. Live at: https://sharanainapurapu.github.io/vsn/
```

### Deploy Locally

```bash
npm run deploy:local
# Serves: http://localhost:3000
# Production build without GitHub
```

### Clean

```bash
npm run clean
# Removes: dist/ and node_modules/.cache/
# Use when build issues occur
```

### Test

```bash
npm run test:local      # Same as npm run dev
npm run test:build      # Build + preview
```

---

## 🔧 Git Commands

### Setup (First Time)

```bash
git clone https://github.com/sharanainapurapu/vsn.git
cd vsn
npm install
```

### Daily Workflow

```bash
git pull origin main              # Get latest changes
git add .                         # Stage changes
git commit -m "Your message"      # Commit
git push origin main              # Push to GitHub
```

### Quick Deploy Workflow

```bash
git add .
git commit -m "Update feature"
git push origin main
npm run deploy
```

---

## 🧪 Testing Commands

### Test Development

```bash
# Start dev server
npm run dev

# Open browser: http://localhost:5174
# Test all features
# Check console for errors (F12)
```

### Test Production Build

```bash
# Build and preview
npm run test:build

# Open browser: http://localhost:4173
# Verify everything works
# Check network tab for correct paths
```

### Test Live Site

```bash
# Deploy
npm run deploy

# Wait 2-3 minutes
# Visit: https://sharanainapurapu.github.io/vsn/
# Test all features
# Hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
```

---

## 🐛 Debugging Commands

### Check Versions

```bash
node --version       # Should be v16+
npm --version        # Should be 8+
git --version        # Any recent version
```

### Clear Everything

```bash
npm run clean                    # Clear build cache
rm -rf node_modules             # Remove dependencies
npm install                     # Reinstall
```

### Check Dev Server

```bash
# If dev server won't start
pkill -f vite                   # Kill any running Vite
npm run dev                     # Start fresh
```

### Verify Build

```bash
npm run build
ls -lh dist/                    # Check files created
cat dist/index.html             # Check HTML content
```

---

## 🌐 Deployment Troubleshooting

### Force Redeploy

```bash
# Delete gh-pages branch
git push origin --delete gh-pages

# Clean and redeploy
npm run clean
npm run deploy
```

### Check Deployment Status

```bash
# Check if gh-pages branch exists
git ls-remote --heads origin

# Should show:
# refs/heads/gh-pages
# refs/heads/main
```

### Manual Deploy (If npm run deploy fails)

```bash
# 1. Build
npm run build

# 2. Install gh-pages if needed
npm install gh-pages --save-dev

# 3. Deploy
npx gh-pages -d dist
```

---

## 📁 File Operations

### Check Project Size

```bash
du -sh .                        # Total size
du -sh node_modules/            # Dependencies size
du -sh dist/                    # Build size
```

### List Build Files

```bash
ls -lh dist/
ls -lh dist/assets/
ls -lh dist/data/
```

### Check Data Files

```bash
cat public/data/slokas-complete.json | head -20
wc -l public/data/slokas-complete.json     # Count lines
```

---

## 🔍 Search & Find

### Find Files

```bash
find . -name "*.jsx"                    # All JSX files
find . -name "*.json"                   # All JSON files
find . -type f -size +1M                # Files over 1MB
```

### Search in Files

```bash
grep -r "slokas-complete" src/          # Find references
grep -r "BASE_URL" .                    # Find BASE_URL usage
```

---

## 🗄️ Database/Data Commands

### Validate JSON

```bash
# Check if JSON is valid
cat public/data/slokas-complete.json | jq . > /dev/null
echo $?   # Should print 0 if valid
```

### Count Slokas

```bash
# Count slokas in JSON
cat public/data/slokas-complete.json | jq '.slokas | length'
# Should output: 152
```

### Extract Metadata

```bash
# Get metadata
cat public/data/slokas-complete.json | jq '.metadata'
```

---

## 🎨 Styling Commands

### Check Tailwind

```bash
# Rebuild Tailwind CSS
npm run build

# Check generated CSS size
ls -lh dist/assets/*.css
```

---

## 📊 Performance Commands

### Build Analysis

```bash
# Build with verbose output
npm run build -- --logLevel info

# Check bundle sizes
ls -lh dist/assets/
```

### Gzip Sizes

```bash
# Check gzipped sizes
gzip -c dist/assets/index-*.js | wc -c
gzip -c dist/assets/index-*.css | wc -c
```

---

## 🔐 Security Commands

### Audit Dependencies

```bash
npm audit                       # Check for vulnerabilities
npm audit --audit-level=high   # Only show high severity
npm audit fix                  # Auto-fix issues
```

### Update Dependencies

```bash
npm outdated                    # Check outdated packages
npm update                      # Update all packages
npm install react@latest        # Update specific package
```

---

## 🖥️ Server Commands

### Kill Processes

```bash
# Kill dev server
pkill -f vite

# Kill preview server
pkill -f preview

# Kill any Node process on port 5174
lsof -ti:5174 | xargs kill
```

### Check Running Servers

```bash
# Check what's on port 5174
lsof -i:5174

# Check all Node processes
ps aux | grep node
```

---

## 📝 Common Workflows

### 1. Daily Development

```bash
npm run dev                     # Start server
# Make changes in editor
# Browser auto-reloads
# Ctrl+C to stop when done
```

### 2. Deploy Changes

```bash
git add .
git commit -m "Description"
git push origin main
npm run deploy
# Wait 2-3 minutes
# Visit live site to verify
```

### 3. Fix Build Issues

```bash
npm run clean
rm -rf node_modules
npm install
npm run build
```

### 4. Update Audio

```bash
# 1. Upload new MP4 to Google Drive
# 2. Get sharing link
# 3. Update src/components/Player.jsx
# 4. Test locally
npm run dev
# 5. Deploy
npm run deploy
```

---

## ⚡ Keyboard Shortcuts

### In Browser (Testing)

- `F12` - Open DevTools
- `Ctrl+Shift+R` (Mac: `Cmd+Shift+R`) - Hard refresh
- `Ctrl+Shift+C` - Inspect element
- `Ctrl+Shift+I` - Open DevTools (alternative)

### In Terminal

- `Ctrl+C` - Stop running process
- `Ctrl+L` - Clear terminal
- `↑` - Previous command
- `!!` - Repeat last command

---

## 📌 Useful Aliases (Optional)

Add to `~/.bashrc` or `~/.zshrc`:

```bash
alias vsn-dev='cd ~/vsn && npm run dev'
alias vsn-deploy='cd ~/vsn && git push origin main && npm run deploy'
alias vsn-clean='cd ~/vsn && npm run clean && npm install'
```

Then use:
```bash
vsn-dev         # Quick start development
vsn-deploy      # Quick deploy
vsn-clean       # Quick clean
```

---

## 🆘 Emergency Commands

### Site is Broken

```bash
# Revert to last working commit
git log --oneline              # Find last good commit
git checkout COMMIT_HASH       # Replace with actual hash
npm run deploy
```

### Lost Local Changes

```bash
# Get changes back from GitHub
git fetch origin main
git reset --hard origin/main
```

### Accidental Delete

```bash
# Restore file from last commit
git checkout HEAD -- filename
```

---

## 📚 Reference Links

- **Vite**: https://vitejs.dev/guide/cli.html
- **npm**: https://docs.npmjs.com/cli/v9/commands
- **Git**: https://git-scm.com/docs
- **GitHub Pages**: https://pages.github.com/

---

**Quick Help:**
- Development issues → See DEVELOPMENT.md
- First time setup → See README.md
- Timestamp info → See TIMESTAMP_CALIBRATION_SUMMARY.md

**Repository:** https://github.com/sharanainapurapu/vsn
**Live App:** https://sharanainapurapu.github.io/vsn/
