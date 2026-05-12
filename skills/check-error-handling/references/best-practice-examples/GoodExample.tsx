import { Result, ResultAsync, ok, err } from "neverthrow";
import { TRPCError } from "@trpc/server";

// ========================================
// 错误类型定义
// ========================================

class NetworkError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "NetworkError";
  }
}

class ParseError extends Error {
  constructor(message: string, public readonly raw?: string) {
    super(message);
    this.name = "ParseError";
  }
}

class ValidationError extends Error {
  constructor(message: string, public readonly field?: string) {
    super(message);
    this.name = "ValidationError";
  }
}

class NotFoundError extends Error {
  constructor(public readonly resource: string, public readonly id: string) {
    super(`${resource} with id ${id} not found`);
    this.name = "NotFoundError";
  }
}

// ========================================
// 模式 1: 同步操作返回 Result<T, E>
// ========================================

export function parseJSON<T>(raw: string): Result<T, ParseError> {
  try {
    return ok(JSON.parse(raw) as T);
  } catch {
    return err(new ParseError("Invalid JSON format", raw));
  }
}

// ========================================
// 模式 2: 异步操作返回 ResultAsync<T, E>
// ========================================

export function fetchUserData(
  userId: string
): ResultAsync<User, NetworkError | NotFoundError> {
  return ResultAsync.fromPromise(
    fetch(`/api/users/${userId}`),
    (error) => new NetworkError("Failed to fetch user", error)
  )
    .andThen((response) => {
      if (!response.ok) {
        if (response.status === 404) {
          return err(new NotFoundError("User", userId));
        }
        return err(
          new NetworkError(`HTTP ${response.status}`)
        ) as Result<User, NetworkError | NotFoundError>;
      }
      return ok(response);
    })
    .andThen((response) =>
      ResultAsync.fromPromise(
        response.json() as Promise<User>,
        (error) => new NetworkError("Failed to parse response", error)
      )
    );
}

// ========================================
// 模式 3: 组合多个可能失败的操作
// ========================================

export function validateAndSaveUser(
  raw: string
): ResultAsync<User, ParseError | ValidationError | NetworkError> {
  return parseJSON<UserData>(raw)
    .asyncAndThen((data) =>
      ResultAsync.fromPromise(
        Promise.resolve(validateUserData(data)),
        () => new ValidationError("Validation failed")
      )
    )
    .andThen((validationResult) =>
      validationResult.asyncAndThen((validData) =>
        ResultAsync.fromPromise(
          saveUserToDatabase(validData),
          (error) => new NetworkError("Failed to save user", error)
        )
      )
    );
}

function validateUserData(data: UserData): Result<UserData, ValidationError> {
  if (!data.name || data.name.length < 1) {
    return err(new ValidationError("Name is required", "name"));
  }
  if (!data.email || !data.email.includes("@")) {
    return err(new ValidationError("Valid email is required", "email"));
  }
  return ok(data);
}

async function saveUserToDatabase(data: UserData): Promise<User> {
  return {
    id: `user-${Date.now()}`,
    name: data.name,
    email: data.email,
    createdAt: new Date(),
  };
}

// ========================================
// 模式 4: 调用方必须处理错误
// ========================================

// ✅ 使用 match 进行分支处理
export async function displayUser(userId: string): Promise<void> {
  const result = await fetchUserData(userId);

  result.match(
    (user) => {
      console.log("User:", user.name);
    },
    (error) => {
      if (error instanceof NotFoundError) {
        console.error("User not found");
      } else {
        console.error("Network error:", error.message);
      }
    }
  );
}

// ✅ 使用 map/mapErr 转换结果
export async function getUserName(
  userId: string
): Promise<Result<string, string>> {
  return (await fetchUserData(userId))
    .map((user) => user.name)
    .mapErr((err) => err.message);
}

// ✅ 使用 unwrapOr 提供默认值
export async function getUserOrDefault(userId: string): Promise<User> {
  const result = await fetchUserData(userId);
  return result.unwrapOr({
    id: "default",
    name: "Unknown User",
    email: "unknown@example.com",
    createdAt: new Date(),
  });
}

// ========================================
// 模式 5: 错误恢复（降级）
// ========================================

export function fetchUserWithFallback(
  userId: string
): ResultAsync<User, never> {
  return fetchUserData(userId).orElse((error) => {
    console.warn("Fetch failed, using fallback:", error.message);
    return ok({
      id: userId,
      name: "Unknown User (Fallback)",
      email: "fallback@example.com",
      createdAt: new Date(),
      isFallback: true,
    } as User);
  });
}

// ========================================
// 模式 6: 将 Result 转换为异常（边界处）
// ========================================

export async function fetchUserOrThrow(userId: string): Promise<User> {
  const result = await fetchUserData(userId);

  return result.match(
    (user) => user,
    (error) => {
      throw new TRPCError({
        code: error instanceof NotFoundError ? "NOT_FOUND" : "INTERNAL_SERVER_ERROR",
        message: error.message,
        cause: error,
      });
    }
  );
}

// ========================================
// 模式 7: 忽略非关键错误（带明确意图）
// ========================================

export function cleanupTempData(sessionId: string): void {
  const result = safeRemoveItem(`temp_${sessionId}`);
  // 临时数据清理失败不影响主流程
  // 数据会在 localStorage 满时自动清除
  result.mapErr((error) => {
    console.debug("Failed to cleanup temp data:", error);
  });
}

function safeRemoveItem(key: string): Result<void, Error> {
  try {
    localStorage.removeItem(key);
    return ok(undefined);
  } catch (error) {
    return err(error instanceof Error ? error : new Error(String(error)));
  }
}

// ========================================
// 类型定义
// ========================================

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  isFallback?: boolean;
}

interface UserData {
  name: string;
  email: string;
}

// ========================================
// 原生 try-catch 使用场景（极少）
// ========================================

/**
 * 仅在以下场景允许使用 try-catch：
 * 1. 与不支持 Result 的第三方库交互
 * 2. 将异常转换为 Result 的包装函数内部
 * 3. 框架/运行时要求的入口点（如 API route handler）
 *
 * 这些场景必须立即将异常转换为 Result，不得传播原生异常
 */

// 示例：将可能抛出异常的第三方库包装为 Result
export function safeJSONParse<T>(raw: string): Result<T, ParseError> {
  // 这是允许的：包装函数内部使用 try-catch
  try {
    return ok(JSON.parse(raw) as T);
  } catch {
    return err(new ParseError("Failed to parse JSON", raw));
  }
}

/**
 * 设计亮点：
 *
 * 1. 类型安全：错误类型在编译期确定，调用方必须处理
 * 2. 显式传递：错误不会意外丢失，必须通过 Result 传递
 * 3. 可组合：使用 andThen/orElse/map 等函数式操作组合多个操作
 * 4. 强制处理：调用方无法忽略错误，必须 match/map/mapErr
 * 5. 边界转换：仅在系统边界处（如 API 层）将 Result 转换为异常
 */
