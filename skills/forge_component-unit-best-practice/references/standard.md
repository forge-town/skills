# Component Unit 目录结构规范

## 标准文件夹布局

每个组件必须以独立文件夹形式存在，且包含以下三个文件：

```
ComponentName/
├── index.ts                    # 桶导出（barrel）
├── ComponentName.tsx           # 组件本身
├── ComponentName.spec.tsx      # 行为测试（Vitest）
└── ComponentName.stories.tsx   # Storybook 故事文件
```

## 各文件职责

### `index.ts` — 桶导出
```ts
export * from "./ComponentName";
```

### `ComponentName.tsx` — 组件
- 仅导出一个主组件（遵循 one-component-per-file 原则）
- Props 类型必须导出（`export type ComponentNameProps`）
- 禁止在组件文件中引入测试或 story 相关代码

### `ComponentName.spec.tsx` — 行为测试
- 使用 Vitest + Testing Library；行为测试文件统一使用 `.spec.tsx`
- 覆盖：渲染、Props 传入、用户交互、边界条件
- 测试文件必须与组件文件同目录

```tsx
import { render, screen } from "@testing-library/react";
import { ComponentName } from "./ComponentName";

describe("ComponentName", () => {
  it("renders correctly", () => {
    render(<ComponentName />);
    // ...
  });
});
```

### `ComponentName.stories.tsx` — Storybook
- 参考 [forge_storybook-best-practice](../../forge_storybook-best-practice/SKILL.md) 规范
- 必须包含 Default story（args: {}）
- 为每个重要 Props 变体提供独立 Story

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { ComponentName } from "./ComponentName";

const meta: Meta<typeof ComponentName> = {
  component: ComponentName,
};
export default meta;

type Story = StoryObj<typeof ComponentName>;

export const Default: Story = { args: {} };
```

## 禁止模式

- 组件直接以单文件（`ComponentName.tsx`）形式存放，没有文件夹
- 文件夹内缺少单元测试或 Storybook 文件
- 一个文件夹内包含多个组件
- 测试或故事文件放在单独的 `__tests__/` 或 `stories/` 目录（必须与组件同级）
