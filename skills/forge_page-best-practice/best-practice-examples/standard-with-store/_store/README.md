# Store 实现

此文件夹中的 store 实现遵循 [forge_store-best-practice](../forge_store-best-practice/) 技能的最佳实践。

## 查看 Store 最佳实践

请参考 [forge_store-best-practice](../forge_store-best-practice/) 技能获取完整的指导和示例：

- [Store 最佳实践指南](../forge_store-best-practice/references/forge_store-best-practice-guide.md)
- [最佳实践示例](../forge_store-best-practice/best-practice-examples/)
- [检查清单](../forge_store-best-practice/references/checklist.md)

## 文件说明

- `index.ts` - 桶导出文件，提供干净的导入接口
- `provider.tsx` - Store provider 组件
- `standardWithStoreSlice.ts` - 状态切片定义
- `standardWithStoreStore.ts` - 主 store 文件

**重要：** 所有 store 实现必须严格遵循 forge_store-best-practice 技能中的模式和最佳实践。