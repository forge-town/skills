---
name: forge_test-driven-development
description: Use when 需要以测试先行方式实现功能、修复 bug 或重构行为，严格执行 Red-Green-Refactor 循环，先写失败测试再写最小生产代码并完成重构验证。触发词：TDD、测试先行、红绿重构、先写测试。
---

# 测试驱动开发

先写测试。看它失败。写最小代码使它通过。

## 使用说明

1. 按 [Red-Green-Refactor 流程](references/workflow.md) 推进
2. 对照 [检查清单](references/checklist.md) 确认每步都做到了

## 铁律

```
没有失败测试，就不写生产代码
```

- 先写了代码再补测试？**删掉。** 从头开始
- 测试必须**实际运行并看到失败**，不是凭推断认为它会失败
- 失败必须因功能缺失（不是拼写错误、不是环境问题）
- GREEN 阶段只写**刚好够通过的代码**，不顺手扩展功能
- REFACTOR 仅在全绿之后进行，且不增加行为

**核心原则：** 如果你没有看到测试失败，你就不知道它测的是不是对的东西。**违反规则的字面意思就是违反规则的精神。**

## 与其他技能的关系

| 上游 | 当前 | 下游 |
|------|------|------|
| forge_writing-plans / forge_subagent-driven-development | forge_test-driven-development | 实现完成 |

每个实现任务都必须遵循此技能的 Red-Green-Refactor 循环。
