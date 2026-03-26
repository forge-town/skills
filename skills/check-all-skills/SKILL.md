---
name: check-all-skills
description: Use when 需要批量验证 Skill 是否符合最佳实践规范，自动检查命名、前言区、结构与依赖等维度，生成详细报告并输出修复建议；支持单个或批量检查。触发词：检查skill规范、批量验证技能质量。
---

# Skill 合规性检查工具

## 使用说明

1. 阅读 [references/checklist.md](references/checklist.md) 获取完整检查清单
2. 如需了解各检查项背景，阅读 [references/quality-standards.md](references/quality-standards.md)
3. 按清单逐项验证目标 Skill，生成结构化报告

**批量检查：** 遍历目标目录下所有 Skill，逐一检查并汇总；脚本示例见 [examples/bash-command.sh](references/examples/bash-command.sh)

完成后强制输出检查报告
