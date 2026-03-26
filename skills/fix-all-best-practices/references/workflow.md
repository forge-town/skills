# 全量最佳实践修复工作流

## 执行步骤

### 步骤 1：发现阶段

- 扫描技能库，自动发现所有以 `best-practice` 结尾的技能
- 确认执行顺序（foundation 类先于 feature 类）

### 步骤 2：检查阶段

- 对目标项目依次运行每个 best-practice 技能的检查
- 收集所有违规项，分类为：
  - **auto-fix**：可直接自动修复
  - **confirm-required**：需要人工确认

### 步骤 3：修复阶段

**可直接执行（无需确认）：**
- `refactor-classname`：className 模板字符串 → cn 函数调用
- `check-barrel-export`：生成/修复 index.ts 桶导出文件
- `check-svg`：内联 SVG 提取为独立组件
- `check-try-catch`：空 catch 块添加基本错误处理
- 命名、目录结构类问题

**需要人工确认（提供方案后等待确认）：**
- 组件拆分（商业逻辑判断，已有 `implement-split` 技能辅助）
- 架构层变更（`check-refine-trpc` 类违规）
- 数据库 Schema 变更（`db-table-best-practice`、`schema-best-practice` 类）
- Service / DAO 层重构

### 步骤 4：验证阶段

- 对已修复的问题重新运行对应 best-practice 检查
- 确认修复后未引入新违规

### 步骤 5：报告阶段

输出修复汇总报告：

```
📋 全量最佳实践修复报告

✅ 已自动修复：N 项
  - [技能名] [文件路径]：[修复内容]

⚠️ 需手动处理：N 项
  - [技能名] [文件路径]：[问题描述]
  - 建议操作：[具体修复步骤]

❌ 修复失败：N 项（含失败原因）

📊 统计：共检查 X 个文件，修复 Y 项，待处理 Z 项
```
