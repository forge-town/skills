# Generate-Slides 工作流详解

## 设计美学（避免 AI Slop）

模型默认会向"通用、平庸"的输出收敛——在前端设计里这叫 "AI slop"。要主动避免：

- **字体**：用独特、有性格的字体（Fontshare、Google Fonts），**禁用** Inter、Roboto、Arial、系统默认字体
- **配色**：投入一个统一的美学；用 CSS 变量保持一致；主色 + 锐利点缀 优于 多色平铺
- **动效**：CSS 优先；React 项目可用 Motion 库；聚焦高影响力时刻——一次精心编排的页面加载（staggered reveal）胜过零散的微交互
- **背景**：制造氛围与层次，而不是纯色；分层渐变、几何图案、上下文化效果

**反例黑名单**：Inter/Roboto/Arial 字体、白底紫渐变配色、千篇一律的卡片布局、缺乏上下文的通用设计。

## 视口约束细则

主体的"视口适配"硬性约束的具体执行：

- 每个 `.slide` 必须 `height: 100vh; height: 100dvh; overflow: hidden;`
- 字号、间距全部用 `clamp(min, preferred, max)`，禁止固定 px/rem
- 容器需要 `max-height` 约束
- 图片：`max-height: min(50vh, 400px)`
- 必备断点：700px、600px、500px
- 包含 `prefers-reduced-motion` 支持
- 禁止直接对 CSS 函数取负（`-clamp()`/`-min()`/`-max()` 会被静默忽略），用 `calc(-1 * clamp(...))`

**实际执行**：把 [viewport-base.css](viewport-base.css) 完整内容嵌入到每个生成的 HTML 的 `<style>` 块。

## 内容密度限制

每张 slide 的最大内容量：

| Slide 类型 | 最大内容 |
| --- | --- |
| Title slide（封面） | 1 标题 + 1 副标题 + 可选 tagline |
| Content slide（内容页） | 1 标题 + 4-6 个 bullet 或 1 标题 + 2 段 |
| Feature grid（特性网格） | 1 标题 + 最多 6 个卡片（2x3 或 3x2） |
| Code slide（代码页） | 1 标题 + 8-10 行代码 |
| Quote slide（引用页） | 1 引用（≤3 行）+ 出处 |
| Image slide（图片页） | 1 标题 + 1 图（max 60vh） |

**超出限制：拆成多张 slide。绝不挤压，绝不滚动。**

---

## Phase 0: Mode 检测

判断用户意图：

- **Mode A：从零创建** → Phase 1
- **Mode B：PPT 转换**（用户给了 `.pptx` 文件）→ Phase 4
- **Mode C：增强现有**（用户给了 HTML 让你改）→ 读它、理解它、按 **Mode C 修改规则** 增强

### Mode C 修改规则

修改现有 deck 时，视口溢出风险最大：

1. **加内容前**：数现有元素，对照内容密度限制
2. **加图片**：必须 `max-height: min(50vh, 400px)`；若 slide 已满则拆新页
3. **加文字**：每页 4-6 个 bullet 上限；超出则拆继续页
4. **任何修改后必须验证**：`.slide` 仍有 `overflow: hidden`、新元素用 `clamp()`、图片有视口相对 max-height、1280x720 下内容能塞下
5. **主动重组**：如果修改会导致溢出，自动拆页并告知用户，不要等用户问

**给现有 slide 加图片时**：先把图片移到新 slide，或先减少其它内容。不要在已塞满的 slide 上直接加图。

---

## Phase 1: 内容收集（新建模式）

**一次性用 AskUserQuestion 问全部四个问题**，让用户一次填完：

| Question | Header | Options |
| --- | --- | --- |
| 用途 | Purpose | Pitch deck / Teaching-Tutorial / Conference talk / Internal presentation |
| 长度 | Length | Short 5-10 / Medium 10-20 / Long 20+ |
| 内容 | Content | All content ready / Rough notes / Topic only |
| 浏览器内编辑 | Editing | Yes (Recommended) — 浏览器内可编辑，自动存 localStorage 并导出；No — 仅展示，文件更小 |

**记住用户对编辑的选择**——决定 Phase 3 是否注入编辑相关代码。

如果用户有内容，请他们直接给。

### Step 1.2: 图片评估（如果用户给了图片）

如果用户选"不要图片"→ 跳到 Phase 2。

如果用户给了图片文件夹：

1. **扫描**：列出所有图片文件（.png、.jpg、.svg、.webp 等）
2. **逐个查看**：用 Read 工具（Claude 是多模态）
3. **评估**：每张图说明—展示了什么、USABLE 或 NOT USABLE（带原因）、代表什么概念、主色调
4. **共同设计大纲**：策划过的图与文字共同决定 slide 结构，**不是**"先排 slide 再塞图"——从一开始就同时考虑（如 3 张截图 → 3 个特性页，1 张 logo → 封面/收尾页）
5. **用 AskUserQuestion 确认**（header: Outline）："Slide 大纲和图片选择没问题吗？" 选项：Looks good / Adjust images / Adjust outline

**Logo 在预览中的处理**：如果识别到可用 logo，在 Phase 2 的每个 style 预览中把它（base64）嵌进去——让用户看到自己的品牌在三种风格下的样子。

---

## Phase 2: 风格发现

**这是 "show, don't tell" 阶段**——大多数人无法用文字表达设计偏好。

### Step 2.0: 选择路径

问用户怎么选（header: Style）：

- "Show me options"（推荐）：基于氛围生成 3 个预览
- "I know what I want"：直接从预设列表挑

**如果直接选**：展示预设选择器，跳到 Phase 3。可用预设见 [style-presets.md](style-presets.md)。

### Step 2.1: 氛围选择（引导式发现）

问（header: Vibe, multiSelect: true, max 2）：观众应该有什么感觉？

- Impressed/Confident — 专业、可信
- Excited/Energized — 创新、大胆
- Calm/Focused — 清晰、深思
- Inspired/Moved — 情感、难忘

### Step 2.2: 生成 3 个 style 预览

基于氛围选 3 个不同的预设，每个生成一张包含字体、配色、动画与整体美学的单页 HTML 预览。读 [style-presets.md](style-presets.md) 了解预设细节。

| 氛围 | 推荐预设 |
| --- | --- |
| Impressed/Confident | Bold Signal、Electric Studio、Dark Botanical |
| Excited/Energized | Creative Voltage、Neon Cyber、Split Pastel |
| Calm/Focused | Notebook Tabs、Paper & Ink、Swiss Modern |
| Inspired/Moved | Dark Botanical、Vintage Editorial、Pastel Geometry |

预览保存到 `.claude-design/slide-previews/`（`style-a.html`、`style-b.html`、`style-c.html`）。每个自包含、约 50-100 行、展示一个动画封面页。

自动用 `open` 打开每个预览。

### Step 2.3: 用户选

问（header: Style）："你更喜欢哪个？" 选项：Style A: [Name] / Style B: [Name] / Style C: [Name] / Mix elements

选"Mix elements"则问具体怎么混。

---

## Phase 3: 生成 deck

用 Phase 1 的内容（文字或文字+图）和 Phase 2 选定的 style 生成完整 deck。

如果有图，slide 大纲在 Step 1.2 已整合；如果没图，CSS 生成的视觉元素（渐变、形状、图案）提供视觉趣味——这是一等公民路径。

**生成前必读**：

- [html-template.md](html-template.md) — HTML 架构和 JS 功能
- [viewport-base.css](viewport-base.css) — 强制 CSS（完整嵌入）
- [animation-patterns.md](animation-patterns.md) — 选定氛围对应的动画参考

**关键要求**：

- 单 HTML 文件，CSS/JS 全部 inline
- 在 `<style>` 块嵌入 viewport-base.css **全文**
- 用 Fontshare 或 Google Fonts 的字体，**禁用**系统字体
- 详细注释每个章节
- 每个 section 顶部加 `/* === SECTION NAME === */` 注释

---

## Phase 4: PPT 转换

转换 PowerPoint 文件流程：

1. **提取内容**：`python references/scripts/extract-pptx.py <input.pptx> <output_dir>`（若缺依赖：`pip install python-pptx`）
2. **与用户确认**：展示提取到的 slide 标题、内容摘要、图片数
3. **风格选择**：进入 Phase 2 做风格发现
4. **生成 HTML**：转换到选定风格，保留所有文字、图片（从 assets/）、slide 顺序、备注（作为 HTML 注释）

---

## Phase 5: 交付

1. **清理**：删除 `.claude-design/slide-previews/`（如存在）
2. **打开**：`open [filename].html` 启动浏览器
3. **总结**告诉用户：
   - 文件位置、风格名、slide 数
   - 导航：方向键、空格、滚动/滑动、点导航点
   - 自定义方式：CSS 变量改色、font 链接改字体、`.reveal` 类改动画
   - 如果启用了内联编辑：悬停左上角或按 E 进入编辑模式，点任意文字编辑，Ctrl+S 保存

---

## Phase 6: 分享和导出（可选）

交付后**问用户**："想要分享这份 deck 吗？我可以部署到一个可分享的 URL（手机也能看），或导出为 PDF。"

选项：
- **Deploy to URL** — 任何设备都能打开的链接
- **Export to PDF** — 邮件、Slack、打印通用
- **Both**
- **No thanks**

### 6A: 部署到 Vercel

部署到免费托管，链接可手机/笔记本访问，用户不停就一直在线。

**如果用户从未部署过，分步引导**：

1. **检查 Vercel CLI**：`npx vercel --version`。没装则装 Node.js（`brew install node` 或 https://nodejs.org）
2. **检查登录**：`npx vercel whoami`
   - 未登录则告诉用户：Vercel 是免费托管，需要账号。引导：
     - 去 https://vercel.com/signup 注册（GitHub/Google/邮箱均可）
     - 注册后 `vercel login` 跟提示走（浏览器授权）
     - `vercel whoami` 确认登录
   - **等用户确认登录** 再继续
3. **部署**：`bash references/scripts/deploy.sh <path-to-presentation>`（接收文件或文件夹）
4. **分享 URL**：告诉用户链接、提醒可发短信/Slack/邮箱、要下线就去 https://vercel.com/dashboard 删项目、Vercel 免费额度很慷慨

**⚠ 部署坑**：
- 本地图/视频必须随 HTML 一起走。脚本会自动检测 `src="..."` 引用并打包；但 CSS `background-image` 或非常规路径可能漏掉。部署后开链接核验图能加载，破图则把 HTML 和资源放同一目录、整目录部署
- **deck 有多个资源时优先目录部署**：`bash deploy.sh ./my-deck/`，比单 HTML 更稳
- 文件名带空格能工作但 URL 会被编码为 `%20`，建议用 `-` 替代空格
- 重新部署用同一 URL（覆盖式）

### 6B: 导出 PDF

每张 slide 截图后合并成 PDF——适合邮件、嵌入文档、打印。

**注意**：动画和交互不会保留——PDF 是静态快照。这正常，告诉用户别惊讶。

1. **运行**：`bash references/scripts/export-pdf.sh <path-to-html> [output.pdf]`（不指定输出则存到 HTML 旁边）
2. **背后流程**（简要告诉用户）：
   - 无头浏览器以 1920×1080 打开 deck
   - 逐张截图
   - 合成单个 PDF
   - 需要 Playwright（缺则自动安装）
3. **Playwright 装失败**：常见是 Chromium 没下载——`npx playwright install chromium`；不行则可能是网络问题
4. **交付**：脚本自动打开 PDF。告诉用户文件位置和大小、邮件/Slack/Notion 通用、动画被替换为静态终态（仍好看）

**⚠ PDF 导出坑**：
- **首次运行慢**：装 Playwright 和 Chromium（~150MB）到 temp 目录。提示用户首次 30-60 秒
- **slides 必须用 `class="slide"`**：脚本按 `.slide` 查询；本 skill 生成的都用 `.slide`，外部 HTML 注意
- **本地图必须可 HTTP 加载**：脚本起本地服务，相对路径（`src="photo.png"`）OK，绝对系统路径（`/Users/.../photo.png`）不行；生成的 deck 用相对路径，外部转换的可能要修
- **大 deck 产大 PDF**：每张 slide 全分辨率 PNG；18 张 ~20MB。超 10MB 时建议加 `--compact`（1280×720）减小 50-70%

---

## 资料库索引（按需读取）

| 文件 | 用途 | 何时读 |
| --- | --- | --- |
| [style-presets.md](style-presets.md) | 12 个精选视觉预设（配色、字体、标志元素） | Phase 2（选风格） |
| [viewport-base.css](viewport-base.css) | 强制响应式 CSS——完整嵌入每个 deck | Phase 3（生成） |
| [html-template.md](html-template.md) | HTML 结构、JS 功能、代码质量标准 | Phase 3（生成） |
| [animation-patterns.md](animation-patterns.md) | CSS/JS 动画 snippet 与"动效→感觉"对照 | Phase 3（生成） |
| [scripts/extract-pptx.py](scripts/extract-pptx.py) | Python 脚本提取 PPT 内容 | Phase 4（转换） |
| [scripts/deploy.sh](scripts/deploy.sh) | 部署到 Vercel | Phase 6A（分享） |
| [scripts/export-pdf.sh](scripts/export-pdf.sh) | 导出 PDF | Phase 6B（导出） |
