import { AccuracyIcon } from "@/components/icons";

/**
 * UserVoteCard 示例 - 展示如何在业务组件中使用 AccuracyIcon
 * 使用桶导出方式导入图标组件
 */
export const UserVoteCard = () => {
  return (
    <div className="flex justify-end">
      <div className="flex gap-6">
        {/* 准确率统计 - 使用 AccuracyIcon */}
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12">
            <AccuracyIcon className="w-12 h-12 transform -rotate-90" color="#10b981" />
            <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-gray-900">
              79%
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">Accuracy</div>
            <div className="text-xs text-green-600">On Track</div>
          </div>
        </div>
      </div>
    </div>
  );
};
