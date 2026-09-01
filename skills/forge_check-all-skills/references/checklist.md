# Skill 合规性检查清单

执行完毕后逐项确认：

- [ ] 已完成目标 Skill 的命名规范检查（`forge_` namespace、kebab-case 后缀、无赘余 `-skill` 后缀）
- [ ] 已确认 SKILL.md 前言区 `name` 与目录名一致、`description` 为单行且少于 150 字符
- [ ] 已确认 `description` 前缀协议（动词型 `Use when`、best-practice 型 `Must follow when`）
- [ ] 已确认目录结构合规（无 README.md、LICENSE 等禁用文件，无空子目录）
- [ ] 已确认无临时文件（`.DS_Store`、`__pycache__`、`*.log` 等）
- [ ] 已确认动词型 Skill 有 `references/checklist.md`；best-practice 型有 `best-practice-examples/`
- [ ] 已确认所有 checklist.md 使用 `- [ ]` 勾选格式，符合 forge_checklist-best-practice 规范
- [ ] 已确认 README.md 技能表格中存在该 Skill 的记录且链接有效
- [ ] 已确认 README.md 中该 Skill 的描述与其 SKILL.md `description` 字段内容完全一致（字符相同）
- [ ] 已输出检查报告（通过 / 警告 / 错误 统计）
- [ ] 已对无法静态证明的语义项标记 `evidence-required`，没有将其静默计为通过或跳过
- [ ] 已确认语义审查只依据最终可呈现结构与行为，每个 checklist 独立判定
