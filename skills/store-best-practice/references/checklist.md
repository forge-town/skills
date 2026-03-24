# Store 最佳实践检查清单

执行规则：**逐项勾选，若有任何一项为 ❌，必须修正后重新检查，不得跳过输出。**

---

## 一、文件结构与命名检查

- [ ] ✅ Store 文件位于页面的 `_store/` 目录下（如 `CatsPage/_store/`）
  - ❌ 错误示例：`src/stores/catStore.ts` 全局 store 文件 → 页面级 Store 必须放在页面的 `_store/` 目录
- [ ] ✅ Slice 文件命名格式为 `{camelCaseName}Slice.ts`
  - ❌ 错误示例：`slice.ts`、`CatsSlice.ts` → 必须改为 `catsPageSlice.ts`
- [ ] ✅ Store 文件命名格式为 `{camelCaseName}Store.ts`
  - ❌ 错误示例：`store.ts`、`CatsStore.ts` → 必须改为 `catsPageStore.ts`
- [ ] ✅ `_store/index.ts` 使用 `export *` 语法（不逐个具名导出）
  - ❌ 错误示例：`export { useCatsPageStore, CatsPageStoreProvider }` → 必须改为 `export * from "./catsPageStore"`

---

## 二、异步状态检查

- [ ] ✅ Store 内不包含 `loading` / `isLoading` / `error` 等异步状态字段
  - ❌ 错误示例：`isLoading: boolean` 在 store state 中 → 必须删除，异步状态由 `useQuery` / `useMutation` 管理
- [ ] ✅ Store 内不存储从 `useList` / `useQuery` 直接得到的 `data` 字段
  - ❌ 错误示例：`cats: Cat[]` 从 API 查询结果赋值进 store → 必须改为组件内直接用 `useQuery` 数据

---

## 三、Slice 纯函数检查

- [ ] ✅ `createXxxSlice` 函数内只包含同步状态修改逻辑
  - ❌ 错误示例：Slice 内有 `fetch("/api/cats").then(...)` → 必须移出到组件 `useEffect` 或数据获取层
- [ ] ✅ Slice 内不包含 DOM 操作、第三方库副作用调用
  - ❌ 错误示例：Slice 方法内调用 `toast.success("已创建")` → 必须移到组件的事件回调中
- [ ] ✅ Slice 内不导入 React 组件或 hooks
  - ❌ 错误示例：`import { useRouter } from "@tanstack/react-router"` 在 Slice 文件中 → 必须删除

---

## 四、方法命名检查

- [ ] ✅ Store 方法使用 `handle{Action}` 命名（适合组件直接调用），不使用 `set{Field}` setter 命名
  - ❌ 错误示例：`setSelectedCatId(id: string)` → 必须改为 `handleSelectCat(id: string)`
- [ ] ✅ 方法按需生成，不创建未被组件使用的状态或方法
  - ❌ 错误示例：生成了 `handleClear()`、`handleReset()` 但组件中没有调用 → 必须删除未使用方法

---

## 五、导入规范检查

- [ ] ✅ 组件只通过桶导出入口 `_store` 导入（`import { useCatsPageStore } from "./_store"`）
  - ❌ 错误示例：`import { useCatsPageStore } from "./_store/catsPageStore"` 直连源文件 → 必须改为通过桶导出入口

---

## 六、Provider 检查

- [ ] ✅ 每个 Store 有对应的 `{Name}StoreProvider` 组件
  - ❌ 错误示例：组件在 Store 未 Provider 包裹的情况下调用 `useCatsPageStore()` → 必须在 Wrapper 层添加 Provider
- [ ] ✅ Provider 在 Wrapper 组件（`{PageName}.tsx`）中使用，不在 Content 组件中
  - ❌ 错误示例：`<CatsPageStoreProvider>` 出现在 `CatsPageContent.tsx` → 必须移到 `CatsPage.tsx`

---

## 七、Bad Case 确认（以下情况不得出现）

- [ ] ❌ 不存在 `loading` / `error` 等异步状态字段在 Store 中
- [ ] ❌ 不存在 API 请求数据（`useQuery.data`）被 `set()` 进 Store 的情况
- [ ] ❌ 不存在 Slice 内含副作用（fetch、toast、DOM 操作）的情况
- [ ] ❌ 不存在直连 Slice/Store 源文件而绕过 `_store/index.ts` 桶导出的情况