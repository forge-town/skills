---
name: skill-best-practice
description: Must follow when 创建或修改 Skill 后执行质量验证，涵盖命名、目录结构、元数据完整性、临时文件清理和依赖格式共 16 项检查。触发词：检查skill规范、skill质量验证、技能合规性检查。
---

# Skill 最佳实践检查

## 任务目标

- 本 Skill 用于: 检查或验证 Skill 是否符合规范要求
- 触发条件: 创建或修改 Skill 后需要检查、验证规范符合性

## 操作步骤

1. 阅读 [references/checklist.md](references/checklist.md) 获取完整检查清单
2. 逐项验证 Skill 目录，记录每项结果（pass / warning / error）
3. 生成检查报告，报告应包含 Skill 名称、总体状态、各检查项详细结果和修复建议（格式见 checklist.md 末尾的"报告格式"章节）
4. 自动修复问题
   - 优先处理 `error` 级别问题
   - 直接修改不符合规范的文件（SKILL.md、目录结构等）
   - 删除临时文件和冗余文件
   - 修复后重新执行检查清单验证

5. 技能库 README 完整性检查：见 [references/check-report-template.md](references/check-report-template.md)
