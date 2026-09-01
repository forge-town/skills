# Repository 最佳实践检查清单

执行规则：**逐项勾选，若有任何一项为 ❌，必须修正后重新检查，不得跳过输出。**

---

## 一、文件结构与导出检查

- [ ] ✅ Repository 位于 `packages/models/src/repositories/<feature>Repository/`，包含聚合文件、`index.ts`、测试和 `_operations/`
  - ❌ 错误示例：`apps/dashboard/src/repositories/missionRepository.ts` 单文件实现全部跨表逻辑
- [ ] ✅ 顶层导出 PascalCase singleton（如 `CratesRepository`），并导出 `typeof` 公共类型
  - ❌ 错误示例：`export const createMissionRepository = (db) => ({ ... })`、`export class MissionRepository { ... }`

---

## 二、触发场景检查（Repository 存在的前提）

- [ ] ✅ Repository 在跨表事务、跨表聚合查询或需要稳定持久化边界时创建
  - ❌ 错误示例：为了包装单表 CRUD 创建 Repository → 此逻辑应放在 DAO 层
- [ ] ✅ 单张表写入直接在 DAO 层处理，不创建 Repository
  - ❌ 错误示例：`catsRepository.create()` 内只调用 `catsDao.create()` → 不需要这层封装

---

## 三、事务规范检查

- [ ] ✅ 涉及多张表写入的方法必须使用 `db.transaction(async (tx) => { ... })` 包裹全部写操作，并把同一 `tx` 传给 DAO Operation
  - ❌ 错误示例：分开调用 `await dao1.create(data1); await dao2.create(data2)` 不在同一事务 → 必须合并进 `db.transaction()`
- [ ] ✅ 事务内调用 DAO 时必须将 `tx` 传入支持事务的 Operation
  - ❌ 错误示例：在事务内调用全局 `db`，导致跨表写入不在同一事务
- [ ] ✅ 不在 Repository 中嵌套另一个 `db.transaction()`（保持单层事务）
  - ❌ 错误示例：`MissionRepository.assign()` 内部调用了另一个也含 `db.transaction()` 的 Repository 方法 → 必须扁平化

---

## 四、职责边界检查

- [ ] ✅ Repository 的写操作只返回稳定契约；聚合查询可以读取多个表，但不组装前端视图
  - ❌ 错误示例：Repository 写方法末尾再查询并返回完整业务视图 → 视图组装移到 Service
- [ ] ✅ Repository 方法只返回关键标识（`{ id: string }` / `{ id: number }`），不返回完整业务对象
  - ❌ 错误示例：`return { id, title, rarity, rewards }` → 必须改为 `return { id }`
- [ ] ✅ Repository 内不调用其他 Repository（保持扁平，避免跨 Repository 依赖）
  - ❌ 错误示例：`MissionRepository.assign()` 内调用 `CatRepository.lock()` → 必须重构为共享 DAO 方法
- [ ] ✅ Repository 内不包含业务规则判断（状态机检查、重复校验等属于 Service 层）
  - ❌ 错误示例：`if (mission.status !== "available") throw new Error(...)` 出现在 Repository → 必须移到 Service 层

---

## 五、输入类型检查

- [ ] ✅ 每个写方法的输入使用 Schema 推导类型或明确 contract，不使用散参数
  - ❌ 错误示例：`create(userId: string, title: string, rarity: string, ...)` 散参数 → 必须改为 `create(input: CreateMissionInput)`
- [ ] ✅ Input Schema 命名格式为 `{Action}{Feature}InputSchema`（如 `AssignMissionInputSchema`）
  - ❌ 错误示例：`MissionInput`、`AssignInput` → 必须带完整格式

---

## 六、类型安全检查

- [ ] ✅ 所有 DAO 调用使用 Drizzle 推断类型，不使用 `any`
  - ❌ 错误示例：`await (catsDao as any).createWithTx(tx, data)` → 必须使用正确类型
- [ ] ✅ 返回值类型明确声明（`Promise<{ id: string }>` 等）
  - ❌ 错误示例：方法无返回类型注解 → 必须加 `Promise<{ id: string }>`

---

## 七、Bad Case 确认（以下情况不得出现）

- [ ] ❌ 不存在单表写入的 Repository（单表写入放 DAO）
- [ ] ❌ 不存在 Repository 方法返回聚合数据视图的情况（视图由 Service 组装）
- [ ] ❌ 不存在未用 `db.transaction()` 包裹的多表写操作
- [ ] ❌ 不存在 Repository 与 Repository 互相调用的情况
- [ ] ❌ 不存在 Repository 外层直接导入 `drizzle-orm`、表定义或 DAO 的情况（应委托 `_operations`）
