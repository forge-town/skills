# 硬编码检查清单

执行规则：**逐项扫描，发现任意一项立即标记并报告给用户，不得跳过。**

---

## 一、数值与标识符

### 1.1 魔法数字
- [ ] ✅ 代码中不存在未命名的魔法数字（直接出现的业务含义数字）
  - ❌ Bad：`if (status === 3)` / `setTimeout(fn, 5000)` / `maxRetry = 3`
  - ✅ 应改为：`const MAX_RETRY = 3` / `const POLLING_INTERVAL_MS = 5000`
  - 🔍 例外：`0`、`1`、`-1` 在明确语义上下文（数组索引、布尔转换）可接受

### 1.2 魔法字符串（状态/枚举值）
- [ ] ✅ 状态值、类型标识、角色名等字符串字面量须使用常量或枚举，不得直接出现在条件判断中
  - ❌ Bad：`if (role === 'admin')` / `if (order.status === 'pending')`
  - ✅ 应改为：`if (role === Role.ADMIN)` / `if (order.status === OrderStatus.PENDING)`

---

## 二、配置与环境

### 2.1 URL 与端点地址
- [ ] ✅ API 地址、第三方服务 URL 不得硬编码在业务逻辑中
  - ❌ Bad：`fetch('https://api.example.com/v1/users')`
  - ✅ 应改为：从 `process.env` 或配置常量读取

### 2.2 环境变量值
- [ ] ✅ 密钥、Token、数据库连接串、端口号等敏感/可变配置不得直接写入代码
  - ❌ Bad：`const secret = 'my-super-secret-key'` / `port = 3000`
  - ✅ 应改为：`process.env.SECRET_KEY` / `Number(process.env.PORT) ?? 3000`

### 2.3 文件路径
- [ ] ✅ 绝对路径或与运行环境强绑定的相对路径不得硬编码
  - ❌ Bad：`'/home/ubuntu/app/uploads'` / `'C:\\Users\\admin\\data'`
  - ✅ 应改为：`path.join(process.env.UPLOAD_DIR, 'uploads')` 或配置常量

---

## 三、文案与消息

### 3.1 用户可见响应消息
- [ ] ✅ 返回给前端的错误消息、提示文案不得分散硬编码在各业务逻辑中
  - ❌ Bad：`throw new Error('用户不存在')` 散落在多处
  - ✅ 应改为：集中定义在错误码常量或 i18n 文件中

---

## 四、检查结果汇总

- [ ] ✅ 已记录所有发现的硬编码位置（文件路径 + 行号 + 内容）
- [ ] ✅ 已为每处硬编码提供具体重构建议（提取为常量 / 读取环境变量 / 使用枚举）
