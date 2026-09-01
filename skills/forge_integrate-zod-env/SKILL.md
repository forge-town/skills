---
name: forge_integrate-zod-env
description: Use when 需要配置类型安全的环境变量管理模块，基于 .env.example 使用 Zod 生成 env schema 和标准化管理工具。触发词：zod 环境变量、env 类型安全、env schema。
---

# Zod 环境变量集成

## 使用说明

1. 根据项目类型选择对应参考指南：
   - 单环境：[单环境代码生成指南](references/single-env-guide.md)
   - 多环境：[多环境代码生成指南](references/multi-env-guide.md)
2. 严格参照 [best-practice-examples/](best-practice-examples/) 中的代码结构生成代码

**重要：** 必须严格遵循 `best-practice-examples` 中的结构，任何偏离都可能破坏类型安全保证
