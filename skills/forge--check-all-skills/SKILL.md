---
name: forge--check-all-skills
description: Use when 用户要检查单个或多个 Skill 的命名、元数据、资源、README 及内容一致性；运行静态检查，人工核对用途与产物，区分已验证和待验证项。
lastUpdated: 2026-11-15
---

# 检查 Skill 内容与结构

1. 读取 [检查清单](references/checklist.md) 与 [质量规则](references/quality-standards.md)，确定目标范围。
2. 运行 [TypeScript 检查器](scripts/check-skills.ts)，使用 Node 24+ 的 `node --experimental-strip-types` 或已安装的 tsx；参数为技能父目录与 README 路径。
3. 人工逐项核对名称、适用场景、正文、例子和实际交付是否一致；脚本不会自动证明业务语义。
4. 按 [报告模板](../forge--show-skill-best-practice/references/check-report-template.md) 汇总结果；未运行的外部流程标记 evidence-required。
5. 仅在用户授权范围内修复，修复后重跑相关检查与实际测试。

格式示例见 [参考资源](references/examples/)，其中 JSON/YAML 是示例输入，不是执行程序。
