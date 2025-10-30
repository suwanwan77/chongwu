#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script to find all HTML files that still have Wishlist button
"""

from pathlib import Path

def main():
    """Main function"""
    frontend_dir = Path('frontend')
    
    # Get all index.html files
    html_files = list(frontend_dir.rglob('index.html'))
    
    print(f"Checking {len(html_files)} HTML files for Wishlist button...")
    print("="*60)
    
    wishlist_files = []
    for file_path in html_files:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if 'aria-label="Wishlist"' in content:
            wishlist_files.append(file_path)
            print(f"✗ {file_path}")
    
    print("="*60)
    if wishlist_files:
        print(f"\nFound {len(wishlist_files)} files with Wishlist button")
    else:
        print("\n✓ All files updated successfully! No Wishlist buttons found.")

if __name__ == '__main__':
    main()

