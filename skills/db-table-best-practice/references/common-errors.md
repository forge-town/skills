# 常见错误与修正

## 数据库命名常见错误

| 错误类型 | 错误示例 | 修正建议 | 修正后 |
|----------|----------|----------|--------|
| 大写字母 | `UserCenter` | 转换为全小写 | `user_center` |
| 驼峰命名 | `orderManagement` | 添加下划线分隔 | `order_management` |
| 缺少分隔符 | `goodsinventory` | 按语义添加下划线 | `goods_inventory` |
| 无意义缩写 | `usr_mgr` | 使用完整词汇 | `user_management` |

## 数据表命名常见错误

| 错误类型 | 错误示例 | 修正建议 | 修正后 |
|----------|----------|----------|--------|
| 名词单数 | `user_info` | 转换为复数 | `user_infos` |
| 大写+驼峰 | `OrderDetails` | 转小写+下划线 | `order_details` |
| 缩写不清 | `sys_log` | 使用完整词汇 | `system_logs` |
| 缺少形容词 | `logs` | 补充业务属性 | `system_logs` |
| 名词复数错误 | `order_childs` | 使用正确复数 | `order_children` |

## Drizzle ORM 文件命名常见错误

| 错误类型 | 错误示例 | 修正建议 | 修正后 |
|----------|----------|----------|--------|
| 缺少 _table 后缀 | `user.ts` | 添加 `_table` 后缀 | `users_table.ts` |
| 表名单数 | `user_table.ts` | 转换为复数 | `users_table.ts` |
| 文件名与表名不一致 | `users_table.ts` 但表名是 `user` | 保持一致 | 文件名改为 `user_table.ts` 或表名改为 `users` |
| 大写字母 | `User_table.ts` | 转换为全小写 | `users_table.ts` |
| 驼峰命名 | `userTable.ts` | 添加下划线 | `users_table.ts` |
| 缩写不清 | `usr_table.ts` | 使用完整词汇 | `users_table.ts` |

**修正原则**：
- 文件名格式：`数据库表名 + _table`
- 文件名中的表名必须与 `pgTable()` 函数中的表名完全一致
- 数据库表名必须符合复数、小写、下划线的规范
