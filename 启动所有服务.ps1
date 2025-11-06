# 猫砂管理系统 - 一键启动脚本 (PowerShell版本)
# 编码: UTF-8

# 设置控制台编码
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$Host.UI.RawUI.WindowTitle = "猫砂系统 - 一键启动所有服务"

# 颜色输出函数
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Write-Success {
    param([string]$Message)
    Write-ColorOutput "✓ $Message" "Green"
}

function Write-Error {
    param([string]$Message)
    Write-ColorOutput "× $Message" "Red"
}

function Write-Warning {
    param([string]$Message)
    Write-ColorOutput "! $Message" "Yellow"
}

function Write-Info {
    param([string]$Message)
    Write-ColorOutput "ℹ $Message" "Cyan"
}

# 清屏
Clear-Host

Write-ColorOutput "========================================" "Cyan"
Write-ColorOutput "   猫砂管理系统 - 一键启动脚本" "Cyan"
Write-ColorOutput "========================================" "Cyan"
Write-Host ""

# 获取项目根目录
$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ProjectRoot

# 1. 检查MySQL服务
Write-ColorOutput "[1/6] 检查MySQL数据库服务..." "Yellow"
Write-ColorOutput "----------------------------------------" "Gray"

try {
    $mysqlService = Get-Service -Name "MySQL84" -ErrorAction SilentlyContinue
    if ($mysqlService -and $mysqlService.Status -eq "Running") {
        Write-Success "MySQL数据库服务已运行"
    } elseif ($mysqlService) {
        Write-Warning "MySQL服务已安装但未运行，正在尝试启动..."
        Start-Service -Name "MySQL84" -ErrorAction Stop
        Write-Success "MySQL服务启动成功"
    } else {
        Write-Error "未找到MySQL84服务"
    }
} catch {
    Write-Error "无法启动MySQL服务: $($_.Exception.Message)"
}
Write-Host ""

# 2. 检查Redis服务
Write-ColorOutput "[2/6] 检查Redis服务..." "Yellow"
Write-ColorOutput "----------------------------------------" "Gray"

$redisProcess = Get-Process -Name "redis-server" -ErrorAction SilentlyContinue
if ($redisProcess) {
    Write-Success "Redis服务已运行 (PID: $($redisProcess.Id))"
} else {
    Write-Warning "Redis服务未运行，后端API可能无法正常工作"
    Write-Info "请手动启动Redis服务"
}
Write-Host ""

# 3. 测试数据库连接
Write-ColorOutput "[3/6] 测试数据库连接..." "Yellow"
Write-ColorOutput "----------------------------------------" "Gray"

$mysqlPath = "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe"
if (Test-Path $mysqlPath) {
    try {
        $result = & $mysqlPath -h 127.0.0.1 -P 3306 -u maosha -p123456 meimei-prisma -e "SELECT 'Connected' as Status;" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Success "数据库连接成功"
            Write-Info "数据库: meimei-prisma | 用户: maosha"
        } else {
            Write-Error "数据库连接失败"
        }
    } catch {
        Write-Error "数据库连接测试失败: $($_.Exception.Message)"
    }
} else {
    Write-Warning "未找到MySQL客户端: $mysqlPath"
}
Write-Host ""

# 4. 启动后端API服务
Write-ColorOutput "[4/6] 启动后端API服务 (端口3000)..." "Yellow"
Write-ColorOutput "----------------------------------------" "Gray"

$backendPath = Join-Path $ProjectRoot "backend\meimei-prisma-vue3\meimei-admin"
if (Test-Path $backendPath) {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host '正在启动后端API服务...' -ForegroundColor Cyan; npm run start:dev"
    Write-Success "后端API服务启动中..."
    Write-Info "访问地址: http://localhost:3000"
} else {
    Write-Error "后端目录不存在: $backendPath"
}
Write-Host ""

# 等待后端服务启动
Write-Info "等待后端服务启动 (预计15秒)..."
Start-Sleep -Seconds 15

# 5. 启动后台管理界面
Write-ColorOutput "[5/6] 启动后台管理界面 (端口80)..." "Yellow"
Write-ColorOutput "----------------------------------------" "Gray"

$adminPath = Join-Path $ProjectRoot "backend\meimei-prisma-vue3\meimei-ui-vue3"
if (Test-Path $adminPath) {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$adminPath'; Write-Host '正在启动后台管理界面...' -ForegroundColor Cyan; npm run dev"
    Write-Success "后台管理界面启动中..."
    Write-Info "访问地址: http://localhost:80"
} else {
    Write-Error "后台管理目录不存在: $adminPath"
}
Write-Host ""

# 等待Vue服务启动
Write-Info "等待后台管理界面启动 (预计10秒)..."
Start-Sleep -Seconds 10

# 6. 启动前端网站
Write-ColorOutput "[6/6] 启动前端网站 (端口8080)..." "Yellow"
Write-ColorOutput "----------------------------------------" "Gray"

$serverPath = Join-Path $ProjectRoot "server.js"
if (Test-Path $serverPath) {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ProjectRoot'; Write-Host '正在启动前端网站...' -ForegroundColor Cyan; node server.js"
    Write-Success "前端网站启动中..."
    Write-Info "访问地址: http://localhost:8080"
} else {
    Write-Error "前端服务文件不存在: $serverPath"
}
Write-Host ""

# 等待前端服务启动
Write-Info "等待前端网站启动 (预计5秒)..."
Start-Sleep -Seconds 5

# 显示服务列表
Write-Host ""
Write-ColorOutput "========================================" "Green"
Write-ColorOutput "   所有服务启动完成！" "Green"
Write-ColorOutput "========================================" "Green"
Write-Host ""

Write-ColorOutput "📊 服务列表：" "Cyan"
Write-ColorOutput "----------------------------------------" "Gray"
Write-Host "  🌐 前端网站:      " -NoNewline
Write-ColorOutput "http://localhost:8080" "Yellow"
Write-Host "  🎛️  后台管理:      " -NoNewline
Write-ColorOutput "http://localhost:80" "Yellow"
Write-Host "  🔌 后端API:       " -NoNewline
Write-ColorOutput "http://localhost:3000" "Yellow"
Write-Host "  🗄️  MySQL数据库:   " -NoNewline
Write-ColorOutput "127.0.0.1:3306" "Yellow"
Write-ColorOutput "----------------------------------------" "Gray"
Write-Host ""

Write-ColorOutput "🔐 后台管理系统登录信息：" "Cyan"
Write-ColorOutput "----------------------------------------" "Gray"
Write-Host "  用户名: " -NoNewline
Write-ColorOutput "admin" "Green"
Write-Host "  密码:   " -NoNewline
Write-ColorOutput "admin123" "Green"
Write-ColorOutput "----------------------------------------" "Gray"
Write-Host ""

Write-ColorOutput "💡 提示：" "Cyan"
Write-Info "- 所有服务已在新窗口中启动"
Write-Info "- 关闭对应窗口即可停止服务"
Write-Info "- 按任意键将自动打开所有页面"
Write-Host ""

# 等待用户按键
Write-Host "按任意键继续..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# 打开浏览器页面
Write-Host ""
Write-Info "正在打开浏览器页面..."
Write-Host ""

# 打开前端网站
Start-Process "http://localhost:8080"
Write-Success "已打开前端网站"
Start-Sleep -Seconds 2

# 打开后台管理
Start-Process "http://localhost:80"
Write-Success "已打开后台管理"
Start-Sleep -Seconds 2

# 打开后端API
Start-Process "http://localhost:3000"
Write-Success "已打开后端API"
Start-Sleep -Seconds 1

Write-Host ""
Write-Success "所有页面已在浏览器中打开！"
Write-Host ""
Write-ColorOutput "按任意键退出启动脚本..." "Yellow"
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

