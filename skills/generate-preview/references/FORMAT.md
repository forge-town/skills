# 拆分计划 JSON 格式

## ComponentSplitSchema

TypeScript 类型定义请参见：[schema.ts](schema.ts)

## 字段描述

### componentPath (必需)
- **类型**: string
- **描述**: 被拆分组件的路径
- **格式**: 从项目根目录的相对路径
- **示例**: `"src/components/Dice8"`, `"src/components/Dialog"`

### splitStructure (必需)
拆分结构详情的容器。

#### root (必需)
- **类型**: string
- **描述**: 拆分组件文件的根目录
- **格式**: 小写目录路径
- **示例**: `"src/components/dice8"`, `"src/components/dialog"`

#### files (必需)
- **类型**: 文件对象数组
- **描述**: 拆分组件中的所有文件
- **最小值**: 必须至少有 `index.ts`
- **文件类型**: 仅允许 `"component"` 类型

**文件对象结构**:
TypeScript 类型定义请参见：[schema.ts](schema.ts)

**文件对象示例**:
- [index.ts 示例](examples/file-object-index-example.json)
- [Dice8.tsx 示例](examples/file-object-dice8-example.json)
- [Dice8Face.tsx 示例](examples/file-object-dice8face-example.json)

#### folders (必需)
- **类型**: 空数组
- **值**: 必须始终为 `[]`
- **原因**: 组件文件应为扁平结构，不嵌套在子目录中

### rationale (必需)
- **类型**: string
- **描述**: 解释为什么以及如何拆分组件
- **内容**: 应解释拆分策略和设计决策
- **示例**: `"Dice8 组件拆分为主组件 (Dice8) 和面组件 (Face)。主组件处理状态和交互逻辑，面组件处理视觉渲染。不需要额外的钩子、工具或类型文件，保持简单。"`

## 文件类型

仅支持一种文件类型：

### component
- **扩展名**: `.tsx` (React 组件文件)
- **目的**: 仅 UI 组件文件
- **包括**: 主组件和子组件，加上 index.ts

## 保存文件格式

### 1. JSON 计划文件 ({ComponentName}.temp.json)

保存带有格式的完整 JSON 对象。

**位置**: `src/components/{component-name-lowercase}/{ComponentName}.temp.json`

**示例内容**: [完整 JSON 示例](examples/component-split-schema-example.json)

### 2. 可视化文件 ({ComponentName}.temp.md)

显示文件层次结构的树状结构。

**位置**: `src/components/{component-name-lowercase}/{ComponentName}.temp.md`

**格式**:
```markdown
# {ComponentName} 组件拆分结构

## 文件结构
\```
src/components/{component-name}/
├── index.ts  # component: 导出所有子组件
├── {component-name}.tsx  # component: 主组件描述
└── {component-name}-part.tsx  # component: 子组件描述
\```

## 拆分理由
{rationale text}
```

**示例内容**:
```markdown
# Dice8 组件拆分结构

## 文件结构
\```
src/components/dice8/
├── index.ts  # component: 导出所有子组件
├── dice8.tsx  # component: 带有状态和交互的主 Dice8 组件
└── dice8-face.tsx  # component: 单个骰子面渲染
\```

## 拆分理由
Dice8 组件拆分为主组件和面组件。主组件处理状态/交互，面组件处理视觉渲染。简单结构，无额外文件。
```

## 验证规则

验证拆分计划时，检查：

1. ✅ **模式合规性**: 匹配 ComponentSplitSchema 结构
2. ✅ **必需字段**: componentPath, splitStructure (root, files, folders), rationale 全部存在
3. ✅ **类型正确性**: 所有文件类型必须为 "component"
4. ✅ **文件夹为空**: folders 数组必须为 `[]`
5. ✅ **文件路径有效**: 所有路径都是有效的相对路径
6. ✅ **Index.ts 存在**: 必须在 files 数组中包含 index.ts
7. ✅ **数组非空**: files 数组必须至少有一个文件
8. ✅ **描述存在**: 每个文件必须有描述

## 常见错误

### ❌ 错误: 包含非组件类型
[错误示例](examples/error-non-component-type-example.json)

### ✅ 正确: 仅组件类型
[正确示例](examples/correct-component-type-example.json)

### ❌ 错误: 非空文件夹数组
[错误示例](examples/error-non-empty-folders-example.json)

### ✅ 正确: 空文件夹数组
[正确示例](examples/correct-empty-folders-example.json)

### ❌ 错误: 缺少必需字段
[错误示例](examples/error-missing-fields-example.json)

### ✅ 正确: 所有必需字段存在
[正确示例](examples/correct-all-fields-example.json)
