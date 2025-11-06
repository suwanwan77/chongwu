# 批量删除所有HTML文件中的下拉登录表单

$htmlFiles = @(
    "frontend/index.html",
    "frontend/index1.html",
    "frontend/Personal-Center/index.html",
    "frontend/about-us/index.html",
    "frontend/cart/index.html",
    "frontend/charity/index.html",
    "frontend/contact-us/index.html",
    "frontend/faq/index.html",
    "frontend/order-received/index.html",
    "frontend/pricing/index.html",
    "frontend/register/index.html",
    "frontend/senior-pets-how-much-to-feed-your-pet/index.html",
    "frontend/shop/index.html",
    "frontend/shop/-canvas_4_grid.html",
    "frontend/shop/-canvas_4_list.html",
    "frontend/understanding-pet-food-labels/index.html",
    "frontend/wishlist/index.html"
)

foreach ($file in $htmlFiles) {
    if (Test-Path $file) {
        Write-Host "Processing: $file"
        
        $content = Get-Content $file -Raw -Encoding UTF8
        
        # 删除 account-wrap 下拉表单
        $pattern = '(?s)\s*<div class="account-wrap d-none">.*?</div>\s*</div>\s*(?=\s*<div class="gopet-mobile-nav">)'
        $replacement = "`n        <!-- 下拉登录表单已删除，点击 Sign In 直接跳转到登录页面 -->`n"
        
        $newContent = $content -replace $pattern, $replacement
        
        if ($content -ne $newContent) {
            Set-Content $file -Value $newContent -Encoding UTF8 -NoNewline
            Write-Host "  ✓ Removed dropdown form from $file" -ForegroundColor Green
        } else {
            Write-Host "  - No dropdown form found in $file" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  ✗ File not found: $file" -ForegroundColor Red
    }
}

Write-Host "`nDone!" -ForegroundColor Green

