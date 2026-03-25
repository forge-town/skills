# Phase 1 探索检查清单

## 必查项

- 读取 package.json，确认框架、ORM、数据库驱动版本
- 检查 src/integrations 是否已有 better-auth 文件
- 确认 schema 是单文件还是按表拆分
- 确认 DATABASE_URL 写法与运行环境（本机或 Docker）
- 检查 env 是否已有 BETTER_AUTH_SECRET
- 检查路由是否采用 TanStack Start createFileRoute
- 检查是否存在 server-env 或 getServerEnv 读取模式
- **检查现有 users / accounts / sessions 表的 id 列类型**：必须为 `text`，不可为 `uuid`（better-auth 写入字符串 ID，uuid 列会报 invalid input syntax 错误）

## 输出模板

- 项目形态：
- 认证现状：
- schema 组织：
- env 读取模式：
- 风险点：
