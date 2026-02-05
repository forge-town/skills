# 页面最佳实践检查清单

使用 page-best-practice 技能后，请确保生成的代码完全符合以下所有要求：

1. [ ] 必须严格遵循 ANATOMY.md 中提供的目录结构和命名规范
2. [ ] 必须严格遵循 best-practice-examples 中提供的代码结构和模式
3. [ ] 生成的代码必须通过 TypeScript 编译
4. [ ] 如果使用 Store，必须使用 Zustand selectors 避免不必要的重渲染
5. [ ] 如果需要 Store，必须使用 store-best-practice 技能生成相应的 Store 模块
6. [ ] 根据 UI 复杂度正确生成相应的功能（simple/standard/complex）
7. [ ] Wrapper 必须正确处理 Store provider，如果不需要 Store 则不引入
8. [ ] 入口文件只导出包装器组件，不导出 Content 组件
9. [ ] 避免过度设计，只生成实际需要的功能
10. [ ] 必须主动询问用户选择生成模式（无监督/有监督）
11. [ ] 提供路由注册指导