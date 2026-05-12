# tRPC 按需查询接口实现完成清单

执行完毕后逐项确认：

- [ ] 已在 Input Schema 中定义 `include`（`z.array(z.enum([...]))`）和 `fields`（`z.array(z.string()).optional()`）参数
- [ ] 已实现三步顺序：基础查询 → include 扩展加载 → fields 字段裁剪（顺序不得颠倒）
- [ ] 已为权限敏感的扩展字段添加加载前权限校验，校验失败时抛出明确错误
- [ ] 已确认 fields 裁剪逻辑：未通过 include 加载的字段被静默忽略
- [ ] 已确认 TypeScript 类型使用完整模型，无因 fields 裁剪产生的运行时类型谎言
- [ ] 已通过实际调用验证 include/fields 各组合均返回预期数据
- [ ] 已确认查询处理器通过 Service → DAO 层访问数据，不直接使用 `db`
