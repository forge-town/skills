# 表单最佳实践检查清单

执行规则：**逐项勾选，若有任何一项为 ❌，必须修正后重新检查，不得跳过输出。**

---

## 一、状态管理检查

- [ ] ✅ 表单状态由 `react-hook-form` 独立管理，不存在用 `useState` / `useReducer` 管理任何表单字段的情况
  - ❌ 错误示例：`const [name, setName] = useState("")` 用于表单字段 → 必须改为 react-hook-form 中的 `field.value`
- [ ] ✅ 表单字段未直接绑定到 zustand 全局状态（读取或写入）
  - ❌ 错误示例：`<Input value={store.name} onChange={(e) => store.setName(e.target.value)} />` → 必须改为 `<Input {...field} />`，提交时才写入 store
- [ ] ✅ 表单是独立沙盒，仅在提交时通过副本对外输出数据
  - ❌ 错误示例：在 `onChange` 回调里实时 `dispatch(setFormData(values))` → 必须等 `onSubmit` 触发后才输出

---

## 二、组件结构检查

- [ ] ✅ 外层使用 `<Form {...form}>` 包裹（shadcn/ui Form 组件）
  - ❌ 错误示例：直接使用 `<form onSubmit={handleSubmit(...)}>`，不用 shadcn Form → 必须改为 `<Form {...form}>`
- [ ] ✅ 每个字段使用完整结构：`FormField` → `FormItem` → `FormControl` → 输入组件 → `FormMessage`
  - ❌ 错误示例：跳过 `FormItem` 直接 `<FormControl><Input /></FormControl>` → 必须补全完整层级
- [ ] ✅ 字段通过 `render={({ field }) => <Input {...field} />}` 接入，严禁手动处理 `value` 和 `onChange`
  - ❌ 错误示例：`<Input value={form.watch("name")} onChange={(e) => form.setValue("name", e.target.value)} />` → 必须改为 `{...field}` 展开

---

## 三、数据初始化与提交检查

- [ ] ✅ `defaultValues` 使用原始数据的深拷贝副本（`structuredClone(data)` 或 `{ ...data }`），不传引用
  - ❌ 错误示例：`defaultValues: originalCat` 直接传引用对象 → 必须改为 `defaultValues: { ...originalCat }`
- [ ] ✅ 提交时将表单值副本传给 `onSubmit` 回调，不直接传 form 内部引用
  - ❌ 错误示例：`onSubmit(form.getValues())` 传 react-hook-form 内部引用 → 必须用 `handleSubmit((values) => onSubmit({...values}))`

---

## 四、校验集成检查

- [ ] ✅ `useForm` 通过 `zodResolver` 集成 Zod Schema 校验
  - ❌ 错误示例：`useForm({ validate: (values) => { ... } })` 手写校验 → 必须改为 `resolver: zodResolver(FormSchema)`
- [ ] ✅ Zod 从 `"zod/v4"` 导入
  - ❌ 错误示例：`import { z } from "zod"` → 必须改为 `import { z } from "zod/v4"`
- [ ] ✅ `zodResolver` 从 `"@hookform/resolvers/zod"` 导入
  - ❌ 错误示例：找不到 `zodResolver` 导入或自行实现校验逻辑 → 必须使用官方 resolver

---

## 五、复杂场景检查

- [ ] ✅ 跨子组件共享表单上下文时使用 `FormProvider` + `useFormContext()`
  - ❌ 错误示例：通过 props 将 `control` 或 `register` 逐层传递给子组件 → 必须改为 `FormProvider` + `useFormContext()`
- [ ] ✅ 子组件通过 `useFormContext()` 访问 form，不接受 `control` 作为 prop
  - ❌ 错误示例：`function NameField({ control }: { control: Control<FormValues> })` → 必须改为内部调用 `const { control } = useFormContext()`

---

## 六、组件接口检查

- [ ] ✅ 组件为命名导出的函数组件（`export const XxxForm = () => ...`）
  - ❌ 错误示例：`export default function XxxForm()` → 必须改为命名导出
- [ ] ✅ 接受 `initialData`（可选）和 `onSubmit`（必填）两个标准 props
  - ❌ 错误示例：通过其他名称（如 `data`、`defaultData`、`submitFn`）传递 → 必须统一为 `initialData` / `onSubmit`
- [ ] ✅ Props 类型和返回类型明确声明（TypeScript 无 `any`）
  - ❌ 错误示例：`onSubmit: Function` → 必须改为 `onSubmit: (data: FormValues) => void`

---

## 七、Bad Case 确认（以下情况不得出现）

- [ ] ❌ 不存在用 `useState` 管理表单字段的情况
- [ ] ❌ 不存在表单字段双向绑定 zustand store 的情况
- [ ] ❌ 不存在手动 `value` + `onChange` 管理字段的情况（必须用 `{...field}` 展开）
- [ ] ❌ 不存在 `control` / `register` 通过 props 逐层传递的情况
