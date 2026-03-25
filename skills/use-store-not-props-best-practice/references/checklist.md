# 使用 Store 而非 Props 最佳实践检查清单

执行规则：**逐项勾选，若有任何一项为 ❌，必须修正后重新检查，不得跳过输出。**

---

## 一、Props 减少检查

- [ ] ✅ Store 中已存在的数据字段，不再通过 prop 向下传入子组件
  - ❌ 错误示例：`<CatCard cat={cat} />` 其中 `cat` 来自父组件从 store 读取再传入 → 必须改为 `CatCard` 内部直接 `const cat = useCatsStore(s => s.selectedCat)`
- [ ] ✅ 组件 props 类型中**不**包含可以从 store 直接获取的字段
  - ❌ 错误示例：`interface CatCardProps { catId: string; catName: string; catSkills: string[] }` 其中 `catName`/`catSkills` 已在 store 中 → 必须删除，只保留 `catId`（标识符）
- [ ] ✅ 父组件中不存在「只用来传给子组件」的中间变量
  - ❌ 错误示例：`const selectedCat = useCatsStore(s => s.selectedCat); return <CatCard cat={selectedCat} />` → 必须删除中间变量，由 `CatCard` 自行读取

---

## 二、Store 访问检查

- [ ] ✅ 组件内通过 `use{StoreName}(selector)` 直接读取 store 中的数据
  - ❌ 错误示例：`const { cats, selectedCat, loading } = useCatsPageStore()` 订阅整个 store → 必须改为独立 selector `useCatsPageStore(s => s.selectedCat)`
- [ ] ✅ 读取颗粒化：每次调用 hook 只取一个字段或一个紧密相关的字段组
  - ❌ 错误示例：`const store = useCatsPageStore()` 后使用 `store.a`、`store.b`、`store.c` → 必须拆分为多个 selector 或合并 selector 函数
- [ ] ✅ 不将 store 数据作为 prop 传入子组件后再「搬运」到另一个 store
  - ❌ 错误示例：`<Editor data={storeA.data} />` 且 Editor 内部 `useEditorStore.setState({ data })` → 必须改为 Editor 直接从 `storeA` 读取

---

## 三、合理保留的 Props 检查

- [ ] ✅ 保留的 props 仅限于以下类型（均不属于 Store 数据）：
  - 事件回调（`onSave: () => void`、`onClose: () => void`）
  - 来自路由参数的 ID（`catId: string` 来自 URL params）
  - 纯展示用的字符串标签/配置（`label: string`、`placeholder: string`）
  - ❌ 错误示例：保留了 `isLoading: boolean` prop 但 store 中有同名字段 → 必须删除 prop，改为 store 读取
- [ ] ✅ 不保留「应当在 store 里但暂时通过 props 传」的字段（不留技术债）
  - ❌ 错误示例：注释 `// TODO: migrate to store later` 但当前仍通过 prop 传递 → 必须立即迁移

---

## 四、类型安全检查

- [ ] ✅ 重构后的 props 类型定义已移除不再需要的字段
  - ❌ 错误示例：props 类型中仍有 `catName: string` 字段但实际不再传入 → 必须删除该字段声明
- [ ] ✅ 调用方（父组件）中传递该 prop 的 JSX 属性代码已同步删除
  - ❌ 错误示例：父组件仍有 `<CatCard catName="Mochi" />` → 必须删除 `catName` 属性
- [ ] ✅ TypeScript 编译无错误，无「传了不存在的 prop」或「剩余可选字段」警告
  - ❌ 错误示例：`catName?: string` 变为可选但永远不传 → 必须彻底删除该字段

---

## 五、验证检查

- [ ] ✅ 重构后已手动验证/运行测试，确保组件行为与重构前一致
  - ❌ 错误示例：重构后未测试直接提交，导致数据不显示 → 必须先验证功能正常
- [ ] ✅ 如有对应的单元测试/快照测试，已同步更新 props 变更
  - ❌ 错误示例：测试仍以旧 props 调用组件导致测试失败 → 必须更新测试，使用 store mock 而非 props

---

## 六、Bad Case 确认（以下情况不得出现）

- [ ] ❌ 不存在「从 store 读数据 → 传 prop → 子组件再读 prop」的三层冗余流
- [ ] ❌ 不存在整个 store 作为 prop 传入的情况（`store={useCatsStore()}`）
- [ ] ❌ 不存在 props 类型中残留已迁移到 store 的字段（即使标为可选）
- [ ] ❌ 不存在父组件同时持有本地状态和 store 状态表示同一业务数据的情况
