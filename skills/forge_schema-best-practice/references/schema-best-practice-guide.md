# Schema 最佳实践指南

本指南以 Daedalus `packages/schemas` 的实际结构和 `@repo/schemas` workspace 配置为准。它约束 Zod Schema；Drizzle 表结构请遵循 `forge_db-table-best-practice`。

## 一、目录与文件结构

共享 Schema 放在 `packages/schemas/src/<domain>/` 下：

```text
packages/schemas/
├── package.json
└── src/
    ├── index.ts
    └── <domain>/
        ├── index.ts
        └── <Name>.schema.ts
```

- 每个领域目录必须有 `index.ts`，根 `src/index.ts` 再导出各领域 barrel。
- Schema 模块文件名使用 PascalCase，并以 `.schema.ts` 结尾，例如 `CrateWithArchetypeAndRepository.schema.ts`。
- 一个 Schema 模块只导出一个主 Schema 常量和对应的 `z.infer` 类型；联合分支可以在该 Schema 内联定义。
- 路由专用、不会跨包复用的输入 Schema 可以和 procedure 共置，但仍必须遵守以下导入、命名和类型规则。

## 二、导入与类型推导

统一从 `zod/v4` 导入 `z`；跨包或同包引用时，先放外部导入，再空一行放本地导入。完整可运行示例见 `best-practice-examples/UserProfile.schema.ts`。

禁止为了绕过推导而重复声明相同概念的 `interface`、手写 DTO 或 `any`。如果只需要某个 Schema 的一部分，使用 `.pick()`、`.omit()`、`.partial()` 或 `.extend()` 派生，而不是复制字段。

## 三、Schema 定义方式

- 默认使用 `z.object()`；在 API、配置或消息边界需要拒绝未知字段时使用 `z.strictObject()`。
- 使用 `z.enum(CONSTANT_VALUES)` 或 `z.enum([...])` 表达有限值；共享常量使用 `as const`。
- 通过 `.extend()`、`.merge()`、`.pick()`、`.omit()` 组合基础 Schema，保持字段约束单一来源。
- 对数组、字符串和数值添加最小长度、格式、范围等约束；需要跨字段规则时使用 `.superRefine()`，错误路径必须指向具体字段。
- 默认值、可选值、nullable 和联合类型要表达真实业务语义，不用宽泛的 `z.any()` 或无约束字符串替代。
- 面向外部输入或第三方响应使用 `.parse()` / `.safeParse()`；无法安全抛错的边界优先返回解析结果并转换为项目错误类型。

## 四、分层职责

| 层级 | Schema 责任 |
| --- | --- |
| tRPC procedure / Controller | 用 `.input(schema)` 和 `.output(schema)` 声明 API 契约；路由局部输入可内联或引用共享 Schema |
| Service | 组合领域数据并在外部/持久化边界使用 `safeParse`；不重复校验已经由 procedure 保证的输入 |
| Repository / DAO | 不构造业务视图 Schema；DAO 使用 Drizzle `$inferSelect` / `$inferInsert`，表定义交给数据库规范 Skill |
| `packages/schemas` | 保存跨边界复用的领域、输入、输出和聚合 Schema，并通过 barrel 导出 |

业务视图可以通过基础 Schema 的 `.omit()` / `.extend()` 派生，例如 `CrateWithArchetypeAndRepositorySchema`；聚合数据由 Service 组装，不由 DAO 或 Repository 负责。

## 五、验证命令

在 Daedalus workspace 中使用 Bun：

```bash
bun run check-types
bun run lint
bun run test
bun run quality
```

Schema 包自身的 `quality` 会依次执行类型检查、Oxlint 和 Vitest。格式统一使用根目录的 `bun run format:check`（Oxfmt：2 空格、双引号、分号、尾逗号）。

## 六、禁止项（Bad Case）

- 从 `"zod"` v3 导入而不是 `"zod/v4"`。
- 使用 `schemas.ts`、`types.ts` 集中堆放多个领域 Schema，或让文件名偏离 `<Name>.schema.ts`。
- 在 DAO/Repository 中定义或组装业务视图 Schema。
- 为已有 Schema 手写重复的 interface、DTO 或类型字面量。
- 在 API 边界接受 `unknown` 后不经过 Schema 解析就向 Service 或数据库传递。
- 为了通过类型检查使用 `any`、无约束 `z.any()` 或静默吞掉 `safeParse` 错误。
