# Forge Town

基于开发实践和实际使用情况的 [Agent Skills](https://agentskills.io/home) 集合。

## 描述

本项目提供了一套针对我们开发工作流程定制的agent skills，专注于构建实用工具和最佳实践。

> [!IMPORTANT]
> 这是一个概念验证项目，会不定期反复迭代。

## 安装

```bash
pnpx skills add forge-town/skills
```

## 技能

| 技能 | 描述 |
|-------|-------------|
| [dao-best-practices](skills/dao-best-practices) | 用于规范化DAO文件，确保遵循Drizzle ORM最佳实践，包括文件结构、方法命名、类型安全和性能优化。当需要重构或创建DAO文件以符合项目标准时使用。 |
| [page-generator](skills/page-generator) | 基于标准化解剖学规范（Anatomy）生成前端页面结构；主动询问用户选择生成模式（无监督/有监督），支持自动生成 Wrapper、Content 和 Optional Store 模块 |
| [service-best-practices](skills/service-best-practices) | 帮助开发者根据项目指南编写 Services，以 tRPC + Service + DAO 架构的最佳实践。提供 Service 结构、依赖注入、错误处理、代码示例、模板、样板代码生成和最佳实践验证的指导。在创建或重构代码库中的 Service 文件时使用。 |
| [store-best-practice](skills/store-best-practice) | 使用 Zustand 或类似状态管理库生成最佳实践的 store 实现。当您需要创建可扩展、类型安全的 store 时使用，包括适当的 slice 模式和 provider 设置。 |
| [zod-env-integration](skills/zod-env-integration) | 从 .env.example 文件生成基于 Zod 的环境变量管理代码。当您需要创建类型安全的 env 管理、标准化 env 处理或生成 env 模式时使用。 |
| [db-table-naming](skills/db-table-naming) | 用于验证并自动修正数据库与数据表名的命名规范，确保符合团队约定的小写字母+下划线格式，支持批量检查与修复。当需要规范化数据库或数据表命名时使用。 |
| [barrel-export](skills/barrel-export) | 用于自动生成、优化、修复和检查项目中的桶导出文件，确保所有 `index.ts`/`index.js` 遵循统一的导出规范，提升模块导入的一致性与可维护性。 |
| [classname-refactor](skills/classname-refactor/) | 自动识别并转换代码中 className 属性的模板字符串为 `cn` 函数调用，提升样式代码的可维护性与可读性。在需要重构 React 组件样式写法时使用。 |

## 许可证

[MIT](LICENSE.md)
