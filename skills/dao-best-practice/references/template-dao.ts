/**
 * DAO 模板文件
 *
 * 使用说明：
 * 1. 将所有 `tableName` / `TableNameRow` / `NewTableNameRow` 替换为实际表名
 * 2. 仅保留业务需要的方法，删除不需要的
 * 3. 仅导入实际用到的 drizzle-orm 函数
 *
 * 参考：https://orm.drizzle.team/docs/select
 *       https://orm.drizzle.team/docs/insert
 *       https://orm.drizzle.team/docs/update
 *       https://orm.drizzle.team/docs/delete
 *       https://orm.drizzle.team/docs/transactions
 */

import { eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { PgTransaction } from "drizzle-orm/pg-core";
import { db } from "@/db";
import { tableName } from "@/models/tables";

// --- 类型定义（从表定义自动推导，禁止手写 interface）---

// $inferSelect：查询结果行类型
type TableNameRow = typeof tableName.$inferSelect;
// $inferInsert：插入参数类型（含所有 defaultFn / optional 字段）
type NewTableNameRow = typeof tableName.$inferInsert;
// DbExecutor：db 实例或事务对象的联合类型，用于 WithTx 变体
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DbExecutor = NodePgDatabase<any> | PgTransaction<any, any, any>;

// --- DAO 对象 ---

export const tableNameDao = {
  // =========================================================
  // 查询：单条
  // 官方文档：.select().from().where().limit(1)
  // 不存在返回 null，不抛出错误
  // =========================================================
  async findById(id: string): Promise<TableNameRow | null> {
    const result = await db
      .select()
      .from(tableName)
      .where(eq(tableName.id, id))
      .limit(1);
    return result[0] ?? null;
  },

  // =========================================================
  // 查询：多条
  // 不存在返回 []，不返回 null
  // =========================================================
  async findMany(): Promise<TableNameRow[]> {
    return db.select().from(tableName);
  },

  // =========================================================
  // 创建
  // 官方文档：.insert().values().returning()
  // PostgreSQL / SQLite 支持 .returning()
  // =========================================================
  async create(data: NewTableNameRow): Promise<TableNameRow> {
    const result = await db.insert(tableName).values(data).returning();
    return result[0];
  },

  async createWithTx(
    tx: DbExecutor,
    data: NewTableNameRow,
  ): Promise<TableNameRow> {
    const result = await tx.insert(tableName).values(data).returning();
    return result[0];
  },

  // =========================================================
  // 更新
  // 官方文档：.update().set().where().returning()
  // 行不存在时 .returning() 返回 []，须 ?? null
  // =========================================================
  async update(
    id: string,
    data: Partial<NewTableNameRow>,
  ): Promise<TableNameRow | null> {
    const result = await db
      .update(tableName)
      .set(data)
      .where(eq(tableName.id, id))
      .returning();
    return result[0] ?? null;
  },

  async updateWithTx(
    tx: DbExecutor,
    id: string,
    data: Partial<NewTableNameRow>,
  ): Promise<TableNameRow | null> {
    const result = await tx
      .update(tableName)
      .set(data)
      .where(eq(tableName.id, id))
      .returning();
    return result[0] ?? null;
  },

  // =========================================================
  // 删除
  // 官方文档：.delete().where()
  // 返回 void，不返回影响行数
  // =========================================================
  async delete(id: string): Promise<void> {
    await db.delete(tableName).where(eq(tableName.id, id));
  },

  async deleteWithTx(tx: DbExecutor, id: string): Promise<void> {
    await tx.delete(tableName).where(eq(tableName.id, id));
  },
};
