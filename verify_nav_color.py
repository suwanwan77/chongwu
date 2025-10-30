#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Verify navigation color CSS
"""

from pathlib import Path

def check_file(file_path):
    """Check if file has navigation color CSS"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    has_nav_color = 'Change bottom navigation bar color' in content
    has_color_code = '#2F562A' in content
    
    return has_nav_color and has_color_code

def main():
    """Main function"""
    frontend_dir = Path('frontend')
    all_html_files = list(frontend_dir.rglob('index.html'))
    
    # Exclude home page
    html_files = [f for f in all_html_files if f != frontend_dir / 'index.html']
    
    print("Navigation Color CSS Verification")
    print("=" * 70)
    print(f"{'File':<50} {'Status'}")
    print("=" * 70)
    
    all_good = True
    for html_file in sorted(html_files):
        has_css = check_file(html_file)
        
        file_name = str(html_file.relative_to('frontend'))
        if len(file_name) > 48:
            file_name = "..." + file_name[-45:]
        
        status = "✓ Color CSS added (#2F562A)" if has_css else "✗ Missing CSS"
        
        print(f"{file_name:<50} {status}")
        
        if not has_css:
            all_good = False
    
    print("=" * 70)
    if all_good:
        print(f"✓ All {len(html_files)} files have navigation color CSS!")
        print("\nBottom navigation bar icons and text will be displayed in #2F562A")
    else:
        print("✗ Some files are missing the CSS")

if __name__ == '__main__':
    main()

