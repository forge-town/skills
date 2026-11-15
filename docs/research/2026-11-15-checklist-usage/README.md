# Checklist 技能历史核对

> 后续决定（2026-11-15）：用户确认因长期未使用，删除三个 checklist 技能。以下历史记录保留用于追溯，其中“建议保留”和“当前共 11 个技能”为当时判断，已被后续决定取代；当前仓库保留 8 个技能。

核对日期：2026-11-15（Asia/Singapore）。

## 结论

不能把 checklist 相关技能统一判为“从未用过”。保留的三个技能均有明确历史使用记录。`forge--check-checklist` 已按用户要求删除；本轮检索未找到它在当前聊天以外的明确调用记录。

| 当前技能 | 历史名称 | 查到的记录 | 建议 |
| --- | --- | --- | --- |
| forge--show-checklist-standards | checklist-best-practice / forge_checklist-best-practice | 25 个会话中有 59 次成功读取正文或参考文件的命令；包括桌面整理与里程碑技能的编写 | 保留 |
| forge--assess-automation-checklist | assess-automation-checklist | 10 月 4 日的配置门禁工作中明确使用，3 个相关会话共 7 次成功读取命令 | 保留 |
| forge--implement-automation-checklist | implement-automation-checklist | 同一配置门禁工作中明确使用，3 个相关会话共 8 次成功读取命令 | 保留 |

读取次数不是独立任务次数；两个自动化技能的三个会话属于同一工作流，不能算三次独立业务使用。工具读取成功也不单独证明任务完成，以下按声明、读取、文件变更和留存产物相互印证。

## 具体案例

### 2026-10-04：Daedalus 配置门禁

历史助手明确声明使用 `assess-automation-checklist` / `implement-automation-checklist` 设计原生配置校验，之后成功读取两者的正文、workflow 和 checklist。留存方案逐条区分可脚本化项与人工/CLI 校验项，并定义检查器、输出、失败退出与测试结构。

留存方案：[/Users/amin/projects/daedalus/docs/reports/2026-10-04-service-spec-remediation/configuration-checker-design.md](/Users/amin/projects/daedalus/docs/reports/2026-10-04-service-spec-remediation/configuration-checker-design.md)。历史工具输出也列出了 `packages/anatomy-cli-config/checker/src` 与实际测试、fixtures。这里只核对历史使用，没有重新执行当时的工程测试，也不将历史助手报告的通过数量当作本轮验证结果。

相关会话：`01a0cc0c-ff0d-7272-9365-ae1724683bf7`、`01a10603-67d7-7d43-ac34-d352d889ec07`、`01a10532-cf4b-7cf3-baf4-b1a8d70259ac`。

### 2026-10-23：桌面整理技能

会话 `01a1669e-f66e-7200-aea5-2df06665dad8` 成功读取 checklist 编写规范及参考文件，随后有 `organize-desktop/SKILL.md`、`references/checklist.md` 等文件的真实变更记录。

### 2026-10-26：项目里程碑技能

会话 `01a17693-5a7c-7271-8a15-eccbf012fc60` 成功读取 checklist 编写规范，随后有 `check-project-milestones` 技能及其 `references/checklist.md` 的真实变更记录。

## 检索范围与限制

查询本机 `/Users/amin/.codex/thread_history_1.sqlite` 中的用户消息、命令执行、助手消息及相关工具记录，并核对若干原始仓库会话归档与现存设计文档。兼容无前缀、`forge_` 和 `forge--` 历史名称，排除当前聊天，避免把安装目录清单、修改技能本身和系统列举当作调用。

这不是对所有压缩 rollout 的逐字全量扫描，也不包含本机已丢失或其他机器的历史。因此“未找到”不能推导为“从未使用”。证据元数据见同目录 `evidence.json`，不保留无关聊天正文。

## 本轮仓库调整

- `forge--brainstorm-design` → `forge--brainstorm`。
- `forge--introspect-best-practice` → `forge--review-best-practice`。
- 删除 `forge--check-checklist`。
- 保留其余三个 checklist 技能，当前共 11 个技能。
