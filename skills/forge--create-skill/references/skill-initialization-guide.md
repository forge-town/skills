# 技能初始化与更新指南

1. 先读取 [Skill 最佳实践](../../forge--show-skill-best-practice/references/standard.md)，确定技能的动作、输入、范围、输出和完成条件。复用已有技能前核对用途，避免重复入口。
2. 仅 Linear 使用 forge--linear--<verb>-<noun> 二级范畴；其他技能使用 forge--<verb>-<noun> 平铺动作命名；动作已清楚时可直接用 forge--brainstorm。目录名和 name 完全一致，名称最长 64 字符。检查器 ACTION_VERBS 维护可识别动词；必要时一起更新并验证。
3. 按 [结构定义](anatomy.json) 仅创建实际需要的文件。references/checklist.md 必需；可执行工具放 scripts/，参考代码可放 references/ 或 best-practice-examples/。
4. SKILL.md 的 name、description、lastUpdated 为必需元数据；description 单行、以 Use when 开头且少于 150 字符。按需以 YAML 列表声明 dependency.python/system。
5. 正文不超过 20 个非空行，写明读取参考文件的时机；通过真实 Markdown 链接引用资源。允许参考文档进一步导航到其子文件。
6. 完成后按 [本地清单](checklist.md) 核对，更新仓库 README；用 forge--check-all-skills 执行静态检查并另外记录人工内容核对和真实运行验证。

## 内容模板

下列是示意模板，花括号需替换；不是已存在的资源或完成结果。

```text
---
name: forge--<verb>-<noun>
description: Use when {触发场景与动作}
lastUpdated: YYYY-MM-DD
---

# {技能标题}

{输入与产物的简短说明}

1. 开始前读取真实存在的 workflow 参考文件。
2. 按明确步骤执行，并使用包内实际存在的脚本或模板。
3. 完成后读取真实存在的 checklist，记录结果与未验证项。
```

更新现有技能时保留用户已确定的用途与边界；名称变更同步目录、元数据、链接、README、检查器和测试。技能修改不自动授权 Git 提交、发布或对外发送。
