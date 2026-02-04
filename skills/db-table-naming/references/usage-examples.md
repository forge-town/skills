# 使用示例

## 示例1：验证单个命名

**用户请求**：`user_center` 这个数据库名称符合规范吗？

**验证过程**：
1. 检查字符集：全小写 ✅
2. 检查分隔符：使用下划线分隔 ✅
3. 检查语义：`user`（用户）+ `center`（中心），语义清晰 ✅

**响应**：该命名符合规范。全小写、使用下划线分隔、体现用户中心业务。

## 示例2：验证单个表名

**用户请求**：`orderDetail` 这个表名符合规范吗？

**验证过程**：
1. 检查字符集：包含大写字母D ❌
2. 检查分隔符：使用驼峰而非下划线 ❌
3. 检查复数：`detail`为单数 ❌

**响应**：不符合规范。问题：①包含大写字母；②使用驼峰命名；③名词为单数。建议修正为：`order_details`

## 示例3：批量验证命名

**用户请求**：检查以下表名：`order_childs`, `systemLog`, `user_info`, `vip_coupons`

**验证过程**：
1. `order_childs`：复数形式错误，应为`order_children`
2. `systemLog`：大写+驼峰，应为`system_logs`
3. `user_info`：名词单数，应为`user_infos`
4. `vip_coupons`：✅ 符合规范

**响应**：
- 不符合规范：
  - `order_childs` → `order_children`
  - `systemLog` → `system_logs`
  - `user_info` → `user_infos`
- 符合规范：
  - `vip_coupons` ✅

## 示例4：自动修正指定文件

**用户请求**：检查 `./migration/001_create_users.sql` 文件中的表名

**智能体执行**：
1. 读取文件
2. 识别表名：`OrderDetail`, `OrderChild`, `SystemLog`
3. 执行修改：
   ```bash
   edit_file(file_path="./migration/001_create_users.sql", old_content="OrderDetail", new_content="order_details", limit=-1)
   edit_file(file_path="./migration/001_create_users.sql", old_content="OrderChild", new_content="order_children", limit=-1)
   edit_file(file_path="./migration/001_create_users.sql", old_content="SystemLog", new_content="system_logs", limit=-1)
   ```
4. 输出报告：
   ```
   修改完成，共修改3处：
   1. OrderDetail → order_details
   2. OrderChild → order_children
   3. SystemLog → system_logs
   ```

## 示例5：自动修正指定文件夹

**用户请求**：检查 `./migration/` 文件夹中的表名

**智能体执行**：
1. 在 `./migration/` 文件夹内查找，不递归子文件夹
2. 读取找到的所有文件
3. 识别并修改表名
4. 输出报告（包含每个文件的修改情况）

## 示例6：只检查不修改

**用户请求**：只检查 `./migration/001.sql` 文件中的表名，不要修改

**智能体执行**：
1. 识别意图：用户说"不要修改" → 只检查不修改
2. 读取文件并识别表名
3. 不执行修改
4. 输出报告：
   ```
   检查完成（仅检查，未修改），发现3处不符合规范...
   ```
