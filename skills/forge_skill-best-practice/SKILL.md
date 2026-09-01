---
name: forge_skill-best-practice
description: Must follow when 创建或修改 Skill 后执行质量验证，涵盖命名、目录结构、元数据完整性、临时文件清理和依赖格式共 16 项检查。
lastUpdated: 2026-09-01
---

# Skill 最佳实践检查

## 使用说明

1. 阅读 [references/checklist.md](references/checklist.md) 获取完整 16 项检查清单
2. 参考 [references/anatomy.json](references/anatomy.json) 了解 Skill 完整结构规范（目录树、命名、前言区、依赖格式）
3. 按清单逐项验证目标 Skill，按 [references/check-report-template.md](references/check-report-template.md) 格式输出报告

**自动修复：** 优先处理 error 级别问题；直接修改不符合规范的文件（SKILL.md、目录结构等）
   - 删除临时文件和冗余文件
   - 修复后重新执行检查清单验证

5. 技能库 README 完整性检查：见 [references/check-report-template.md](references/check-report-template.md)
