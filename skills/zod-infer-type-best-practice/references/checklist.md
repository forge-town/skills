# Zod 派生类型检查清单

执行规则：**逐项勾选，任何一项 ❌ 必须修正后重新检查。**

---

## 一、类型来源规范

### 1.1 禁止为已有 Zod schema 的数据结构手写 interface/type
- [ ] ✅ 凡有对应 Zod schema 的数据结构，其 TypeScript 类型必须用 `z.infer<typeof Schema>` 派生
  - ❌ Bad：`export interface User { id: string; name: string }` + 对应的 `UserSchema` 同时存在
  - ✅ Good：`export type User = z.infer<typeof UserSchema>`

### 1.2 派生类型必须与 schema 同文件或同模块导出
- [ ] ✅ `z.infer` 派生的类型在 schema 定义所在文件中 `export`，不拆分到其他文件
  - ❌ Bad：`user.schema.ts` 定义 schema，`user.types.ts` 再声明相同字段的 interface
  - ✅ Good：`user.schema.ts` 同时 `export type User = z.infer<typeof UserSchema>`

### 1.3 子集类型须用 schema 操作符派生，不得手写
- [ ] ✅ 输入类型、局部更新类型等通过 `.omit()`、`.partial()`、`.pick()` 生成新 schema 后再 `z.infer`
  - ❌ Bad：`type CreateUserInput = { name: string; email: string }` 手动列字段
  - ✅ Good：`export const CreateUserSchema = UserSchema.omit({ id: true })`
    `export type CreateUserInput = z.infer<typeof CreateUserSchema>`

---

## 二、文件结构规范

### 2.1 禁止创建专门存放 schema 派生类型的 types.ts 文件
- [ ] ✅ 项目中不存在 `types.ts`/`type.ts` 文件**专门**存放可从 Zod schema 派生的类型
  - ❌ Bad：`src/types/user.types.ts` 内容为可由 schema 派生的 User interface
  - ✅ 例外：只含纯 UI 状态类型（无对应 schema）的文件不受此限制

### 2.2 types/ 目录中不得存放可派生类型
- [ ] ✅ 若存在 `types/` 目录，其中文件只包含无对应 schema 的纯工具/UI 类型
  - ❌ Bad：`types/` 目录中包含与 schema 字段完全一致的 interface 定义

---

## 三、schema 导出规范

### 3.1 schema 文件须同时导出类型
- [ ] ✅ 每个 schema 文件在导出 `const XxxSchema` 的同时，紧随导出 `type Xxx = z.infer<typeof XxxSchema>`
  - ❌ Bad：schema 文件只导出 schema 常量，类型在别处手写
  - ✅ Good：schema 文件末尾有对应的 `export type` 语句

---

## Bad Case 确认

- [ ] ❌ 不存在手写 interface/type 与已有 Zod schema 字段完全重复的文件
- [ ] ❌ 不存在 types.ts 文件内含可从 schema 派生的类型的情况
- [ ] ❌ 不存在因手写类型与 schema 不同步导致字段数量/名称不一致的情况
