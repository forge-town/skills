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
| [barrel-export](skills/barrel-export) | 自动生成、优化、修复与检查 index 文件，确保所有 index.ts / index.js 遵循桶导出规范。适用于"生成 barrel export"、"修复 index"、"检查桶导出"、"优化导出结构"等场景。 |
| [better-auth-integration](skills/better-auth-integration) | 在 TanStack Start + Drizzle ORM + PostgreSQL 项目中集成 Better Auth 认证，支持邮箱登录与 GitHub/Google OAuth，分阶段执行：探索→安装→Schema→路由→验证。 |
| [check-all-items](skills/check-all-items) | 自动扫描并执行所有以best-practice结尾的技能，检查项目是否符合最佳实践。通过自动发现机制确保所有相关最佳实践都被检查，并强制执行标准化验证指令提升输出稳定性。 |
| [check-all-skills](skills/check-all-skills) | 批量检查Skill是否符合最佳实践规范；自动验证命名、前言区、结构、文件清理、依赖等维度；支持单个或批量检查；生成详细检查报告；适用于Skill开发完成后的质量验证 |
| [check-refine-trpc](skills/check-refine-trpc) | 检查 React 组件是否违规直接调用 tRPC，强制所有数据请求必须通过 Refine 数据层（useList/useOne 等）封装。适用于代码审查、PR Review 等场景，触发词：检查 tRPC 使用、检查 Refine 规范。 |
| [check-svg](skills/check-svg) | 检查项目中 SVG 的使用是否符合最佳实践：SVG 必须封装为独立 React 组件（.tsx）并通过 import 使用，禁止在业务组件中内联 SVG 代码。适用于代码审查与 SVG 规范化场景。 |
| [check-try-catch](skills/check-try-catch) | 代码审查指南，识别并修复反模式的 try/catch 用法：包括空 catch 块与纯 console.log 捕获问题。适用于"检查 try catch"、"修复错误处理"、"审查异常捕获规范"等场景。 |
| [classname-refactor](skills/classname-refactor) | 自动检查并转换 React/Vue 文件中 className 的模板字符串为 cn 函数调用；支持递归扫描文件夹、详细报告所有 className 位置。 |
| [dao-best-practice](skills/dao-best-practice) | 用于规范化DAO文件，确保遵循Drizzle ORM最佳实践，包括文件结构、方法命名、类型安全和性能优化。当需要重构或创建DAO文件以符合项目标准时使用。完成后强制评估是否需要创建对应的 Repository 层以封装跨表事务。 |
| [db-table-best-practice](skills/db-table-best-practice) | 数据库与数据表表名规范验证与自动修正最佳实践。适用于"数据库是否符合规范"、"表名规范"、"检查表名"、"优化表名"、"数据库命名"、"检查这个文件"、"表名符合规范吗" |
| [form-best-practice](skills/form-best-practice) | 使用 react-hook-form 管理所有表单状态，结合 shadcn/ui Form 组件与 Zod 校验，禁止使用 useState 或 zustand 直接管理表单字段，实现表单与全局状态的"两棵树"隔离模型。 |
| [generate-preview](skills/generate-preview) | 接收 React 组件文件，输出结构化描述的 .json 和可视化目录树的 .md 预览文档，用于组件拆分前的结构分析与规划。适用于"预览组件结构"、"拆分前分析"、"生成组件文档"等场景。 |
| [implement-split](skills/implement-split) | 基于 generate-preview 输出的预览文档和最佳实践，实际执行组件拆分，生成符合规范的子组件文件，优先从 store 获取数据避免 props 透传。适用于"拆分组件"、"重构大组件"等场景。 |
| [one-component-per-file-best-practice](skills/one-component-per-file-best-practice) | 检查并修复 React/Vue 组件文件，确保每个文件只导出一个主组件（一文件一组件原则）。当发现或被告知某个文件包含多个组件定义时使用，触发短语包括："一个文件一个组件"、"拆分组件文件"、"检查组件是否规范"、"一文件多组件"、"组件文件违规"等。 |
| [page-best-practice](skills/page-best-practice) | 基于标准化解剖学规范（Anatomy）生成前端页面结构；主动询问用户选择生成模式（无监督/有监督），支持自动生成 Wrapper、Content 和 Optional Store 模块。 |
| [remove-comments](skills/remove-comments) | 识别并删除代码中 AI 生成的冗余注释，保持代码整洁。适用于"删除注释"、"清理 AI 注释"、"移除多余注释"等场景。 |
| [repository-best-practice](skills/repository-best-practice) | 为跨表事务性写操作创建 Repository 层，封装多张表的写入事务，确保原子性与数据一致性。当需要跨表写入、事务封装或创建包含业务输入 Schema 的 Repository 文件时使用。触发短语："创建repository"、"写repository" |
| [schema-best-practice](skills/schema-best-practice) | 使用 Zod Schema 替代传统 DTO，定义表结构 Schema 与业务视图 Schema，支持类型推导、运行时校验与前后端契约共享。适用于 Service、Repository、Controller 各层的数据结构规范化。 |
| [service-best-practice](skills/service-best-practice) | 帮助开发者根据项目指南编写 Services，以 tRPC + Service + DAO 架构的最佳实践。提供 Service 结构、依赖注入、错误处理、代码示例、模板、样板代码生成和最佳实践验证的指导。在创建或重构代码库中的 Service 文件时使用。 |
| [skill-best-practice](skills/skill-best-practice) | 检查或验证 Skill 是否符合最佳实践规范，涵盖命名规范、目录结构、元数据完整性、临时文件清理和依赖格式验证，提供详细的检查清单、自动修复建议和报告模板，同时支持技能库文档完整性检查与自动修复，适用于创建或修改 Skill 后的质量验证 |
| [skill-creator](skills/skill-creator) | 创建有效技能的中文指南。当用户想要创建一个新技能（或更新现有技能）来扩展 AI 的能力时，应使用此技能，包括专门知识、工作流程或工具集成。生成的新技能应使用中文描述。 |
| [storybook-best-practice](skills/storybook-best-practice) | 为给定的 React 组件生成符合规范的 Storybook stories 文件。当用户需要为组件创建 Storybook stories、展示组件用法或生成组件文档时使用。触发短语包括："为这个组件创建stories"、"生成storybook"、"写storybook"等。 |
| [store-best-practice](skills/store-best-practice) | 使用 Zustand 或类似状态管理库生成最佳实践的 store 实现。当您需要创建可扩展、类型安全的 store 时使用，包括适当的 slice 模式和 provider 设置。 |
| [svg-icon-best-practice](skills/svg-icon-best-practice) | 统一管理 React TypeScript 项目中的 SVG 图标；支持图标组件封装、命名规范、迁移指导；适用于项目图标重构、新项目图标规范制定、图标维护优化场景 |
| [trpc-on-demand-query](skills/trpc-on-demand-query) | 在不引入 GraphQL 的前提下，为 tRPC 接口添加 include（按需加载关联字段）和 fields（响应字段裁剪）参数，实现接口的选择性查询能力，降低过量数据传输、解析成本与前端类型维护难度。 |
| [use-store-not-props-best-practice](skills/use-store-not-props-best-practice) | 审查并重构 React 组件，将 props 透传替换为直接从 Zustand Store 获取数据，减少组件间耦合。适用于"减少 props 透传"、"改用 store 获取"、"组件重构优化"等触发场景。 |
| [zod-env-integration](skills/zod-env-integration) | 从 .env.example 自动生成基于 Zod 的环境变量类型安全管理代码，支持运行时校验与 TypeScript 类型推导。适用于"新建 env 管理"、"规范化环境变量"、"生成 zod env schema"等场景。 |

## 许可证

[MIT](LICENSE.md)
