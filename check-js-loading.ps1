# 检查所有HTML文件是否加载了 auth.js 和 user-nav.js

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

Write-Host "`n=== 检查 HTML 文件是否加载了必要的 JS 文件 ===`n" -ForegroundColor Cyan

$missingAuthJs = @()
$missingUserNavJs = @()

foreach ($file in $htmlFiles) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw -Encoding UTF8
        
        $hasAuthJs = $content -match 'auth\.js'
        $hasUserNavJs = $content -match 'user-nav\.js'
        
        if (-not $hasAuthJs) {
            $missingAuthJs += $file
        }
        
        if (-not $hasUserNavJs) {
            $missingUserNavJs += $file
        }
        
        $status = ""
        if ($hasAuthJs -and $hasUserNavJs) {
            $status = "✓ OK"
            Write-Host "$status - $file" -ForegroundColor Green
        } else {
            $status = "✗ MISSING"
            Write-Host "$status - $file" -ForegroundColor Red
            if (-not $hasAuthJs) {
                Write-Host "    Missing: auth.js" -ForegroundColor Yellow
            }
            if (-not $hasUserNavJs) {
                Write-Host "    Missing: user-nav.js" -ForegroundColor Yellow
            }
        }
    } else {
        Write-Host "✗ FILE NOT FOUND - $file" -ForegroundColor Red
    }
}

Write-Host "`n=== 总结 ===" -ForegroundColor Cyan
Write-Host "缺少 auth.js 的文件数: $($missingAuthJs.Count)" -ForegroundColor $(if ($missingAuthJs.Count -eq 0) { "Green" } else { "Red" })
Write-Host "缺少 user-nav.js 的文件数: $($missingUserNavJs.Count)" -ForegroundColor $(if ($missingUserNavJs.Count -eq 0) { "Green" } else { "Red" })

if ($missingAuthJs.Count -gt 0) {
    Write-Host "`n缺少 auth.js 的文件:" -ForegroundColor Yellow
    $missingAuthJs | ForEach-Object { Write-Host "  - $_" }
}

if ($missingUserNavJs.Count -gt 0) {
    Write-Host "`n缺少 user-nav.js 的文件:" -ForegroundColor Yellow
    $missingUserNavJs | ForEach-Object { Write-Host "  - $_" }
}

