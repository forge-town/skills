# Service 编写最佳实践指南

本指南以 Daedalus 当前的 `packages/services/src` 结构为准。Service 负责一个业务领域的编排、业务规则和错误语义，不直接构造数据库查询或处理 HTTP 协议。

涉及 Daedalus 工具链、验证命令和通用分层原则时，先阅读 [共享基线](../../forge_skill-best-practice/references/daedalus-toolchain.md)。

## 目录与模块边界

推荐的 Service 目录如下：

```text
<Feature>Service/
├── <Feature>.service.ts
├── <Feature>.service.error.ts
├── contracts.ts
├── methods/
│   ├── index.ts
│   └── <operation>/<operation>.method.ts
└── helpers/
    ├── index.ts
    └── <helper>/<helper>.helper.ts
```

- Service 入口使用 PascalCase singleton（如 `CratesService`），并导出 `type CratesService = typeof CratesService`；不再使用 `create<Feature>Service` 工厂或 `ReturnType` 工厂类型。
- Service 名称中的 `Service` 不代表必须有 `create` 业务方法；业务方法按领域动作命名，只有确实执行创建时才使用 `create`。
- `contracts.ts` 只放输入、输出和错误契约；`methods/` 放可测试的业务方法；`helpers/` 放共享纯函数或局部编排。
- 每个目录的 `index.ts` 只做相对路径 re-export；方法和 helper 的测试与实现共置，使用 `.spec.ts`。

## 依赖与数据流

```text
tRPC Router → Service → DAO（单表读写）
                    ↘ Repository（跨表事务写入）
```

- DAO、Repository、时钟或外部适配器由 `helpers/` 建立上下文或直接引用；Service 根入口不接收连接/依赖工厂参数。测试通过 helper 边界 mock 或替换适配器。
- Service 不直接从 `@repo/db`、`drizzle-orm` 或表定义构造查询。
- 单表写入调用 DAO；跨表写入调用 Repository；Repository 负责事务，Service 负责业务规则和结果组装。
- Router 负责输入协议和 tRPC 错误适配，不把 HTTP 细节泄漏到 Service。

## 返回值与错误

- 跨边界的异步失败使用 `Result` / `ResultAsync`，错误类型使用领域错误契约（如 `type` + `message`），避免裸字符串和 `any`。
- 不要在 Service 用 `try/catch` 吞掉错误或只记录日志；需要转换时在边界统一映射，保留 `cause`。
- “找不到”要使用稳定的 `null` 或显式错误契约，不能让 `undefined` 隐式穿透 API。
- 返回类型显式声明，优先复用 Schema 的 `z.infer` 或 DAO/Repository 的推断类型；不要复制数据库行接口。

## 验证

在 Daedalus 根目录运行 `bun run format:check`、`bun run lint`、`bun run check-types`、`bun run test` 和 `bun run quality`；Service 目录变更还应运行对应 workspace 的定向 Vitest 与 `bun run check-circular`。
