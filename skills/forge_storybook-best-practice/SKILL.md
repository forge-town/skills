---
name: forge_storybook-best-practice
description: Must follow when 创建或维护 Storybook Stories，确保组件文档命名、参数定义和装饰器配置符合项目 Storybook 编写规范。
lastUpdated: 2026-09-01
---

# Storybook Stories 生成器

## 使用说明

1. 读取目标组件文件，分析 props 类型定义
2. 阅读 [代码示例](references/examples.md) 了解 CSF3 写法规范
3. 参考 [best-practice-examples/](best-practice-examples/) 中的完整示例
4. 生成包含 Base、Default、BaseUsage 及其他代表性 Cases 的 stories 文件
5. 对照 [检查清单](references/checklist.md) 逐项验证

**重要：** 每个组件仅为主组件创建 stories；Default case 严格不传任何 props（`args: {}`）；详细 Case 规则与代码规范见参考文件
