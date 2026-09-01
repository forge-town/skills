# Daedalus 代码最佳实践同步设计

## 背景

`/Users/amin/projects/daedalus/package.json` 是当前正式项目的工具链事实来源。它定义了 Bun 1.3.11、Node 20+、Turbo workspace、Oxfmt、Oxlint、TypeScript、Vitest、质量门禁和循环依赖检查。源码进一步展示了服务、DAO、Repository、Schema、Store、错误处理和测试的实际组织方式。

Forge Town 的 Skill 文档此前主要描述通用做法，部分内容与 Daedalus 当前实现不一致，尤其是 Service 工厂/上下文分层、neverthrow 错误流、Zod 类型派生、Oxfmt/Oxlint 约束和 workspace 级质量验证。

## 目标

- 以 Daedalus 当前 package manifest、lint/format/Turbo 配置和源码为准，修订现有代码写法最佳实践。
- 让各 Skill 的规则、正例、checklist 和验证命令与正式项目实际可执行的命令一致。
- 保留 `forge_` namespace 与 `description < 150` 的已完成约束。
- 不把 Daedalus 的业务路径、密钥或数据库配置复制进 Skill；只提炼可迁移的工程规则。

## 事实基线

- 包管理：`bun@1.3.11`，运行时 `node >=20`，依赖通过 `apps/*` 和 `packages/*` workspace 管理。
- 质量命令：根目录 `format:check`、`lint`、`check-types`、`test`、`quality`、`knip`、`check-circular`；workspace 统一提供 `check-types`、`lint`、`test`、`quality`。
- 格式：Oxfmt 2 空格、双引号、分号和尾逗号。
- 静态约束：Oxlint 禁止 `any`、重复导入、`var`、不必要的可变变量，并要求一致的 type-only import/export；Puck 插件进一步约束 no-let、no-try、no-use-effect、严格事件处理器和方法模块结构。
- 运行时错误：跨边界 Promise 使用 `neverthrow` 的 `Result`、`ResultAsync`、`ok`、`err` 或对应异步构造器。
- 类型与验证：Schema 使用 Zod，业务类型使用 `z.infer` 派生；服务按 `create*Service` 工厂、context、methods/helpers 分层。
- 验证方式：Vitest 负责单元/集成测试，Turbo 负责 workspace 依赖拓扑；服务架构通过架构测试和 anatomy CLI 检查。

## 同步范围

1. 更新 DAO、Repository、Service、Schema、Store、UI、Form、错误处理、测试、barrel export、no-re-export、环境变量和代码清理相关 Skill 的标准、checklist 与示例。
2. 在各 Skill 的验证章节中使用 Daedalus 可运行命令：`bun run check-types`、`bun run lint`、`bun run test`、`bun run quality`、`bun run format:check`；需要 workspace 时说明 `turbo run` 的边界。
3. 增加一份共享的 Daedalus 工具链参考，避免每个 Skill 重复维护版本和命令；各 Skill 只引用与自身相关的规则。
4. 扩展检查器的文档契约，验证正式基线关键词、命令和禁止的旧写法不会漂移。

## 不在范围内

- 不修改 Daedalus 源码、数据库、正式规则或环境文件。
- 不把某个业务模块的具体目录结构硬编码为所有项目的强制规则。
- 不因同步规范而批量重写 Forge Skill 的示例代码，除非示例直接违反 Daedalus 明确的静态规则。

## 验证

- 先运行 Forge 自身的 `pnpm run test:skills` 和 `pnpm run check:skills`。
- 对新增或修改的参考文档执行文本契约测试，确认 Bun/Turbo/Oxfmt/Oxlint/neverthrow/Zod 和质量命令表述一致。
- 运行 `git diff --check`，检查无临时文件、凭据和 Daedalus 业务文件变更。

