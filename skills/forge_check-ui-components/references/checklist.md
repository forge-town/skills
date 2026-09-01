# UI 组件规范检查清单

执行规则：**逐项扫描，发现任意一项立即标记并报告给用户，不得跳过。**

---

## 一、按钮检查

- [ ] ✅ 不存在使用原生 `<button>` 的情况
  - ❌ Bad：`<button onClick={handleClick}>提交</button>`
  - 应改为：`<Button onClick={handleClick}>提交</Button>`
  - 🔍 扫描模式：`<button`、`<button `

---

## 二、输入框检查

- [ ] ✅ 不存在使用原生 `<input>` 的情况
  - ❌ Bad：`<input type="text" value={value} onChange={onChange} />`
  - 应改为：`<Input value={value} onChange={onChange} />`
  - 🔍 扫描模式：`<input`、`<input `

- [ ] ✅ 不存在使用原生 `<input type="checkbox">` 的情况
  - ❌ Bad：`<input type="checkbox" checked={checked} />`
  - 应改为：`<Checkbox checked={checked} />`
  - 🔍 扫描模式：`<input.*checkbox`

- [ ] ✅ 不存在使用原生 `<input type="radio">` 的情况
  - ❌ Bad：`<input type="radio" checked={checked} />`
  - 应改为：`<RadioGroup><RadioGroupItem /></RadioGroup>`
  - 🔍 扫描模式：`<input.*radio`

---

## 三、选择器检查

- [ ] ✅ 不存在使用原生 `<select>` 的情况
  - ❌ Bad：`<select value={value} onChange={onChange}>...</select>`
  - 应改为：`<Select>...</Select>`
  - 🔍 扫描模式：`<select`、`<select `

---

## 四、文本域检查

- [ ] ✅ 不存在使用原生 `<textarea>` 的情况
  - ❌ Bad：`<textarea value={value} onChange={onChange} />`
  - 应改为：`<Textarea value={value} onChange={onChange} />`
  - 🔍 扫描模式：`<textarea`、`<textarea `

---

## 五、标签检查

- [ ] ✅ 不存在使用原生 `<label>` 的情况
  - ❌ Bad：`<label htmlFor="name">名称</label>`
  - 应改为：`<Label htmlFor="name">名称</Label>`
  - 🔍 扫描模式：`<label`、`<label `

---

## 六、表格检查

- [ ] ✅ 不存在使用原生 `<table>` 的情况
  - ❌ Bad：`<table><thead>...</thead><tbody>...</tbody></table>`
  - 应改为：`<Table>...</Table>`
  - 🔍 扫描模式：`<table`、`<table `

---

## 七、对话框检查

- [ ] ✅ 不存在使用原生 `<dialog>` 或手动实现遮罩层的情况
  - ❌ Bad：`<dialog open={isOpen}>...</dialog>` 或自定义 div 遮罩
  - 应改为：`<Dialog>...</Dialog>`
  - 🔍 扫描模式：`<dialog`、`<dialog `

---

## 八、分隔线检查

- [ ] ✅ 不存在使用原生 `<hr>` 的情况
  - ❌ Bad：`<hr />`
  - 应改为：`<Separator />`
  - 🔍 扫描模式：`<hr`、`<hr>`

---

## 九、检查结果汇总

- [ ] ✅ 已记录所有发现的原生元素使用位置（文件路径 + 行号 + 内容）
- [ ] ✅ 已为每处违规提供具体重构建议（对应组件库组件）
- [ ] ✅ 已区分允许使用的原生元素（如布局 div、span、p、h1-h6 等）
