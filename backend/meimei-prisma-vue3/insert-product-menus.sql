-- Insert product management menus with correct UTF-8 encoding
-- Database: meimei-prisma

USE `meimei-prisma`;

-- Step 1: Insert parent menu (Product Management)
INSERT INTO sys_menu (menuName, parentId, orderNum, path, component, query, isFrame, isCache, menuType, visible, status, perms, icon, createBy, createTime) 
VALUES ('商品管理', NULL, 4, 'product', NULL, '', '1', '0', 'M', '0', '0', '', 'shopping', 'admin', NOW());

SET @product_menu_id = LAST_INSERT_ID();

-- Step 2: Insert category menu
INSERT INTO sys_menu (menuName, parentId, orderNum, path, component, query, isFrame, isCache, menuType, visible, status, perms, icon, createBy, createTime) 
VALUES ('商品分类', @product_menu_id, 1, 'category', 'product/category/index', '', '1', '0', 'C', '0', '0', 'product:category:list', 'tree', 'admin', NOW());

SET @category_menu_id = LAST_INSERT_ID();

-- Step 3: Insert category permissions
INSERT INTO sys_menu (menuName, parentId, orderNum, path, component, query, isFrame, isCache, menuType, visible, status, perms, icon, createBy, createTime) 
VALUES 
('商品分类查询', @category_menu_id, 1, '#', '', '', '1', '0', 'F', '0', '0', 'product:category:query', '#', 'admin', NOW()),
('商品分类新增', @category_menu_id, 2, '#', '', '', '1', '0', 'F', '0', '0', 'product:category:add', '#', 'admin', NOW()),
('商品分类修改', @category_menu_id, 3, '#', '', '', '1', '0', 'F', '0', '0', 'product:category:edit', '#', 'admin', NOW()),
('商品分类删除', @category_menu_id, 4, '#', '', '', '1', '0', 'F', '0', '0', 'product:category:remove', '#', 'admin', NOW());

-- Step 4: Insert goods menu
INSERT INTO sys_menu (menuName, parentId, orderNum, path, component, query, isFrame, isCache, menuType, visible, status, perms, icon, createBy, createTime) 
VALUES ('商品列表', @product_menu_id, 2, 'goods', 'product/goods/index', '', '1', '0', 'C', '0', '0', 'product:goods:list', 'goods', 'admin', NOW());

SET @goods_menu_id = LAST_INSERT_ID();

-- Step 5: Insert goods permissions
INSERT INTO sys_menu (menuName, parentId, orderNum, path, component, query, isFrame, isCache, menuType, visible, status, perms, icon, createBy, createTime) 
VALUES 
('商品查询', @goods_menu_id, 1, '#', '', '', '1', '0', 'F', '0', '0', 'product:goods:query', '#', 'admin', NOW()),
('商品新增', @goods_menu_id, 2, '#', '', '', '1', '0', 'F', '0', '0', 'product:goods:add', '#', 'admin', NOW()),
('商品修改', @goods_menu_id, 3, '#', '', '', '1', '0', 'F', '0', '0', 'product:goods:edit', '#', 'admin', NOW()),
('商品删除', @goods_menu_id, 4, '#', '', '', '1', '0', 'F', '0', '0', 'product:goods:remove', '#', 'admin', NOW());

-- Step 6: Insert order menu
INSERT INTO sys_menu (menuName, parentId, orderNum, path, component, query, isFrame, isCache, menuType, visible, status, perms, icon, createBy, createTime) 
VALUES ('订单管理', @product_menu_id, 3, 'order', 'product/order/index', '', '1', '0', 'C', '0', '0', 'product:order:list', 'list', 'admin', NOW());

SET @order_menu_id = LAST_INSERT_ID();

-- Step 7: Insert order permissions
INSERT INTO sys_menu (menuName, parentId, orderNum, path, component, query, isFrame, isCache, menuType, visible, status, perms, icon, createBy, createTime) 
VALUES 
('订单查询', @order_menu_id, 1, '#', '', '', '1', '0', 'F', '0', '0', 'product:order:query', '#', 'admin', NOW()),
('订单详情', @order_menu_id, 2, '#', '', '', '1', '0', 'F', '0', '0', 'product:order:detail', '#', 'admin', NOW()),
('订单发货', @order_menu_id, 3, '#', '', '', '1', '0', 'F', '0', '0', 'product:order:ship', '#', 'admin', NOW());

-- Step 8: Assign menus to admin role
INSERT INTO _sys_menu_to_sys_role (A, B) 
SELECT menuId, 1 FROM sys_menu WHERE perms LIKE 'product:%' OR (parentId IS NULL AND path = 'product');

-- Verify
SELECT menuId, menuName, parentId, path, perms 
FROM sys_menu 
WHERE perms LIKE 'product:%' OR (parentId IS NULL AND path = 'product') 
ORDER BY menuId;

