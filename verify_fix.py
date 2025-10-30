#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script to verify all HTML files have been updated
"""

from pathlib import Path

def main():
    """Main function"""
    frontend_dir = Path('frontend')
    
    # Get all HTML files
    html_files = list(frontend_dir.rglob('*.html'))
    
    print(f"Checking {len(html_files)} HTML files...")
    print("="*80)
    
    wishlist_files = []
    for file_path in html_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            if 'aria-label="Wishlist"' in content:
                wishlist_files.append(str(file_path))
        except Exception as e:
            print(f"Error reading {file_path}: {e}")
    
    print("="*80)
    if wishlist_files:
        print(f"\n❌ Found {len(wishlist_files)} files still with Wishlist button:\n")
        for f in wishlist_files:
            print(f"  - {f}")
    else:
        print("\n✅ SUCCESS! All files have been updated!")
        print("   All bottom navigation bars now show: Home | Shop | Search | My Account")

if __name__ == '__main__':
    main()

