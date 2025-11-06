@echo off
chcp 65001 >nul
title 猫砂系统 - 一键启动所有服务

echo ========================================
echo    猫砂管理系统 - 一键启动脚本
echo ========================================
echo.

:: 设置项目根目录
set "PROJECT_ROOT=%~dp0"
cd /d "%PROJECT_ROOT%"

echo [1/6] 检查MySQL数据库服务...
echo ----------------------------------------

:: 检查MySQL服务是否运行
sc query MySQL84 | find "RUNNING" >nul
if %errorlevel% equ 0 (
    echo ✓ MySQL数据库服务已运行
) else (
    echo × MySQL数据库服务未运行
    echo 正在尝试启动MySQL服务...
    net start MySQL84 >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✓ MySQL服务启动成功
    ) else (
        echo ! 无法启动MySQL服务，请手动启动或以管理员身份运行此脚本
    )
)
echo.

echo [2/6] 检查Redis服务...
echo ----------------------------------------
tasklist /FI "IMAGENAME eq redis-server.exe" 2>NUL | find /I /N "redis-server.exe">NUL
if %errorlevel% equ 0 (
    echo ✓ Redis服务已运行
) else (
    echo ! Redis服务未运行，后端API可能无法正常工作
    echo   请手动启动Redis服务
)
echo.

echo [3/6] 测试数据库连接...
echo ----------------------------------------
"C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe" -h 127.0.0.1 -P 3306 -u maosha -p123456 meimei-prisma -e "SELECT 'Database Connected Successfully!' as Status;" 2>nul
if %errorlevel% equ 0 (
    echo ✓ 数据库连接成功
) else (
    echo × 数据库连接失败，请检查：
    echo   - MySQL服务是否运行
    echo   - 数据库 meimei-prisma 是否存在
    echo   - 用户名密码是否正确 (maosha/123456)
)
echo.

echo [4/6] 启动后端API服务 (端口3000)...
echo ----------------------------------------
start "后端API服务 - NestJS" cmd /k "cd /d %PROJECT_ROOT%backend\meimei-prisma-vue3\meimei-admin && echo 正在启动后端API服务... && npm run start:dev"
echo ✓ 后端API服务启动中...
echo   访问地址: http://localhost:3000
echo.

:: 等待后端服务启动
echo 等待后端服务启动 (预计15秒)...
timeout /t 15 /nobreak >nul

echo [5/6] 启动后台管理界面 (端口80)...
echo ----------------------------------------
start "后台管理界面 - Vue3" cmd /k "cd /d %PROJECT_ROOT%backend\meimei-prisma-vue3\meimei-ui-vue3 && echo 正在启动后台管理界面... && npm run dev"
echo ✓ 后台管理界面启动中...
echo   访问地址: http://localhost:80
echo.

:: 等待Vue服务启动
echo 等待后台管理界面启动 (预计10秒)...
timeout /t 10 /nobreak >nul

echo [6/6] 启动前端网站 (端口8080)...
echo ----------------------------------------
start "前端网站 - 猫砂商城" cmd /k "cd /d %PROJECT_ROOT% && echo 正在启动前端网站... && node server.js"
echo ✓ 前端网站启动中...
echo   访问地址: http://localhost:8080
echo.

:: 等待前端服务启动
echo 等待前端网站启动 (预计5秒)...
timeout /t 5 /nobreak >nul

echo ========================================
echo    所有服务启动完成！
echo ========================================
echo.
echo 📊 服务列表：
echo ----------------------------------------
echo  🌐 前端网站:      http://localhost:8080
echo  🎛️  后台管理:      http://localhost:80
echo  🔌 后端API:       http://localhost:3000
echo  🗄️  MySQL数据库:   127.0.0.1:3306
echo ----------------------------------------
echo.
echo 🔐 后台管理系统登录信息：
echo ----------------------------------------
echo  用户名: admin
echo  密码:   admin123
echo ----------------------------------------
echo.
echo 💡 提示：
echo  - 所有服务已在新窗口中启动
echo  - 关闭对应窗口即可停止服务
echo  - 按任意键将自动打开所有页面
echo.

pause

echo.
echo 正在打开浏览器页面...
echo.

:: 打开前端网站
start http://localhost:8080
timeout /t 2 /nobreak >nul

:: 打开后台管理
start http://localhost:80
timeout /t 2 /nobreak >nul

:: 打开后端API
start http://localhost:3000
timeout /t 1 /nobreak >nul

echo.
echo ✓ 所有页面已在浏览器中打开！
echo.
echo 按任意键退出启动脚本...
pause >nul

