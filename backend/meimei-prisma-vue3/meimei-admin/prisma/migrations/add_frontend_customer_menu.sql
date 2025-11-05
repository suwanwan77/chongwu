-- 添加前端用户管理菜单
-- 1. 添加一级菜单：前端管理
INSERT INTO `sys_menu` (`menu_name`, `parent_id`, `order_num`, `path`, `component`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`)
VALUES ('前端管理', 0, 5, 'frontend', NULL, 1, 0, 'M', '0', '0', '', 'user', 'admin', NOW(), '', NULL, '前端用户管理目录');

-- 获取刚插入的菜单ID（假设为最新的ID）
SET @parent_menu_id = LAST_INSERT_ID();

-- 2. 添加二级菜单：前端用户
INSERT INTO `sys_menu` (`menu_name`, `parent_id`, `order_num`, `path`, `component`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`)
VALUES ('前端用户', @parent_menu_id, 1, 'customer', 'frontend/customer/index', 1, 0, 'C', '0', '0', 'frontend:customer:list', 'peoples', 'admin', NOW(), '', NULL, '前端用户管理菜单');

-- 获取前端用户菜单ID
SET @customer_menu_id = LAST_INSERT_ID();

-- 3. 添加按钮权限
INSERT INTO `sys_menu` (`menu_name`, `parent_id`, `order_num`, `path`, `component`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`)
VALUES 
('前端用户查询', @customer_menu_id, 1, '#', '', 1, 0, 'F', '0', '0', 'frontend:customer:query', '#', 'admin', NOW(), '', NULL, ''),
('前端用户详情', @customer_menu_id, 2, '#', '', 1, 0, 'F', '0', '0', 'frontend:customer:detail', '#', 'admin', NOW(), '', NULL, ''),
('前端用户状态修改', @customer_menu_id, 3, '#', '', 1, 0, 'F', '0', '0', 'frontend:customer:edit', '#', 'admin', NOW(), '', NULL, ''),
('前端用户删除', @customer_menu_id, 4, '#', '', 1, 0, 'F', '0', '0', 'frontend:customer:remove', '#', 'admin', NOW(), '', NULL, '');

