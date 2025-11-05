# 🔧 LocalStorage Key 修复说明

## 🐛 问题描述

**症状**：登录成功后跳转到个人中心，但立即又跳转回登录页面。

**错误提示**："Please login first to access your personal center"

---

## 🔍 问题原因

个人中心页面存在**两套不同的登录检查逻辑**，使用了**不同的 localStorage key**：

### 1. AuthService 使用的 Key（正确）

在 `frontend/assets/js/auth.js` 中：

```javascript
// Token
setToken(token) {
  localStorage.setItem('customer_token', token);  // ✅ 正确
}

getToken() {
  return localStorage.getItem('customer_token');  // ✅ 正确
}

// 用户信息
setUserInfo(userInfo) {
  localStorage.setItem('customer_info', JSON.stringify(userInfo));  // ✅ 正确
}

getUserInfoFromStorage() {
  return JSON.parse(localStorage.getItem('customer_info') || '{}');  // ✅ 正确
}
```

### 2. 个人中心旧代码使用的 Key（错误）

在 `frontend/Personal-Center/index.html` 中：

```javascript
// ❌ 错误：检查的是 'token' 和 'userInfo'
function checkLogin() {
  const token = localStorage.getItem('token');        // ❌ 应该是 'customer_token'
  const userInfo = localStorage.getItem('userInfo');  // ❌ 应该是 'customer_info'
  
  if (!token || !userInfo) {
    // 跳转到登录页面
  }
}
```

---

## 🔄 执行流程分析

### 登录流程

1. **用户在登录页面输入账号密码**
2. **调用 `AuthService.login()`**
   ```javascript
   // 保存到 localStorage
   localStorage.setItem('customer_token', token);
   localStorage.setItem('customer_info', JSON.stringify(user));
   ```
3. **跳转到个人中心**
4. **个人中心检查登录状态**
   ```javascript
   // 新的检查（第2824行）- 通过 ✅
   if (!AuthService.isLoggedIn()) {  // 检查 'customer_token'
     // 这个检查通过了
   }
   
   // 旧的检查（第1612行）- 失败 ❌
   const token = localStorage.getItem('token');        // null
   const userInfo = localStorage.getItem('userInfo');  // null
   if (!token || !userInfo) {
     // 跳转回登录页面 ❌
   }
   ```

### 为什么会跳转回登录页面？

因为旧的 `checkLogin()` 函数在页面加载时被调用，它检查的是 `token` 和 `userInfo`，但这两个 key 在 localStorage 中不存在（实际保存的是 `customer_token` 和 `customer_info`），所以检查失败，触发跳转。

---

## ✅ 解决方案

### 修复的文件

**`frontend/Personal-Center/index.html`**

### 修复的位置

1. **checkLogin() 函数**（第1612-1613行）
   ```javascript
   // 之前
   const token = localStorage.getItem('token');
   const userInfo = localStorage.getItem('userInfo');
   
   // 修复后
   const token = localStorage.getItem('customer_token');
   const userInfo = localStorage.getItem('customer_info');
   ```

2. **loadUserInfo() 函数**（第1629行）
   ```javascript
   // 之前
   const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
   
   // 修复后
   const userInfo = JSON.parse(localStorage.getItem('customer_info') || '{}');
   ```

3. **loadOrders() 函数**（第1677-1678行）
   ```javascript
   // 之前
   const token = localStorage.getItem('token');
   const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
   
   // 修复后
   const token = localStorage.getItem('customer_token');
   const userInfo = JSON.parse(localStorage.getItem('customer_info') || '{}');
   ```

4. **编辑资料功能**（第1951行）
   ```javascript
   // 之前
   const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
   
   // 修复后
   const userInfo = JSON.parse(localStorage.getItem('customer_info') || '{}');
   ```

5. **提交编辑资料**（第1992行）
   ```javascript
   // 之前
   const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
   
   // 修复后
   const userInfo = JSON.parse(localStorage.getItem('customer_info') || '{}');
   ```

6. **修改密码功能**（第2141行）
   ```javascript
   // 之前
   const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
   
   // 修复后
   const userInfo = JSON.parse(localStorage.getItem('customer_info') || '{}');
   ```

**总计修复**：6处

---

## 📊 LocalStorage Key 统一规范

### ✅ 正确的 Key 命名

| 数据类型 | Key 名称 | 说明 |
|---------|---------|------|
| **Token** | `customer_token` | 前端用户的认证令牌 |
| **用户信息** | `customer_info` | 前端用户的个人信息（JSON字符串） |

### ❌ 错误的 Key 命名（已废弃）

| 数据类型 | 错误的 Key | 说明 |
|---------|-----------|------|
| Token | `token` | ❌ 不要使用 |
| 用户信息 | `userInfo` | ❌ 不要使用 |

---

## 🎯 测试步骤

### 1. 清除旧数据
```javascript
// 在浏览器控制台执行
localStorage.removeItem('token');
localStorage.removeItem('userInfo');
localStorage.removeItem('customer_token');
localStorage.removeItem('customer_info');
```

### 2. 重新登录
1. 访问：http://localhost:8080/my-account/
2. 输入用户名和密码
3. 点击登录

### 3. 验证登录成功
1. 应该跳转到个人中心：http://localhost:8080/Personal-Center/
2. **不应该再跳转回登录页面** ✅
3. 能看到用户信息正常显示

### 4. 检查 localStorage
在浏览器控制台执行：
```javascript
console.log('Token:', localStorage.getItem('customer_token'));
console.log('User Info:', localStorage.getItem('customer_info'));
```

应该看到：
```
Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
User Info: {"userId":1,"userName":"testuser","nickName":"Test User",...}
```

---

## 🔄 完整的登录流程（修复后）

```
1. 用户访问登录页面
   ↓
2. 输入用户名和密码
   ↓
3. 点击"Login"按钮
   ↓
4. AuthService.login() 调用后端 API
   ↓
5. 后端返回 token 和 user 信息
   ↓
6. 保存到 localStorage:
   - customer_token: "eyJhbGci..."
   - customer_info: "{\"userId\":1,...}"
   ↓
7. 显示成功消息："Login successful! Redirecting..."
   ↓
8. 1秒后跳转到个人中心
   ↓
9. 个人中心检查登录状态:
   - AuthService.isLoggedIn() ✅ 通过
   - checkLogin() ✅ 通过（已修复）
   ↓
10. 加载用户信息并显示 ✅
```

---

## 🎉 修复效果

### 修复前
- ❌ 登录成功后跳转到个人中心
- ❌ 立即又跳转回登录页面
- ❌ 显示"Please login first"警告
- ❌ 用户体验极差

### 修复后
- ✅ 登录成功后跳转到个人中心
- ✅ 停留在个人中心页面
- ✅ 正常显示用户信息
- ✅ 所有功能正常工作
- ✅ 用户体验良好

---

## 📝 注意事项

### 1. 统一使用 AuthService

**推荐做法**：
```javascript
// ✅ 推荐：使用 AuthService 的方法
const token = AuthService.getToken();
const userInfo = AuthService.getUserInfoFromStorage();
```

**不推荐做法**：
```javascript
// ❌ 不推荐：直接访问 localStorage
const token = localStorage.getItem('customer_token');
const userInfo = JSON.parse(localStorage.getItem('customer_info') || '{}');
```

### 2. 为什么使用 `customer_` 前缀？

- **区分用户类型**：前端用户（customer）vs 后台管理员（admin）
- **避免冲突**：如果同一个浏览器既登录前端又登录后台，不会互相干扰
- **语义清晰**：一看就知道是前端用户的数据

### 3. 后续开发建议

如果需要添加新的 localStorage 数据：
- 前端用户相关：使用 `customer_` 前缀
- 后台管理相关：使用 `admin_` 前缀
- 通用配置：使用 `app_` 前缀

---

**最后更新**: 2025-11-05
**修复状态**: ✅ 已完成

