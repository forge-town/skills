# Skill 内容一致性检查报告

> 后续范围变更（2026-11-15）：用户要求删除代码实现类技能，现已删除 tRPC、Better Auth、Zod 环境变量三个技能及相关逻辑测试。下文 8 个技能、15 项测试为删除前的历史核对结果；当前保留 5 个技能，最新静态与测试回执见 removal-static-check.txt 和 removal-tests.txt。

检查日期：2026-11-15（Asia/Singapore）。检查范围：当前仓库 8 个根目录技能及其 78 个资源文件、README、AGENTS.md、检查器与测试入口。

## 结果

- 静态检查：8 / 8 通过，错误 0。
- 人工内容核对：8 个技能均完成用途、正文、引用、例子与交付要求的阅读核对；已修正下表所列不一致。
- 运行验证：15 项测试通过；全部 JSON 可解析、Shell 参考脚本通过 sh -n、TypeScript 资源通过语法转译检查。
- 集成验证：真实 tRPC 服务、浏览器构建、数据库迁移与 OAuth 登录仍为 evidence-required。未用示例逻辑测试替代实际集成。
- Git：未提交、未推送。

先前的 6 项测试主要检查旧元数据规则；它们通过不能证明内容一致。本轮检查器已分离 static-pass 与人工待验证，并补充资源引用、README 描述与旧目录条目检查。实际执行的检查器、测试及认证脚本已移到各自 scripts/，参考目录保留说明和例子。

## 逐技能核对

| 技能 | 发现 | 已处理 | 仍需目标环境验证 |
| --- | --- | --- | --- |
| forge--brainstorm | 明确授权的工作仍被要求重复审批、自动提交设计；正文与后续授权表述不一致 | 复用既有确认，按复杂度记录设计；Git 提交按用户授权，不强制依赖已删除技能 | 特定项目设计是否满足实际需求 |
| forge--check-all-skills | 入口引用不存在的 Bash 脚本；仅检查结构却输出全部符合规范；依赖示例用块列表但解析器只接受内联列表；README 描述与资源引用未校验 | 删除失效入口；使用 YAML 解析；补充链接、空目录、描述与过期目录检查；明确人工待验证；记录 yaml/tsx 运行依赖 | 人工语义与真实集成不由静态命令自动证明 |
| forge--create-skill | 把 show 当作检查器；500 行与 20 行规则冲突；引用不存在的 checklist-guide.md；禁止参考目录代码却自带代码参考 | 创建前读取最佳实践，创建后运行 check；统一短入口与真实资源规则；删除假路径，明确参考代码与可执行工具的区别 | 生成的新技能仍需验证其业务产物 |
| forge--show-skill-best-practice | 名称为 show，正文却强制检查、自动修复；声称固定 16 项但实际规则远超；存在已删除代码规范的 Daedalus 依赖；报告模板引用不存在的修复脚本 | 改为展示、解释与示例；新增 canonical standard.md；移除项目专属代码规范依赖；缩短真实报告模板并分离 show/check/create 的职责 | 无外部服务依赖；这不代表每条建议适合所有项目 |
| forge--review-best-practice | 标题还写 Introspect；清单要求固定数量的缺陷，可能诱导编造；例子把已删除技能写作当前目标，并包含错误的 Result 类型简化建议 | 统一 Review；按真实发现报告，允许未发现问题；例子标明假设场景并纠正类型说明 | 实际规则的适用性需项目材料支持 |
| forge--implement-trpc-query | 声称裁剪后仍是完整必填类型；文档承诺 warning 但代码未实现；fields 空数组语义不明确；Router 重复输入 Schema 并直接组装旧工厂/DAO | 输出 Schema 改为 partial；抽出真实字段选择 helper；明确未传/空数组/未加载字段行为；复用输入 Schema；标注 t/context/Service 为目标项目适配点，去除对旧规范结构的依赖 | 真正的 tRPC caller、鉴权、Service 与数据库查询未联调 |
| forge--integrate-zod-env | 字符串环境变量直接映射 number/boolean；客户端 getter 直接读 process.env；模板强制无关 OAuth/支付变量；单/多环境完成清单不一致 | 使用 coerce.number 与 stringbool；客户端显式传公开来源且只返回公开字段；去除无关字段；单环境明确 server-only；用实际例子验证转换与失败路径 | 未执行 Vite/Next/其他框架的真实浏览器构建 |
| forge--integrate-better-auth | 客户端导入 server-env；服务端导入表名与实际示例导出不符；“5 个文件”与资源不符；UUID 一概禁止；SQL 直接操作其他项目业务表；连通性脚本会阻塞于 dev 进程且不检查 HTTP 失败 | 浏览器示例仅同源客户端；明确表符号和映射；按框架版本适配；ID 规则与目标版本配置对应；SQL 改成无操作迁移说明；开发服务与 health 检查分离；校验 OAuth ID/secret 成对配置 | 未安装完整目标应用、未迁移数据库、未执行真实注册登录及 OAuth；示例仍含项目别名依赖，不能声称可独立运行 |

## 实际命令与结果

- pnpm install：安装并锁定检查和测试所需 yaml、tsx、typescript、zod，生成 pnpm-lock.yaml；node_modules 已加入忽略列表。
- pnpm run check:skills：8 个 static-pass，0 个静态错误，8 个 content.manual 待验证提示。该命令只负责静态结果，人工核对在本报告记录。
- pnpm run test:skills：15 / 15 通过。
- JSON 资源：全部使用 Python json.loads 解析成功。
- Shell 资源：全部使用 sh -n 检查通过；未启动开发服务或发送真实认证请求。
- TypeScript 资源：测试通过 TypeScript transpileModule 检查语法；这是语法检查，不是目标项目的完整类型检查。
- git diff --check：通过。

## 测试覆盖

1. 命名与前缀、description 长度、结构缺失、有效日期。
2. 真实链接失效检测，围栏模板路径不被误当作资源。
3. README 描述漂移与指向已删除技能的条目。
4. YAML 内联/块列表兼容、非法字符串依赖和 system 中混入 pip 的拒绝。
5. fields 未传、空数组、部分选择、未加载字段 warning 与原对象不被修改。
6. Node 服务端环境字符串转数值、false 转布尔、缺失值与非法值失败。
7. 公开环境仅返回声明字段，拒绝非法 URL。
8. OAuth 可省略，配置时 ID/secret 必须成对。
9. 认证客户端不导入 server-env 或 process.env；全部 TS 资源可解析。

## 官方核对来源

以下来源支持具体 API 与配置说明；不是对包内目标应用的实测结果。访问日期：2026-11-15。

- [Zod Schema API](https://zod.dev/api)：字符串转换、布尔解析及 URL Schema。
- [Better Auth Drizzle adapter](https://better-auth.com/docs/adapters/drizzle)：适配器入口与表映射。
- [Better Auth TanStack Start](https://better-auth.com/docs/integrations/tanstack)：服务端路由与 Cookie 插件。
- [Better Auth Client](https://better-auth.com/docs/concepts/client)：同源客户端与 baseURL。
- [Better Auth Options](https://better-auth.com/docs/reference/options)：ID 生成策略配置。

## 限制

此轮完成内容一致性和有限的可执行逻辑验证，没有生成并部署完整应用。技术技能的目标框架、服务接口、数据库和 OAuth 凭据由使用者项目提供。任何未实际执行的集成验证继续标记 evidence-required；不能概括为“所有代码在任何项目都能直接运行”。
