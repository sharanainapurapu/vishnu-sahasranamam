#!/usr/bin/env python3
"""
Calculate accurate timestamps based on user-provided calibration points
"""

import json
import numpy as np

# User-provided timestamps (in seconds)
calibration = [
    (0, 8),     # Sloka 0 at 0:08
    (1, 24),    # Sloka 1 at 0:24
    (2, 35),    # Sloka 2 at 0:35
    (3, 46),    # Sloka 3 at 0:46
    (4, 56),    # Sloka 4 at 0:56
    (5, 74),    # Sloka 5 at 1:14
]

def calculate_durations(calibration):
    """Calculate duration of each calibrated sloka"""
    durations = []
    for i in range(len(calibration) - 1):
        duration = calibration[i+1][1] - calibration[i][1]
        durations.append(duration)
    return durations

def analyze_pattern(calibration):
    """Analyze the timing pattern"""
    durations = calculate_durations(calibration)
    avg_duration = np.mean(durations)
    
    print("Calibration Analysis:")
    print("=" * 60)
    for i in range(len(calibration) - 1):
        sloka_num = calibration[i][0]
        start = calibration[i][1]
        duration = durations[i]
        print(f"  Sloka {sloka_num}: starts at {start}s, duration {duration}s")
    
    print(f"\nAverage duration: {avg_duration:.1f}s")
    print(f"Min duration: {min(durations)}s")
    print(f"Max duration: {max(durations)}s")
    print(f"Std deviation: {np.std(durations):.1f}s")
    
    return avg_duration

def generate_timestamps(calibration, total_slokas=109, video_duration=2200):
    """
    Generate timestamps for all slokas based on calibration
    """
    durations = calculate_durations(calibration)
    avg_duration = np.mean(durations)
    
    print(f"\nGenerating timestamps for {total_slokas} slokas...")
    print(f"Video duration: {video_duration}s ({video_duration/60:.1f} minutes)")
    
    slokas = []
    
    # Start with sloka 0 (intro/dhyanam)
    current_time = 8.0  # Sloka 0 starts at 8s
    
    for i in range(total_slokas):
        sloka_num = i + 1  # Slokas are numbered 1-109
        
        # Determine section
        if i < 8:
            section = "dhyanam"
        elif i >= 107:
            section = "phalasruti"
        else:
            section = "main"
        
        # For calibrated slokas, use exact timing
        calibrated = [c for c in calibration if c[0] == i]
        if calibrated:
            start_time = calibrated[0][1]
        else:
            # Use average duration for non-calibrated
            start_time = current_time
        
        # Calculate end time
        # Use calibration if we have next sloka
        next_calibrated = [c for c in calibration if c[0] == i + 1]
        if next_calibrated:
            end_time = next_calibrated[0][1]
        else:
            # Use average duration
            # Adjust slightly for end slokas (might be longer)
            if i >= 107:
                duration = avg_duration * 1.2  # Ending slokas often longer
            else:
                duration = avg_duration
            end_time = start_time + duration
        
        # Ensure we don't exceed video duration
        if end_time > video_duration:
            end_time = video_duration
        
        duration = end_time - start_time
        
        slokas.append({
            'id': sloka_num,
            'number': sloka_num,
            'section': section,
            'audio': {
                'file': 'full_slokas.mp4',
                'startTime': round(start_time, 1),
                'endTime': round(end_time, 1),
                'duration': round(duration, 1)
            }
        })
        
        current_time = end_time
        
        # Progress
        if (i + 1) % 20 == 0:
            print(f"  Generated {i + 1} slokas...")
    
    return slokas

def create_final_json(slokas, output_file):
    """Save to JSON file"""
    data = {
        'metadata': {
            'title': 'Vishnu Sahasranamam',
            'totalSlokas': len(slokas),
            'source': 'Bhajan Mala Video',
            'calibration': 'Based on user-provided timestamps for slokas 0-5',
            'note': 'Timestamps calculated using average duration pattern'
        },
        'slokas': slokas
    }
    
    with open(output_file, 'w') as f:
        json.dump(data, f, indent=2)
    
    print(f"\n✓ Saved {len(slokas)} slokas to {output_file}")
    
    # Statistics
    durations = [s['audio']['duration'] for s in slokas]
    print(f"\nFinal Statistics:")
    print(f"  Average duration: {np.mean(durations):.1f}s")
    print(f"  Min duration: {np.min(durations):.1f}s")
    print(f"  Max duration: {np.max(durations):.1f}s")
    print(f"  Total time: {sum(durations):.1f}s ({sum(durations)/60:.1f} minutes)")

if __name__ == "__main__":
    print("=" * 60)
    print("Accurate Timestamp Calculator")
    print("=" * 60)
    
    # Analyze pattern
    avg_duration = analyze_pattern(calibration)
    
    # Generate all timestamps
    slokas = generate_timestamps(calibration, total_slokas=109, video_duration=2200)
    
    # Save to file
    create_final_json(slokas, 'public/audio/sloka_timestamps_accurate.json')
    
    print("\n" + "=" * 60)
    print("SUCCESS! Accurate timestamps generated")
    print("=" * 60)
