# UI 组件库使用规范

## 核心原则

**基础 DOM 边界**：非基础 UI 组件、页面和业务模块只能直接使用 `div` 作为原生容器。交互、表单、链接、图片、表格和文本语义元素必须由职责明确、可复用的基础 UI 组件封装。

基础组件必须明确实现单一且可复用的原生职责（例如 Button、Input、Select、Textarea、Form、Link）。不能通过别名、字符串标签名、`React.createElement` 或中间包装绕过边界。最终审查依据实际渲染结构与行为，不依据组件名称猜测。

## 组件映射表

| 原生元素 | 必须使用组件库组件 | 说明 |
|---------|------------------|------|
| `<button>` | `<Button>` | 所有按钮场景 |
| `<input>` (text) | `<Input>` | 文本输入框 |
| `<input>` (checkbox) | `<Checkbox>` | 复选框 |
| `<input>` (radio) | `<RadioGroup>` + `<RadioGroupItem>` | 单选按钮组 |
| `<select>` | `<Select>` + `<SelectTrigger>` + `<SelectContent>` | 下拉选择 |
| `<textarea>` | `<Textarea>` | 多行文本输入 |
| `<label>` | `<Label>` | 表单标签 |
| `<table>` | `<Table>` + `<TableHeader>` + `<TableBody>` 等 | 数据表格 |
| `<dialog>` | `<Dialog>` | 模态对话框 |
| `<form>` | `<Form>` (shadcn Form) | 表单容器 |
| `<img>` | 使用 Next.js `<Image>` 或组件库 Image 组件 | 图片展示 |
| `<a>` | 使用 Next.js `<Link>` 或 `<Button variant="link">` | 链接导航 |
| `<hr>` | `<Separator>` | 分隔线 |
| `<span>` / `<div>` (badge) | `<Badge>` | 徽章标签 |
| `<div>` (card) | `<Card>` + `<CardHeader>` + `<CardContent>` 等 | 卡片容器 |
| `<div>` (alert) | `<Alert>` | 警告提示 |
| `<input type="file">` | 使用文件上传组件或自定义封装 | 文件上传 |

## 允许的边界

1. **业务布局容器**：业务组件可以直接使用 `<div>`；其他原生标签必须提取到对应基础组件。
2. **基础组件实现**：基础组件可以封装与自身职责对应的原生元素，但不能因此放宽调用方的边界。
3. **组件库未覆盖的复杂场景**：先创建职责明确的基础组件，再由业务组件组合使用。

## 检查要点

1. 非基础组件的 JSX/TSX 中只出现 `div` 原生标签，且没有别名或 `createElement` 绕过
2. 所有按钮、输入、选择、表单、链接、图片、表格和文本语义元素均来自职责对应的基础组件
3. 基础组件自身只封装其职责对应的原生 DOM，不把例外扩散到业务调用方
4. 每个 checklist 独立记录最终渲染结构/行为证据；无法证明时标记 `evidence-required`
