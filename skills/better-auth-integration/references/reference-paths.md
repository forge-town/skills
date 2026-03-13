# 参考实现路径

## code-arena

- 服务端实例：code-arena/apps/web/src/integrations/better-auth/auth.ts
- 客户端 SDK：code-arena/apps/web/src/integrations/better-auth-client/auth-client.ts
- API 路由：code-arena/apps/web/src/routes/api/auth/$.ts
- useAuth Hook：code-arena/apps/web/src/hooks/useAuth.ts
- users 表：code-arena/packages/db-schema/src/tables/users_table.ts
- accounts 表：code-arena/packages/db-schema/src/tables/accounts_table.ts
- sessions 表：code-arena/packages/db-schema/src/tables/sessions_table.ts
- verifications 表：code-arena/packages/db-schema/src/tables/verifications_table.ts

## mewpaw

- 服务端实例：mewpaw/apps/dashboard/src/integrations/better-auth/auth.ts
- 客户端 SDK：mewpaw/apps/dashboard/src/integrations/better-auth-client/auth-client.ts
- API 路由：mewpaw/apps/dashboard/src/routes/api/auth/$.ts
- useAuth Hook：mewpaw/apps/dashboard/src/hooks/useAuth.ts
- Schema 统一文件：mewpaw/packages/db-schema/src/schema.ts
