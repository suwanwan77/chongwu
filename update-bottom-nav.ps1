# PowerShell script to update bottom navigation bar in all HTML files

# Function to calculate relative path from current page to target
function Get-RelativePath {
    param (
        [string]$fromPath,
        [string]$toPath
    )

    $fromDir = Split-Path -Parent $fromPath
    $fromParts = $fromDir -split '[\\/]'
    $depth = ($fromParts | Where-Object { $_ -ne '' -and $_ -ne 'frontend' }).Count

    if ($depth -eq 0) {
        return $toPath
    } else {
        $prefix = "../" * $depth
        return $prefix + $toPath
    }
}

# Get all index.html files
$htmlFiles = Get-ChildItem -Path "frontend" -Recurse -Filter "index.html"

Write-Host "Found $($htmlFiles.Count) HTML files to update"
Write-Host "Current directory: $PWD"

foreach ($file in $htmlFiles) {
    Write-Host "Processing: $($file.FullName)"
    
    # Calculate relative paths
    $relativePath = $file.FullName -replace [regex]::Escape("$PWD\frontend\"), ""
    
    $homeLink = Get-RelativePath -fromPath $relativePath -toPath "index.html"
    $shopLink = Get-RelativePath -fromPath $relativePath -toPath "shop/index.html"
    $myAccountLink = Get-RelativePath -fromPath $relativePath -toPath "my-account/index.html"
    
    # Read file content
    $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
    
    # Define the new bottom navigation bar HTML
    $newNavBar = @"
						<div class="elementor-section elementor-top-section elementor-element elementor-element-97aed3a elementor-section-content-middle elementor-section-stretched elementor-hidden-desktop elementor-hidden-laptop elementor-hidden-tablet_extra elementor-section-boxed elementor-section-height-default elementor-section-height-default" data-id="97aed3a" data-element_type="section" data-settings="{&quot;stretch_section&quot;:&quot;section-stretched&quot;,&quot;background_background&quot;:&quot;classic&quot;}">
						<div class="elementor-container elementor-column-gap-no">
					<div class="elementor-column elementor-col-25 elementor-top-column elementor-element elementor-element-af0d546" data-id="af0d546" data-element_type="column">
			<div class="elementor-widget-wrap elementor-element-populated">
						<div class="elementor-element elementor-element-b35ea11 elementor-view-default elementor-position-top elementor-mobile-position-top elementor-widget elementor-widget-icon-box" data-id="b35ea11" data-element_type="widget" data-widget_type="icon-box.default">
				<div class="elementor-widget-container">
							<div class="elementor-icon-box-wrapper">

						<div class="elementor-icon-box-icon">
				<a href="$homeLink" class="elementor-icon" tabindex="-1" aria-label="Home">
				<i aria-hidden="true" class="gopet-icon- gopet-icon-home"></i>				</a>
			</div>

						<div class="elementor-icon-box-content">

									<h3 class="elementor-icon-box-title">
						<a href="$homeLink">
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
				<a href="$shopLink" class="elementor-icon" tabindex="-1" aria-label="Shop">
				<i aria-hidden="true" class="fas fa-shopping-cart"></i>				</a>
			</div>

						<div class="elementor-icon-box-content">

									<h3 class="elementor-icon-box-title">
						<a href="$shopLink">
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
				<a href="$myAccountLink" class="elementor-icon" tabindex="-1" aria-label="My Account">
				<i aria-hidden="true" class="gopet-icon- gopet-icon-account"></i>				</a>
			</div>

						<div class="elementor-icon-box-content">

									<h3 class="elementor-icon-box-title">
						<a href="$myAccountLink">
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
				</div>
"@
    
    # Use regex to find and replace the bottom navigation bar
    # Pattern: from opening div with elementor-element-97aed3a to its closing </div>
    $pattern = '(?s)<div class="elementor-section elementor-top-section elementor-element elementor-element-97aed3a.*?</div>\s*</div>\s*</div>'
    
    if ($content -match $pattern) {
        $content = $content -replace $pattern, $newNavBar
        
        # Save the updated content
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
        Write-Host "  ✓ Updated successfully" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Pattern not found" -ForegroundColor Yellow
    }
}

Write-Host "`nAll files processed!" -ForegroundColor Cyan

