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

## 修正原则
- 保持原意不变，仅调整格式和复数形式
- 优先使用标准复数规则，避免不规则变化
- 业务特有缩写（如行业公认术语）可以保留但需说明
