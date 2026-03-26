---
name: classname-refactor
description: Use when 需要检查或转换 React/Vue 文件中的 className 模板字符串为 cn 函数调用，支持递归扫描文件夹、详细报告所有位置。触发词：优化className写法、重构模板字符串、检查className规范。
---

# ClassName Refactor

## 使用说明

1. 扫描目标文件/文件夹，检查所有 `className` 属性（详细转换规则见 [references/conversion-rules.md](references/conversion-rules.md)）
2. 将模板字符串形式的 className 转为 `cn()` 调用，并确保文件顶部已导入 `cn`
3. 输出转换报告；示例见 [references/examples.md](references/examples.md)

**规则：** `` className={`flex ${condition}`} `` → `className={cn("flex", condition)}`；导入：`import { cn } from "@/lib/utils"`
