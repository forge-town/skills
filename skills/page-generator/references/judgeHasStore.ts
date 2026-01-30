/**
 * 判断是否需要生成 Store 的逻辑函数
 * 基于架构准则：Store 仅用于管理 UI 相关状态，不存业务数据
 */

export interface HasStoreCriteria {
  pageType: "static" | "data-fetching" | "form" | "interactive" | "complex";
  hasPropsDrilling: boolean; // 状态需要传递超过1层组件
  hasComplexLogic: boolean; // 包含复杂的业务动作或多步骤向导
  needsPerformanceOptimization: boolean; // 需要 selectors 避免重渲染
  needsStatePersistence: boolean; // 状态需要在组件卸载后保持
  hasBusinessData: boolean; // 是否涉及业务实体数据（不应存Store）
}

/**
 * 智能判断是否需要生成 Zustand Store
 * @param criteria 判断标准
 * @returns 是否需要 Store
 */
export function judgeHasStore(criteria: HasStoreCriteria): boolean {
  const {
    pageType,
    hasPropsDrilling,
    hasComplexLogic,
    needsPerformanceOptimization,
    needsStatePersistence,
    hasBusinessData,
  } = criteria;

  // 如果涉及业务数据，优先使用查询层，不用Store
  if (hasBusinessData) {
    return false;
  }

  // ❌ 不需要 Store 的情况
  if (pageType === "static" || pageType === "data-fetching") {
    return false;
  }

  if (pageType === "form" && !hasComplexLogic) {
    return false;
  }

  // ✅ 需要 Store 的情况
  if (
    hasPropsDrilling ||
    hasComplexLogic ||
    needsPerformanceOptimization ||
    needsStatePersistence
  ) {
    return true;
  }

  // 默认返回 false，优先使用 Local State
  return false;
}

/**
 * 基于页面描述的简单判断（AI辅助）
 * @param description 页面描述
 * @returns 是否需要 Store
 */
export function judgeHasStoreFromDescription(description: string): boolean {
  const lowerDesc = description.toLowerCase();

  // 关键词判断
  const storeKeywords = [
    "状态共享",
    "多组件",
    "复杂交互",
    "步骤向导",
    "批量操作",
    "tabs",
    "modal",
    "sidebar",
    "filter",
    "selected",
    "loading",
  ];

  const noStoreKeywords = ["静态", "展示", "列表", "详情", "表单提交"];

  const hasStoreSignal = storeKeywords.some(
    (keyword) => lowerDesc.indexOf(keyword) !== -1,
  );
  const hasNoStoreSignal = noStoreKeywords.some(
    (keyword) => lowerDesc.indexOf(keyword) !== -1,
  );

  if (hasStoreSignal && !hasNoStoreSignal) {
    return true;
  }

  return false;
}

/**
 * 有监督模式下的 Store 判断
 * @param description 页面描述
 * @returns 判断结果和推荐理由
 */
export function judgeHasStoreSupervised(description: string): {
  recommended: boolean;
  reason: string;
  confidence: "high" | "medium" | "low";
} {
  const hasStore = judgeHasStoreFromDescription(description);

  if (hasStore) {
    return {
      recommended: true,
      reason: "页面描述包含状态管理相关关键词，建议使用 Store",
      confidence: "medium",
    };
  } else {
    return {
      recommended: false,
      reason: "页面描述显示为简单展示或基础表单，建议使用本地状态",
      confidence: "medium",
    };
  }
}
