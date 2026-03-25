# Service 最佳实践检查清单

执行规则：**逐项勾选，若有任何一项为 ❌，必须修正后重新检查，不得跳过输出。**

---

## 一、文件结构与导出检查

- [ ] ✅ Service 文件位于 `services/` 目录
  - ❌ 错误示例：`models/catsService.ts` → 必须移到 `services/` 目录
- [ ] ✅ 文件名格式为 `{feature}Service.ts`（camelCase，feature 以小写开头）
  - ❌ 错误示例：`CatsService.ts`、`cats-service.ts` → 必须改为 `catsService.ts`
- [ ] ✅ 顶层导出格式严格为 `export const {feature}Service = { ... }`（对象形式，非 class）
  - ❌ 错误示例：`export class CatsService { ... }` → 必须改为 `export const catsService = { ... }`
  - ⚠️ **工具函数豁免**：若文件内容为纯工具函数（URL 构建、请求体构造、Thread ID 生成等）而非 Service 对象，在满足以下**全部条件**时无需封装为对象：
    1. 文件中**不包含**任何数据库/外部 API 调用
    2. 所有函数为无副作用的纯函数或简单 `fetch` 封装
    3. 文件命名应优先考虑重命名为 `{feature}Utils.ts` 或 `{feature}Helpers.ts` 以体现职责；若历史原因保留 `Service` 后缀，须在文件顶部注释说明豁免原因

---

## 二、依赖规范检查（强制）

- [ ] ✅ Service **严禁**直接 `import { db } from "@/db"` 用于普通查询，所有数据库操作通过 DAO 实现
  - ❌ 错误示例：`const rows = await db.query.cats.findMany(...)` 出现在 Service 内 → 必须改为调用 `catsDao.getAllByUserId(...)`
  - ✅ 唯一例外：事务场景可以 `import { db } from "@/db"` 仅用于 `db.transaction(tx => ...)` 发起事务，tx 传入 DAO 的 `WithTx` 方法
- [ ] ✅ 所有数据库读写操作通过 `@/models/daos` 中的 DAO 方法调用
  - ❌ 错误示例：直接使用 `import { cats } from "@/db"` 在 Service 内构造 Drizzle 查询 → 必须下沉到 DAO

---

## 三、方法规范检查

- [ ] ✅ 所有方法名使用驼峰命名法（camelCase），语义清晰
  - ❌ 错误示例：`get_cat()`、`GetCat()` → 必须改为 `get()` 或 `getCat()`
- [ ] ✅ 每个方法返回类型明确声明为 `Promise<T>`，T 为具体类型（不用 `Promise<any>`）
  - ❌ 错误示例：`async list()` 无返回类型注解 → 必须加 `Promise<Cat[]>`
- [ ] ✅ 方法参数类型使用 `@/schemas` 中的 Zod 推导类型（如 `CreateCatInput`），不用裸 `object` 或 `any`
  - ❌ 错误示例：`create(data: object)` → 必须改为 `create(userId: string, data: CreateCatInput)`

---

## 四、类型安全检查

- [ ] ✅ 方法返回类型使用 `@/schemas` 中对应的 `z.infer<>` 推导类型（如 `Cat`、`Mission`）
  - ❌ 错误示例：`Promise<Record<string, unknown>>` → 必须改为 `Promise<Cat>`
- [ ] ✅ Service 层不使用 `any` 类型
  - ❌ 错误示例：`const result: any = await catsDao.create(...)` → 必须利用 DAO 返回类型

---

## 五、业务规则检查

- [ ] ✅ 重复创建、状态机约束、资源归属验证等业务规则在 Service 层处理，不下沉到 DAO
  - ❌ 错误示例：DAO 方法内部检查 `if (status !== "available") throw Error` → 必须移到 Service 层
- [ ] ✅ 找不到记录时返回 `null` 或抛出语义明确的 `Error`，不返回 `undefined`
  - ❌ 错误示例：`return undefined` → 必须改为 `return null` 或 `throw new Error("Cat not found")`
  - ⚠️ **例外情形**：由外部库（如 better-auth）托管的 Service（如 `userService`）若其底层 DAO 尚未对齐 `null` 语义，执行此规范前须先完成 DAO 层修正，再同步 Service 返回类型。不得在 DAO 仍返回 `undefined` 的情况下强行将 Service 返回类型改为 `null`（会产生类型不一致的隐患）
- [ ] ✅ `catch` 块不为空，不允许仅 `console.log` 而不重新抛出
  - ❌ 错误示例：`catch (e) { console.log(e) }` → 必须改为 `catch (e) { throw e }` 或包裹语义错误后重抛

---

## 六、测试检查

- [ ] ✅ `__spec__` 目录下存在对应的测试文件（`{feature}Service.spec.ts`）
  - ❌ 错误示例：创建 `catsService.ts` 但没有 `catsService.spec.ts` → 必须同步创建测试文件
- [ ] ✅ 测试文件通过 `vi.mock("@/models/daos")` 隔离 DAO 依赖
  - ❌ 错误示例：测试中直接调用真实数据库 → 必须改为 mock DAO 方法
- [ ] ✅ 测试覆盖正常路径和关键边界条件（如资源不存在、重复创建）
  - ❌ 错误示例：只有 `happy path` 测试，缺少 `not found` / `duplicate` 分支 → 必须补充

---

## 七、Bad Case 确认（以下情况不得出现）

- [ ] ❌ 不存在 Service 方法内部直接构造 Drizzle 查询的情况
- [ ] ❌ 不存在跨 Service 互相 import 调用的情况（应通过共享 DAO 间接协作）
- [ ] ❌ 不存在 Service 返回原始 DB 行类型（`typeof cats.$inferSelect`）的情况（必须通过 Schema 类型导出）
