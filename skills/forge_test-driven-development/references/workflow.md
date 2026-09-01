# TDD 工作流详解

## 何时使用

**始终：**
- 新功能
- Bug 修复
- 重构
- 行为变更

**例外（需人工确认）：**
- 一次性原型
- 生成代码
- 配置文件

想着"就这一次跳过 TDD"？停下来。那是合理化。

## Red-Green-Refactor

### RED — 编写失败测试

编写一个最小测试，展示期望行为。

**Good：**

```typescript
test('失败操作重试 3 次', async () => {
  let attempts = 0
  const operation = () => {
    attempts++
    if (attempts < 3) throw new Error('fail')
    return 'success'
  }

  const result = await retryOperation(operation)

  expect(result).toBe('success')
  expect(attempts).toBe(3)
})
```

清晰命名，测试真实行为，只测一件事。

**Bad：**

```typescript
test('重试能用', async () => {
  const mock = vi.fn()
    .mockRejectedValueOnce(new Error())
    .mockRejectedValueOnce(new Error())
    .mockResolvedValueOnce('success')
  await retryOperation(mock)
  expect(mock).toHaveBeenCalledTimes(3)
})
```

模糊命名，测的是 mock 不是代码。

**要求：**
- 只测一个行为
- 清晰命名
- 用真实代码（除非不可避免才用 mock）

### 验证 RED — 看它失败

**强制步骤。不得跳过。**

```bash
bun test path/to/test.test.ts
```

确认：
- 测试失败（不是报错）
- 失败信息符合预期
- 因为功能缺失而失败（不是拼写错误）

**测试通过了？** 你在测试已有行为。修改测试。

**测试报错了？** 修复错误，重新运行直到它正确失败。

### GREEN — 最小实现

编写最简单的代码使测试通过。

**Good：**

```typescript
async function retryOperation<T>(fn: () => T | Promise<T>): Promise<T> {
  for (let i = 0; i < 3; i++) {
    try {
      return await fn()
    } catch (e) {
      if (i === 2) throw e
    }
  }
  throw new Error('unreachable')
}
```

刚好够通过。

**Bad：**

```typescript
async function retryOperation<T>(
  fn: () => T | Promise<T>,
  options?: {
    maxRetries?: number
    backoff?: 'linear' | 'exponential'
    onRetry?: (attempt: number) => void
  }
): Promise<T> {
  // YAGNI
}
```

过度设计。

不要增加功能、重构其他代码或做超出测试范围的"改进"。

### 验证 GREEN — 看它通过

**强制步骤。**

```bash
bun test path/to/test.test.ts
```

确认：
- 测试通过
- 其他测试仍然通过
- 输出干净（无错误、无警告）

**测试失败了？** 修代码，不改测试。

**其他测试失败了？** 立即修复。

### REFACTOR — 清理

仅在全绿之后：
- 消除重复
- 改善命名
- 提取辅助函数

保持测试全绿。不要增加行为。

### 循环

为下一个功能编写下一个失败测试。

## 好测试的标准

| 质量 | 好 | 坏 |
|------|----|----|
| **最小** | 只测一件事。名称里有"和"？拆分 | `test('验证 email 和 domain 和空格')` |
| **清晰** | 名称描述行为 | `test('test1')` |
| **展示意图** | 展示期望的 API | 掩盖代码应该做什么 |

## 为什么顺序重要

**"我先实现，然后写测试来验证"**

实现后写的测试立即通过。立即通过什么都证明不了：
- 可能测的是错误的东西
- 可能测的是实现细节而不是行为
- 可能遗漏了你忘记的边界情况
- 你从未看到它捕获 bug

测试先行强制你看到测试失败，证明它确实在测某样东西。

**"我已经手动测过所有边界情况了"**

手动测试是临时的。你以为你测了所有情况但：
- 没有测试记录
- 代码变更后无法重新运行
- 压力下容易遗忘
- "我试的时候能用" ≠ 全面覆盖

**"删掉 X 小时的工作太浪费了"**

沉没成本谬误。时间已经过去了。你现在的选择：
- 删除并用 TDD 重写（X 小时，高信心）
- 保留并补测试（30 分钟，低信心，大概率有 bug）

"浪费"是保留你无法信任的代码。没有真正测试的能用代码是技术债。

**"TDD 太教条了，务实意味着灵活"**

TDD 本身就是务实的：
- 在提交前发现 bug（比事后调试快）
- 防止回归（测试立即捕获破坏）
- 记录行为（测试展示如何使用代码）
- 启用重构（自由修改，测试捕获破坏）

"务实"的捷径 = 在生产环境调试 = 更慢。

## 常见合理化

| 借口 | 现实 |
|------|------|
| "太简单不用测" | 简单代码也会坏。测试只需 30 秒 |
| "先实现后补测试" | 立即通过的测试什么都证明不了 |
| "补测试也能达到同样目的" | 补测试 = "这做了什么？" 先写测试 = "这应该做什么？" |
| "已经手动测过了" | 临时 ≠ 系统化。无记录，无法重新运行 |
| "删掉 X 小时太浪费" | 沉没成本谬误。保留未验证代码是技术债 |
| "当参考保留，但先写测试" | 你会改造它。那就是后补测试。删除就是删除 |
| "需要先探索" | 可以。扔掉探索代码，用 TDD 重新开始 |
| "测试难写 = 设计不清" | 听测试的。难测 = 难用 |
| "TDD 会拖慢我" | TDD 比调试快。务实 = 测试先行 |
| "现有代码没测试" | 你正在改进它。为现有代码添加测试 |

## 红旗 — 立即停下，从头开始

- 先写了代码再写测试
- 实现之后补测试
- 测试立即通过
- 无法解释为什么测试失败
- 测试是"后来"加的
- 在合理化"就这一次"
- "我已经手动测过了"
- "补测试也能达到同样目的"
- "精神重于仪式"
- "当参考保留"或"改造现有代码"
- "已经花了 X 小时，删掉太浪费"
- "TDD 太教条，我在务实"
- "这次情况不同因为..."

**以上所有都意味着：删除代码。用 TDD 从头开始。**

## 示例：Bug 修复

**Bug：** 空邮箱被接受了

**RED**
```typescript
test('拒绝空邮箱', async () => {
  const result = await submitForm({ email: '' })
  expect(result.error).toBe('Email required')
})
```

**验证 RED**
```bash
$ bun test
FAIL: expected 'Email required', got undefined
```

**GREEN**
```typescript
function submitForm(data: FormData) {
  if (!data.email?.trim()) {
    return { error: 'Email required' }
  }
  // ...
}
```

**验证 GREEN**
```bash
$ bun test
PASS
```

**REFACTOR**
如有需要，为多个字段提取验证逻辑。

## 卡住时怎么办

| 问题 | 解决方案 |
|------|----------|
| 不知道怎么测 | 写出你希望的 API。先写断言。问你的人类搭档 |
| 测试太复杂 | 设计太复杂。简化接口 |
| 必须 mock 一切 | 代码耦合太紧。使用依赖注入 |
| 测试 setup 太大 | 提取辅助函数。还是复杂？简化设计 |

## 调试集成

发现 bug？写一个重现它的失败测试。按 TDD 循环走。测试既证明修复有效，又防止回归。

永远不要在没有测试的情况下修复 bug。
