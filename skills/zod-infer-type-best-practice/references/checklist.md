# Zod 派生类型检查清单

执行规则：**逐项勾选，任何一项 ❌ 必须修正后重新检查。**

---

## 零、前置条件

### 0.1 Zod 已安装
- [ ] ✅ `package.json` 的 `dependencies` 中存在 `zod`
  - ❌ Bad：`dependencies` 中无 `zod` → 必须先执行 `pnpm add zod`

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

### 2.1 绝对禁止创建任何 types 相关文件
- [ ] ✅ 项目中不得存在任何命名为 `types.ts`、`type.ts`、`*.types.ts`、`*.type.ts` 的文件
  - ❌ Bad：`src/types/user.types.ts` → 必须删除，类型移至对应 schema 文件中用 `z.infer` 派生
  - ❌ Bad：`src/user.type.ts` → 同上

### 2.2 绝对禁止 `types/` 目录
- [ ] ✅ 项目中不得存在任何名为 `types/` 的目录
  - ❌ Bad：`src/types/` 目录存在 → 必须删除，内部所有类型迁移至对应 schema 文件

---

## 三、schema 导出规范

### 3.1 schema 文件须同时导出类型
- [ ] ✅ 每个 schema 文件在导出 `const XxxSchema` 的同时，紧随导出 `type Xxx = z.infer<typeof XxxSchema>`
  - ❌ Bad：schema 文件只导出 schema 常量，类型在别处手写
  - ✅ Good：schema 文件末尾有对应的 `export type` 语句

---

## Bad Case 确认

- [ ] ❌ 不存在任何 `types.ts`、`type.ts`、`*.types.ts` 文件
- [ ] ❌ 不存在任何 `types/` 目录
- [ ] ❌ 不存在手写 interface/type 与已有 Zod schema 字段完全重复的文件
- [ ] ❌ 不存在因手写类型与 schema 不同步导致字段数量/名称不一致的情况
