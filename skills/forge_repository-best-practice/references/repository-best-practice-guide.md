# Repository 最佳实践指南

本指南以 Daedalus `packages/models/src/repositories` 的当前结构为准。Repository 是聚合持久化边界，可承载跨表事务写入或需要多个表的聚合查询；它不替代 DAO，也不负责组装前端视图。

工具链和验证命令见 [Daedalus 共享基线](../../forge_skill-best-practice/references/daedalus-toolchain.md)。

## 目录与聚合

```text
repositories/<feature>Repository/
├── <feature>Repository.ts
├── <feature>Repository.spec.ts
├── index.ts
├── contracts.ts 或 <feature>Repository.types.ts
└── _operations/
    ├── index.ts
    └── <operation>/<operation>.operation.ts
```

- Repository 入口使用 PascalCase singleton（如 `CratesRepository`），并导出 `typeof` 公共类型；不再使用 `create<Feature>Repository(db)` 工厂。
- 外层 Repository 只聚合 `_operations`，不直接导入 DAO、表定义或 `drizzle-orm`。
- Operation、测试和类型契约共置；每个目录的 `index.ts` 只做相对路径 re-export。

## 事务和职责

- 当一个领域能力需要跨表事务、跨表聚合查询或稳定的持久化边界时创建 Repository；单表 CRUD 留在 DAO。
- 跨表写入必须由一个 Operation 在同一个 `db.transaction(async (tx) => ...)` 中完成，并把同一个事务执行器传给所有 DAO 操作；Database 依赖由 Operation/helpers 管理。
- Repository 不做 HTTP 适配；跨表一致性所需的状态检查可以留在同一个 Operation 中，业务规则与输入协议仍属于 Service/Schema/Router。
- Repository 返回写入所需的稳定契约（通常是 ID 或 outcome），不查询并返回完整业务视图；读路径由 Service 调 DAO 组装。
- Repository 不调用另一个 Repository，避免事务嵌套和跨域耦合。

## 类型与错误

- 输入契约优先复用 `@repo/schemas` 的 `z.infer` 类型或 Repository 自己的明确 contract；不要使用散参数或 `any`。
- 持久化错误不在 Repository 中吞掉；让 Service/Router 在边界用 `Result`/`ResultAsync` 或统一错误适配器处理。

## 验证

Repository 测试应断言事务边界、Operation 调用顺序、空输入短路和失败结果。完成后运行 `bun run format:check`、`bun run lint`、`bun run check-types`、`bun run test` 和 `bun run quality`。
