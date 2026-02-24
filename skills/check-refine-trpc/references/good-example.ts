// 允许（示例）：使用 refine hooks 或通过 DataProvider 封装后在组件中使用

import { useList } from '@refinedev/core';

export const MyComponent = () => {
	const { data } = useList({ resource: 'foo' });
	return <div>{data?.data?.length}</div>;
}

