# 组件拆分要求

## 拆分原则

### 1. 仅拆分 UI 组件

将组件拆分为独立的 **UI 组件文件**。每个子组件应处理不同的 UI 功能。

**重要：仅生成 UI 组件文件。不要生成：**
- ❌ 钩子文件（例如 use*.ts, *-hooks.ts）
- ❌ 工具文件（例如 utils.ts, helpers.ts, constants.ts）
- ❌ 类型定义文件（例如 types.ts, interfaces.ts）
- ❌ 样式文件（例如 styles.ts, *.css, *.scss）
- ❌ 测试文件（例如 *.test.tsx, *.spec.tsx）

**仅生成：**
- ✅ index.ts（用于导出所有子组件）
- ✅ 组件文件（*.tsx）

### 2. 最小拆分

- **仅拆分必要的内容** - 避免过度拆分为太多小块
- **专注于主要 UI 部分** - 不是每个小元素都需要自己的文件
- **单一职责** - 每个子组件处理一个明确的 UI 功能
- **可组合** - 子组件可以灵活组合

### 3. 必需输出

生成拆分计划时，必须提供：

1. **拆分计划（JSON 格式）** - 遵循 ComponentSplitSchema
2. **文件结构可视化** - 树状文本显示所有文件

### 4. 本地保存文件

生成拆分计划后，保存这些文件：

1. **JSON 计划**: `src/components/{component-name-lowercase}/{ComponentName}.temp.json`
2. **可视化**: `src/components/{component-name-lowercase}/{ComponentName}.temp.md`

示例：
- 对于组件 `Dice8`，保存到 `src/components/dice8/{ComponentName}.temp.json`
- 对于组件 `Switch`，保存到 `src/components/switch/{ComponentName}.temp.json`

## 拆分指南

### 拆分什么

基于 **UI 结构和视觉边界** 拆分组件：

✅ **拆分当**：
- 组件有不同的视觉部分（头部、内容、尾部）
- 组件有可重用的 UI 部分（按钮、项目、覆盖层）
- 组件有多个状态的不同 UI（打开/关闭、激活/非激活）
- 组件有可以独立样式化的子元素

❌ **不要拆分当**：
- 元素只是一个包装器 `<div>`
- 元素是单行文本或图标
- 元素没有独立的 UI 目的
- 拆分会创建太多小文件

### 常见模式

#### 简单组件（2-3 个文件）

具有一个主要部分和一两个子部分：

```
src/components/dice8/
├── index.ts           # 导出
├── Dice8.tsx          # 主组件
└── Dice8Face.tsx     # 面渲染
```

#### 中等组件（4-6 个文件）

具有多个不同 UI 部分：

```
src/components/switch/
├── index.ts           # 导出
├── SwitchRoot.tsx    # 容器
└── SwitchThumb.tsx   # 滑块元素
```

#### 复杂组件（7+ 个文件）

具有许多 UI 部分（对话框、选择等）：

```
src/components/dialog/
├── index.ts              # 导出
├── DialogTrigger.tsx    # 触发按钮
├── DialogOverlay.tsx    # 背景覆盖层
├── DialogContent.tsx    # 主内容容器
├── DialogHeader.tsx     # 头部部分
└── DialogFooter.tsx     # 尾部部分
```

## 文件命名

- **组件文件**: 使用 kebab-case（小写带连字符）
  - 主文件: `component-name.tsx`
  - 子部分: `component-name-subpart.tsx`
- **索引文件**: 始终为 `index.ts`
- **目录**: 小写组件名称（例如 `dice8`, `dialog`, `select`）
- **临时文件**: 中缀 `.temp.`（例如 `UserProfile.temp.json`）

## 后续步骤

生成预览文档后：

1. **验证** - 检查 .temp.json 和 .temp.md 的准确性，确保分析结果正确
2. **审查** - 确保预览分析符合组件实际结构，如有偏差可调整分析参数
3. **执行拆分** - 使用 implement-split 技能基于预览文档创建实际组件文件

