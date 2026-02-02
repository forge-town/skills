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
    scripts/              # 必需：可执行脚本
      {script-name}.ts    # TypeScript 脚本（首选）
```

### 命名约定

- **技能目录**：`kebab-case`（例如 `vercel-deploy`、`log-monitor`）
- **SKILL.md**：始终大写，始终为此确切文件名
- **脚本**：`kebab-case.ts`（例如 `deploy.ts`、`fetch-logs.ts`）

### SKILL.md 格式

```markdown
---
name: {skill-name}
description: {一句描述何时使用此技能的话。包括触发短语如“部署我的应用”、“检查日志”等。}
---

# {技能标题}

{简要描述技能的功能。}

## 工作原理

{编号列表解释技能的工作流程}

## 使用方法

```bash
pnpx tsx /mnt/skills/user/{skill-name}/scripts/{script}.ts [args]
```

**参数：**
- `arg1` - 描述（默认为 X）

**示例：**
{显示 2-3 个常见使用模式}

## 输出

{显示用户将看到的示例输出}

## 呈现结果

{呈现给用户时结果格式化的模板}

## 故障排除

{常见问题和解决方案，尤其是网络/权限错误}
```

### 脚本要求

- 使用带有适当类型注解的 TypeScript

### 安装

可以通过将技能目录复制到适当位置或将 SKILL.md 内容添加到项目知识中来安装技能。

如果技能需要网络访问，请确保允许必要的域。
