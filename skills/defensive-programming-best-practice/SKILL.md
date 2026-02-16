---
name: defensive-programming-best-practice
description: 强制使用卫语句（Guard Clauses）和提前返回（Early Return）模式，避免深层嵌套的 if-else 结构。核心原则：尽早检查异常情况并返回或抛出异常，让主逻辑保持在最外层。
dependency:
  python: []
  system: []
---

# 防御性编程最佳实践 (Early Return / Guard Clauses)

## 任务目标
本 Skill 用于重构或编写代码时，强制执行"提前返回"（Early Return）和"卫语句"（Guard Clauses）模式，以减少代码嵌套深度，提高可读性和可维护性。

## 核心原则
1.  **Fail Fast**: 遇到错误或无效条件立即返回或抛出异常。
2.  **No Else**: 尽量避免 `else` 关键字，如果 `if` 分支中有 `return/throw`，则不需要 `else`。
3.  **Happy Path Left Aligned**: 正常的主流程代码应该保持在最左侧缩进，不被包裹在 `if` 块中。

## 触发条件
当用户涉及以下场景时触发：
- "优化代码结构"
- "减少嵌套"
- "重构 if else"
- "防御性编程"
- "代码太乱了"
- "卫语句"
- "early return"

## 最佳实践示例
参考以下目录下的示例：
- **Bad**: `bad-practice-examples/index.ts` - 深层嵌套的 if-else 结构，主逻辑被埋藏在深处。
- **Good**: `best-practice-examples/index.ts` - 使用卫语句处理异常情况，主逻辑清晰可见。

## 操作步骤
1.  **识别嵌套**: 找到多层嵌套的 `if` 语句。
2.  **反转条件**: 将 `if (valid) { ... }` 转换为 `if (!valid) return;`。
3.  **提取异常**: 将异常情况的处理逻辑提到函数顶部。
4.  **扁平化**: 将主逻辑移到函数的主层级。

## 资源索引
- [references/checklist.md](references/checklist.md): 检查清单
- [references/examples.md](references/examples.md): 详细的代码对比示例
