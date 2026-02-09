// src/components/icons/AccuracyIcon.tsx
// 进度环形图标示例

interface AccuracyIconProps {
  className?: string;
  color?: string;
}

export const AccuracyIcon = ({ className = '', color = 'currentColor' }: AccuracyIconProps) => {
  return (
    <svg className={className} viewBox="0 0 36 36">
      <path
        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        fill="none"
        stroke="#e5e7eb"
        strokeWidth="2"
      />
      <path
        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeDasharray="79, 100"
      />
    </svg>
  );
};

export type { AccuracyIconProps };
