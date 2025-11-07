# PowerShell Script: Execute SQL statements to add product management menus
# Encoding: UTF-8

$ErrorActionPreference = "Stop"

Write-Host "`n=== Adding Product Management Menus to Admin System ===`n" -ForegroundColor Cyan

$mysqlPath = "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe"
$mysqlHost = "localhost"
$mysqlPort = "3306"
$mysqlUser = "maosha"
$mysqlPassword = "123456"
$mysqlDatabase = "meimei-prisma"

# Function to execute SQL
function Execute-SQL {
    param([string]$sql)
    
    $sql = $sql.Trim()
    if ([string]::IsNullOrWhiteSpace($sql) -or $sql.StartsWith("--")) {
        return
    }
    
    Write-Host "Executing: $($sql.Substring(0, [Math]::Min(80, $sql.Length)))..." -ForegroundColor Gray
    
    $tempFile = [System.IO.Path]::GetTempFileName()
    [System.IO.File]::WriteAllText($tempFile, $sql, [System.Text.Encoding]::UTF8)
    
    try {
        $output = & $mysqlPath -h $mysqlHost -P $mysqlPort -u $mysqlUser -p$mysqlPassword $mysqlDatabase --default-character-set=utf8mb4 -e "source $tempFile" 2>&1
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Error: $output" -ForegroundColor Red
            throw "SQL execution failed"
        }
        
        if ($output) {
            Write-Host $output -ForegroundColor Green
        }
    } finally {
        Remove-Item $tempFile -ErrorAction SilentlyContinue
    }
}

Write-Host "Step 1: Adding parent menu (Product Management)..." -ForegroundColor Yellow

Execute-SQL @"
USE \`meimei-prisma\`;
INSERT INTO sys_menu (menuName, parentId, orderNum, path, component, query, isFrame, isCache, menuType, visible, status, perms, icon, createBy, createTime, updateBy, updateTime, remark)
VALUES ('商品管理', 0, 4, 'product', NULL, '', '1', '0', 'M', '0', '0', '', 'shopping', 'admin', NOW(), '', NULL, '商品管理目录');
"@

Write-Host "Step 2: Getting parent menu ID..." -ForegroundColor Yellow

$productMenuId = & $mysqlPath -h $mysqlHost -P $mysqlPort -u $mysqlUser -p$mysqlPassword $mysqlDatabase --default-character-set=utf8mb4 -N -e "SELECT menuId FROM sys_menu WHERE menuName='商品管理' AND parentId=0 ORDER BY menuId DESC LIMIT 1;" 2>&1 | Select-Object -Last 1

Write-Host "Product Menu ID: $productMenuId" -ForegroundColor Green

Write-Host "Step 3: Adding Category Management menu..." -ForegroundColor Yellow

Execute-SQL @"
USE \`meimei-prisma\`;
INSERT INTO sys_menu (menuName, parentId, orderNum, path, component, query, isFrame, isCache, menuType, visible, status, perms, icon, createBy, createTime, updateBy, updateTime, remark)
VALUES ('商品分类', $productMenuId, 1, 'category', 'product/category/index', '', '1', '0', 'C', '0', '0', 'product:category:list', 'tree', 'admin', NOW(), '', NULL, '商品分类菜单');
"@

$categoryMenuId = & $mysqlPath -h $mysqlHost -P $mysqlPort -u $mysqlUser -p$mysqlPassword $mysqlDatabase --default-character-set=utf8mb4 -N -e "SELECT menuId FROM sys_menu WHERE menuName='商品分类' AND parentId=$productMenuId ORDER BY menuId DESC LIMIT 1;" 2>&1 | Select-Object -Last 1

Write-Host "Category Menu ID: $categoryMenuId" -ForegroundColor Green

Write-Host "Step 4: Adding Category Management permissions..." -ForegroundColor Yellow

Execute-SQL @"
USE \`meimei-prisma\`;
INSERT INTO sys_menu (menuName, parentId, orderNum, path, component, query, isFrame, isCache, menuType, visible, status, perms, icon, createBy, createTime, updateBy, updateTime, remark)
VALUES
('商品分类查询', $categoryMenuId, 1, '#', '', '', '1', '0', 'F', '0', '0', 'product:category:query', '#', 'admin', NOW(), '', NULL, ''),
('商品分类新增', $categoryMenuId, 2, '#', '', '', '1', '0', 'F', '0', '0', 'product:category:add', '#', 'admin', NOW(), '', NULL, ''),
('商品分类修改', $categoryMenuId, 3, '#', '', '', '1', '0', 'F', '0', '0', 'product:category:edit', '#', 'admin', NOW(), '', NULL, ''),
('商品分类删除', $categoryMenuId, 4, '#', '', '', '1', '0', 'F', '0', '0', 'product:category:remove', '#', 'admin', NOW(), '', NULL, '');
"@

Write-Host "Step 5: Adding Product Management menu..." -ForegroundColor Yellow

Execute-SQL @"
USE \`meimei-prisma\`;
INSERT INTO sys_menu (menuName, parentId, orderNum, path, component, query, isFrame, isCache, menuType, visible, status, perms, icon, createBy, createTime, updateBy, updateTime, remark)
VALUES ('商品列表', $productMenuId, 2, 'goods', 'product/goods/index', '', '1', '0', 'C', '0', '0', 'product:goods:list', 'goods', 'admin', NOW(), '', NULL, '商品管理菜单');
"@

$goodsMenuId = & $mysqlPath -h $mysqlHost -P $mysqlPort -u $mysqlUser -p$mysqlPassword $mysqlDatabase --default-character-set=utf8mb4 -N -e "SELECT menuId FROM sys_menu WHERE menuName='商品列表' AND parentId=$productMenuId ORDER BY menuId DESC LIMIT 1;" 2>&1 | Select-Object -Last 1

Write-Host "Goods Menu ID: $goodsMenuId" -ForegroundColor Green

Write-Host "Step 6: Adding Product Management permissions..." -ForegroundColor Yellow

Execute-SQL @"
USE \`meimei-prisma\`;
INSERT INTO sys_menu (menuName, parentId, orderNum, path, component, query, isFrame, isCache, menuType, visible, status, perms, icon, createBy, createTime, updateBy, updateTime, remark)
VALUES
('商品查询', $goodsMenuId, 1, '#', '', '', '1', '0', 'F', '0', '0', 'product:goods:query', '#', 'admin', NOW(), '', NULL, ''),
('商品新增', $goodsMenuId, 2, '#', '', '', '1', '0', 'F', '0', '0', 'product:goods:add', '#', 'admin', NOW(), '', NULL, ''),
('商品修改', $goodsMenuId, 3, '#', '', '', '1', '0', 'F', '0', '0', 'product:goods:edit', '#', 'admin', NOW(), '', NULL, ''),
('商品删除', $goodsMenuId, 4, '#', '', '', '1', '0', 'F', '0', '0', 'product:goods:remove', '#', 'admin', NOW(), '', NULL, '');
"@

Write-Host "Step 7: Adding Order Management menu..." -ForegroundColor Yellow

Execute-SQL @"
USE \`meimei-prisma\`;
INSERT INTO sys_menu (menuName, parentId, orderNum, path, component, query, isFrame, isCache, menuType, visible, status, perms, icon, createBy, createTime, updateBy, updateTime, remark)
VALUES ('订单管理', $productMenuId, 3, 'order', 'product/order/index', '', '1', '0', 'C', '0', '0', 'product:order:list', 'list', 'admin', NOW(), '', NULL, '订单管理菜单');
"@

$orderMenuId = & $mysqlPath -h $mysqlHost -P $mysqlPort -u $mysqlUser -p$mysqlPassword $mysqlDatabase --default-character-set=utf8mb4 -N -e "SELECT menuId FROM sys_menu WHERE menuName='订单管理' AND parentId=$productMenuId ORDER BY menuId DESC LIMIT 1;" 2>&1 | Select-Object -Last 1

Write-Host "Order Menu ID: $orderMenuId" -ForegroundColor Green

Write-Host "Step 8: Adding Order Management permissions..." -ForegroundColor Yellow

Execute-SQL @"
USE \`meimei-prisma\`;
INSERT INTO sys_menu (menuName, parentId, orderNum, path, component, query, isFrame, isCache, menuType, visible, status, perms, icon, createBy, createTime, updateBy, updateTime, remark)
VALUES
('订单查询', $orderMenuId, 1, '#', '', '', '1', '0', 'F', '0', '0', 'product:order:query', '#', 'admin', NOW(), '', NULL, ''),
('订单详情', $orderMenuId, 2, '#', '', '', '1', '0', 'F', '0', '0', 'product:order:detail', '#', 'admin', NOW(), '', NULL, ''),
('订单发货', $orderMenuId, 3, '#', '', '', '1', '0', 'F', '0', '0', 'product:order:ship', '#', 'admin', NOW(), '', NULL, '');
"@

Write-Host "Step 9: Assigning menus to admin role..." -ForegroundColor Yellow

Execute-SQL @"
USE \`meimei-prisma\`;
DELETE FROM SysRoleMenu WHERE menuId IN (
  SELECT menuId FROM sys_menu WHERE perms LIKE 'product:%'
);

INSERT INTO SysRoleMenu (roleId, menuId)
SELECT 1, menuId FROM sys_menu WHERE perms LIKE 'product:%' OR (parentId = 0 AND path = 'product');
"@

Write-Host "`n=== Success! Product Management Menus Added ===`n" -ForegroundColor Green

Write-Host "Verifying menus..." -ForegroundColor Yellow

& $mysqlPath -h $mysqlHost -P $mysqlPort -u $mysqlUser -p$mysqlPassword $mysqlDatabase --default-character-set=utf8mb4 -e "SELECT menuId, menuName, parentId, path, component, perms FROM sys_menu WHERE perms LIKE 'product:%' OR (parentId = 0 AND path = 'product') ORDER BY menuId;" 2>&1 | Where-Object { $_ -notmatch "Warning" }

Write-Host "`nNext Steps:" -ForegroundColor Cyan
Write-Host "1. Refresh admin panel: http://localhost:80" -ForegroundColor White
Write-Host "2. Logout and login again" -ForegroundColor White
Write-Host "3. Check left sidebar for 'Product Management' menu" -ForegroundColor White
Write-Host ""

