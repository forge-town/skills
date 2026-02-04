# 环境变量管理代码使用指南

## 目录
- [生成的文件结构](#生成的文件结构)
- [使用单环境 getEnv](#使用单环境-getenv)
- [使用多环境 getXxxEnv](#使用多环境-getxxxenv)
- [错误处理](#错误处理)
- [最佳实践](#最佳实践)

## 生成的文件结构

生成的代码将位于 `integrations/env/` 目录下，结构如下：

### 单环境模式
```
integrations/env/
├── envSchema.ts          # Zod schema 定义
├── getEnv.ts             # getEnv 函数实现
└── index.ts               # 桶导出
```

### 多环境模式
```
integrations/env/
├── envSchema.ts          # Zod schema 定义（共享）
├── getServerEnv.ts      # getServerEnv 函数
├── getClientEnv.ts      # getClientEnv 函数（如配置了）
└── index.ts               # 桶导出
```

## 使用单环境 getEnv

### 1. 导入并使用
```typescript
import { getEnv } from '@/integrations/env';

// 获取所有环境变量
const { DATABASE_URL, VITE_APP_URL } = getEnv();

// 使用环境变量
console.log(DATABASE_URL);
console.log(VITE_APP_URL);
```

### 2. 生成的代码示例

**envSchema.ts**
```typescript
import { z } from 'zod/v4';

export const envSchema = z.object({
  DATABASE_URL: z.string(),
  BETTER_AUTH_SECRET: z.string(),
  VITE_APP_URL: z.string().optional(),
  NODE_ENV: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;
```

**getEnv.ts**
```typescript
import { envSchema } from './envSchema';

export const getEnv = () => {
  const { error, data } = envSchema.safeParse(process.env);
  if (error) {
    throw new Error(`Server env not valid. Message is: ${JSON.stringify(error.issues, null, 2)}`);
  }

  return data;
};
```

**index.ts**
```typescript
export * from './getEnv';
export * from './envSchema';
```

## 使用多环境 getXxxEnv

### 1. 导入并使用
```typescript
import { getServerEnv } from '@/integrations/server-env';
import { getClientEnv } from '@/integrations/client-env';

// 获取服务端环境变量
const { DATABASE_URL } = getServerEnv();
console.log(DATABASE_URL);

// 获取客户端环境变量
const { VITE_APP_URL } = getClientEnv();
console.log(VITE_APP_URL);
```

### 2. 生成的代码示例

**integrations/server-env/envSchema.ts**
```typescript
import { z } from 'zod/v4';

export const serverEnvSchema = z.object({
  DATABASE_URL: z.string(),
  BETTER_AUTH_SECRET: z.string(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
```

**integrations/server-env/getServerEnv.ts**
```typescript
import { serverEnvSchema } from './envSchema';

export const getServerEnv = () => {
  const { error, data } = serverEnvSchema.safeParse(process.env);
  if (error) {
    throw new Error(`Server env not valid. Message is: ${JSON.stringify(error.issues, null, 2)}`);
  }

  return data;
};
```

**integrations/server-env/index.ts**
```typescript
export * from './getServerEnv';
export * from './envSchema';
```

**integrations/client-env/envSchema.ts**
```typescript
import { z } from 'zod/v4';

export const clientEnvSchema = z.object({
  VITE_APP_URL: z.string().optional(),
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;
```

**integrations/client-env/getClientEnv.ts**
```typescript
import { clientEnvSchema } from './envSchema';

export const getClientEnv = () => {
  const { error, data } = clientEnvSchema.safeParse(process.env);
  if (error) {
    throw new Error(`Client env not valid. Message is: ${JSON.stringify(error.issues, null, 2)}`);
  }

  return data;
};
```

**integrations/client-env/index.ts**
```typescript
export * from './getClientEnv';
export * from './envSchema';
```

## 错误处理

### 环境变量缺失或类型错误
当环境变量不符合定义时，会抛出详细的错误信息：

```typescript
import { getEnv } from '@/integrations/env';

try {
  const env = getEnv();
} catch (error) {
  console.error(error);
  // Error: Server env not valid. Message is: [
  //   {
  //     "code": "invalid_type",
  //     "expected": "string",
  //     "received": "undefined",
  //     "path": ["DATABASE_URL"],
  //     "message": "Required"
  //   }
  // ]
}
```

### 启动时验证
建议在应用启动时验证环境变量：

```typescript
// app.ts 或 main.ts
import { getEnv } from '@/integrations/env';

const env = getEnv(); // 启动时验证，失败立即退出
```

## 最佳实践

### 1. 环境变量类型安全
生成的代码包含 TypeScript 类型定义，可以获得完整的类型提示：

```typescript
import { getEnv, type Env } from '@/integrations/env';

const env: Env = getEnv();
// env. 会提示所有定义的环境变量
```

### 2. 可选字段处理
对于可选字段，提供默认值：

```typescript
import { getEnv } from '@/integrations/env';

const { VITE_APP_URL, NODE_ENV } = getEnv();

const appUrl = VITE_APP_URL || 'http://localhost:3000';
const nodeEnv = NODE_ENV || 'development';
```

### 3. 不要在客户端暴露敏感信息
确保敏感环境变量（如数据库密码、API 密钥）只在服务端使用：

```typescript
// server/index.ts
import { getServerEnv } from '@/integrations/env';

const { DATABASE_URL } = getServerEnv();
const dbUrl = DATABASE_URL; // 仅在服务端可用
```

```typescript
// client/index.ts
import { getClientEnv } from '@/integrations/env';

const { VITE_APP_URL } = getClientEnv();
const appUrl = VITE_APP_URL; // 客户端可用
// 没有 DATABASE_URL，安全
```

### 4. .env 文件管理
确保 .env 文件在 .gitignore 中：

```
# .gitignore
.env
.env.local
.env.*.local
```

### 5. 环境变量命名规范
- 使用大写字母和下划线
- 客户端变量以 VITE_ 开头（Vite 项目）或 NEXT_PUBLIC_ 开头（Next.js 项目）
- 敏感信息不要暴露到客户端

### 6. IDE 配置
添加环境变量类型提示：

```typescript
// vite-env.d.ts (Vite 项目)
import type { Env } from '@/integrations/env';

interface ImportMetaEnv extends Env {}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

### 7. 测试时使用 Mock
在测试中可以 mock 环境变量：

```typescript
import { getEnv } from '@/integrations/env';

// 测试前设置
process.env.DATABASE_URL = 'test-db-url';
process.env.BETTER_AUTH_SECRET = 'test-secret';

const { DATABASE_URL, BETTER_AUTH_SECRET } = getEnv();
```

## 常见问题

### Q: 如何添加新的环境变量？
A: 修改配置文件 `env-config.json`，添加新的环境变量定义，然后重新运行脚本。

### Q: 如何修改环境变量的类型？
A: 在配置文件中修改 `type` 字段，重新运行脚本。

### Q: 生成的代码可以手动修改吗？
A: 可以，但建议重新生成以保持一致性。如果需要特殊逻辑，可以创建包装函数。

### Q: 支持 .env 文件自动加载吗？
A: 不支持。建议使用 `dotenv` 包在应用启动前加载 .env 文件。
