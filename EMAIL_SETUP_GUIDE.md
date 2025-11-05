# 📧 邮件服务配置指南

## 概述

本项目使用邮件服务来发送找回密码邮件。需要配置SMTP服务器才能正常发送邮件。

## 配置文件位置

📁 `backend/meimei-prisma-vue3/meimei-admin/src/config/config.dev.ts`

## 支持的邮箱服务商

### 1. QQ邮箱（推荐用于测试）

**配置示例**：
```typescript
email: {
  host: 'smtp.qq.com',
  port: 465,
  secure: true,
  user: 'your-qq-email@qq.com',
  pass: 'your-authorization-code', // 注意：这里是授权码，不是QQ密码
  from: '"Pet Shop" <your-qq-email@qq.com>',
}
```

**获取QQ邮箱授权码步骤**：
1. 登录QQ邮箱网页版：https://mail.qq.com
2. 点击顶部"设置" → "账户"
3. 找到"POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务"
4. 开启"POP3/SMTP服务"或"IMAP/SMTP服务"
5. 点击"生成授权码"
6. 按照提示发送短信验证
7. 获得16位授权码（如：abcd efgh ijkl mnop）
8. 将授权码填入配置文件的`pass`字段

### 2. 163邮箱

**配置示例**：
```typescript
email: {
  host: 'smtp.163.com',
  port: 465,
  secure: true,
  user: 'your-email@163.com',
  pass: 'your-authorization-code',
  from: '"Pet Shop" <your-email@163.com>',
}
```

**获取163邮箱授权码**：
1. 登录163邮箱：https://mail.163.com
2. 点击顶部"设置" → "POP3/SMTP/IMAP"
3. 开启"SMTP服务"
4. 点击"客户端授权密码"
5. 按照提示获取授权码

### 3. Gmail（需要科学上网）

**配置示例**：
```typescript
email: {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // 使用TLS
  user: 'your-email@gmail.com',
  pass: 'your-app-password',
  from: '"Pet Shop" <your-email@gmail.com>',
}
```

**获取Gmail应用专用密码**：
1. 登录Google账户：https://myaccount.google.com
2. 进入"安全性"
3. 开启"两步验证"
4. 在"两步验证"下找到"应用专用密码"
5. 生成新的应用专用密码
6. 将密码填入配置文件

### 4. 阿里云邮箱

**配置示例**：
```typescript
email: {
  host: 'smtp.aliyun.com',
  port: 465,
  secure: true,
  user: 'your-email@aliyun.com',
  pass: 'your-password',
  from: '"Pet Shop" <your-email@aliyun.com>',
}
```

### 5. 企业邮箱（推荐用于生产环境）

如果你有企业邮箱（如腾讯企业邮、阿里企业邮等），请参考对应服务商的SMTP配置文档。

## 配置步骤

### 第一步：修改配置文件

打开 `backend/meimei-prisma-vue3/meimei-admin/src/config/config.dev.ts`

找到 `email` 配置项，修改为你的邮箱信息：

```typescript
email: {
  host: 'smtp.qq.com',              // SMTP服务器地址
  port: 465,                         // SMTP端口
  secure: true,                      // 是否使用SSL
  user: 'your-email@qq.com',        // 发件人邮箱（改成你的）
  pass: 'your-authorization-code',   // 邮箱授权码（改成你的）
  from: '"Pet Shop" <your-email@qq.com>', // 发件人显示名称
},
```

### 第二步：修改网站配置

在同一个文件中，找到 `website` 配置项：

```typescript
website: {
  name: 'Pet Shop',                                    // 网站名称
  url: 'http://localhost:8080',                        // 网站URL
  resetPasswordUrl: 'http://localhost:8080/my-account/lost-password/', // 找回密码页面URL
},
```

如果你的网站部署在其他域名，请修改这些URL。

### 第三步：重启后端服务

修改配置后，需要重启后端服务：

```bash
cd backend/meimei-prisma-vue3/meimei-admin
npm run start:dev
```

## 测试邮件功能

### 方法1：使用测试页面

1. 打开测试页面：http://localhost:8080/test-register.html
2. 注册一个测试用户（使用真实邮箱）
3. 打开找回密码页面：http://localhost:8080/my-account/lost-password/
4. 输入注册时使用的邮箱
5. 检查邮箱是否收到重置密码邮件

### 方法2：使用Postman测试

**发送找回密码邮件**：
```
POST http://localhost:3000/api/frontend/auth/forgot-password
Content-Type: application/json

{
  "email": "your-test-email@qq.com"
}
```

**响应示例**：
```json
{
  "code": 200,
  "msg": "重置密码邮件已发送，请查收",
  "data": {
    "token": "abc123..." // 开发环境会返回token，生产环境应该删除
  }
}
```

## 邮件模板

### 找回密码邮件

邮件包含以下内容：
- 网站名称和Logo
- 用户名称
- 重置密码按钮（链接）
- 纯文本链接（备用）
- 过期时间提示（1小时）
- 安全提示

邮件模板位置：`backend/meimei-prisma-vue3/meimei-admin/src/modules/common/email/email.service.ts`

你可以根据需要自定义邮件样式和内容。

### 欢迎邮件（可选）

系统还提供了欢迎邮件功能，可以在用户注册成功后自动发送。

要启用欢迎邮件，在 `frontend-auth.service.ts` 的 `register` 方法中添加：

```typescript
// 发送欢迎邮件（可选）
await this.emailService.sendWelcomeEmail(email, userName);
```

## 常见问题

### Q1: 邮件发送失败，提示"Authentication failed"

**原因**：邮箱密码或授权码错误

**解决方法**：
1. 确认使用的是授权码，不是邮箱登录密码
2. 重新生成授权码
3. 检查授权码是否包含空格（应该去掉空格）

### Q2: 邮件发送失败，提示"Connection timeout"

**原因**：网络问题或端口被封

**解决方法**：
1. 检查网络连接
2. 尝试使用其他端口（465 或 587）
3. 检查防火墙设置
4. 如果使用Gmail，确保可以访问Google服务

### Q3: 邮件发送成功，但收不到邮件

**原因**：邮件被识别为垃圾邮件

**解决方法**：
1. 检查垃圾邮件文件夹
2. 将发件人添加到联系人
3. 检查邮箱的过滤规则

### Q4: 开发环境邮件配置失败怎么办？

**临时方案**：

系统在邮件发送失败时会在控制台输出重置链接：

```
重置密码令牌: abc123...
重置链接: http://localhost:8080/my-account/lost-password/?token=abc123...&email=test@example.com
```

你可以直接复制这个链接在浏览器中打开，完成密码重置。

## 生产环境建议

### 1. 使用专业邮件服务

推荐使用以下服务：
- **SendGrid**：https://sendgrid.com
- **Mailgun**：https://www.mailgun.com
- **Amazon SES**：https://aws.amazon.com/ses/
- **阿里云邮件推送**：https://www.aliyun.com/product/directmail

这些服务提供更高的送达率和更好的性能。

### 2. 配置SPF和DKIM

为了提高邮件送达率，建议配置：
- SPF记录：防止邮件被识别为垃圾邮件
- DKIM签名：验证邮件来源
- DMARC策略：邮件认证策略

### 3. 删除敏感信息

在生产环境中，应该删除以下内容：
1. 在 `forgotPassword` 方法中删除返回的 `token`
2. 删除控制台输出的敏感信息

### 4. 使用环境变量

将邮箱配置信息放在环境变量中，不要直接写在代码里：

```typescript
email: {
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_SECURE === 'true',
  user: process.env.EMAIL_USER,
  pass: process.env.EMAIL_PASS,
  from: process.env.EMAIL_FROM,
},
```

在 `.env` 文件中配置：
```
EMAIL_HOST=smtp.qq.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=your-email@qq.com
EMAIL_PASS=your-authorization-code
EMAIL_FROM="Pet Shop" <your-email@qq.com>
```

## 相关文件

- 📁 邮件服务：`backend/meimei-prisma-vue3/meimei-admin/src/modules/common/email/`
  - `email.service.ts` - 邮件发送服务
  - `email.module.ts` - 邮件模块配置
- 📁 配置文件：`backend/meimei-prisma-vue3/meimei-admin/src/config/config.dev.ts`
- 📁 前端页面：`frontend/my-account/lost-password/index.html`

## 技术支持

如果遇到问题，请检查：
1. 后端控制台的错误日志
2. 浏览器控制台的错误信息
3. 邮箱服务商的SMTP配置文档

---

**最后更新**: 2025-11-04

