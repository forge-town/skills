---
name: check-component-consistency
description: Use when 需要检测多个同类型组件（如 Button、Page）的代码实现一致性，交叉对比 Props、事件、样式、hooks 等实现层面差异，确保代码模式统一。触发词：检查组件一致性、对比组件实现、组件模式审计。
---

# Check Component Consistency

## 使用说明

1. 收集目标组件文件（同类型，如多个 Button 组件）
2. 提取各组件的**实现特征**（忽略业务逻辑）：
   - Props 接口定义（命名、类型、可选性）
   - 事件处理方式（onClick、onChange 等）
   - 样式应用方式（className、style、css-in-js）
   - Hooks 使用模式（useState、useEffect、自定义 hook）
   - 子组件/组合模式
   - 错误处理模式
   - ref 转发方式
3. 交叉对比，标记**实现不一致**的地方
4. 输出一致性报告，建议统一模式

**核心原则：** 只对比代码实现模式，不关注业务逻辑内容

## 对比维度

| 维度 | 对比内容 | 示例差异 |
|-----|---------|---------|
| **Props 定义** | 接口命名、属性类型、可选标记 | `disabled?: boolean` vs `isDisabled: boolean` |
| **事件处理** | handler 命名、参数类型、返回值 | `onClick()` vs `onClick(e: MouseEvent)` |
| **样式方案** | className 拼接、动态样式、工具函数 | `className={cn()}` vs `className={"。"}` |
| **状态管理** | useState 初始值、更新方式 | `useState(false)` vs `useState(() => false)` |
| **ref 转发** | forwardRef 使用、类型定义 | `React.forwardRef` vs 直接 `ref` prop |
| **错误边界** | Error Boundary 包裹、错误处理 | 有无 try-catch、错误上报方式 |
| **组合模式** | children 处理、子组件导出 | `children: ReactNode` vs `ReactElement` |

## 输入方式

```typescript
// 方式1：指定目录（自动发现同类型组件）
{ type: "button", directory: "src/components/buttons/" }

// 方式2：明确文件列表
{ files: [
  "src/components/Button/index.tsx",
  "src/features/Button/index.tsx",
  "src/shared/Button/index.tsx"
]}
```

## 输出报告

```markdown
## 组件一致性报告: Button (3 个实例)

### 总体一致率: 75%

### 发现的差异

#### 1. Props 命名不一致 ⚠️
- **PrimaryButton**: `disabled?: boolean`
- **IconButton**: `isDisabled: boolean` (必填)
- **建议**: 统一为 `disabled?: boolean`

#### 2. 事件处理模式不一致 ⚠️
- **PrimaryButton**: `onClick?: () => void`
- **IconButton**: `onClick?: (e: MouseEvent) => void`
- **建议**: 统一包含事件参数

#### 3. ref 转发实现不一致 ❌
- **PrimaryButton**: 使用 `React.forwardRef`
- **GhostButton**: 未转发 ref
- **建议**: 所有 Button 都支持 ref 转发

### 推荐统一模式

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost' | 'icon';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant }), className)}
        {...props}
      />
    );
  }
);
```
