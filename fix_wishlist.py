#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script to replace Wishlist button with My Account button in all HTML files
"""

import os
import re
from pathlib import Path

def get_relative_path(from_path, to_path):
    """Calculate relative path from current page to target"""
    from_dir = os.path.dirname(from_path)
    depth = len([p for p in from_dir.split(os.sep) if p and p != 'frontend'])
    
    if depth == 0:
        return to_path
    else:
        return '../' * depth + to_path

def fix_wishlist_button(file_path):
    """Replace Wishlist button with My Account button in a single HTML file"""
    print(f"\nProcessing: {file_path}")
    
    # Read file content
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if file has Wishlist button
    if 'aria-label="Wishlist"' not in content:
        print(f"  ✓ No Wishlist button found, skipping")
        return False
    
    # Calculate relative path to my-account
    relative_path = str(file_path).replace('frontend' + os.sep, '').replace('frontend/', '')
    my_account_link = get_relative_path(relative_path, 'my-account/index.html')
    
    # Special case: if we're in my-account directory, link to itself
    if 'my-account' in str(file_path):
        my_account_link = 'index.html'
    
    print(f"  My Account link: {my_account_link}")
    
    # Pattern to find the Wishlist button section
    # This pattern matches from the Wishlist link to the closing </footer> tag
    pattern = r'<a href="[^"]*wishlist[^"]*" class="elementor-icon" tabindex="-1" aria-label="Wishlist">\s*<i aria-hidden="true" class="far fa-heart"></i>\s*</a>\s*</div>\s*<div class="elementor-icon-box-content">\s*<h3 class="elementor-icon-box-title">\s*<a href="[^"]*wishlist[^"]*">\s*Wishlist\s*</a>\s*</h3>\s*</div>\s*</div>\s*</div>\s*</div>\s*</div>\s*</div>\s*</div>\s*</div>\s*</div>\s*</div>\s*</div>\s*<footer'
    
    replacement = f'''<a href="{my_account_link}" class="elementor-icon" tabindex="-1" aria-label="My Account">
\t\t\t\t<i aria-hidden="true" class="gopet-icon- gopet-icon-account"></i>\t\t\t\t</a>
\t\t\t</div>

\t\t\t\t\t\t<div class="elementor-icon-box-content">

\t\t\t\t\t\t\t\t\t\t<h3 class="elementor-icon-box-title">
\t\t\t\t\t\t<a href="{my_account_link}">
\t\t\t\t\t\t\tMy Account\t\t\t\t\t\t</a>
\t\t\t\t\t</h3>


\t\t\t</div>

\t\t</div>
\t\t\t\t\t\t</div>
\t\t\t\t</div>
\t\t\t\t\t</div>
\t\t\t</div>
\t\t\t\t\t</div>
\t\t</div>
\t\t\t\t</div>
\t\t</div>\t\t<footer'''
    
    match = re.search(pattern, content, re.DOTALL)
    if match:
        content = re.sub(pattern, replacement, content, flags=re.DOTALL)
        
        # Save the updated content
        with open(file_path, 'w', encoding='utf-8', newline='') as f:
            f.write(content)
        
        print(f"  ✓ Updated successfully")
        return True
    else:
        print(f"  ✗ Pattern not found, trying simpler pattern...")
        
        # Try a simpler pattern
        simple_pattern = r'aria-label="Wishlist"[^>]*>.*?</a>.*?Wishlist.*?</a>'
        if re.search(simple_pattern, content, re.DOTALL):
            print(f"  ! Found Wishlist button but pattern doesn't match exactly")
            print(f"  ! Manual fix may be needed")
        
        return False

def main():
    """Main function"""
    frontend_dir = Path('frontend')
    
    # Get all index.html files
    html_files = list(frontend_dir.rglob('index.html'))
    
    print(f"Found {len(html_files)} HTML files to check")
    print("="*60)
    
    updated_count = 0
    for file_path in html_files:
        if fix_wishlist_button(file_path):
            updated_count += 1
    
    print(f"\n{'='*60}")
    print(f"All files processed!")
    print(f"Updated: {updated_count} files")
    print(f"{'='*60}")

if __name__ == '__main__':
    main()

