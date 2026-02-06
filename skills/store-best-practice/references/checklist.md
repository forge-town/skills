# Store 最佳实践检查清单

使用 store-best-practice 技能后，请确保生成的代码完全符合以下所有要求：

1. [ ] 必须严格遵循 best-practice-examples 中提供的代码结构
2. [ ] 创建的 store 不允许包含 loading 或 error 等异步状态管理
3. [ ] 桶导出文件必须使用 export * 语法
4. [ ] 必须按需生成状态和方法，不允许创建未使用的状态或方法
5. [ ] 生成的方法必须适合组件直接调用，例如使用 handleXxx 命名，而非 setXxx 之类的 setter
6. [ ] 不允许将从 useList 或 useQuery 直接得到的 data 数据转存到 store 中

7. [ ] Slice纯函数：`createXxxSlice` 仅负责状态修改，内部禁止包含异步请求、DOM操作、第三方库调用等副作用
8. [ ] 组件导入限制：仅允许通过桶导出入口使用`import *`导入，禁止直连slice/store源文件