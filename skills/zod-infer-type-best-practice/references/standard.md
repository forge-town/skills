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
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
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
- **绝对禁止**创建任何 `types.ts`、`type.ts`、`*.types.ts` 文件
- **绝对禁止**创建 `types/` 目录
- 项目中不应存在任何与类型相关的独立文件，一切类型均从对应 schema 中派生
