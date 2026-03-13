# Storybook Stories 代码示例

## CSF3 基础模板

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { XxxCard } from "./XxxCard";

const meta: Meta<typeof XxxCard> = {
  title: "Components/XxxCard",
  component: XxxCard,
};

export default meta;
type Story = StoryObj<typeof XxxCard>;

// Case 1: Base — 每个 props 传入典型值
export const Base: Story = {
  args: {
    title: "典型标题",
    description: "这是一段典型描述文本，展示组件的基本外观",
    status: "active",
    onClick: () => console.log("clicked"),
  },
};

// Case 2: Default — 严格不传任何 props
export const Default: Story = {
  args: {},
};

// Case 3: BaseUsage — 结合真实业务场景，使用 render 函数
export const BaseUsage: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-6">
      <XxxCard title="卡片一" description="第一个卡片" />
      <XxxCard title="卡片二" description="第二个卡片" status="inactive" />
    </div>
  ),
};

// Case 4+: 其他代表性 Cases（根据组件特性设计）
export const Loading: Story = {
  args: {
    loading: true,
    title: "加载中",
  },
};

export const LongContent: Story = {
  args: {
    title: "这是一个非常长的标题，用于测试文本截断或换行处理",
    description:
      "这是一段非常长的描述文本，包含了很多内容，用于测试组件在内容较多时的布局表现和溢出处理策略",
  },
};
```

---

## 常见 Case 写法模式

### 使用 render 函数（BaseUsage 标准写法）

```tsx
export const BaseUsage: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-4 p-6">
      {mockItems.map((item) => (
        <XxxCard key={item.id} {...item} />
      ))}
    </div>
  ),
};
```

### 带 Decorator 的写法（需要特定上下文时）

```tsx
export const WithProvider: Story = {
  decorators: [
    (Story) => (
      <SomeProvider>
        <Story />
      </SomeProvider>
    ),
  ],
  args: {
    title: "需要 Provider 的场景",
  },
};
```

### args 中使用 action

```tsx
import { fn } from "@storybook/test";

const meta: Meta<typeof XxxCard> = {
  title: "Components/XxxCard",
  component: XxxCard,
  args: {
    onClick: fn(),
    onDelete: fn(),
  },
};
```

---

## 常见代表性 Cases 命名参考

| Case 名        | 适用场景                             |
| -------------- | ------------------------------------ |
| `Loading`      | 组件有加载态                         |
| `Empty`        | 无数据/空状态                        |
| `Disabled`     | 禁用状态                             |
| `Error`        | 错误/失败状态                        |
| `Selected`     | 选中状态                             |
| `WithImage`    | 带图片版本                           |
| `WithoutImage` | 无图片版本                           |
| `LongContent`  | 长文本/边界内容测试                  |
| `Small`        | 小尺寸变体                           |
| `Large`        | 大尺寸变体                           |
| `WithBadge`    | 带徽标/标签                          |
| `Interactive`  | 展示交互行为（hover/click 等）       |
| `InList`       | 在列表中使用（配合 BaseUsage 使用）  |
