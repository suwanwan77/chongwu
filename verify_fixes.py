#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Verify that all fixes have been applied correctly
"""

from pathlib import Path

def verify_file(file_path):
    """Verify a single HTML file"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check for scrollbar fix
    has_scrollbar_fix = "Fix double scrollbar issue" in content

    # Check for duplicate navigation by looking for orphaned columns
    # The issue was orphaned columns appearing AFTER the nav section closes but BEFORE footer
    nav_start = content.find('elementor-element-97aed3a')
    if nav_start == -1:
        return None, has_scrollbar_fix

    # Find where the nav section closes (look for the closing divs)
    nav_section_start = content.find('<div class="elementor-section', nav_start)
    if nav_section_start == -1:
        nav_section_start = nav_start

    # Find footer
    footer_start = content.find('<footer', nav_start)
    if footer_start == -1:
        return None, has_scrollbar_fix

    # Check the area between nav and footer for orphaned columns
    between_section = content[nav_start:footer_start]

    # Count how many times the orphaned column IDs appear
    # These are the specific IDs that were duplicated
    orphan_9984908 = between_section.count('elementor-element-9984908')  # Shop column
    orphan_d726d5a = between_section.count('elementor-element-d726d5a')  # Search column
    orphan_0d32842 = between_section.count('elementor-element-0d32842')  # My Account column

    # Should only appear once each (in the main nav bar)
    has_duplicates = (orphan_9984908 > 1 or orphan_d726d5a > 1 or orphan_0d32842 > 1)

    return has_duplicates, has_scrollbar_fix

def main():
    """Main function"""
    frontend_dir = Path('frontend')
    html_files = list(frontend_dir.rglob('index.html'))

    print("Verification Report")
    print("=" * 70)
    print(f"{'File':<50} {'Duplicates':<12} {'CSS Fix'}")
    print("=" * 70)

    all_good = True
    for html_file in sorted(html_files):
        has_duplicates, has_css = verify_file(html_file)

        # Determine status
        nav_ok = not has_duplicates if has_duplicates is not None else True
        css_ok = has_css

        file_name = str(html_file.relative_to('frontend'))
        if len(file_name) > 48:
            file_name = "..." + file_name[-45:]

        dup_str = "✗ Found" if has_duplicates else "✓ None" if has_duplicates is not None else "N/A"
        css_str = "✓" if has_css else "✗"

        print(f"{file_name:<50} {dup_str:<12} {css_str}")

        if not (nav_ok and css_ok):
            all_good = False

    print("=" * 70)
    if all_good:
        print("✓ All files verified successfully!")
        print("\nAll pages have:")
        print("  - No duplicate navigation elements")
        print("  - Scrollbar fix CSS applied")
    else:
        print("✗ Some files have issues - please review above")

if __name__ == '__main__':
    main()

