# 🕉️ Vishnu Sahasranamam Learning App for Kids

A beautiful, interactive web app to help children learn Vishnu Sahasranamam through audio playback, sloka-by-sloka practice, and range-based learning.

**🌐 Live App:** https://sharanainapurapu.github.io/vsn/

![Demo](https://img.shields.io/badge/Status-Live-brightgreen)
![GitHub Pages](https://img.shields.io/badge/Deployed-GitHub%20Pages-blue)

## ✨ Features

- 🎵 **Individual Sloka Playback** - Learn one sloka at a time with accurate timestamps
- 🔁 **Smart Repeat System** - Repeat each sloka 1x, 3x, 5x, 10x, or 20x
- 📚 **Range Selection** - Practice specific ranges (e.g., slokas 1-10 this week)
- 🎯 **Auto-Play Mode** - Hands-free playback through entire range
- 🌍 **Multi-language Support** - Sanskrit, Tamil, Telugu, Kannada, Malayalam, Hindi, English
- 📱 **Mobile-Friendly** - Works perfectly on phones and tablets
- 💾 **Progress Tracking** - Automatically saves completed slokas
- 🎨 **Kid-Friendly Design** - Colorful, intuitive interface
- ⏯️ **Full Playback Controls** - Play, pause, skip, volume control
- 🎧 **152 Slokas** - Complete with accurate timestamps from user calibration

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/sharanainapurapu/vsn.git
cd vsn

# Install dependencies
npm install

# Run development server
npm run dev
```

Visit `http://localhost:5174` in your browser.

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` folder.

## 📁 Project Structure

```
vsn/
├── public/
│   ├── audio/
│   │   ├── README.md           # Audio file notes
│   │   ├── full_slokas.m4a     # Full audio (AAC, ~34MB)
│   │   ├── sloka_timestamps.json
│   │   └── sloka_timestamps_final.json
│   └── data/
│       ├── slokas-complete.json    # 152 slokas with timestamps
│       └── slokas-sample.json      # Sample data
├── src/
│   ├── components/
│   │   ├── Player.jsx              # Audio player with timestamp seeking
│   │   ├── SlokaDisplay.jsx        # Displays sloka text
│   │   ├── RangeSelector.jsx       # Range and repeat settings
│   │   ├── SlokaGrid.jsx           # Grid view of all slokas
│   │   └── LanguageSelector.jsx    # Language switcher
│   ├── App.jsx                     # Main app component
│   ├── main.jsx                    # Entry point
│   └── index.css                   # Global styles with Tailwind
├── .github/
│   └── workflows/
│       └── deploy.yml              # GitHub Pages deployment
├── TIMESTAMP_CALIBRATION_SUMMARY.md # How timestamps were created
└── package.json
```

## 🎯 Usage Guide

### For Parents

1. **Visit the Live App**: https://sharanainapurapu.github.io/vsn/
2. **Select Language**: Choose your preferred script or English for pronunciation
3. **Practice Range**: Set a weekly goal (e.g., slokas 1-10)
4. **Set Repeats**: Choose how many times each sloka should repeat (3-5x recommended)
5. **Start Practice**: Click "Start Practice" for hands-free auto-play through the range
6. **Track Progress**: Green checkmarks show completed slokas (saved in browser)

### For Kids (Age 5+)

1. 👆 **Tap** the big play button
2. 📖 **Listen** to the audio  
3. 🔁 **Repeat** - it plays automatically
4. ✅ **Earn** green checkmarks as you complete
5. 🎯 **Practice** daily!

## 🎵 Audio Setup

This app uses a **single 37-minute audio file** (`public/audio/full_slokas.m4a`, AAC extracted from the original MP4 with the same timeline) served alongside the app, with accurate timestamp-based navigation. The audio contains 152 sloka segments across 3 sections:

- **Section 1**: Slokas 1-21 (~4 minutes)
- **Section 2**: Slokas 1-108 (~21 minutes) - Main Vishnu Sahasranamam
- **Section 3**: Slokas 8-27+ (~4 minutes)

Timestamps were manually calibrated using 32 user-provided calibration points for accuracy. See `TIMESTAMP_CALIBRATION_SUMMARY.md` for details.

## 🚢 Deployment

This app is already deployed at: **https://sharanainapurapu.github.io/vsn/**

The deployment uses:
- **GitHub Pages** for hosting
- **Self-hosted audio** in `public/audio/full_slokas.m4a` (~34MB, served from GitHub Pages)
- **Automatic deployment** via GitHub Actions on push to `main`

### To Deploy Your Own Version

1. Fork this repository
2. Update `vite.config.js` with your repo name:
   ```js
   base: '/your-repo-name/'
   ```
3. Enable GitHub Pages in Settings → Pages → Source: gh-pages branch
4. Push changes - auto-deploys via GitHub Actions

## 🛠️ Tech Stack

- **React 18** - UI framework
- **Vite 4** - Build tool and dev server
- **Tailwind CSS 3** - Utility-first styling
- **Lucide React** - Beautiful icons
- **HTML5 Audio API** - Timestamp-based seeking
- **GitHub Pages** - Free hosting

## 🤝 Contributing

Suggestions and improvements are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## 📋 Future Enhancements

- [ ] Add actual Sanskrit text for all 152 slokas
- [ ] Include word-by-word meaning tooltips
- [ ] Add achievement badges for motivation
- [ ] Offline PWA support
- [ ] Export progress as PDF report
- [ ] Add more language options

## 📄 License

This project is created for educational purposes. The Vishnu Sahasranamam text is in the public domain.

## 🙏 Credits

- **Original Audio**: User-provided 37-minute MP4 video
- **Timestamps**: Manually calibrated with 32 calibration points
- **Sloka Reference**: [Bhajan Mala](https://www.bhajanmala.com/nodes/125)
- **Created with ❤️** for a 5-year-old learning Vishnu Sahasranamam

## 💬 Support

If you find this helpful for teaching your children, please ⭐ star this repository!

**Repository**: https://github.com/sharanainapurapu/vsn
**Live App**: https://sharanainapurapu.github.io/vsn/
