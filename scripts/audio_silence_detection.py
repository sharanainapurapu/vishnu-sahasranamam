#!/usr/bin/env python3
"""
Extract audio from video and detect silence to find sloka boundaries
"""

import cv2
import numpy as np
import json
import subprocess
import os

def extract_audio_from_video(video_path, audio_output="temp_audio.wav"):
    """
    Extract audio from video using OpenCV and save as WAV
    """
    print(f"Extracting audio from: {video_path}")
    
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print("Error: Could not open video")
        return None
    
    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duration = total_frames / fps
    cap.release()
    
    print(f"Video duration: {duration:.1f}s")
    
    # Try using ffmpeg via subprocess if available
    try:
        # Try to extract with ffmpeg
        cmd = f'ffmpeg -i "{video_path}" -vn -acodec pcm_s16le -ar 16000 -ac 1 "{audio_output}" -y'
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        
        if os.path.exists(audio_output):
            print(f"✓ Extracted audio to: {audio_output}")
            return audio_output, duration
        else:
            print("ffmpeg not available or extraction failed")
            return None, duration
    except Exception as e:
        print(f"Audio extraction failed: {e}")
        return None, duration

def analyze_audio_volume(audio_path):
    """
    Analyze audio volume to detect silences
    Note: This requires scipy/librosa which may not be available
    """
    try:
        import scipy.io.wavfile as wavfile
        
        print(f"Analyzing audio: {audio_path}")
        sample_rate, audio_data = wavfile.read(audio_path)
        
        # Convert to mono if stereo
        if len(audio_data.shape) > 1:
            audio_data = np.mean(audio_data, axis=1)
        
        # Calculate RMS energy in windows
        window_size = int(sample_rate * 0.1)  # 100ms windows
        num_windows = len(audio_data) // window_size
        
        energy = []
        timestamps = []
        
        for i in range(num_windows):
            window = audio_data[i * window_size:(i + 1) * window_size]
            rms = np.sqrt(np.mean(window ** 2))
            energy.append(rms)
            timestamps.append(i * 0.1)
        
        # Find low energy regions (silence)
        energy = np.array(energy)
        threshold = np.percentile(energy, 20)  # Bottom 20% is silence
        
        silence_regions = []
        in_silence = False
        silence_start = 0
        
        for i, (e, t) in enumerate(zip(energy, timestamps)):
            if e < threshold:
                if not in_silence:
                    silence_start = t
                    in_silence = True
            else:
                if in_silence:
                    silence_regions.append((silence_start, t))
                    in_silence = False
        
        print(f"Found {len(silence_regions)} silence regions")
        return silence_regions
        
    except ImportError:
        print("scipy not available for audio analysis")
        return None
    except Exception as e:
        print(f"Error analyzing audio: {e}")
        return None

if __name__ == "__main__":
    video_path = "public/audio/full_slokas.mp4"
    
    print("=" * 60)
    print("Audio-Based Silence Detection")
    print("=" * 60)
    
    audio_path, duration = extract_audio_from_video(video_path)
    
    if audio_path:
        silence_regions = analyze_audio_volume(audio_path)
        
        if silence_regions:
            print(f"\nSilence regions detected:")
            for start, end in silence_regions[:20]:
                print(f"  {start:.1f}s - {end:.1f}s")
            
            # Use silence ends as sloka boundaries
            boundaries = [end for start, end in silence_regions]
            print(f"\nCan use {len(boundaries)} boundaries for sloka splits")
        else:
            print("Could not detect silences")
    else:
        print("\nAudio extraction failed")
        print("Video is 37 minutes with 109 slokas")
        print(f"Using equal distribution: ~{duration/109:.1f}s per sloka")
    
    print("=" * 60)
