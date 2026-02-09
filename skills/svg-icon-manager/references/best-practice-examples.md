# SVG 图标管理最佳实践示例

## 目录
- [概述](#概述)
- [文件结构](#文件结构)
- [组件说明](#组件说明)
- [最佳实践](#最佳实践)

## 概述
基于实际项目的最佳实践，展示如何在业务场景中正确使用封装的 SVG 图标组件。

**目录说明：**
- `best-practice-examples/assets/` - 包含业务组件示例（UserVoteCard.tsx），展示如何使用 icons 目录中的 AccuracyIcon
- `best-practice-examples/components/icons/` - 包含抽离的 SVG 图标组件（AccuracyIcon.tsx）

## 文件结构

```
best-practice-examples/                   # 最佳实践示例目录
├── assets/                                # 业务组件示例
│   └── UserVoteCard.tsx                   # 展示如何使用 AccuracyIcon
├── components/                            # 组件目录
│   └── icons/                             # 图标组件目录
│       ├── index.ts                       # 桶导出入口
│       └── AccuracyIcon.tsx               # 进度环形图标
```

## 组件说明

### AccuracyIcon 组件

**使用场景：** 显示准确率、完成度等百分比指标

**关键特点：**
- 使用 `strokeDasharray` 实现进度环形效果
- 支持自定义颜色和类名
- 通过 CSS transform 实现旋转效果

**组件代码：** 见 [best-practice-examples/components/icons/AccuracyIcon.tsx](best-practice-examples/components/icons/AccuracyIcon.tsx)

### UserVoteCard 使用示例

**使用场景：** 展示如何在业务组件中正确使用 AccuracyIcon

**关键特点：**
- 简洁的示例，专注于展示 AccuracyIcon 的使用
- 保留核心的引用方式：`<AccuracyIcon className="w-12 h-12 transform -rotate-90" color="#10b981" />`
- 使用 Tailwind 类名控制大小和旋转
- 通过 color prop 自定义进度条颜色

**组件代码：** 见 [best-practice-examples/assets/UserVoteCard.tsx](best-practice-examples/assets/UserVoteCard.tsx)

### 桶导出方式

**文件：** [best-practice-examples/components/icons/index.ts](best-practice-examples/components/icons/index.ts)

**导出语法：**
```tsx
// components/icons/index.ts
// 桶导出所有图标组件
export * from './AccuracyIcon';
```

**导入方式：**
```tsx
import { AccuracyIcon } from "@/components/icons";
```

## 最佳实践

### ✅ 正确做法

**1. 使用桶导出**
```tsx
import { AccuracyIcon } from '@/components/icons';
```

**2. 使用 Tailwind 类名控制样式**
```tsx
<AccuracyIcon className="w-12 h-12 transform -rotate-90" color="#10b981" />
```

**3. 桶导出语法**
```tsx
// components/icons/index.ts
export * from './AccuracyIcon';
```

### ❌ 错误做法

**1. 内联 SVG**
```tsx
<svg viewBox="0 0 36 36">
  <path d="..." />
</svg>
```

**2. 直接导入组件文件**
```tsx
import { AccuracyIcon } from '@/components/icons/AccuracyIcon';
```

**3. 硬编码样式**
```tsx
<svg style={{ width: '48px', height: '48px' }} />
```

## 总结

基于实际项目的最佳实践：

1. **组件封装**：使用简单的接口（className, color），保持灵活性
2. **样式控制**：优先使用 Tailwind 类名，避免内联样式
3. **类型安全**：导出 Props 类型，提供完整的类型提示
4. **桶导出**：使用 `export *` 简化导入路径
5. **实际应用**：参考 UserVoteCard.tsx 中的使用方式

**详细组件代码：**
- AccuracyIcon.tsx：[best-practice-examples/components/icons/AccuracyIcon.tsx](best-practice-examples/components/icons/AccuracyIcon.tsx)
- UserVoteCard.tsx：[best-practice-examples/assets/UserVoteCard.tsx](best-practice-examples/assets/UserVoteCard.tsx)
- 桶导出：[best-practice-examples/components/icons/index.ts](best-practice-examples/components/icons/index.ts)
