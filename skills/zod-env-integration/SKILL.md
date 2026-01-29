---
name: zod-env-integration
description: Generate Zod-based environment variable management code from .env.example files. Use when you need to create type-safe env management, standardize env handling, or generate env schemas.
---

# Zod 环境变量集成

提供生成基于 Zod 验证的类型安全环境变量管理代码的指导和模板。包含创建 schema、getter 函数和桶导出的示例和最佳实践。

## 工作原理

1. 在项目根目录准备 .env.example 文件
2. **严格参照** [best-practice-examples/](best-practice-examples/) 中的代码结构和模式
3. 对于单环境：生成 `integrations/env/` 包含 schema、getter 和导出
4. 对于多环境：为每个环境生成独立的 `integrations/{env}-env/` 目录
5. 按照代码生成指南创建 Zod schema
6. 实现带有适当错误处理的 getter 函数
7. 创建桶导出以实现干净的导入
8. 在应用程序中使用生成的代码

## 使用方法

此技能提供文档和示例。按照参考指南中的步骤操作：

- [单环境代码生成指南](references/single-env-guide.md) - 单环境代码生成的详细规则
- [多环境代码生成指南](references/multi-env-guide.md) - 多环境代码生成的详细规则
- [.env.example 模板](references/.env.example.template) - .env 文件的模板
- [最佳实践示例](best-practice-examples/) - **必须严格参照的**单环境和多环境代码示例

**重要：** 实现时必须严格遵循 best-practice-examples 中的代码结构、命名约定和错误处理模式。任何修改都可能破坏类型安全保证。

## 故障排除

- **缺少 .env.example**：从 references/.env.example.template 复制模板
- **未安装 Zod**：在项目中运行 `pnpm install zod`
- **类型错误**：检查代码生成指南中的正确 schema 语法
- **导入错误**：确保 index.ts 中的桶导出正确
- **偏离最佳实践**：如果遇到问题，首先确认代码结构是否严格遵循 best-practice-examples 中的模式
