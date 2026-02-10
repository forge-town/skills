# 图标组件标准模板

## 目录
- [基础模板](#基础模板)
- [类型定义说明](#类型定义说明)
- [关键检查点](#关键检查点)

## 概览
提供标准的 React TypeScript 图标组件模板，确保所有图标组件的一致性和可维护性。

## 基础模板

**接口定义：**
```tsx
interface IconProps extends React.SVGProps<SVGSVGElement> {
  width?: number | string;
  height?: number | string;
  fill?: string;
}
```

**组件结构：**
```tsx
import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  width?: number | string;
  height?: number | string;
  fill?: string;
}

const IconName: React.FC<IconProps> = ({ 
  width = 24, 
  height = 24, 
  fill = 'currentColor',
  className,
  ...rest 
}) => (
  <svg
    width={width}
    height={height}
    fill={fill}
    className={className}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    {...rest}
  >
    {/* SVG path 内容 */}
  </svg>
);

export default IconName;
```

## 类型定义说明

### IconProps 接口
```typescript
interface IconProps extends React.SVGProps<SVGSVGElement>
```

- **继承 React.SVGProps<SVGSVGElement>**：支持所有 SVG 原生属性
- **width**：可选，默认 24，支持 number 或 string 类型
- **height**：可选，默认 24，支持 number 或 string 类型
- **fill**：可选，默认 'currentColor'，支持颜色值
- **className**：可选，支持 CSS 类名
- **...rest**：透传所有其他原生属性（如 onClick、id 等）

## 关键检查点

创建图标组件时，确保完成以下检查：

- [ ] 接口定义正确（继承 React.SVGProps<SVGSVGElement>）
- [ ] 设置合理的默认值（width=24, height=24, fill='currentColor'）
- [ ] 使用 `...rest` 透传其他属性
- [ ] 保留 SVG 的 viewBox 属性
- [ ] 移除 xmlns 属性（React 自动处理）
- [ ] 导出组件和类型
- [ ] 组件名与文件名一致（PascalCase）

**实际示例：**
- 完整组件代码：[best-practice-examples/components/icons/AccuracyIcon.tsx](best-practice-examples/components/icons/AccuracyIcon.tsx)
- 桶导出方式：[best-practice-examples/components/icons/index.ts](best-practice-examples/components/icons/index.ts)
- 业务组件使用：[best-practice-examples/assets/UserVoteCard.tsx](best-practice-examples/assets/UserVoteCard.tsx)
- 最佳实践文档：[references/best-practice-examples.md](best-practice-examples.md)
