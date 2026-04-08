# UI 组件库使用规范

## 核心原则

**必须使用组件库组件的场景**：当需要实现标准 UI 交互元素时，优先使用项目组件库（如 shadcn/ui），禁止直接使用原生 HTML 元素。

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

## 特殊情况（允许使用原生元素）

以下场景可以使用原生元素：

1. **布局容器**：`<div>`、`<span>`、`<header>`、`<main>`、`<footer>`、`<section>` 等语义化布局标签
2. **文本内容**：`<p>`、`<h1>`~`<h6>`、`<ul>` / `<ol>` / `<li>` 等文本结构标签
3. **组件库未覆盖的复杂场景**：需要自行封装的复合组件

## 检查要点

1. 代码中不存在直接使用 `<button>` 而应该是 `<Button>`
2. 代码中不存在直接使用 `<input>` 而应该是 `<Input>` 或其他对应组件
3. 代码中不存在直接使用 `<select>` 而应该是 `<Select>`
4. 代码中不存在直接使用 `<table>` 而应该是 `<Table>` 组件族
