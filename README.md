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
| [page-generator](skills/page-generator) | 基于标准化解剖学规范（Anatomy）生成前端页面结构；主动询问用户选择生成模式（无监督/有监督），支持自动生成 Wrapper、Content 和 Optional Store 模块 |
| [zod-env-integration](skills/zod-env-integration) | Generate Zod-based environment variable management code from .env.example files. Use when you need to create type-safe env management, standardize env handling, or generate env schemas. |

## License

[MIT](LICENSE.md)
