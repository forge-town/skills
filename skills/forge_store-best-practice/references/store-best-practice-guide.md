# Store 最佳实践指南

本指南提供了创建和管理状态管理store的最佳实践，基于Zustand库的slice模式。

## 核心原则

1. **Slice模式**：将状态按功能切片，每个slice负责独立的状态管理
2. **类型安全**：使用TypeScript接口定义状态和动作
3. **组合式store**：通过组合多个slices创建完整的store
4. **Context提供**：使用React Context提供store访问

## Slice设计

每个slice应该：

- 定义接口描述状态和动作
- 实现create函数返回slice对象
- 使用StateCreator类型确保类型安全

## Store组合

主store通过扩展所有slice接口组合状态。

## Provider设置

创建Provider组件提供store上下文。

## 使用模式

在组件中使用store。

## 最佳实践

- 保持slice职责单一
- 使用immer进行复杂状态更新
- 添加middleware进行日志记录或持久化
- 测试slice的动作和状态变化
- 使用桶导出保持导入干净

## 强制要求

在使用 forge_store-best-practice 技能时，必须严格遵守 [检查清单](checklist.md)
