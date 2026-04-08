/**
 * ✅ Try-Catch 最佳实践示例
 *
 * 所有示例均符合 error-handling-best-practice 规范
 */

import { logger } from "@/lib/logger";
import { toast } from "@/components/ui/toast";

// ========================================
// 模式 1: 重新抛出错误（让调用者处理）
// ========================================

export async function fetchUserData(userId: string) {
  try {
    const response = await fetch(`/api/users/${userId}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    logger.error("Failed to fetch user data", { error, userId });
    throw error; // 重新抛出，让调用者决定如何处理
  }
}

// ========================================
// 模式 2: 错误恢复（降级处理）
// ========================================

export async function fetchUserWithFallback(userId: string) {
  try {
    const response = await fetch(`/api/users/${userId}`);
    if (!response.ok) throw new Error("Failed to fetch");
    return await response.json();
  } catch (error) {
    logger.warn("User fetch failed, returning fallback data", { error, userId });
    // 返回降级数据，保证功能可用
    return { id: userId, name: "未知用户", isFallback: true };
  }
}

// ========================================
// 模式 3: 用户通知 + 重新抛出
// ========================================

export async function submitOrder(orderData: OrderData) {
  try {
    const result = await fetch("/api/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    });
    if (!result.ok) throw new Error("Order failed");
    return result.json();
  } catch (error) {
    logger.error("Order submission failed", { error, orderData });
    toast.error("订单提交失败，请稍后重试");
    throw error;
  }
}

// ========================================
// 模式 4: 重试逻辑
// ========================================

export async function connectWithRetry(
  maxRetries = 3
): Promise<Connection> {
  let lastError: Error | undefined;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const conn = await createConnection();
      logger.info("Connection established after retries", { attempt: i + 1 });
      return conn;
    } catch (error) {
      lastError = error as Error;
      logger.warn(`Connection attempt ${i + 1} failed`, { error });

      if (i < maxRetries - 1) {
        await delay(1000 * Math.pow(2, i)); // 指数退避
      }
    }
  }

  throw new Error(
    `Failed to connect after ${maxRetries} attempts: ${lastError?.message}`
  );
}

// ========================================
// 模式 5: 资源清理（finally）
// ========================================

export async function processFile(filePath: string): Promise<ProcessedData> {
  const fileHandle = await openFile(filePath);

  try {
    const content = await fileHandle.read();
    return parseContent(content);
  } catch (error) {
    logger.error("File processing failed", { error, filePath });
    throw new ProcessingError(`Failed to process ${filePath}`, { cause: error });
  } finally {
    // 无论成功失败，都关闭文件句柄
    await fileHandle.close();
  }
}

// ========================================
// 模式 6: 精确 try 块范围
// ========================================

export async function updateUserProfile(
  userId: string,
  updates: ProfileUpdates
) {
  // 验证逻辑在 try 外，不属于异常处理范围
  if (!updates.name?.trim()) {
    throw new ValidationError("Name is required");
  }

  const normalizedData = {
    ...updates,
    name: updates.name.trim(),
  };

  // try 只包裹可能抛出异常的网络请求
  let response: Response;
  try {
    response = await fetch(`/api/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify(normalizedData),
    });
  } catch (networkError) {
    logger.error("Network error during profile update", { networkError, userId });
    toast.error("网络连接失败，请检查网络");
    throw networkError;
  }

  // 响应处理在 try 外
  if (!response.ok) {
    throw new ApiError(`Update failed: ${response.status}`);
  }

  return response.json();
}

// ========================================
// 模式 7: 静默处理（带明确注释）
// ========================================

export function cleanupTempData(sessionId: string) {
  try {
    localStorage.removeItem(`temp_${sessionId}`);
  } catch (error) {
    // 临时数据清理失败不影响主流程
    // 数据会在 localStorage 满时自动清除
    logger.debug("Failed to cleanup temp data", { error, sessionId });
  }
}

// ========================================
// 类型定义
// ========================================

interface OrderData {
  items: Array<{ id: string; quantity: number }>;
  total: number;
}

interface Connection {
  id: string;
  state: "connected" | "disconnected";
}

interface ProcessedData {
  records: unknown[];
  summary: string;
}

interface ProfileUpdates {
  name?: string;
  email?: string;
  avatar?: string;
}

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiError";
  }
}

class ProcessingError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "ProcessingError";
  }
}

// 模拟工具函数
async function createConnection(): Promise<Connection> {
  return { id: "conn-1", state: "connected" };
}

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function openFile(path: string) {
  return {
    read: async () => "file content",
    close: async () => {},
  };
}

function parseContent(content: string): ProcessedData {
  return { records: [], summary: content };
}
