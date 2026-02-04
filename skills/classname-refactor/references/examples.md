# ClassName 转换示例

## 基础示例

### 示例 1：简单静态
```tsx
// 转换前
<div className={`flex gap-4`}>Content</div>

// 转换后
<div className={cn("flex gap-4")}>Content</div>
```

### 示例 2：单一动态
```tsx
// 转换前
<div className={`${myClass}`}>Content</div>

// 转换后
<div className={cn(myClass)}>Content</div>
```

### 示例 3：混合
```tsx
// 转换前
<div className={`base ${dynamic}`}>Content</div>

// 转换后
<div className={cn("base", dynamic)}>Content</div>
```

## 条件表达式

### 示例 4：简单条件
```tsx
// 转换前
<div className={`base ${isActive ? 'active' : ''}`}>Content</div>

// 转换后
<div className={cn("base", isActive ? "active" : "")}>Content</div>
```

### 示例 5：多个条件
```tsx
// 转换前
<div className={`base ${isActive ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`}>Content</div>

// 转换后
<div className={cn("base", isActive ? "active" : "", isDisabled ? "disabled" : "")}>Content</div>
```

## 复杂场景

### 示例 6：多行模板
```tsx
// 转换前
<div className={`
  flex
  ${isActive ? 'active' : ''}
  gap-4
`}>Content</div>

// 转换后
<div className={cn("flex", isActive ? "active" : "", "gap-4")}>Content</div>
```

### 示例 7：真实场景 - 消息组件
```tsx
// 转换前
<div
  className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
>
  <div
    className={`max-w-[85%] rounded-xl p-5 shadow-md ${message.role === "user"
      ? "bg-gradient-to-br from-primary to-primary/90"
      : "bg-card border border-border"
    }`}
  >
    {message.content}
  </div>
</div>

// 转换后
<div
  className={cn(
    "flex gap-3",
    message.role === "user" ? "justify-end" : "justify-start"
  )}
>
  <div
    className={cn(
      "max-w-[85%] rounded-xl p-5 shadow-md",
      message.role === "user"
        ? "bg-gradient-to-br from-primary to-primary/90"
        : "bg-card border border-border"
    )}
  >
    {message.content}
  </div>
</div>
```

## Vue 组件

### 示例 8：Vue 模板
```vue
<!-- 转换前 -->
<template>
  <div :class="`base ${isActive ? 'active' : ''}`">Content</div>
</template>

<!-- 转换后 -->
<template>
  <div :class="cn('base', isActive ? 'active' : '')">Content</div>
</template>
```

## 常见错误

### 错误 1：忘记导入
```tsx
// ❌ 错误
<div className={cn("flex", condition)}>Content</div>

// ✅ 正确
import { cn } from "@/lib/utils";
<div className={cn("flex", condition)}>Content</div>
```

### 错误 2：变量加引号
```tsx
// ❌ 错误
<div className={cn("flex", "${condition}")}>Content</div>

// ✅ 正确
<div className={cn("flex", condition)}>Content</div>
```

### 错误 3：静态没引号
```tsx
// ❌ 错误
<div className={cn(flex, condition)}>Content</div>

// ✅ 正确
<div className={cn("flex", condition)}>Content</div>
```

### 错误 4：条件不完整
```tsx
// ❌ 错误
<div className={cn("flex", isActive ? "active")}>Content</div>

// ✅ 正确
<div className={cn("flex", isActive ? "active" : "")}>Content</div>
```
