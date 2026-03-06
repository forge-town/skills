# 表单组件结构（Anatomy）

```json
{
  "name": "Form",
  "type": "component",
  "description": "react-hook-form useForm() 返回值展开，包裹整个表单，提供上下文（可选配合 FormProvider）",
  "children": [
    {
      "name": "form",
      "type": "element",
      "description": "原生 HTML <form> 元素，绑定 handleSubmit 与 onSubmit",
      "children": [
        {
          "name": "FormField",
          "type": "component",
          "description": "每个字段独立一个 FormField，通过 control 与 name 连接 react-hook-form",
          "repeatable": true,
          "children": [
            {
              "name": "FormItem",
              "type": "component",
              "description": "字段容器，负责布局与错误状态上下文",
              "children": [
                {
                  "name": "FormLabel",
                  "type": "component",
                  "optional": true,
                  "description": "字段标签，可选"
                },
                {
                  "name": "FormControl",
                  "type": "component",
                  "description": "包裹实际输入组件，传递 field 属性（value、onChange、onBlur、ref）",
                  "children": [
                    {
                      "name": "Input | Select | Textarea | ...",
                      "type": "component",
                      "description": "实际 UI 输入组件，展开 {...field} 接入 react-hook-form，禁止手动处理 onChange/value"
                    }
                  ]
                },
                {
                  "name": "FormMessage",
                  "type": "component",
                  "description": "自动渲染 Zod 校验错误信息，无错误时不显示"
                }
              ]
            }
          ]
        },
        {
          "name": "Button[type=submit]",
          "type": "element",
          "description": "提交按钮，触发 handleSubmit → onSubmit 流程"
        }
      ]
    }
  ]
}
```
