# 查找所有缺少 auth.js 和 user-nav.js 的HTML文件

$allHtmlFiles = Get-ChildItem -Path "frontend" -Filter "*.html" -Recurse | Where-Object { $_.FullName -notlike "*wp-*" }

Write-Host "`n=== 检查所有HTML文件是否加载了 auth.js 和 user-nav.js ===`n" -ForegroundColor Cyan

$missingFiles = @()

foreach ($file in $allHtmlFiles) {
    $relativePath = $file.FullName -replace '.*\\frontend\\', 'frontend/' -replace '\\', '/'
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    
    $hasAuthJs = $content -match 'auth\.js'
    $hasUserNavJs = $content -match 'user-nav\.js'
    
    if (-not $hasAuthJs -or -not $hasUserNavJs) {
        $missing = @()
        if (-not $hasAuthJs) { $missing += "auth.js" }
        if (-not $hasUserNavJs) { $missing += "user-nav.js" }
        
        Write-Host "✗ $relativePath" -ForegroundColor Red
        Write-Host "    缺少: $($missing -join ', ')" -ForegroundColor Yellow
        
        $missingFiles += [PSCustomObject]@{
            Path = $relativePath
            Missing = $missing
        }
    } else {
        Write-Host "✓ $relativePath" -ForegroundColor Green
    }
}

Write-Host "`n=== 总结 ===" -ForegroundColor Cyan
if ($missingFiles.Count -eq 0) {
    Write-Host "所有页面都已加载必要的JS文件！✓" -ForegroundColor Green
} else {
    Write-Host "发现 $($missingFiles.Count) 个页面缺少JS文件" -ForegroundColor Red
    Write-Host "`n需要修复的文件:" -ForegroundColor Yellow
    foreach ($file in $missingFiles) {
        Write-Host "  - $($file.Path): 缺少 $($file.Missing -join ', ')" -ForegroundColor Cyan
    }
}

