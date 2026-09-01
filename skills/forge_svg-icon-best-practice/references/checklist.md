# SVG 图标最佳实践检查清单

执行规则：**逐项勾选，若有任何一项为 ❌，必须修正后重新检查，不得跳过输出。**

---

## 一、存储位置检查

- [ ] ✅ 所有 SVG 图标封装为独立的 React 组件文件，统一存放在 `src/components/icons/` 目录下
  - ❌ 错误示例：`src/assets/icons/arrow.svg` 裸 SVG 文件 → 必须封装为 `src/components/icons/ArrowIcon.tsx`
- [ ] ✅ 业务组件（`.tsx` 文件）内不存在内联 `<svg>` 标签
  - ❌ 错误示例：`<svg xmlns="http://www.w3.org/2000/svg"><path .../></svg>` 出现在 `CatCard.tsx` → 必须抽取为独立图标组件

---

## 二、组件命名检查

- [ ] ✅ 图标组件文件名使用 PascalCase，以 `Icon` 结尾（如 `ArrowIcon.tsx`、`HomeIcon.tsx`）
  - ❌ 错误示例：`arrow.tsx`、`arrowIcon.tsx`、`arrow-icon.tsx` → 必须改为 `ArrowIcon.tsx`
- [ ] ✅ 组件名与文件名一致，且语义清晰（描述图标用途而非形状）
  - ❌ 错误示例：`export const Shape1 = ...`、`export const SvgIcon = ...` → 必须改为 `export const ArrowRightIcon = ...`

---

## 三、组件实现检查

- [ ] ✅ 每个图标文件只包含一个 SVG 图标组件（一文件一组件）
  - ❌ 错误示例：`icons.tsx` 文件内定义了 `ArrowIcon`、`HomeIcon`、`CloseIcon` → 必须拆分为独立文件
- [ ] ✅ 组件使用 `SVGProps<SVGSVGElement>` 作为 props 类型，并透传到 `<svg>` 元素
  - ❌ 错误示例：`function ArrowIcon() { return <svg>...</svg> }` 无 props → 必须改为 `({ className, ...props }: SVGProps<SVGSVGElement>)`
- [ ] ✅ SVG 的 `width` / `height` / `fill` / `className` 均可通过 props 覆盖（不硬编码固定值）
  - ❌ 错误示例：`<svg width="24" height="24" fill="#333">` 硬编码 → 必须改为 `<svg width={24} height={24} {...props}>`
- [ ] ✅ 导出为具名导出（`export const XxxIcon = ...`），不使用 default export
  - ❌ 错误示例：`export default function ArrowIcon()` → 必须改为 `export const ArrowIcon = ...`
- [ ] ✅ 移除 SVG 中不必要的属性（如 `xmlns`、`version`、Figma 导出的 `id`）
  - ❌ 错误示例：`<svg xmlns="http://www.w3.org/2000/svg" version="1.1" id="Layer_1">` → 必须清理多余属性

---

## 四、桶导出检查

- [ ] ✅ `src/components/icons/index.ts` 文件存在，统一对外暴露所有图标组件
  - ❌ 错误示例：`index.ts` 不存在，业务组件直接 `import { ArrowIcon } from "@/components/icons/ArrowIcon"` → 必须先确保 index.ts 存在
- [ ] ✅ 新增图标组件后，立即在 `index.ts` 中添加对应的 `export { XxxIcon } from "./XxxIcon"` 语句
  - ❌ 错误示例：创建了 `ArrowRightIcon.tsx` 但未在 `index.ts` 中导出 → 必须同步更新 `index.ts`

---

## 五、使用方式检查

- [ ] ✅ 业务组件通过 `import { XxxIcon } from "@/components/icons"` 导入（走桶导出，不直连源文件）
  - ❌ 错误示例：`import { ArrowIcon } from "@/components/icons/ArrowIcon"` 直连 → 必须改为从 `@/components/icons` 导入
- [ ] ✅ 调用方式为 JSX 组件语法（`<ArrowIcon className="..." />`），传入 className 控制样式
  - ❌ 错误示例：`ArrowIcon()` 函数调用方式 → 必须改为 JSX `<ArrowIcon />`

---

## 六、迁移完整性检查（重构现有代码时）

- [ ] ✅ 业务组件中所有内联 `<svg>` 已全部替换为对应图标组件
  - ❌ 错误示例：有 2 处 `<svg>` 但只替换了 1 处 → 必须全部替换完成
- [ ] ✅ TypeScript 编译无错误，无因 SVG 变动引入的类型错误
- [ ] ✅ 已删除业务组件中多余的原 SVG 相关属性（`xmlns`、`data-testid` 等 Figma 遗留属性）

---

## 七、Bad Case 确认（以下情况不得出现）

- [ ] ❌ 不存在业务组件内仍有内联 `<svg>` 标签的情况
- [ ] ❌ 不存在图标组件使用 default export 的情况
- [ ] ❌ 不存在一个文件定义多个图标组件的情况
- [ ] ❌ 不存在图标组件未在 `icons/index.ts` 中导出的情况
