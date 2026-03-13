# Schema 最佳实践检查清单

使用 schema-best-practice 技能后，请确保生成的 Schema 完全符合以下所有要求：

## Schema 类型识别

1. [ ] 已正确区分三种 Schema 类型：表结构 / 业务视图 / 输入
2. [ ] 业务视图 Schema 不出现在 Repository 或 DAO 层

## 命名规范

3. [ ] 表结构 Schema 命名格式：`{TableName}Schema`
4. [ ] 业务视图 Schema 命名格式：`{Feature}With{Aggregation}Schema`
5. [ ] 输入 Schema 命名格式：`{Action}{Feature}InputSchema`
6. [ ] 对应 TypeScript 类型通过 `z.infer<typeof XxxSchema>` 推导，不手写 `interface`
7. [ ] 每个 Schema 定义在独立文件中，文件名即 Schema 名（PascalCase），一个文件只导出一个 Schema 及其对应的 `z.infer<>` 类型

## 类型安全

8. [ ] 所有层的方法参数使用 `z.infer<>` 类型，不使用 `any`
9. [ ] Repository 方法参数类型为 `z.infer<typeof {Action}{Feature}InputSchema>`
10. [ ] Service 返回值通过 Business View Schema 的 `z.infer<>` 类型声明

## 层级职责

11. [ ] 输入 Schema 在 Controller 层以 `.parse()` 校验原始请求
12. [ ] Business View Schema 仅在 Service 层组装，不在 Repository 构建
13. [ ] Repository 只返回 `{ id: number }`，不返回 Business View Schema 对象
14. [ ] DAO 层使用 Drizzle 的 `$inferInsert` / `$inferSelect` 类型，**不**定义 Zod Schema（如需在 Service 层校验 DAO 返回数据，才按需定义 `{TableName}Schema`）
