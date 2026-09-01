# UI 组件重构清单

执行规则：**逐项执行，完成一项勾选一项，全部完成后重新验证。**

---

## 一、按钮重构

- [ ] 已将所有 `<button>` 替换为 `<Button>`
  - 步骤：
    1. 添加导入：`import { Button } from "@/components/ui/button"`
    2. 替换标签：`<button ...>` → `<Button ...>`
    3. 映射 Props：`onClick`、`disabled`、`type` 等直接传递
    4. 移除原生 className（或合并到 Button 的 className）

---

## 二、输入框重构

- [ ] 已将所有 `<input type="text">` 替换为 `<Input>`
  - 步骤：
    1. 添加导入：`import { Input } from "@/components/ui/input"`
    2. 替换标签：`<input type="text" ...>` → `<Input ...>`
    3. 映射 Props：`value`、`onChange`、`placeholder`、`disabled` 等

- [ ] 已将所有 `<input type="checkbox">` 替换为 `<Checkbox>`
  - 步骤：
    1. 添加导入：`import { Checkbox } from "@/components/ui/checkbox"`
    2. 替换标签：`<input type="checkbox" ...>` → `<Checkbox ...>`
    3. 映射 Props：`checked` → `checked`、`onChange` → `onCheckedChange`

- [ ] 已将所有 `<input type="radio">` 替换为 `<RadioGroup>` + `<RadioGroupItem>`
  - 步骤：
    1. 添加导入：`import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"`
    2. 重构为 Group 模式，使用 `value` + `onValueChange`

---

## 三、选择器重构

- [ ] 已将所有 `<select>` 替换为 `<Select>` 组件族
  - 步骤：
    1. 添加导入：`import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"`
    2. 重构结构：
       ```tsx
       <Select value={value} onValueChange={onValueChange}>
         <SelectTrigger>
           <SelectValue placeholder="..." />
         </SelectTrigger>
         <SelectContent>
           <SelectItem value="...">...</SelectItem>
         </SelectContent>
       </Select>
       ```

---

## 四、文本域重构

- [ ] 已将所有 `<textarea>` 替换为 `<Textarea>`
  - 步骤：
    1. 添加导入：`import { Textarea } from "@/components/ui/textarea"`
    2. 替换标签：`<textarea ...>` → `<Textarea ...>`
    3. 映射 Props：`value`、`onChange`、`placeholder`、`rows` 等

---

## 五、标签重构

- [ ] 已将所有 `<label>` 替换为 `<Label>`
  - 步骤：
    1. 添加导入：`import { Label } from "@/components/ui/label"`
    2. 替换标签：`<label ...>` → `<Label ...>`
    3. 映射 Props：`htmlFor` → `htmlFor`（保持不变）

---

## 六、表格重构

- [ ] 已将所有 `<table>` 替换为 `<Table>` 组件族
  - 步骤：
    1. 添加导入：`import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"`
    2. 映射元素：
       - `<table>` → `<Table>`
       - `<thead>` → `<TableHeader>`
       - `<tbody>` → `<TableBody>`
       - `<tr>` → `<TableRow>`
       - `<th>` → `<TableHead>`
       - `<td>` → `<TableCell>`

---

## 七、对话框重构

- [ ] 已将所有 `<dialog>` 或自定义遮罩层替换为 `<Dialog>` 组件族
  - 步骤：
    1. 添加导入：`import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"`
    2. 重构为 Dialog 模式，使用 `open` + `onOpenChange` 控制显隐

---

## 八、分隔线重构

- [ ] 已将所有 `<hr>` 替换为 `<Separator>`
  - 步骤：
    1. 添加导入：`import { Separator } from "@/components/ui/separator"`
    2. 替换标签：`<hr />` → `<Separator />`

---

## 九、导入语句整理

- [ ] 已合并相同来源的导入语句
  - ❌ 避免：多个 `import { X } from "@/components/ui/xxx"`
  - ✅ 改为：单个导入语句包含所有需要的组件

---

## 十、重构后验证

- [ ] 已运行 `forge_check-ui-components` 重新检查，确认无违规原生元素
- [ ] 已确认所有组件 Props 正确映射，功能正常
- [ ] 已确认无 TypeScript 类型错误
- [ ] 已确认组件样式与重构前一致或更好
