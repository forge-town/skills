# 架构流转

- Browser 发起认证请求到 /api/auth
- TanStack Start 路由层将请求转交 auth.handler
- better-auth 通过 drizzleAdapter 操作 PostgreSQL
- 邮箱注册写入 users 与 accounts，返回 session
- OAuth 登录重定向到 provider，回调后落库并回跳业务页面
