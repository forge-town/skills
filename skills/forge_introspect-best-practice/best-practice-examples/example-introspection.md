# 示例：对 forge_error-handling-best-practice 的反思

## 目标 Best Practice
forge_error-handling-best-practice：强制使用 neverthrow 进行函数式错误处理，禁止原生 try-catch。

## 第一阶段：假设挖掘

### 识别的隐含假设
1. **假设**：所有项目都使用 TypeScript
   - **质疑**：纯 JavaScript 项目使用 neverthrow 类型推导不完整，价值降低
   
2. **假设**：团队熟悉函数式编程
   - **质疑**：对新手而言，Result 类型的认知成本高于 try-catch
   
3. **假设**：错误处理是核心关注点
   - **质疑**：简单脚本/工具函数中，错误处理可能不是优先级

### 适用边界
- ✅ 适合：大型前端应用、需要高可靠性的核心模块
- ❌ 不适合：一次性脚本、原型验证、简单工具函数

## 第二阶段：盲区扫描

### 遗漏场景
1. **第三方库兼容**：很多库返回 Promise 而非 Result，需要额外包装
2. **React Error Boundary**：错误边界只能捕获异常，无法捕获 Result 错误
3. **调试体验**：try-catch 的堆栈信息比 Result 更直观
4. **测试成本**：mock Result 类型比 mock 抛异常更复杂

### 疑似过度设计
- 规则："所有函数必须返回 Result"
  - 质疑：简单的 getter 函数（如 `getUserId()`）真的需要 Result 吗？
  - 建议：改为"所有可能失败的异步操作或外部调用必须返回 Result"

### 自我矛盾
- 规则说"禁止原生 try-catch"
- 但 neverthrow 内部实现仍然使用 try-catch
- 实际上规则应是"禁止在业务代码中直接 try-catch，必须通过 neverthrow 包装"

## 第三阶段：替代方案

1. **分层要求**：
   - 核心模块：强制 Result
   - 业务组件：推荐 Result
   - 工具脚本：可选

2. **简化版本**：允许在简单场景使用 `Result<T>` 而非 `Result<T, E>`，自动推断错误类型

## 反思报告

### 发现的盲区
1. 与 React Error Boundary 的集成未说明
2. 第三方库（返回 Promise 的）的处理模式未提供
3. 调试和测试的特殊技巧缺失

### 改进建议
1. 添加"何时可以豁免"条款
2. 提供与 Error Boundary 配合的模式
3. 添加调试/测试最佳实践章节

### 需要废弃的规则
- "所有函数必须返回 Result" → 改为"所有可能失败的操作必须返回 Result"

### 新增建议规则
- 简单 getter/setter 可豁免
- 必须提供 Result 与 Error Boundary 集成的示例
