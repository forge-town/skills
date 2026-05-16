# Generate-Slides 执行检查清单

执行过程中逐项确认：

- [ ] 已根据用户输入正确判断 Mode A/B/C，按对应 phase 分支推进
- [ ] Phase 1 用一次 AskUserQuestion 同时问完用途、长度、内容、浏览器编辑四个问题
- [ ] 如有用户图片，已用 Read 工具逐张评估并产出 USABLE/NOT USABLE 标记，与文字共同决定 slide 大纲
- [ ] Phase 2 已生成 3 个独立的 style 预览 HTML 并自动 `open` 给用户对比
- [ ] 生成 HTML 前已读取 `viewport-base.css`、`html-template.md`、`animation-patterns.md`、`style-presets.md`
- [ ] 生成的 HTML 已把 `viewport-base.css` 全文嵌入 `<style>`，未使用 Inter/Roboto/Arial/系统字体，未使用白底紫渐变
- [ ] 每张 slide 满足 `height: 100vh; overflow: hidden`；字号、间距全部用 `clamp()`；图片有 `max-height: min(50vh, 400px)`
- [ ] 内容超过密度限制时已主动拆页，未出现 slide 内滚动
- [ ] 生成的 JS 遵循「单一状态来源 + settled-only sync」模式：`setCurrent()` 是唯一写 `currentIndex` 的入口；`goTo()` 在调用 `scrollIntoView` 之前先 `setCurrent()`；scroll 事件只更新进度条，不直接改 `currentIndex`；从 scroll 位置反算索引必须 debounce ≥100ms。详见 [html-template.md 的 "SlidePresentation State Management" 章节](html-template.md)
- [ ] 交付时已 `open` 启动浏览器，并告知文件位置、导航键、自定义入口
- [ ] 交付后已主动询问是否部署/导出 PDF，并清理 `.claude-design/slide-previews/` 临时目录
