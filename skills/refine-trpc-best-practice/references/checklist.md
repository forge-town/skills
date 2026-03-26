# Refine + tRPC 数据访问规范检查清单

执行规则：**逐项勾选，若有任何一项为 ❌，必须修正后重新检查。**

---

## 检查清单

- [ ] ✅ **1. 禁止组件层直接使用 tRPC 客户端**：组件或页面文件中不得出现 `trpc.xxx.useQuery()`、`trpc.xxx.useMutation()`、`trpc.xxx.useInfiniteQuery()` 等直接调用
  - ❌ 错误示例：`const { data } = trpc.users.list.useQuery()` → 必须通过 Refine hooks
  - ✅ 正确示例：`const { data } = useList({ resource: 'users' })`

- [ ] ✅ **2. 数据查询使用对应 Refine hook**：读取数据场景必须使用 Refine 的数据查询 hook
  - `useList()` — 列表查询
  - `useOne()` — 单条查询
  - `useInfiniteList()` — 无限滚动
  - ❌ 错误示例：`@tanstack/react-query` 的 `useQuery` 直接指向 tRPC → 禁止

- [ ] ✅ **3. 数据修改使用对应 Refine hook**：写入数据场景必须使用 Refine 的数据修改 hook
  - `useCreate()` — 创建
  - `useUpdate()` — 更新
  - `useDelete()` — 删除
  - ❌ 错误示例：`trpc.users.create.useMutation()` → 必须改为 `useCreate()`

- [ ] ✅ **4. 禁止直接 import @tanstack/react-query 用于数据获取**：若使用 `@tanstack/react-query` 中的 `useQuery`/`useMutation`，必须通过 Refine 的 `useCustom`/`useCustomMutation` 封装，不得绕过 DataProvider
  - ❌ 错误示例：`import { useQuery } from '@tanstack/react-query'; useQuery(...)` → 违规
  - ✅ 例外：用于非业务数据的 UI 状态管理（如防抖 debounce 的 delay 状态）

- [ ] ✅ **5. 扩展需求走 DataProvider 而非绕过 Refine**：若 Refine 内置 hook 无法满足需求，应扩展自定义 `DataProvider` 中的方法，而非直接在组件中调用 tRPC
  - ❌ 错误示例：复杂查询直接用 `trpc.xxx` → 必须封装到 DataProvider 中
  - ✅ 正确示例：使用 `useCustom()` hook 或扩展 DataProvider 的 `custom()` 方法

---

## Bad Case 确认

- [ ] ❌ 不存在在 React 组件中直接 import 并调用 `trpc` 客户端进行数据获取的情况
- [ ] ❌ 不存在绕过 DataProvider 使用 `@tanstack/react-query` hook 直接查询 tRPC 路由的情况
- [ ] ❌ 不存在 `useMutation` 直接调用 tRPC mutation 而未通过 Refine `useCreate`/`useUpdate`/`useDelete` 的情况
