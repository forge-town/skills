# Daedalus 工具链与代码基线

本参考以 `/Users/amin/projects/daedalus/package.json` 及其当前源码为事实来源。需要验证代码时，先在 Daedalus 仓库根目录运行对应命令；不要把 Daedalus 的业务路径、凭据或数据库配置复制到 Skill 示例中。

## 工具链

- 包管理器：`bun@1.3.11`；运行时：Node `>=20`
- Monorepo：`apps/*` 与 `packages/*`，任务编排使用 Turbo
- 格式化：Oxfmt，统一 2 空格、双引号、分号和尾逗号
- 静态检查：Oxlint；重点避免 `any`、未使用导入、`var`、不必要的可变变量，并保持 type-only import/export
- 测试：Vitest；跨 workspace 验证由 Turbo 负责

## 统一验证命令

```bash
bun run format:check
bun run lint
bun run check-types
bun run test
bun run quality
```

仅验证某个 workspace 时使用 `bun run --cwd <workspace> <script>`；需要说明依赖拓扑时再使用 `turbo run <task>`。服务或数据层变更还应按需运行 `bun run check-circular`。

## 分层基线

- Schema 使用 `zod/v4`，业务类型由 `z.infer` 派生；Schema 文件按领域放置并通过 `index.ts` 桶导出。
- DAO 是按实体目录组织的 singleton，对外聚合 `_operations/`；普通 Operation 使用共享 `db`，事务 Operation 以显式 `WithTx` 命名并接收 `DatabaseTransaction`。
- Repository 目标规范使用 PascalCase singleton（如 `CratesRepository`），Operation 可承载跨表事务或聚合查询；外层只聚合 Operation，不直接访问表/DAO，数据库依赖下沉到 Operation/helpers。
- Service 目标规范使用 PascalCase singleton（如 `CratesService`），按 `contracts`、`methods`、`helpers` 分层；不使用 `create*Service` 工厂或连接注入，DAO 与环境依赖下沉到 helpers。
- 异步跨边界错误使用 `neverthrow` 的 `Result`/`ResultAsync`；Router 负责协议适配，Service 负责业务错误语义。
- 页面根目录包含 Wrapper、`_components/` 和 `index.ts`；页面级 Content 与组件单元共置，行为测试使用 `.spec.`。
- Zustand Store 使用 slice + Provider；Store 只保存页面级共享状态和行为编排，表单字段交给 React Hook Form。

## 证据要求

检查结果必须记录实际文件、行号、命令输出或最终渲染行为。静态扫描无法证明的内容标记 `evidence-required`，不得当作通过。
