---
name: check-refine-trpc
description: 检查项目中 trpc 与 refine 集成的数据提供器（DataProvider）实现是否符合 refine 的使用规范（分页、过滤、类型校验、错误处理、接口契约等），并提供检测规则与可选自动修复建议。
---

# refine + trpc 使用检查 Skill

## 任务目标

本 Skill 用于在代码库中识别并检查使用 `refine` 的 DataProvider（或类似适配器）与后端 `trpc` 调用之间的常见不一致与反模式。主要检测点：

- `getList` 的分页与偏移转换是否正确（`currentPage`/`pageSize` → `offset`/`limit`），以及 `total` 的处理是否合理。
- 过滤器（filters）字段名是否与后端 trpc 接口预期一致（例如 `search` vs `searchQuery`、`q` 等）。
- 是否对外部输入（id、variables、meta）使用 `zod` 或等价的校验/解析。
- `getOne` 是否对 `id` 做类型解析（例如 `z.string().parse(id)`）。
- `create`/`update` 的 `variables` 是否被验证并传递给 trpc mutation。
- 自定义 `custom` 路由是否被正确路由到 trpc 并且 method 校验正确。
- 错误返回（HttpError）是否使用统一格式并包含有意义的 statusCode/message。
- 返回结果的类型是否满足 `refine` 的 `GetListResponse` / `GetOneResponse` 结构（`data`、`total` 等）。

## 触发条件

当仓库中存在可能的 DataProvider 文件（例如路径匹配 `**/integrations/refine/**` 或 `**/dataProvider*.ts`）时，本 Skill 会被触发执行检查。

典型触发语句示例：

- "检查 refine dataProvider 与 trpc 的契约"
- "refine trpc 集成检测"

## Refine 要点总结（与 DataProvider 相关）

- `Refine` 通过 `DataProvider` 抽象后端接口：常见方法包括 `getList`, `getOne`, `create`, `update`, `deleteOne`, `custom`。
- `GetListParams` 常包含 `pagination`（`currentPage`, `pageSize`）、`filters`（数组 `{ field, operator, value }`）、`sorters`、`meta`（自定义参数）。
- `GetListResponse` 通常应包含 `data: TData[]`；若支持分页还应提供 `total: number`（或按 infinite-scroll 约定返回“伪 total”）。
- `getOne` 接收 `id`，`create`/`update` 接收 `variables`，`custom` 接收 `{ url, method, query }`，这些参数需要在 DataProvider 内被映射/验证后传递到后端客户端（如 `trpc`）。
- Refine 不强制后端实现细节（page/size 或 offset/limit），但前后端需要建立一致的映射策略：常见做法是将 `currentPage/pageSize` 转换为 `offset/limit` 或直接传 `page/size`。
- 过滤器需映射到后端期望的查询参数（例如前端 `search` 可能对应后端 `q` 或 `searchQuery`）。
- `meta` 用于传递额外上下文（例如 `variables.include`），使用前应做白名单或 `zod` 校验以防注入不安全值。

参考文档: https://refine.dev/core/docs

## 检查项（规则）

1. `getList` 分页与 total
   - 要求：如果前端传入 `pagination`（`currentPage`, `pageSize`），应明确将其转换为后端 `offset`/`limit`，或直接传递 `page`/`size` 给后端；代码里不得忽略 `pagination`。
   - total 处理：如果后端返回 `total`，应直接使用；若后端只返回 items 则允许使用“伪 total”以支持无限滚动（当 items.length === pageSize 时将 total 设为 offset+pageSize+1），但需有注释并保持一致性。若伪造 total，Skill 会标注并建议后端返回真实 total 优先。

2. 过滤器字段匹配
   - 要求：检查 `filters?.find(...)` 使用的 `field` 是否与调用的 trpc 接口参数一致（例如 `search`、`searchQuery`、`q` 等）。若不一致，建议统一前后端字段或做映射。

3. 输入验证
   - 要求：对从 refine 传入的 `id`, `variables`, `meta` 等使用 `zod`（或明确 typeof 检查）进行解析。示例：`z.string().parse(id)` 或 `z.object({...}).parse(variables)`。

4. include / meta 的安全使用
   - 要求：当使用 `meta.variables.include` 传递额外字段时，必须对其结构进行解析/白名单检查（例如使用 `z.enum([...]).array().optional()`）。

5. getOne / custom / create / update
   - `getOne`：id 必须被解析并用于 trpc 查询。
   - `custom`：当 `url` 和 `method` 被使用时，需显式转发到对应 trpc 路由，且对 `query` 参数进行解析。
   - `create`/`update`：变量用 `zod` 校验，mutation 返回后适配 `CreateResponse` / `UpdateResponse` 的 `data` 字段。

6. 错误处理
   - 要求：统一使用一个 `httpError(statusCode, message)` 的构造或等价对象，并在不支持的 resource 或方法时返回合适的状态码（400 / 404 / 405）。

7. 类型与返回格式
   - 要求：所有 `getList` 返回对象必须包含 `data: TData[]`，并在适用时包含 `total: number`，类型应兼容 `GetListResponse<TData>`。

## 自动修复建议（可选）

- 分页参数映射：当检测到 `pagination` 未被使用但 trpc 接口接收 `offset/limit` 時，自动建议或生成转换代码片段。
- filters 字段映射：当发现 `search` 与 `searchQuery` 不一致时，建议将前端使用字段与后端映射表统一或在 dataProvider 中添加映射逻辑。
- 添加 zod 校验：对于 `getOne/getList/create/update` 未做 zod 校验的情况，建议插入 `z.object(...).parse(...)` 的模板。
- total 处理：若后端返回 total 字段，将其替换伪 total；若伪 total 被使用，添加注释并标注为 TODO：后端补 total。

示例自动修复片段（分页转换）：

```ts
const { currentPage = 1, pageSize = 10 } = pagination || {};
const offset = (currentPage - 1) * pageSize;
const limit = pageSize;
// 调用 trpc
await trpcClient.some.getList.query({ offset, limit });
```

示例 zod 包装（variables）:

```ts
const payload = z
  .object({ title: z.string(), codeLanguageId: z.string() })
  .parse(variables);
await trpcClient.freeBattles.createOne.mutate(payload);
```

## 文件与匹配模式

建议扫描路径：

- `**/integrations/refine/**`
- `**/dataProvider*.ts` 或 `**/*dataProvider*.ts`（不区分大小写）
- 可选：`apps/**/src/**/integrations/refine/**`

匹配到的文件应逐一解析 AST（优先）或基于简单文本/正则检查。

## 报告输出格式

生成的检查报告应包含：

- 问题摘要（总数/严重度分类）
- 每个问题的文件路径、行号（或附近代码段）、说明与建议修复
- 可选自动修复补丁（如果启用自动修复）

示例报告项：

- 文件: apps/web/src/integrations/refine/dataProvider.ts
  - 问题: `getList` 未使用 `pagination` 的 currentPage/pageSize 转换为 offset/limit
  - 严重度: 中
  - 建议: 添加偏移计算并传递 `offset`/`limit` 给 trpc

## 示例参考（基于仓库中的 dataProvider.ts）

- 该仓库中的 `apps/web/src/integrations/refine/dataProvider.ts` 为本 Skill 的典型检查目标，Skill 会核查如下示例项：
  - `case ResourceTypeEnum.battleLists` 中，检查 `pagination` → `offset/limit` 转换、`searchQuery` 字段是否一致、以及 `total` 的伪造策略是否合规。
  - `case ResourceTypeEnum.freeBattles` 中，检查 `meta.variables.include` 是否被 `z.object(...).parse(variables)` 安全解析。

## 如何在 CI/本地运行（建议）

- 作为本地脚本：实现检查器后可以通过 `node scripts/check-refine-trpc.js` 运行并输出 JSON 报告。
- 作为 GitHub Action：当 PR 打开或修改 `integrations/refine` 路径时触发并注释检测结果。

## 前端页面使用检查（替换 React Query + tRPC）

目标：识别前端页面/组件中直接使用 `react-query` / `@tanstack/react-query` 或直接调用 `trpc` 客户端的模式，并建议或自动替换为 `refine` 的 hooks（例如 `useList`, `useOne`, `useCreate`, `useUpdate`）。

检测项：

- 检查页面或组件是否导入 `useQuery`, `useMutation`, `useInfiniteQuery`（来自 `react-query` / `@tanstack/react-query`）或直接使用 `trpc` 客户端的 `useQuery`/`useMutation` hooks（例如 `trpc.xyz.useQuery`）。
- 检查是否存在直接调用 `trpcClient.someEndpoint.query(...)` 或 `trpcClient.someEndpoint.useQuery(...)` 的代码。
- 检查组件是否直接处理 loading/error 状态而不是使用 refine 的 hooks 提供的抽象（`isLoading`, `error` 等为通用，但 refine 会自动在 UI 层更好集成）。
- 检查页面是否在 `Refine` 根组件中为对应资源注册（resources 列表包含资源名称与路径）。

替换建议（示例）：

1. 单项查询

- 之前（React Query + tRPC）:

```ts
const { data, isLoading } = trpcClient.freeBattles.getOne.useQuery({
  battleId: "1",
});
```

- 推荐（Refine）:

```ts
const { data, isLoading } = useOne({ resource: "freeBattles", id: "1" });
```

2. 列表查询（分页/过滤）

- 之前：

```ts
const { data, isLoading } = trpcClient.freeBattles.getList.useQuery({
  offset,
  limit,
  searchQuery,
});
```

- 推荐：

```ts
const { data, isLoading, total } = useList({
  resource: "freeBattles",
  pagination: { current: currentPage, pageSize },
  filters: [{ field: "searchQuery", operator: "contains", value: searchQuery }],
});
```

3. Mutation（创建/更新）

- 之前：

```ts
const mutation = trpcClient.freeBattles.createOne.useMutation();
mutation.mutate(payload);
```

- 推荐：

```ts
const { mutate } = useCreate({ resource: "freeBattles" });
mutate(payload);
```

迁移检查清单（页面级）：详见 [references/checklist.md](references/checklist.md)

检测实现建议（技术细节）：

- 首选用 AST（TypeScript parser / ts-morph / babel）检测导入和 Hook 调用；次选基于正则的快速扫描。推荐规则示例正则：
  - `import\s+\{[^}]*useQuery[^}]*\}`
  - `from\s+['\"](@tanstack/react-query|react-query)['\"]`
  - `trpcClient\.[a-zA-Z0-9_]+\.(useQuery|useMutation|query|mutate)`
- 当启用自动修复时，生成 codemod（jscodeshift / ts-morph）替换导入和 Hook 调用，并插入 `useList/useOne` 等 `refine` hook 的模板代码，同时保留原有变量映射（如 id -> id, offset/limit -> pagination）。

示例报告输出（页面检测）：

- 文件: `src/pages/BattleList.tsx`
  - 问题: 使用 `trpcClient.freeBattles.getList.useQuery` (line 34)
  - 建议: 将查询替换为 `useList({ resource: 'freeBattles', ... })` 并移除对 `trpcClient` 的直接依赖

注意：refine 与 trpc 集成的目标是让页面层专注于资源声明与 UI，数据层由 DataProvider 负责细节。Skill 的页面检查重点在识别并报告需要上移到 DataProvider 或迁移到 refine hook 的代码位置。

## 限制与扩展

- 本 Skill 仅负责静态检测（AST / 文本匹配）；无法在运行时验证后端实际行为（例如后端是否真实返回 total）。建议配合集成测试或契约测试使用。
- 可扩展：新增规则以检测 `DataProvider` 其它方法（`deleteOne` / `getApiUrl` 等）与 refine 的契合度。

## 注意事项

- 保持规则保守且可操作：尽量提出可直接修改的修复建议或补丁片段。
- 对可能存在多种实现风格的情况（例如后端直接支持 page/size vs offset/limit），Skill 应检测并提示而非强制替换。
