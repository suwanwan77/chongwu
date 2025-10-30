#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fix duplicate navigation elements in all HTML files
"""

import os
import re
from pathlib import Path

def fix_duplicate_nav_in_file(file_path):
    """Remove duplicate bottom navigation columns from a single file"""
    print(f"\nProcessing: {file_path}")
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Find nav section
        nav_start = content.find('elementor-element-97aed3a')
        if nav_start == -1:
            print("  ✗ No navigation bar found")
            return False
        
        # Find footer
        footer_start = content.find('<footer', nav_start)
        if footer_start == -1:
            print("  ✗ No footer found")
            return False
        
        # Check for duplicates by counting Search links
        section = content[nav_start:footer_start]
        search_count = section.count('>Search<')
        
        if search_count <= 1:
            print(f"  ✓ No duplicates (Search count: {search_count})")
            return False
        
        print(f"  Found {search_count} Search links (expected 1)")
        
        # Find the duplicate pattern - orphaned columns after nav closes
        # Look for the specific pattern where columns appear after the nav section closes
        
        # Pattern: Find where orphaned columns start (elementor-element-9984908 appearing after nav closes)
        # The orphaned section starts with a tab character followed by the column div
        orphan_pattern = r'\t\t\t\t<div class="elementor-column elementor-col-25 elementor-top-column elementor-element elementor-element-9984908"'
        
        # Find all occurrences
        matches = list(re.finditer(orphan_pattern, content))
        
        if len(matches) < 2:
            print(f"  ✗ Could not find duplicate pattern (found {len(matches)} matches)")
            return False
        
        # The second occurrence is the orphaned one
        orphan_start = matches[1].start()
        
        # Remove from orphan start to footer start
        new_content = content[:orphan_start] + content[footer_start:]
        
        # Save the file
        with open(file_path, 'w', encoding='utf-8', newline='') as f:
            f.write(new_content)
        
        print(f"  ✓ Removed duplicate navigation columns")
        return True
        
    except Exception as e:
        print(f"  ✗ Error: {e}")
        return False

def main():
    """Main function"""
    frontend_dir = Path('frontend')
    
    if not frontend_dir.exists():
        print("Error: frontend directory not found")
        return
    
    # Find all index.html files
    html_files = list(frontend_dir.rglob('index.html'))
    
    print(f"Found {len(html_files)} HTML files to process")
    print("=" * 60)
    
    updated_count = 0
    for html_file in html_files:
        if fix_duplicate_nav_in_file(html_file):
            updated_count += 1
    
    print("\n" + "=" * 60)
    print(f"Processing complete!")
    print(f"Total files processed: {len(html_files)}")
    print(f"Files updated: {updated_count}")
    print(f"Files unchanged: {len(html_files) - updated_count}")

if __name__ == '__main__':
    main()

