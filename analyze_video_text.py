#!/usr/bin/env python3
"""
Analyze video to detect sloka boundaries by reading on-screen text changes
"""

import cv2
import json
import numpy as np
from collections import defaultdict

def extract_frames_and_detect_changes(video_path, sample_interval=1.0):
    """
    Extract frames from video and detect text changes (sloka boundaries)
    """
    print(f"Opening video: {video_path}")
    cap = cv2.VideoCapture(video_path)
    
    if not cap.isOpened():
        print("Error: Could not open video")
        return None
    
    # Get video properties
    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duration = total_frames / fps
    
    print(f"Video properties:")
    print(f"  FPS: {fps:.2f}")
    print(f"  Total frames: {total_frames}")
    print(f"  Duration: {duration:.1f} seconds ({duration/60:.1f} minutes)")
    print(f"  Expected ~{duration/109:.1f} seconds per sloka (for 109 slokas)")
    
    # Calculate frame sampling
    frame_interval = int(fps * sample_interval)
    print(f"\nSampling every {sample_interval} second(s) ({frame_interval} frames)")
    
    timestamps = []
    prev_frame_gray = None
    frame_count = 0
    significant_changes = []
    
    print("\nAnalyzing video for text changes...")
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        current_time = frame_count / fps
        
        # Only process every Nth frame
        if frame_count % frame_interval == 0:
            # Convert to grayscale
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
            # Focus on center region where text usually appears
            height, width = gray.shape
            text_region = gray[int(height*0.2):int(height*0.8), int(width*0.1):int(width*0.9)]
            
            if prev_frame_gray is not None:
                # Calculate difference between frames
                diff = cv2.absdiff(prev_frame_gray, text_region)
                change_percentage = (np.sum(diff > 30) / diff.size) * 100
                
                # If significant change (new sloka appears)
                if change_percentage > 15:  # Threshold for detecting new text
                    significant_changes.append({
                        'time': current_time,
                        'change': change_percentage
                    })
                    print(f"  Change detected at {current_time:.1f}s ({current_time/60:.1f}min) - {change_percentage:.1f}% change")
            
            prev_frame_gray = text_region.copy()
        
        frame_count += 1
        
        # Progress indicator
        if frame_count % (total_frames // 20) == 0:
            progress = (frame_count / total_frames) * 100
            print(f"  Progress: {progress:.0f}%")
    
    cap.release()
    
    print(f"\n✓ Found {len(significant_changes)} significant changes")
    
    return {
        'duration': duration,
        'fps': fps,
        'changes': significant_changes
    }

def cluster_changes(changes, min_gap=5.0):
    """
    Cluster nearby changes to identify true sloka boundaries
    """
    if not changes:
        return []
    
    clusters = []
    current_cluster = [changes[0]]
    
    for change in changes[1:]:
        if change['time'] - current_cluster[-1]['time'] < min_gap:
            current_cluster.append(change)
        else:
            # Take the strongest change in cluster
            best = max(current_cluster, key=lambda x: x['change'])
            clusters.append(best['time'])
            current_cluster = [change]
    
    # Add last cluster
    if current_cluster:
        best = max(current_cluster, key=lambda x: x['change'])
        clusters.append(best['time'])
    
    return clusters

def create_sloka_timestamps(boundaries, total_duration, target_count=109):
    """
    Create sloka timestamp metadata from detected boundaries
    """
    slokas = []
    
    # If we have boundaries, use them
    if boundaries and len(boundaries) >= target_count * 0.7:  # At least 70% detected
        print(f"\nUsing detected boundaries ({len(boundaries)} found)")
        
        # Ensure we have start and end
        if boundaries[0] > 5:
            boundaries = [0] + boundaries
        if boundaries[-1] < total_duration - 5:
            boundaries.append(total_duration)
        
        # Create segments from boundaries
        for i in range(min(target_count, len(boundaries) - 1)):
            start_time = boundaries[i]
            end_time = boundaries[i + 1] if i + 1 < len(boundaries) else total_duration
            
            slokas.append({
                'id': i + 1,
                'number': i + 1,
                'section': 'dhyanam' if i < 8 else ('phalasruti' if i >= 107 else 'main'),
                'audio': {
                    'file': 'full_slokas.mp4',
                    'startTime': round(start_time, 2),
                    'endTime': round(end_time, 2),
                    'duration': round(end_time - start_time, 2)
                }
            })
    else:
        # Fallback to equal distribution
        print(f"\nInsufficient boundaries detected ({len(boundaries) if boundaries else 0})")
        print("Falling back to equal distribution")
        
        sloka_duration = total_duration / target_count
        for i in range(target_count):
            start_time = i * sloka_duration
            end_time = (i + 1) * sloka_duration
            
            slokas.append({
                'id': i + 1,
                'number': i + 1,
                'section': 'dhyanam' if i < 8 else ('phalasruti' if i >= 107 else 'main'),
                'audio': {
                    'file': 'full_slokas.mp4',
                    'startTime': round(start_time, 2),
                    'endTime': round(end_time, 2),
                    'duration': round(sloka_duration, 2)
                }
            })
    
    return slokas

if __name__ == "__main__":
    video_path = "public/audio/full_slokas.mp4"
    
    print("=" * 60)
    print("Video Text Analysis for Sloka Boundary Detection")
    print("=" * 60)
    
    try:
        # Analyze video
        result = extract_frames_and_detect_changes(video_path, sample_interval=0.5)
        
        if result:
            # Cluster changes to find sloka boundaries
            boundaries = cluster_changes(result['changes'], min_gap=8.0)
            
            print(f"\nDetected {len(boundaries)} sloka boundaries:")
            for i, boundary in enumerate(boundaries[:10]):  # Show first 10
                print(f"  Sloka {i+1}: {boundary:.1f}s")
            if len(boundaries) > 10:
                print(f"  ... and {len(boundaries)-10} more")
            
            # Create timestamps
            slokas = create_sloka_timestamps(boundaries, result['duration'], 109)
            
            # Save to JSON
            output_file = "public/audio/sloka_timestamps_detected.json"
            with open(output_file, 'w') as f:
                json.dump(slokas, f, indent=2)
            
            print(f"\n✓ Saved {len(slokas)} sloka timestamps to {output_file}")
            
            # Statistics
            durations = [s['audio']['duration'] for s in slokas]
            print(f"\nStatistics:")
            print(f"  Average duration: {np.mean(durations):.1f}s")
            print(f"  Min duration: {np.min(durations):.1f}s")
            print(f"  Max duration: {np.max(durations):.1f}s")
            print(f"  Std deviation: {np.std(durations):.1f}s")
            
    except Exception as e:
        print(f"\nError: {e}")
        import traceback
        traceback.print_exc()
    
    print("=" * 60)
