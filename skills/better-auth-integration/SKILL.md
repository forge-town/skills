---
name: better-auth-integration
description: Must follow when 需要将 Better Auth 认证系统集成到项目，涵盖安装配置、数据库集成、Provider 设置和认证流程验证等完整步骤。触发词：集成better-auth、配置认证系统、接入鉴权。
---

# Better Auth Integration Skill

## 执行协议（5 Phase，按顺序执行）

| Phase | 目标 | 参考文件 |
|-------|------|---------|
| 1 探索 | 摸清项目结构，禁止跳过 | [phase-1-exploration-checklist.md](references/phase-1-exploration-checklist.md) |
| 2 安装 | 补齐依赖与 env | [phase-2-install-commands.sh](references/phase-2-install-commands.sh)、[.env.example](references/env/.env.example) |
| 3 Schema | 校正数据库表结构 | [db-schema/](references/db-schema/) |
| 4 实现 | 落地 5 个核心文件 | [core-files/](references/core-files/) |
| 5 验证 | 接口联调验证 | [phase-5-verification.md](references/phase-5-verification.md)、[phase-5-verify-auth.sh](references/phase-5-verify-auth.sh) |

**关键约束：** better-auth 托管表的 id 及关联 user_id 必须使用 `text`，不可使用 `uuid`；API 路由必须使用静态 import

**故障排查：** [troubleshooting/pitfalls.md](references/troubleshooting/pitfalls.md) | [architecture/flow.md](references/architecture/flow.md)
