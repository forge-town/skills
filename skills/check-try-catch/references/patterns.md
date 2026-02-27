# Try-Catch 代码模式参考

## 目录
- [空 Catch 块](#空-catch-块)
- [纯 Console 日志 Catch](#纯-console-日志-catch)
- [最佳实践](#最佳实践)
- [修复策略](#修复策略)

## 空 Catch 块

### JavaScript/TypeScript

❌ 错误示例：
```javascript
try {
  doSomething();
} catch (e) {}
```

```typescript
try {
  await fetchData();
} catch (error) {
  // 空的 catch 块
}
```

✅ 正确做法：
```javascript
try {
  doSomething();
} catch (e) {
  console.error('Operation failed:', e);
  throw e; // 重新抛出或进行适当的错误处理
}
```

```typescript
try {
  await fetchData();
} catch (error) {
  console.error('Failed to fetch data:', error);
  // 添加错误处理逻辑
  notifyUser('Data fetch failed');
}
```

### Python

❌ 错误示例：
```python
try:
    do_something()
except:
    pass
```

```python
try:
    do_something()
except Exception as e:
    # 空的 except 块
```

✅ 正确做法：
```python
import logging

try:
    do_something()
except Exception as e:
    logging.error(f"Operation failed: {e}", exc_info=True)
    raise  # 重新抛出或处理错误
```

```python
import logging

try:
    do_something()
except ValueError as e:
    logging.warning(f"Invalid value: {e}")
    # 处理特定的错误
    handle_invalid_value()
```

## 纯 Console 日志 Catch

### JavaScript/TypeScript

❌ 错误示例：
```javascript
try {
  doSomething();
} catch (e) {
  console.log(e);
}
```

```typescript
try {
  await fetchData();
} catch (error) {
  console.error('Error:', error);
}
```

✅ 正确做法：
```javascript
try {
  doSomething();
} catch (e) {
  logger.error('Operation failed', { error: e });
  // 使用日志框架而不是 console
  // 添加适当的错误处理
  notifyMonitoring(e);
}
```

```typescript
try {
  await fetchData();
} catch (error) {
  // 使用结构化日志
  logError('Data fetch failed', { error, context: { url } });
  // 执行恢复逻辑或向上报告
  handleFetchError(error);
}
```

### Python

❌ 错误示例：
```python
try:
    do_something()
except Exception as e:
    print(e)
```

```python
try:
    do_something()
except:
    print("Error occurred")
```

✅ 正确做法：
```python
import logging

logger = logging.getLogger(__name__)

try:
    do_something()
except Exception as e:
    logger.error(f"Operation failed: {e}", exc_info=True)
    # 使用 logging 模块
    # 执行适当的错误处理
    handle_error(e)
```

```python
import logging

logger = logging.getLogger(__name__)

try:
    do_something()
except ValueError as e:
    logger.warning("Invalid value provided", extra={"value": str(e)})
    # 根据错误类型执行特定处理
    handle_invalid_input(e)
```

## 最佳实践

### 1. 明确错误处理意图

```javascript
try {
  saveData();
} catch (e) {
  // 这个错误是预期的，静默处理
  // 数据保存失败不影响主流程
  logger.debug('Data save failed, continuing...');
}
```

### 2. 重新抛出未处理的错误

```javascript
try {
  criticalOperation();
} catch (e) {
  logger.error('Critical operation failed', { error: e });
  throw e; // 让调用者处理
}
```

### 3. 提供有意义的错误信息

```javascript
try {
  processUserInput(input);
} catch (e) {
  throw new Error(
    `Failed to process user input "${input}": ${e.message}`
  );
}
```

### 4. 使用特定的错误类型

```python
import logging

logger = logging.getLogger(__name__)

try:
    parse_config(config_file)
except FileNotFoundError as e:
    logger.error(f"Config file not found: {e}")
    create_default_config()
except json.JSONDecodeError as e:
    logger.error(f"Invalid JSON in config file: {e}")
    notify_admin()
```

### 5. 避免捕获所有错误

```javascript
// 避免：捕获所有错误
try {
  doSomething();
} catch (e) {
  console.log(e);
}

// 推荐：只捕获特定错误
try {
  doSomething();
} catch (NetworkError e) {
  logger.warn('Network error, retrying...');
  retry();
}
```

## 修复策略

### 策略 1：添加日志框架

```javascript
// 之前
try {
  doSomething();
} catch (e) {
  console.error(e);
}

// 之后
try {
  doSomething();
} catch (e) {
  logger.error('Operation failed', {
    error: e,
    context: { operation: 'doSomething' }
  });
}
```

### 策略 2：执行恢复逻辑

```python
# 之前
try:
    connect_to_database()
except:
    pass

# 之后
try:
    connect_to_database()
except ConnectionError:
    logger.warning("Connection failed, retrying...")
    retry_connection()
```

### 策略 3：重新抛出错误

```typescript
// 之前
try {
  await fetchUserData();
} catch (error) {
  console.error('Fetch failed', error);
}

// 之后
try {
  await fetchUserData();
} catch (error) {
  logger.error('Fetch failed', error);
  throw error; // 让调用者处理
}
```

### 策略 4：静默处理并注释

```javascript
try {
  optionalFeature();
} catch (e) {
  // 这个功能是可选的，失败不影响主流程
  // 不需要处理错误
}
```

### 策略 5：转换错误类型

```python
# 之前
try:
    process_user_id(user_id)
except Exception as e:
    print(e)

# 之后
try:
    process_user_id(user_id)
except (ValueError, TypeError) as e:
    raise InvalidUserIdError(f"Invalid user ID '{user_id}': {e}")
```

## 审查检查清单

### JavaScript/TypeScript
- [ ] catch 块不为空
- [ ] catch 块中不仅有 console.* 语句
- [ ] 优先使用 logger 而非 console
- [ ] 错误处理逻辑符合业务需求

### Python
- [ ] except 块不为空或仅包含 pass
- [ ] except 块中不仅有 print 语句
- [ ] 使用 logging 模块
- [ ] 捕获特定异常类型而非 Exception
- [ ] 错误处理逻辑符合业务需求
