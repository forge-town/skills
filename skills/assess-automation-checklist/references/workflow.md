# Assess-Automation-Checklist 工作流详解

## 执行步骤

1. 读取目标 checklist（如 `dao-best-practice/references/checklist.md`）
2. 逐项分析脚本化可能性：
   - ✅ **可脚本化**：基于 AST/正则/文件系统即可判断
   - ❌ **需 LLM**：涉及语义理解、业务逻辑、设计决策
   - ⚠️ **混合**：脚本初筛 + LLM 复核
3. 输出脚本化设计方案：
   - 技术选型（AST parser、lint 工具、正则）
   - 脚本架构设计
   - 各规则的实现策略

**核心原则：** 只出方案不写代码，明确区分机器 vs 人类职责边界

## 脚本化评估标准

| 可脚本化 ✅ | 需 LLM ❌ |
|-----------|----------|
| 文件名/目录名规范 | 命名是否合理、语义是否清晰 |
| 导入/导出模式 | 抽象层次是否恰当 |
| 语法结构（try-catch、async） | 错误处理逻辑是否正确 |
| 文件存在性检查 | 文件内容质量 |
| 代码行数统计 | 复杂度是否过高 |

## 输出格式

```markdown
## 脚本化设计方案: {checklist-name}

### 技术选型
- AST 解析: @babel/parser + traverse
- 文件匹配: glob
- 输出格式: JSON violations

### 规则映射
| Checklist 项 | 脚本化策略 | 复杂度 |
|-------------|-----------|-------|
| 文件名必须为 kebab-case | 正则匹配 | 低 |
| 禁止默认导出 | AST 检测 ExportDefaultDeclaration | 中 |
| 组件必须单一职责 | 需 LLM 判断 | 不可脚本化 |

### 脚本架构
```
scanner/
├── parsers/      # AST 解析器
├── rules/        # 各检查规则实现
├── formatters/   # 报告格式化
└── index.ts      # 入口
```

### 实现优先级
1. P0: 命名规范类规则（简单、高频）
2. P1: 导入导出类规则（中等复杂度）
3. P2: 结构类规则（需跨文件分析）
```
