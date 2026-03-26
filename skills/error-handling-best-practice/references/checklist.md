# 错误处理规范检查清单

执行规则：**逐项勾选，若有任何一项为 ❌，必须修正后重新检查。**

---

## 检查清单

- [ ] ✅ **1. 禁止空 catch 块**：catch 块中必须有实质性代码（不得为空、不得只有注释）
  - ❌ 错误示例（JS/TS）：`catch (e) {}` 或 `catch (e) { // TODO }`
  - ❌ 错误示例（Python）：`except: pass` 或 `except Exception: pass`
  - ✅ 正确示例：`catch (e) { logger.error(e); throw e; }`

- [ ] ✅ **2. 禁止 catch 仅记录日志**：catch 块不得只有 `console.log`/`console.error`/`logger.xxx` 调用，必须有错误处理或重新抛出
  - ❌ 错误示例：`catch (e) { console.error(e); }` → 错误被吞没，调用方无法感知
  - ✅ 正确示例：`catch (e) { console.error(e); throw e; }` 或触发用户通知/回滚逻辑

- [ ] ✅ **3. 必须处理或重新抛出**：每个 catch 块至少满足以下之一：
  - 重新抛出：`throw e` 或 `throw new CustomError(...)`
  - 有意义的错误恢复逻辑（如重试、回滚、降级）
  - 向用户报告错误（如 `toast.error`、UI 错误状态更新）
  - ❌ 错误示例：仅赋值局部变量 `error = e` 后不用 → 等同于忽略错误

- [ ] ✅ **4. 捕获具体异常类型（Python）**：Python 代码禁止使用裸 `except:`，必须指定异常类型
  - ❌ 错误示例：`except:` → 捕获所有异常（包括 KeyboardInterrupt）
  - ✅ 正确示例：`except ValueError as e:` 或 `except (TypeError, KeyError) as e:`

- [ ] ✅ **5. try 块范围最小化**：try 块应只包含可能抛出异常的核心语句，不应将整个函数体都包在 try 中
  - ❌ 错误示例：try 块内含有多个独立操作，无法判断是哪里抛出的异常
  - ✅ 正确示例：精确包裹 IO 操作或外部调用，其余逻辑放到 try 外

- [ ] ✅ **6. finally 块用于清理资源**：需要资源清理（关闭文件、释放锁等）时，必须使用 `finally` 或 `defer`
  - ❌ 错误示例：在 catch 和正常路径分别写清理代码（容易遗漏）
  - ✅ 正确示例：`finally { db.close(); }` 保证无论是否报错都执行清理

---

## Bad Case 确认

- [ ] ❌ 不存在空 catch 块的情况
- [ ] ❌ 不存在仅含 console.log 的 catch 块且无重新抛出的情况
- [ ] ❌ 不存在 Python 裸 `except:` 语句的情况
- [ ] ❌ 不存在 try 块包裹整个函数体而不是精确包裹异常点的情况
