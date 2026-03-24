# Schema 最佳实践检查清单

执行规则：**逐项勾选，若有任何一项为 ❌，必须修正后重新检查，不得跳过输出。**

---

## 一、Schema 类型识别检查

- [ ] ✅ 已正确识别当前 Schema 属于以下三类之一，且选型合理：
  - **表结构 Schema**（`{TableName}Schema`）：仅在 Service 层需用 Zod 显式校验单张表数据时才定义
  - **业务视图 Schema**（`{Feature}With{Aggregation}Schema`）：Service 层组装给前端的聚合 DTO
  - **输入 Schema**（`{Action}{Feature}InputSchema`）：写操作入参
  - ❌ 错误示例：给 DAO 层单独定义 Zod Schema（DAO 使用 `$inferSelect` / `$inferInsert`，不需要 Zod）
- [ ] ✅ 业务视图 Schema 不出现在 Repository 或 DAO 层的方法返回值中
  - ❌ 错误示例：`catsRepository.create()` 返回 `z.infer<typeof CatWithStatsSchema>` → 必须改为返回 `{ id: string }`

---

## 二、命名规范检查

- [ ] ✅ 表结构 Schema 命名格式：`{TableName}Schema`（TableName 为 PascalCase 单数）
  - ❌ 错误示例：`CatsSchema`（复数）→ 必须改为 `CatSchema`；`catSchema`（小写开头）→ 必须改为 `CatSchema`
- [ ] ✅ 业务视图 Schema 命名格式：`{Feature}With{Aggregation}Schema`
  - ❌ 错误示例：`CatViewSchema`、`CatResponseSchema` → 必须改为 `CatWithAbilitiesSchema`（描述聚合内容）
- [ ] ✅ 输入 Schema 命名格式：`{Action}{Feature}InputSchema`（Action 首字母大写）
  - ❌ 错误示例：`CatInputSchema`（无 Action）→ 必须改为 `CreateCatInputSchema` 或 `UpdateCatInputSchema`
- [ ] ✅ 对应 TypeScript 类型通过 `z.infer<typeof XxxSchema>` 推导，不手写 `interface` 或 `type` 字面量
  - ❌ 错误示例：`interface Cat { id: string; name: string }` → 必须改为 `type Cat = z.infer<typeof CatSchema>`
- [ ] ✅ 每个 Schema 定义在独立文件中，文件名 = Schema 名（PascalCase，如 `CatSchema.ts`），一个文件只导出一个 Schema 及其 `z.infer<>` 类型
  - ❌ 错误示例：`schemas.ts` 包含多个 Schema → 必须拆分为独立文件

---

## 三、类型安全检查

- [ ] ✅ 所有层的方法参数/返回值使用 `z.infer<>` 推导类型，不使用 `any`
  - ❌ 错误示例：`function createCat(data: any)` → 必须改为 `data: CreateCatInput`
- [ ] ✅ `z.infer<>` 对应的类型别名使用与 Schema 同名（去掉 `Schema` 后缀）
  - ❌ 错误示例：`type CatType = z.infer<typeof CatSchema>` → 必须改为 `type Cat = z.infer<typeof CatSchema>`
- [ ] ✅ Zod 从 `"zod/v4"` 导入（不从 `"zod"` v3 导入）
  - ❌ 错误示例：`import { z } from "zod"` → 必须改为 `import { z } from "zod/v4"`

---

## 四、层级职责检查

- [ ] ✅ 输入 Schema 在 Controller/Router 层以 `.parse()` 或 `.safeParse()` 校验原始请求，不在 Service 内部校验
  - ❌ 错误示例：`const input = CreateCatInputSchema.parse(data)` 在 Service 方法内部执行 → 必须上移到 Router/tRPC procedure
- [ ] ✅ 业务视图 Schema 只在 Service 层组装，不在 Repository 构建
  - ❌ 错误示例：Repository 方法内组装 `{ cat, missions }` 聚合对象 → 必须移到 Service 层
- [ ] ✅ Repository 方法只返回 `{ id: string }` 或 `{ id: number }`，不返回完整 Schema 对象
  - ❌ 错误示例：`return { id, name, skills }` → 必须改为 `return { id }`
- [ ] ✅ DAO 层不定义 Zod Schema，直接使用 Drizzle `$inferInsert` / `$inferSelect` 类型
  - ❌ 错误示例：`catsDao.ts` 中 `import { CatSchema }` 并用于方法参数 → 必须改为 `type CatRow = typeof cats.$inferSelect`

---

## 五、Bad Case 确认（以下情况不得出现）

- [ ] ❌ 不存在手写 TypeScript `interface` 作为数据传输类型（必须用 `z.infer<>`）
- [ ] ❌ 不存在同一概念有多个重复 Schema（如同时存在 `CatSchema` 和 `CatDto`）
- [ ] ❌ 不存在业务视图 Schema 被 DAO 层或 Repository 层导入的情况
