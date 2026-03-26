# Refine + tRPC 正确数据访问模式

## 架构图

```
Component Layer
    ↓ useList / useOne / useCreate / useUpdate / useDelete
Refine DataProvider
    ↓  (内部实现)
tRPC Client  →  tRPC Server
```

## 允许的模式（正确示例）

### 读取列表
```tsx
import { useList } from '@refinedev/core';

export const UserList = () => {
    const { data } = useList({ resource: 'users' });
    return <div>{data?.data?.map(u => u.name).join(', ')}</div>;
};
```

### 读取单条记录
```tsx
import { useOne } from '@refinedev/core';

export const UserDetail = ({ id }: { id: string }) => {
    const { data } = useOne({ resource: 'users', id });
    return <div>{data?.data?.name}</div>;
};
```

### 创建记录
```tsx
import { useCreate } from '@refinedev/core';

export const CreateUser = () => {
    const { mutate } = useCreate();
    return <button onClick={() => mutate({ resource: 'users', values: { name: 'Alice' } })}>Create</button>;
};
```

## 禁止的模式（错误示例）

### ❌ 直接使用 tRPC hook
```tsx
// WRONG: 绕过 Refine DataProvider
import { trpc } from '@/lib/trpc';

export const UserList = () => {
    const { data } = trpc.users.list.useQuery();  // 禁止
    return <div>{data?.map(u => u.name).join(', ')}</div>;
};
```

### ❌ 直接使用 @tanstack/react-query
```tsx
// WRONG: 直接调用 trpc 进行数据获取
import { useQuery } from '@tanstack/react-query';
import { trpc } from '@/lib/trpc';

export const UserList = () => {
    const { data } = useQuery({ queryFn: () => trpc.users.list.query() });  // 禁止
    return <div>{data?.map(u => u.name).join(', ')}</div>;
};
```

## 参考文件

原始示例文件（位于 `check-refine-trpc` 技能中）：
- 违规示例：[check-refine-trpc/references/bad-example.ts](../check-refine-trpc/references/bad-example.ts)
- 合规示例：[check-refine-trpc/references/good-example.ts](../check-refine-trpc/references/good-example.ts)
