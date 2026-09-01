# Service 最佳实践检查清单

执行规则：**逐项勾选，若有任何一项为 ❌，必须修正后重新检查，不得跳过输出。**

---

## 一、文件结构与导出检查

- [ ] ✅ Service 位于 `packages/services/src/<Feature>Service/`，按 `contracts.ts`、`methods/`、`helpers/` 分层
  - ❌ 错误示例：把 Service 和 DAO 混放在 `models/`，或将所有方法塞进单个超大文件
- [ ] ✅ Service 入口导出 PascalCase singleton（如 `CratesService`）及 `typeof` 公共类型
  - ❌ 错误示例：`export const createCatsService = (deps) => ({ ... })`、`export class CatsService { ... }`
  - ℹ Service 名称不要求存在 `create` 业务方法；只有创建语义成立时才使用该方法名
  - ⚠️ **工具函数豁免**：若文件内容为纯工具函数（URL 构建、请求体构造、Thread ID 生成等）而非 Service 对象，在满足以下**全部条件**时无需封装为对象：
    1. 文件中**不包含**任何数据库/外部 API 调用
    2. 所有函数为无副作用的纯函数或简单 `fetch` 封装
    3. 文件命名应优先考虑重命名为 `{feature}Utils.ts` 或 `{feature}Helpers.ts` 以体现职责；若历史原因保留 `Service` 后缀，须在文件顶部注释说明豁免原因

---

## 二、依赖规范检查（强制）

- [ ] ✅ Service 不直接导入 `@repo/db`、`drizzle-orm` 或表定义构造查询；数据库访问通过注入的 DAO/Repository 完成
  - ❌ 错误示例：`const rows = await db.query.cats.findMany(...)` 出现在 Service 内
- [ ] ✅ 跨表写入由 Repository 发起事务，Service 不自行拼接多个 DAO 写操作

---

## 三、方法规范检查

- [ ] ✅ 所有方法名使用驼峰命名法（camelCase），语义清晰
  - ❌ 错误示例：`get_cat()`、`GetCat()` → 必须改为 `get()` 或 `getCat()`
- [ ] ✅ 每个方法返回类型明确声明为具体的 `Promise<T>` 或 `ResultAsync<T, E>`（不用 `Promise<any>`）
  - ❌ 错误示例：`async list()` 无返回类型注解 → 必须加 `Promise<Cat[]>`
- [ ] ✅ 方法参数类型使用 `@repo/schemas` 中的 Zod 推导类型（如 `CreateCatInput`），不用裸 `object` 或 `any`
  - ❌ 错误示例：`create(data: object)` → 必须改为 `create(userId: string, data: CreateCatInput)`

---

## 四、类型安全检查

- [ ] ✅ 方法返回类型使用 `@repo/schemas` 中对应的 `z.infer<>` 推导类型（如 `Cat`、`Mission`）
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
- [ ] ✅ 不使用 `try/catch` 吞掉 Service 错误；跨边界失败通过 `Result`/`ResultAsync` 显式返回并在 Router 边界统一映射
  - ❌ 错误示例：`catch (e) { console.log(e) }` → 必须改为 `ResultAsync.fromPromise(..., mapError)` 或保留 cause 后重抛

---

## 六、测试检查

- [ ] ✅ Service、method 和 helper 测试与实现共置，使用 `.spec.ts`（如 `DictionaryEntries.service.spec.ts`）
  - ❌ 错误示例：只创建 Service 实现而没有对应行为测试
- [ ] ✅ 测试通过 helpers/适配器 mock fake DAO/Repository 隔离持久化依赖
  - ❌ 错误示例：测试中直接连接真实数据库 → 必须替换 helper 依赖或 mock
- [ ] ✅ 测试覆盖正常路径和关键边界条件（如资源不存在、重复创建）
  - ❌ 错误示例：只有 `happy path` 测试，缺少 `not found` / `duplicate` 分支 → 必须补充

---

## 七、Bad Case 确认（以下情况不得出现）

- [ ] ❌ 不存在 Service 方法内部直接构造 Drizzle 查询的情况
- [ ] ❌ 不存在跨 Service 互相 import 调用的情况（应通过共享 DAO 间接协作）
- [ ] ❌ 不存在 Service 返回原始 DB 行类型或跨层复制接口的情况（视图契约应由 Schema/contract 明确表达）
