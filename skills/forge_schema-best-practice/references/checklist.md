# Schema 最佳实践检查清单

执行规则：逐项勾选；任一强制项为 ❌ 时，必须修复后重新运行 Daedalus 的类型、lint 和测试命令。

## 一、目录和命名

- [ ] ✅ 共享 Schema 位于 `packages/schemas/src/<domain>/`，每个领域目录都有 `index.ts`
- [ ] ✅ 根 `src/index.ts` 通过 barrel 导出领域目录，消费者从 `@repo/schemas` 或明确的 package export 导入
- [ ] ✅ Schema 文件名为 PascalCase 的 `<Name>.schema.ts`，不使用 `schemas.ts` 或 `types.ts` 集中堆放
- [ ] ✅ Schema 常量使用 PascalCase 并以 `Schema` 结尾，推导类型使用同名概念（去掉 `Schema`）
- [ ] ✅ 每个 Schema 模块只导出一个主 Schema 常量和对应的 `z.infer` 类型；联合分支可在主 Schema 内联

## 二、Zod 写法

- [ ] ✅ 从 `zod/v4` 导入 `z`，不得从 `zod` v3 导入
- [ ] ✅ Schema 常量有紧邻的 JSDoc，且每个 field 都有说明业务含义、单位、来源或可空语义的 JSDoc
- [ ] ✅ 类型通过 `z.infer<typeof XxxSchema>` 派生，不手写重复 interface、DTO 或 `any`
- [ ] ✅ 复用已有约束时使用 `.pick()`、`.omit()`、`.partial()`、`.extend()` 或 `.merge()`，不复制字段
- [ ] ✅ 有限值使用 `z.enum()`；共享枚举值使用 `as const`
- [ ] ✅ 整数使用 Zod 4 顶层 `z.int()` / `z.int32()` 等格式，避免 `z.number().int()`
- [ ] ✅ UUID、邮箱、URL、IP、Base64 和 ISO 日期时间等格式使用顶层 API（如 `z.uuid()`、`z.email()`、`z.url()`、`z.iso.datetime()`）
- [ ] ✅ 仅在需要拒绝未知字段的 API、配置或消息边界使用 `z.strictObject()`
- [ ] ✅ 字符串、数组和数字具有与业务相符的格式、长度或范围约束；跨字段规则使用 `.superRefine()` 并定位错误路径
- [ ] ✅ `optional`、`nullable`、默认值和联合类型表达真实数据语义，不使用无约束 `z.any()`

## 三、层级边界

- [ ] ✅ tRPC procedure / Controller 使用 `.input(schema)` 和需要时的 `.output(schema)` 声明边界契约
- [ ] ✅ 路由专用输入 Schema 可以与 procedure 共置；跨包复用的领域 Schema 放在 `packages/schemas`
- [ ] ✅ Service 在外部响应或持久化边界使用 `.parse()` / `.safeParse()`，并把失败转换为项目错误类型
- [ ] ✅ DAO 只使用 Drizzle `$inferSelect` / `$inferInsert`，不定义 Zod Schema或业务视图
- [ ] ✅ Repository 不组装聚合视图；聚合数据由 Service 组合并用输出 Schema 校验

## 四、质量验证

- [ ] ✅ 已运行 `bun run check-types`
- [ ] ✅ 已运行 `bun run lint`
- [ ] ✅ 已运行 `bun run test`
- [ ] ✅ 已运行 `bun run quality` 或等价的 workspace 质量脚本
- [ ] ✅ 已运行根目录 `bun run format:check`，格式符合 Oxfmt 的 2 空格、双引号、分号和尾逗号约束

## Bad Case 确认

- [ ] ❌ 不存在 `import { z } from "zod"`、手写重复 DTO、`any` 或未约束 `z.any()`
- [ ] ❌ 不存在缺少 Schema/field JSDoc、`z.string().uuid()` / `.email()` / `.url()` / `.datetime()` 等 deprecated method
- [ ] ❌ 不存在已移除的 `z.string().ip()` / `z.string().cidr()` 或可替换的 `z.number().int()`
- [ ] ❌ 不存在 `schemas.ts` / `types.ts` 集中定义多个领域 Schema
- [ ] ❌ 不存在 DAO/Repository 导入或组装业务视图 Schema
- [ ] ❌ 不存在 API 边界绕过 Schema 解析直接传递 `unknown`
- [ ] ❌ 不存在与 `<Name>.schema.ts` 不一致的 Schema 文件名或缺失领域/root barrel
