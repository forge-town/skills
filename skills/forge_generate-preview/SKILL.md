---
name: forge_generate-preview
description: Use when 需要对 React 组件文件生成结构化 .json 描述和可视化 .md 目录树预览，用于组件拆分前的详细结构分析、复杂度评估与规划。触发词：生成组件预览文档、拆分前分析、组件结构可视化。
---

# generatePreview

## 使用说明

1. 接收 `.tsx` 文件路径，分析组件的子组件、props、状态、hooks 调用
2. 遵循 [FORMAT.md](references/FORMAT.md) 规范生成结构化 JSON
3. 生成可视化 Markdown 目录树
4. 输出临时文件（强制使用 `.temp.` 中缀）；示例见 [EXAMPLES.md](references/EXAMPLES.md)

**注意：** 此技能仅做结构提取，不涉及业务逻辑判断或拆分决策；详细格式与需求规范见 [REQUIREMENTS.md](references/REQUIREMENTS.md)
