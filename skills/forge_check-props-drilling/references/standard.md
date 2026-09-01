# Props Drilling 规范

## 什么是 Props Drilling

Props Drilling（Props 透传）是指：
- 组件 A 从父组件接收 prop X
- 组件 A 并不直接使用 prop X
- 组件 A 只是将 prop X 传递给子组件 B

这种情况通常意味着数据应该直接从 Store 获取，而不是通过中间层传递。

## 检测标准

### 一级 Props Drilling（明显违规）

组件接收 props，但：
1. 在 JSX 中直接展开传递给子组件（如 `{...props}`）
2. 在 render 中解构后原样传递给子组件
3. 仅用于条件渲染判断，不直接展示或使用

```tsx
// ❌ 明显 Props Drilling
function UserCard({ user, onUpdate }) {
  // user 和 onUpdate 都没有直接使用
  return <UserDetails user={user} onUpdate={onUpdate} />;
}
```

### 二级 Props Drilling（建议优化）

Props 传递链超过 2 层：
- Page → Container → Component → SubComponent

即使每层都有少量使用，深层传递也建议使用 Context 或 Store。

### 允许的情况（不是 Drilling）

以下情况**不属于** Props Drilling：

1. **组件组合模式** - 父组件通过 props 控制子组件行为
```tsx
// ✅ 不是 Drilling：Button 接收 variant 并直接使用
function Button({ variant, children }) {
  return <button className={`btn-${variant}`}>{children}</button>;
}
```

2. **Presentational 组件** - 纯展示组件接收数据并渲染
```tsx
// ✅ 不是 Drilling：UserAvatar 直接使用 user 渲染
function UserAvatar({ user }) {
  return <img src={user.avatar} alt={user.name} />;
}
```

3. **回调函数** - 事件处理函数透传是合理的
```tsx
// ✅ 允许：事件回调透传
function Form({ onSubmit }) {
  return <form onSubmit={onSubmit}>...</form>;
}
```

## 重构为 Store 的标准

当出现以下情况时，应该使用 Zustand Store 替代 Props：

| 场景 | 说明 |
|------|------|
| 全局用户数据 | `user`、`isAuthenticated`、`permissions` |
| 跨页面共享状态 | `theme`、`locale`、`sidebarCollapsed` |
| 深层嵌套数据 | 超过 2 层传递的实体数据 |
| 频繁访问的数据 | 多个组件都需要读取的列表数据 |

## 重构方法

### Before（Props Drilling）

```tsx
// Page.tsx
function UserPage() {
  const { user } = useUserStore();
  return <UserCard user={user} />;
}

// UserCard.tsx（中间层）
function UserCard({ user }) {
  // 只是传递，没有使用 user
  return (
    <Card>
      <UserHeader user={user} />
      <UserBody user={user} />
    </Card>
  );
}

// UserHeader.tsx
function UserHeader({ user }) {
  return <h1>{user.name}</h1>;
}
```

### After（使用 Store）

```tsx
// Page.tsx
function UserPage() {
  return <UserCard />;
}

// UserCard.tsx（中间层）
function UserCard() {
  // 不再需要接收 user prop
  return (
    <Card>
      <UserHeader />
      <UserBody />
    </Card>
  );
}

// UserHeader.tsx
function UserHeader() {
  const { user } = useUserStore(); // 直接从 store 获取
  return <h1>{user.name}</h1>;
}
```
