# 业务表外键规则

- 所有引用 users.id 的业务表外键列都必须使用 text 类型
- 禁止将 users.id 设为 uuid 后再让业务表使用 text，类型必须一致
- 常见需要同步调整的列包括 user_preferences.user_id 与 cats.user_id
- 若历史库使用 uuid，先执行迁移 SQL 再执行 schema 推送
