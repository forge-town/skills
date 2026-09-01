# 包装器组件规范 (Wrapper Component Template)

**文件命名**: `[PageName].tsx`
**核心职责**: 依赖注入容器 (Dependency Injection Container)。

## 生成规则
1.  **原则上严禁**包含可见 UI 元素（如 `<div>`, `<span>`, CSS 类）。Wrapper 的核心职责是依赖注入。
2.  **特殊情况允许**：如果页面需要独特的布局组件（不在路由层面处理的），可以包含必要的布局容器。
3.  **严禁**包含业务逻辑状态（如 `useState` 用于数据）。
4.  **必须**作为页面的根组件导出。

## 代码模版

### 场景 A：不需要 Store (无状态/简单页面)

```tsx
import { {{PageName}}Content } from "./_components/{{PageName}}Content";

export const {{PageName}} = () => {
  return (
    <{{PageName}}Content />
  );
};
```

### 场景 B：需要 Store (标准页面)

**关键点**：
- 必须引入生成的 Store Provider。
- 将 Content 组件包裹在 Provider 中。

```tsx
import { {{PageName}}StoreProvider } from "./_store";
import { {{PageName}}Content } from "./_components/{{PageName}}Content";

export const {{PageName}} = () => {
  return (
    <{{PageName}}StoreProvider>
      <{{PageName}}Content />
    </{{PageName}}StoreProvider>
  );
};
```

### 场景 C：需要独特布局 (特殊情况)

**适用场景**：页面需要不在路由层面处理的独特布局组件。

**关键点**：
- 仅在必要时使用，避免过度复杂化。
- 布局组件应是可复用的。
- 保持依赖注入的职责清晰。

```tsx
import { LayoutComponent } from "@/components/LayoutComponent"; // 替换为实际布局组件
import { {{PageName}}StoreProvider } from "./_store";
import { {{PageName}}Content } from "./_components/{{PageName}}Content";

export const {{PageName}} = () => {
  return (
    <LayoutComponent>
      <{{PageName}}StoreProvider>
        <{{PageName}}Content />
      </{{PageName}}StoreProvider>
    </LayoutComponent>
  );
};
```
