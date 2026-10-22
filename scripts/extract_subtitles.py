#!/usr/bin/env python3
"""
Extract subtitles/metadata from MP4 to get accurate sloka timestamps
"""

import os
import json
import subprocess

def extract_subtitles(video_file):
    """
    Try to extract subtitles/metadata from MP4
    """
    print(f"Analyzing video file: {video_file}")
    
    # Check if file exists
    if not os.path.exists(video_file):
        print(f"Error: File not found: {video_file}")
        return None
    
    # Get file info
    file_size = os.path.getsize(video_file) / (1024 * 1024)
    print(f"File size: {file_size:.1f} MB")
    
    # Try to extract subtitles using moviepy
    try:
        from moviepy.editor import VideoFileClip
        
        print("\nLoading video with moviepy...")
        clip = VideoFileClip(video_file)
        
        duration = clip.duration
        print(f"Duration: {duration:.1f} seconds ({duration/60:.1f} minutes)")
        
        # Check for subtitles
        if hasattr(clip, 'subtitles') and clip.subtitles:
            print("✓ Found embedded subtitles!")
            return clip.subtitles
        else:
            print("No embedded subtitles found in video metadata")
            
        clip.close()
        return None
        
    except Exception as e:
        print(f"Moviepy extraction failed: {e}")
        return None

def check_for_subtitle_files(video_dir):
    """
    Check for .srt, .vtt, or other subtitle files
    """
    video_name = os.path.splitext(os.path.basename("full_slokas.mp4"))[0]
    
    subtitle_extensions = ['.srt', '.vtt', '.sub', '.ass', '.ssa']
    
    print(f"\nChecking for subtitle files in: {video_dir}")
    for ext in subtitle_extensions:
        subtitle_file = os.path.join(video_dir, video_name + ext)
        if os.path.exists(subtitle_file):
            print(f"✓ Found subtitle file: {subtitle_file}")
            return subtitle_file
    
    # Also check for generic names
    for ext in subtitle_extensions:
        for name in ['subtitles', 'lyrics', 'script']:
            subtitle_file = os.path.join(video_dir, name + ext)
            if os.path.exists(subtitle_file):
                print(f"✓ Found subtitle file: {subtitle_file}")
                return subtitle_file
    
    print("No subtitle files found")
    return None

def get_video_duration(video_file):
    """
    Get video duration using moviepy
    """
    try:
        from moviepy.editor import VideoFileClip
        clip = VideoFileClip(video_file)
        duration = clip.duration
        clip.close()
        return duration
    except Exception as e:
        print(f"Error getting duration: {e}")
        return None

if __name__ == "__main__":
    video_file = "public/audio/full_slokas.mp4"
    video_dir = os.path.dirname(video_file)
    
    print("=" * 60)
    print("Subtitle/Script Extractor for Vishnu Sahasranamam")
    print("=" * 60)
    
    # Try to extract embedded subtitles
    subtitles = extract_subtitles(video_file)
    
    # Check for external subtitle files
    subtitle_file = check_for_subtitle_files(video_dir)
    
    # Get duration
    duration = get_video_duration(video_file)
    
    if duration:
        print(f"\n✓ Video duration: {duration:.1f} seconds")
        print(f"  Expected ~{duration/109:.1f} seconds per sloka for 109 slokas")
    
    print("\n" + "=" * 60)
    
    if subtitles or subtitle_file:
        print("SUCCESS! Found subtitle/script data")
        print("Ready to parse for accurate timestamps")
    else:
        print("No subtitle data found")
        print("Will need to use audio analysis instead")
    
    print("=" * 60)
