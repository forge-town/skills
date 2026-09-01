# Implement-Automation-Checklist 工作流详解

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
│   └── rules.spec.ts
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
