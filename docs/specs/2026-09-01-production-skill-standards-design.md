# 正式环境 Skill 规范同步设计

## 背景

戴达罗斯正式环境的 Code Forge 工作区已经启用新的审查约束。通过项目 MCP 注册代码和正式数据库的只读规则确认：非基础 UI 组件只能直接使用 `div`；其余原生 DOM 必须由职责明确的基础组件封装。正式环境的典范检查还要求只依据最终可呈现结构与行为判定，每个检查项独立取证，证据不完整时不能判定通过，也不能把证据不足当作跳过。

当前 forge-town/skills 仓库存在三类滞后：

1. `ui-components-best-practice` 仍允许业务组件直接使用大量语义化原生标签，示例还直接使用原生 `<form>`。
2. `skill-best-practice` 文档与 `check-all-skills` 脚本没有完整覆盖清单中声明的结构、前缀、临时文件、依赖元数据、正例目录和 Bad Case 检查；脚本也不能输出独立、可追溯的检查结果。
3. 已确认的 `forge_` namespace 迁移尚未执行，目录名、frontmatter、README、交叉引用和脚本入口仍使用旧名称。

## 目标

- 将 UI 组件规范同步到正式环境的原生 DOM 边界：非基础组件只允许 `div`，基础组件承担原生元素封装责任。
- 让 `skill-best-practice`、`check-all-skills` 和 `create-skill` 对同一套 16 项质量要求使用一致表述与可验证规则，保留 description 严格少于 150 字符的已确认要求。
- 把检查结果按技能、检查项和证据逐项输出；缺少证据只能失败或标记未完成，不得静默通过。
- 完成所有技能的 `forge_` namespace 迁移，并保持 README、交叉引用和 package 脚本可用。

## 方案与边界

采用“规范文档 + 确定性元数据检查 + 人工/项目扫描负责语义判定”的组合方案：

- Skill 文档明确正式 DOM 边界、基础组件的职责判定和最终渲染证据要求。
- 批量脚本负责可确定的文件系统、frontmatter、命名、长度、目录、临时文件、依赖格式、README 同步和 namespace 检查；不把无法从静态文本可靠推断的“是否为基础组件”伪装成自动通过。
- 业务代码中的 DOM 语义仍由戴达罗斯的项目规则扫描，避免在通用 Skill 仓库中硬编码某一个项目的组件路径。

不采用仅修改 README 的方案，也不采用把生产数据库规则复制成 forge-town 仓库中的第二套独立规则；两者都会造成规范漂移。

## 具体变更

### UI 组件最佳实践

- 更新 `references/standard.md`：删除“任意语义化原生标签均可使用”的宽松例外，改为“非基础组件仅允许 `div`；基础组件按职责封装对应原生元素”。
- 更新 `references/checklist.md`：增加基础组件边界、别名/`createElement` 绕过、最终渲染证据和独立判定条目；保留现有组件映射和 Bad Case 节，但 Good Case 代码只放在 `best-practice-examples/`。
- 更新示例：业务表单不再直接渲染 `<form>` 等原生元素，示例中的注释和组件导入与新边界一致。

### Skill 质量检查器

- 把脚本检查拆成独立结果项，每项包含技能名、规则标识、状态、实际值和修复建议。
- 覆盖 `skill-best-practice` 清单声明的可自动验证部分：kebab-case、`-skill` 后缀、frontmatter `name`/`description`、`Use when`/`Must follow` 前缀、`description < 150`、正文长度、必需目录/文件、Best Practice 示例、临时文件、依赖格式、README 链接和 namespace 一致性。
- 对无法静态证明的语义项明确输出 `manual`/`evidence-required`，不将其计为 pass；退出码在存在 error 或未完成强制项时为非零。
- 同步 `skills/check-all-skills/references/`、`skills/create-skill/references/` 与 `skills/skill-best-practice/references/` 的术语和阈值。

### Namespace 迁移

- 将每个 `skills/<name>` 目录重命名为 `skills/forge_<name>`。
- 将对应 SKILL.md 的 `name`、README 链接/显示名、交叉引用、脚本路径和示例路径全部同步为 `forge_<name>`。
- 目录名检查器允许并强制该 namespace 格式；不保留旧名兼容别名，避免安装时出现两个可选入口。
- `package.json` 保留 `check:skills` 入口，并使其检查迁移后的路径。

## 数据流与错误处理

1. 脚本枚举技能目录并读取每个 `SKILL.md`。
2. 每项检查返回确定状态和证据；解析失败、缺失文件、阈值违规均为 error。
3. 语义无法静态证明的项目返回 evidence-required，并在汇总中明确列出。
4. 所有技能检查结束后统一输出报告；存在 error 或 evidence-required 时退出码为 1。
5. namespace 迁移后重新扫描 README、交叉引用和 package 脚本，发现旧路径即失败。

## 验证策略

- 运行 `pnpm run check:skills`，确认所有可自动验证项通过，当前已知的缺失清单/示例问题被准确报告。
- 对检查器添加覆盖边界条件的 fixture：description 149/150 字符、缺失 frontmatter、旧 namespace、临时文件、非法依赖、缺失 README、缺失 checklist/example。
- 运行 `git diff --check`，并抽查随机技能的目录、frontmatter、README 链接和交叉引用。
- 不修改戴达罗斯数据库或其业务源码；本次变更只同步 forge-town/skills 的规范、检查器和 namespace。

## 成功标准

- UI 组件规范与正式“基础 DOM 使用约束”一致，示例不再展示业务组件直接使用被禁止的原生标签。
- 检查器能够确定性发现所有声明的元数据/结构问题，并对语义项显式要求证据。
- 所有技能均以 `forge_` 前缀安装、引用和展示，README 与 package 脚本可用。
- 检查命令和格式校验通过；没有凭空声称正式规则已被数据库写入。
