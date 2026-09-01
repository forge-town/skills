---
name: forge_check-refine-trpc
description: Use when 需要审查或重构 tRPC 路由代码，确保路由结构、类型定义、输入验证和错误处理均符合项目最佳实践；适用于代码审查和路由重构阶段。触发词：检查trpc代码、重构路由写法、优化tRPC格式。
---

# 禁止组件层直接使用 tRPC

## 使用说明

1. 读取 `forge_refine-trpc-best-practice` 的 [规范标准](../forge_refine-trpc-best-practice/references/checklist.md) 了解禁止/允许模式
2. 扫描组件/页面文件，查找违规的 tRPC 直接调用
3. 违规示例：[bad-example.ts](references/bad-example.ts)；合规示例：[good-example.ts](references/good-example.ts)

**规则：** 组件层必须通过 Refine hooks（`useList`/`useOne`/`useCreate`/`useUpdate`）访问数据，禁止直接使用 `trpc` 客户端或 `@tanstack/react-query` hook

**修复方向：** 将 trpc 调用迁移到 `DataProvider`，组件通过 resource + refine hooks 使用
