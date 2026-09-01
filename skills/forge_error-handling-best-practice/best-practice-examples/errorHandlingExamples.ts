import { Result, ResultAsync, ok, err } from "neverthrow";

// ========================================
// 错误类型定义
// ========================================

class NetworkError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = "NetworkError";
  }
}

class ParseError extends Error {
  constructor(
    message: string,
    public readonly raw?: string
  ) {
    super(message);
    this.name = "ParseError";
  }
}

class ValidationError extends Error {
  constructor(
    message: string,
    public readonly field?: string
  ) {
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
// 模式 1: 同步操作返回 Result
// ========================================

export function parseJSON(raw: string): Result<unknown, ParseError> {
  try {
    return ok(JSON.parse(raw));
  } catch (error) {
    return err(new ParseError("Invalid JSON format", raw));
  }
}

// ========================================
// 模式 2: 异步操作返回 ResultAsync
// ========================================

export function fetchUser(
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

export function validateAndCreateUser(
  raw: string
): ResultAsync<User, ParseError | ValidationError | NetworkError> {
  return parseJSON(raw)
    .asyncAndThen((data) =>
      ResultAsync.fromPromise(
        Promise.resolve(validateUserData(data)),
        () => new ValidationError("Validation failed")
      )
    )
    .andThen((validationResult) =>
      validationResult.asyncAndThen((validData) =>
        ResultAsync.fromPromise(
          saveUser(validData),
          (error) => new NetworkError("Failed to save user", error)
        )
      )
    );
}

function validateUserData(data: unknown): Result<UserData, ValidationError> {
  if (!data || typeof data !== "object") {
    return err(new ValidationError("Data must be an object"));
  }

  const { name, email } = data as Record<string, unknown>;

  if (!name || typeof name !== "string" || name.length < 1) {
    return err(new ValidationError("Name is required", "name"));
  }

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return err(new ValidationError("Valid email is required", "email"));
  }

  return ok({ name, email });
}

async function saveUser(data: UserData): Promise<User> {
  return {
    id: "user-123",
    name: data.name,
    email: data.email,
    createdAt: new Date(),
  };
}

// ========================================
// 模式 4: 调用方必须处理错误
// ========================================

// ❌ 错误：忽略错误
// const result = fetchUser("123"); // 未检查 isOk/isErr

// ✅ 正确：使用 match 处理两种结果
export async function displayUser(userId: string): Promise<void> {
  const result = await fetchUser(userId);

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

// ✅ 正确：使用 map/mapErr 转换
export async function getUserName(
  userId: string
): Promise<Result<string, string>> {
  return (await fetchUser(userId))
    .map((user) => user.name)
    .mapErr((err) => err.message);
}

// ✅ 正确：使用 unwrapOr 提供默认值
export async function getUserOrDefault(
  userId: string
): Promise<User> {
  const result = await fetchUser(userId);
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
  return fetchUser(userId).orElse((error) => {
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
