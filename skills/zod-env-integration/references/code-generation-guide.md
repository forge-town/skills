# 环境变量管理代码生成规则

## 目录
- [生成规则总览](#生成规则总览)
- [从 .env.example 解析环境变量](#从-envexample-解析环境变量)
- [单环境代码生成](#单环境代码生成)
- [多环境代码生成](#多环境代码生成)
- [字段类型和验证规则](#字段类型和验证规则)

## 生成规则总览

### 文件结构
生成的代码必须位于 `integrations/env/` 目录下，包含以下文件：
- `env-schema.ts`：Zod schema 定义
- `get-env.ts` 或 `get-xxx-env.ts`：getter 函数
- `index.ts`：桶导出

### 代码规范
1. **导入语句**：必须使用 `import { z } from 'zod/v4';`
2. **错误处理**：getter 函数必须使用 `safeParse` 并在失败时抛出详细错误
3. **类型导出**：使用 `z.infer` 导出类型
4. **命名规范**：
   - 单环境：`envSchema`、`getEnv`、`Env`
   - 多环境：`{envName}EnvSchema`、`get{EnvName}Env`、`{EnvName}Env`

## 从 .env.example 解析环境变量

### 解析规则
1. 读取 `.env.example` 文件（或 `.env.{env-name}.example`）
2. 每行格式：`VAR_NAME=value  # comments`
3. 跳过空行和纯注释行（以 `#` 开头的行）
4. 提取变量名（等号前）
5. 解析注释中的验证规则

### 注释解析
从注释中提取以下信息：
- `# optional` → 标记为可选字段
- `# zod:string` → 指定为 string 类型（默认）
- `# zod:number` → 指定为 number 类型
- `# zod:boolean` → 指定为 boolean 类型
- `# zod:url()` → 添加 `.url()` 验证
- `# zod:email()` → 添加 `.email()` 验证
- `# zod:min(n)` → 添加 `.min(n)` 验证
- `# zod:max(n)` → 添加 `.max(n)` 验证
- `# zod:regex(pattern)` → 添加 `.regex(pattern)` 验证

### 解析示例

输入：
```bash
DATABASE_URL=postgresql://localhost/mydb
PORT=3000  # zod:number, zod:min(1), zod:max(65535)
VITE_APP_URL=http://localhost:3000  # optional
DEBUG=false  # zod:boolean, # optional
```

解析结果：
```json
{
  "DATABASE_URL": {
    "name": "DATABASE_URL",
    "type": "string",
    "required": true,
    "validators": []
  },
  "PORT": {
    "name": "PORT",
    "type": "number",
    "required": true,
    "validators": ["min(1)", "max(65535)"]
  },
  "VITE_APP_URL": {
    "name": "VITE_APP_URL",
    "type": "string",
    "required": false,
    "validators": []
  },
  "DEBUG": {
    "name": "DEBUG",
    "type": "boolean",
    "required": false,
    "validators": []
  }
}
```

## 单环境代码生成

### 触发条件
只存在 `.env.example` 文件

### 生成的文件

#### 1. env-schema.ts
```typescript
import { z } from 'zod/v4';

export const envSchema = z.object({
  // 必需的 string 字段
  DATABASE_URL: z.string(),
  BETTER_AUTH_SECRET: z.string(),

  // number 类型字段
  PORT: z.number().min(1).max(65535),

  // 可选字段
  VITE_APP_URL: z.string().optional(),
  NODE_ENV: z.string().optional(),

  // boolean 类型字段
  DEBUG: z.boolean().optional(),
});

export type Env = z.infer<typeof envSchema>;
```

#### 2. get-env.ts
```typescript
import { envSchema } from './env-schema';

export const getEnv = () => {
  const { error, data } = envSchema.safeParse(process.env);
  if (error) {
    throw new Error(`Server env not valid. Message is: ${JSON.stringify(error.issues, null, 2)}`);
  }

  return data;
};
```

#### 3. index.ts
```typescript
export { getEnv } from './get-env';
export type { Env } from './env-schema';
```

### 生成要点
1. Schema 名称固定为 `envSchema`
2. 函数名称固定为 `getEnv`
3. 错误消息为 `Server env not valid`

## 多环境代码生成

### 触发条件
存在多个 `.env.{env-name}.example` 文件

### 环境名称提取
从文件名提取环境名称：
- `.env.server.example` → 环境名：`server` → Schema：`serverEnvSchema` → 函数：`getServerEnv`
- `.env.client.example` → 环境名：`client` → Schema：`clientEnvSchema` → 函数：`getClientEnv`

### 生成的文件

#### 1. env-schema.ts
```typescript
import { z } from 'zod/v4';

// Server 环境的 schema
export const serverEnvSchema = z.object({
  DATABASE_URL: z.string(),
  BETTER_AUTH_SECRET: z.string(),
  EMAIL_USER: z.string(),
});

// Client 环境的 schema
export const clientEnvSchema = z.object({
  VITE_APP_URL: z.string().optional(),
  VITE_API_URL: z.string(),
});

// 导出类型
export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;
```

#### 2. get-server-env.ts
```typescript
import { serverEnvSchema } from './env-schema';

export const getServerEnv = () => {
  const { error, data } = serverEnvSchema.safeParse(process.env);
  if (error) {
    throw new Error(`Server env not valid. Message is: ${JSON.stringify(error.issues, null, 2)}`);
  }

  return data;
};
```

#### 3. get-client-env.ts
```typescript
import { clientEnvSchema } from './env-schema';

export const getClientEnv = () => {
  const { error, data } = clientEnvSchema.safeParse(process.env);
  if (error) {
    throw new Error(`Client env not valid. Message is: ${JSON.stringify(error.issues, null, 2)}`);
  }

  return data;
};
```

#### 4. index.ts
```typescript
export { getServerEnv } from './get-server-env';
export { getClientEnv } from './get-client-env';
export type { ServerEnv, ClientEnv } from './env-schema';
```

### 生成要点
1. 每个环境生成独立的 schema：`{envName}EnvSchema`
2. 每个环境生成独立的 getter 函数：`get{EnvName}Env`
3. getter 函数文件名：`get-{env-name}-env.ts`
4. 错误消息中环境名称首字母大写：`Server env`、`Client env`

## 字段类型和验证规则

### 类型映射

| .env.example 注释 | Zod 类型 | 示例 |
|------------------|---------|------|
| 无注释或 `# zod:string` | `z.string()` | `DATABASE_URL=xxx` |
| `# zod:number` | `z.number()` | `PORT=3000  # zod:number` |
| `# zod:boolean` | `z.boolean()` | `DEBUG=true  # zod:boolean` |

### 可选字段
- `# optional` 注解 → 添加 `.optional()`
- 可选字段可以与类型注释组合

### 验证方法映射

| .env.example 注释 | Zod 方法 | 示例 |
|------------------|---------|------|
| `# zod:url()` | `.url()` | `SITE_URL=xxx  # zod:url()` |
| `# zod:email()` | `.email()` | `EMAIL=xxx  # zod:email()` |
| `# zod:min(n)` | `.min(n)` | `PORT=3000  # zod:min(1)` |
| `# zod:max(n)` | `.max(n)` | `PORT=3000  # zod:max(65535)` |
| `# zod:regex(pattern)` | `.regex(pattern)` | `CODE=xxx  # zod:regex(/^[A-Z]{3}$/)` |

### 完整示例转换

#### 示例 1：基本 string 类型
输入：
```bash
DATABASE_URL=postgresql://localhost/mydb
```

生成：
```typescript
DATABASE_URL: z.string()
```

#### 示例 2：可选 string 类型
输入：
```bash
VITE_APP_URL=http://localhost:3000  # optional
```

生成：
```typescript
VITE_APP_URL: z.string().optional()
```

#### 示例 3：number 类型 + 验证
输入：
```bash
PORT=3000  # zod:number, zod:min(1), zod:max(65535)
```

生成：
```typescript
PORT: z.number().min(1).max(65535)
```

#### 示例 4：boolean 类型 + 可选
输入：
```bash
DEBUG=false  # zod:boolean, # optional
```

生成：
```typescript
DEBUG: z.boolean().optional()
```

#### 示例 5：url 验证
输入：
```bash
SITE_URL=https://example.com  # zod:url()
```

生成：
```typescript
SITE_URL: z.string().url()
```

#### 示例 6：email 验证 + 可选
输入：
```bash
EMAIL=user@example.com  # zod:email(), # optional
```

生成：
```typescript
EMAIL: z.string().email().optional()
```

### 复杂示例（用户原始需求）

输入 `.env.example`：
```bash
DATABASE_URL=postgresql://localhost/mydb
BETTER_AUTH_SECRET=your-secret-key
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
EMAIL_USER=your-email@example.com
EMAIL_PASSWORD=your-email-password
SMTP_HOST=smtp.gmail.com
VITE_APP_URL=http://localhost:3000  # optional
NODE_ENV=development  # optional
PAYPAL_CLIENT_ID=your-paypal-client-id  # optional
PAYPAL_SANDBOX_CLIENT_ID=your-paypal-sandbox-client-id  # optional
PAYPAL_CLIENT_SECRET=your-paypal-client-secret  # optional
PAYPAL_SANDBOX_CLIENT_SECRET=your-paypal-sandbox-client-secret  # optional
```

生成 `env-schema.ts`：
```typescript
import { z } from 'zod/v4';

export const envSchema = z.object({
  DATABASE_URL: z.string(),
  BETTER_AUTH_SECRET: z.string(),
  GITHUB_CLIENT_ID: z.string(),
  GITHUB_CLIENT_SECRET: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  EMAIL_USER: z.string(),
  EMAIL_PASSWORD: z.string(),
  SMTP_HOST: z.string(),
  VITE_APP_URL: z.string().optional(),
  NODE_ENV: z.string().optional(),
  PAYPAL_CLIENT_ID: z.string().optional(),
  PAYPAL_SANDBOX_CLIENT_ID: z.string().optional(),
  PAYPAL_CLIENT_SECRET: z.string().optional(),
  PAYPAL_SANDBOX_CLIENT_SECRET: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;
```

生成 `get-env.ts`：
```typescript
import { envSchema } from './env-schema';

export const getEnv = () => {
  const { error, data } = envSchema.safeParse(process.env);
  if (error) {
    throw new Error(`Server env not valid. Message is: ${JSON.stringify(error.issues, null, 2)}`);
  }

  return data;
};
```

生成 `index.ts`：
```typescript
export { getEnv } from './get-env';
export type { Env } from './env-schema';
```

配置：
```json
{
  "name": "PORT",
  "type": "number",
  "required": true,
  "zodMethods": ["min(1)", "max(65535)"]
}
```

生成：
```typescript
PORT: z.number().min(1).max(65535)
```

## 常见错误处理

### 1. 字段名冲突
同一环境内不能有重复的字段名，生成前必须验证。

### 2. 环境归属
多环境下，每个环境变量必须明确属于某个环境（通过 `env` 字段）。

### 3. 必需字段验证
`required: true` 的字段不能有默认值（配置层面），必须确保运行时提供。

### 4. Zod 方法语法
`zodMethods` 中的方法必须是有效的 Zod 方法链调用。

## 完整生成示例

### 用户原始需求（多环境）

配置：
```json
{
  "mode": "multi",
  "environments": [
    {"name": "server", "prefix": "getServer"}
  ],
  "envVariables": [
    {"name": "DATABASE_URL", "type": "string", "required": true, "env": "server"},
    {"name": "BETTER_AUTH_SECRET", "type": "string", "required": true, "env": "server"},
    {"name": "VITE_APP_URL", "type": "string", "required": false, "env": "server"}
  ]
}
```

生成 env-schema.ts：
```typescript
import { z } from 'zod/v4';

export const serverEnvSchema = z.object({
  DATABASE_URL: z.string(),
  BETTER_AUTH_SECRET: z.string(),
  VITE_APP_URL: z.string().optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
```

生成 get-server-env.ts：
```typescript
import { serverEnvSchema } from './env-schema';

export const getServerEnv = () => {
  const { error, data } = serverEnvSchema.safeParse(process.env);
  if (error) {
    throw new Error(`Server env not valid. Message is: ${JSON.stringify(error.issues, null, 2)}`);
  }

  return data;
};
```

生成 index.ts：
```typescript
export { getServerEnv } from './get-server-env';
export type { ServerEnv } from './env-schema';
```
