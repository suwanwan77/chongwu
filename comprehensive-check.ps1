# 全面检查所有 HTML 页面的配置

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "全面检查所有 HTML 页面" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 获取所有 HTML 文件（排除 wp-content 目录）
$htmlFiles = Get-ChildItem -Path "frontend" -Filter "*.html" -Recurse | Where-Object { $_.FullName -notlike "*wp-*" }

Write-Host "找到 $($htmlFiles.Count) 个 HTML 文件" -ForegroundColor Yellow
Write-Host ""

$issues = @()

foreach ($file in $htmlFiles) {
    $relPath = $file.FullName -replace '.*\\frontend\\', 'frontend/' -replace '\\', '/'
    $content = Get-Content $file.FullName -Raw
    
    $fileIssues = @()
    
    # 检查 1: 是否加载了 auth.js
    if ($content -notmatch 'auth\.js') {
        $fileIssues += "❌ 缺少 auth.js"
    }
    
    # 检查 2: 是否加载了 user-nav.js
    if ($content -notmatch 'user-nav\.js') {
        $fileIssues += "❌ 缺少 user-nav.js"
    }
    
    # 检查 3: 是否有 account-dropdown（应该被删除）
    if ($content -match '<div class="account-dropdown">') {
        $fileIssues += "⚠️ 仍然有 account-dropdown"
    }
    
    # 检查 4: 是否有 Sign In 链接
    if ($content -notmatch 'Sign In') {
        $fileIssues += "⚠️ 没有 Sign In 文本"
    }
    
    # 检查 5: 是否有 site-header-account
    if ($content -notmatch 'site-header-account') {
        $fileIssues += "⚠️ 没有 site-header-account"
    }
    
    if ($fileIssues.Count -gt 0) {
        $issues += [PSCustomObject]@{
            File = $relPath
            Issues = $fileIssues -join ", "
        }
        Write-Host "❌ $relPath" -ForegroundColor Red
        foreach ($issue in $fileIssues) {
            Write-Host "   $issue" -ForegroundColor Yellow
        }
    } else {
        Write-Host "✅ $relPath" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "检查完成" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if ($issues.Count -eq 0) {
    Write-Host "✅ 所有页面都配置正确！" -ForegroundColor Green
} else {
    Write-Host "⚠️ 发现 $($issues.Count) 个页面有问题" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "问题汇总:" -ForegroundColor Yellow
    $issues | Format-Table -AutoSize
}

