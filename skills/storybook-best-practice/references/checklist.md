# Storybook Stories 最佳实践检查清单

使用 storybook-best-practice 技能后，请确保生成的代码完全符合以下所有要求：

## 文件结构

1. [ ] stories 文件必须与组件文件同目录，命名为 `XxxCard.stories.tsx`
2. [ ] 仅为主组件创建 stories，不得为子组件单独创建 stories 文件

## 代码格式

3. [ ] 必须使用 CSF3 格式，从 `@storybook/react` 导入 `Meta` 和 `StoryObj`
4. [ ] `meta` 对象的 `title` 必须使用 `"Components/XxxName"` 格式
5. [ ] `meta` 对象的 `component` 必须指向组件本身
6. [ ] 所有回调类 props（`onXxx`）必须在 `meta.args` 中使用 `fn()` 注册，从 `@storybook/test` 导入

## 必需 Cases

7. [ ] 必须包含 `Base` case：每个 props 都传入典型值，充分覆盖组件主要功能
8. [ ] 必须包含 `Default` case：`args` 严格为空对象 `{}`，不得传入任何 props
9. [ ] 必须包含 `BaseUsage` case：使用 `render` 函数，结合真实业务场景展示组件在上下文中的样子

## 代表性 Cases

10. [ ] 额外 Cases 数量：根据组件特性设计 1～3 个，不得强行凑数
11. [ ] Case 命名必须使用 PascalCase 英文名且语义清晰（如 `Loading`、`OutOfStock`、`LongContent`）
12. [ ] 组件有加载态时，必须包含 `Loading` case（使用骨架屏或 loading 标志）
13. [ ] 组件有禁用/不可用态时，必须包含对应 case（如 `Disabled`、`OutOfStock`）
14. [ ] 组件展示内容可能溢出时，必须包含 `LongContent` case 验证截断处理

## 内容质量

15. [ ] `Base` 和各 Case 中的 args 数据应使用贴近真实业务的中文内容，禁止使用 `"test"`、`"string"` 等占位符
16. [ ] `BaseUsage` 的 `render` 函数中应包含多个不同状态/内容的组件实例，展示真实使用多样性
17. [ ] 不得出现仅改变一个无意义数值的重复 case（如两个 case 只差一个字符串）
