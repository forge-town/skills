# Repository 最佳实践检查清单

使用 repository-best-practice 技能后，请确保生成的代码完全符合以下所有要求：

## 文件结构

1. [ ] 文件位于 `models/repositories/` 目录下
2. [ ] 文件名格式为 `{feature}Repository.ts`（camelCase）
3. [ ] 顶层导出格式为 `export const {Feature}Repository = { ... }`

## 输入 Schema

4. [ ] 每个写方法的输入必须对应一个 Zod Schema（`{Action}{Feature}InputSchema`）
5. [ ] 方法参数使用 `z.infer<typeof XxxInputSchema>` 类型，不得使用散参数
6. [ ] Schema 定义在 Repository 文件内部或单独的 schema 文件中

## 事务规范

7. [ ] 涉及多张表写入的方法必须使用 `db.transaction(async (tx) => { ... })`
8. [ ] 事务内调用 DAO 时必须将 `tx` 传入 DAO 方法

## 职责边界

9. [ ] Repository 方法只做写入，不做查询以构建视图
10. [ ] Repository 方法只返回关键标识（如 `{ id: number }`），不返回聚合对象
11. [ ] Repository 内不调用其他 Repository（保持扁平）
12. [ ] Repository 内不包含业务规则判断（业务判断属于 Service 层）

## 类型安全

13. [ ] 所有 DAO 调用使用 Drizzle 推断类型，不使用 `any`
14. [ ] 返回值类型明确声明（`Promise<{ id: number }>` 等）
