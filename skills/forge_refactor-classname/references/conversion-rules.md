# ClassName 转换规则

## 目录
- [核心原则](#核心原则)
- [cn 函数导入](#cn-函数导入)
- [转换规则](#转换规则)
- [不转换的场景](#不转换的场景)
- [注意事项](#注意事项)

## 核心原则

**所有模板字符串形式的 className 必须转换为调用 cn 函数**

- ❌ 错误：`className={`flex ${condition}`}`
- ✅ 正确：`className={cn("flex", condition)}`

**必须导入 cn 函数**

## cn 函数导入

### 标准导入方式

**cn 函数的标准导入路径为 `@/lib/utils`**

在文件顶部添加：

```tsx
import { cn } from "@/lib/utils";
```

### 导入位置

cn 函数的导入语句应放在文件顶部的导入区域，与其他导入语句一起。

```tsx
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
```

### 检查导入

转换后，检查文件是否已导入 cn 函数：
- 如果已导入：无需额外操作
- 如果未导入：提醒用户添加导入语句

## 转换规则

### 规则 1：静态类名 → 调用 cn 函数
```tsx
className={`flex gap-4`}
→ className={cn("flex gap-4")}
```

### 规则 2：动态变量 → 调用 cn 函数
```tsx
className={`${myClass}`}
→ className={cn(myClass)}
```

### 规则 3：静态 + 动态 → 调用 cn 函数
```tsx
className={`base ${dynamic}`}
→ className={cn("base", dynamic)}
```

### 规则 4：条件表达式 → 调用 cn 函数
```tsx
className={`base ${isActive ? 'active' : ''}`}
→ className={cn("base", isActive ? "active" : "")}
```

### 规则 5：多个变量/条件 → 调用 cn 函数
```tsx
className={`base ${a} ${b} ${cond ? 'x' : ''}`}
→ className={cn("base", a, b, cond ? "x" : "")}
```

### 规则 6：多行模板 → 调用 cn 函数
```tsx
className={`
  flex
  ${condition}
  gap-4
`}
→ className={cn("flex", condition, "gap-4")}
```

## 不转换的场景

- 纯静态字符串：`className="flex"`（不需要 cn 函数）
- 已调用 cn 函数：`className={cn("flex", condition)}`（已经正确）
- 函数调用：`className={getClass()}`（不是 className 属性问题）
- 非className 属性：`style={`color: ${color}`}`（不处理）

## 注意事项

1. **必须调用 cn 函数**：所有模板字符串形式的 className 必须转换为调用 cn 函数
2. **必须导入 cn 函数**：确保文件顶部有正确的导入语句，标准路径为 `@/lib/utils`
3. **导入位置**：导入语句应放在文件顶部的导入区域
4. **清理空格**：转换时合并多个空格为一个
5. **保留逻辑**：条件表达式和变量引用完全保留
6. **测试验证**：转换后必须进行 UI 测试
7. **版本控制**：建议在 Git 仓库中操作
