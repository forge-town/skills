# 组件设计全面检查清单

执行规则：**逐项扫描，发现任意一项立即标记并报告给用户，不得跳过。**

---

## 一、God Component 检查

- [ ] ✅ 不存在超过 200 行的组件（简单页面除外）
  - ❌ Bad：`UserDashboard.tsx` 有 500+ 行，包含数据获取、多个 Tab、表单处理等
  - 应改为：拆分为 `UserHeader`、`UserTabs`、`UserOrders`、`UserSettings` 等

- [ ] ✅ 不存在包含 5 个以上 useState 的组件
  - ❌ Bad：一个组件管理 8 个 state
  - 应改为：将相关 state 抽取到子组件或 custom hook

- [ ] ✅ 不存在包含 5 个以上处理函数的组件
  - ❌ Bad：`handleCreate`、`handleUpdate`、`handleDelete`、`handleExport`、`handleImport` 都在一个组件
  - 应改为：按功能拆分到不同组件

- [ ] ✅ 不存在渲染 3 个以上独立区块的组件
  - ❌ Bad：一个组件渲染 Header + Sidebar + Main + Footer + Modal
  - 应改为：每个区块独立为组件

---

## 二、配置驱动检查

- [ ] ✅ 不存在配置数组驱动的复杂组件
  - ❌ Bad：`tabs={[{id, label, content}]}` 传递内容配置
  - 应改为：使用组合模式 `<Tabs><TabsList>...</TabsList><TabsContent>...</TabsContent></Tabs>`

- [ ] ✅ 不存在 props 超过 10 个的组件
  - ❌ Bad：`interface Props { a, b, c, d, e, f, g, h, i, j, k }`
  - 应改为：使用组合拆分或 context

- [ ] ✅ 不存在布尔开关过多的组件
  - ❌ Bad：`showHeader`、`hideFooter`、`isCompact`、`enableScroll` 等大量布尔值
  - 应改为：使用组合或 variant 模式

---

## 三、Props Drilling 检查

- [ ] ✅ 不存在仅用于透传的 props
  - ❌ Bad：组件接收 prop 后原样传递给子组件，自身不使用
  - 应改为：子组件直接从 Store 获取

- [ ] ✅ 不存在 `{...props}` 展开传递实体数据
  - ❌ Bad：`<Child {...props} />` 传递大量数据
  - 应改为：明确传递需要的属性，或使用 Store

---

## 四、样式封闭检查

- [ ] ✅ 所有组件接受 className 参数
  - ❌ Bad：组件不接受 className，样式完全内部控制
  - 应改为：`className={cn("base", className)}`

- [ ] ✅ 使用 cn() 工具函数合并样式
  - ❌ Bad：直接拼接字符串 `className={`btn ${className}`}`
  - 应改为：使用 `cn("btn", className)`

- [ ] ✅ 使用 cva 管理变体样式
  - ❌ Bad：组件内部大量条件判断样式
  - 应改为：`const variants = cva("base", { variants: { variant, size } })`

---

## 五、Ref 转发检查

- [ ] ✅ 可交互组件使用 forwardRef
  - ❌ Bad：`Input`、`Button`、`Select` 等组件无法接收 ref
  - 应改为：`const Input = React.forwardRef<HTMLInputElement, InputProps>(...)`

- [ ] ✅ 设置了 displayName
  - ❌ Bad：`forwardRef` 后没有设置 `Component.displayName`
  - 应改为：`Input.displayName = "Input"`

---

## 六、导出规范检查

- [ ] ✅ 使用命名导出
  - ❌ Bad：`export default function Component()`
  - 应改为：`export function Component()`

- [ ] ✅ 导出组件类型
  - ❌ Bad：只导出组件，不导出 Props 类型
  - 应改为：`export type { ComponentProps }`

---

## 七、业务耦合检查

- [ ] ✅ UI 组件（components/ui/）不调用 API
  - ❌ Bad：`Button` 组件内部调用 `fetch()`
  - 应改为：UI 组件只接收回调函数

- [ ] ✅ UI 组件不依赖业务数据结构
  - ❌ Bad：`UserCard` 直接解构 `user.role.permissions`
  - 应改为：`UserCard` 接收 `name`、`avatar` 等原始值

- [ ] ✅ 业务逻辑在 hooks 或 services 中
  - ❌ Bad：组件内部直接写 `fetch().then().catch()`
  - 应改为：使用 `useUser()` 或 `userService.fetch()`

---

## 八、可访问性检查

- [ ] ✅ 交互元素有正确的 ARIA 属性
  - ❌ Bad：自定义按钮没有 `role="button"` 或 `aria-label`
  - 应改为：使用语义化 HTML 或正确添加 ARIA

- [ ] ✅ 表单元素有正确的 label 关联
  - ❌ Bad：`<input />` 没有对应的 `<label>` 或 `aria-labelledby`
  - 应改为：使用 `Label` 组件关联或 `aria-label`

---

## 九、文件组织检查

- [ ] ✅ 文件名使用 PascalCase
  - ❌ Bad：`userCard.tsx`、`user-card.tsx`
  - 应改为：`UserCard.tsx`

- [ ] ✅ 组件名与文件名一致
  - ❌ Bad：文件 `Button.tsx` 导出 `PrimaryButton`
  - 应改为：文件和导出名一致

- [ ] ✅ 一个文件一个组件（UI 组件）
  - ❌ Bad：`components.tsx` 导出多个组件
  - 应改为：每个组件独立文件，使用 index.ts 聚合

---

## 十、复杂度检查

- [ ] ✅ 组件圈复杂度不超过 10
  - ❌ Bad：大量嵌套 if/else、switch、条件渲染
  - 应改为：抽取子组件或使用策略模式

- [ ] ✅ 嵌套层级不超过 4 层
  - ❌ Bad：JSX 嵌套 6-7 层
  - 应改为：提前 return 或抽取子组件

---

## 十一、检查结果汇总

- [ ] ✅ 已记录所有发现的违规位置（文件路径 + 行号）
- [ ] ✅ 已分类统计：God Component / 配置驱动 / Props Drilling / 样式问题 / 其他
- [ ] ✅ 已为每类问题提供具体重构建议
- [ ] ✅ 已按严重程度排序（Error / Warning / Info）

---

## 十二、Bad Case 确认（以下情况不得出现）

- [ ] ❌ 不存在 500+ 行的 God Component
- [ ] ❌ 不存在配置数组驱动的 Tabs/Modal/Card
- [ ] ❌ 不接受 className 的组件
- [ ] ❌ 没有 forwardRef 的 Input/Button/Select
- [ ] ❌ 默认导出的组件
- [ ] ❌ UI 组件调用 API 或处理业务逻辑
- [ ] ❌ 一个文件包含 3+ 个组件
