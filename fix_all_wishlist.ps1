# PowerShell script to replace Wishlist button with My Account button

$files = @(
    "frontend/blog-list/index.html",
    "frontend/blog-list/page/2/index.html",
    "frontend/contact-us/index.html",
    "frontend/faq/index.html",
    "frontend/order-received/index.html",
    "frontend/pricing/index.html",
    "frontend/senior-pets-how-much-to-feed-your-pet/index.html",
    "frontend/shop/intelligent-marble-knife/index.html",
    "frontend/understanding-pet-food-labels/index.html"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Processing: $file"
        
        # Read content
        $content = Get-Content -Path $file -Raw -Encoding UTF8
        
        # Calculate relative path to my-account
        $depth = ($file -split '[/\\]').Count - 2  # Subtract 2 for 'frontend' and 'index.html'
        $prefix = if ($depth -gt 0) { "../" * $depth } else { "" }
        $myAccountLink = $prefix + "my-account/index.html"
        
        # Replace Wishlist with My Account
        $content = $content -replace 'href="[^"]*wishlist[^"]*" class="elementor-icon" tabindex="-1" aria-label="Wishlist">\s*<i aria-hidden="true" class="far fa-heart"></i>', "href=`"$myAccountLink`" class=`"elementor-icon`" tabindex=`"-1`" aria-label=`"My Account`">`n`t`t`t`t<i aria-hidden=`"true`" class=`"gopet-icon- gopet-icon-account`"></i>"
        
        $content = $content -replace '<a href="[^"]*wishlist[^"]*">\s*Wishlist\s*</a>', "<a href=`"$myAccountLink`">`n`t`t`t`t`t`t`tMy Account`t`t`t`t`t`t</a>"
        
        # Save content
        Set-Content -Path $file -Value $content -Encoding UTF8 -NoNewline
        
        Write-Host "  ✓ Updated" -ForegroundColor Green
    } else {
        Write-Host "  ✗ File not found: $file" -ForegroundColor Yellow
    }
}

Write-Host "`nDone!" -ForegroundColor Cyan

