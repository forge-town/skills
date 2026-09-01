---
name: forge_remove-comments
description: Use when 需要批量删除代码文件中的注释，支持 Python、JS、TS、TSX、Java、C/C++、Rust、Go、HTML 等主流编程语言。触发词：删除注释、清除代码注释、移除注释行、批量去注释。
lastUpdated: 2026-09-01
---

# 代码注释删除器

## 使用说明

1. 读取目标文件，识别编程语言
2. 根据语言规则删除注释（详细规则与示例见 [references/examples.md](references/examples.md)）
3. 验证结果，确保无语法错误且代码逻辑未被破坏

**重要原则：** 保护字符串中的注释符号（如 URL `http://`）；处理重要代码前先备份
