# 单环境变量管理代码生成规则

## 代码规范

1. **导入语句**：必须使用 `import { z } from 'zod/v4';`
2. **错误处理**：getter 函数必须使用 `safeParse` 并在失败时抛出详细错误
3. **类型导出**：使用 `z.infer` 导出类型
4. **命名规范**：`envSchema`、`getEnv`、`Env`

## 文件结构

生成的代码位于 `integrations/env/` 目录下：

```
integrations/env/
├── envSchema.ts    # Zod schema 定义
├── getEnv.ts       # 环境变量获取函数
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

参考 [best-practice-examples/single-env/](../best-practice-examples/single-env/) 中的完整示例代码。

### 文件结构
```
integrations/env/
├── envSchema.ts    # Zod schema 定义
├── getEnv.ts       # 环境变量获取函数
└── index.ts        # 桶导出
```

### 关键代码模式

**envSchema.ts** - 使用 `z.object()` 定义环境变量结构
**getEnv.ts** - 使用 `safeParse()` 验证并返回环境变量
**index.ts** - 导出所有必要的函数和类型