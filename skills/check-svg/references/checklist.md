# SVG 规范检查完成清单

执行完毕后逐项确认（规范定义见 `svg-icon-best-practice`）：

- [ ] 已扫描所有组件文件中的内联 `<svg>` 标签
- [ ] 需要提取的 SVG 已列出（文件路径 + 行号）
- [ ] 提供了组件化改写方案：目标组件名（PascalCase）和存放路径 `components/icons/`
- [ ] 迁移后 `width`/`height`/`fill`/`className` 已改为 props
