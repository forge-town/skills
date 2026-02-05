# DAO编写最佳实践指南

## 概述

在 code-arena 项目中，DAO（Data Access Object）用于抽象数据库操作，确保代码的可维护性和类型安全。本指南基于 Drizzle ORM 官方文档，定义了编写DAO的规范和最佳实践。

## 核心规范

### 1. 文件结构

- 每个DAO文件位于 `apps/web/src/db/models/daos/` 下
- 文件名与表名一致（如 `users.ts` 对应 `users` 表）
- 导出为对象形式：`export const {tableName}Dao = { ... }`

### 2. 导入依赖

```typescript
import {
  eq,
  and,
  or,
  desc,
  asc,
  sql,
  count,
  sum,
  avg,
  min,
  max,
} from "drizzle-orm";
import { db } from "../../index";
import { tableName } from "../../tables/tableName";
```

### 3. 方法命名和签名

- 使用驼峰命名法
- 查询方法：`findBy{Field}`, `findAll`, `findMany`, `findFirst`
- 变更方法：`create`, `update`, `delete`, `upsert`
- 返回类型：查询返回数组或单对象，变更返回受影响的记录
- 参数类型：使用 Drizzle 的 `$inferInsert` 或自定义接口

### 4. 标准CRUD方法

```typescript
export const tableNameDao = {
  // 查询单个记录
  async findById(id: string | number) {
    const result = await db
      .select()
      .from(tableName)
      .where(eq(tableName.id, id))
      .limit(1);
    return result[0] || null;
  },

  // 查询多个记录（支持分页和排序）
  async findMany(options?: {
    limit?: number;
    offset?: number;
    orderBy?: { column: any; direction: "asc" | "desc" };
    where?: any;
  }) {
    let query = db.select().from(tableName);

    if (options?.where) {
      query = query.where(options.where);
    }

    if (options?.orderBy) {
      const { column, direction } = options.orderBy;
      query = query.orderBy(direction === "desc" ? desc(column) : asc(column));
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.offset(options.offset);
    }

    return query;
  },

  // 创建记录
  async create(data: typeof tableName.$inferInsert) {
    const result = await db.insert(tableName).values(data).returning();
    return result[0];
  },

  // 批量创建
  async createMany(data: (typeof tableName.$inferInsert)[]) {
    return db.insert(tableName).values(data).returning();
  },

  // 更新记录
  async update(
    id: string | number,
    data: Partial<typeof tableName.$inferInsert>,
  ) {
    const result = await db
      .update(tableName)
      .set(data)
      .where(eq(tableName.id, id))
      .returning();
    return result[0];
  },

  // 删除记录
  async delete(id: string | number) {
    await db.delete(tableName).where(eq(tableName.id, id));
  },

  // Upsert（插入或更新）
  async upsert(data: typeof tableName.$inferInsert, conflictTarget: any) {
    return db
      .insert(tableName)
      .values(data)
      .onConflictDoUpdate({
        target: conflictTarget,
        set: data,
      })
      .returning();
  },
};
```

## 最佳实践

### 1. 类型安全

- 始终使用 Drizzle 的类型推断（如 `$inferInsert`）
- 为复杂查询定义自定义类型接口
- 避免 `any` 类型，使用 `sql<T>` 指定类型

### 2. 错误处理

- 查询失败返回 `null` 或空数组
- 变更操作使用 `returning()` 获取结果
- 考虑使用事务包装多步操作

### 3. 性能优化

- 使用 `limit()` 和 `offset()` 实现分页
- 避免N+1查询，使用 `with` 或联表查询
- 选择性字段：使用 `select({ field1, field2 })`
- 对于重复查询，使用 prepared statements

### 4. 事务支持

```typescript
async createWithRelated(data: DataType) {
  return db.transaction(async (tx) => {
    const record = await tx.insert(tableName).values(data).returning();
    // 相关操作
    return record[0];
  });
}
```

### 5. 聚合查询

```typescript
async getStats() {
  return db
    .select({
      total: count(tableName.id),
      avgValue: avg(tableName.someField),
      maxValue: max(tableName.someField),
    })
    .from(tableName);
}
```

### 6. 条件查询

```typescript
async findByConditions(conditions: {
  field1?: string;
  field2?: number;
  // ...
}) {
  let whereClause = undefined;

  if (conditions.field1) {
    whereClause = eq(tableName.field1, conditions.field1);
  }

  if (conditions.field2) {
    const condition = eq(tableName.field2, conditions.field2);
    whereClause = whereClause ? and(whereClause, condition) : condition;
  }

  return db.select().from(tableName).where(whereClause);
}
```

### 7. 一致性

- 所有DAO遵循相同模式
- 方法签名标准化
- 注释重要逻辑

### 8. 测试

- 为每个DAO方法编写单元测试
- 使用内存数据库或mock进行测试
- 覆盖成功和失败场景

### 9. 联表查询

```typescript
async findWithRelations(id: string) {
  return db
    .select()
    .from(tableName)
    .leftJoin(relatedTable, eq(tableName.id, relatedTable.tableNameId))
    .where(eq(tableName.id, id));
}
```

遵循这些规范可确保DAO代码的高质量、可维护性和一致性。参考 Drizzle ORM 官方文档：[Select](https://orm.drizzle.team/docs/select), [Insert](https://orm.drizzle.team/docs/insert), [Transactions](https://orm.drizzle.team/docs/transactions), [Performance](https://orm.drizzle.team/docs/performance)。




