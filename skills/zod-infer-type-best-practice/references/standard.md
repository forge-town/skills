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
- 禁止创建 `types/` 目录专门存放 Zod schema 已覆盖的类型
- 纯 UI 专用类型（无需校验，如 `TabVariant`、`ModalSize`）可以是独立的 `type`/`interface`，不受此规范约束

---

## 四、例外情况

以下类型可以独立存在，**不强制**从 Zod 派生：

| 场景 | 原因 |
|---|---|
| 纯 UI 展示状态（如 `type ButtonVariant = 'primary' \| 'ghost'`） | 无运行时校验需求 |
| 第三方库类型扩展（如 `augment NextAuth`） | 无法用 Zod 表达 |
| 泛型工具类型（如 `type Maybe<T> = T \| null`） | 不对应具体数据结构 |
