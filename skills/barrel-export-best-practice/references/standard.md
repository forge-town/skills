# 桶导出标准（Barrel Export Standard）

## 什么是桶导出

桶导出（Barrel Export）是一种模块组织模式：每个目录下的 `index.ts` 文件**只**负责将该目录中的所有公共模块统一 re-export，供外部使用者通过单一路径导入。

```ts
// ✅ 正确的桶导出文件：src/components/index.ts
export * from './Button'
export * from './Input'
```

---

## 合规示例

### 通配符导出（推荐）
```ts
// src/components/index.ts
export * from './Button'
export * from './Input'
```

### 显式命名导出（需要隐藏内部符号时使用）
```ts
// src/lib/index.ts
export { formatDate } from './formatDate'
export { parseJSON } from './parseJSON'
export type { DateConfig } from './formatDate'
```

---

## 反模式（Anti-Patterns）

### ❌ 包含业务逻辑
```ts
// WRONG: index.ts 中出现业务逻辑
export const API_BASE = '/api/v1'       // 应放在 constants.ts
export function helper() { ... }         // 应放在 helper.ts
export { Button } from './Button'
```

### ❌ 默认导出
```ts
// WRONG: 桶导出文件中使用 default export
export { Button } from './Button'
export default Button                    // 禁止
```

### ❌ 别名路径
```ts
// WRONG: 使用 @ 别名路径
export { Button } from '@/components/Button'   // 禁止
```

### ❌ 循环依赖
```ts
// WRONG: Button.tsx 中 import { Input } from '../index' 会形成循环
// index.ts → Button.tsx → index.ts (循环!)
```

---

## 目录结构示例

```
src/
  components/
    Button/
      Button.tsx          ← 组件实现
      Button.test.tsx     ← 测试
      index.ts            ← 桶导出：export { Button } from './Button'
    Input/
      Input.tsx
      index.ts
    index.ts              ← 顶级桶导出：export { Button } from './Button'; export { Input } from './Input'
```

---

## 检查工具

使用 `check-barrel-export` 技能自动检查/生成/修复所有 index 文件
