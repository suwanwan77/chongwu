# 🚀 快速开始指南

## 5分钟快速测试

### 第一步：确认服务运行

检查以下服务是否正在运行：

1. **后端API服务** ✅
   - 地址：http://localhost:3000
   - 检查方法：访问 http://localhost:3000 应该看到 "Hello World!"

2. **前端WordPress服务** ✅
   - 地址：http://localhost:8080
   - 检查方法：访问 http://localhost:8080 应该看到网站首页

3. **MySQL数据库** ✅
   - 地址：127.0.0.1:3306
   - 数据库：meimei-prisma
   - 用户：maosha
   - 密码：123456

4. **Redis服务** ✅
   - 地址：localhost:6379
   - 密码：123456

### 第二步：快速测试（推荐）

#### 方法1：使用测试页面（最简单）

1. 打开测试页面：
   ```
   http://localhost:8080/test-register.html
   ```

2. 点击 **"Register Test User"** 按钮
   - 会自动注册一个测试用户
   - 用户名：testuser
   - 邮箱：test@example.com
   - 密码：123456

3. 点击 **"Login Test User"** 按钮
   - 会自动登录刚才注册的用户

4. 点击 **"Check Login Status"** 按钮
   - 查看当前登录状态

5. 点击 **"Go to Personal Center"** 链接
   - 跳转到个人中心页面
   - 查看用户信息
   - 测试编辑资料
   - 测试修改密码
   - 测试上传头像

#### 方法2：使用实际页面

**注册新用户**：
1. 访问：http://localhost:8080/register/
2. 填写表单：
   - Username: 你的用户名
   - Nickname: 你的昵称
   - Email: 你的邮箱
   - Phone: 你的手机号（可选）
   - Password: 你的密码（至少6位）
   - Confirm Password: 再次输入密码
   - 勾选"I agree to the terms and conditions"
3. 点击"REGISTER"按钮
4. 注册成功后会自动跳转到登录页面

**登录**：
1. 访问：http://localhost:8080/my-account/
2. 输入用户名和密码
3. 可选：勾选"Remember me"（保持30天登录）
4. 点击"LOG IN"按钮
5. 登录成功后会自动跳转到个人中心

**个人中心**：
1. 访问：http://localhost:8080/Personal-Center/
2. 查看你的个人信息
3. 点击"Edit Profile"编辑资料
4. 点击"Change Password"修改密码
5. 点击头像区域上传头像

**找回密码**：
1. 访问：http://localhost:8080/my-account/lost-password/
2. 输入你的邮箱地址
3. 点击"Reset password"按钮
4. 检查邮箱收到的重置链接（如果邮件服务已配置）
5. 或者查看后端控制台输出的重置链接
6. 点击链接，输入新密码
7. 重置成功后跳转到登录页面

### 第三步：使用Postman测试API（可选）

#### 1. 注册用户
```
POST http://localhost:3000/api/frontend/auth/register
Content-Type: application/json

{
  "userName": "testuser2",
  "nickName": "Test User 2",
  "email": "test2@example.com",
  "password": "123456",
  "phonenumber": "13800138001"
}
```

#### 2. 登录
```
POST http://localhost:3000/api/frontend/auth/login
Content-Type: application/json

{
  "username": "testuser2",
  "password": "123456",
  "rememberMe": false
}
```

**响应示例**：
```json
{
  "code": 200,
  "msg": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "customerId": 1,
      "userName": "testuser2",
      "nickName": "Test User 2",
      "email": "test2@example.com",
      ...
    }
  }
}
```

**保存Token**：复制响应中的`token`，后续请求需要使用。

#### 3. 获取用户信息
```
GET http://localhost:3000/api/frontend/auth/profile
Authorization: Bearer YOUR_TOKEN_HERE
```

#### 4. 更新用户信息
```
PUT http://localhost:3000/api/frontend/auth/profile
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "nickName": "New Nickname",
  "email": "newemail@example.com",
  "phonenumber": "13900139000",
  "sex": "1"
}
```

#### 5. 修改密码
```
PUT http://localhost:3000/api/frontend/auth/password
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "oldPassword": "123456",
  "newPassword": "654321",
  "confirmPassword": "654321"
}
```

#### 6. 上传头像
```
POST http://localhost:3000/api/frontend/auth/upload-avatar
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: multipart/form-data

avatar: [选择图片文件]
```

#### 7. 忘记密码
```
POST http://localhost:3000/api/frontend/auth/forgot-password
Content-Type: application/json

{
  "email": "test2@example.com"
}
```

#### 8. 重置密码
```
POST http://localhost:3000/api/frontend/auth/reset-password
Content-Type: application/json

{
  "token": "从邮件或控制台获取的token",
  "email": "test2@example.com",
  "newPassword": "newpass123",
  "confirmPassword": "newpass123"
}
```

#### 9. 退出登录
```
POST http://localhost:3000/api/frontend/auth/logout
Authorization: Bearer YOUR_TOKEN_HERE
```

## 📊 查看数据

### 使用Prisma Studio（推荐）

1. 打开新终端，进入后端目录：
   ```bash
   cd backend/meimei-prisma-vue3/meimei-admin
   ```

2. 启动Prisma Studio：
   ```bash
   npx prisma studio
   ```

3. 打开浏览器访问：http://localhost:5555

4. 在左侧菜单中选择表：
   - `Customer` - 查看用户数据
   - `CustomerLoginLog` - 查看登录日志
   - `PasswordResetToken` - 查看密码重置令牌

### 使用MySQL客户端

使用任何MySQL客户端（如MySQL Workbench、Navicat等）连接：
- Host: 127.0.0.1
- Port: 3306
- Database: meimei-prisma
- Username: maosha
- Password: 123456

查询示例：
```sql
-- 查看所有用户
SELECT * FROM customer;

-- 查看登录日志
SELECT * FROM customer_login_log ORDER BY loginTime DESC LIMIT 10;

-- 查看密码重置令牌
SELECT * FROM password_reset_token WHERE used = 0;
```

## 🔧 常见问题

### Q1: 后端服务启动失败

**检查**：
1. 端口3000是否被占用
2. MySQL是否正在运行
3. Redis是否正在运行
4. 数据库连接配置是否正确

**解决**：
```bash
# 重启后端服务
cd backend/meimei-prisma-vue3/meimei-admin
npm run start:dev
```

### Q2: 前端页面无法访问

**检查**：
1. WordPress服务是否正在运行
2. 端口8080是否被占用

### Q3: 登录失败，提示"用户名或密码错误"

**检查**：
1. 用户是否已注册
2. 密码是否正确
3. 账号是否被锁定（5次失败会锁定10分钟）

**解决**：
- 重新注册一个新用户
- 或者等待10分钟后重试
- 或者在Prisma Studio中将`loginFailCount`重置为0

### Q4: 找回密码邮件收不到

**原因**：邮件服务未配置或配置错误

**临时解决方案**：
1. 查看后端控制台输出
2. 找到类似这样的日志：
   ```
   重置密码令牌: abc123...
   重置链接: http://localhost:8080/my-account/lost-password/?token=abc123...&email=test@example.com
   ```
3. 直接复制链接在浏览器中打开

**永久解决方案**：
参考 `EMAIL_SETUP_GUIDE.md` 配置邮件服务

### Q5: 头像上传后显示不正常

**原因**：当前使用base64编码存储，数据量较大

**建议**：
- 开发环境可以正常使用
- 生产环境建议集成云存储服务

## 📱 测试场景

### 场景1：新用户注册和登录
1. 访问注册页面
2. 填写完整信息
3. 注册成功
4. 自动跳转到登录页面
5. 输入刚才注册的用户名和密码
6. 登录成功
7. 自动跳转到个人中心

### 场景2：编辑个人资料
1. 登录后进入个人中心
2. 点击"Edit Profile"按钮
3. 修改昵称、邮箱、手机号、性别
4. 点击"Save Changes"
5. 查看更新后的信息

### 场景3：修改密码
1. 在个人中心点击"Change Password"
2. 输入旧密码
3. 输入新密码（两次）
4. 点击"Change Password"
5. 修改成功后自动退出
6. 使用新密码重新登录

### 场景4：找回密码
1. 在登录页面点击"Lost your password?"
2. 输入注册时使用的邮箱
3. 点击"Reset password"
4. 查看邮件或控制台获取重置链接
5. 点击链接，输入新密码
6. 重置成功后跳转到登录页面
7. 使用新密码登录

### 场景5：上传头像
1. 在个人中心点击头像区域
2. 选择图片文件（jpg、png、gif、webp）
3. 确认文件小于2MB
4. 上传成功后自动显示新头像

### 场景6：登录失败限制
1. 故意输入错误密码5次
2. 第5次失败后账号被锁定
3. 提示"账号已被锁定，请10分钟后再试"
4. 等待10分钟或在数据库中重置`loginFailCount`

## 🎯 下一步

完成快速测试后，你可以：

1. **配置邮件服务**：参考 `EMAIL_SETUP_GUIDE.md`
2. **查看完整文档**：参考 `IMPLEMENTATION_SUMMARY.md`
3. **开发后台管理**：参考实施方案文档中的后台管理模块设计
4. **集成云存储**：优化头像上传功能
5. **添加更多功能**：社交登录、两步验证等

## 📞 需要帮助？

如果遇到问题：
1. 检查后端控制台的错误日志
2. 检查浏览器控制台的错误信息
3. 查看 `IMPLEMENTATION_SUMMARY.md` 中的"已知问题和限制"
4. 查看 `EMAIL_SETUP_GUIDE.md` 中的"常见问题"

---

**祝你测试愉快！** 🎉

