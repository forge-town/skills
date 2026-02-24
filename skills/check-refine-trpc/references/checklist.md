# 迁移检查清单（页面级）

目标：在前端页面/组件中识别并列出需要从 React Query + tRPC 迁移到 Refine hooks 的使用点，并为每个项提供替换模板与优先级建议。

- 在每个页面/组件中查找并列出直接使用 `react-query` / `trpc` 的位置（文件路径 + 行号）。
- 验证是否为每个直接使用点存在等价的 `refine` hook 用法（列出替换模板）。
- 验证 `DataProvider` 已正确实现对应 `resource` 与 `trpc` endpoint 的映射（例如 `resource: 'freeBattles'` -> `trpc.freeBattles.getList/getOne/createOne` 等）。
- 检查页面 props/handlers 是否依赖于 react-query 的内部 API（例如 `queryClient.invalidateQueries`），并给出 `refine` 的替代方法（例如 `useRefresh`, `useInvalidate` 或 `DataProvider` 返回的策略）。

替换优先级建议：

- 高：直接在组件中使用 `trpcClient.X.useQuery` 或 `useQuery` 的位置，应优先迁移到 `useOne`/`useList`/`useCreate` 等 refine hooks。
- 中：依赖 `queryClient.invalidateQueries` 的逻辑，需评估是否使用 `refine` 的 `useRefresh` 或通过 DataProvider 在变更后返回合适的策略。
- 低：仅使用 react-query 作为缓存层且无 trpc 直接调用的情况，可视为可选迁移，需按团队策略决定。

注意事项：

- 迁移过程中优先保证行为等价：保留 pagination/filter 映射逻辑，确保 `offset/limit` 与 `currentPage/pageSize` 的一致性。
- 对于复杂自定义查询（非标准 CRUD），建议保持 trpc 原有调用，或在 DataProvider 中封装成 `custom` 方法并在页面中使用 `useCustom`（refine 的自定义 hook）或直接调用 DataProvider。
