# DAO 最佳实践检查清单

使用 dao-best-practice 技能后，请确保生成的代码完全符合以下所有要求：

## 文件结构检查
- [ ] DAO文件位于正确的目录：`apps/web/src/db/models/daos/`
- [ ] 文件名与表名一致（如 `users.ts` 对应 `users` 表）
- [ ] 导出为对象形式：`export const {tableName}Dao = { ... }`

## 导入依赖检查
- [ ] 从 `drizzle-orm` 导入必要的函数
- [ ] 包含基本的查询和条件函数（如 `eq`, `and`, `or`, `desc`, `asc`）
- [ ] 正确导入数据库实例和表定义

## 方法规范检查
- [ ] 所有方法名使用驼峰命名法（camelCase）
- [ ] 查询方法使用标准命名：`findBy{Field}`, `findAll`, `findMany`, `findFirst`
- [ ] 变更方法使用标准命名：`create`, `update`, `delete`, `upsert`
- [ ] 返回类型正确：查询返回数组或单对象，变更返回受影响记录

## 类型安全检查
- [ ] 使用 Drizzle 的类型推断（如 `$inferInsert`）
- [ ] 为复杂查询定义自定义类型接口
- [ ] 避免使用 `any` 类型

## 性能优化检查
- [ ] 使用 `limit()` 和 `offset()` 实现分页
- [ ] 避免 N+1 查询，使用联表查询
- [ ] 选择性字段查询：使用 `select({ field1, field2 })`

## 错误处理检查
- [ ] 查询失败返回 `null` 或空数组
- [ ] 变更操作使用 `returning()` 获取结果
- [ ] 多步操作使用事务包装

## 一致性检查
- [ ] 遵循标准 CRUD 方法模式
- [ ] 方法签名标准化
- [ ] 重要逻辑有注释说明
## ⚠️ Repository 评估（强制）
- [ ] 已评估当前 DAO 写方法是否涉及多张表写入
- [ ] 若**单表写入**：写方法签名包含可选 `tx` 参数（`tx?: DbExecutor`）
- [ ] 若**跨表写入**：已触发 `repository-best-practice` 技能，完成对应 Repository 的创建