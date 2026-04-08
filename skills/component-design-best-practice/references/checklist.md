# 组件设计检查清单

执行规则：**逐项勾选，若有任何一项为 ❌，必须修正后重新检查，不得跳过输出。**

---

## 一、组件必要性检查

- [ ] ✅ 组件有明确的单一职责
  - ❌ Bad：一个组件既处理用户数据又处理产品列表
  - ✅ Good：`UserCard` 只展示用户信息，`ProductList` 只展示产品

- [ ] ✅ 组件被复用 2 次以上，或有明确的复用潜力
  - ❌ Bad：只使用一次的过度拆分
  - ✅ Good：识别出通用模式并抽象为组件

- [ ] ✅ 不是过早抽象
  - ❌ Bad：仅为了 5 行代码创建组件
  - ✅ Good：内联代码直到重复出现或逻辑复杂

---

## 二、组件粒度检查

- [ ] ✅ 原子组件（UI 组件）无业务逻辑
  - ❌ Bad：`Button` 组件内部调用 API
  - ✅ Good：`Button` 只关注样式和交互

- [ ] ✅ 分子组件由原子组件组合而成
  - ❌ Bad：直接写原生 HTML 而非使用现有 UI 组件
  - ✅ Good：`SearchInput = Input + SearchIcon + ClearButton`

- [ ] ✅ 有机体组件包含业务逻辑但保持聚焦
  - ❌ Bad：`UserPage` 包含所有功能
  - ✅ Good：`UserPage` 组合 `UserHeader` + `UserTabs` + `UserSettings`

---

## 三、Props 设计检查

- [ ] ✅ Props 最小化，继承 HTML 属性
  - ❌ Bad：`interface ButtonProps { onClick, disabled, className, style... }`
  - ✅ Good：`interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>`

- [ ] ✅ 使用组合替代配置驱动
  - ❌ Bad：`tabs={[{id, label, content}]}` 配置数组
  - ✅ Good：`<Tabs><TabsList><TabsTrigger/></TabsList><TabsContent/></Tabs>`

- [ ] ✅ 提供 `className` 扩展点
  - ❌ Bad：组件不允许外部样式覆盖
  - ✅ Good：`className={cn("base", className)}`

- [ ] ✅ 复杂配置使用 `cva` (class-variance-authority)
  - ❌ Bad：组件内部大量条件判断样式
  - ✅ Good：`const buttonVariants = cva("base", { variants: { variant, size } })`

---

## 四、可组合性检查

- [ ] ✅ 支持 `asChild` 模式（使用 Radix Slot）
  - ❌ Bad：`<Button onClick={...}>` 只能渲染 button
  - ✅ Good：`<Button asChild><Link href="..."/></Button>`

- [ ] ✅ 子组件通过组合而非 props 传递
  - ❌ Bad：`<Card title="..." content="..." footer="..." />`
  - ✅ Good：`<Card><CardHeader/><CardContent/><CardFooter/></Card>`

---

## 五、可访问性检查

- [ ] ✅ 正确的 ARIA 属性
  - ❌ Bad：自定义按钮无 `role="button"`
  - ✅ Good：使用正确的语义化 HTML 和 ARIA

- [ ] ✅ 键盘导航支持
  - ❌ Bad：Dropdown 只能鼠标操作
  - ✅ Good：支持 Tab、Enter、Escape 键盘操作

- [ ] ✅ 焦点管理正确
  - ❌ Bad：Modal 打开后焦点仍在背景
  - ✅ Good：Modal 自动聚焦第一个可交互元素

---

## 六、代码结构检查

- [ ] ✅ 文件使用 PascalCase 命名
  - ❌ Bad：`userCard.tsx`、`user-card.tsx`
  - ✅ Good：`UserCard.tsx`

- [ ] ✅ 组件名与文件名一致
  - ❌ Bad：文件 `Avatar.tsx` 导出 `UserAvatar`
  - ✅ Good：文件 `Avatar.tsx` 导出 `Avatar`

- [ ] ✅ 使用 `forwardRef` 转发 ref
  - ❌ Bad：组件无法接收 ref
  - ✅ Good：`const Button = React.forwardRef<...>(...)`

- [ ] ✅ 设置 `displayName`
  - ❌ Bad：`Button.displayName` 未设置
  - ✅ Good：`Button.displayName = "Button"`

- [ ] ✅ 类型命名规范
  - ❌ Bad：`Props`、`ButtonPropsType`
  - ✅ Good：`ButtonProps`

---

## 七、导出规范检查

- [ ] ✅ 命名导出而非默认导出
  - ❌ Bad：`export default function Button()`
  - ✅ Good：`export function Button()` 或 `export { Button }`

- [ ] ✅ 导出组件和类型
  - ✅ Good：`export { Button, buttonVariants }; export type { ButtonProps };`

---

## 八、Bad Case 确认（以下情况不得出现）

- [ ] ❌ 不存在 God Component（包揽所有功能的超大组件）
- [ ] ❌ 不存在 Props Drilling（透传 props 而不使用）
- [ ] ❌ 不存在与业务耦合的 UI 组件
- [ ] ❌ 不存在无法样式覆盖的组件
- [ ] ❌ 不存在配置对象驱动的复杂组件
- [ ] ❌ 不存在没有类型定义的组件
