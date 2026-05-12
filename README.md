# Forge Town

基于开发实践和实际使用情况的 [Agent Skills](https://agentskills.io/home) 集合。

## 描述

本项目提供了一套针对我们开发工作流程定制的agent skills，专注于构建实用工具和最佳实践。

> [!IMPORTANT]
> 这是一个概念验证项目，会不定期反复迭代。

## 安装

```bash
pnpx skills add forge-town/skills
```

## 技能

| 技能 | 描述 |
|-------|-------------|
| [barrel-export-best-practice](skills/barrel-export-best-practice) | Must follow when 编写或审查 index.ts/index.js 桶导出文件，确保所有导出遵循只做 re-export、无业务逻辑、命名导出等规范。触发词：桶导出规范、index文件规范、barrel export审查、检查桶导出。 |
| [no-re-export-best-practice](skills/no-re-export-best-practice) | Must follow when 审查或编写非 index 文件中的 import/export，禁止在非桶导出文件中对外部模块做 re-export（间接转发），每个消费文件应直接从来源 import。触发词：禁止重导出、re-export规范、非index文件导出、转发导出审查。 |
| [check-barrel-export](skills/check-barrel-export) | Use when 需要生成、优化、修复或检查项目中所有 index 文件（桶导出），确保 index.ts/index.js 均遵循标准桶导出规范。触发词：生成barrel导出、优化index文件、检查桶导出规范。 |
| [check-checklist](skills/check-checklist) | Use when 需要验证 checklist.md 文件是否符合 checklist-best-practice 规范，包括可判定性、示例完整性、分类结构和 Bad Case 节审查。触发词：检查checklist规范、checklist审查、验证清单质量。 |
| [check-components](skills/check-components) | Use when 需要扫描并验证 React 组件文件夹是否符合 component-unit-best-practice 规范，包括文件夹结构、单元测试和 Storybook 故事文件的完整性检查。触发词：检查组件规范、组件文件夹审查、check components、组件结构扫描。 |
| [check-hardcode](skills/check-hardcode) | Use when 需要检查代码中是否存在硬编码内容，包括魔法数字、路径、URL、密钥、环境变量、响应消息等；确保所有可配置值都使用常量或配置文件管理。触发词：硬编码、hard code、magic number。 |
| [better-auth-integration](skills/better-auth-integration) | Must follow when 需要将 Better Auth 认证系统集成到项目，涵盖安装配置、数据库集成、Provider 设置和认证流程验证等完整步骤。触发词：集成better-auth、配置认证系统、接入鉴权。 |
| [assess-automation-checklist](skills/assess-automation-checklist) | Use when 需要评估现有 checklist 的脚本化可能性，分析哪些检查项可通过代码自动化，哪些必须依赖 LLM 判断，输出明确的脚本化设计方案和实现指南。触发词：规划检查脚本、评估脚本化、设计自动化检查、checklist转脚本。 |
| [brainstorming](skills/brainstorming) | Use when 在任何创造性工作之前先精炼需求与方案，包括创建功能、构建组件、添加新功能或修改行为；通过自然对话探索用户意图、约束与成功标准，并产出可审阅设计文档。触发词：brainstorm、头脑风暴、设计方案、需求分析、功能设计。 |
| [implement-automation-checklist](skills/implement-automation-checklist) | Use when 需要实际编写检查脚本代码，基于 assess-automation-checklist 的设计方案实现自动化检查器；输出可运行的脚本文件和集成指南。触发词：编写检查脚本、实现自动检查、code checker、写检查器代码。 |
| [check-all-best-practices](skills/check-all-best-practices) | Use when 需要对项目进行全量最佳实践检查——自动发现并依次执行所有以 best-practice 结尾的技能，输出汇总报告并强制执行标准化验证指令。触发词：检查所有技能、全量规范验证、批量最佳实践检查。 |
| [check-component-consistency](skills/check-component-consistency) | Use when 需要检测多个同类型组件（如 Button、Page）的代码实现一致性，交叉对比 Props、事件、样式、hooks 等实现层面差异，确保代码模式统一。触发词：检查组件一致性、对比组件实现、组件模式审计。 |
| [check-all-skills](skills/check-all-skills) | Use when 需要批量验证 Skill 是否符合最佳实践规范，自动检查命名、前言区、结构与依赖等维度，生成详细报告并输出修复建议；支持单个或批量检查。触发词：检查skill规范、批量验证技能质量。 |
| [check-refine-trpc](skills/check-refine-trpc) | Use when 需要审查或重构 tRPC 路由代码，确保路由结构、类型定义、输入验证和错误处理均符合项目最佳实践；适用于代码审查和路由重构阶段。触发词：检查trpc代码、重构路由写法、优化tRPC格式。 |
| [check-svg](skills/check-svg) | Use when 需要扫描或检查项目中 SVG 图标的使用情况，发现并报告不符合规范的写法，包括命名、路径和组件化问题；适用于代码审查阶段。触发词：检查svg规范、图标规范检查、SVG使用审查、SVG图标优化。 |
| [check-all-components-design](skills/check-all-components-design) | Use when 需要全面检查项目中所有 React 组件的设计质量，扫描并报告 God Component、配置驱动、业务耦合等反模式，确保符合设计规范。触发词：检查组件设计、扫描组件质量、组件设计审查。 |
| [check-error-handling](skills/check-error-handling) | Use when 需要检查代码中是否违规使用原生 try-catch，确保项目使用 neverthrow 进行函数式错误处理；扫描并报告所有原生异常处理代码。触发词：检查错误处理、neverthrow检查、错误处理规范检查、Result类型检查。 |
| [check-props-drilling](skills/check-props-drilling) | Use when 需要检查代码中是否存在 Props Drilling（透传 Props）问题，识别那些本应从 Zustand Store 直接获取却通过多层组件传递的数据。触发词：检查 props 透传、props drilling、消除透传、检查组件依赖。 |
| [check-ui-components](skills/check-ui-components) | Use when 需要检查代码中是否违规使用原生 HTML 元素（如 button、input、select 等），确保符合组件库规范，优先使用组件库组件而非原生元素。触发词：检查 UI 组件、检查原生元素、ui 组件规范检查。 |
| [check-zod-infer-type](skills/check-zod-infer-type) | Use when 需要检查项目中是否存在违规的 types.ts/type.ts 文件，或检查是否有手写类型与 Zod schema 重复定义，确保所有类型都从 Zod schema 派生。触发词：检查类型文件、检查types目录、zod类型检查、type.ts检查。 |
| [component-design-best-practice](skills/component-design-best-practice) | Must follow when 设计或审查 React 组件，确保组件符合 shadcn/ui 设计哲学：单一职责、可组合、可访问、可复制粘贴。定义何时应该拆分组件、组件边界、命名规范。触发词：组件设计、拆分组件、组件边界、shadcn 规范。 |
| [checklist-best-practice](skills/checklist-best-practice) | Must follow when 为 Skill 或项目模块编写检查清单（checklist.md），确保每一项可判断、有示例、结构清晰、支持自动化验证。触发词：写checklist、检查清单规范、checklist最佳实践、创建验证清单。 |
| [clean-hardcode](skills/clean-hardcode) | Use when 需要清理代码库中的垃圾代码，包括未使用导入、注释代码段、console.log、死代码、空函数、重复代码等。触发词：清理代码、clean code、删除dead code、清除垃圾。 |
| [component-unit-best-practice](skills/component-unit-best-practice) | Must follow when 创建或审查 React 组件文件夹单元，强制每个组件以独立文件夹形式存在，包含组件本身、单元测试（*.test.tsx）和 Storybook 故事文件（*.stories.tsx）。触发词：组件单元规范、组件文件夹结构、组件单测规范、组件story规范。 |
| [error-handling-best-practice](skills/error-handling-best-practice) | Must follow when 编写包含 try-catch 的错误处理代码，确保 catch 块有实质处理逻辑，不为空、不仅记录日志、必须处理或重新抛出异常。触发词：try-catch规范、错误处理最佳实践、异常处理审查。 |
| [fix-all-best-practices](skills/fix-all-best-practices) | Use when 需要一键扫描并自动修复项目中所有最佳实践违规问题，自动发现并依次执行所有 best-practice 技能的检查与修复操作。触发词：修复所有违规、自动修复最佳实践、一键规范化项目代码。 |
| [refine-trpc-best-practice](skills/refine-trpc-best-practice) | Must follow when 在 React 组件中进行数据获取，确保通过 Refine hooks（useList/useOne 等）经由 DataProvider 访问数据，禁止直接调用 trpc 客户端。触发词：refine数据规范、禁止直接使用tRPC、DataProvider最佳实践。 |
| [refactor-classname](skills/refactor-classname) | Use when 需要检查或转换 React/Vue 文件中的 className 模板字符串为 cn 函数调用，支持递归扫描文件夹、详细报告所有位置。触发词：优化className写法、重构模板字符串、检查className规范。 |
| [refactor-ui-components](skills/refactor-ui-components) | Use when 需要将代码中的原生 HTML 元素（如 button、input、select 等）自动重构为项目组件库组件，确保符合组件库规范并保持功能不变。触发词：重构 UI 组件、替换原生元素、迁移到组件库。 |
| [dao-best-practice](skills/dao-best-practice) | Must follow when 创建或重构 DAO 文件，确保遵循 Drizzle ORM 最佳实践（文件结构、方法命名、类型安全、性能优化）。触发词：dao规范、DAO最佳实践、创建DAO文件、审查DAO代码。 |
| [db-table-best-practice](skills/db-table-best-practice) | Must follow when 创建或审查 Drizzle ORM 数据库表定义，确保表名、列名、索引和关系配置均遵循项目命名规范与表结构规范。触发词：数据库表名规范、检查表结构定义、数据库命名审查、schema命名。 |
| [form-best-practice](skills/form-best-practice) | Must follow when 创建或重构前端表单组件，确保表单结构、字段验证逻辑和状态管理遵循项目表单设计规范与组件化标准。触发词：表单规范、创建表单组件、表单最佳实践审查、form-best-practice。 |
| [generate-preview](skills/generate-preview) | Use when 需要对 React 组件文件生成结构化 .json 描述和可视化 .md 目录树预览，用于组件拆分前的详细结构分析、复杂度评估与规划。触发词：生成组件预览文档、拆分前分析、组件结构可视化。 |
| [i18n-best-practice](skills/i18n-best-practice) | Must follow when 创建或重构 i18n 国际化代码，确保遵循 react-i18next 最佳实践（初始化配置、翻译文件结构、组件用法、SSR 同步、语言切换与测试 Mock）。触发词：i18n规范、国际化最佳实践、添加翻译、创建语言切换、i18n 初始化、多语言支持。 |
| [introspect-best-practice](skills/introspect-best-practice) | Use when 需要深度反思已定义的 best-practice，挖掘潜在盲区、过度设计、隐藏假设和未覆盖场景；通过自我审视挑战既有规范，发现规范本身的局限性。触发词：反思最佳实践、深挖规范盲区、自检 skill、挑战既有规范、规范盲点分析。 |
| [implement-feature](skills/implement-feature) | Use when 需要实现一个新 Feature，从 Schema 定义到数据层、服务层、状态层、UI 层再到最终质量检查，串联多个原子动词 Skill 完成宽线性工作流。触发词：实现功能、开发功能、新增 feature。 |
| [implement-split](skills/implement-split) | Use when 需要将大型组件或模块按最佳实践拆分为多个独立文件，系统性地执行代码拆分与重构，确保拆分后各模块结构符合规范。触发词：拆分组件、实现文件拆分、代码模块拆分重构、component-split。 |
| [one-component-per-file-best-practice](skills/one-component-per-file-best-practice) | Must follow when 检查或重构 React/Vue 组件文件，强制每个文件只包含一个组件，不允许多组件共存于同一文件；支持 TSX/JSX/Vue。触发词：一文件一组件、组件文件规范检查、单组件规范。 |
| [page-best-practice](skills/page-best-practice) | Must follow when 创建或审查前端页面结构，确保遵循 Anatomy 规范，正确分离 Wrapper、Content 和 Optional Store 模块。触发词：创建页面、页面结构规范、前端页面解剖规范。 |
| [remove-comments](skills/remove-comments) | Use when 需要批量删除代码文件中的注释，支持 Python、JS、TS、TSX、Java、C/C++、Rust、Go、HTML 等主流编程语言。触发词：删除注释、清除代码注释、移除注释行、批量去注释。 |
| [repository-best-practice](skills/repository-best-practice) | Must follow when 创建或重构 Repository 层，确保数据访问模式、方法命名、返回类型和接口定义符合项目规范。触发词：repository规范、创建repository层、数据访问层审查。 |
| [schema-best-practice](skills/schema-best-practice) | Must follow when 创建或重构数据库 Schema 定义，确保 Drizzle ORM schema 中的命名、关系和索引配置均符合规范。触发词：schema规范、创建数据库schema、schema结构审查。 |
| [service-best-practice](skills/service-best-practice) | Must follow when 创建或重构 Service 层，基于 tRPC + Service + DAO 架构确保依赖注入、错误处理和业务逻辑分层符合规范。触发词：service规范、创建service层、服务层重构。 |
| [skill-best-practice](skills/skill-best-practice) | Must follow when 创建或修改 Skill 后执行质量验证，涵盖命名、目录结构、元数据完整性、临时文件清理和依赖格式共 16 项检查。触发词：检查skill规范、skill质量验证、技能合规性检查。 |
| [create-skill](skills/create-skill) | Use when 需要创建一个新 Skill 或更新现有 Skill，将领域知识、工作流程或工具集成打包为可复用技能包，须中文编写。触发词：创建新技能、新建技能、更新技能、修改skill、更新现有技能、扩展AI能力。 |
| [storybook-best-practice](skills/storybook-best-practice) | Must follow when 创建或维护 Storybook Stories，确保组件文档命名、参数定义和装饰器配置符合项目 Storybook 编写规范。触发词：创建storybook、story规范、组件故事文档审查。 |
| [store-best-practice](skills/store-best-practice) | Must follow when 使用 Zustand 创建或重构状态管理 Store，确保遵循 slice 模式、Provider 设置和类型安全规范。触发词：创建store、zustand规范、状态管理最佳实践、store设计审查。 |
| [subagent-driven-development](skills/subagent-driven-development) | Use when 需要把已批准的实现计划拆成独立任务并分派给子代理执行，通过规格一致性审查与代码质量审查双阶段把关，确保并行实现结果与设计、计划和验收标准保持一致。触发词：子代理开发、分派任务、并行实现、subagent。 |
| [svg-icon-best-practice](skills/svg-icon-best-practice) | Must follow when 管理或新增 React TypeScript 项目中的 SVG 图标组件，确保命名、封装方式和导出规范遵循项目标准规范。触发词：svg图标规范、图标组件管理、SVG图标规范审查。 |
| [test-driven-development](skills/test-driven-development) | Use when 需要以测试先行方式实现功能、修复 bug 或重构行为，严格执行 Red-Green-Refactor 循环，先写失败测试再写最小生产代码并完成重构验证。触发词：TDD、测试先行、红绿重构、先写测试。 |
| [ui-components-best-practice](skills/ui-components-best-practice) | Must follow when 创建或审查 UI 组件代码，确保在标准场景下使用项目组件库组件（如 shadcn/ui），禁止直接使用原生 HTML 元素。触发词：UI 组件规范、组件库使用规范、禁止原生元素、ui-components-best-practice。 |
| [implement-trpc-query](skills/implement-trpc-query) | Use when 需要实现 tRPC 按需查询（on-demand query）模式，确保查询逻辑和数据获取方式符合项目 tRPC 规范和最佳实践。触发词：tRPC按需查询、实现tRPC查询、on-demand查询模式。 |
| [use-store-not-props-best-practice](skills/use-store-not-props-best-practice) | Must follow when 设计组件数据流——优先通过 Store 访问全局状态，不得通过 Props 层层传递；适用于代码审查和新功能设计阶段。触发词：用store替代props、组件传参规范。 |
| [writing-plans](skills/writing-plans) | Use when 需要将已批准的设计规格拆解为可执行实现计划，按最小任务粒度给出文件路径、完整代码、验证命令、依赖上下文和完成标准，便于低上下文执行者稳定落地实现。触发词：写计划、实现计划、任务拆解、plan、roadmap。 |
| [zod-env-integration](skills/zod-env-integration) | Must follow when 配置类型安全的环境变量管理模块，基于 .env.example 使用 Zod 生成 env schema 和标准化管理工具。触发词：zod环境变量、env类型安全配置、环境变量schema。 |
| [zod-infer-type-best-practice](skills/zod-infer-type-best-practice) | Must follow when 项目中存在 Zod schema 定义时，禁止另建 type.ts 文件重复声明类型；所有类型须直接用 z.infer 从 schema 派生，杜绝类型与 schema 不同步。触发词：类型文件、type.ts、zod类型、schema类型。 |

## 许可证

[MIT](LICENSE.md)
