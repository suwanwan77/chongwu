@echo off
chcp 65001 >nul
echo ========================================
echo 数据库配置脚本
echo ========================================
echo.

echo 步骤1: 创建数据库
echo 请手动执行以下SQL命令（在MySQL客户端或Navicat等工具中）：
echo.
echo CREATE DATABASE IF NOT EXISTS `meimei-prisma` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
echo.
echo 步骤2: 导入数据
echo 请在MySQL客户端中执行：
echo USE `meimei-prisma`;
echo SOURCE D:/code/chongwu103102/chongwu/backend/meimei-prisma-vue3/meimei-admin/meimei-prisma.sql;
echo.
echo 或者使用以下命令（如果mysql在PATH中）：
echo mysql -u root -p meimei-prisma ^< meimei-prisma.sql
echo.
echo ========================================
echo 数据库配置信息：
echo ========================================
echo 数据库名称: meimei-prisma
echo 用户名: root
echo 密码: 123456
echo 主机: 127.0.0.1
echo 端口: 3306
echo ========================================
echo.
echo 配置完成后，请重启后端服务：npm run dev
echo.
pause

