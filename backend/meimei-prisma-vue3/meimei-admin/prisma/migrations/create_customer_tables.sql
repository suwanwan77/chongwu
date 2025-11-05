-- ============================================
-- 猫砂网站前端用户系统数据库表
-- 创建日期: 2025-11-04
-- 说明: 创建customer、customer_login_log、password_reset_token三张表
-- ============================================

-- 1. 前端用户表
CREATE TABLE IF NOT EXISTS `customer` (
  `customerId` INT NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `userName` VARCHAR(50) NOT NULL COMMENT '用户名',
  `nickName` VARCHAR(50) NOT NULL COMMENT '昵称',
  `email` VARCHAR(100) NOT NULL COMMENT '邮箱',
  `phonenumber` VARCHAR(20) DEFAULT NULL COMMENT '手机号',
  `password` VARCHAR(100) NOT NULL COMMENT '密码（bcrypt加密）',
  `avatar` VARCHAR(200) DEFAULT '' COMMENT '头像URL',
  `sex` CHAR(1) DEFAULT '0' COMMENT '性别：0-未知，1-男，2-女',
  `status` CHAR(1) DEFAULT '0' COMMENT '状态：0-正常，1-禁用',
  `delFlag` CHAR(1) DEFAULT '0' COMMENT '删除标志：0-未删除，1-已删除',
  `loginIp` VARCHAR(128) DEFAULT '' COMMENT '最后登录IP',
  `loginDate` DATETIME DEFAULT NULL COMMENT '最后登录时间',
  `createTime` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updateTime` DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`customerId`),
  UNIQUE KEY `customer_userName_key` (`userName`),
  UNIQUE KEY `customer_email_key` (`email`),
  KEY `idx_customer_status` (`status`),
  KEY `idx_customer_createTime` (`createTime`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='前端用户表';

-- 2. 前端用户登录日志表
CREATE TABLE IF NOT EXISTS `customer_login_log` (
  `logId` INT NOT NULL AUTO_INCREMENT COMMENT '日志ID',
  `customerId` INT DEFAULT NULL COMMENT '用户ID',
  `userName` VARCHAR(50) DEFAULT '' COMMENT '用户名',
  `ipaddr` VARCHAR(128) DEFAULT '' COMMENT '登录IP',
  `loginLocation` VARCHAR(255) DEFAULT '' COMMENT '登录地点',
  `browser` VARCHAR(50) DEFAULT '' COMMENT '浏览器',
  `os` VARCHAR(50) DEFAULT '' COMMENT '操作系统',
  `status` CHAR(1) DEFAULT '0' COMMENT '登录状态：0-成功，1-失败',
  `msg` VARCHAR(255) DEFAULT '' COMMENT '提示消息',
  `loginTime` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '登录时间',
  PRIMARY KEY (`logId`),
  KEY `idx_customer_login_log_customerId` (`customerId`),
  KEY `idx_customer_login_log_loginTime` (`loginTime`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='前端用户登录日志';

-- 3. 密码重置令牌表
CREATE TABLE IF NOT EXISTS `password_reset_token` (
  `tokenId` INT NOT NULL AUTO_INCREMENT COMMENT '令牌ID',
  `customerId` INT NOT NULL COMMENT '用户ID',
  `email` VARCHAR(100) NOT NULL COMMENT '邮箱',
  `token` VARCHAR(100) NOT NULL COMMENT '重置令牌',
  `expiresAt` DATETIME NOT NULL COMMENT '过期时间',
  `used` TINYINT DEFAULT 0 COMMENT '是否已使用：0-未使用，1-已使用',
  `createTime` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`tokenId`),
  UNIQUE KEY `password_reset_token_token_key` (`token`),
  KEY `idx_password_reset_token_customerId` (`customerId`),
  KEY `idx_password_reset_token_expiresAt` (`expiresAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='密码重置令牌表';

-- 插入测试数据（可选）
-- 密码: 123456 (bcrypt加密后)
INSERT INTO `customer` (`userName`, `nickName`, `email`, `password`, `sex`, `status`) VALUES
('testuser', '测试用户', 'test@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '0', '0');

SELECT '✅ 数据库表创建成功！' AS message;

