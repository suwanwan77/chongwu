# 最终检查所有HTML页面

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "检查所有HTML页面的 Sign In 功能" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$pages = @(
    @{Path="frontend/index.html"; Name="首页"},
    @{Path="frontend/index1.html"; Name="首页备份"},
    @{Path="frontend/Personal-Center/index.html"; Name="个人中心"},
    @{Path="frontend/about-us/index.html"; Name="关于我们"},
    @{Path="frontend/cart/index.html"; Name="购物车"},
    @{Path="frontend/charity/index.html"; Name="慈善"},
    @{Path="frontend/contact-us/index.html"; Name="联系我们"},
    @{Path="frontend/faq/index.html"; Name="常见问题"},
    @{Path="frontend/my-account/index.html"; Name="登录页面"},
    @{Path="frontend/order-received/index.html"; Name="订单确认"},
    @{Path="frontend/pricing/index.html"; Name="价格"},
    @{Path="frontend/register/index.html"; Name="注册"},
    @{Path="frontend/senior-pets-how-much-to-feed-your-pet/index.html"; Name="宠物喂养指南"},
    @{Path="frontend/shop/index.html"; Name="商店"},
    @{Path="frontend/shop/-canvas_4_grid.html"; Name="商店网格视图"},
    @{Path="frontend/shop/-canvas_4_list.html"; Name="商店列表视图"},
    @{Path="frontend/understanding-pet-food-labels/index.html"; Name="宠物食品标签"},
    @{Path="frontend/wishlist/index.html"; Name="愿望清单"}
)

$allGood = $true
$issues = @()

foreach ($page in $pages) {
    $path = $page.Path
    $name = $page.Name
    
    if (-not (Test-Path $path)) {
        Write-Host "✗ [$name] 文件不存在: $path" -ForegroundColor Red
        $allGood = $false
        $issues += "[$name] 文件不存在"
        continue
    }
    
    $content = Get-Content $path -Raw -Encoding UTF8
    
    # 检查是否加载了 auth.js
    $hasAuthJs = $content -match 'auth\.js'
    
    # 检查是否加载了 user-nav.js
    $hasUserNavJs = $content -match 'user-nav\.js'
    
    # 检查是否有 Sign In 链接
    $hasSignIn = $content -match 'Sign In'
    
    # 检查是否有 site-header-account
    $hasSiteHeaderAccount = $content -match 'site-header-account'
    
    $pageIssues = @()
    
    if (-not $hasAuthJs) {
        $pageIssues += "缺少 auth.js"
    }
    
    if (-not $hasUserNavJs) {
        $pageIssues += "缺少 user-nav.js"
    }
    
    if (-not $hasSignIn -and $path -notlike "*my-account*" -and $path -notlike "*register*") {
        $pageIssues += "缺少 Sign In 链接"
    }
    
    if (-not $hasSiteHeaderAccount -and $path -notlike "*my-account*" -and $path -notlike "*register*") {
        $pageIssues += "缺少 site-header-account 元素"
    }
    
    if ($pageIssues.Count -eq 0) {
        Write-Host "✓ [$name] 所有检查通过" -ForegroundColor Green
    } else {
        Write-Host "✗ [$name] 发现问题:" -ForegroundColor Red
        foreach ($issue in $pageIssues) {
            Write-Host "    - $issue" -ForegroundColor Yellow
        }
        $allGood = $false
        $issues += "[$name] " + ($pageIssues -join ", ")
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "检查结果总结" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

if ($allGood) {
    Write-Host "✓ 所有页面检查通过！" -ForegroundColor Green
    Write-Host "`n所有页面都已正确配置：" -ForegroundColor Green
    Write-Host "  - 加载了 auth.js" -ForegroundColor Green
    Write-Host "  - 加载了 user-nav.js" -ForegroundColor Green
    Write-Host "  - 包含 Sign In 链接" -ForegroundColor Green
    Write-Host "  - 包含 site-header-account 元素" -ForegroundColor Green
    Write-Host "`n现在所有页面的 Sign In 链接都应该能够正常跳转到登录页面！" -ForegroundColor Green
} else {
    Write-Host "✗ 发现 $($issues.Count) 个问题" -ForegroundColor Red
    Write-Host "`n问题列表:" -ForegroundColor Yellow
    foreach ($issue in $issues) {
        Write-Host "  - $issue" -ForegroundColor Yellow
    }
}

Write-Host "`n========================================`n" -ForegroundColor Cyan

