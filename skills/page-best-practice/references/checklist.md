# 页面最佳实践检查清单

执行规则：**逐项勾选，若有任何一项为 ❌，必须修正后重新检查，不得跳过输出。**

---

## 一、目录结构检查

- [ ] ✅ 每个页面是独立目录，目录名使用 PascalCase（如 `CatsPage`）
  - ❌ 错误示例：`cats-page/`、`catsPage/`、`catspage/` → 必须改为 `CatsPage/`
- [ ] ✅ 目录内包含三个必需文件：`index.ts`（桶导出）、`{PageName}.tsx`（Wrapper）、`{PageName}Content.tsx`（View）
  - ❌ 错误示例：只有一个 `CatsPage.tsx` 文件 → 必须拆分为 Wrapper + Content 两层
- [ ] ✅ 如需 Store，目录内包含 `_store/` 子目录；如不需要 Store，**不创建** `_store/` 目录
  - ❌ 错误示例：无 Store 需求的页面包含空 `_store/` 目录 → 必须删除
- [ ] ✅ `index.ts` 仅导出 Wrapper 组件，不导出 Content 组件
  - ❌ 错误示例：`export { CatsPage, CatsPageContent } from ...` → 必须改为只导出 `CatsPage`

---

## 二、Wrapper 组件检查（`{PageName}.tsx`）

- [ ] ✅ Wrapper 核心职责为依赖注入，原则上不包含可见 UI 元素（`div`、`span`、CSS 类）
  - ❌ 错误示例：Wrapper 内有 `<div className="page-container">` → 必须移到 Content 组件
- [ ] ✅ 需要 Store 时：Wrapper 包裹 `{PageName}StoreProvider`，Content 在 Provider 内
  - ❌ 错误示例：`<CatsPageContent />` 在 Provider 外渲染 → 必须移入 `<CatsPageStoreProvider>`
- [ ] ✅ 不需要 Store 时：Wrapper 直接渲染 Content，不引入任何 Store Provider
  - ❌ 错误示例：无 Store 需求但引入了空 Provider → 必须删除 Provider 包裹
- [ ] ✅ Wrapper 内严禁 `useState` 用于数据状态
  - ❌ 错误示例：`const [data, setData] = useState([])` 在 Wrapper 中 → 必须移到 Store 或 Content

---

## 三、Content（View）组件检查（`{PageName}Content.tsx`）

- [ ] ✅ Content 文件命名格式为 `{PageName}Content.tsx`（PageName 完整保留，加 `Content` 后缀）
  - ❌ 错误示例：`CatsView.tsx`、`CatsPageView.tsx` → 必须改为 `CatsPageContent.tsx`
- [ ] ✅ 需要 Store 时：通过 `use{StoreName}()` hook 读取数据，不通过 props 接受 Store 数据
  - ❌ 错误示例：`function CatsPageContent({ cats }: { cats: Cat[] })` → 必须改为内部 `const { cats } = useCatsPageStore()`
- [ ] ✅ 使用 Zustand selector（选取具体字段），不一次性订阅整个 store 对象
  - ❌ 错误示例：`const store = useCatsPageStore()` 订阅整个 store → 必须改为 `const cats = useCatsPageStore(s => s.cats)`

---

## 四、Store 目录检查（`_store/`，仅有 Store 时适用）

- [ ] ✅ `_store/index.ts` 使用 `export *` 语法统一对外暴露
  - ❌ 错误示例：`_store/index.ts` 中逐个具名导出 → 必须改为 `export * from "./catsPageStore"` 等
- [ ] ✅ Slice 文件命名格式为 `{camelCaseName}Slice.ts`，Store 文件命名格式为 `{camelCaseName}Store.ts`
  - ❌ 错误示例：`storeSlice.ts`、`catsStore/index.ts` → 必须改为 `catsPageSlice.ts`、`catsPageStore.ts`
- [ ] ✅ Slice 函数（`createXxxSlice`）内只做状态修改，禁止含异步请求或副作用
  - ❌ 错误示例：Slice 内有 `fetch("/api/cats")` → 必须移出到组件的 `useEffect` 或数据获取层

---

## 五、路由注册检查

- [ ] ✅ 页面 Wrapper 组件已在路由文件中注册（不使用未经路由的孤立页面）
  - ❌ 错误示例：创建了 `CatsPage/` 但未在 `router.tsx` 中添加对应路由 → 必须完成路由注册
- [ ] ✅ 路由中导入的是 `index.ts` 导出的 Wrapper 组件，不直接导入 Content 组件
  - ❌ 错误示例：`import { CatsPageContent } from "@/pages/CatsPage"` 用于路由 → 必须改为 `import { CatsPage } from "@/pages/CatsPage"`

---

## 六、Bad Case 确认（以下情况不得出现）

- [ ] ❌ 不存在单文件页面（所有逻辑、UI 混在一个 `.tsx` 文件）
- [ ] ❌ 不存在 Content 组件通过 props 接受 Store 数据的情况（必须用 hook 直接读取）
- [ ] ❌ 不存在 Wrapper 包含 UI 元素（`className`、`style`、HTML 标签）的情况
- [ ] ❌ 不存在 `index.ts` 同时导出 Wrapper 和 Content 的情况