# 批量在前端HTML页面中添加user-nav.js和auth.js脚本引用
# 此脚本会在所有HTML页面的</body>标签前添加脚本引用

$htmlFiles = @(
    "frontend/index.html",
    "frontend/index1.html",
    "frontend/about-us/index.html",
    "frontend/cart/index.html",
    "frontend/charity/index.html",
    "frontend/contact-us/index.html",
    "frontend/faq/index.html",
    "frontend/order-received/index.html",
    "frontend/pricing/index.html",
    "frontend/senior-pets-how-much-to-feed-your-pet/index.html",
    "frontend/shop/index.html",
    "frontend/shop/-canvas_4_grid.html",
    "frontend/shop/-canvas_4_list.html",
    "frontend/understanding-pet-food-labels/index.html",
    "frontend/wishlist/index.html"
)

$scriptsToAdd = @"

<!-- 用户认证和导航栏状态管理 -->
<script src="/assets/js/auth.js"></script>
<script src="/assets/js/user-nav.js"></script>
"@

$processedCount = 0
$skippedCount = 0
$errorCount = 0

foreach ($file in $htmlFiles) {
    if (!(Test-Path $file)) {
        Write-Host "文件不存在: $file" -ForegroundColor Yellow
        $errorCount++
        continue
    }

    try {
        $content = Get-Content $file -Raw -Encoding UTF8
        
        # 检查是否已经包含这些脚本
        if ($content -match "user-nav\.js" -or $content -match "auth\.js.*user-nav\.js") {
            Write-Host "已跳过 (已包含脚本): $file" -ForegroundColor Gray
            $skippedCount++
            continue
        }

        # 在</body>标签前添加脚本
        if ($content -match "</body>") {
            $newContent = $content -replace "</body>", "$scriptsToAdd`n</body>"
            Set-Content -Path $file -Value $newContent -Encoding UTF8 -NoNewline
            Write-Host "✓ 已处理: $file" -ForegroundColor Green
            $processedCount++
        } else {
            Write-Host "警告: 未找到</body>标签: $file" -ForegroundColor Yellow
            $errorCount++
        }
    } catch {
        Write-Host "错误: 处理文件失败 $file - $_" -ForegroundColor Red
        $errorCount++
    }
}

Write-Host "`n========== 处理完成 ==========" -ForegroundColor Cyan
Write-Host "成功处理: $processedCount 个文件" -ForegroundColor Green
Write-Host "已跳过: $skippedCount 个文件" -ForegroundColor Gray
Write-Host "错误: $errorCount 个文件" -ForegroundColor Red

