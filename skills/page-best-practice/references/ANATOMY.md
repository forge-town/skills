# 页面解剖学规范 (Page Anatomy Specification)

本文档定义了 `apps/web/src/pages` 目录下所有页面的目录结构标准。具体组件的实现细节请参考对应的 TEMPLATE 文档。

## 1. 目录结构树

一个标准的页面（Page）**必须**是一个独立的目录，结构如下：

```text
[PageName]/                  # 目录名：大驼峰 (PascalCase)，例如 ConfigPage
├── index.ts                 # 入口文件：统一导出
├── [PageName].tsx           # Wrapper组件：仅负责组装和依赖注入
├── [PageName]Content.tsx    # View组件：负责具体的 UI 实现
└── _store/                  # logic模块：(可选) 负责状态管理
    ├── index.ts
    ├── provider.tsx
    ├── [camelCaseName]Slice.ts    # Slice定义：状态和动作的模块化定义
    └── [camelCaseName]Store.ts    # Store创建：组合 slice 并创建 store 实例
```

## 2. 命名约定

| 实体 | 命名格式 | 示例 |
| :--- | :--- | :--- |
| **页面目录** | PascalCase | `UserProfilePage` |
| **Wrapper文件** | PascalCase.tsx | `UserProfilePage.tsx` |
| **View文件** | PascalCase + 'Content'.tsx | `UserProfilePageContent.tsx` |
| **Store目录** | `_store` (固定) | `_store` |
| **Slice文件** | camelCase + 'Slice'.ts | `userProfilePageSlice.ts` |
| **Store文件** | camelCase + 'Store'.ts | `userProfilePageStore.ts` |

## 3. 实现指南链接

- **Wrapper 实现**: 参见 [TEMPLATE_WRAPPER.md](./TEMPLATE_WRAPPER.md)
- **View 实现**: 参见 [TEMPLATE_VIEW.md](./TEMPLATE_VIEW.md)
- **Store 实现**: 请使用 `store-best-practice` 技能生成 (支持 Slice 模式)
