# Refine tRPC 检查完成清单

执行完毕后逐项确认（规则定义见 `refine-trpc-best-practice`）：

- [ ] 已扫描所有 React 组件/页面文件（`.tsx`、`.jsx`）
- [ ] 违规的直接 tRPC 调用已识别（文件路径 + 行号）
- [ ] 违规的 `@tanstack/react-query` 绕过 DataProvider 用法已识别
- [ ] 每个违规点提供了迁移至 Refine hooks / DataProvider 的具体建议
