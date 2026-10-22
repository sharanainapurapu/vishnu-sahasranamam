# 🎵 Manual Audio Extraction Guide

> Archived: describes an earlier workflow. For the current setup see [../audio.md](../audio.md).

YouTube download failed due to bot protection. Here's how to do it manually:

## Option 1: Using Online Converter (Easiest)

### Step 1: Download Audio from YouTube
1. Go to: https://ytmp3.nu/ or https://yt5s.io/
2. Paste: `https://www.youtube.com/watch?v=j8yyMkpy_o0`
3. Click "Convert" and download the MP3
4. Save it as `vishnu_sahasranamam_full.mp3`

### Step 2: Install Audacity
1. Download: https://www.audacityteam.org/
2. Install and open it

### Step 3: Load and Split Audio
1. Open the MP3 file in Audacity
2. Listen and mark each sloka boundary with Ctrl+B (Cmd+B on Mac)
3. Label each marker: "1", "2", "3"... up to "109"

### Step 4: Export Multiple Files
1. File → Export → Export Multiple
2. Choose:
   - Format: MP3
   - Split files based on: Labels
   - Naming: sloka_
3. Export location: `VSN/public/audio/`
4. Click Export

### Step 5: Rename Files
The files will be `sloka_1.mp3`, rename to `sloka_01.mp3`:

**Windows (PowerShell):**
```powershell
cd VSN/public/audio
1..9 | ForEach-Object { Rename-Item "sloka_$_.mp3" "sloka_0$_.mp3" }
```

**Mac/Linux:**
```bash
cd VSN/public/audio
for i in {1..9}; do mv "sloka_$i.mp3" "sloka_0$i.mp3"; done
```

## Option 2: Using yt-dlp on Your Computer

If you have Python on your personal computer:

```bash
# Install yt-dlp
pip install yt-dlp

# Download audio
yt-dlp -x --audio-format mp3 --audio-quality 128K \
  "https://www.youtube.com/watch?v=j8yyMkpy_o0" \
  -o "vishnu_sahasranamam_full.mp3"
```

Then follow Step 2-5 above.

## Option 3: Quick Test with Sample Audio

For now, I'll create a test with simulated audio so you can see the app working.
You can replace with real audio later.

## Timestamp Reference (To Help with Splitting)

Once you have the audio, here are approximate sloka durations:
- Most slokas: 12-18 seconds each
- Dhyanam slokas (1-8): Usually longer, 15-20 seconds
- Main slokas (9-107): Usually 12-15 seconds
- Phalasruti (108-109): 15-20 seconds

Total duration should be around 25-30 minutes.

## Verification

After splitting, verify:
```bash
cd public/audio
ls -1 sloka_*.mp3 | wc -l
# Should show 109
```

## Need Help?

The current app works with simulated audio playback. Once you add real MP3 files:
1. They'll automatically be picked up
2. No code changes needed
3. Just refresh the browser
