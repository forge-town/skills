# 表单最佳实践指南

## 一、技术栈选型

| 职责 | 技术 |
|------|------|
| 表单状态管理 | react-hook-form |
| 组件 UI 结构 | shadcn/ui Form 系列组件 |
| 输入校验 | Zod + zodResolver |
| 全局状态 | zustand（与表单完全隔离） |

⚠️ 表单状态 **不应混入** zustand 的全局状态树，必须由 react-hook-form 独立管理。

---

## 二、表单的"两棵树"状态隔离模型

项目中存在两个独立的状态树：

- **表单状态树（Form State Tree）**：由 react-hook-form 管理，包含字段值、脏值、错误、提交状态等
- **全局状态树（Global State Tree）**：由 zustand 管理，存储跨组件共享的业务状态

**隔离原则**：
- 表单字段值只在 react-hook-form 内部流转
- 禁止将表单字段直接绑定到 zustand store（双向绑定）
- 仅在提交时，将表单数据**副本**传给业务逻辑层

详细示例：[examples/GoodFormExample.tsx](examples/GoodFormExample.tsx)

---

## 三、单向数据流（Unidirectional Flow）

1. **初始化**：若需预填表单，通过 `defaultValues` 传入数据**深拷贝副本**（避免引用传递）
2. **编辑过程**：所有用户输入仅在 react-hook-form 内部流转，不影响原始数据
3. **提交时刻**：调用 `onSubmit` 获取最终值，将表单值的副本传递给业务逻辑层

示例：[examples/SubmitHandlerExample.tsx](examples/SubmitHandlerExample.tsx)

---

## 四、标准组件结构（Anatomy）

正确的 shadcn/ui 表单结构层级：[anatomy.json](anatomy.json)

每个字段必须通过 `render={({ field }) => ...}` 模式接入，**禁止手动处理 `value` 和 `onChange`**。

详细示例：[examples/GoodFormExample.tsx](examples/GoodFormExample.tsx)

---

## 五、为何禁止手动 useState 管理表单字段

反模式示例：[examples/BadFormExample.tsx](examples/BadFormExample.tsx)

**问题分析**：
- 状态分散，难以统一管理验证、提交、重置
- 无法利用 react-hook-form 的性能优化（`useWatch`、`useFormState`）
- 复杂场景（动态字段、嵌套、数组）难以扩展

---

## 六、复杂表单与 FormProvider

当表单需要跨子组件共享 react-hook-form 上下文时，使用 FormProvider：
- 子组件通过 `useFormContext()` 访问，**禁止通过 props 逐层传递 `control` 或 `register`**

示例：[examples/FormProviderExample.tsx](examples/FormProviderExample.tsx)

---

## 七、Zod Schema 集成

表单必须对应一个 Zod Schema，通过 `zodResolver` 集成：

示例：[examples/FormSchema.ts](examples/FormSchema.ts)

