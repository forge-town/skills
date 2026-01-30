import { z } from "zod";

/**
 * 生成新页面的 Schema。
 * 定义了 Page Generator Skill 所需的严格输入。
 */
export const PageGeneratorSchema = z.object({
  mode: z
    .enum(["unsupervised", "supervised"])
    .default("unsupervised")
    .describe(
      "生成模式：\n- unsupervised: 全自动判断所有参数\n- supervised: 在关键决策点询问用户确认",
    ),

  pageName: z
    .string()
    .min(1)
    .regex(/^[A-Z][a-zA-Z0-9]*$/, "必须是大驼峰写法 (PascalCase)")
    .describe("页面组件的名称 (例如：'SettingsPage')"),

  destinationPath: z
    .string()
    .default("apps/web/src/pages")
    .describe("父目录的相对路径 (默认：'apps/web/src/pages')"),

  features: z
    .object({
      hasStore: z
        .boolean()
        .optional()
        .describe(
          "是否需要生成本地状态管理模块 (_store)。\n\n模式差异：\n- 无监督模式：此字段会被自动判断，无需提供\n- 有监督模式：AI会提供推荐值，询问用户确认\n\n判断依据 (参考 Zustand 最佳实践):\n- ✅ 需要 Store: 存在跨组件状态共享(Prop Drilling > 1层)、复杂的状态交互逻辑(Flux模式)、或需要精细化性能优化的场景。\n- ❌ 不需要 Store: 纯展示页、仅依赖简单 Server State (React Query)、或仅包含独立表单状态(React Hook Form)的页面。",
        ),

      uiComplexity: z
        .enum(["simple", "standard", "complex"])
        .default("standard")
        .describe(
          "UI 复杂度等级：\n- simple: 基础布局，适合展示型页面\n- standard: 搜索/过滤 + 列表展示，适合数据管理页面\n- complex: 多标签页 + 高级交互，适合功能丰富的页面",
        ),

      // 未来扩展性
      hasTabs: z
        .boolean()
        .default(false)
        .describe("如果为 true，则为标签页导航构建内容结构"),
    })
    .default({}),

  description: z
    .string()
    .optional()
    .describe("页面的上下文描述（用于生成初始注释或内容）"),
});

export type PageGeneratorInput = z.infer<typeof PageGeneratorSchema>;
