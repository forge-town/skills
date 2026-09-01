# 组件拆分示例

此文件包含组件拆分计划的真实世界示例。

## 示例 1：Dice8 组件（推荐 - 简单）

Dice8 组件是一个具有最少文件的简单示例。

### JSON 计划
[Dice8 拆分计划](examples/dice8-split-plan.json)

### 可视化
```
src/components/dice8/
├── index.ts  # component: 导出所有子组件
├── Dice8.tsx  # component: 带有状态管理和交互逻辑的主 Dice8 组件
└── Dice8Face.tsx  # component: 单个骰子面渲染组件
```

### 保存位置
- JSON 计划: `src/components/dice8/{ComponentName}.temp.json`
- 可视化: `src/components/dice8/{ComponentName}.temp.md`

### 为什么有效
- **最少文件**: 总共仅 3 个文件（索引 + 2 个组件）
- **清晰分离**: 状态/逻辑在主组件，渲染在面组件
- **无额外**: 无钩子、工具、类型或测试文件
- **可重用**: 面组件可以独立使用

---

## 示例 2：Switch 组件（简单）

Switch 组件是另一个简单示例，展示容器/子模式。

### JSON 计划
[Switch 拆分计划](examples/switch-split-plan.json)

### 可视化
```
src/components/switch/
├── index.ts  # component: 导出所有子组件
├── SwitchRoot.tsx  # component: Switch 根容器，处理切换状态和交互
└── SwitchThumb.tsx  # component: Switch 拇指/滑块，视觉指示器
```

### 为什么有效
- **容器/子模式**: Root 包含并管理 Thumb
- **状态在父级**: Root 处理切换状态
- **视觉在子级**: Thumb 纯粹是展示性的
- **可组合**: Thumb 可以独立样式化/替换

---

## 示例 3：Dialog 组件（复杂）

Dialog 组件是一个具有多个 UI 部分的更复杂示例。

### JSON 计划
[Dialog 拆分计划](examples/dialog-split-plan.json)

### 可视化
```
src/components/dialog/
├── index.ts  # component: 导出所有子组件
├── DialogTrigger.tsx  # component: 触发按钮
├── DialogOverlay.tsx  # component: 背景覆盖层
├── DialogContent.tsx  # component: 主内容容器
├── DialogHeader.tsx  # component: 头部部分
└── DialogFooter.tsx  # component: 尾部操作区域
```

### 为什么有效
- **不同部分**: 每个文件处理一个明确的 UI 部分
- **可组合布局**: Header、Content、Footer 可以混合/匹配
- **可选部分**: 不是所有对话框都需要所有部分
- **视觉边界**: 拆分遵循自然视觉划分

---

## 示例 4：Select 组件（复杂下拉菜单）

具有分组和多个交互点的复杂下拉菜单。

### JSON 计划
[Select 拆分计划](examples/select-split-plan.json)

### 可视化
```
src/components/select/
├── index.ts  # component: 导出所有子组件
├── SelectTrigger.tsx  # component: 触发，显示当前值
├── SelectContent.tsx  # component: 下拉容器
├── SelectItem.tsx  # component: 单个选项
├── SelectGroup.tsx  # component: 选项组容器
└── SelectLabel.tsx  # component: 组标签
```

---

## 常见模式总结

### 模式 1：简单组件（2-3 个文件）
**使用当**: 组件有一个主要部分和一两个子部分
**示例**: Dice8, Switch, Button
**结构**:
```
component/
├── index.ts
├── Component.tsx (main)
└── ComponentPart.tsx (sub-part)
```

### 模式 2：容器组件（3-5 个文件）
**使用当**: 组件有多个内部部分
**示例**: Card, Panel, Accordion
**结构**:
```
component/
├── index.ts
├── ComponentContainer.tsx
├── ComponentHeader.tsx
├── ComponentBody.tsx
└── ComponentFooter.tsx
```

### 模式 3：复杂交互（5-8 个文件）
**使用当**: 组件有许多交互点和部分
**示例**: Dialog, Select, Dropdown, Menu
**结构**:
```
component/
├── index.ts
├── ComponentTrigger.tsx
├── ComponentOverlay.tsx
├── ComponentContent.tsx
├── ComponentHeader.tsx
├── ComponentBody.tsx
└── ComponentFooter.tsx
```

---

## 反模式（不要做什么）

### ❌ 错误: 过度拆分

**坏示例**:
```
src/components/dice8/
├── index.ts
├── Dice8.tsx
├── Dice8Face.tsx
├── Dice8Number.tsx      # 过于细粒度！
├── Dice8Border.tsx      # 过于细粒度！
├── Dice8Dot.tsx         # 过于细粒度！
└── Dice8Background.tsx  # 过于细粒度！
```

**为什么**: 太多小文件使组件难以理解和维护。

**修复**: 将相关元素组合到逻辑组中。

### ❌ 错误: 包含非组件文件

**坏示例**:
```
src/components/dice8/
├── index.ts
├── Dice8.tsx
├── Dice8Face.tsx
├── dice8-hooks.ts      # ❌ 不要包含钩子！
├── constants.ts        # ❌ 不要包含常量！
├── types.ts            # ❌ 不要包含类型！
└── dice8.spec.tsx      # ❌ 不要包含测试！
```

**为什么**: 此技能仅拆分 UI 组件，不包括其他文件类型。

**修复**: 仅包含 index.ts 和 .tsx 组件文件。

### ❌ 错误: 非空文件夹数组

**坏示例**: [非空文件夹数组示例](examples/antipattern-non-empty-folders.json)

**为什么**: 组件文件应在一个目录中扁平化。

**修复**: 始终使用 `"folders": []`

### ❌ 错误: 缺少索引文件

**坏示例**: [缺少索引文件示例](examples/antipattern-missing-index.json)

**为什么**: index.ts 对于干净的导出是必需的。

**修复**: 始终将 index.ts 作为第一个文件包含。

---

## 验证清单

创建拆分计划时使用此清单：

- [ ] 指定了组件路径
- [ ] 根目录是小写
- [ ] 包含了 index.ts
- [ ] 所有文件类型为 "component"
- [ ] 所有文件有描述
- [ ] folders 数组为空 `[]`
- [ ] 提供了理由
- [ ] 未包含钩子/工具/类型/测试文件
- [ ] 文件数量合理（未过度拆分）
- [ ] 每个组件有明确的 UI 目的

---

## 后续步骤

查看这些示例后：
1. 生成组件预览文档（.temp.json 和 .temp.md）
2. 使用 forge_implement-split 技能基于预览文档创建实际组件文件
