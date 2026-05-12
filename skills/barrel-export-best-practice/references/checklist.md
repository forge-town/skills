# 桶导出规范检查清单

执行规则：**逐项勾选，若有任何一项为 ❌，必须修正后重新检查，不得跳过输出。**

---

## 检查清单

- [ ] ✅ **1. 每个目录有 index 文件**：存在导出文件的目录必须有 `index.ts`（TS 项目）或 `index.js`
  - ❌ 错误示例：目录下有多个模块文件但无 `index.ts` → 必须创建
  - ✅ 正确示例：`src/components/Button/index.ts`

- [ ] ✅ **2. 仅包含 re-export 语句**：`index.ts` 只允许 `export * from './...'`，不含其他代码
  - ❌ 错误示例：`const x = 1; export { x }` → 变量声明不得出现在桶导出文件中
  - ❌ 错误示例：包含 `function`、`class`、`const`、`let`、`import` + 使用 等 → 必须移到专属模块文件
  - ❌ 错误示例：`export { Button } from './Button'` → **必须使用** `export * from './Button'`
  - ✅ 正确示例：`export * from './Button'`

- [ ] ✅ **3. 禁止默认导出**：桶导出文件中禁止使用 `export default`
  - ❌ 错误示例：`export default Button` → 必须在原文件改为命名导出，然后使用 `export * from './Button'`

- [ ] ✅ **4. 使用相对路径**：导出路径必须以 `./` 或 `../` 开头，禁止绝对路径或别名路径
  - ❌ 错误示例：`export * from '@/components/Button'` → 桶导出中禁止别名路径
  - ✅ 正确示例：`export * from './Button'`

- [ ] ✅ **5. 无循环依赖**：桶导出文件不得与被导出模块形成循环引用
  - ❌ 错误示例：`index.ts` 导出 `A.ts`，而 `A.ts` 再 import 同级 `index.ts`
  - ✅ 正确示例：单向依赖，模块文件不引用同级 `index`

- [ ] ✅ **6. 导出项与实际文件一致**：导出的模块名必须对应真实存在的文件
  - ❌ 错误示例：`export * from './Foo'`，但 `./Foo.ts` 不存在 → 必须修正或删除
  - ✅ 正确示例：所有导出路径都能解析到真实文件

- [ ] ✅ **7. 解决命名冲突**：使用 `export *` 时如遇同名导出冲突，在原文件中重命名
  - ❌ 错误示例：`moduleA` 和 `moduleB` 都导出 `type Foo`，直接 `export *` 会冲突
  - ✅ 正确示例：在 `moduleA/Foo.ts` 中改为 `export type { Foo as FooA }`，或在原文件使用具名导出（这是唯一允许 `export {}` 的场景）

- [ ] ✅ **8. 无重复导出**：同一标识符不得被多次导出
  - ❌ 错误示例：`export * from './Button'` 出现多次
  - ✅ 正确示例：每个模块只导出一次

---

## Bad Case 确认

- [ ] ❌ 不存在 `index.ts` 中包含业务逻辑（函数、变量、类定义）的情况
- [ ] ❌ 不存在使用 `export default` 的桶导出文件的情况
- [ ] ❌ 不存在使用 `export { ... } from './...'` 显式命名导出的情况（**必须用** `export *`）
- [ ] ❌ 不存在使用别名路径（如 `@/`）的桶导出语句的情况
- [ ] ❌ 不存在导出路径指向不存在文件的情况
- [ ] ❌ 不存在桶导出中循环引用的情况
