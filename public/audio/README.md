# Audio File Location

The audio file `full_slokas.mp4` (101MB) is hosted on Google Drive for better performance and to avoid GitHub's 100MB file size limit.

**Audio URL:** https://drive.google.com/uc?export=download&id=1eGaEoT1VxUZ7e584uHYi5zo1cxMbW9ug

**File Details:**
- Size: 101MB
- Duration: 36.7 minutes (2200 seconds)
- Format: MP4 (H.264 video with AAC audio)
- Contains: 152 sloka segments across 3 sections

The app loads this file directly from Google Drive when users play the slokas.

## Backup Instructions

If you need to update or replace the audio file:
1. Upload the new MP4 to Google Drive
2. Make it publicly accessible (Anyone with the link)
3. Get the file ID from the sharing link
4. Update `src/components/Player.jsx` with the new file ID
