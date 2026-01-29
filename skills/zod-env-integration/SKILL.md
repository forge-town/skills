---
name: zod-env-integration
description: Generate Zod-based environment variable management code from .env.example files. Use when you need to create type-safe env management, standardize env handling, or generate env schemas.
---

# Zod 环境变量集成

提供生成基于 Zod 验证的类型安全环境变量管理代码的指导和模板。包含创建 schema、getter 函数和桶导出的示例和最佳实践。

## 工作原理

1. 在项目根目录准备 .env.example 文件
2. 按照代码生成指南创建 Zod schema
3. 实现带有适当错误处理的 getter 函数
4. 创建桶导出以实现干净的导入
5. 在应用程序中使用生成的代码

## 使用方法

此技能提供文档和示例。按照参考指南中的步骤操作：

- [代码生成指南](references/code-generation-guide.md) - 生成代码的详细规则
- [使用指南](references/usage-guide.md) - 如何使用生成的代码
- [.env.example 模板](references/.env.example.template) - .env 文件的模板

**示例：**

```bash
# 在项目中创建 .env.example
cp skills/zod-env-integration/references/.env.example.template .env.example

# 按照指南手动创建集成代码
```

## 输出

手动过程 - 在 `integrations/env/` 目录中创建这些文件：

- `envSchema.ts` - Zod schema 和类型
- `getEnv.ts` 或 `getServerEnv.ts`/`getClientEnv.ts` - Getter 函数
- `index.ts` - 桶导出

## 呈现结果

环境变量集成代码创建成功！

生成的文件：
- integrations/env/envSchema.ts
- integrations/env/getEnv.ts
- integrations/env/index.ts

## 故障排除

- **缺少 .env.example**：从 references/.env.example.template 复制模板
- **未安装 Zod**：在项目中运行 `pnpm install zod`
- **类型错误**：检查代码生成指南中的正确 schema 语法
- **导入错误**：确保 index.ts 中的桶导出正确
