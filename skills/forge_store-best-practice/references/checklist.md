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

## 三、Slice 副作用与导入边界（all in zustand）

**核心立场：** Slice 是业务流程的中心。**允许**承担 async 业务流程（数据请求、路由跳转、通知）。**禁止**接入 React 渲染体系（hooks / 组件 / JSX）。

### 3.1 允许的副作用

- [ ] ✅ Slice 内可以做 async 业务流程（dataProvider 调用、await、Promise）
  - ✅ 正确示例：
    ```ts
    handleSubmitButtonClick: async () => {
      const result = await dataProvider.create({ resource, variables });
      router.navigate({ to: "/agents", params: { id: result.data.id } });
      toast.success(i18n.t("agents.created"));
      set({ showForm: false });
    }
    ```

- [ ] ✅ Slice 可以导入并调用 **module 级 singleton**（不是 hook 的版本）
  - 允许的类别：
    - 数据访问：`dataProvider`（refine）、`trpcClient` 等
    - 路由：`router`、`router.navigate()`（**不**使用 `useNavigate`）
    - 通知 / i18n：`toast` 实例、`i18n` 实例
    - 表单工厂：`createFormControl<T>()`（rhf 的 **非 hook** 工厂；**不**使用 `useForm`）
    - 任何其他模块级导出的函数或实例
  - ✅ 正确示例：
    ```ts
    import { dataProvider } from "@/integrations/refine/dataProvider";
    import { router } from "@/router";
    import { toast } from "@/components/Toast";
    import { createFormControl } from "react-hook-form";
    import i18n from "@/lib/i18n";
    ```

### 3.2 禁止的导入

- [ ] ✅ Slice 内**不**导入 React 组件、JSX、hooks
  - ❌ 错误示例：
    - `import { useState, useEffect } from "react"` → React hooks 禁止
    - `import { useNavigate } from "@tanstack/react-router"` → 必须改用 `import { router } from "@/router"`，调用 `router.navigate(...)`
    - `import { useCreate, useUpdate } from "@refinedev/core"` → 必须改用 `dataProvider.create / dataProvider.update`
    - `import { useForm } from "react-hook-form"` → 必须改用 `createFormControl`
    - `import { Button } from "@repo/ui/button"` → 组件禁止
    - JSX 表达式（`<Foo />`）禁止

- [ ] ✅ Slice 不持有 React 自有状态
  - ❌ 错误示例：在 slice 内调用 `useState`/`useReducer` → 必须改为 store 字段

### 3.3 DOM 操作

- [ ] ✅ Slice 内**不**直接操作 DOM
  - ❌ 错误示例：`document.querySelector(...)`、`window.scrollTo(...)` → 业务 DOM 副作用必须封装为模块级单例（如 `scrollManager.scrollTo(...)`）后再被 slice 调用

---

## 四、方法命名检查（行为主义命名）

**核心原则：** Store 方法名描述**触发它的 UI 元素 + 事件**，而非它实现的业务功能。命名表达"什么被点击了 / 什么发生了变化"，业务含义放在方法内部实现里。

### 4.1 命名格式

模式：`handle{Element}{Event}`，需要消歧时加前缀：`handle{Specifier}{Element}{Event}`

- [ ] ✅ 命名描述具体 UI 元素 + 事件
  - ✅ 正确示例（行为主义）：
    - `handleSubmitButtonClick`
    - `handleCancelButtonClick`
    - `handleCloseButtonClick`
    - `handleSearchInputChange(query: string)`
    - `handleAgentRowClick(id: string)`
    - `handleSidebarToggleButtonClick`
    - `handleAddAgentButtonClick`
    - `handleNewPipelineMenuItemClick`
  - ❌ 错误示例（功能主义）：
    - `handleSubmitCreateDialog` → 应改为 `handleSubmitButtonClick`
    - `handleSearch` → 应改为 `handleSearchInputChange`
    - `handleSelectAgent` → 应改为 `handleAgentRowClick`
    - `handleClose` → 应改为 `handleCloseButtonClick`
    - `handleAddAgent` → 应改为 `handleAddAgentButtonClick`

- [ ] ✅ 禁止 setter 反模式（不论是否带 `handle` 前缀）
  - ❌ 错误示例：
    - `setSearch(string)` → 应改为 `handleSearchInputChange(query)`
    - `handleSetSearch(string)` → 应改为 `handleSearchInputChange(query)`
    - `setShowForm(bool)` → 应拆为各自的触发器命名，如 `handleAddAgentButtonClick`（开）和 `handleCloseButtonClick`（关）

### 4.2 事件后缀枚举

允许的事件后缀（对应原生 DOM 事件或惯用 UI 语义）：

- `Click` —— 按钮、行、菜单项等的点击
- `Change` —— 受控输入的变化（input / select / checkbox）
- `Submit` —— 表单提交
- `Focus` / `Blur`
- `KeyDown` / `KeyUp`
- `MouseEnter` / `MouseLeave`

不要造出与 DOM 事件无关的功能性后缀（如 `Click` 写成 `Pressed`、`Triggered`、`Performed`）。

### 4.3 多触发器共用逻辑

多个 UI 触发器执行相同业务逻辑时，**每个触发器各起一个 handler**，内部共享私有函数：

- ❌ 错误示例：Close 按钮和 Cancel 按钮共用 `handleCancelClose()` → 命名既不对应 Close 也不对应 Cancel，违反行为主义
- ✅ 正确示例：
  ```ts
  const closeForm = () => set({ showForm: false, editing: null });
  return {
    handleCloseButtonClick: closeForm,
    handleCancelButtonClick: closeForm,
  };
  ```

### 4.4 签名匹配 UI 事件签名

handler 的签名必须**可直接赋给**它所处理的 UI 事件 prop。**禁止在 JSX 里写 inline adapter**（如 `onChange={(e) => handleX(e.target.value)}`）。Slice 内部直接消费事件对象。

| UI 事件 | handler 签名 | 说明 |
|---|---|---|
| `onClick` | `() => void` 或 `(event: React.MouseEvent<T>) => void` | 大部分按钮无需 event，参数空即可（covariance 允许） |
| `onChange`（input/textarea/select） | `(event: React.ChangeEvent<HTMLInputElement>) => void`（按实际元素类型调整） | **必须**接 event；slice 内做 `event.target.value` 抽取 |
| `onSubmit`（form） | `(event: React.FormEvent<HTMLFormElement>) => void` | 同上 |
| `onKeyDown` / `onKeyUp` | `(event: React.KeyboardEvent<T>) => void` | 同上 |
| `onFocus` / `onBlur` | `(event: React.FocusEvent<T>) => void` | 同上 |

- ✅ 正确示例：
  ```ts
  // slice
  handleSearchInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  // impl
  handleSearchInputChange: (event) => set({ search: event.target.value }),
  // JSX 零适配层
  <Input onChange={handleSearchInputChange} />
  ```

- ❌ 错误示例（value 拆解放在组件里）：
  ```ts
  // slice 把签名变成 (string) => void
  handleSearchInputChange: (query: string) => void;
  // JSX 被迫写 inline adapter
  <Input onChange={(e) => handleSearchInputChange(e.target.value)} />
  ```

注意：Slice 可以使用 React 的**类型**（如 `React.ChangeEvent`、`React.MouseEvent`）。checklist §三.3 禁止的是导入 React **组件或 hooks**，类型不在禁止范围。

### 4.5 未使用方法清理

- [ ] ✅ 方法按需生成，不创建未被组件使用的状态或方法
  - ❌ 错误示例：生成了 `handleClear()`、`handleReset()` 但组件中没有调用 → 必须删除未使用方法

### 4.6 handle\* 方法的消费规则（只由 JSX 直接消费）

**核心原则：** `handle*` 命名表达"这是 UI 事件的反应"。所有 `handle*` 方法**必须**仅被 JSX 的事件 prop 直接消费（`onClick={handleX}`、`onChange={handleY}`、`onSubmit={handleZ}` 等）。**禁止**在组件内的 JavaScript 代码里主动调用 `handle*` 方法（包括但不限于 `useEffect` 内、其他 handler 函数体内、async 流程末尾、Promise `.then()` 回调内）。

- [ ] ✅ 所有 `handle*` 方法在源码中**仅以 `propName={handle*}` 形式**出现（或 `propName={(e) => handle*(...e)}` 在禁止 inline adapter 的 §4.4 已经排除）
  - ❌ 错误示例：
    ```tsx
    const onSubmit = async (values) => {
      await mutateAsync(values);
      handleSubmitButtonClick();  // ❌ JS 代码主动调用 handle*
    };
    ```
  - 上述错误的根本问题：`handleSubmitButtonClick` 的**真实触发器**不是按钮点击，而是"异步流程结束"。命名说谎，违反行为主义。

- [ ] ✅ 当出现"异步流程结束后需要做 UI 状态变化"的场景时，**重新设计而不是规避规则**：
  - **方案 A**：把整个流程（含异步 + 状态变化）放进 slice 的同一个 `handleXxxClick` 内（slice 承担副作用）
  - **方案 B**：在 slice 内拆出私有函数（如 `closeForm`），slice 的多个 `handle*` 各自调用它；组件里**不**调用 `closeForm`
  - **方案 C**：异步流程的 mutation hook 留在组件，组件用 `useMutation`/`mutateAsync` 的 `onSuccess` 回调；但 `onSuccess` 回调内**仍然禁止**调 `handle*`——把后续 UI 状态变化也设计成 `handle*` 之外的私有动作

- [ ] ❌ 不存在以下三类反模式：
  - 在 `onSubmit`/`onMutateSuccess` 等流程末尾调用 `handleXxxButtonClick()`
  - 在 `useEffect` 内调用 `handle*`
  - 在另一个 `handle*` 函数体内嵌套调用第二个 `handle*`（应直接共享私有函数）

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
- [ ] ❌ 不存在 Slice 内导入 React 组件、JSX、hooks（`useState`/`useEffect`/`useNavigate`/`useCreate`/`useForm` 等）的情况
- [ ] ❌ 不存在 Slice 内直接操作 DOM（`document`/`window` 直接 API 调用）的情况
- [ ] ❌ 不存在直连 Slice/Store 源文件而绕过 `_store/index.ts` 桶导出的情况
- [ ] ❌ 不存在 setter 命名模式（`setX` / `handleSetX` / `setXxx`）
- [ ] ❌ 不存在功能主义命名（如 `handleSubmit`、`handleClose`、`handleSave`、`handleSelectXxx`、`handleAddXxx`、`handleDeleteXxx`），必须改为行为主义命名（如 `handleSubmitButtonClick`）
- [ ] ❌ 不存在 JSX 内 inline adapter（如 `onChange={(e) => handleX(e.target.value)}`），slice handler 的签名必须直接匹配 UI 事件签名
- [ ] ❌ 不存在组件内 JavaScript 代码主动调用 `handle*` 方法的情况（仅 JSX 事件 prop 可消费 `handle*`）