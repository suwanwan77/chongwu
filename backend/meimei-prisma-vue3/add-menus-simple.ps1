# Simple PowerShell script to add product management menus
$ErrorActionPreference = "Continue"

$mysql = "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe"
$db = "meimei-prisma"

Write-Host "`n=== Adding Product Management Menus ===`n" -ForegroundColor Cyan

# Step 1: Add parent menu
Write-Host "Step 1: Adding parent menu..." -ForegroundColor Yellow
& $mysql -h localhost -P 3306 -u maosha -p123456 $db --default-character-set=utf8mb4 -e "INSERT INTO sys_menu (menuName, parentId, orderNum, path, component, query, isFrame, isCache, menuType, visible, status, perms, icon, createBy, createTime) VALUES ('商品管理', NULL, 4, 'product', NULL, '', '1', '0', 'M', '0', '0', '', 'shopping', 'admin', NOW());" 2>&1 | Where-Object { $_ -notmatch "Warning" }

# Get parent menu ID
$productMenuId = & $mysql -h localhost -P 3306 -u maosha -p123456 $db --default-character-set=utf8mb4 -N -e "SELECT menuId FROM sys_menu WHERE menuName='商品管理' AND parentId IS NULL ORDER BY menuId DESC LIMIT 1;" 2>&1 | Where-Object { $_ -notmatch "Warning" } | Select-Object -Last 1
$productMenuId = $productMenuId.Trim()
Write-Host "Product Menu ID: $productMenuId" -ForegroundColor Green

# Step 2: Add category menu
Write-Host "`nStep 2: Adding category menu..." -ForegroundColor Yellow
& $mysql -h localhost -P 3306 -u maosha -p123456 $db --default-character-set=utf8mb4 -e "INSERT INTO sys_menu (menuName, parentId, orderNum, path, component, query, isFrame, isCache, menuType, visible, status, perms, icon, createBy, createTime) VALUES ('商品分类', $productMenuId, 1, 'category', 'product/category/index', '', '1', '0', 'C', '0', '0', 'product:category:list', 'tree', 'admin', NOW());" 2>&1 | Where-Object { $_ -notmatch "Warning" }

$categoryMenuId = & $mysql -h localhost -P 3306 -u maosha -p123456 $db --default-character-set=utf8mb4 -N -e "SELECT menuId FROM sys_menu WHERE menuName='商品分类' AND parentId=$productMenuId ORDER BY menuId DESC LIMIT 1;" 2>&1 | Where-Object { $_ -notmatch "Warning" } | Select-Object -Last 1
$categoryMenuId = $categoryMenuId.Trim()
Write-Host "Category Menu ID: $categoryMenuId" -ForegroundColor Green

# Step 3: Add category permissions
Write-Host "`nStep 3: Adding category permissions..." -ForegroundColor Yellow
& $mysql -h localhost -P 3306 -u maosha -p123456 $db --default-character-set=utf8mb4 -e "INSERT INTO sys_menu (menuName, parentId, orderNum, path, component, query, isFrame, isCache, menuType, visible, status, perms, icon, createBy, createTime) VALUES ('商品分类查询', $categoryMenuId, 1, '#', '', '', '1', '0', 'F', '0', '0', 'product:category:query', '#', 'admin', NOW()), ('商品分类新增', $categoryMenuId, 2, '#', '', '', '1', '0', 'F', '0', '0', 'product:category:add', '#', 'admin', NOW()), ('商品分类修改', $categoryMenuId, 3, '#', '', '', '1', '0', 'F', '0', '0', 'product:category:edit', '#', 'admin', NOW()), ('商品分类删除', $categoryMenuId, 4, '#', '', '', '1', '0', 'F', '0', '0', 'product:category:remove', '#', 'admin', NOW());" 2>&1 | Where-Object { $_ -notmatch "Warning" }

# Step 4: Add goods menu
Write-Host "`nStep 4: Adding goods menu..." -ForegroundColor Yellow
& $mysql -h localhost -P 3306 -u maosha -p123456 $db --default-character-set=utf8mb4 -e "INSERT INTO sys_menu (menuName, parentId, orderNum, path, component, query, isFrame, isCache, menuType, visible, status, perms, icon, createBy, createTime) VALUES ('商品列表', $productMenuId, 2, 'goods', 'product/goods/index', '', '1', '0', 'C', '0', '0', 'product:goods:list', 'goods', 'admin', NOW());" 2>&1 | Where-Object { $_ -notmatch "Warning" }

$goodsMenuId = & $mysql -h localhost -P 3306 -u maosha -p123456 $db --default-character-set=utf8mb4 -N -e "SELECT menuId FROM sys_menu WHERE menuName='商品列表' AND parentId=$productMenuId ORDER BY menuId DESC LIMIT 1;" 2>&1 | Where-Object { $_ -notmatch "Warning" } | Select-Object -Last 1
$goodsMenuId = $goodsMenuId.Trim()
Write-Host "Goods Menu ID: $goodsMenuId" -ForegroundColor Green

# Step 5: Add goods permissions
Write-Host "`nStep 5: Adding goods permissions..." -ForegroundColor Yellow
& $mysql -h localhost -P 3306 -u maosha -p123456 $db --default-character-set=utf8mb4 -e "INSERT INTO sys_menu (menuName, parentId, orderNum, path, component, query, isFrame, isCache, menuType, visible, status, perms, icon, createBy, createTime) VALUES ('商品查询', $goodsMenuId, 1, '#', '', '', '1', '0', 'F', '0', '0', 'product:goods:query', '#', 'admin', NOW()), ('商品新增', $goodsMenuId, 2, '#', '', '', '1', '0', 'F', '0', '0', 'product:goods:add', '#', 'admin', NOW()), ('商品修改', $goodsMenuId, 3, '#', '', '', '1', '0', 'F', '0', '0', 'product:goods:edit', '#', 'admin', NOW()), ('商品删除', $goodsMenuId, 4, '#', '', '', '1', '0', 'F', '0', '0', 'product:goods:remove', '#', 'admin', NOW());" 2>&1 | Where-Object { $_ -notmatch "Warning" }

# Step 6: Add order menu
Write-Host "`nStep 6: Adding order menu..." -ForegroundColor Yellow
& $mysql -h localhost -P 3306 -u maosha -p123456 $db --default-character-set=utf8mb4 -e "INSERT INTO sys_menu (menuName, parentId, orderNum, path, component, query, isFrame, isCache, menuType, visible, status, perms, icon, createBy, createTime) VALUES ('订单管理', $productMenuId, 3, 'order', 'product/order/index', '', '1', '0', 'C', '0', '0', 'product:order:list', 'list', 'admin', NOW());" 2>&1 | Where-Object { $_ -notmatch "Warning" }

$orderMenuId = & $mysql -h localhost -P 3306 -u maosha -p123456 $db --default-character-set=utf8mb4 -N -e "SELECT menuId FROM sys_menu WHERE menuName='订单管理' AND parentId=$productMenuId ORDER BY menuId DESC LIMIT 1;" 2>&1 | Where-Object { $_ -notmatch "Warning" } | Select-Object -Last 1
$orderMenuId = $orderMenuId.Trim()
Write-Host "Order Menu ID: $orderMenuId" -ForegroundColor Green

# Step 7: Add order permissions
Write-Host "`nStep 7: Adding order permissions..." -ForegroundColor Yellow
& $mysql -h localhost -P 3306 -u maosha -p123456 $db --default-character-set=utf8mb4 -e "INSERT INTO sys_menu (menuName, parentId, orderNum, path, component, query, isFrame, isCache, menuType, visible, status, perms, icon, createBy, createTime) VALUES ('订单查询', $orderMenuId, 1, '#', '', '', '1', '0', 'F', '0', '0', 'product:order:query', '#', 'admin', NOW()), ('订单详情', $orderMenuId, 2, '#', '', '', '1', '0', 'F', '0', '0', 'product:order:detail', '#', 'admin', NOW()), ('订单发货', $orderMenuId, 3, '#', '', '', '1', '0', 'F', '0', '0', 'product:order:ship', '#', 'admin', NOW());" 2>&1 | Where-Object { $_ -notmatch "Warning" }

# Step 8: Assign to admin role
Write-Host "`nStep 8: Assigning menus to admin role..." -ForegroundColor Yellow
& $mysql -h localhost -P 3306 -u maosha -p123456 $db --default-character-set=utf8mb4 -e "INSERT INTO _sys_menu_to_sys_role (A, B) SELECT menuId, 1 FROM sys_menu WHERE perms LIKE 'product:%' OR (parentId IS NULL AND path = 'product');" 2>&1 | Where-Object { $_ -notmatch "Warning" }

# Verify
Write-Host "`n=== Verification ===`n" -ForegroundColor Cyan
& $mysql -h localhost -P 3306 -u maosha -p123456 $db --default-character-set=utf8mb4 -e "SELECT menuId, menuName, parentId, path, perms FROM sys_menu WHERE perms LIKE 'product:%' OR (parentId IS NULL AND path = 'product') ORDER BY menuId;" 2>&1 | Where-Object { $_ -notmatch "Warning" }

Write-Host "`n=== Success! ===`n" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Refresh admin panel: http://localhost:80" -ForegroundColor White
Write-Host "2. Logout and login again" -ForegroundColor White
Write-Host "3. Check left sidebar for 'Product Management' menu`n" -ForegroundColor White

