// ComponentSplitSchema TypeScript 类型定义

export interface ComponentSplitSchema {
  componentPath: string;        // 组件路径（例如 "src/components/Dice8"）
  splitStructure: {
    root: string;              // 拆分根目录（例如 "src/components/dice8"）
    files: Array<{
      path: string;            // 文件相对路径
      type: "component";       // 仅允许 "component" 类型
      description: string;     // 文件描述
      dependencies?: string[]; // 对其他文件的依赖（可选）
    }>;
    folders: [];               // 必须为空数组
  };
  rationale: string;           // 拆分理由和设计思路
}