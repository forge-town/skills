# Zod 派生类型规范说明

## 核心原则：Schema 是唯一真实来源

Zod schema 既承担运行时校验，又通过 `z.infer` 提供编译期类型。在已有 Zod schema 的前提下，再手写 `interface`/`type` 是**重复劳动**，且会导致类型与校验逻辑逐渐漂移（drift）。

---

## 一、禁止行为

### 1.1 禁止为已有 schema 的数据结构另建 `types.ts`

**错误写法：**

```ts
// schemas/user.schema.ts
export const UserSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
  email: z.email(),
})

// types/user.types.ts  ← 此文件不应存在
export interface User {
  id: string
  name: string
  email: string
}
```

问题：`UserSchema` 和 `User` 字段重复，未来若 schema 改变，`interface` 不会自动更新。

### 1.2 禁止重复定义可派生的类型

```ts
// ❌ 错误：手动写出与 schema 相同的字段
export type CreateUserInput = {
  name: string
  email: string
}
```

---

## 二、正确做法：从 schema 派生

正确用法请参照 [`best-practice-examples/user.schema.ts`](../best-practice-examples/user.schema.ts) 查看完整示例。

---

## 三、文件组织规范

- 类型必须从 schema **同一文件**中导出，或从 schema 文件 `re-export`
- 不得为已有 Schema 的同一业务对象重复创建类型文件；但 DAO/Repository 的持久化 contract、输入和事务类型可以按模块放在 `*.types.ts` 或 `contracts.ts`
- 不要把“所有类型都必须放进 Schema”作为机械规则；只有能由 Schema 表达的运行时数据才使用 `z.infer`
- 项目应避免与 Schema 字段重复的孤立类型文件，跨层 contract 必须有明确职责和注释
