// Node.js script to insert product management menus with correct UTF-8 encoding
const mysql = require('mysql2/promise');

async function insertMenus() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'maosha',
    password: '123456',
    database: 'meimei-prisma',
    charset: 'utf8mb4'
  });

  try {
    console.log('Connected to database');

    // Step 1: Insert parent menu
    console.log('\nStep 1: Inserting parent menu...');
    const [result1] = await connection.execute(
      `INSERT INTO sys_menu (menuName, parentId, orderNum, path, component, query, isFrame, isCache, menuType, visible, status, perms, icon, createBy, createTime) 
       VALUES (?, NULL, 4, 'product', NULL, '', '1', '0', 'M', '0', '0', '', 'shopping', 'admin', NOW())`,
      ['商品管理']
    );
    const productMenuId = result1.insertId;
    console.log(`Product Menu ID: ${productMenuId}`);

    // Step 2: Insert category menu
    console.log('\nStep 2: Inserting category menu...');
    const [result2] = await connection.execute(
      `INSERT INTO sys_menu (menuName, parentId, orderNum, path, component, query, isFrame, isCache, menuType, visible, status, perms, icon, createBy, createTime) 
       VALUES (?, ?, 1, 'category', 'product/category/index', '', '1', '0', 'C', '0', '0', 'product:category:list', 'tree', 'admin', NOW())`,
      ['商品分类', productMenuId]
    );
    const categoryMenuId = result2.insertId;
    console.log(`Category Menu ID: ${categoryMenuId}`);

    // Step 3: Insert category permissions
    console.log('\nStep 3: Inserting category permissions...');
    await connection.execute(
      `INSERT INTO sys_menu (menuName, parentId, orderNum, path, component, query, isFrame, isCache, menuType, visible, status, perms, icon, createBy, createTime) 
       VALUES 
       (?, ?, 1, '#', '', '', '1', '0', 'F', '0', '0', 'product:category:query', '#', 'admin', NOW()),
       (?, ?, 2, '#', '', '', '1', '0', 'F', '0', '0', 'product:category:add', '#', 'admin', NOW()),
       (?, ?, 3, '#', '', '', '1', '0', 'F', '0', '0', 'product:category:edit', '#', 'admin', NOW()),
       (?, ?, 4, '#', '', '', '1', '0', 'F', '0', '0', 'product:category:remove', '#', 'admin', NOW())`,
      ['商品分类查询', categoryMenuId, '商品分类新增', categoryMenuId, '商品分类修改', categoryMenuId, '商品分类删除', categoryMenuId]
    );
    console.log('Category permissions inserted');

    // Step 4: Insert goods menu
    console.log('\nStep 4: Inserting goods menu...');
    const [result4] = await connection.execute(
      `INSERT INTO sys_menu (menuName, parentId, orderNum, path, component, query, isFrame, isCache, menuType, visible, status, perms, icon, createBy, createTime) 
       VALUES (?, ?, 2, 'goods', 'product/goods/index', '', '1', '0', 'C', '0', '0', 'product:goods:list', 'goods', 'admin', NOW())`,
      ['商品列表', productMenuId]
    );
    const goodsMenuId = result4.insertId;
    console.log(`Goods Menu ID: ${goodsMenuId}`);

    // Step 5: Insert goods permissions
    console.log('\nStep 5: Inserting goods permissions...');
    await connection.execute(
      `INSERT INTO sys_menu (menuName, parentId, orderNum, path, component, query, isFrame, isCache, menuType, visible, status, perms, icon, createBy, createTime) 
       VALUES 
       (?, ?, 1, '#', '', '', '1', '0', 'F', '0', '0', 'product:goods:query', '#', 'admin', NOW()),
       (?, ?, 2, '#', '', '', '1', '0', 'F', '0', '0', 'product:goods:add', '#', 'admin', NOW()),
       (?, ?, 3, '#', '', '', '1', '0', 'F', '0', '0', 'product:goods:edit', '#', 'admin', NOW()),
       (?, ?, 4, '#', '', '', '1', '0', 'F', '0', '0', 'product:goods:remove', '#', 'admin', NOW())`,
      ['商品查询', goodsMenuId, '商品新增', goodsMenuId, '商品修改', goodsMenuId, '商品删除', goodsMenuId]
    );
    console.log('Goods permissions inserted');

    // Step 6: Insert order menu
    console.log('\nStep 6: Inserting order menu...');
    const [result6] = await connection.execute(
      `INSERT INTO sys_menu (menuName, parentId, orderNum, path, component, query, isFrame, isCache, menuType, visible, status, perms, icon, createBy, createTime) 
       VALUES (?, ?, 3, 'order', 'product/order/index', '', '1', '0', 'C', '0', '0', 'product:order:list', 'list', 'admin', NOW())`,
      ['订单管理', productMenuId]
    );
    const orderMenuId = result6.insertId;
    console.log(`Order Menu ID: ${orderMenuId}`);

    // Step 7: Insert order permissions
    console.log('\nStep 7: Inserting order permissions...');
    await connection.execute(
      `INSERT INTO sys_menu (menuName, parentId, orderNum, path, component, query, isFrame, isCache, menuType, visible, status, perms, icon, createBy, createTime) 
       VALUES 
       (?, ?, 1, '#', '', '', '1', '0', 'F', '0', '0', 'product:order:query', '#', 'admin', NOW()),
       (?, ?, 2, '#', '', '', '1', '0', 'F', '0', '0', 'product:order:detail', '#', 'admin', NOW()),
       (?, ?, 3, '#', '', '', '1', '0', 'F', '0', '0', 'product:order:ship', '#', 'admin', NOW())`,
      ['订单查询', orderMenuId, '订单详情', orderMenuId, '订单发货', orderMenuId]
    );
    console.log('Order permissions inserted');

    // Step 8: Assign menus to admin role
    console.log('\nStep 8: Assigning menus to admin role...');
    await connection.execute(
      `INSERT INTO _sys_menu_to_sys_role (A, B) 
       SELECT menuId, 1 FROM sys_menu WHERE perms LIKE 'product:%' OR (parentId IS NULL AND path = 'product')`
    );
    console.log('Menus assigned to admin role');

    // Verify
    console.log('\n=== Verification ===');
    const [rows] = await connection.execute(
      `SELECT menuId, menuName, parentId, path, perms 
       FROM sys_menu 
       WHERE perms LIKE 'product:%' OR (parentId IS NULL AND path = 'product') 
       ORDER BY menuId`
    );
    
    console.log('\nInserted menus:');
    console.table(rows);

    console.log('\n✅ Success! All menus inserted correctly.');
    console.log('\nNext steps:');
    console.log('1. Refresh admin panel: http://localhost:80');
    console.log('2. Logout and login again');
    console.log('3. Check left sidebar for Product Management menu');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

insertMenus();

