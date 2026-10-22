#!/usr/bin/env python3
"""
Smart Audio Splitter for Vishnu Sahasranamam
Automatically detects silences and splits into individual slokas
"""

import json
import os
from pydub import AudioSegment
from pydub.silence import detect_nonsilent

def split_audio_smart(audio_file, output_dir, target_count=109):
    """
    Split audio file into slokas based on silence detection
    """
    print(f"Loading audio file: {audio_file}")
    audio = AudioSegment.from_mp3(audio_file)
    
    duration_ms = len(audio)
    duration_sec = duration_ms / 1000
    print(f"Total duration: {duration_sec:.1f} seconds ({duration_sec/60:.1f} minutes)")
    
    # Expected average sloka duration
    avg_sloka_duration = duration_sec / target_count
    print(f"Expected average sloka duration: {avg_sloka_duration:.1f} seconds")
    
    # Detect non-silent chunks
    # Adjust parameters to find pauses between slokas
    min_silence_len = 500  # Minimum silence length in ms (0.5 seconds)
    silence_thresh = audio.dBFS - 16  # 16dB below average
    
    print(f"\nDetecting silence (threshold: {silence_thresh:.1f} dBFS, min length: {min_silence_len}ms)...")
    
    nonsilent_ranges = detect_nonsilent(
        audio, 
        min_silence_len=min_silence_len,
        silence_thresh=silence_thresh,
        seek_step=100
    )
    
    detected_count = len(nonsilent_ranges)
    print(f"Detected {detected_count} non-silent segments")
    
    # If we detected too many or too few, adjust
    if detected_count < target_count * 0.8:  # Less than 80% of expected
        print(f"\nToo few segments detected. Trying more sensitive detection...")
        silence_thresh = audio.dBFS - 12
        nonsilent_ranges = detect_nonsilent(
            audio, 
            min_silence_len=300,
            silence_thresh=silence_thresh,
            seek_step=100
        )
        detected_count = len(nonsilent_ranges)
        print(f"Re-detected {detected_count} segments")
    
    elif detected_count > target_count * 1.2:  # More than 120% of expected
        print(f"\nToo many segments detected. Trying less sensitive detection...")
        silence_thresh = audio.dBFS - 20
        nonsilent_ranges = detect_nonsilent(
            audio, 
            min_silence_len=800,
            silence_thresh=silence_thresh,
            seek_step=100
        )
        detected_count = len(nonsilent_ranges)
        print(f"Re-detected {detected_count} segments")
    
    # Create output directory
    os.makedirs(output_dir, exist_ok=True)
    
    # Export each segment
    slokas = []
    print(f"\nExporting {min(detected_count, target_count)} slokas...")
    
    for i, (start_ms, end_ms) in enumerate(nonsilent_ranges[:target_count]):
        sloka_num = i + 1
        filename = f"sloka_{sloka_num:02d}.mp3"
        filepath = os.path.join(output_dir, filename)
        
        # Extract segment
        segment = audio[start_ms:end_ms]
        
        # Export as MP3
        segment.export(filepath, format="mp3", bitrate="128k")
        
        duration_sec = (end_ms - start_ms) / 1000
        
        slokas.append({
            "id": sloka_num,
            "file": filename,
            "startTime": start_ms / 1000,
            "endTime": end_ms / 1000,
            "duration": duration_sec
        })
        
        if (i + 1) % 10 == 0:
            print(f"  Exported {i + 1} slokas...")
    
    print(f"\n✓ Successfully exported {len(slokas)} slokas to {output_dir}")
    
    # Save metadata JSON
    metadata_file = os.path.join(output_dir, "timestamps.json")
    with open(metadata_file, 'w') as f:
        json.dump(slokas, f, indent=2)
    print(f"✓ Saved timestamps to {metadata_file}")
    
    # Print statistics
    durations = [s['duration'] for s in slokas]
    avg_duration = sum(durations) / len(durations)
    min_duration = min(durations)
    max_duration = max(durations)
    
    print(f"\nStatistics:")
    print(f"  Average sloka duration: {avg_duration:.1f}s")
    print(f"  Shortest sloka: {min_duration:.1f}s")
    print(f"  Longest sloka: {max_duration:.1f}s")
    
    return slokas

if __name__ == "__main__":
    audio_file = "public/audio/vishnu_sahasranamam_full.mp3"
    output_dir = "public/audio"
    
    if not os.path.exists(audio_file):
        print(f"Error: Audio file not found: {audio_file}")
        exit(1)
    
    print("=" * 60)
    print("Smart Audio Splitter for Vishnu Sahasranamam")
    print("=" * 60)
    
    try:
        slokas = split_audio_smart(audio_file, output_dir, target_count=109)
        print("\n" + "=" * 60)
        print("SUCCESS! Audio split complete.")
        print("=" * 60)
    except Exception as e:
        print(f"\nError: {e}")
        import traceback
        traceback.print_exc()
