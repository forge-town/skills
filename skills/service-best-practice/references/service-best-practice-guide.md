# Service 编写最佳实践指南

## 概述

在 code-arena 项目中，Service 层负责业务逻辑处理、数据转换和外部 API 集成。本指南定义了编写 Service 的规范和最佳实践，确保代码的可维护性、可测试性和一致性。

## 项目数据流（必须了解）

前端 React 组件
↓ (tRPC 客户端自动序列化/反序列化)
`trpc.battles.getOne.useQuery({ id: 1 })`
↓ (HTTP POST /api/trpc/battles.getOne)
`src/routes/api/trpc.ts` → 创建 tRPC 上下文（含 session/user）
↓
`src/integrations/trpc/router.ts`（根路由器）
↓
`src/integrations/trpc/routers/battles.ts#getOne`（子路由处理器）
↓
`src/services/battleService.ts#findById(1)`（业务逻辑层 — Service）
↓
`src/db/models/daos/battlesDao.ts#findById(1)`（数据访问层 — DAO）
↓
`src/db/index.ts` 中的 drizzle(db) 实例
↓
PostgreSQL（通过 pg Pool 执行 SQL）

注意：项目当前没有独立的 Controller 层；tRPC 的 router/handlers 充当传入请求的接点，但 Service 层仍然仅负责业务逻辑，不应处理 HTTP 细节。

## 核心规范

### 1. 文件结构

- Service文件位于 `apps/web/src/services/` 下
- 文件名使用驼峰命名：`{feature}Service.ts`
- 导出为对象形式：`export const {Feature}Service = { ... }`

### 2. 依赖注入（强制建议）

重要规则：Service 绝对不得直接导入或使用 `db`（例如 `import { db } from "@/db"`）。所有对数据库的操作必须通过 DAO（`apps/web/src/db/models/daos/*`）。

```typescript
// 推荐：通过参数注入 DAO，便于测试和替换实现
export const createAuthService = (deps: {
  usersDao: typeof import("@/db/models/daos/users").usersDao;
}) => ({
  // methods 使用 deps.usersDao
});

// 不要这样（禁止直接使用 db）
// import { db } from "@/db"; // <- 禁止
```

### 3. 方法命名和签名

- 使用驼峰命名法
- 业务方法：`createUser`, `getUserProfile`, `validateToken`
- 工具方法：`formatUserData`, `calculateScore`
- 返回类型：明确指定Promise类型
- 参数验证：使用Zod或其他验证库

### 4. 标准 Service 结构（示例：依赖注入 + DAO）

```typescript
// apps/web/src/services/userService.ts
import { z } from "zod";

export const createUserService = (deps: { usersDao: any }) => {
  const { usersDao } = deps;

  const createUserSchema = z.object({
    email: z.string().email(),
    username: z.string(),
  });

  return {
    async createUser(input: unknown): Promise<any> {
      const data = createUserSchema.parse(input);

      const existing = await usersDao.findByEmail(data.email);
      if (existing) throw new Error("ConflictError: Email already in use");

      const created = await usersDao.create({
        email: data.email,
        username: data.username,
      });
      return created;
    },

    async getUserById(id: string): Promise<any | null> {
      return usersDao.findById(id);
    },
  };
};
```

## 最佳实践

### 1. 分层架构

- **Controller/Service/DAO**：Controller处理HTTP，Service处理业务逻辑，DAO处理数据访问
- **单一职责**：每个Service只负责一个业务领域
- **依赖方向**：Service依赖DAO，不反向依赖

### 2. 错误处理

```typescript
export const UserService = {
  async createUser(data: CreateUserInput): Promise<User> {
    try {
      // 验证
      if (!data.email) {
        throw new ValidationError("Email is required");
      }

      // 检查重复
      const existing = await usersDao.findByEmail(data.email);
      if (existing) {
        throw new ConflictError("User already exists");
      }

      // 创建用户
      const user = await usersDao.create(data);
      return this.formatUserData(user);
    } catch (error) {
      // 记录错误
      console.error("Create user error:", error);
      throw error; // 重新抛出或包装错误
    }
  },
};
```

### 3. 数据转换

- **输入转换**：将外部数据转换为内部格式
- **输出转换**：将内部数据转换为API响应格式
- **类型安全**：使用TypeScript接口定义数据结构

### 4. 事务管理（约定）

当 Service 需要事务时，Service 可以发起 `db.transaction()`，但 DAO 必须支持接收可选的 `tx`（事务对象）参数，以便在事务上下文中执行查询。

示例约定：

```ts
// Service 发起事务
await db.transaction(async (tx) => {
  await ordersDao.create(orderPayload, tx);
  await inventoryDao.updateStock(items, tx);
});

// DAO 签名示例
async create(data: typeof users.$inferInsert, tx?: typeof db) { /* 使用 tx 或全局 db */ }
```

### 5. 外部API集成

```typescript
export const GitHubService = {
  async fetchRepository(owner: string, repo: string, token?: string) {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
          Accept: "application/vnd.github.v3+json",
        },
      },
    );

    if (!response.ok) {
      throw new ExternalAPIError(`GitHub API error: ${response.status}`);
    }

    return response.json();
  },
};
```

### 6. 缓存策略

```typescript
export const CacheService = {
  async getWithCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = 300000, // 5分钟
  ): Promise<T> {
    // 检查缓存
    const cached = await this.getFromCache(key);
    if (cached) return cached;

    // 获取数据
    const data = await fetcher();

    // 设置缓存
    await this.setCache(key, data, ttl);

    return data;
  },
};
```

### 7. 测试友好性

- **依赖注入**：便于mock依赖
- **纯函数**：避免副作用，便于测试
- **接口定义**：明确输入输出，便于stub

### 8. 性能优化

- **批量操作**：使用批量API减少请求
- **分页处理**：正确实现分页逻辑
- **并发控制**：使用Promise.all处理并行请求

### 9. 日志记录

```typescript
import { logger } from "@/lib/logger";

export const UserService = {
  async createUser(data: CreateUserInput) {
    logger.info("Creating user", { email: data.email });

    try {
      const user = await usersDao.create(data);
      logger.info("User created successfully", { userId: user.id });
      return user;
    } catch (error) {
      logger.error("Failed to create user", { error, email: data.email });
      throw error;
    }
  },
};
```

### 10. 配置管理

- **环境变量**：使用Zod验证环境配置
- **常量定义**：将魔法数字和字符串提取为常量

## 类型定义

```typescript
// 输入类型
export interface CreateUserInput {
  email: string;
  username: string;
  password: string;
}

// 输出类型
export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: Date;
}

// 错误类型
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConflictError";
  }
}
```

遵循这些规范可确保Service代码的高质量、可维护性和一致性。参考相关最佳实践：[Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html), [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)。
