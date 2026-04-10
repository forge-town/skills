// ✅ Barrel Export 最佳实践示例
// 此文件只包含 re-export，无业务逻辑

// 1. 批量导出模块所有内容
export * from './Button';
export * from './Input';
export * from './Card';

// 2. 选择性命名导出
export { Header, Footer } from './Layout';

// 3. 类型导出使用 export type
export type { ButtonProps } from './Button';
export type { InputProps, InputSize } from './Input';

// 4. 重命名导出（避免命名冲突）
export { UserAvatar as Avatar } from './UserAvatar';
