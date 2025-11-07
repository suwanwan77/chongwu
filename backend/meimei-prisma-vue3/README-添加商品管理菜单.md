# 添加商品管理菜单到后台管理系统

## 问题说明

您提到"后台管理页面并没有商品分类管理，商品管理，订单管理"。

实际上，这些页面的Vue组件文件已经存在：
- ✅ `backend/meimei-prisma-vue3/meimei-ui-vue3/src/views/product/category/index.vue` - 商品分类管理页面
- ✅ `backend/meimei-prisma-vue3/meimei-ui-vue3/src/views/product/goods/index.vue` - 商品管理页面
- ✅ `backend/meimei-prisma-vue3/meimei-ui-vue3/src/views/product/order/index.vue` - 订单管理页面

**但是**，这些页面没有在后台管理系统的菜单中显示，因为：
- 该系统使用**动态菜单**，菜单数据存储在数据库的`sys_menu`表中
- 需要在数据库中添加菜单数据，才能在后台管理系统中看到这些页面

## 解决方案

执行`add-product-menus.sql`脚本，将商品管理菜单添加到数据库中。

## 执行步骤

### 方法1：使用MySQL Workbench（推荐）

1. 打开MySQL Workbench
2. 连接到数据库：
   - Host: `localhost`
   - Port: `3306`
   - Username: `maosha`
   - Password: `123456`
   - Database: `meimei-prisma`
3. 打开SQL文件：`File` → `Open SQL Script` → 选择`add-product-menus.sql`
4. 点击⚡图标（Execute）执行脚本
5. 查看执行结果，应该显示"商品管理菜单添加成功！"

### 方法2：使用命令行

如果您的系统中已安装MySQL并添加到PATH，可以使用以下命令：

```bash
# Windows PowerShell
Get-Content add-product-menus.sql | & "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe" -h localhost -P 3306 -u maosha -p123456 meimei-prisma

# 或者使用mysql命令（如果已添加到PATH）
mysql -h localhost -P 3306 -u maosha -p123456 meimei-prisma < add-product-menus.sql
```

### 方法3：复制粘贴SQL语句

1. 打开`add-product-menus.sql`文件
2. 复制所有SQL语句
3. 在MySQL Workbench或其他MySQL客户端中粘贴并执行

## 执行后的效果

执行成功后，您将看到以下菜单结构：

```
商品管理（一级菜单）
├── 商品分类（二级菜单）
│   ├── 商品分类查询（按钮权限）
│   ├── 商品分类新增（按钮权限）
│   ├── 商品分类修改（按钮权限）
│   └── 商品分类删除（按钮权限）
├── 商品列表（二级菜单）
│   ├── 商品查询（按钮权限）
│   ├── 商品新增（按钮权限）
│   ├── 商品修改（按钮权限）
│   └── 商品删除（按钮权限）
└── 订单管理（二级菜单）
    ├── 订单查询（按钮权限）
    ├── 订单详情（按钮权限）
    └── 订单发货（按钮权限）
```

## 验证步骤

1. **刷新后台管理系统页面**
   - 打开浏览器访问：http://localhost:80
   - 按`Ctrl + F5`强制刷新页面

2. **退出登录并重新登录**
   - 点击右上角用户头像
   - 选择"退出登录"
   - 重新登录（用户名：admin，密码：admin123）

3. **查看左侧菜单**
   - 应该可以看到"商品管理"菜单
   - 点击展开，可以看到：
     - 商品分类
     - 商品列表
     - 订单管理

4. **测试功能**
   - 点击"商品分类"，应该可以看到商品分类管理页面
   - 点击"商品列表"，应该可以看到商品管理页面
   - 点击"订单管理"，应该可以看到订单管理页面

## 如果看不到菜单

如果执行SQL后仍然看不到菜单，请尝试以下操作：

1. **清除浏览器缓存**
   - 按`Ctrl + Shift + Delete`
   - 选择"缓存的图片和文件"
   - 点击"清除数据"

2. **检查数据库**
   ```sql
   -- 查询是否成功插入菜单
   SELECT menu_id, menu_name, parent_id, path, component, perms 
   FROM sys_menu 
   WHERE perms LIKE 'product:%' OR (parent_id = 0 AND path = 'product')
   ORDER BY menu_id;
   
   -- 查询角色菜单关联
   SELECT * FROM sys_role_menu WHERE menu_id IN (
     SELECT menu_id FROM sys_menu WHERE perms LIKE 'product:%'
   );
   ```

3. **检查用户权限**
   - 确保当前登录用户是超级管理员（roleId=1）
   - 或者在"系统管理" → "角色管理"中给当前角色分配商品管理菜单权限

4. **重启后端服务**
   - 停止后端API服务（端口3000）
   - 重新启动：`cd backend/meimei-prisma-vue3/meimei-admin && npm run start:dev`

## SQL脚本说明

`add-product-menus.sql`脚本会执行以下操作：

1. 在`sys_menu`表中插入15条菜单记录：
   - 1个一级菜单（商品管理）
   - 3个二级菜单（商品分类、商品列表、订单管理）
   - 11个按钮权限

2. 在`sys_role_menu`表中插入角色菜单关联：
   - 给超级管理员角色（roleId=1）分配所有商品管理菜单权限

3. 使用MySQL变量自动获取插入后的menu_id：
   - 无需手动调整parent_id
   - 可以重复执行（会先删除旧数据）

## 技术说明

### 菜单类型

- **M（目录）**：一级菜单，不对应具体页面，只用于分组
- **C（菜单）**：二级菜单，对应具体的Vue组件页面
- **F（按钮）**：按钮权限，用于控制页面内的操作按钮（新增、修改、删除等）

### 权限标识（perms）

- `product:category:list` - 商品分类列表权限
- `product:category:query` - 商品分类查询权限
- `product:category:add` - 商品分类新增权限
- `product:category:edit` - 商品分类修改权限
- `product:category:remove` - 商品分类删除权限
- `product:goods:*` - 商品管理相关权限
- `product:order:*` - 订单管理相关权限

### 路由配置

- `path`: 路由路径（如：`product/category`）
- `component`: Vue组件路径（如：`product/category/index`）
- 系统会自动将`component`转换为实际的Vue组件导入路径

## 相关文件

- `add-product-menus.sql` - SQL脚本文件
- `backend/meimei-prisma-vue3/meimei-ui-vue3/src/views/product/category/index.vue` - 商品分类页面
- `backend/meimei-prisma-vue3/meimei-ui-vue3/src/views/product/goods/index.vue` - 商品管理页面
- `backend/meimei-prisma-vue3/meimei-ui-vue3/src/views/product/order/index.vue` - 订单管理页面
- `backend/meimei-prisma-vue3/meimei-ui-vue3/src/api/product/category.js` - 商品分类API
- `backend/meimei-prisma-vue3/meimei-ui-vue3/src/api/product/goods.js` - 商品管理API
- `backend/meimei-prisma-vue3/meimei-ui-vue3/src/api/product/order.js` - 订单管理API

## 需要帮助？

如果执行过程中遇到问题，请提供以下信息：

1. 执行SQL脚本时的错误信息
2. 数据库查询结果（上面的两个SELECT语句）
3. 浏览器控制台的错误信息（F12 → Console）
4. 当前登录用户的角色信息

