# tRPC 按需查询接口检查清单

使用 trpc-on-demand-query 规范实现接口后，请验证以下所有项目：

## Schema 设计

1. [ ] Input Schema 包含可选的 `include` 参数，使用 `z.array(z.enum([...]))` 枚举所有支持的扩展字段名
2. [ ] Input Schema 包含可选的 `fields` 参数，使用 `z.array(z.string()).optional()`
3. [ ] `include` 的枚举值与实际实现的扩展字段一一对应，无多余或缺失

## 执行流程

4. [ ] 查询处理器严格遵循三步顺序：基础查询 → include 扩展加载 → fields 字段裁剪
5. [ ] 每个 include 选项有独立的条件分支（`if (include.includes('xxx'))`），互不干扰
6. [ ] fields 裁剪在所有 include 加载完成后执行（先加载，后裁剪）
7. [ ] fields 中包含未通过 include 加载的扩展字段时，静默忽略（不抛出错误，建议记录 warning）

## 权限与安全

8. [ ] 权限敏感的扩展字段在加载前进行权限校验（如校验用户登录状态或角色）
9. [ ] 未通过权限校验时抛出明确错误（而非返回 null 或空值）
10. [ ] 不支持嵌套 include（如 `user.friends`），仅允许一级扩展字段名

## 类型安全

11. [ ] 响应的 TypeScript 类型使用完整模型（或 `Partial<T>`），不因动态 fields 裁剪而产生运行时类型谎言
12. [ ] 前端组件从 Schema 文件导入类型，不在组件中重复定义后端数据结构

## 架构约束

13. [ ] 查询处理器不直接使用 `db`，数据访问经由 Service → DAO 层
14. [ ] 本接口改造仅适用于高频或字段差异大的查询，简单接口保持原样
