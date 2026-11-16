# 打开表单与交付

主要交付是一个可切换 Feature／Bugfix 的前端界面，统一使用 issue-form.html 入口；不要按类型交付两个页面链接。不能仅返回一段 Issue 正文或操作说明当作完成。

## 唤起

运行环境为 Node.js 24+，无 npm 运行依赖。脚本与模板均在技能包内；示意命令中的 SKILL_ROOT 和 PROJECT_ROOT 替换为当前安装路径与项目根目录：

```bash
node --experimental-strip-types "$SKILL_ROOT/scripts/show-issue-form.ts" --output "$PROJECT_ROOT/docs/issue-form.html" --open
```

[打开脚本](../scripts/show-issue-form.ts) 从 [独立模板](../assets/issue-form.html) 生成副本，--open 请求系统默认浏览器打开。若支持应用内浏览器，优先用可用工具展示生成页面；工具不支持 file URL 时，可仅在 127.0.0.1 提供该页面供预览，避免暴露整个个人目录。确认实际页面可见，不能只据 open 命令成功宣称用户已看到。

输出保留在当前项目根目录 docs/，提供绝对路径链接。用户明确指定输出路径时遵从。模板默认打开 Feature 空白表单；页面可切换到不同的 Bugfix 表单。用户仅要打开表单时，不强迫先准备需求资料。

## 在同一界面切换类型

固定页头提供 Feature／Bugfix，切换不跳转 URL。同一个前端按类型显示不同章节、必填项、示例、校验与映射。共用元信息、Task 和参考资料，分别保存草稿，切换不复制另一类的专有字段。Header 的“查看示例”统一展示两个完整 Feature 场景，不随类型切换自动替换草稿。

Feature 和 Bugfix 都先填摘要：做什么、从哪开始、怎样算完成，三项必填，位于基本信息之后。再分别填写 Feature 的背景、目标、任务和验收案例，或 Bugfix 的复现、对照、修复范围、任务和验收案例。根因未知允许留空。

```bash
node --experimental-strip-types "$SKILL_ROOT/scripts/show-issue-form.ts" --type Bugfix --output "$PROJECT_ROOT/docs/issue-form.html" --open
```

--type 仅决定同一界面的初始选择，仍只交付一个页面入口。该参数只接受 Feature 或 Bugfix；有 JSON 时自动识别 issueType，显式参数与输入冲突会报错且不写入输出。未指定类型且无 JSON 时默认 Feature。页面分类不代表 Linear 团队实际类型名，自动写入仍不在本技能范围。

## 预填与编辑

用户要求根据材料预填时，按 [字段定义](../../forge--linear--show-issue-best-practice/references/issue-contract.json) 组织 JSON；未知的负责人、项目、状态、估点和业务参数留空。支持带 issueType 的平铺数据或保存格式 {contractVersion:6,data}。旧 Feature v1／v2／v3／v4／v5 草稿可以迁移，旧三项摘要恢复到当前摘要字段；当前已填写或明确清空的值优先，不被旧归档覆盖；不得静默丢弃旧资料。旧全局页面与交互条目保存在 legacyInteraction，仅用于核对，不再生成交互章节。旧 Bugfix 回归条目和范围保存在 legacyRegression，条目转成验收草稿，编号由 RG 映射为 AC 并更新任务引用；正反分类与规则关联留空待核对。旧前端变更与技术说明内容归档到 legacyDetails，不生成到正文。Bugfix v2／v3／v4／v5 草稿也可读取。旧 When 和后续轮次说明保存在各案例 legacyProcedure 中，不自动伪装成完整步骤。旧版 Bug 通用结构会拒绝自动导入并保留原 JSON，先整理复现、规则与验收字段，避免静默丢失资料。

```bash
node --experimental-strip-types "$SKILL_ROOT/scripts/show-issue-form.ts" --output "$PROJECT_ROOT/docs/issue-form.html" --input "$PROJECT_ROOT/docs/issue-draft.json" --open
```

字段源与映射已嵌入独立模板，单独安装本技能也可打开、导入、保存和导出。生成脚本还会将内置 examples/ 原型复制到输出旁；分享时需同时保留该目录，确保两个示例的原型链接可用。参考定义用于理解字段或修改模板；需要重新构建时应同时具备 show-issue-best-practice。

表单支持：字段提示、两套独立字段与草稿、可重复 Task、两类共用的任务／正反验收案例、正文／Markdown 同步、点击正文标题返回表单、JSON 导入导出、浏览器本地草稿、Markdown 复制与下载。窄屏在填写和预览间切换。

JSON 是后续继续编辑的草稿；Markdown 是映射结果。背景和输入可保留图片 Markdown 链接，本页面不自动加载远程图片，不上传或打包本地附件。若正文依赖本地图片，应另附文件或经授权上传后替换成可访问链接，不声称单个 .md 自带图片。

## 校验与边界

页面按类型检查必填与任务的前提条件、操作和预期结果。两类都检查有效任务引用、逐任务正面覆盖、整体反例和多轮接续；Bugfix 另检查复现与实际／预期依据、原问题覆盖；选择已通过／未通过时检查实际结果和证据；两者都检查链接格式。缺失内容可导出草稿，但要明确标记未完成。结构成功仍提示“内容待 Review”。抽象程度、事实依据、输出具体性和风险覆盖由 review-issue 检查；案例不是实测证据。

浏览器存储失败时提示下载 JSON；剪贴板失败时切换 Markdown 手工复制；JSON 无效时保留现有草稿并显示错误。更换示例或清空需确认以保护用户草稿。不自动创建或更新 Linear。

## 修改模板

界面使用白底、黑字、灰线；分节标题和留白组织内容，不用彩色强调、阴影、外层卡片和卡片套卡片。组件仅保留简单输入框、分隔线和正文预览。

[构建脚本](../scripts/build-form.ts) 读取 [页面骨架](../assets/form-shell.html)、[样式](../assets/form.css)、[交互](../assets/form.js)、[内容模型](../assets/issue-model.mjs) 及同套最佳实践的字段定义与通用示例，生成独立模板。修改任一源后必须重建并验证产物：

```bash
node --experimental-strip-types "$SKILL_ROOT/scripts/build-form.ts"
```

只对源文件修改、不更新自包含模板不算完成。交付前按 [完成清单](checklist.md) 实际验证。

字段与章节指导说明统一放在标签旁的“？”气泡中，悬停、键盘聚焦或手机点按时显示；输入框下不常驻说明文字。

Feature 不再设置“操作入口与交互契约”。具体入口、控件和交互步骤放在对应验收案例内，不能要求另填交互表。Bugfix 不再设置“回归验证”，使用“任务”和“验收案例”；两类使用相同的 T／AC 关联与覆盖检查。

两类表单保留“非目标”，不设置“参考资料”；表单、目录、预览和 Markdown 使用同一顺序。

## 可照做的验收与好案例

按 [案例要求](../../forge--linear--show-issue-best-practice/references/executable-acceptance.md) 写前提条件、具体输入与操作、预期结果。不单列执行方式、完整入口、账号组织、清理恢复和未解决条件，不重复步骤表，不生成完成条件章。旧步骤仅作为内部数据保留，不作为新增必填项。

好案例通过 Header 的“查看示例”展示 Todo List 和类幸存者的完整场景与本地可操作原型。查看不改变当前草稿，“使用此示例填写”并确认后才填入；不把示范当作真实产品已上线。

## 标题、Properties 和正文

标题只写 Linear 标题栏，项目、负责人、状态、优先级、估点写右侧 Properties；正文从摘要开始，不重复标题或基本信息。表单保留这些输入，统一生成原生字段和正文。模块只匹配团队已有标签或自定义属性；编号、原链接用于定位，类型用于匹配团队分类，不能伪造不存在的原生字段。未知值不清空已有属性。
预览中的“Linear 标题与 Properties”单独显示，不属于 description；复制和下载 Markdown 只包含正文。导出 JSON 保留完整表单。

任务正文不用表格。每个任务保留编号、名称，再写“前提条件”“操作”“预期结果”。案例只输出一套操作，不另附重复步骤表。

## 当前任务与案例写法

任务合并原业务规则，统一写前提条件、操作和预期结果；案例通过 taskRef 关联任务。删除单独的业务规则和用户流程章。目标预期直接写内容，界面与正文均不重复标签。

Given／When／Then 仅作为内部框架，所有可见标签使用中文。案例正文只输出一套操作，不重复“按顺序执行与逐步检查”的标题或步骤表；旧结构化 steps 仅在内部保留。

## 当前兼容与背景编辑

旧 v12 数据保留迁移前原文，并尽可能转换标准与案例关联；当前必填业务字段缺失时阻断完整生成。可在页面展开原始资料或导出，不静默丢弃。前提条件按当前必要状态逐行填写。背景的原话和 HTTP(S) 截图可自由编排，使用插入截图链接在光标处插入，预览直接显示图片。

## 标题与注脚

章节名称统一为“任务”“验收案例”，不加“抽象”“具体”等后缀。报告、表单预览和生成正文不添加“以下是预期结果，不表示已经执行或验收通过”等解释性注脚、过程说明或重复提醒；缺项放在对应字段和检查结果中，执行状态和真实证据仍如实保留。
