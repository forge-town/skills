# Try-Catch 检查完成清单

执行完毕后逐项确认（规则定义见 `error-handling-best-practice`）：

- [ ] 已扫描所有 TS/TSX 文件的原生 `try-catch` / `try-finally` 结构
- [ ] 所有原生异常处理代码已标注（文件路径 + 行号）
- [ ] 允许的 try-catch 场景已确认（第三方库包装函数、框架入口点）
- [ ] 每个违规点提供了 neverthrow 重构建议
- [ ] 已提供 [最佳实践示例](best-practice-examples/GoodExample.tsx) 供参考

**允许的 try-catch 场景（极少）：**
1. 第三方库包装函数内部（立即转换为 Result）
2. 框架/运行时要求的入口点（如 API route handler）
3. 将异常转换为 Result 的边界代码

**所有业务代码必须使用：** `Result<T, E>` / `ResultAsync<T, E>`
