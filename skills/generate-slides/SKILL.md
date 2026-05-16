---
name: generate-slides
description: Use when 需要生成网页幻灯片（HTML 演示文稿），支持从零创建、PPT 转换或增强现有 deck，输出零依赖单文件 HTML，自带动画与响应式。触发词：生成幻灯片、做 PPT、网页演示文稿、slides。
---

# 生成网页幻灯片

通过对话生成零依赖、动画丰富的 HTML 幻灯片：从零创建、PPT 转换或修改现有 deck。

## 使用说明

1. 按 [流程](references/workflow.md) 推进 Phase 0~6（Mode 检测 → 内容收集 → 风格发现 → 生成 → 交付 → 可选分享）
2. 生成前必读：[viewport-base.css](references/viewport-base.css)、[html-template.md](references/html-template.md)、[animation-patterns.md](references/animation-patterns.md)、[style-presets.md](references/style-presets.md)
3. 完成后对照 [检查清单](references/checklist.md) 验证

## 硬性约束（NON-NEGOTIABLE）

- **零依赖**：单 HTML 文件，CSS/JS 全部 inline，禁止 npm/构建工具/框架
- **视口适配**：每张 slide 必须严格 `height: 100vh; overflow: hidden`，禁止 slide 内滚动；字号与间距全部用 `clamp()`
- **反 AI slop**：禁用 Inter/Roboto/Arial 字体与"白底紫渐变"配色，必须从 style-presets 选明确风格
- **完整复制 viewport-base.css**：每个生成的 HTML 都必须把 [viewport-base.css](references/viewport-base.css) 全文嵌入 `<style>` 块
