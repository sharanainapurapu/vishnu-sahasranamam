# GitHub Setup and Deployment Guide

Your code is ready to push! Follow these steps:

## Step 1: Create GitHub Repository

1. Go to: https://github.com/new
2. Repository name: `VSN` (or any name you prefer)
3. Description: `Vishnu Sahasranamam learning app for kids`
4. Choose: **Public** (required for free GitHub Pages)
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click **"Create repository"**

## Step 2: Push Your Code

After creating the repository, GitHub will show you commands. Use these:

```bash
cd /home/workshop/Documents/VSN

# Add the remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/VSN.git

# Push to GitHub
git push -u origin main
```

**Example:**
If your GitHub username is `john123`, the command would be:
```bash
git remote add origin https://github.com/john123/VSN.git
git push -u origin main
```

## Step 3: Deploy to GitHub Pages

Run this command to deploy:

```bash
npm run deploy
```

This will:
1. Build your app (creates optimized production files)
2. Create a `gh-pages` branch
3. Push the built files to GitHub Pages

## Step 4: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** tab
3. Click **Pages** in the left sidebar
4. Under "Source", select branch: **gh-pages**
5. Click **Save**

Your app will be live at: `https://YOUR_USERNAME.github.io/VSN/`

## Troubleshooting

### If audio file is too large (>100MB)
GitHub has a 100MB file size limit. Your `full_slokas.mp4` is 101MB, so you might need to:

**Option A: Use Git LFS**
```bash
git lfs install
git lfs track "*.mp4"
git add .gitattributes
git add public/audio/full_slokas.mp4
git commit -m "Add audio file with Git LFS"
git push
```

**Option B: Host audio separately**
Upload your MP4 to a cloud storage (Google Drive, Dropbox, etc.) and update the audio URL in the app.

### If push asks for credentials
Use a Personal Access Token:
1. Go to: https://github.com/settings/tokens
2. Generate new token (classic)
3. Select scopes: `repo`, `workflow`
4. Copy the token
5. Use it as password when pushing

## Current Status

✅ Git initialized
✅ Initial commit created  
✅ Files staged and ready
⏳ Waiting for GitHub repository URL

## What's Next?

1. Create the GitHub repository (Step 1)
2. Run the git remote and push commands (Step 2)
3. Deploy with `npm run deploy` (Step 3)
4. Enable GitHub Pages in settings (Step 4)
5. Share the live URL with your child! 🎉

---

**Note:** The app is already configured for GitHub Pages deployment. The `vite.config.js` has the correct base path set to `/VSN/`.
