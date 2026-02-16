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
| [barrel-export-best-practice](skills/barrel-export-best-practice) | 支持自动生成/优化/修复/检查 index 文件，确保所有 index 文件（index.ts / index.js）都遵循桶导出规范。核心原则：所有 index 文件都必须遵循桶导出规范。 |
| [check-all-items](skills/check-all-items) | 自动扫描并执行所有以best-practice结尾的技能，检查项目是否符合最佳实践。通过自动发现机制确保所有相关最佳实践都被检查，并强制执行标准化验证指令提升输出稳定性。 |
| [check-all-skills](skills/check-all-skills) | 批量检查Skill是否符合最佳实践规范；自动验证命名、前言区、结构、文件清理、依赖等维度；支持单个或批量检查；生成详细检查报告；适用于Skill开发完成后的质量验证 |
| [classname-refactor](skills/classname-refactor) | 自动检查并转换 React/Vue 文件中 className 的模板字符串为 cn 函数调用；支持递归扫描文件夹、详细报告所有 className 位置。 |
| [dao-best-practice](skills/dao-best-practice) | 用于规范化DAO文件，确保遵循Drizzle ORM最佳实践，包括文件结构、方法命名、类型安全和性能优化。当需要重构或创建DAO文件以符合项目标准时使用。 |
| [db-table-best-practice](skills/db-table-best-practice) | 数据库与数据表表名规范验证与自动修正最佳实践。适用于"数据库是否符合规范"、"表名规范"、"检查表名"、"优化表名"、"数据库命名"、"检查这个文件"、"表名符合规范吗" |
| [page-best-practice](skills/page-best-practice) | 基于标准化解剖学规范（Anatomy）生成前端页面结构；主动询问用户选择生成模式（无监督/有监督），支持自动生成 Wrapper、Content 和 Optional Store 模块。 |
| [service-best-practice](skills/service-best-practice) | 帮助开发者根据项目指南编写 Services，以 tRPC + Service + DAO 架构的最佳实践。提供 Service 结构、依赖注入、错误处理、代码示例、模板、样板代码生成和最佳实践验证的指导。在创建或重构代码库中的 Service 文件时使用。 |
| [skill-best-practice](skills/skill-best-practice) | 检查或验证 Skill 是否符合最佳实践规范，涵盖命名规范、目录结构、元数据完整性、临时文件清理和依赖格式验证，提供详细的检查清单、自动修复建议和报告模板，同时支持技能库文档完整性检查与自动修复，适用于创建或修改 Skill 后的质量验证 |
| [skill-creator](skills/skill-creator) | 创建有效技能的中文指南。当用户想要创建一个新技能（或更新现有技能）来扩展 AI 的能力时，应使用此技能，包括专门知识、工作流程或工具集成。生成的新技能应使用中文描述。 |
| [store-best-practice](skills/store-best-practice) | 使用 Zustand 或类似状态管理库生成最佳实践的 store 实现。当您需要创建可扩展、类型安全的 store 时使用，包括适当的 slice 模式和 provider 设置。 |
| [zod-env-integration](skills/zod-env-integration) | 从 .env.example 文件生成基于 Zod 的环境变量管理代码。当您需要创建类型安全的 env 管理、标准化 env 处理或生成 env 模式时使用。 |
| [svg-icon-best-practice](skills/svg-icon-best-practice) | 统一管理 React TypeScript 项目中的 SVG 图标；支持图标组件封装、命名规范、迁移指导；适用于项目图标重构、新项目图标规范制定、图标维护优化场景 |
| [remove-comments](skills/remove-comments) | 删除AI生成的注释 |
## 许可证

[MIT](LICENSE.md)
