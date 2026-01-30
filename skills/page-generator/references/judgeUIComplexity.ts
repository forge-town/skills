/**
 * UI 复杂度判断逻辑
 * 基于页面描述和需求智能判断合适的UI复杂度等级
 */

/**
 * UI复杂度等级定义
 */
export type UIComplexity = "simple" | "standard" | "complex";

/**
 * 基于页面描述判断UI复杂度
 * @param description 页面描述
 * @returns UI复杂度等级
 */
export function judgeUIComplexity(description: string): UIComplexity {
  const lowerDesc = description.toLowerCase();

  // 复杂模式关键词
  const complexKeywords = [
    "多标签",
    "tabs",
    "高级过滤",
    "批量操作",
    "复杂交互",
    "dashboard",
    "管理面板",
    "设置页面",
    "配置页面",
    "数据可视化",
    "图表",
    "统计面板",
  ];

  // 简单模式关键词
  const simpleKeywords = [
    "详情页面",
    "展示页面",
    "静态内容",
    "about",
    "帮助页面",
    "关于我们",
    "联系我们",
  ];

  // 检查复杂模式
  if (complexKeywords.some((keyword) => lowerDesc.includes(keyword))) {
    return "complex";
  }

  // 检查简单模式
  if (simpleKeywords.some((keyword) => lowerDesc.includes(keyword))) {
    return "simple";
  }

  // 默认标准模式（包含搜索、列表、表单等常见功能）
  return "standard";
}

/**
 * 基于功能需求判断UI复杂度
 * @param features 功能需求列表
 * @returns UI复杂度等级
 */
export function judgeUIComplexityFromFeatures(
  features: string[],
): UIComplexity {
  const lowerFeatures = features.map((f) => f.toLowerCase());

  // 复杂功能指标
  const complexFeatures = [
    "多标签页",
    "高级搜索",
    "批量操作",
    "数据导出",
    "复杂表单",
    "实时更新",
    "权限控制",
    "设置管理",
  ];

  // 简单功能指标
  const simpleFeatures = ["静态展示", "基本信息", "简单导航"];

  const hasComplexFeature = complexFeatures.some((feature) =>
    lowerFeatures.some((f) => f.includes(feature)),
  );

  const hasSimpleFeature = simpleFeatures.some((feature) =>
    lowerFeatures.some((f) => f.includes(feature)),
  );

  if (hasComplexFeature) {
    return "complex";
  }

  if (hasSimpleFeature) {
    return "simple";
  }

  return "standard";
}

/**
 * 获取UI复杂度说明
 * @param complexity UI复杂度等级
 * @returns 复杂度说明
 */
export function getUIComplexityDescription(complexity: UIComplexity): string {
  switch (complexity) {
    case "simple":
      return "基础布局 + 基础组件，适合展示型页面";
    case "standard":
      return "搜索/过滤 + 列表展示，适合数据管理页面";
    case "complex":
      return "多标签页 + 高级交互，适合功能丰富的页面";
    default:
      return "未知复杂度";
  }
}

/**
 * 有监督模式下的 UI 复杂度判断
 * @param description 页面描述
 * @returns 判断结果和推荐理由
 */
export function judgeUIComplexitySupervised(description: string): {
  recommended: UIComplexity;
  reason: string;
  confidence: "high" | "medium" | "low";
} {
  const complexity = judgeUIComplexity(description);

  return {
    recommended: complexity,
    reason: `基于页面描述分析，推荐使用 ${getUIComplexityDescription(complexity)}`,
    confidence: "medium",
  };
}
