# tRPC 按需查询接口实现指南

通过 `include`（按需加载关联字段）和 `fields`（响应裁剪）双参数，为 tRPC 查询接口赋予 GraphQL 式的选择性查询能力，无需引入 GraphQL。

---

## 一、核心参数定义

为支持按需查询的接口添加以下两个可选输入参数：

| 参数 | 类型 | 是否必填 | 说明 |
|------|------|----------|------|
| `include` | `string[]` | 可选 | 指定需要额外加载的关联字段（非基础返回字段），值为预定义枚举 |
| `fields` | `string[]` | 可选 | 指定响应中保留的字段列表，省略时返回全部（基础 + 已 include 的字段） |

---

## 二、行为规则

| 场景 | 行为 |
|------|------|
| 未传 `include`，未传 `fields` | 返回基础数据，等同于原有接口行为 |
| 仅传 `include` | 返回基础数据 + 指定的扩展字段 |
| 仅传 `fields` | 返回 fields 裁剪后的基础数据 |
| 同时传 `include` 和 `fields` | 先加载扩展数据，再按 fields 裁剪最终响应 |
| `fields` 包含未通过 `include` 加载的扩展字段 | 静默忽略该字段，服务端记录 warning 日志 |

---

## 三、三步执行流程

三步执行顺序：[ThreeStepFlow.txt](ThreeStepFlow.txt)

详细实现：[RouterExample.ts](RouterExample.ts)

---

## 四、Schema 与类型规范

### Input Schema 写法

- `include` 使用 `z.array(z.enum([...]))` 枚举所有已支持的扩展字段名，值必须与处理器中的条件分支一一对应
- `fields` 使用 `z.array(z.string()).optional()`
- `fields` 仅支持**顶层字段名**（如 `["id", "name"]`），不支持嵌套路径（如 `["user.name"]`）
- 响应的 TypeScript 类型使用**完整模型**（运行时裁剪，静态类型保持完整，避免过度工程化）

示例：[BattleSchema.ts](SchemaExample/BattleSchema.ts)、[BattleExtendedSchema.ts](SchemaExample/BattleExtendedSchema.ts)、[GetBattleInputSchema.ts](SchemaExample/GetBattleInputSchema.ts)

### 前端类型使用规则

- 禁止在组件中重新定义后端数据结构
- 直接从 Schema 文件导入类型（遵循项目 `forge_schema-best-practice` 技能的 PascalCase 命名规范）

---

## 五、权限与安全

- 扩展字段**必须在加载前**进行权限校验（不加载即不暴露）
- 权限校验失败时抛出明确错误（如 `throw new Error("Unauthorized")`），不返回 null 或空值
- 仅支持一级扩展，禁止嵌套 include（如 `user.friends.votes` 不被允许）

---

## 六、适用场景与限制

- **适用**：高频访问、客户端字段需求差异大的查询接口（如详情页 vs 列表页）
- **不适用**：简单接口（全量返回已满足需求，保持原样即可）
