# Forge Town

基于开发实践和实际使用情况的 [Agent Skills](https://agentskills.io/home) 集合。

## 描述

本项目提供了一套针对我们开发工作流程定制的agent skills，专注于构建实用工具和最佳实践。

> [!IMPORTANT]
> 这是一个概念验证项目，会不定期反复迭代。

## 安装

```bash
pnpx skills add forge-town/skills
```

## 本地检查

安装开发依赖后，可通过 package script 运行技能合规性检查：

```bash
pnpm install
pnpm run check:skills
```

## 技能

| 技能 | 描述 |
|-------|-------------|
| [forge--brainstorm](skills/forge--brainstorm) | Use when 在任何创造性工作之前先精炼需求与方案，包括创建功能、构建组件、添加新功能或修改行为；通过自然对话探索用户意图、约束与成功标准，并产出可审阅设计文档。触发词：brainstorm、头脑风暴、脑暴。 |
| [forge--check-all-skills](skills/forge--check-all-skills) | Use when 用户要检查单个或多个 Skill 的命名、元数据、资源、README 及内容一致性；运行静态检查，人工核对用途与产物，区分已验证和待验证项。 |
| [forge--create-skill](skills/forge--create-skill) | Use when 需要创建一个新 Skill 或更新现有 Skill，将领域知识、工作流程或工具集成打包为可复用技能包，须中文编写。触发词：创建新技能、新建技能、修改skill、更新技能。 |
| [forge--linear--query-issues](skills/forge--linear--query-issues) | Use when 用户要求查看 Linear Issue、剩余任务、类型、负责人或状态；实时只读查询，按产品一级功能板块分组，输出带真实链接、内容、类型、状态和负责人的简表。 |
| [forge--linear--review-acceptance](skills/forge--linear--review-acceptance) | Use when 用户要求复核 Linear Issue 的验收证据、执行 reviewer 验收或回评；按原验收条件独立复测，留下输入输出与结论，按实际复核身份和授权流转状态。 |
| [forge--linear--submit-acceptance](skills/forge--linear--submit-acceptance) | Use when 用户要在 Linear Issue 完成后提交验收、补充验收证据或交接 reviewer；按验收项记录输入、预期与实际输出、上传证据、发布评论并提及实际复核人，交接到 In Review。 |
| [forge--review-best-practice](skills/forge--review-best-practice) | Use when 深度反思已定义的 best-practice，识别盲区、过度设计、隐藏假设和未覆盖场景，并提出可验证的规范改进建议。触发词：反思最佳实践、深挖规范盲区、自检 skill。 |
| [forge--show-skill-best-practice](skills/forge--show-skill-best-practice) | Use when 用户要查看或解释 Skill 编写最佳实践，包括命名、元数据、目录、依赖、交付与验证要求；提供说明与示例，执行检查用 forge--check-all-skills。 |
| [forge--write-brief-report](skills/forge--write-brief-report) | Use when 用户要写工作简报或汇总指定项目、会话的成果；默认生成当天日报，指定时间范围则生成该时段简报，核对实际结果后按事项去重并交付正文。 |

## 许可证

[MIT](LICENSE.md)
