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
