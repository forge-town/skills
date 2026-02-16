# 防御性编程检查清单

## 1. 卫语句 (Guard Clauses)
- [ ] 是否在函数开头检查了所有参数的有效性？
- [ ] 是否在发现错误条件时立即 `return` 或 `throw`？
- [ ] 是否避免了将主逻辑包裹在 `if (valid) { ... }` 中？

## 2. 减少嵌套 (Reduce Nesting)
- [ ] 嵌套层级是否超过 2 层？（建议不超过 2 层）
- [ ] 是否消除了不必要的 `else` 分支？
  - *Bad*: `if (x) { return a; } else { return b; }`
  - *Good*: `if (x) return a; return b;`

## 3. 异常处理 (Error Handling)
- [ ] 是否明确抛出了具体的错误类型？
- [ ] 错误信息是否清晰描述了失败原因？

## 4. 逻辑流 (Control Flow)
- [ ] "快乐路径"（Happy Path）是否位于代码的最外层缩进？
- [ ] 是否一眼就能看清函数的主流程？
