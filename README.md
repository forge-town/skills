# Forge Town

A collection of [Agent Skills](https://agentskills.io/home) based on development practices and real-world usage.

## Description

This project provides a set of agent skills tailored for our development workflow, focusing on practical tools and best practices for building applications.

> [!IMPORTANT]
> This is a proof-of-concept project for generating agent skills from source documentation and keeping them in sync.

## Installation

```bash
pnpx skills add forge-town/skills
```

## Skills

| Skill | Description |
|-------|-------------|
| [dao-best-practices](skills/dao-best-practices) | 用于规范化DAO文件，确保遵循Drizzle ORM最佳实践，包括文件结构、方法命名、类型安全和性能优化。当需要重构或创建DAO文件以符合项目标准时使用。 |
| [page-generator](skills/page-generator) | 基于标准化解剖学规范（Anatomy）生成前端页面结构；主动询问用户选择生成模式（无监督/有监督），支持自动生成 Wrapper、Content 和 Optional Store 模块 |
| [service-best-practices](skills/service-best-practices) | 帮助开发者根据项目指南编写 Services，以 tRPC + Service + DAO 架构的最佳实践。提供 Service 结构、依赖注入、错误处理、代码示例、模板、样板代码生成和最佳实践验证的指导。在创建或重构代码库中的 Service 文件时使用。 |
| [zod-env-integration](skills/zod-env-integration) | Generate Zod-based environment variable management code from .env.example files. Use when you need to create type-safe env management, standardize env handling, or generate env schemas. |

## License

[MIT](LICENSE.md)
