#!/usr/bin/env python3
"""
Simple Audio Splitter - Equal duration splits
Since we can't detect silence without ffmpeg, we'll split equally
"""

import os
import json

def create_equal_splits_metadata(total_duration_sec, num_slokas=109):
    """
    Create metadata for equal-duration splits
    """
    sloka_duration = total_duration_sec / num_slokas
    
    slokas = []
    for i in range(num_slokas):
        sloka_num = i + 1
        start_time = i * sloka_duration
        end_time = (i + 1) * sloka_duration
        
        slokas.append({
            "id": sloka_num,
            "number": sloka_num,
            "section": "dhyanam" if sloka_num <= 8 else ("phalasruti" if sloka_num >= 107 else "main"),
            "audio": {
                "file": f"vishnu_sahasranamam_full.mp3",  # Use full file
                "startTime": round(start_time, 2),
                "endTime": round(end_time, 2),
                "duration": round(sloka_duration, 2)
            }
        })
    
    return slokas

if __name__ == "__main__":
    # Get audio file duration (rough estimate from file size)
    audio_file = "public/audio/vishnu_sahasranamam_full.mp3"
    
    if not os.path.exists(audio_file):
        print(f"Error: Audio file not found: {audio_file}")
        exit(1)
    
    # Get file size in bytes
    file_size = os.path.getsize(audio_file)
    file_size_mb = file_size / (1024 * 1024)
    
    # Estimate duration: MP3 at 128kbps is roughly 1MB per minute
    # 28MB file ~ 28 minutes
    estimated_duration = (file_size_mb * 60)  # seconds
    
    print("=" * 60)
    print("Simple Audio Metadata Generator")
    print("=" * 60)
    print(f"Audio file: {audio_file}")
    print(f"File size: {file_size_mb:.1f} MB")
    print(f"Estimated duration: {estimated_duration:.1f} seconds ({estimated_duration/60:.1f} minutes)")
    print(f"Creating metadata for 109 slokas...")
    
    slokas = create_equal_splits_metadata(estimated_duration, 109)
    
    avg_duration = estimated_duration / 109
    print(f"Average sloka duration: {avg_duration:.1f} seconds")
    
    # Save to JSON
    output_file = "scripts/data/sloka_timestamps.json"
    with open(output_file, 'w') as f:
        json.dump(slokas, f, indent=2)
    
    print(f"\n✓ Saved metadata to {output_file}")
    print(f"✓ Created {len(slokas)} sloka entries")
    print("\nNote: Using equal-duration splits as approximation")
    print("The app will use timestamps to play segments from the full audio file")
    print("=" * 60)
