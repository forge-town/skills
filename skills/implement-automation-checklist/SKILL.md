---
name: implement-automation-checklist
description: Use when 需要实际编写检查脚本代码，基于 plan-check-script 的设计方案实现自动化检查器；输出可运行的脚本文件和集成指南。触发词：编写检查脚本、实现自动检查、code checker、写检查器代码。
---

# Implement Automation Checklist

## 使用说明

1. 读取 `assess-automation-checklist` 输出的设计方案
2. 按优先级实现各规则的检查逻辑：
   - 搭建脚本框架（文件扫描、AST 解析、报告生成）
   - 逐个实现规则（从 P0 开始）
   - 添加测试用例（好/坏示例文件）
3. 输出可运行的检查脚本和 [使用文档](references/usage-guide.md)

**核心原则：** 专注编码实现，产出可运行的检查脚本，而非分析报告

## 实现步骤

```
读取设计方案
    ↓
搭建脚本框架
├── 文件扫描器（glob 模式）
├── AST 解析器（按需）
├── 规则注册器
└── 报告格式化器
    ↓
实现规则（按优先级）
    ↓
编写测试用例
    ↓
集成验证
```

## 脚本输出物

```
checker/
├── src/
│   ├── index.ts           # CLI 入口
│   ├── scanner.ts         # 文件扫描
│   ├── rules/             # 规则实现
│   │   ├── index.ts
│   │   ├── no-default-export.ts
│   │   ├── naming-convention.ts
│   │   └── ...
│   └── formatters/
│       └── json.ts        # JSON 报告
├── tests/
│   ├── fixtures/          # 好/坏示例
│   └── rules.test.ts
├── package.json
└── README.md              # 使用说明
```

## 规则实现模板

```typescript
// src/rules/no-default-export.ts
import { Rule } from '../types';

export const noDefaultExport: Rule = {
  name: 'no-default-export',
  check(filePath, ast) {
    const violations: Violation[] = [];
    
    traverse(ast, {
      ExportDefaultDeclaration(node) {
        violations.push({
          file: filePath,
          line: node.loc?.start.line,
          message: 'Barrel 文件禁止默认导出',
          rule: this.name,
        });
      },
    });
    
    return violations;
  },
};
```
