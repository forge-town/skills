# Forge Skill Namespace 设计规格

## 目标

为仓库内全部技能统一增加 `forge_` namespace 前缀，使技能在安装和展示时能明确归属于 Forge Town。

示例：

```text
dao-best-practice
→ forge_dao-best-practice
```

## 范围

本次迁移覆盖当前 `skills/` 下的全部 56 个技能：

- 技能目录名
- `SKILL.md` frontmatter 的 `name`
- README 技能表中的名称和链接路径
- 所有跨技能相对路径引用及文档中的技能标识
- `check-all-skills` 检查器的命名和类型识别逻辑
- `package.json` 中检查器脚本的路径

不保留旧名称目录或兼容别名。README 的安装仓库地址 `forge-town/skills` 不变。

## 命名规则

技能名称必须符合：

```text
forge_[a-z0-9]+(-[a-z0-9]+)*
```

其中 `forge_` 是固定 namespace，后半段保持现有 kebab-case 名称不变。技能类型判断先移除 `forge_` 前缀，再依据原有 `-best-practice` 和其他后缀规则分类。

## 迁移方式

使用一次性、可审计的批量重命名完成目录迁移，并同步替换引用。替换必须限定在技能名称和路径上下文，避免修改普通英文单词或代码中的业务标识。所有相对链接迁移后必须重新解析，确保目标文件仍存在。

当前工作区已有的 description 规则修复、检查器接入和 `package.json` 改动属于既有工作，将在实现阶段保留并与 namespace 变更一起验证，不回退或覆盖。

## 验证策略

1. 扫描确认所有 56 个目录均以 `forge_` 开头，且无旧名称目录残留。
2. 检查所有 `SKILL.md` 的 `name` 与目录名完全一致。
3. 检查 README 的 56 个技能链接和所有跨技能 Markdown 引用均可解析。
4. 运行 `pnpm run check:skills`，确认 namespace 规则生效且不再因前缀误判类型。
5. 执行 `git diff --check`，检查无空白错误或意外文件变更。

## 风险与处理

- 外部用户若依赖旧技能名，将需要改用新的 `forge_` 名称；本次不提供旧名别名。
- 相对路径较多，批量替换可能造成断链；通过 Markdown 路径扫描和检查器运行共同兜底。
- 下划线会使旧 kebab-case 正则失效；检查器必须显式支持固定 `forge_` 前缀，不能放宽为任意下划线。
