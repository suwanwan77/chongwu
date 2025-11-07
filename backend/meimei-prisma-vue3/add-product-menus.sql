-- =====================================================
-- 添加商品管理菜单到后台管理系统
-- 数据库：meimei-prisma
-- 执行此SQL脚本将在sys_menu表中添加商品管理相关的菜单项
-- =====================================================

-- 使用数据库
USE `meimei-prisma`;

-- 1. 添加商品管理一级菜单（目录）
INSERT INTO `sys_menu` (`menu_name`, `parent_id`, `order_num`, `path`, `component`, `query`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`)
VALUES
('商品管理', 0, 4, 'product', NULL, '', '1', '0', 'M', '0', '0', '', 'shopping', 'admin', NOW(), '', NULL, '商品管理目录');

-- 获取刚插入的商品管理菜单ID
SET @product_menu_id = LAST_INSERT_ID();

-- 2. 添加商品分类管理菜单
INSERT INTO `sys_menu` (`menu_name`, `parent_id`, `order_num`, `path`, `component`, `query`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`)
VALUES
('商品分类', @product_menu_id, 1, 'category', 'product/category/index', '', '1', '0', 'C', '0', '0', 'product:category:list', 'tree', 'admin', NOW(), '', NULL, '商品分类菜单');

-- 获取商品分类菜单ID
SET @category_menu_id = LAST_INSERT_ID();

-- 3. 添加商品分类管理按钮权限
INSERT INTO `sys_menu` (`menu_name`, `parent_id`, `order_num`, `path`, `component`, `query`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`)
VALUES
('商品分类查询', @category_menu_id, 1, '#', '', '', '1', '0', 'F', '0', '0', 'product:category:query', '#', 'admin', NOW(), '', NULL, ''),
('商品分类新增', @category_menu_id, 2, '#', '', '', '1', '0', 'F', '0', '0', 'product:category:add', '#', 'admin', NOW(), '', NULL, ''),
('商品分类修改', @category_menu_id, 3, '#', '', '', '1', '0', 'F', '0', '0', 'product:category:edit', '#', 'admin', NOW(), '', NULL, ''),
('商品分类删除', @category_menu_id, 4, '#', '', '', '1', '0', 'F', '0', '0', 'product:category:remove', '#', 'admin', NOW(), '', NULL, '');

-- 4. 添加商品管理菜单
INSERT INTO `sys_menu` (`menu_name`, `parent_id`, `order_num`, `path`, `component`, `query`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`)
VALUES
('商品列表', @product_menu_id, 2, 'goods', 'product/goods/index', '', '1', '0', 'C', '0', '0', 'product:goods:list', 'goods', 'admin', NOW(), '', NULL, '商品管理菜单');

-- 获取商品列表菜单ID
SET @goods_menu_id = LAST_INSERT_ID();

-- 5. 添加商品管理按钮权限
INSERT INTO `sys_menu` (`menu_name`, `parent_id`, `order_num`, `path`, `component`, `query`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`)
VALUES
('商品查询', @goods_menu_id, 1, '#', '', '', '1', '0', 'F', '0', '0', 'product:goods:query', '#', 'admin', NOW(), '', NULL, ''),
('商品新增', @goods_menu_id, 2, '#', '', '', '1', '0', 'F', '0', '0', 'product:goods:add', '#', 'admin', NOW(), '', NULL, ''),
('商品修改', @goods_menu_id, 3, '#', '', '', '1', '0', 'F', '0', '0', 'product:goods:edit', '#', 'admin', NOW(), '', NULL, ''),
('商品删除', @goods_menu_id, 4, '#', '', '', '1', '0', 'F', '0', '0', 'product:goods:remove', '#', 'admin', NOW(), '', NULL, '');

-- 6. 添加订单管理菜单
INSERT INTO `sys_menu` (`menu_name`, `parent_id`, `order_num`, `path`, `component`, `query`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`)
VALUES
('订单管理', @product_menu_id, 3, 'order', 'product/order/index', '', '1', '0', 'C', '0', '0', 'product:order:list', 'list', 'admin', NOW(), '', NULL, '订单管理菜单');

-- 获取订单管理菜单ID
SET @order_menu_id = LAST_INSERT_ID();

-- 7. 添加订单管理按钮权限
INSERT INTO `sys_menu` (`menu_name`, `parent_id`, `order_num`, `path`, `component`, `query`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`)
VALUES
('订单查询', @order_menu_id, 1, '#', '', '', '1', '0', 'F', '0', '0', 'product:order:query', '#', 'admin', NOW(), '', NULL, ''),
('订单详情', @order_menu_id, 2, '#', '', '', '1', '0', 'F', '0', '0', 'product:order:detail', '#', 'admin', NOW(), '', NULL, ''),
('订单发货', @order_menu_id, 3, '#', '', '', '1', '0', 'F', '0', '0', 'product:order:ship', '#', 'admin', NOW(), '', NULL, '');

-- 8. 给超级管理员角色（roleId=1）分配所有商品管理菜单权限
-- 先删除可能存在的旧数据（避免重复执行脚本时出错）
DELETE FROM `sys_role_menu` WHERE `menu_id` IN (
  SELECT `menu_id` FROM `sys_menu` WHERE `perms` LIKE 'product:%'
);

-- 插入角色菜单关联
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`)
SELECT 1, `menu_id` FROM `sys_menu` WHERE `perms` LIKE 'product:%' OR (`parent_id` = 0 AND `path` = 'product');

-- 9. 显示插入结果
SELECT '商品管理菜单添加成功！' AS message;
SELECT `menu_id`, `menu_name`, `parent_id`, `path`, `component`, `perms`
FROM `sys_menu`
WHERE `perms` LIKE 'product:%' OR (`parent_id` = 0 AND `path` = 'product')
ORDER BY `menu_id`;

-- =====================================================
-- 执行说明：
-- 1. 此脚本会自动获取插入后的menu_id，无需手动调整
-- 2. 会自动给超级管理员角色（roleId=1）分配所有商品管理菜单权限
-- 3. 执行完成后，刷新后台管理系统页面即可看到商品管理菜单
-- 4. 如果需要给其他角色分配权限，请在后台管理系统的"角色管理"中操作
-- =====================================================

