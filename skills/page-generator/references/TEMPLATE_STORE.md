# 状态管理规范 (Store Template)

**目录位置**: `_store/`
**核心职责**: 局部状态管理 (Local State Management)。
**架构模式**: Zustand Store + React Context 隔离 + Slice 模式 (可选)。

**重要**: Store **仅存储 UI 相关状态**，不存储业务数据（如从后端获取的实体）。业务数据应通过查询层（如 React Query）获取。

**存储什么** ✅：
- 加载状态 (`isLoading: boolean`)
- 用户界面选择 (`selectedTab: string`, `selectedCategory: string`)
- 表单状态 (`searchQuery: string`, `filterOptions: string[]`)
- UI 模式 (`isExpanded: boolean`, `viewMode: 'grid' | 'list'`)

**不存储什么** ❌：
- 业务实体数据 (`users: User[]`, `products: Product[]`)
- 从 API 获取的完整对象
- 服务器状态（应使用 React Query/tRPC）
- 路由参数（应使用 React Router hooks）

## 文件清单与模版

### 推荐模式：Slice 模式 (适合复杂页面)

**规则**：
- 将 Store 逻辑拆分为 slice，便于模块化和测试。
- 支持依赖注入（如其他 Store）。
- 保持 Zustand 核心，但采用 RTK 风格的组织方式。
- **严格遵守**：只存储 UI 状态，业务数据通过查询层获取。
- **性能优化**：使用 `use{{PageName}}Store` 的 selector 参数避免不必要的重渲染。

#### 1. Slice 定义 (`[camelCase]Slice.ts`)

**规则**：
- 定义纯 UI 状态和相关动作。
- **禁止**：存储业务实体数据，应使用查询层获取。
- 支持依赖注入，但依赖应是其他 Store，而非业务数据。

```typescript
import { type StateCreator } from "zustand";

export interface {{PageName}}Slice {
  // UI 状态：如加载状态、选中项、表单开关等
  isLoading: boolean;
  selectedTab: string;
  // TODO: 添加更多 UI 状态字段

  // Actions
  setIsLoading: (isLoading: boolean) => void;
  setSelectedTab: (tab: string) => void;
  // TODO: 添加更多 UI 动作方法
}

export const create{{PageName}}Slice: (
  // 可选：注入依赖，如其他 Store
  deps?: { appStore?: any }
) => StateCreator<{{PageName}}Slice> = (deps) => (set, get) => ({
  // 初始化 UI 状态
  isLoading: false,
  selectedTab: 'default',

  setIsLoading: (isLoading) => set({ isLoading }),
  setSelectedTab: (tab) => set({ selectedTab: tab }),
  // TODO: 初始化更多状态和动作
});
```

#### 2. Store 定义 (`[camelCase]Store.ts`)

```typescript
import { createContext, useContext } from "react";
import { createStore } from "zustand";
import { create{{PageName}}Slice, type {{PageName}}Slice } from "./{{camelCasePageName}}Slice";

export interface {{PageName}}State extends {{PageName}}Slice {}

export type {{PageName}}Store = Mutate<StoreApi<{{PageName}}State>, []>;

export const create{{PageName}}Store = (
  // 可选：传递依赖
  deps?: { appStore?: any }
) => {
  const store = createStore<{{PageName}}State>()((set, get, api) => ({
    ...create{{PageName}}Slice(deps)(set, get, api),
  }));

  return store;
};

export const {{PageName}}StoreContext = createContext<{{PageName}}Store | null>(null);

export const use{{PageName}}Store = () => {
  const context = useContext({{PageName}}StoreContext);
  if (!context) {
    throw new Error("use{{PageName}}Store must be used within {{PageName}}StoreProvider");
  }
  return context;
};
```

#### 3. Provider 封装 (`provider.tsx`)

**规则**：
- 必须使用 `@/hooks/useInit` 确保 Store 单例。
- 支持依赖注入，通过 Props 传递给 Store。
- Hook `use{{PageName}}Store` 在 store 文件中定义。

```tsx
import { type ReactNode } from "react";
import { {{PageName}}StoreContext, create{{PageName}}Store } from "./{{camelCasePageName}}Store";
import { useInit } from "@/hooks/useInit";

interface Props {
  children: ReactNode;
  // 可选：从父组件传入依赖
  deps?: { appStore?: any };
}

export const {{PageName}}StoreProvider = ({ children, deps }: Props) => {
  // useInit 保证 createStore 只执行一次
  const store = useInit(() => create{{PageName}}Store(deps));

  return (
    <{{PageName}}StoreContext.Provider value={store}>
      {children}
    </{{PageName}}StoreContext.Provider>
  );
};
```

#### 4. 模块导出 (`index.ts`)

```typescript
export * from "./provider";
export * from "./{{camelCasePageName}}Store";
```
