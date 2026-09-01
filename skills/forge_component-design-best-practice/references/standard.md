# 组件边界指南

## 何时应该创建新组件

### ✅ 应该拆分的信号

| 信号 | 说明 | 示例 |
|------|------|------|
| **重复出现** | 相同的 UI 模式在多处使用 | 用户头像 + 名称的组合 |
| **独立职责** | 可以独立测试、独立理解的功能 | 日期选择器、文件上传 |
| **复杂条件渲染** | 内部有复杂的 if/else 渲染逻辑 | 根据状态显示不同内容的卡片 |
| **深层嵌套** | JSX 嵌套超过 4 层 | 表单内部的复杂结构 |
| **可复用逻辑** | 包含可复用的 state 或副作用 | useFileUpload、useModal |

### ❌ 不应该拆分的情况

| 情况 | 说明 | 应该怎么做 |
|------|------|-----------|
| **过早抽象** | 只使用一次，且没有复用可能 | 保持内联 |
| **过度拆分** | 组件只有 1-2 行，无独立意义 | 合并到父组件 |
| **仅为减少行数** | 为了拆分而拆分，破坏内聚性 | 保持内联 |

## 组件粒度原则

### 原子组件（Atomic）

最基础的构建块，无业务逻辑。

- `Button`、`Input`、`Label`
- `Card`、`Dialog`、`DropdownMenu`
- 放在 `components/ui/`

### 分子组件（Molecular）

组合原子组件，有特定功能但无业务数据。

- `UserAvatar`（Avatar + 状态指示器）
- `SearchInput`（Input + Search Icon + 清除按钮）
- `FormField`（Label + Input + Error Message）
- 放在 `components/shared/` 或 `components/composite/`

### 有机体组件（Organism）

有业务逻辑和数据。

- `UserProfileCard`（使用 user 数据）
- `ProductList`（获取并展示产品）
- 放在 `features/{feature}/components/`

## Props 设计原则

### 1. 最小化 Props

只暴露必要的配置点。

```tsx
// ❌ 过多 Props
interface ButtonProps {
  variant: "primary" | "secondary" | "danger";
  size: "sm" | "md" | "lg";
  fullWidth: boolean;
  disabled: boolean;
  loading: boolean;
  leftIcon: React.ReactNode;
  rightIcon: React.ReactNode;
  // ... 更多
}

// ✅ 简洁 Props，其他通过 className 或组合实现
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  asChild?: boolean; // 使用 Radix 的 Slot 模式
}
```

### 2. 使用 Composition 替代配置

```tsx
// ❌ 配置驱动
<Tabs
  tabs={[
    { id: "profile", label: "资料", content: <Profile /> },
    { id: "settings", label: "设置", content: <Settings /> },
  ]}
/>

// ✅ 组合驱动
<Tabs defaultValue="profile">
  <TabsList>
    <TabsTrigger value="profile">资料</TabsTrigger>
    <TabsTrigger value="settings">设置</TabsTrigger>
  </TabsList>
  <TabsContent value="profile"><Profile /></TabsContent>
  <TabsContent value="settings"><Settings /></TabsContent>
</Tabs>
```

### 3. 正确的 HTML 属性继承

```tsx
// ✅ 继承 HTML 属性，不重复造轮子
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  // 只添加组件特有的属性
  error?: string;
}

function Input({ className, error, ...props }: InputProps) {
  return (
    <>
      <input className={cn("base-styles", className)} {...props} />
      {error && <span className="text-red-500">{error}</span>}
    </>
  );
}
```

## 命名规范

### 文件命名

- `PascalCase.tsx` - 组件文件
- `camelCase.ts` - hooks、工具函数
- `useHookName.ts` - hooks 必须以 use 开头

### 组件命名

- **UI 组件**：直接使用元素名 `Button`、`Input`、`Card`
- **业务组件**：功能 + 类型 `UserCard`、`ProductList`、`OrderForm`
- **布局组件**：`Header`、`Sidebar`、`MainContent`
- **避免**：`MyComponent`、`Component2`、`Wrapper`

## 组件结构标准

```tsx
// 1. 导入（按类型分组）
import * as React from "react";
import { cn } from "@repo/ui";
import { cva, type VariantProps } from "class-variance-authority";

// 2. 类型定义
interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

// 3. 样式变体（如果使用 cva）
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        destructive: "bg-destructive text-destructive-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
      },
    },
  }
);

// 4. 组件实现
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

// 5. 导出
export { Button, buttonVariants };
export type { ButtonProps };
```
