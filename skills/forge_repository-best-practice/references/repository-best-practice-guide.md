# Repository 最佳实践指南

## 一、为什么需要 Repository 层？

系统中 DAO 层每个仅操作单张数据库表。真实业务（如"创建一场 free battle"）通常涉及多张表的写入（例如 `battles` + `free_battles`）。若直接在 Service 层调用多个 DAO：

- 无法保证原子性（部分成功、部分失败）
- 业务逻辑分散，难以维护

**Repository** 是跨表、事务性写操作的统一封装层。

---

## 二、架构层级

```
Controller（tRPC Router）
    ↓
Service（业务编排 + 数据拼装）
    ↓              ↓
Repository      DAO（只读查询）
（跨表写入）
    ↓
DAO（接收 tx）
    ↓
Drizzle DB → PostgreSQL
```

---

## 三、Repository 设计原则

### 3.1 只写不读

Repository 仅负责数据写入，**不负责构建前端所需的完整数据视图**。

```typescript
// ✅ 正确：只返回关键标识
return { id: battleId };

// ❌ 错误：返回聚合视图（这是 Service 的职责）
return await battlesDAO.getWithStats(battleId);
```

### 3.2 原子事务

多张表的写入必须包裹在同一个 `db.transaction()` 中。

```typescript
async createFreeBattle(input: CreateFreeBattleInputSchema) {
  return await db.transaction(async (tx) => {
    const battleId = await battlesDAO.insert({ ... }, tx);
    await freeBattlesDAO.insert({ battle_id: battleId, ... }, tx);
    return { id: battleId };
  });
}
```

### 3.3 输入使用 Zod Schema

每个方法接受经 Zod 校验的输入对象，不接受散参数。

```typescript
const CreateFreeBattleInputSchema = z.object({
  title: z.string(),
  creatorId: z.string(),
  rules: z.string(),
  duration: z.number(),
});

type CreateFreeBattleInput = z.infer<typeof CreateFreeBattleInputSchema>;
```

### 3.4 DAO 接收 tx 参数

DAO 方法的 `tx` 参数必须是可选的，以支持在 Repository 事务中被调用。

```typescript
// DAO 方法签名示例
async insert(data: NewBattle, tx?: PgTransaction): Promise<number>
```

---

## 四、文件命名与位置

- **位置**：`models/repositories/`
- **文件名**：`{feature}Repository.ts`（camelCase feature 名）
- **导出**：`export const {Feature}Repository = { ... }`

---

## 五、Schema 分类

### 表结构 Schema（Table-level Schema）

描述单张数据库表字段，贴近物理存储：

```typescript
const BattleTableSchema = z.object({
  id: z.number(),
  title: z.string(),
  creator_id: z.string(),
  type: z.enum(['free', 'ranked']),
  created_at: z.date(),
});
```

### 业务视图 Schema（Business View Schema）

描述前端/API 所需的聚合数据（DTO 替代品），由 Service 层组装：

```typescript
const BattleWithStatsSchema = z.object({
  id: z.number(),
  title: z.string(),
  vote_count: z.number(),     // 来自 votes 表 COUNT
  rules: z.string(),          // 来自 free_battles 表
  is_voted_by_me: z.boolean(),
});
```

---

## 六、读写路径分离

| 路径 | 流向 | 特点 |
|------|------|------|
| 写路径 | Controller → Service → **Repository**（事务）→ DAO | 原子性保证 |
| 读路径 | Controller → Service → 多个 DAO（非事务拼装）| 灵活组装视图 |

---

## 七、Service 与 Repository 的协作

```typescript
// Service 示例
async createFreeBattle(rawInput: unknown) {
  // 1. 校验输入
  const input = CreateFreeBattleInputSchema.parse(rawInput);
  
  // 2. 调用 Repository 完成事务性写入
  const { id } = await FreeBattleRepository.create(input);
  
  // 3. 调用 DAO 组装完整视图后返回
  const battle = await battlesDAO.getById(id);
  const voteCount = await votesDAO.countByBattleId(id);
  return BattleWithStatsSchema.parse({ ...battle, vote_count: voteCount });
}
```

---

## 八、常见错误

| 错误 | 说明 |
|------|------|
| 在 Repository 中组装前端视图 | 职责混乱，违反只写原则 |
| 在 Service 直接跨表写入而不用事务 | 原子性缺失，数据不一致风险 |
| Repository 方法返回完整聚合对象 | 应只返回写入产生的关键 ID |
| DAO 方法不支持 tx 参数 | 无法参与事务，Repository 无法调用 |
| 直接在 Repository 中发起查询 | 查询属于 Service 职责 |
