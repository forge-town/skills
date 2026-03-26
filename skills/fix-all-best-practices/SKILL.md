---
name: fix-all-best-practices
description: Use when 需要一键扫描并自动修复项目中所有最佳实践违规问题，自动发现并依次执行所有 best-practice 技能的检查与修复操作。触发词：修复所有违规、自动修复最佳实践、一键规范化项目代码。
---

# 全量最佳实践自动修复

## 使用说明

1. 参考 [references/workflow.md](references/workflow.md) 了解 5 步执行流程（发现→检查→修复→验证→报告）
2. 自动发现所有以 `best-practice` 结尾的技能，依次执行检查与修复

**可自动修复** 的问题直接执行（无需确认）；**涉及架构或业务逻辑** 的问题输出建议并请求用户确认

**配合：** 基于 `check-all-best-practices` 的发现机制，在其基础上增加修复步骤
