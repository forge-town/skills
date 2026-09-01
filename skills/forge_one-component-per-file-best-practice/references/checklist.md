# 一文件一组件规范检查清单

## 组件导出规范
- [ ] 1.1 每个 `.tsx` / `.jsx` / `.vue` 文件只有一个导出组件
  - ✅ 正确：`Button.tsx` 只 export `Button`
  - ❌ 错误：`Button.tsx` 同时 export `Button` 和 `ButtonIcon`
- [ ] 1.2 拆分出的文件命名与组件名完全一致（PascalCase）
  - ✅ 正确：组件名 `UserCard` → 文件名 `UserCard.tsx`
  - ❌ 错误：组件名 `UserCard` → 文件名 `user-card.tsx`
- [ ] 1.3 子组件定义已从父组件文件中移除，改为 import
  - ✅ 正确：`import { Avatar } from './Avatar'`
  - ❌ 错误：在 `UserCard.tsx` 内部定义 `function Avatar() {...}`

## 模块引用
- [ ] 2.1 所有 import 路径正确，无缺失依赖
- [ ] 2.2 `index.ts` 桶导出文件已同步更新（若存在）
  - ✅ 正确：新拆分的组件已加入 `index.ts`
  - ❌ 错误：新文件未在 `index.ts` 中导出

## Bad Case 确认
- [ ] ❌ 不存在一个文件定义多个导出组件的情况
- [ ] ❌ 不存在被其他文件引用的组件定义在别的组件文件内部的情况
- [ ] ❌ 不存在拆分后文件名与组件名不一致的情况
