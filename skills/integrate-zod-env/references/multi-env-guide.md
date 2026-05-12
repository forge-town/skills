# 多环境变量管理代码生成规则

## 代码规范

1. **导入语句**：必须使用 `import { z } from 'zod/v4';`
2. **错误处理**：getter 函数必须使用 `safeParse` 并在失败时抛出详细错误
3. **类型导出**：使用 `z.infer` 导出类型
4. **命名规范**：`{envName}EnvSchema`、`get{EnvName}Env`、`{EnvName}Env`

## 文件结构

每个环境独立生成目录：`integrations/{envName}-env/`

```
integrations/
├── server-env/
│   ├── envSchema.ts    # serverEnvSchema
│   ├── getServerEnv.ts # getServerEnv 函数
│   └── index.ts        # 桶导出
└── client-env/
    ├── envSchema.ts    # clientEnvSchema
    ├── getClientEnv.ts # getClientEnv 函数
    └── index.ts        # 桶导出
```

## 字段类型和验证规则

### 类型映射

| .env.example 注释 | Zod 类型 | 示例 |
|------------------|---------|------|
| 无注释或 `# zod:string` | `z.string()` | `DATABASE_URL=xxx` |
| `# zod:number` | `z.number()` | `PORT=3000  # zod:number` |
| `# zod:boolean` | `z.boolean()` | `DEBUG=true  # zod:boolean` |

### 可选字段
- `# optional` 注解 → 添加 `.optional()`

### 验证方法映射

| .env.example 注释 | Zod 方法 | 示例 |
|------------------|---------|------|
| `# zod:url()` | `.url()` | `SITE_URL=xxx  # zod:url()` |
| `# zod:email()` | `.email()` | `EMAIL=xxx  # zod:email()` |
| `# zod:min(n)` | `.min(n)` | `PORT=3000  # zod:min(1)` |
| `# zod:max(n)` | `.max(n)` | `PORT=3000  # zod:max(65535)` |
| `# zod:regex(pattern)` | `.regex(pattern)` | `CODE=xxx  # zod:regex(/^[A-Z]{3}$/)` |

## 代码生成示例

参考 [best-practice-examples/multi-env/](../best-practice-examples/multi-env/) 中的完整示例代码。

### 文件结构
```
integrations/
├── server-env/
│   ├── envSchema.ts    # serverEnvSchema
│   ├── getServerEnv.ts # getServerEnv 函数
│   └── index.ts        # 桶导出
└── client-env/
    ├── envSchema.ts    # clientEnvSchema
    ├── getClientEnv.ts # getClientEnv 函数
    └── index.ts        # 桶导出
```

### 关键代码模式

**服务端环境** - 包含敏感配置如数据库连接、API密钥
**客户端环境** - 仅包含公开配置如API端点、应用URL
**每个环境独立** - schema、getter 函数和导出完全分离