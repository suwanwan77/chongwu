# 检查所有HTML文件的导航栏和JS加载情况

$htmlFiles = @(
    "frontend/index.html",
    "frontend/index1.html",
    "frontend/Personal-Center/index.html",
    "frontend/about-us/index.html",
    "frontend/cart/index.html",
    "frontend/charity/index.html",
    "frontend/contact-us/index.html",
    "frontend/faq/index.html",
    "frontend/my-account/index.html",
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

Write-Host "`n=== 检查所有HTML页面 ===`n" -ForegroundColor Cyan

$issues = @()

foreach ($file in $htmlFiles) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw -Encoding UTF8
        
        $hasAuthJs = $content -match 'auth\.js'
        $hasUserNavJs = $content -match 'user-nav\.js'
        $hasSignIn = $content -match 'Sign In'
        $hasWishlistInPages = $content -match 'wishlist/index\.html.*Wishlist'
        $hasCharityCorrectLink = $content -match 'charity/index\.html.*Charity' -or $content -match '\.\./charity/index\.html.*Charity'
        $hasBlogListWrongLink = $content -match 'blog-list/index\.html'
        
        $fileIssues = @()
        
        if (-not $hasAuthJs) {
            $fileIssues += "缺少 auth.js"
        }
        
        if (-not $hasUserNavJs) {
            $fileIssues += "缺少 user-nav.js"
        }
        
        if (-not $hasSignIn) {
            $fileIssues += "缺少 Sign In 链接"
        }
        
        if (-not $hasWishlistInPages -and $file -notlike "*my-account*" -and $file -notlike "*register*") {
            $fileIssues += "Pages 菜单缺少 Wishlist"
        }
        
        if ($hasBlogListWrongLink) {
            $fileIssues += "Charity 链接错误 (指向 blog-list)"
        }
        
        if ($fileIssues.Count -eq 0) {
            Write-Host "✓ $file" -ForegroundColor Green
        } else {
            Write-Host "✗ $file" -ForegroundColor Red
            foreach ($issue in $fileIssues) {
                Write-Host "    - $issue" -ForegroundColor Yellow
            }
            $issues += [PSCustomObject]@{
                File = $file
                Issues = $fileIssues
            }
        }
    } else {
        Write-Host "✗ FILE NOT FOUND - $file" -ForegroundColor Red
    }
}

Write-Host "`n=== 总结 ===" -ForegroundColor Cyan
if ($issues.Count -eq 0) {
    Write-Host "所有页面都正常！✓" -ForegroundColor Green
} else {
    Write-Host "发现 $($issues.Count) 个页面有问题" -ForegroundColor Red
    Write-Host "`n问题详情:" -ForegroundColor Yellow
    foreach ($issue in $issues) {
        Write-Host "`n$($issue.File):" -ForegroundColor Cyan
        foreach ($i in $issue.Issues) {
            Write-Host "  - $i" -ForegroundColor Yellow
        }
    }
}

