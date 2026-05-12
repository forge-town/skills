# Phase 5 验证步骤

## 本地联调顺序

1. 启动开发服务
2. 请求 /api/auth/ok，期望返回包含 ok true
3. 调用邮箱注册接口，验证 users 和 accounts 写入
4. 浏览器执行 GitHub 或 Google OAuth，验证 callback 与回跳地址

## 验证重点

- 注册成功后应返回 user 与 session
- Cookie 应随同响应正确写入
- OAuth 回调地址必须与平台控制台配置一致
- 如果出现 403，优先检查 trustedOrigins
