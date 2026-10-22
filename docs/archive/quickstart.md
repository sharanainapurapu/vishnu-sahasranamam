# ⚡ Quick Start Guide

> Archived: describes an earlier workflow. For the current setup see [../development.md](../development.md) and [../deployment.md](../deployment.md).

## What You Have Now

A fully functional **Vishnu Sahasranamam Learning Web App** with:

✅ Beautiful kid-friendly interface  
✅ Multi-language support (7 languages)  
✅ Range-based learning system  
✅ Smart repeat functionality  
✅ Progress tracking  
✅ Mobile responsive design  
✅ Ready for GitHub Pages deployment  

## 🎯 Next Steps (In Order)

### 1. Test Locally (5 minutes)

```bash
cd VSN
npm install
npm run dev
```

Visit `http://localhost:5173` and explore the app!

### 2. Add Audio Files (1-2 hours)

Follow **[audio-splitting-guide.md](audio-splitting-guide.md)** to:
- Download YouTube audio
- Split into 109 sloka files
- Place in `public/audio/` folder

### 3. Add Sloka Text Data (2-3 hours)

Follow **[data-format.md](../data-format.md)** to:
- Copy text from Bhajan Mala website
- Update `scripts/data/slokas-sample.json`
- Fill in all 109 slokas in all languages

### 4. Deploy to GitHub Pages (10 minutes)

Follow **[deployment.md](../deployment.md)** to:
- Create GitHub repository
- Push code
- Enable GitHub Pages
- Get live URL

## 📂 File Structure Overview

```
VSN/
├── public/
│   └── audio/              ← ADD YOUR MP3 FILES HERE
├── scripts/data/slokas-sample.json  ← ADD SLOKA TEXT HERE
├── src/
│   ├── components/         ← React components (no changes needed)
│   ├── App.jsx             ← Main app (no changes needed)
│   └── index.css           ← Styles (no changes needed)
├── README.md               ← Full documentation
└── docs/
    ├── data-format.md      ← Data entry guide
    ├── deployment.md       ← GitHub Pages deployment
    └── archive/
        ├── audio-splitting-guide.md  ← Audio extraction guide
        └── quickstart.md   ← This file!
```

## 🎨 Customization (Optional)

### Change Colors

Edit `tailwind.config.js`:

```js
colors: {
  primary: '#FF6B35',    // Change to your color
  secondary: '#004E89',
  accent: '#F77F00',
}
```

### Change Title

Edit `src/App.jsx`, line with:
```jsx
<h1>Vishnu Sahasranamam</h1>
```

### Adjust Repeat Options

Edit `src/components/RangeSelector.jsx`, line:
```js
const repeatOptions = [1, 3, 5, 10, 20]  // Add or remove options
```

## 🎵 Audio Files Format

Expected format:
- **Name**: `sloka_01.mp3`, `sloka_02.mp3`, ..., `sloka_109.mp3`
- **Format**: MP3
- **Quality**: 128kbps (good for voice)
- **Location**: `public/audio/`

## 📊 Progress So Far

- [x] React app created
- [x] All components implemented
- [x] Sample data structure created
- [x] Styling complete
- [x] GitHub Actions workflow ready
- [ ] **YOU DO: Add audio files**
- [ ] **YOU DO: Add complete sloka text**
- [ ] **YOU DO: Deploy to GitHub**

## 🤔 Common Questions

**Q: Can I test without audio files?**  
A: Yes! The app has simulated playback so you can test the UI.

**Q: Do I need all 109 slokas to start?**  
A: No, start with 5-10 slokas to test, then add more.

**Q: Can I deploy without completing all slokas?**  
A: Yes! Deploy with partial data and update later.

**Q: How do I update after deployment?**  
A: Just `git add`, `git commit`, `git push` - it auto-deploys!

## 📱 Testing Checklist

Before showing to your child, test:

- [ ] All language switches work
- [ ] Play/pause works
- [ ] Previous/next buttons work
- [ ] Range selection works
- [ ] Repeat functionality works
- [ ] Progress saves (refresh page to check)
- [ ] Mobile view looks good
- [ ] Audio syncs with text

## 🚀 Ready to Go Live?

Once you're happy with testing:

1. Add all audio files
2. Complete all sloka text
3. Test one final time
4. Follow [deployment.md](../deployment.md)
5. Share the link with your child!

## 💡 Tips for Kids

Recommend to your child:
- Start with 5 slokas per week
- Repeat each 3-5 times
- Practice same time daily
- Use English transliteration to follow along
- Aim for all green checkmarks!

## 🆘 Need Help?

1. Check the specific guide:
   - Audio issues → **[audio-splitting-guide.md](audio-splitting-guide.md)**
   - Data entry → **[data-format.md](../data-format.md)**
   - Deployment → **[deployment.md](../deployment.md)**
   - General info → **[README.md](../../README.md)**

2. Common issues:
   - App won't start → Run `npm install` first
   - Blank page → Check browser console (F12)
   - Audio not playing → Check file names match JSON

3. Still stuck? Create an issue on GitHub!

---

**Made with ❤️ for your child's learning journey!**
