---
name: check-all-skills
description: 批量检查Skill是否符合最佳实践规范；自动验证命名、格式、结构、脚本质量等维度；支持单个或批量检查；生成详细检查报告和JSON格式输出；适用于Skill开发完成后的质量验证；触发场景包括"检查所有skill是否符合规范"、"验证skill目录结构"等
---

# Skill 合规性检查工具

## 任务目标
- 本 Skill 用于:检查一个或多个 Skill 是否符合最佳实践规范
- 能力包含:读取 Skill 文件、验证命名、格式、结构、脚本质量等维度、生成检查报告
- 触发条件:用户需要验证 Skill 质量时，如 "检查所有 skill 是否符合规范"、"验证 skill 目录结构"、"检查这个 skill 是否符合要求"

## 前置准备
- 无特殊依赖

## 操作步骤

### 标准流程

#### 步骤 1：读取检查规范
- 阅读 [references/skill-best-practices.md](references/skill-best-practices.md)，了解完整的检查规范

#### 步骤 2：检查单个 Skill
- 阅读目标 Skill 的 `SKILL.md` 文件
- 检查目录结构和文件列表
- 根据检查规范中的清单，逐项验证所有检查项

#### 步骤 3：批量检查多个 Skill（自动遍历）
- 使用目录遍历命令列出目标目录下所有 Skill：
  ```bash
  ls -d /workspace/projects/*/SKILL.md 2>/dev/null | xargs -I{} dirname {}
  ```
  或
  ```bash
  find /workspace/projects -maxdepth 2 -name "SKILL.md" -exec dirname {} \;
  ```
- 获取所有 Skill 目录列表后，对每个 Skill 重复步骤 2 的检查流程

#### 步骤 4：生成检查报告
- 汇总所有检查结果
- 对每个 Skill 生成报告，包含：检查项明细、通过/失败状态、通过率
- 提供总体统计：Skill 数量、通过率、最常见问题

#### 步骤 5：问题修复（可选）
- 如果检查发现问题，根据用户需求执行修复：
  - **自动修复**：对于可安全自动修复的问题（如删除临时文件、删除空目录、修正简单格式错误），直接执行修复
  - **人工确认**：对于需要判断的问题（如重命名目录、修改 description、删除可能需要的文件），提供修复建议，等待用户确认
- 参考 skill-best-practices 的"问题修复指南"章节
- 修复后重新验证，确认问题已解决且没有引入新问题

## 资源索引
- 领域参考:见 [../skill-best-practice/references/checklist.md](../skill-best-practice/references/checklist.md)
  - 内容:完整的 Skill 最佳实践规范检查清单（9大类检查项）+ 问题修复指南
  - 何时读取:开始检查前阅读，检查过程中作为参考，问题修复时查阅修复方法

## 注意事项
- 批量检查时，建议分批处理大量 Skills
- 修复问题后必须重新验证

## 使用示例

### 示例 1：检查单个 Skill
用户："检查 check-all-skills 这个 skill 是否符合规范"

执行步骤：
1. 读取检查规范
2. 读取 `/workspace/projects/check-all-skills/SKILL.md`
3. 检查目录结构
4. 逐项验证检查清单
5. 输出检查报告

### 示例 2：批量检查多个 Skill（自动遍历）
用户："检查 /workspace/projects 目录下所有 skill 是否符合规范"

执行步骤：
1. 读取检查规范
2. 使用步骤 3 中的命令列出该目录下所有 Skills
3. 对每个 Skill 执行步骤 2 的检查流程
4. 生成汇总报告

### 示例 3：检查并自动修复问题
用户："检查所有 skill 是否符合规范，发现问题自动修复"

执行步骤：
1. 读取检查规范和问题修复指南
2. 使用步骤 3 中的命令识别当前工作目录下的所有 Skills
3. 对每个 Skill 执行步骤 2 的检查流程
4. 根据步骤 5 执行修复：
   - 可自动修复的：直接执行修复
   - 需要确认的：提供修复建议，询问用户是否同意
5. 修复后重新验证
6. 生成修复报告

### 示例 4：检查特定维度
用户："检查 check-all-skills 的命名和目录结构是否符合规范"

执行步骤：
1. 仅检查命名规范相关项目
2. 仅检查目录结构相关项目
3. 输出这两类检查的结果