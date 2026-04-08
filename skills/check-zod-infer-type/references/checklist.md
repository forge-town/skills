# Zod 派生类型检查清单

执行规则：**逐项扫描，发现任意一项立即标记并报告给用户，不得跳过。**

---

## 一、禁止文件检查

- [ ] ✅ **不存在 `types.ts` 文件**
  - ❌ Bad：`src/types/user.types.ts`、`src/utils/types.ts`
  - 应改为：删除文件，类型移至对应 schema 文件用 `z.infer` 派生
  - 🔍 扫描模式：`types.ts`、`*.types.ts`

- [ ] ✅ **不存在 `type.ts` 文件**
  - ❌ Bad：`src/models/user.type.ts`、`src/user.type.ts`
  - 应改为：删除文件，类型移至对应 schema 文件
  - 🔍 扫描模式：`type.ts`、`*.type.ts`

---

## 二、禁止目录检查

- [ ] ✅ **不存在 `types/` 目录**
  - ❌ Bad：`src/types/`、`src/models/types/`
  - 应改为：删除目录，内部所有类型迁移至对应 schema 文件
  - 🔍 扫描模式：目录名精确匹配 `types`

---

## 三、Zod Schema 一致性检查

- [ ] ✅ **不存在手写 interface 与 Zod schema 字段重复**
  - ❌ Bad：`user.schema.ts` 定义了 `UserSchema`，同时 `user.ts` 中有 `interface User { id: string; name: string }`
  - 应改为：`export type User = z.infer<typeof UserSchema>`
  - 🔍 扫描模式：查找同名 interface/type 和 ZodSchema 定义

- [ ] ✅ **所有类型都从对应 schema 派生**
  - ❌ Bad：`type CreateUserInput = { name: string }` 手写类型
  - 应改为：`export const CreateUserSchema = UserSchema.omit({ id: true }); export type CreateUserInput = z.infer<typeof CreateUserSchema>`
  - 🔍 扫描模式：检查类型定义位置是否在 schema 文件中

---

## 四、Schema 文件规范检查

- [ ] ✅ **schema 文件同时导出类型**
  - ❌ Bad：`user.schema.ts` 只导出 `UserSchema`，没有 `export type User = z.infer<typeof UserSchema>`
  - 应改为：schema 文件末尾添加对应的 `export type` 语句
  - 🔍 扫描模式：检查 schema 文件是否有对应的 `z.infer` 类型导出

---

## 五、检查结果汇总

- [ ] ✅ 已记录所有发现的违规文件路径
- [ ] ✅ 已记录所有发现的违规目录路径
- [ ] ✅ 已记录所有类型与 schema 重复定义的位置
- [ ] ✅ 已为每处违规提供具体修复建议
- [ ] ✅ 已生成可执行的迁移步骤

---

## Bad Case 确认（以下情况不得出现）

- [ ] ❌ 不存在任何 `types.ts`、`type.ts`、`*.types.ts` 文件
- [ ] ❌ 不存在任何 `types/` 目录
- [ ] ❌ 不存在手写 interface/type 与 Zod schema 字段重复的文件
- [ ] ❌ 不存在 schema 文件未导出对应类型的情况
