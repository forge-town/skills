---
name: forge_check-hardcode
description: Use when 需要检查代码中是否存在硬编码内容，包括魔法数字、路径、URL、密钥、环境变量、响应消息等；确保所有可配置值都使用常量或配置文件管理。触发词：硬编码、hard code、magic number。
---

# 硬编码检查

## 使用说明

1. 对照 [检查清单](references/checklist.md) 逐项扫描目标代码

**核心判断标准：** 若该值未来可能因环境、配置或业务变化而不同，它就不应该硬编码在逻辑代码里
