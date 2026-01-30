# 英文复数规则参考

## 目录
- [常见规则](#常见规则)
- [不规则变化](#不规则变化)
- [技术术语常见复数](#技术术语常见复数)
- [使用示例](#使用示例)

## 概览
本文档提供英文名词复数形式的规则参考，用于数据表命名中的名词复数转换。遵循标准英语语法规则，同时涵盖技术领域的常见术语。

## 常见规则

### 规则1：一般情况
大多数名词直接加 `-s`

| 单数 | 复数 | 示例 |
|------|------|------|
| user | users | `user_users` |
| order | orders | `order_orders` |
| table | tables | `product_tables` |

### 规则2：以 s、x、ch、sh 结尾
加 `-es`

| 单数 | 复数 | 示例 |
|------|------|------|
| bus | buses | `route_buses` |
| box | boxes | `package_boxes` |
| match | matches | `game_matches` |
| dish | dishes | `menu_dishes` |

### 规则3：以辅音字母 + y 结尾
变 `y` 为 `i`，再加 `-es`

| 单数 | 复数 | 示例 |
|------|------|------|
| baby | babies | `user_babies` |
| city | cities | `delivery_cities` |
| country | countries | `shipping_countries` |

### 规则4：以 f 或 fe 结尾
变 `f` 或 `fe` 为 `v`，再加 `-es`

| 单数 | 复数 | 示例 |
|------|------|------|
| leaf | leaves | `data_leaves` |
| knife | knives | `tool_knives` |

### 规则5：以 o 结尾
部分加 `-es`，部分加 `-s`

| 单数 | 复数 | 示例 |
|------|------|------|
| tomato | tomatoes | `food_tomatoes` |
| photo | photos | `item_photos` |
| piano | pianos | `asset_pianos` |

## 不规则变化

部分名词复数形式不规则，需要记忆：

| 单数 | 复数 | 示例 |
|------|------|------|
| child | children | `order_children` |
| person | people | `user_people` |
| man | men | `team_men` |
| woman | women | `staff_women` |
| foot | feet | `measure_feet` |
| tooth | teeth | `dental_teeth` |
| mouse | mice | `lab_mice` |

**注意**：在数据表命名中，应优先使用规则变化的名词。如需使用不规则名词，确保复数形式正确。

## 技术术语常见复数

技术领域中的常见术语，其复数形式：

| 单数 | 复数 | 示例 |
|------|------|------|
| log | logs | `system_logs` |
| info | infos | `user_infos` |
| sku | skus | `product_skus` |
| data | data | `raw_data`（不可数名词，原样保留） |
| file | files | `upload_files` |
| config | configs | `app_configs` |
| cache | caches | `redis_caches` |
| token | tokens | `auth_tokens` |
| session | sessions | `user_sessions` |
| key | keys | `api_keys` |
| value | values | `config_values` |
| status | statuses | `order_statuses` |
| address | addresses | `shipping_addresses` |

**特殊说明**：
- `data` 是不可数名词，保持原样
- 技术缩写词通常直接加 `-s`（如`sku`→`skus`）
- 以`-us`结尾的拉丁词（如`status`→`statuses`）按规则变化

## 使用示例

### 示例1：规则变化
**原始命名**：`user_detail`
**修正**：`user_details`（一般规则，加-s）

### 示例2：不规则变化
**原始命名**：`order_child`
**修正**：`order_children`（不规则复数）

### 示例3：技术术语
**原始命名**：`system_log`
**修正**：`system_logs`（技术术语，加-s）

### 示例4：复合词处理
**原始命名**：`order_shipping_address`
**分析**：最后一个名词是`address`（以ss结尾）
**修正**：`order_shipping_addresses`（按规则加-es）

### 示例5：缩写词处理
**原始命名**：`product_sku`
**修正**：`product_skus`（技术缩写，直接加-s）

## 验证清单
当遇到不确定的复数形式时：

1. ✅ 检查是否为常见规则变化（加-s/-es/变y为i+es）
2. ✅ 检查是否为不规则变化（如child→children）
3. ✅ 检查是否为技术术语（如log→logs, sku→skus）
4. ✅ 确认最后一个名词而非形容词（如`order_status`中`status`是名词）
5. ✅ 不可数名词保持原样（如`data`）

## 注意事项
- 优先使用规则变化的名词，避免使用过于生僻的不规则词
- 技术术语的复数形式通常遵循简单规则（直接加-s）
- 当遇到不确定的复数形式时，查阅词典或权威资料
- 在数据表命名中，复数形式的一致性比追求完美更重要
