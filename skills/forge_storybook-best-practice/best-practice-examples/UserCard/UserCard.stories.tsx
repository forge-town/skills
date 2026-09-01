import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { UserCard } from "./UserCard";

// ============================================================
// meta
// ============================================================
const meta: Meta<typeof UserCard> = {
  title: "Components/UserCard",
  component: UserCard,
  args: {
    onMessage: fn(),
    onViewProfile: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof UserCard>;

// ============================================================
// Case 1 — Base: 每个 props 都传入典型值
// ============================================================
export const Base: Story = {
  args: {
    name: "张三",
    email: "zhangsan@example.com",
    avatarUrl: "https://i.pravatar.cc/150?img=3",
    role: "前端工程师",
    status: "online",
  },
};

// ============================================================
// Case 2 — Default: 严格不传任何 props，展示零配置状态
// ============================================================
export const Default: Story = {
  args: {},
};

// ============================================================
// Case 3 — BaseUsage: 模拟团队成员列表的真实使用场景
// ============================================================
export const BaseUsage: Story = {
  render: () => (
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-4">团队成员</h2>
      <div className="flex flex-wrap gap-4">
        <UserCard
          name="张三"
          email="zhangsan@example.com"
          avatarUrl="https://i.pravatar.cc/150?img=3"
          role="前端工程师"
          status="online"
          onMessage={() => {}}
          onViewProfile={() => {}}
        />
        <UserCard
          name="李四"
          email="lisi@example.com"
          avatarUrl="https://i.pravatar.cc/150?img=5"
          role="后端工程师"
          status="busy"
          onMessage={() => {}}
          onViewProfile={() => {}}
        />
        <UserCard
          name="王五"
          email="wangwu@example.com"
          role="产品经理"
          status="away"
          onMessage={() => {}}
          onViewProfile={() => {}}
        />
        <UserCard
          name="赵六"
          email="zhaoliu@example.com"
          avatarUrl="https://i.pravatar.cc/150?img=9"
          role="UI 设计师"
          status="offline"
        />
      </div>
    </div>
  ),
};

// ============================================================
// Case 4 — Offline: 离线状态
// ============================================================
export const Offline: Story = {
  args: {
    name: "王五",
    email: "wangwu@example.com",
    avatarUrl: "https://i.pravatar.cc/150?img=7",
    role: "产品经理",
    status: "offline",
  },
};

// ============================================================
// Case 5 — NoAvatar: 无头像时的回退展示
// ============================================================
export const NoAvatar: Story = {
  args: {
    name: "李四",
    email: "lisi@example.com",
    role: "后端工程师",
    status: "online",
    onMessage: fn(),
    onViewProfile: fn(),
  },
};

// ============================================================
// Case 6 — LongContent: 长文本截断测试
// ============================================================
export const LongContent: Story = {
  args: {
    name: "欧阳修远明德同学",
    email: "ouyangxiuyuanmingde.tongxue@very-long-domain-name.company.com",
    role: "高级全栈工程师 & 技术负责人",
    status: "busy",
    onMessage: fn(),
  },
};

// ============================================================
// Case 7 — ReadOnly: 无操作按钮的只读状态
// ============================================================
export const ReadOnly: Story = {
  args: {
    name: "赵六",
    email: "zhaoliu@example.com",
    avatarUrl: "https://i.pravatar.cc/150?img=12",
    role: "UI 设计师",
    status: "online",
    // 不传 onMessage / onViewProfile，不渲染 Footer
  },
};
