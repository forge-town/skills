# 错误处理规范检查清单

执行规则：**逐项勾选，若有任何一项为 ❌，必须修正后重新检查。**

---

## 一、neverthrow 强制使用

- [ ] ✅ **必须使用 neverthrow 进行错误处理**，禁止原生 try-catch
  - ❌ 错误示例：`try { ... } catch (e) { ... }` → 必须改为 `Result<T, E>`
  - ❌ 错误示例：`async function foo() { try { ... } catch ... }` → 必须改为返回 `Promise<Result<T, E>>`
  - ✅ 正确示例：`import { Result, ok, err } from "neverthrow";`

- [ ] ✅ **所有可能失败的函数返回 Result 类型**
  - ❌ 错误示例：`function parseJSON(raw: string): Data` → 可能抛异常
  - ✅ 正确示例：`function parseJSON(raw: string): Result<Data, ParseError>`

- [ ] ✅ **异步函数返回 ResultAsync**
  - ❌ 错误示例：`async function fetchUser(): Promise<User>` → 可能 reject
  - ✅ 正确示例：`function fetchUser(): ResultAsync<User, NetworkError>`

---

## 二、Result 处理规范

- [ ] ✅ **调用方必须处理错误**（不能忽略 Result）
  - ❌ 错误示例：`fetchUser();` → 忽略可能的错误
  - ❌ 错误示例：`const result = fetchUser();` → 未检查 result.isOk()
  - ✅ 正确示例：`const result = fetchUser(); if (result.isErr()) { ... }`
  - ✅ 正确示例：`result.map(...).mapErr(...)` 链式处理

- [ ] ✅ **使用 match 进行分支处理**（推荐）
  - ✅ 正确示例：`result.match(console.log, console.error)`
  - ✅ 正确示例：`const value = result.match(ok => ok, err => defaultValue)`

---

## 三、错误类型规范

- [ ] ✅ **定义具体的错误类**
  - ❌ 错误示例：`err(new Error("..."))` → 太笼统
  - ❌ 错误示例：`err("string error")` → 用字符串
  - ✅ 正确示例：`err(new NetworkError("..."))`、`err(new ParseError("..."))`

- [ ] ✅ **错误类包含足够上下文**
  - ✅ 正确示例：`new NetworkError({ url, statusCode, message })`

---

## 四、Result 转换与组合

- [ ] ✅ **使用 map/mapErr 转换 Result**
  - ✅ 正确示例：`result.map(data => data.name).mapErr(e => new AppError(e))`

- [ ] ✅ **使用 andThen 组合多个可能失败的操作**
  - ✅ 正确示例：`parseJSON(raw).andThen(validateData).andThen(saveToDB)`

- [ ] ✅ **使用 asyncAndThen 组合异步操作**
  - ✅ 正确示例：`ResultAsync.fromPromise(fetch(), () => new NetworkError()).asyncAndThen(...)`

---

## Bad Case 确认

- [ ] ❌ 不存在原生 try-catch 代码
- [ ] ❌ 不存在返回裸值（非 Result）但可能失败的函数
- [ ] ❌ 不存在忽略 Result 错误的情况
- [ ] ❌ 不存在用字符串或原生 Error 作为错误类型的情况
