#!/usr/bin/env python3
"""
Create a manual timestamping tool - extract sample frames to help you mark timestamps
"""

import cv2
import json
import os

def extract_sample_frames(video_path, output_dir="timestamp_samples", num_samples=20):
    """
    Extract evenly spaced frames from video for manual review
    """
    print(f"Opening video: {video_path}")
    cap = cv2.VideoCapture(video_path)
    
    if not cap.isOpened():
        print("Error: Could not open video")
        return
    
    # Get properties
    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duration = total_frames / fps
    
    print(f"Duration: {duration:.1f}s ({duration/60:.1f} min)")
    print(f"Extracting {num_samples} sample frames...")
    
    os.makedirs(output_dir, exist_ok=True)
    
    # Extract frames at regular intervals
    interval = total_frames // num_samples
    
    sample_times = []
    for i in range(num_samples):
        frame_num = i * interval
        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_num)
        ret, frame = cap.read()
        
        if ret:
            timestamp = frame_num / fps
            filename = f"frame_{i:03d}_time_{int(timestamp)}s.jpg"
            filepath = os.path.join(output_dir, filename)
            cv2.imwrite(filepath, frame)
            sample_times.append(timestamp)
            print(f"  Saved: {filename} ({timestamp/60:.1f} min)")
    
    cap.release()
    
    print(f"\n✓ Saved {len(sample_times)} frames to {output_dir}/")
    print(f"\nNext steps:")
    print(f"1. Open the frames in {output_dir}/")
    print(f"2. Watch the video and note when each sloka starts")
    print(f"3. Create timestamps manually based on what you see")
    
    return sample_times

def create_template_csv(duration, output_file="scripts/data/timestamps_template.csv"):
    """
    Create a CSV template for manual timestamp entry
    """
    print(f"\nCreating template CSV: {output_file}")
    
    with open(output_file, 'w') as f:
        f.write("sloka_number,start_time_seconds,notes\n")
        f.write("# Example:\n")
        f.write("# 1,0.0,First sloka - Shuklambaradharam\n")
        f.write("# 2,15.5,Second sloka\n")
        f.write("# ...\n")
        f.write("\n")
        
        # Add numbered rows for all 109 slokas
        for i in range(1, 110):
            f.write(f"{i},,,\n")
    
    print(f"✓ Created template: {output_file}")
    print(f"\nFill in the timestamps by:")
    print(f"1. Playing the video")
    print(f"2. Noting the start time of each sloka")
    print(f"3. Entering in the 'start_time_seconds' column")
    print(f"4. Run: python3 convert_csv_to_json.py to generate final JSON")

if __name__ == "__main__":
    video_path = "public/audio/full_slokas.mp4"
    
    print("=" * 60)
    print("Manual Timestamp Helper Tool")
    print("=" * 60)
    
    # Extract sample frames
    extract_sample_frames(video_path, num_samples=30)
    
    # Create template
    create_template_csv(2200)  # ~37 minutes
    
    print("\n" + "=" * 60)
    print("Since automated detection didn't work well,")
    print("I recommend:")
    print("1. Watch the video yourself")
    print("2. Note when you see text change (new sloka starts)")
    print("3. Fill in scripts/data/timestamps_template.csv")
    print("4. Or tell me the first 5-10 sloka timestamps")
    print("   and I can estimate the rest")
    print("=" * 60)
