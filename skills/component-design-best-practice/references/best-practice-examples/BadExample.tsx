/**
 * ❌ Bad Example: 违反 shadcn/ui 设计哲学的反模式
 *
 * 这些模式在重构时应该避免
 */

import * as React from "react";

// ========================================
// 反模式 1: God Component（包揽所有功能）
// ========================================

interface UserDashboardProps {
  userId: string;
}

// ❌ 这个组件做了太多事情：
// - 获取用户数据
// - 获取订单数据
// - 获取统计数据
// - 渲染用户信息
// - 渲染订单列表
// - 渲染统计图表
// - 处理编辑用户
// - 处理删除订单
// - 处理导出数据
// 等等...
function UserDashboard({ userId }: UserDashboardProps) {
  const [user, setUser] = React.useState(null);
  const [orders, setOrders] = React.useState([]);
  const [stats, setStats] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState("overview");
  const [isEditing, setIsEditing] = React.useState(false);
  const [editForm, setEditForm] = React.useState({});

  React.useEffect(() => {
    // 获取所有数据...
    fetchUser(userId).then(setUser);
    fetchOrders(userId).then(setOrders);
    fetchStats(userId).then(setStats);
    setLoading(false);
  }, [userId]);

  const handleEditUser = () => {
    /* ... */
  };
  const handleDeleteOrder = (orderId: string) => {
    /* ... */
  };
  const handleExportData = () => {
    /* ... */
  };
  const handleUpdateProfile = () => {
    /* ... */
  };
  // ... 更多处理函数

  if (loading) return <div>Loading...</div>;

  return (
    <div className="dashboard">
      <div className="header">
        <h1>用户仪表板</h1>
        <button onClick={handleExportData}>导出</button>
      </div>

      <div className="tabs">
        <button onClick={() => setActiveTab("overview")}>概览</button>
        <button onClick={() => setActiveTab("orders")}>订单</button>
        <button onClick={() => setActiveTab("stats")}>统计</button>
      </div>

      {activeTab === "overview" && (
        <div>
          {/* 用户信息编辑表单 */}
          {isEditing ? (
            <form onSubmit={handleEditUser}>
              <input
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
              />
              {/* 更多表单字段 */}
            </form>
          ) : (
            <div>
              <img src={user.avatar} />
              <h2>{user.name}</h2>
              <p>{user.email}</p>
              <button onClick={() => setIsEditing(true)}>编辑</button>
            </div>
          )}
        </div>
      )}

      {activeTab === "orders" && (
        <div>
          {/* 订单列表渲染 */}
          {orders.map((order) => (
            <div key={order.id}>
              <span>{order.id}</span>
              <span>{order.amount}</span>
              <button onClick={() => handleDeleteOrder(order.id)}>删除</button>
            </div>
          ))}
        </div>
      )}

      {/* 更多 tab 内容... */}
    </div>
  );
}

// ========================================
// 反模式 2: 配置驱动而非组合
// ========================================

interface TabsProps {
  tabs: Array<{
    id: string;
    label: string;
    content: React.ReactNode;
    disabled?: boolean;
    icon?: string;
    badge?: number;
  }>;
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  variant?: "default" | "pills" | "underline";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  className?: string;
  // ... 更多配置项
}

// ❌ 配置驱动：所有内容通过配置对象传递
function Tabs({
  tabs,
  defaultTab,
  onChange,
  variant = "default",
  size = "md",
  fullWidth = false,
  className,
}: TabsProps) {
  const [activeTab, setActiveTab] = React.useState(defaultTab || tabs[0]?.id);

  const activeContent = tabs.find((t) => t.id === activeTab)?.content;

  return (
    <div className={className}>
      <div className={`tabs-${variant} tabs-${size}`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            disabled={tab.disabled}
            className={activeTab === tab.id ? "active" : ""}
            style={{ width: fullWidth ? `${100 / tabs.length}%` : undefined }}
            onClick={() => {
              setActiveTab(tab.id);
              onChange?.(tab.id);
            }}
          >
            {tab.icon && <span className="icon">{tab.icon}</span>}
            {tab.label}
            {tab.badge !== undefined && (
              <span className="badge">{tab.badge}</span>
            )}
          </button>
        ))}
      </div>
      <div className="tab-content">{activeContent}</div>
    </div>
  );
}

// 使用方式：
// ❌ 所有内容压缩在配置中，难以阅读和维护
<Tabs
  tabs={[
    {
      id: "profile",
      label: "资料",
      content: (
        <div>
          <UserForm />
        </div>
      ),
      icon: "👤",
    },
    {
      id: "settings",
      label: "设置",
      content: <SettingsPanel />,
      badge: 3,
    },
  ]}
  variant="pills"
  size="lg"
  onChange={(id) => console.log(id)}
/>;

// ========================================
// 反模式 3: 不支持样式覆盖
// ========================================

// ❌ 不接受 className，无法外部定制样式
function Badge({ children, variant = "default" }: { children: React.ReactNode; variant?: string }) {
  // 样式硬编码在组件内部
  const styles = {
    default: { backgroundColor: "#007bff", color: "white", padding: "4px 8px", borderRadius: "4px" },
    success: { backgroundColor: "#28a745", color: "white", padding: "4px 8px", borderRadius: "4px" },
    error: { backgroundColor: "#dc3545", color: "white", padding: "4px 8px", borderRadius: "4px" },
  };

  return <span style={styles[variant]}>{children}</span>;
}

// 无法这样使用：
// ❌ <Badge className="my-custom-badge">内容</Badge>

// ========================================
// 反模式 4: 没有 forwardRef
// ========================================

// ❌ 无法接收 ref，导致无法集成到表单库等场景
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className="input" />;
}

// 无法使用：
// ❌ const inputRef = useRef();
// ❌ <Input ref={inputRef} />

// ========================================
// 反模式 5: 默认导出
// ========================================

// ❌ 默认导出不利于 tree-shaking 和 IDE 自动导入
export default function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

// ========================================
// 反模式 6: 与业务耦合的 UI 组件
// ========================================

// ❌ UI 组件不应该知道业务数据结构和 API
function ProductButton({ productId }: { productId: string }) {
  const [product, setProduct] = React.useState(null);

  // ❌ UI 组件内部调用 API
  React.useEffect(() => {
    fetch(`/api/products/${productId}`)
      .then((res) => res.json())
      .then(setProduct);
  }, [productId]);

  // ❌ UI 组件内部处理业务逻辑
  const handleAddToCart = () => {
    fetch("/api/cart", {
      method: "POST",
      body: JSON.stringify({ productId, quantity: 1 }),
    });
  };

  if (!product) return <button>加载中...</button>;

  return (
    <button onClick={handleAddToCart}>
      添加 {product.name} 到购物车 - ¥{product.price}
    </button>
  );
}

// ========================================
// 反模式总结
// ========================================

/**
 * 1. God Component: 一个组件做太多事，应该拆分成多个专注的组件
 *
 * 2. 配置驱动: 用配置对象传递所有内容，应该使用组合
 *
 * 3. 封闭样式: 不接受 className，应该允许外部样式覆盖
 *
 * 4. 无 forwardRef: 无法接收 ref，应该使用 forwardRef
 *
 * 5. 默认导出: export default，应该使用命名导出
 *
 * 6. 业务耦合: UI 组件知道业务逻辑，应该保持 UI 组件纯粹
 */

// 为了编译通过的空实现
function fetchUser(id: string) {
  return Promise.resolve({});
}
function fetchOrders(id: string) {
  return Promise.resolve([]);
}
function fetchStats(id: string) {
  return Promise.resolve({});
}
function UserForm() {
  return null;
}
function SettingsPanel() {
  return null;
}
