# 🎵 Audio Setup Guide

> Archived: describes the earlier per-sloka MP3 workflow. For the current setup see [../audio.md](../audio.md).

## Overview

This guide will help you extract audio from YouTube and split it into individual sloka files.

## Method 1: Using Audacity (Easiest - Recommended)

### What You Need
- [Audacity](https://www.audacityteam.org/) (Free audio editor)
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) (YouTube downloader)

### Step 1: Download the YouTube Audio

```bash
# Install yt-dlp (Windows - use PowerShell as Admin)
winget install yt-dlp

# Install yt-dlp (Mac)
brew install yt-dlp

# Install yt-dlp (Linux)
pip install yt-dlp

# Download the audio
yt-dlp -x --audio-format mp3 "https://www.youtube.com/watch?v=j8yyMkpy_o0" -o "vishnu_sahasranamam.mp3"
```

### Step 2: Open in Audacity

1. Open Audacity
2. **File** → **Open** → Select `vishnu_sahasranamam.mp3`

### Step 3: Find and Mark Slokas

1. Click **Play** ▶️ and listen
2. When you hear a sloka start, note the time (shown at bottom)
3. Create a label:
   - Press **Ctrl+B** (Windows) or **Cmd+B** (Mac)
   - Type the sloka number (e.g., "1")
4. Repeat for all 109 slokas

**Tips:**
- Use **Space bar** to pause/play
- Use **Shift+Space** to start/stop without moving cursor
- Zoom in for precision: **Ctrl+1** or **View** → **Zoom In**

### Step 4: Export Individual Files

1. **File** → **Export** → **Export Multiple**
2. Settings:
   - **Export format**: MP3
   - **Export location**: Browse to `VSN/public/audio/`
   - **Split files based on**: Labels
   - **Name files**: Choose "Using Label/Track Name"
3. Add prefix: Change to `sloka_` so files become `sloka_1.mp3`, `sloka_2.mp3`, etc.
4. Click **Export**

### Step 5: Rename Files (if needed)

If files are named `sloka_1.mp3`, rename them to `sloka_01.mp3` (with leading zero):

**Windows PowerShell:**
```powershell
cd VSN/public/audio
Get-ChildItem sloka_*.mp3 | Rename-Item -NewName {$_.name -replace 'sloka_(\d{1})\.mp3', 'sloka_0$1.mp3'}
```

**Mac/Linux:**
```bash
cd VSN/public/audio
for file in sloka_[0-9].mp3; do
  mv "$file" "sloka_0${file#sloka_}"
done
```

## Method 2: Using FFmpeg (Advanced)

### What You Need
- FFmpeg installed
- A spreadsheet with timestamps

### Step 1: Create Timestamp Spreadsheet

Listen to the audio and create a CSV file `timestamps.csv`:

```csv
sloka,start,end
1,0:00:00,0:00:15
2,0:00:15,0:00:29
3,0:00:29,0:00:44
...
```

### Step 2: Batch Extract Using Script

Save this as `split_audio.sh` (Mac/Linux) or `split_audio.ps1` (Windows):

**Bash Script (Mac/Linux):**
```bash
#!/bin/bash
INPUT="vishnu_sahasranamam.mp3"
OUTPUT_DIR="public/audio"

mkdir -p $OUTPUT_DIR

# Read CSV and split
while IFS=',' read -r sloka start end; do
  if [ "$sloka" != "sloka" ]; then
    printf -v filename "sloka_%02d.mp3" $sloka
    ffmpeg -i "$INPUT" -ss "$start" -to "$end" -c copy "$OUTPUT_DIR/$filename"
    echo "Created $filename"
  fi
done < timestamps.csv
```

**PowerShell Script (Windows):**
```powershell
$INPUT = "vishnu_sahasranamam.mp3"
$OUTPUT_DIR = "public/audio"

New-Item -ItemType Directory -Force -Path $OUTPUT_DIR

Import-Csv timestamps.csv | ForEach-Object {
  $number = [int]$_.sloka
  $filename = "sloka_{0:D2}.mp3" -f $number
  ffmpeg -i $INPUT -ss $_.start -to $_.end -c copy "$OUTPUT_DIR/$filename"
  Write-Host "Created $filename"
}
```

Run the script:
```bash
# Mac/Linux
chmod +x split_audio.sh
./split_audio.sh

# Windows
powershell -ExecutionPolicy Bypass -File split_audio.ps1
```

## Method 3: Manual Split (Simplest but Tedious)

### Using Audacity for Each Sloka

1. Open the full audio in Audacity
2. Select the portion for sloka 1
3. **File** → **Export** → **Export Selected Audio**
4. Name it `sloka_01.mp3`
5. Repeat for each sloka

## Verifying Your Audio Files

After splitting, verify you have all files:

```bash
# Mac/Linux
ls -1 public/audio/ | wc -l
# Should show 109

# Windows PowerShell
(Get-ChildItem public/audio).Count
# Should show 109
```

## Updating JSON with Audio Metadata

After splitting, update `scripts/data/slokas-sample.json` with actual durations:

```javascript
// Use this script to generate audio metadata
const fs = require('fs');
const { exec } = require('child_process');

for (let i = 1; i <= 109; i++) {
  const filename = `sloka_${i.toString().padStart(2, '0')}.mp3`;
  exec(`ffprobe -i public/audio/${filename} -show_entries format=duration -v quiet -of csv="p=0"`, 
    (error, stdout) => {
      if (!error) {
        console.log(`Sloka ${i}: ${parseFloat(stdout).toFixed(1)}s`);
      }
    }
  );
}
```

## Quality Settings

For best quality vs file size:

- **Bitrate**: 128 kbps (good for voice)
- **Sample Rate**: 44100 Hz
- **Channels**: Mono (reduces size by 50%)

In Audacity:
1. **Tracks** → **Mix** → **Mix Stereo Down to Mono**
2. Export with quality: 128 kbps

## Troubleshooting

### Audio Not Playing in Browser

**Check:**
- File format is MP3
- Files are in `public/audio/` folder
- File names match exactly (case-sensitive)
- No special characters in filenames

### Files Too Large

**Solution**: Re-export at lower bitrate (96 kbps is fine for voice):
```bash
ffmpeg -i input.mp3 -b:a 96k -ac 1 output.mp3
```

### Gaps Between Slokas

**Solution**: Add 0.5s padding when marking timestamps to ensure smooth transitions.

## Need Help?

- Audacity Tutorial: [https://manual.audacityteam.org/](https://manual.audacityteam.org/)
- FFmpeg Guide: [https://ffmpeg.org/documentation.html](https://ffmpeg.org/documentation.html)
- yt-dlp Help: Run `yt-dlp --help`
