#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script to update bottom navigation bar in all HTML files
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

def update_html_file(file_path):
    """Update bottom navigation bar in a single HTML file"""
    print(f"\nProcessing: {file_path}")
    
    # Read file content
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Calculate relative paths
    relative_path = str(file_path).replace('frontend' + os.sep, '').replace('frontend/', '')
    
    home_link = get_relative_path(relative_path, 'index.html')
    shop_link = get_relative_path(relative_path, 'shop/index.html')
    my_account_link = get_relative_path(relative_path, 'my-account/index.html')
    
    print(f"  Home link: {home_link}")
    print(f"  Shop link: {shop_link}")
    print(f"  My Account link: {my_account_link}")
    
    # Define the new bottom navigation bar HTML
    new_nav_bar = f'''						<div class="elementor-section elementor-top-section elementor-element elementor-element-97aed3a elementor-section-content-middle elementor-section-stretched elementor-hidden-desktop elementor-hidden-laptop elementor-hidden-tablet_extra elementor-section-boxed elementor-section-height-default elementor-section-height-default" data-id="97aed3a" data-element_type="section" data-settings="{{\\"stretch_section\\":\\"section-stretched\\",\\"background_background\\":\\"classic\\"}}">
						<div class="elementor-container elementor-column-gap-no">
					<div class="elementor-column elementor-col-25 elementor-top-column elementor-element elementor-element-af0d546" data-id="af0d546" data-element_type="column">
			<div class="elementor-widget-wrap elementor-element-populated">
						<div class="elementor-element elementor-element-b35ea11 elementor-view-default elementor-position-top elementor-mobile-position-top elementor-widget elementor-widget-icon-box" data-id="b35ea11" data-element_type="widget" data-widget_type="icon-box.default">
				<div class="elementor-widget-container">
							<div class="elementor-icon-box-wrapper">

						<div class="elementor-icon-box-icon">
				<a href="{home_link}" class="elementor-icon" tabindex="-1" aria-label="Home">
				<i aria-hidden="true" class="gopet-icon- gopet-icon-home"></i>				</a>
			</div>

						<div class="elementor-icon-box-content">

									<h3 class="elementor-icon-box-title">
						<a href="{home_link}">
							Home						</a>
					</h3>


			</div>

		</div>
						</div>
				</div>
					</div>
		</div>
				<div class="elementor-column elementor-col-25 elementor-top-column elementor-element elementor-element-9984908" data-id="9984908" data-element_type="column">
			<div class="elementor-widget-wrap elementor-element-populated">
						<div class="elementor-element elementor-element-cf727eb elementor-view-default elementor-position-top elementor-mobile-position-top elementor-widget elementor-widget-icon-box" data-id="cf727eb" data-element_type="widget" data-widget_type="icon-box.default">
				<div class="elementor-widget-container">
							<div class="elementor-icon-box-wrapper">

						<div class="elementor-icon-box-icon">
				<a href="{shop_link}" class="elementor-icon" tabindex="-1" aria-label="Shop">
				<i aria-hidden="true" class="fas fa-shopping-cart"></i>				</a>
			</div>

						<div class="elementor-icon-box-content">

									<h3 class="elementor-icon-box-title">
						<a href="{shop_link}">
							Shop						</a>
					</h3>


			</div>

		</div>
						</div>
				</div>
					</div>
		</div>
				<div class="elementor-column elementor-col-25 elementor-top-column elementor-element elementor-element-d726d5a" data-id="d726d5a" data-element_type="column">
			<div class="elementor-widget-wrap elementor-element-populated">
						<div class="elementor-element elementor-element-4f55441 elementor-widget elementor-widget-gopet-search" data-id="4f55441" data-element_type="widget" data-widget_type="gopet-search.default">
				<div class="elementor-widget-container">
					            <div class="site-header-search">
                <a href="#" class="button-search-popup">
                    <i class="gopet-icon-search"></i>
                    <span class="content">Search</span>
                </a>
            </div>
            				</div>
				</div>
					</div>
		</div>
				<div class="elementor-column elementor-col-25 elementor-top-column elementor-element elementor-element-0d32842" data-id="0d32842" data-element_type="column">
			<div class="elementor-widget-wrap elementor-element-populated">
						<div class="elementor-element elementor-element-08f7ef6 elementor-view-default elementor-position-top elementor-mobile-position-top elementor-widget elementor-widget-icon-box" data-id="08f7ef6" data-element_type="widget" data-widget_type="icon-box.default">
				<div class="elementor-widget-container">
							<div class="elementor-icon-box-wrapper">

						<div class="elementor-icon-box-icon">
				<a href="{my_account_link}" class="elementor-icon" tabindex="-1" aria-label="My Account">
				<i aria-hidden="true" class="gopet-icon- gopet-icon-account"></i>				</a>
			</div>

						<div class="elementor-icon-box-content">

									<h3 class="elementor-icon-box-title">
						<a href="{my_account_link}">
							My Account						</a>
					</h3>


			</div>

		</div>
						</div>
				</div>
					</div>
		</div>
					</div>
		</div>
				</div>'''
    
    # Use regex to find and replace the bottom navigation bar
    # Pattern: from opening div with elementor-element-97aed3a to its closing </div>
    pattern = r'<div class="elementor-section elementor-top-section elementor-element elementor-element-97aed3a.*?</div>\s*</div>\s*</div>'
    
    match = re.search(pattern, content, re.DOTALL)
    if match:
        content = re.sub(pattern, new_nav_bar, content, flags=re.DOTALL)
        
        # Save the updated content
        with open(file_path, 'w', encoding='utf-8', newline='') as f:
            f.write(content)
        
        print(f"  ✓ Updated successfully")
        return True
    else:
        print(f"  ✗ Pattern not found")
        return False

def main():
    """Main function"""
    frontend_dir = Path('frontend')
    
    # Get all index.html files
    html_files = list(frontend_dir.rglob('index.html'))
    
    print(f"Found {len(html_files)} HTML files to update")
    
    updated_count = 0
    for file_path in html_files:
        if update_html_file(file_path):
            updated_count += 1
    
    print(f"\n{'='*60}")
    print(f"All files processed!")
    print(f"Updated: {updated_count}/{len(html_files)} files")
    print(f"{'='*60}")

if __name__ == '__main__':
    main()

