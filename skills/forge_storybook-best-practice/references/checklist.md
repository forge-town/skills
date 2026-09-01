# Storybook Stories 最佳实践检查清单

执行规则：**逐项勾选，若有任何一项为 ❌，必须修正后重新检查，不得跳过输出。**

---

## 一、文件结构检查

- [ ] ✅ stories 文件与组件文件同目录，命名为 `{ComponentName}.stories.tsx`
  - ❌ 错误示例：`stories/CatCard.stories.tsx` 在独立 stories 目录 → 必须移到与 `CatCard.tsx` 同级目录
- [ ] ✅ 只为主组件创建 stories，不为内部子组件单独创建 stories 文件
  - ❌ 错误示例：同时有 `CatCard.stories.tsx` 和 `CatCardImage.stories.tsx` → 必须合并到 `CatCard.stories.tsx`

---

## 二、代码格式检查

- [ ] ✅ 使用 CSF3 格式，从 `@storybook/react` 导入 `Meta` 和 `StoryObj`
  - ❌ 错误示例：使用 CSF2 (`export default { title: '...' }; export const Base = Template.bind({})`) → 必须改为 CSF3 格式
- [ ] ✅ `meta` 对象的 `title` 使用稳定层级：共享组件为 `"Components/{ComponentName}"`，页面内组件为 `"Pages/{PageName}/Components/{ComponentName}"`
  - ❌ 错误示例：`title: "CatCard"`（无顶层分组）或把页面内组件放进无上下文的 `Components/`
- [ ] ✅ `meta` 对象的 `component` 指向组件本身（`component: CatCard`）
  - ❌ 错误示例：`meta` 中缺少 `component` 字段 → 必须添加 `component: CatCard`
- [ ] ✅ 所有回调类 props（`onXxx`）在 `meta.args` 中使用 `fn()` 注册，`fn` 从 `@storybook/test` 导入
  - ❌ 错误示例：`args: { onSave: () => {} }` 用箭头函数 → 必须改为 `args: { onSave: fn() }`

---

## 三、必需 Cases 检查

- [ ] ✅ 包含 `Base` case：每个 props 都传入**贴近真实业务的典型值**（中文内容，非 `"test"` 占位符）
  - ❌ 错误示例：`args: { name: "test", description: "string" }` → 必须改为真实业务内容如 `{ name: "柠檬", description: "一只慵懒的橘猫" }`
- [ ] ✅ 包含 `Default` case：`args` 严格为空对象 `{}`，不传入任何 props
  - ❌ 错误示例：`Default: { args: { name: "" } }` 传了空字符串 → 必须改为 `Default: { args: {} }`
- [ ] ✅ 包含 `BaseUsage` case：使用 `render` 函数，展示组件在真实业务场景中的多实例样子
  - ❌ 错误示例：`BaseUsage` 只渲染一个实例与 `Base` 无差异 → 必须提供多个不同状态/内容的实例

---

## 四、代表性 Cases 检查

- [ ] ✅ 额外 Cases 数量根据组件特性设计 1-3 个，不凑数
  - ❌ 错误示例：强行创建了 5 个 case 但内容高度相似（只差一个字） → 必须合并/删除冗余
- [ ] ✅ Case 命名使用 PascalCase 英文名且语义清晰（如 `Loading`、`OutOfStock`、`LongContent`）
  - ❌ 错误示例：`Case1`、`Test`、`sample` → 必须改为语义化名称如 `EmptyState`
- [ ] ✅ 组件有加载态时，包含 `Loading` case（展示骨架屏或 loading 标志）
  - ❌ 错误示例：组件有 `isLoading` prop 但没有 `Loading` case → 必须添加
- [ ] ✅ 组件有禁用/不可用态时，包含对应 case（如 `Disabled`、`OutOfStock`）
  - ❌ 错误示例：组件有 `disabled` prop 但没有 `Disabled` case → 必须添加
- [ ] ✅ 组件展示内容可能溢出时，包含 `LongContent` case 验证截断处理
  - ❌ 错误示例：文本卡片组件没有 `LongContent` case → 必须添加超长文本测试

---

## 五、内容质量检查

- [ ] ✅ `Base` 和各 Case 中的 args 数据使用贴近真实业务的中文内容
  - ❌ 错误示例：`name: "John Doe"` 英文占位符 → 必须改为中文业务数据如 `name: "柠檬"`
- [ ] ✅ 严禁使用 `"test"`、`"string"`、`"value"` 等无意义占位符
  - ❌ 错误示例：`description: "string"` → 必须改为真实描述文案
- [ ] ✅ `BaseUsage` 的 `render` 函数包含多个**不同状态/内容**的组件实例（不重复）
  - ❌ 错误示例：`BaseUsage` render 了 3 个只差 `id` 的完全相同实例 → 必须提供有意义的差异

---

## 六、Bad Case 确认（以下情况不得出现）

- [ ] ❌ 不存在回调 props 使用箭头函数（`() => {}`）而非 `fn()` 的情况
- [ ] ❌ 不存在 `Default` case 传入了任何 prop 值的情况（必须严格为 `{}`）
- [ ] ❌ 不存在 args 中使用英文占位符（`"test"`、`"string"`、`"value"`）的情况
- [ ] ❌ 不存在仅改变一个无意义数值的重复 case（如两个 case 只差一个数字）
