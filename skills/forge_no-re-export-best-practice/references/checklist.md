# 禁止非 index 文件中 Re-Export 检查清单

执行规则：**逐项勾选，若有任何一项为 ❌，必须修正后重新检查，不得跳过输出。**

---

## 检查清单

- [ ] ✅ **1. 非 index 文件无直接 re-export**：`export ... from` 语法设计用于 barrel module，非 index 文件中不得出现 `export { X } from '...'` 或 `export * from '...'`
  - ❌ 错误示例：`schemas.ts` 中写 `export { AnatomySchema } from "@repo/schemas"`
  - ✅ 正确示例：消费文件直接 `import { AnatomySchema } from "@repo/schemas"`

- [ ] ✅ **2. 非 index 文件无间接 re-export**：不得先 import 再将相同标识符 export 出去，即使本地用到了该值也不例外——消费方应直接从来源包 import
  - ❌ 错误示例：`import { AnatomySchema } from '@repo/schemas'; export { AnatomySchema };`
  - ✅ 正确示例：仅在本文件内使用，不对外导出；消费方自行 `import { AnatomySchema } from "@repo/schemas"`

- [ ] ✅ **3. 无内容全为 re-export 的中间层文件**：若一个文件的全部内容都是 re-export（无原创定义），该文件应被删除
  - ❌ 错误示例：`shared/schemas.ts` 仅有 `export { AnatomySchema } from '@repo/schemas'`
  - ✅ 正确示例：删除 `shared/schemas.ts`，消费方改为直接 `import { AnatomySchema } from '@repo/schemas'`

- [ ] ✅ **4. 共享值从唯一来源 import**：跨多文件共享的值，从其原始定义包直接 import，不通过中间文件转发
  - ❌ 错误示例：多个 service 都从 `./schemas` 取 `AnatomySchema`，而 `schemas.ts` 仅是转发自 `@repo/schemas`
  - ✅ 正确示例：各 service 均直接 `import { AnatomySchema } from "@repo/schemas"`

- [ ] ✅ **5. export default 不用于转发**：非 index 文件不得通过 `export default` 转发其他模块的导出
  - ❌ 错误示例：`import { AnatomySchema } from './schemas'; export default AnatomySchema;`
  - ✅ 正确示例：消费方直接 `import { AnatomySchema } from "@repo/schemas"`