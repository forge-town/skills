# Props Drilling 检查清单

执行规则：**逐项扫描，发现任意一项立即标记并报告给用户，不得跳过。**

---

## 一、明显 Props Drilling 检查

- [ ] ✅ 不存在仅用于透传的 props
  - ❌ Bad：`function Wrapper({ data }) { return <Child data={data} /> }`
  - 应改为：Wrapper 不接收 data，Child 直接从 store 获取

- [ ] ✅ 不存在展开透传 props 的情况
  - ❌ Bad：`function Wrapper(props) { return <Child {...props} /> }`
  - 应改为：Child 直接从 store 获取需要的字段

- [ ] ✅ 不存在解构后原样传递
  - ❌ Bad：`function Wrapper({ a, b, c }) { return <Child a={a} b={b} c={c} /> }`
  - 应改为：Child 直接从 store 获取 a, b, c

---

## 二、传递链长度检查

- [ ] ✅ props 传递链不超过 2 层
  - ❌ Bad：Page → Container → Card → Header → Title（5层传递）
  - 应改为：超过 2 层的实体数据改用 Store

---

## 三、使用频率检查

- [ ] ✅ 高频使用的数据不从 props 传递
  - ❌ Bad：`user`、`theme`、`permissions` 等通过 props 传递
  - 应改为：这些数据使用全局 Store

---

## 四、回调函数检查

- [ ] ✅ 回调函数透传层数不超过 3 层
  - ⚠️ Warning：Page → Container → Card → Button（onClick传递4层）
  - 建议：深层回调考虑使用 Event Bus 或 Store Action

---

## 五、重构建议

对每一处 Props Drilling 提供：

- [ ] ✅ 明确的违规位置（文件 + 行号）
- [ ] ✅ 涉及的 props 名称
- [ ] ✅ 建议使用的 Store 名称
- [ ] ✅ 重构后的代码示例

---

## 六、Bad Case 确认（以下情况不得出现）

- [ ] ❌ 不存在组件仅为了透传 props 而存在的情况
- [ ] ❌ 不存在 `{...props}` 展开传递实体数据的情况
- [ ] ❌ 不存在 user/theme/permissions 等全局数据通过 props 传递的情况
