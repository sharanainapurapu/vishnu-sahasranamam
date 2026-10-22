# 🕉️ Vishnu Sahasranamam Learning App for Kids

A beautiful, interactive web app to help children learn Vishnu Sahasranamam through audio playback, sloka-by-sloka practice, and range-based learning.

![Demo](https://img.shields.io/badge/Status-Ready-brightgreen)
![GitHub Pages](https://img.shields.io/badge/Deployed-GitHub%20Pages-blue)

## ✨ Features

- 🎵 **Individual Sloka Playback** - Learn one sloka at a time
- 🔁 **Smart Repeat System** - Repeat each sloka 1x, 3x, 5x, 10x, or 20x
- 📚 **Range Selection** - Practice specific ranges (e.g., slokas 1-10 this week)
- 🌍 **Multi-language Support** - Sanskrit, Tamil, Telugu, Kannada, Malayalam, Hindi, English
- 📱 **Mobile-Friendly** - Works perfectly on phones and tablets
- 💾 **Progress Tracking** - Automatically saves completed slokas
- 🎨 **Kid-Friendly Design** - Colorful, intuitive interface
- ⏯️ **Full Playback Controls** - Play, pause, skip, volume control

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/VSN.git
cd VSN

# Install dependencies
npm install

# Run development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` folder.

## 📁 Project Structure

```
VSN/
├── public/
│   ├── audio/              # Audio files (add your MP3s here)
│   │   ├── sloka_01.mp3
│   │   ├── sloka_02.mp3
│   │   └── ...
│   └── data/
│       └── slokas-sample.json  # Sloka text data
├── src/
│   ├── components/
│   │   ├── Player.jsx          # Audio player controls
│   │   ├── SlokaDisplay.jsx    # Displays sloka text
│   │   ├── RangeSelector.jsx   # Range and repeat settings
│   │   ├── SlokaGrid.jsx       # Grid view of all slokas
│   │   └── LanguageSelector.jsx # Language switcher
│   ├── App.jsx                 # Main app component
│   ├── main.jsx                # Entry point
│   └── index.css               # Global styles
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Pages deployment
└── package.json
```

## 🎯 Usage Guide

### For Parents

1. **Select Language**: Choose your preferred script (Sanskrit, Tamil, Telugu, etc.) or English for pronunciation
2. **Practice Range**: Set a weekly goal (e.g., slokas 1-10)
3. **Set Repeats**: Choose how many times each sloka should repeat (recommended: 3-5x for kids)
4. **Start Practice**: Click "Start Practice" and let your child follow along
5. **Track Progress**: Green checkmarks show completed slokas

### For Kids

1. 👆 **Tap** the play button to start
2. 📖 **Read** along with the text on screen
3. 🔁 **Listen** as it repeats automatically
4. ✅ **Complete** each sloka to get a green checkmark
5. 🎯 **Practice** daily to learn faster!

## 🎵 Adding Audio Files

### Step 1: Extract Audio from YouTube

```bash
# Install yt-dlp (one time)
pip install yt-dlp

# Download audio
yt-dlp -x --audio-format mp3 "https://www.youtube.com/watch?v=j8yyMkpy_o0" -o "vishnu_sahasranamam.mp3"
```

### Step 2: Split Audio into Slokas

**Option A: Using Audacity (Recommended for beginners)**

1. Open the audio file in [Audacity](https://www.audacityteam.org/)
2. Listen and mark each sloka's start time
3. Use **File → Export → Export Multiple** to split
4. Name files as: `sloka_01.mp3`, `sloka_02.mp3`, etc.
5. Copy all files to `public/audio/` folder

**Option B: Using FFmpeg (For advanced users)**

```bash
# Split audio using timestamps
ffmpeg -i vishnu_sahasranamam.mp3 -ss 00:00:00 -to 00:00:15 -c copy public/audio/sloka_01.mp3
ffmpeg -i vishnu_sahasranamam.mp3 -ss 00:00:15 -to 00:00:29 -c copy public/audio/sloka_02.mp3
# ... repeat for all slokas
```

### Step 3: Update JSON Data

Edit `public/data/slokas-sample.json` to match your audio files:

```json
{
  "id": 1,
  "audio": {
    "file": "sloka_01.mp3",
    "startTime": 0,
    "endTime": 15.5,
    "duration": 15.5
  }
}
```

## 📝 Adding Sloka Text

Get the exact text from [Bhajan Mala](https://www.bhajanmala.com/nodes/125) and update `public/data/slokas-sample.json`:

```json
{
  "text": {
    "sanskrit": "शुक्लाम्बरधरं विष्णुं...",
    "tamil": "ஶுக்லாம்பரதரம் விஷ்ணும்...",
    "telugu": "శుక్లాంబరధరం విష్ణుం...",
    "kannada": "ಶುಕ್ಲಾಂಬರಧರಂ ವಿಷ್ಣುಂ...",
    "malayalam": "ശുക്ലാംബരധരം വിഷ്ണും...",
    "hindi": "शुक्लाम्बरधरं विष्णुं...",
    "english": "shuklaambaradharam vishnum..."
  }
}
```

**Note**: English should be **transliteration** (pronunciation), not translation!

## 🚢 Deploy to GitHub Pages

### One-Time Setup

1. Create a new repository on GitHub named `VSN`
2. Update `vite.config.js` with your repo name:
   ```js
   base: '/VSN/'  // Change if your repo has a different name
   ```
3. Push your code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/VSN.git
   git push -u origin main
   ```

### Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions**
4. The app will auto-deploy on every push to `main`

Your app will be live at: `https://YOUR_USERNAME.github.io/VSN/`

## 🛠️ Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **GitHub Pages** - Free hosting

## 🤝 Contributing

This is a personal project, but suggestions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## 📋 TODO / Future Enhancements

- [ ] Add actual audio integration with Howler.js
- [ ] Create a web-based audio timestamping tool
- [ ] Add dark mode for night practice
- [ ] Include word-by-word meaning tooltips
- [ ] Add achievement badges for motivation
- [ ] Offline PWA support
- [ ] Export progress as PDF report

## 📄 License

This project is created for educational purposes. The Vishnu Sahasranamam text is in the public domain.

## 🙏 Credits

- Sloka source: [Bhajan Mala](https://www.bhajanmala.com/)
- Audio reference: [YouTube](https://www.youtube.com/watch?v=j8yyMkpy_o0)
- Created with ❤️ for kids learning Sanskrit prayers

## 💬 Support

If you find this helpful, please ⭐ star this repository!

For questions or issues, open a GitHub issue or contact the maintainer.
