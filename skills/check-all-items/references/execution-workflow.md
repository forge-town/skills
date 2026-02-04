# 执行工作流程

此文档详细说明check-all-items技能如何逐条执行最佳实践检查的完整流程。

## 工作流程概述

执行工作流程分为三个主要阶段：准备、执行和收尾，每个阶段都有明确的步骤和错误处理机制。

## 阶段1: 准备阶段

### 1.1 环境检查
- 验证项目根目录存在
- 检查package.json和依赖项
- 确认验证脚本可用
- 初始化日志和报告系统

### 1.2 技能加载
- 从自动发现机制获取技能列表
- 验证每个技能的状态
- 按优先级排序执行顺序
- 准备技能执行上下文

### 1.3 配置验证
- 读取执行配置参数
- 验证超时和重试设置
- 检查资源限制
- 准备监控指标

## 阶段2: 执行阶段

### 2.1 顺序执行模式
默认按预定义顺序逐个执行：

```javascript
const executionOrder = [
  'dao-best-practice',
  'service-best-practice',
  'store-best-practice',
  'page-best-practice',
  // 其他best-practice技能
];
```

### 2.2 并行执行模式
对于独立性强的检查，支持并行执行：

```javascript
// 最大并行数配置
const maxParallel = 3;

// 分组执行
const executionGroups = [
  ['dao-best-practice', 'service-best-practice'], // 组1
  ['store-best-practice', 'page-best-practice'],   // 组2
];
```

### 2.3 单技能执行流程

#### 2.3.1 技能调用
- 构造技能调用参数
- 设置执行超时
- 初始化技能上下文
- 调用目标技能

#### 2.3.2 结果收集
- 捕获技能输出
- 解析检查结果
- 记录执行时间
- 收集错误信息

#### 2.3.3 状态判断
- 分析检查结果
- 确定通过/失败状态
- 计算质量评分
- 生成问题摘要

### 2.4 After Hook触发
每个技能检查完成后立即触发验证：

```bash
# 执行标准化验证指令
npm run quality

# 捕获结果
if [ $? -eq 0 ]; then
  echo "✅ 验证通过"
else
  echo "❌ 验证失败"
  # 记录失败详情
fi
```

## 阶段3: 收尾阶段

### 3.1 结果汇总
- 收集所有检查结果
- 计算总体统计
- 生成综合报告
- 识别关键问题

### 3.2 报告生成
- 格式化检查报告
- 添加修复建议
- 生成执行摘要
- 导出报告文件

### 3.3 清理工作
- 清理临时文件
- 重置执行状态
- 释放系统资源
- 记录执行历史

## 错误处理

### 执行失败处理
- **超时处理**：终止执行，记录超时错误
- **技能崩溃**：捕获异常，继续执行其他技能
- **验证失败**：记录详细错误，生成修复建议

### 重试机制
```javascript
const retryConfig = {
  maxAttempts: 3,
  backoffMultiplier: 2,
  initialDelay: 1000, // ms
};

async function executeWithRetry(skillName, config) {
  let attempt = 0;
  let delay = config.initialDelay;

  while (attempt < config.maxAttempts) {
    try {
      return await executeSkill(skillName);
    } catch (error) {
      attempt++;
      if (attempt >= config.maxAttempts) {
        throw error;
      }
      await sleep(delay);
      delay *= config.backoffMultiplier;
    }
  }
}
```

### 降级处理
- 单个技能失败不阻断整体流程
- 提供降级执行选项
- 记录降级原因和影响

## 性能优化

### 资源管理
- 控制并发执行数量
- 监控内存和CPU使用
- 实现资源池管理
- 支持分布式执行

### 缓存策略
- 缓存技能发现结果
- 缓存验证指令结果
- 实现增量检查
- 支持条件执行

## 监控和日志

### 执行监控
- 实时进度跟踪
- 性能指标收集
- 错误率统计
- 资源使用监控

### 日志记录
```javascript
const logger = {
  info: (message) => console.log(`ℹ️  ${message}`),
  success: (message) => console.log(`✅ ${message}`),
  warning: (message) => console.log(`⚠️  ${message}`),
  error: (message) => console.log(`❌ ${message}`),
};
```

### 调试支持
- 详细执行日志
- 步骤级调试信息
- 性能分析报告
- 可视化执行流程

## 配置选项

### 执行配置
```yaml
execution:
  mode: sequential  # sequential, parallel, grouped
  max_parallel: 3
  timeout_seconds: 300
  retry_attempts: 2
  fail_fast: false
```

### 验证配置
```yaml
validation:
  command: "npm run quality"
  run_after_each: true
  run_after_all: true
  timeout_seconds: 120
```

## 扩展性设计

### 自定义执行器
支持添加自定义执行逻辑：

```javascript
class CustomExecutor {
  async execute(skillName) {
    // 自定义执行逻辑
  }

  async validate(result) {
    // 自定义验证逻辑
  }
}
```

### 插件系统
- 支持执行插件扩展
- 允许自定义检查规则
- 提供钩子机制

## 最佳实践

### 执行策略
- 根据技能依赖关系选择执行模式
- 设置合理的超时和重试参数
- 监控执行性能和稳定性

### 错误处理
- 实现完善的错误处理机制
- 提供清晰的错误信息和修复建议
- 支持优雅降级和恢复

### 维护建议
- 定期审查和更新执行配置
- 监控执行趋势和性能指标
- 及时处理执行失败和错误