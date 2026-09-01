# API Route 检查清单

## 路由定义
- [ ] 1.1 路由文件名为 `{resource}.ts`（如 `users.ts`、`posts.ts`）
  - ✅ 正确：`src/routes/api/users.ts`
  - ❌ 错误：`src/routes/api/UsersAPI.ts`（大写）、`src/routes/api/user-api.ts`（多余后缀）
- [ ] 1.2 每个路由文件只处理一个资源（resource），不混合多个资源
  - ✅ 正确：`users.ts` 只含 users 相关端点
  - ❌ 错误：`users.ts` 中混入 `/posts` 端点

## 输入验证
- [ ] 2.1 所有请求参数通过 Zod Schema 验证，无裸 `req.body` 直接使用
  - ✅ 正确：`const input = CreateUserSchema.parse(req.body)`
  - ❌ 错误：`const { name } = req.body`（未验证）
- [ ] 2.2 路径参数（`:id`）已做类型转换和范围验证
  - ✅ 正确：`z.uuid()`（Zod 4 顶层格式 API）
  - ❌ 错误：直接使用 `req.params.id` 无验证

## 错误处理
- [ ] 3.1 所有异步处理器已包裹 try-catch，无未捕获 Promise 拒绝
  - ✅ 正确：边界层将失败映射为明确的 `Result` / HTTP 响应，不吞掉异常
  - ❌ 错误：`async (req, res) => { const data = await fetchData() }` 无 try-catch
- [ ] 3.2 错误响应返回标准结构 `{ error: string, code?: string }`
  - ✅ 正确：`res.status(400).json({ error: 'Validation failed', code: 'INVALID_INPUT' })`
  - ❌ 错误：`res.status(400).send('bad request')`（非结构化）

## Bad Case 确认
- [ ] ❌ 不存在直接返回数据库原始行（含内部字段如 `password_hash`）的端点
- [ ] ❌ 不存在未验证输入直接传入 DAO 的情况
- [ ] ❌ 不存在空 catch 块（`catch (e) {}`）的路由处理器
