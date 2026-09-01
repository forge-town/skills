# DAO 编写最佳实践指南

本指南以 Daedalus `packages/models/src/daos` 的当前结构为准。DAO 是 singleton 数据访问对象，负责单表持久化，不承载跨表业务编排或 API 视图组装。

涉及工具链与验证命令时，先阅读 [Daedalus 共享基线](../../forge_skill-best-practice/references/daedalus-toolchain.md)。

## 目录与聚合

```text
daos/<feature>Dao/
├── <feature>.dao.ts
├── index.ts
└── _operations/
    ├── index.ts
    └── <operation>/<operation>.operation.ts
```

- 聚合文件命名为 `<feature>.dao.ts`，导出 `const <feature>Dao` 和 `type <Feature>Dao = typeof <feature>Dao`；不导出 `create<Feature>Dao` 工厂。
- 每个公开能力拆成 `_operations/<operation>/`，实现、`.operation.spec.ts` 与 `index.ts` 共置。
- DAO `index.ts` 和 `_operations/index.ts` 只做相对路径 re-export，不包含查询或业务逻辑。

## 类型与查询

- 行类型使用表的 `typeof table.$inferSelect`，插入类型使用 `typeof table.$inferInsert`；不要复制表字段定义，也不要用 `any`。
- 普通 Operation 从 `@repo/db` 使用共享 `db`；事务 Operation 使用显式 `WithTx` 命名并接收 `DatabaseTransaction`，不把事务参数做成可选值。
- 单条查询明确返回 `Promise<Row | null>`，多条查询返回 `Promise<Row[]>`；创建/更新按实际契约返回记录或 `null`，删除返回稳定结果。
- JSON 列通过表定义的 `$type<T>()` 保持类型安全，不在 DAO 中手写 `parseRow`/`mapRow` 解析器。

## 事务边界与错误

- 单表 DAO 不调用 `db.transaction()`，也不调用其他 DAO。
- 跨表写入下沉到 Repository；Repository 将同一个 `DatabaseTransaction` 传给 DAO 的 `WithTx` Operation。
- 不在 DAO 内捕获、吞掉或翻译数据库错误；保留原始错误，让上层 Service/Repository 统一处理。

## 验证

为每个 Operation 编写 `.operation.spec.ts`，使用 fake Database 或 query builder mock 验证查询与返回契约；完成后运行 `bun run format:check`、`bun run lint`、`bun run check-types`、`bun run test` 和 `bun run quality`。
