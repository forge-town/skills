# Component Unit 检查清单

## 目录结构
- [ ] 1.1 组件以独立文件夹形式存在（`ComponentName/`，PascalCase）
- [ ] 1.2 文件夹内包含 `index.ts` 桶导出文件
- [ ] 1.3 文件夹内包含 `ComponentName.tsx` 组件文件
- [ ] 1.4 文件夹内包含 `ComponentName.test.tsx` 单元测试文件
- [ ] 1.5 文件夹内包含 `ComponentName.stories.tsx` Storybook 故事文件
- [ ] 1.6 所有文件名与文件夹名一致（PascalCase）

## 组件文件（ComponentName.tsx）
- [ ] 2.1 只导出一个主组件（遵循 one-component-per-file）
- [ ] 2.2 Props 类型已导出（`export type ComponentNameProps`）
- [ ] 2.3 无测试/story 相关代码混入

## 单元测试（ComponentName.test.tsx）
- [ ] 3.1 测试文件与组件同目录
- [ ] 3.2 使用 Vitest 或 Jest + Testing Library
- [ ] 3.3 至少覆盖：默认渲染、必传 Props、基本交互
- [ ] 3.4 无 console.log 残留

## Storybook（ComponentName.stories.tsx）
- [ ] 4.1 故事文件与组件同目录
- [ ] 4.2 包含 Default Story（`args: {}`）
- [ ] 4.3 对主要 Props 变体提供独立 Story
- [ ] 4.4 遵循 [storybook-best-practice](../../storybook-best-practice/SKILL.md) 规范

## 桶导出（index.ts）
- [ ] 5.1 使用 `export * from './ComponentName'` 导出组件
- [ ] 5.2 无除组件外的额外内容混入

## Bad Case 确认
- [ ] ❌ 不存在组件以单文件形式（不含文件夹）存放的情况
- [ ] ❌ 不存在文件夹内缺少单元测试或 Storybook 故事文件的情况
- [ ] ❌ 不存在一个文件夹内包含多个组件的情况
- [ ] ❌ 不存在测试或故事文件放在单独的 `__tests__/` / `stories/` 目录而非与组件同级的情况
