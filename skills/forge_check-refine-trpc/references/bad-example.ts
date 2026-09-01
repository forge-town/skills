// 禁止（示例）：在组件中直接使用 trpc hook

import { trpc } from '../utils/trpc';

export const MyComponent = () => {
	const { data } = trpc.foo.getList.useQuery();
	return <div>{data?.length}</div>;
}

