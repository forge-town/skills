# 页面解剖学规范（Daedalus）

本规范以 Daedalus `apps/app/src/pages` 当前页面单元为准。页面根节点是唯一的 `<PageName>/` 目录，页面内部能力按职责共置。

## 标准结构

```text
<PageName>/
├── index.ts
├── <PageName>.tsx                 # Wrapper：依赖、Provider、路由边界
├── <PageName>.stories.tsx         # 可选页面级 Story
├── _components/
│   ├── <PageName>Content/
│   │   ├── index.ts
│   │   ├── <PageName>Content.tsx
│   │   ├── <PageName>Content.spec.tsx
│   │   └── <PageName>Content.stories.tsx
│   └── <ComponentName>/           # 每个组件一个目录
│       ├── index.ts
│       ├── <ComponentName>.tsx
│       ├── <ComponentName>.spec.tsx
│       └── <ComponentName>.stories.tsx
├── _hooks/                        # 可选；存在时共置实现与 .spec.
├── _lib/                          # 可选纯逻辑与 .spec.
└── _store/                        # 可选；按 Store 规范提供 Provider、Store、spec
```

- `index.ts` 只导出 Wrapper；Content 和内部组件通过所属目录的桶文件访问。
- 所有行为测试使用 `.spec.`，不得使用 `.test.`；页面根 Story 不创建额外的 Story 测试文件。
- `_hooks/`、`_lib/`、`_store/` 都是可选能力，不为了满足模板而创建空目录。

## 数据流边界

- Wrapper 负责路由依赖、Store Provider 和外部适配器注入；默认不包含可见 UI。
- Content 负责页面级 UI 组合；业务组件放在 `_components/<ComponentName>/`，各自维护实现、Story 和测试。
- 查询/Mutation 的 server state 留在 Refine/TanStack Query；页面 Store 只持有跨组件状态和事件编排，表单字段交给 React Hook Form。
- 通过 `bun run check-types`、`bun run lint` 和对应 workspace 的 Vitest 验证页面单元；完整验证使用 `bun run quality`。
