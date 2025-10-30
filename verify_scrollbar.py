#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Verify scrollbar CSS fix
"""

from pathlib import Path

def check_file(file_path):
    """Check if file has correct CSS"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check for the bad CSS
    has_bad_css = 'html {\n    overflow: hidden !important;\n}' in content
    
    # Check for good CSS
    has_good_css = '/* Fix double scrollbar issue */\nbody {\n    overflow-x: hidden !important;\n}' in content
    
    return has_good_css, has_bad_css

def main():
    """Main function"""
    frontend_dir = Path('frontend')
    html_files = list(frontend_dir.rglob('index.html'))
    
    print("Scrollbar CSS Verification")
    print("=" * 70)
    print(f"{'File':<50} {'Status'}")
    print("=" * 70)
    
    all_good = True
    for html_file in sorted(html_files):
        has_good, has_bad = check_file(html_file)
        
        file_name = str(html_file.relative_to('frontend'))
        if len(file_name) > 48:
            file_name = "..." + file_name[-45:]
        
        if has_good and not has_bad:
            status = "✓ Good (scrolling enabled)"
        elif has_bad:
            status = "✗ Bad (scrolling disabled)"
            all_good = False
        else:
            status = "? No CSS found"
            all_good = False
        
        print(f"{file_name:<50} {status}")
    
    print("=" * 70)
    if all_good:
        print("✓ All files have correct CSS - pages can scroll!")
    else:
        print("✗ Some files have issues")

if __name__ == '__main__':
    main()

