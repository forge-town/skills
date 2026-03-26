# 扫描与拆分工作流

## 核心原则

- 每个文件有且仅有**一个**导出的 React/Vue 组件（`export function` / `export const` / `export default`）
- 允许存在辅助型非组件内容：纯函数、常量、类型定义、样式对象
- 允许行数 < 10 行且**不被其他文件引用**的内联子组件；超出则必须拆分

## Step 1：识别目标文件

根据用户提供的路径，定位需要检查的 `.tsx` / `.jsx` / `.vue` 文件。若用户要求扫描整个目录，则递归处理所有组件文件。

## Step 2：检测违规

在每个文件中检测以下模式，同时存在 ≥ 2 个即为违规：

```
export function XxxComponent
export const XxxComponent = (
export default function XxxComponent
const XxxComponent = React.forwardRef(
const XxxComponent = memo(
```

**不算违规的情形：**
- 同一组件同时具名 + 默认导出
- 只导出类型、接口、常量、hooks（无 JSX 返回值）

## Step 3：输出违规报告

```
[违规] src/components/UserCard.tsx
  - UserCard（主组件）
  - UserAvatar（应拆分 → src/components/UserAvatar.tsx）
  - UserBadge（应拆分 → src/components/UserBadge.tsx）
```

## Step 4：执行拆分

对每个需拆分的子组件：

1. 新建文件，路径与主组件同目录，文件名与组件名一致（PascalCase.tsx）
2. 将子组件代码及其依赖的 import 一并迁移到新文件
3. 从原文件删除子组件定义，改为 `import { XxxComponent } from './XxxComponent'`
4. 确认两个文件各自无循环依赖
5. 若存在 `index.ts` barrel 文件，同步更新导出
