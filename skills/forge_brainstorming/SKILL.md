---
name: forge_brainstorming
description: Use when 在任何创造性工作之前先精炼需求与方案，包括创建功能、构建组件、添加新功能或修改行为；通过自然对话探索用户意图、约束与成功标准，并产出可审阅设计文档。触发词：brainstorm、头脑风暴、脑暴。
lastUpdated: 2026-09-01
---

# 头脑风暴：从想法到设计

通过自然协作对话，把模糊的想法转化为完整的设计方案和规格文档。

## 使用说明

1. 启动时声明："我正在使用 forge_brainstorming 技能来精炼设计方案。"
2. 按 [流程](references/workflow.md) 推进 9 个阶段，每条消息只问一个问题
3. 对照 [检查清单](references/checklist.md) 确认全部阶段完成

## 硬性约束 (HARD-GATE)

在呈现设计方案并获得用户批准之前，**不得**调用任何实现技能、编写任何代码、搭建任何项目框架或采取任何实现行动。无论项目看起来多简单——todo 列表、单函数工具、配置变更——都必须经过此流程。

## 终点

forge_brainstorming 完成后**只能**进入 `forge_writing-plans` 技能。不得直接进入实现、TDD 或 subagent 执行。
