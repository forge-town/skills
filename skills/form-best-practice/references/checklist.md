# 表单最佳实践检查清单

使用 form-best-practice 技能后，请确保生成的表单组件完全符合以下所有要求：

## 状态管理

1. [ ] 表单状态由 `react-hook-form` 独立管理，未使用 `useState` 或 `useReducer` 管理任何表单字段
2. [ ] 表单字段未直接绑定到 zustand 全局状态（读取或写入）
3. [ ] 表单是独立沙盒，仅在提交时通过副本对外输出数据

## 组件结构

4. [ ] 外层使用 `<Form {...form}>` 包裹
5. [ ] 每个字段使用 `FormField` → `FormItem` → `FormControl` → 输入组件 → `FormMessage` 结构
6. [ ] 字段通过 `render={({ field }) => <Input {...field} />}` 接入，未手动处理 `value` 和 `onChange`

## 数据初始化与提交

7. [ ] `defaultValues` 使用原始数据的深拷贝副本（`{ ...originalData }` 或 `structuredClone`）
8. [ ] 提交时将表单值副本传给 `onSubmit` 回调，不直接传引用

## 校验

9. [ ] 表单对应 Zod Schema，通过 `zodResolver`（来自 `@hookform/resolvers/zod`）集成到 `useForm`
10. [ ] Zod 从 `"zod/v4"` 导入

## 复杂场景

11. [ ] 跨子组件共享表单上下文时使用 `FormProvider` + `useFormContext()`
12. [ ] 未通过 props 逐层传递 `control` 或 `register`

## 组件接口

13. [ ] 组件为命名导出的函数组件
14. [ ] 接收 `initialData`（可选）和 `onSubmit`（必填）props
15. [ ] 明确声明返回类型和 props 类型（TypeScript）
