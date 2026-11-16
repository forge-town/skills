> 当前表单映射约束（2026-11-16）：字段、章节和正文只以统一最佳实践契约及 scripts/assemble-issue.mjs 输出为准；本文中的旧章节模板、摘要字段、双语正文拼接或反向生成正文仅属历史工具约定，不得作为第二个正文源。附件与独立验证要求仍适用，文案从当前表单取得，不能覆盖生成的 issue.md。

# issue.html 前端模板与生成器

用于 Issue 设计确认后生成 `issue.md` 与静态 `issue.html`，作为视频 HTML 首要交付之外的详细规格参考；默认先预览与交付 [HTML 故事视频](html-video.md)，不可仅完成本页静态模板就声称整条 Issue 的默认产物已交付。模板只负责呈现，所有内容必须来自已批准的规格；不得为填满模板新增页面、组件、状态或文案。

## 文件

| 路径 | 作用 |
|---|---|
| `scripts/render-issue.mjs` | 入口：校验规格 → 生成 `issue.md` 与 `issue.html` → 证明泄漏检查与正则标记 lint → 原子写入（不含浏览器 DOM 验证） |
| `scripts/issue-html/spec.mjs` | 规格与 Flow Schema 校验（语言模式、Task/AC、组件关系、SVG 安全） |
| `scripts/issue-html/markdown.mjs` / `html.mjs` / `prototype.mjs` | Markdown、HTML 正文与原型画布渲染 |
| `scripts/check-issue-html.mjs` | 基于正则的标记 lint 与 Markdown 一致性比对（只认本生成器的类名与 `data-*` 结构）；不是 HTML 解析器，不检查真实 DOM 或可见性 |
| `scripts/browser/check-issue-dom.mjs` | 真实浏览器 DOM 验证（本机 Chrome 无头模式，经 CDP，无 npm 依赖）：禁用 JavaScript 的 1440/1024/390 宽度、页面级溢出、Task/AC 可见性、组件几何、Console error；默认不检查打印或生成 PDF |
| `assets/issue-html/issue.css` | 编辑式长文档样式：LV 自然分页手册骨架与字号层级，文档外壳颜色取自 Lieflat Mono；原型画布 `.canvas` 内是 shadcn/ui 语义 token 的产品 UI 层；生成时内联进 HTML |
| `scripts/issue-html/chart.mjs` | 构建时生成 Task 估点静态 SVG（Lieflat F5 Tick Rows，宽屏与手机两种静态布局）及可选的渐进 reveal 脚本；许可与来源见 `scripts/issue-html/third_party/lieflat/` |
| `assets/issue-html/PROVENANCE.md` | 版式骨架、原型 UI 层（shadcn/ui 静态改编）与图表的来源、字体与许可说明 |
| `assets/issue-html/example.spec.json` | 虚构示例输入（`zh-en`），展示全部字段 |

## 背景介绍与目标预期字段

`langs.<lang>.background` 按用户需求、痛点、系统现状填写，建议用三个段落的数组；`overview` 用于目标预期，列出与 Task 对应的完成结果。渲染顺序为背景介绍、目标预期、用户故事、任务。不再单列现状与截图，相关图片与图注按需并入背景介绍。

## 生成步骤

1. 以 `canonicalPrd` 反向生成的标准 PRD 为语义输入，把已批准的 Markdown 正文逐项转写为 `issue.spec.json`；字段结构参照示例。真实 Issue 删除 `demoNotice` 与 `$comment`。
2. 运行 `node scripts/render-issue.mjs <issue.spec.json> --out backlog/<roadmap>/<NN>-<slug>/`。校验失败时退出码为 1，不覆盖已有产物。
3. 运行 `node scripts/validate-issue-body.mjs <issue.md>` 与 `node scripts/check-issue-html.mjs <issue.html> <issue.md>`。后者只是标记 lint，通过不代表 DOM 验证完成。
4. 必须再做真实 DOM 验证（[HTML 静态渲染与故障防护](html-rendering-safety.md) 要求的检查）：运行 `node scripts/browser/check-issue-dom.mjs <issue.html> --out <截图目录>`（需本机 Chrome；路径不同时设置 `CHROME=`），或用 Playwright 等浏览器工具完成同等检查——禁用 JavaScript 后核对 Task/AC/组件 DOM、1440/1024/390 宽度无页面级横向溢出、逐个组件画面、Console 无 error。默认不做打印预览或 PDF 转换。没有可用浏览器时，明确报告 DOM 验证未完成，不以 lint 结果代替。

文案修改：改 `issue.spec.json` 后重新生成两份文件，保持 Markdown 与 HTML 同源。若 `issue.md` 被直接手改，用 `check-issue-html.mjs` 比对，发现差异后同步规格再重新生成。

## 操作位置与截图呈现

摘要与紧接的第一章之间不画分隔线：摘要不设下边框，其相邻章节不设上边框，避免折叠或展开时出现双线；其他章节和 Reference 的分隔样式沿用模板。

正文按 `page-location-evidence.md` 将必要操作位置写进 Task 和操作说明，不生成独立页面定位章节或表格。现有生成器的 Task 与 AC 承载必要的页面、板块和操作结果，不另设前端变更或技术说明章节。需要新的正文块或图片时先补齐规格字段、静态 Markdown/HTML 呈现及相应验证，不往未知字段写数据后假定会显示。截图须与目标原型区分并嵌入单文件；重新生成后逐项核对没有丢失。

## 规格要点

- 规格不包含 `bonus` 字段，摘要也不包含 Bonus 描述；旧规格需先移除这些内容。

- `mode`：`zh-CN` 只允许 `langs.zh`；`zh-en` 需要 `langs.zh` 与 `langs.en`，两者 Task ID/点数、AC ID/Task必须镜像。
- `meta`：Product、Domain、Type、Estimate（只允许 8/16，等于 Task 点数和）、Priority、依赖。
- `langs.<lang>`：`summary`、`background`、`story`、`overview`、`tasks`、`userFlow`、`nonGoals`、`acs`、`reference`（可选）。不含 UI 时省略 `components`，在 Task 写清业务触发与结果。
- `acs[]`：`id`、`task`、`summary`、`given`、`when`、`then`。
- `testCases[]`：`id`（TC-xx）、`acRef`、`summary`、`given`、`when`、`then`；两个独立章节均显示 GWT，测试用例明确显示对应 AC 编号与名称，允许多例验证同一标准。
- `components[]`：`kind` 为 `page`、`modal`、`drawer`、`menu`；`name`、`trigger`、`state` 必填。`modal`/`drawer`/`menu` 必须用 `base` 指向一个 `page`，生成器在该组件自己的画布内绘制底页、遮罩与弹窗边界、右侧抽屉或锚定在 `anchor` 控件下方的菜单。同一组件的不同状态（如目录态、自定义表单错误态）拆为多个具名组件。
- 画布块：`bar`、`table`（`rowAction.ref` 作为菜单锚点）、`field`（可带 `error`，可选 `help` 说明文字）、`choices`、`tabs`、`notice`、`empty`、`dl`、`text`。文本可写字符串或 `{ "zh": "…", "en": "…" }`。
- 按钮 `variant`：`primary`（主操作）、不写即 `outline`（次要操作，如“取消”）、`secondary`、`ghost`（行内图标按钮）、`destructive`（`danger` 同义）、`link`；菜单项 `tone: "danger"` 渲染为 destructive 菜单项并自动加分隔线。只选择已批准的主次关系，不为装饰新增按钮、字段、页面或状态。
- `flow`（复杂流程时）：遵循 [Flow Schema](flow-diagram-schema.md)，并在 `flow.svg.<lang>` 提供 Graphviz/Mermaid 等自动布局引擎生成的 SVG 文件路径；生成器从同一 Schema 输出 Mermaid，并嵌入、检查该 SVG（禁止脚本、事件属性和远程引用）。缺少 SVG 时拒绝生成，不手工绘制。

## 样式定制

文档外壳只修改 `issue.css` 顶部的 Lieflat Mono 变量或局部规则；原型 UI 只修改 `.canvas` 上的 shadcn 语义 token（`--background`、`--foreground`、`--muted`、`--muted-foreground`、`--border`、`--input`、`--primary`、`--ring`、`--destructive` 等），不要在 `.p-*` 规则里写死颜色。保持文档与 UI 圆角 ≤ 8px（Lieflat 图表容器固定 24px）、无渐变/光斑/营销 Hero、清晰 focus 与 `@media print`。不要套用视频模式的影视风格。输出始终是单个自包含 HTML；渐进增强脚本可内联，不引用 CDN、外部 CSS 或外部脚本。既有打印 CSS 可保留；只有用户明确要求打印时才检查分页，要求 PDF 时才导出并逐页检查。不得为了 HTML 交付先转 PDF。

## 版式与图表

- 版式：排版式刊头（mast 细线 → 大标题 → 墨线下的紧凑元数据）、左侧目录栏（窄屏变为顶部横向目录）、带页边序号的章节；用细线和留白分层，不用重复卡片。模板已有的 A4 打印样式可自然分页并带页脚（本地化标签 + 页码 / 总页数），`zh-en` 的英文规格另起一页，不把整份 PRD 压进固定页。
- 颜色分两层：文档外壳（刊头、目录、章节、Task、AC、估点图）只用 Lieflat Mono（纸 #F0EFEB、墨 #1C1C1A 及其灰阶），LV 只提供骨架、字号层级、细线与留白；原型画布是产品 UI 层，使用作用域限定在 `.canvas` 的 shadcn/ui neutral 语义 token。产品 UI 内允许克制地使用语义色：错误字段、错误提示和 destructive 菜单项/按钮用 `--destructive`，同时保留图标或文字，不只靠颜色；不要把产品 UI 的错误态强行改成编辑式黑白规则，也不要把语义色用到文档外壳。
- 字体：不打包 LV 字体；本机已安装 `LVEditorial` 时才使用，否则用 Helvetica Neue / PingFang SC 等系统字体。不得声称拥有字体再分发授权。
- Task 估点图：Tasks 章节开头固定输出一张 Lieflat F5 Tick Rows（图表模式，不套用 Lieflat 整页报告）。一格 = 1 估算点，不代表天数、完成量、人数或百分比；每行显示 Task ID 与完整名称并链接到对应 Task；导轨 = 单 Task 上限 8 点，保留零点基线与来源行。副标题只写单位与导轨，来源行简短；`zh-CN` 图内文案全部中文（ID、产品名除外）。图为构建时静态 SVG：宽屏沿用模板几何，手机（≤600px）换成重新排版的窄 SVG（ID 与名称在队列上方、字号放大），实测标签 ≥12px、数值 ≥13px。禁用 JavaScript、减少动效和打印时始终显示最终画面；可选脚本只做渐进增强（滚入视野播放、点击重播、重播前清理、quarticOut），不隐藏任何静态内容。不要为装饰增加其他图表或编造数据。
- 原型画布是 shadcn/ui 组件结构的静态改编（Button、Table/Data Table、Field/Input、Tabs、Dialog、Sheet、Dropdown Menu、Alert），不是 React/Radix 的可交互实现，不引入运行时、Tailwind 或 CDN；说明交付时如实称为“静态 shadcn 风格示意”。要求：标签与说明文字清晰可读、控件高度一致（约 32–36px）、主/次/ghost 操作层级明确、细分隔线、表头与行结构清楚、选中 Tab 明确、Dialog 有遮罩/标题/关闭/底部操作带、Sheet 贴右侧并有标题区、菜单锚定在触发按钮下方且触发按钮显示展开态。
- 派生自 Lieflat 的源码须保留其 PolyForm Noncommercial 许可文件；生成的 HTML 在 HTML 注释中写明来源与许可 URL（https://polyformproject.org/licenses/noncommercial/1.0.0），不写进业务正文。不要据此声称可无限制商用。
- `scripts/browser/check-issue-dom.mjs` 额外检查：图表实际渲染字号、手机布局、无 JS / 减少动效 / reveal 与重播不叠加。打印页脚仅在明确请求时检查。

## 可选打印与 PDF

默认 DOM 检查命令只验证屏幕 HTML，不输出 PDF。仅在用户明确要求打印时追加 `--print`（检查打印样式，不生成 PDF）；明确要求 PDF 时追加 `--pdf`（包含打印检查并导出 PDF）。不要为普通 HTML 附件交付添加这些参数。
