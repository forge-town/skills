# UI 组件最佳实践检查清单

执行规则：**逐项勾选，若有任何一项为 ❌，必须修正后重新检查，不得跳过输出。**

---

## 一、按钮检查

- [ ] ✅ 所有按钮使用 `<Button>` 组件，而非原生 `<button>`
  - ❌ 错误示例：`<button onClick={handleClick}>提交</button>`
  - ✅ 正确示例：`<Button onClick={handleClick}>提交</Button>`

---

## 二、输入框检查

- [ ] ✅ 文本输入使用 `<Input>` 组件，而非原生 `<input type="text">`
  - ❌ 错误示例：`<input type="text" value={value} onChange={onChange} />`
  - ✅ 正确示例：`<Input value={value} onChange={onChange} />`

- [ ] ✅ 复选框使用 `<Checkbox>` 组件，而非原生 `<input type="checkbox">`
  - ❌ 错误示例：`<input type="checkbox" checked={checked} />`
  - ✅ 正确示例：`<Checkbox checked={checked} />`

- [ ] ✅ 单选按钮使用 `<RadioGroup>` + `<RadioGroupItem>`，而非原生 `<input type="radio">`

---

## 三、选择器检查

- [ ] ✅ 下拉选择使用 `<Select>` 组件族，而非原生 `<select>`
  - ❌ 错误示例：`<select><option>...</option></select>`
  - ✅ 正确示例：`<Select><SelectTrigger /><SelectContent>...</SelectContent></Select>`

---

## 四、文本域检查

- [ ] ✅ 多行文本输入使用 `<Textarea>` 组件，而非原生 `<textarea>`
  - ❌ 错误示例：`<textarea value={value} onChange={onChange} />`
  - ✅ 正确示例：`<Textarea value={value} onChange={onChange} />`

---

## 五、标签检查

- [ ] ✅ 表单标签使用 `<Label>` 组件，而非原生 `<label>`
  - ❌ 错误示例：`<label htmlFor="name">名称</label>`
  - ✅ 正确示例：`<Label htmlFor="name">名称</Label>`

---

## 六、表格检查

- [ ] ✅ 数据表格使用 `<Table>` 组件族，而非原生 `<table>`
  - ❌ 错误示例：`<table><thead>...</thead><tbody>...</tbody></table>`
  - ✅ 正确示例：`<Table><TableHeader>...</TableHeader><TableBody>...</TableBody></Table>`

---

## 七、对话框检查

- [ ] ✅ 模态对话框使用 `<Dialog>` 组件，而非原生 `<dialog>` 或手动实现的遮罩层

---

## 八、卡片检查

- [ ] ✅ 卡片容器使用 `<Card>` 组件族，而非 `<div className="card">`

---

## 九、分隔线检查

- [ ] ✅ 分隔线使用 `<Separator>` 组件，而非 `<hr>`

---

## 十、Bad Case 确认（以下情况不得出现）

- [ ] ❌ 不存在使用 `<button>` 替代 `<Button>` 的情况
- [ ] ❌ 不存在使用 `<input>` 替代 `<Input>` / `<Checkbox>` 的情况
- [ ] ❌ 不存在使用 `<select>` 替代 `<Select>` 的情况
- [ ] ❌ 不存在使用 `<textarea>` 替代 `<Textarea>` 的情况
- [ ] ❌ 不存在使用 `<label>` 替代 `<Label>` 的情况
- [ ] ❌ 不存在使用 `<table>` 替代 `<Table>` 的情况
- [ ] ❌ 不存在使用 `<dialog>` 或自定义遮罩层替代 `<Dialog>` 的情况
