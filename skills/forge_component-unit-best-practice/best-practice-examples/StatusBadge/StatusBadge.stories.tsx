import type { Meta, StoryObj } from "@storybook/react";
import { StatusBadge } from "./StatusBadge";

const meta: Meta<typeof StatusBadge> = {
  title: "Components/StatusBadge",
  component: StatusBadge,
};

export default meta;
type Story = StoryObj<typeof StatusBadge>;

export const Base: Story = {
  args: {
    variant: "online",
  },
};

export const Default: Story = {
  args: {},
};

export const BaseUsage: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2 p-4">
      <StatusBadge variant="online" />
      <StatusBadge variant="offline" />
      <StatusBadge variant="busy" />
      <StatusBadge variant="away" />
    </div>
  ),
};

export const CustomLabel: Story = {
  args: {
    variant: "online",
    label: "Active",
  },
};
