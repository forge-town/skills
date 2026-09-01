import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { ProductCard } from "./ProductCard";

// ============================================================
// meta
// ============================================================
const meta: Meta<typeof ProductCard> = {
  title: "Components/ProductCard",
  component: ProductCard,
  args: {
    onAddToCart: fn(),
    onToggleSelect: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof ProductCard>;

// ============================================================
// Case 1 — Base: 每个 props 都传入典型值
// ============================================================
export const Base: Story = {
  args: {
    image: "https://picsum.photos/seed/product/224/160",
    title: "2024 新款无线蓝牙耳机 主动降噪",
    price: 299,
    originalPrice: 499,
    rating: 4.7,
    reviewCount: 2341,
    category: "耳机 / 音频",
    inStock: true,
  },
};

// ============================================================
// Case 2 — Default: 严格不传任何 props，展示零配置状态
// ============================================================
export const Default: Story = {
  args: {},
};

// ============================================================
// Case 3 — BaseUsage: 模拟商品货架的真实业务场景
// ============================================================
export const BaseUsage: Story = {
  render: () => (
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-4">热销商品</h2>
      <div className="flex flex-wrap gap-4">
        <ProductCard
          image="https://picsum.photos/seed/p1/224/160"
          title="2024 新款无线蓝牙耳机 主动降噪"
          price={299}
          originalPrice={499}
          rating={4.7}
          reviewCount={2341}
          category="耳机 / 音频"
          inStock={true}
          onAddToCart={() => {}}
        />
        <ProductCard
          image="https://picsum.photos/seed/p2/224/160"
          title="智能手表 心率血氧监测 超长续航"
          price={899}
          rating={4.5}
          reviewCount={876}
          category="穿戴设备"
          inStock={true}
          onAddToCart={() => {}}
        />
        <ProductCard
          image="https://picsum.photos/seed/p3/224/160"
          title="机械键盘 87 键 RGB 背光"
          price={349}
          originalPrice={599}
          rating={4.8}
          reviewCount={5120}
          category="键盘 / 外设"
          inStock={false}
          onAddToCart={() => {}}
        />
        <ProductCard
          title="USB-C 多功能扩展坞"
          price={159}
          rating={4.3}
          reviewCount={432}
          category="配件"
          inStock={true}
          onAddToCart={() => {}}
        />
      </div>
    </div>
  ),
};

// ============================================================
// Case 4 — Loading: 骨架屏加载状态
// ============================================================
export const Loading: Story = {
  args: {
    loading: true,
  },
};

// ============================================================
// Case 5 — OutOfStock: 已售罄状态
// ============================================================
export const OutOfStock: Story = {
  args: {
    image: "https://picsum.photos/seed/oos/224/160",
    title: "限量联名款机械键盘",
    price: 699,
    originalPrice: 899,
    rating: 4.9,
    reviewCount: 318,
    category: "键盘 / 外设",
    inStock: false,
  },
};

// ============================================================
// Case 6 — Selected: 选中状态（高亮边框）
// ============================================================
export const Selected: Story = {
  args: {
    image: "https://picsum.photos/seed/sel/224/160",
    title: "无线充电板 15W 快充",
    price: 129,
    rating: 4.6,
    reviewCount: 1024,
    category: "充电 / 配件",
    inStock: true,
    selected: true,
  },
};

// ============================================================
// Case 7 — WithDiscount: 折扣标签显著展示
// ============================================================
export const WithDiscount: Story = {
  args: {
    image: "https://picsum.photos/seed/disc/224/160",
    title: "TWS 入耳式耳机 通话降噪版",
    price: 99,
    originalPrice: 399,
    rating: 4.2,
    reviewCount: 7890,
    category: "耳机 / 音频",
    inStock: true,
  },
};

// ============================================================
// Case 8 — LongContent: 长标题截断测试
// ============================================================
export const LongContent: Story = {
  args: {
    image: "https://picsum.photos/seed/long/224/160",
    title:
      "2024 旗舰款 第四代 ANC 主动降噪头戴式无线蓝牙耳机 Hi-Fi 音质 30 小时续航 折叠设计 附赠皮质收纳包",
    price: 1299,
    originalPrice: 1999,
    rating: 4.8,
    reviewCount: 512,
    category: "耳机 / 音频",
    inStock: true,
  },
};
