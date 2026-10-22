# 🚀 Deployment Guide

## Prerequisites

- GitHub account
- Git installed on your computer
- Node.js 18+ installed

## Step-by-Step Deployment

### 1. Create GitHub Repository

1. Go to [GitHub](https://github.com) and log in
2. Click the **+** icon → **New repository**
3. Name it: `VSN` (or any name you prefer)
4. Make it **Public**
5. **Do NOT** initialize with README (we already have one)
6. Click **Create repository**

### 2. Update Configuration

Before pushing, update the base path in `vite.config.js`:

```js
base: '/VSN/'  // Use your actual repository name
```

If your repo is named differently (e.g., `vishnu-app`), use:
```js
base: '/vishnu-app/'
```

### 3. Initialize and Push

Open terminal in the VSN folder and run:

```bash
# Initialize git repository
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: Vishnu Sahasranamam Learning App"

# Rename branch to main
git branch -M main

# Add your GitHub repository as remote
# Replace YOUR_USERNAME with your actual GitHub username
git remote add origin https://github.com/YOUR_USERNAME/VSN.git

# Push to GitHub
git push -u origin main
```

### 4. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** (top menu)
3. Scroll down and click **Pages** (left sidebar)
4. Under **Source**, select **GitHub Actions**
5. That's it! The workflow will run automatically

### 5. Wait for Deployment

1. Go to the **Actions** tab in your repository
2. You'll see a workflow running (yellow dot)
3. Wait for it to turn green (✓) - takes 2-3 minutes
4. Your app is now live at: `https://YOUR_USERNAME.github.io/VSN/`

## Troubleshooting

### Issue: Blank Page After Deployment

**Solution**: Check if the `base` path in `vite.config.js` matches your repository name.

### Issue: 404 Errors on GitHub Pages

**Solution**: 
1. Make sure GitHub Pages source is set to "GitHub Actions"
2. Check that the workflow ran successfully in the Actions tab
3. Wait 5-10 minutes for DNS propagation

### Issue: Audio Files Not Loading

**Solution**: 
1. Ensure audio files are in `public/audio/` folder
2. File names must match exactly what's in the JSON
3. All audio files should be committed to git

### Issue: Workflow Fails

**Solution**:
1. Go to Actions tab → Click on the failed workflow
2. Check the error message
3. Usually it's missing dependencies - run `npm install` locally first
4. Commit the updated `package-lock.json`

## Updating the App

After making changes:

```bash
# Stage changes
git add .

# Commit with a message
git commit -m "Description of what you changed"

# Push to GitHub
git push

# Deployment happens automatically!
```

## Custom Domain (Optional)

If you want to use your own domain (e.g., `vsn.yourname.com`):

1. Buy a domain from any registrar (Namecheap, GoDaddy, etc.)
2. Add a file named `CNAME` in the `public/` folder with your domain:
   ```
   vsn.yourname.com
   ```
3. In your domain registrar, add a CNAME record:
   - **Host**: vsn (or @)
   - **Points to**: YOUR_USERNAME.github.io
4. Push changes and wait for DNS propagation (can take 24-48 hours)

## Environment Setup for Development

If someone else wants to work on this:

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/VSN.git
cd VSN

# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:5173
```

## Testing Before Deployment

Always test locally before pushing:

```bash
# Build the app
npm run build

# Preview the built app
npm run preview
```

This simulates the production environment locally.

## Monitoring

- **Live URL**: Check if the site loads
- **Actions Tab**: See deployment history and logs
- **Settings → Pages**: Shows deployment status

## Need Help?

- Check the [Vite deployment docs](https://vitejs.dev/guide/static-deploy.html#github-pages)
- Check the [GitHub Pages docs](https://docs.github.com/en/pages)
- Open an issue in the repository
