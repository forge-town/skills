# 技能.md

此文件提供在此存储库中创建和使用技能的指导。

## 存储库概述

一个扩展 AI 能力的技能集合。技能是针对各种开发任务打包的指令和脚本。

## 创建新技能

### 目录结构

```
skills/
  {skill-name}/           # kebab-case 目录名
    SKILL.md              # 必需：技能定义
    references/           # 必需：说明、流程与完成清单
    scripts/              # 有实际可执行工具时提供，不创建占位脚本
      {script-name}.ts    # TypeScript 脚本（首选）
```

### 命名约定

- **技能目录**：`forge--<verb>-<noun>`，使用双中划线命名空间和动词 + 名词后缀（例如 `forge--show-skill-best-practice`、`forge--check-all-skills`）；说明规范也必须以动作动词开头；动作本身已清楚时可直接使用简短名称，如 `forge--brainstorm`，不添加冗余后缀
- **SKILL.md**：始终大写，始终为此确切文件名
- **脚本**：`kebab-case.ts`（例如 `deploy.ts`、`fetch-logs.ts`）

### SKILL.md 格式

入口使用 name、description、lastUpdated 前言；description 以 Use when 开头，单行且少于 150 字符。正文不超过 20 个非空行，只保留用途、流程入口和真实资源链接。完整要求以 [Skill 最佳实践](skills/forge--show-skill-best-practice/references/standard.md) 为准。

纯指令技能不需要空脚本；真实可执行工具放 scripts/，代码参考例子可放 references/ 或 best-practice-examples/。项目检查使用 package.json 中的 check:skills 和 test:skills。

### 脚本要求

- 使用带有适当类型注解的 TypeScript

### 安装

可以通过将技能目录复制到适当位置或将 SKILL.md 内容添加到项目知识中来安装技能。

如果技能需要网络访问，请确保允许必要的域。
