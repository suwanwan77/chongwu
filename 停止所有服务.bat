@echo off
chcp 65001 >nul
title 猫砂系统 - 停止所有服务

echo ========================================
echo    猫砂管理系统 - 停止所有服务
echo ========================================
echo.

echo 正在停止所有服务...
echo.

:: 停止Node.js进程 (前端网站和后端API)
echo [1/3] 停止Node.js服务...
taskkill /F /IM node.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Node.js服务已停止
) else (
    echo ! 没有运行中的Node.js服务
)
echo.

:: 停止npm进程
echo [2/3] 停止npm进程...
taskkill /F /IM npm.cmd >nul 2>&1
taskkill /F /IM npm >nul 2>&1
echo ✓ npm进程已清理
echo.

:: 关闭相关的cmd窗口
echo [3/3] 关闭服务窗口...
taskkill /FI "WINDOWTITLE eq 后端API服务*" >nul 2>&1
taskkill /FI "WINDOWTITLE eq 后台管理界面*" >nul 2>&1
taskkill /FI "WINDOWTITLE eq 前端网站*" >nul 2>&1
echo ✓ 服务窗口已关闭
echo.

echo ========================================
echo    所有服务已停止！
echo ========================================
echo.
echo 💡 提示：
echo  - MySQL和Redis服务未停止（需要手动停止）
echo  - 如需重新启动，请运行 "启动所有服务.bat"
echo.

pause

