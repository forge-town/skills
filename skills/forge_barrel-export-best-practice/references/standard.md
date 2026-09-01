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

### 必须使用通配符导出
```ts
// src/components/index.ts
export * from './Button'
export * from './Input'
```

**禁止**使用显式命名导出：`export { Button } from './Button'` ❌

---

## 反模式（Anti-Patterns）

### ❌ 包含业务逻辑
```ts
// WRONG: index.ts 中出现业务逻辑
export const API_BASE = '/api/v1'       // 应放在 constants.ts
export function helper() { ... }         // 应放在 helper.ts
export * from './Button'
```

### ❌ 默认导出
```ts
// WRONG: 桶导出文件中使用 default export
export * from './Button'
export default Button                    // 禁止
```

### ❌ 显式命名导出
```ts
// WRONG: 必须使用 export *，禁止显式命名导出
export { Button } from './Button'        // 禁止
export type { ButtonProps } from './Button'  // 禁止
```

### ❌ 别名路径
```ts
// WRONG: 使用 @ 别名路径
export * from '@/components/Button'      // 禁止
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
      Button.spec.tsx     ← Vitest 测试
      index.ts            ← 桶导出：export * from './Button'
    Input/
      Input.tsx
      index.ts            ← 桶导出：export * from './Input'
    index.ts              ← 顶级桶导出：export * from './Button'; export * from './Input'
```

---

## 检查工具

使用 `forge_check-barrel-export` 技能自动检查/生成/修复所有 index 文件
