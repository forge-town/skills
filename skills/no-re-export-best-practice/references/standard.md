# 禁止非 index 文件中 Re-Export 标准

> **参考文档：**
> - [MDN — export: Re-exporting / Aggregating](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export#re-exporting_aggregating)
> - [Exploring JavaScript §29.8 — Re-exporting](https://exploringjs.com/js/book/ch_modules.html#re-exporting)

---

## 核心原则

Re-export（`export ... from` / `import X; export { X }`）的设计目的是 **barrel module（桶模块）**，即专门聚合其他模块导出的入口文件（通常是 `index.ts`）。

**非 barrel 文件（非 index.ts / 非 index.js）只生产，不中继。**

在非 barrel 文件中做 re-export，引入了不必要的中间层，破坏了"来源透明"原则——消费方应能从 import 语句直接看出值的真实来源。

---

## 两种 Re-Export 写法的区别

在允许 re-export 的 barrel 文件中，两种写法有一个关键技术区别：

```js
// 直接写法 — 不在当前模块创建本地绑定，BattleListSchema 不可在当前文件使用
export { BattleListSchema } from "@code-arena/schemas";

// 两步写法 — 在当前模块创建本地绑定，BattleListSchema 可在当前文件使用
import { BattleListSchema } from "@code-arena/schemas";
export { BattleListSchema };
```

**结论：** barrel 文件中优先用直接写法（更简洁，无副作用）；非 barrel 文件中两种都不应出现。

---

## 合规示例

### ✅ 消费方直接 import

```ts
// battleListService.ts — 直接从来源取，无中间层
import { BattleListSchema, CreateBattleListInput } from "@code-arena/schemas";

export const createBattleListService = (db: DbConnection) => ({
  create: (input: CreateBattleListInput) => { /* ... */ },
  parse:  (raw: unknown) => BattleListSchema.parse(raw),
});
```

### ✅ 删除纯转发的中间文件

```ts
// 删除前（错误）：多个 service 通过 ./schemas 取 BattleList
// battleListService.ts: import { BattleList } from "./schemas";
// freeBattleService.ts: import { BattleList } from "./schemas";
// schemas.ts:           export { BattleList } from "@code-arena/schemas"; // 纯转发

// 删除后（正确）：直接从来源 import
// battleListService.ts: import { BattleList } from "@code-arena/schemas";
// freeBattleService.ts: import { BattleList } from "@code-arena/schemas";
// schemas.ts:           （已删除）
```

### ✅ 原创 schema 文件

```ts
// mySchema.ts — 每个 schema 均为本文件原创定义
import { z } from "zod";

export const PaginationSchema = z.object({ page: z.number(), size: z.number() });
export type Pagination = z.infer<typeof PaginationSchema>;
```

### ✅ 工厂函数实例化

```ts
// services/index.ts — 导入工厂函数并调用，导出的是新创建的实例，不是对原始引用的转发
import { db } from "@/db";
import { createBattleListService } from "@code-arena/services";

export const BattleListService = createBattleListService(db);
//                ↑ 新值（工厂调用结果）                   ↑ 导入的是工厂函数，不是 BattleListService
```

判断标准：**导出的标识符是否与导入的标识符相同？** 相同 → re-export（违规）；不同且为本文件产生的新值 → 合规。
