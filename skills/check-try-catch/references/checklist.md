# Try-Catch 检查完成清单

执行完毕后逐项确认（规则定义见 `error-handling-best-practice`）：

- [ ] 已扫描所有 JS/TS 文件的 `try-catch` 结构
- [ ] 空 catch 块已标注（文件路径 + 行号）
- [ ] 仅含 console.log/logger 的 catch 块已标注
- [ ] 每个违规点提供了具体修复建议（重新抛出、错误恢复、通知用户等）
- [ ] 已提供 [最佳实践示例](best-practice-examples/GoodExample.tsx) 供参考
