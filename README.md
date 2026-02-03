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
| [skill-creator](skills/skill-creator) | 创建有效技能的中文指南。当用户想要创建一个新技能（或更新现有技能）来扩展 AI 的能力时，应使用此技能，包括专门知识、工作流程或工具集成。生成的新技能应使用中文描述。 |
| [store-best-practice](skills/store-best-practice) | 使用 Zustand 或类似状态管理库生成最佳实践的 store 实现。当您需要创建可扩展、类型安全的 store 时使用，包括适当的 slice 模式和 provider 设置。 |
| [zod-env-integration](skills/zod-env-integration) | 从 .env.example 文件生成基于 Zod 的环境变量管理代码。当您需要创建类型安全的 env 管理、标准化 env 处理或生成 env 模式时使用。 |

## 许可证

[MIT](LICENSE.md)
