# Store 最佳实践指南

本指南以 Daedalus `apps/app/src/pages/*/_store` 的当前实现为准，使用 Zustand 的 slice + Provider 模式管理页面级共享状态。

工具链与验证命令见 [Daedalus 共享基线](../../forge_skill-best-practice/references/daedalus-toolchain.md)。

## 页面 Store Anatomy

```text
<PageName>/_store/
├── index.ts
├── provider.tsx
├── <pageName>Dependencies.ts（有外部依赖时）
├── <pageName>Store.ts
├── <pageName>Store.spec.ts
└── _slices/（复杂页面可选）
    ├── index.ts
    └── <feature>Slice.ts
```

- Store 文件创建 `create<PageName>Store`，Provider 在 Wrapper 层创建并提供实例；Content 只通过 selector 消费。
- Slice 只导出状态和动作，使用 `StateCreator` 保持类型安全；复杂页面按职责拆分 slice。
- `_store/index.ts` 只做 `export *`，实现文件不从同级桶反向导入。

## 状态边界

- Store 保存跨组件共享的页面状态、资源标识和 UI 事件编排；查询结果、loading/error 由 TanStack Query/Refine 管理，不复制进 Store。
- 表单字段、脏值和校验交给 React Hook Form；Store 只接收提交后的业务动作或上下文。
- Slice 不导入 React 组件、JSX 或 Hook，不直接操作 DOM；可以调用模块级的 DataProvider、Router、i18n 或通知适配器。
- 事件动作使用 `handle{Element}{Event}`（如 `handleSearchInputChange`），并直接接收 UI 事件签名；共享流程抽成私有函数，不在组件里主动调用另一个 `handle*`。
- 组件读取 Store 时使用颗粒化 selector（`use<PageName>Store((state) => state.field)`），避免订阅整个状态树。

## 验证

Store 测试应覆盖初始状态、每个公开动作、异步成功/失败和 Provider 边界，并使用注入依赖的 fake。完成后运行 `bun run format:check`、`bun run lint`、`bun run check-types`、`bun run test` 和 `bun run quality`。
