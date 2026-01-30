# 入口文件规范 (Index File Template)

**文件命名**: `index.ts`
**核心职责**: 统一导出页面的公共接口。

## 生成规则
1. **只导出包装器组件**：不要导出Content组件或其他内部组件
2. **单一导出**：每个页面只导出一个主要组件
3. **命名一致性**：导出的组件名与页面目录名一致

## 代码模版

```typescript
export { {{PageName}} } from "./{{PageName}}";
```

## 示例

```typescript
// UserProfilePage/index.ts
export { UserProfilePage } from "./UserProfilePage";
```

## 错误示例

```typescript
// ❌ 不要使用通配符导出（会导出所有内容，包括内部组件）
export * from "./UserProfilePage";

// ❌ 不要同时导出包装器和Content组件（应只导出包装器）
export { UserProfilePage } from "./UserProfilePage";
export { UserProfilePageContent } from "./UserProfilePageContent";
```