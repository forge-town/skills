# Skill 编写最佳实践

## 命名与用途

- 使用 `forge--` 双中划线前缀，动作动词在前、对象在后，后缀用 kebab-case；名称最长 64 个字符。`forge--brainstorm` 本身已清楚，不追加冗余后缀。
- 只有 Linear 使用二级范畴：`forge--linear--<verb>-<noun>`，如 `forge--linear--query-issues`。其他技能保持 `forge--<verb>-<noun>` 平铺，不添加其他范畴。
- `show` 负责展示与解释，`check` 负责验证，`create` 负责创建或更新，`review` 负责评估规则本身。名称、description、正文和交付物必须表达同一动作。
- `skill` 是 `create-skill` 的对象名词，可以保留；不要额外追加表示“这是个技能”的冗余 `-skill`。
- 本仓库所有 description 统一以 `Use when` 开头，单行且少于 150 字符。不得用 `-best-practice` 后缀豁免动作命名。

## 元数据与正文

- SKILL.md 使用 YAML 前言，必需字段为 name、description、lastUpdated；日期为本次编辑日期，格式 YYYY-MM-DD。按需声明 dependency。
- name 必须与技能目录名一致。description 说明何时使用及会做什么；正文只保留简短入口，不超过 20 个非空行。
- 正文提供真实、可解析的相对链接和读取时机；步骤、规则和交付格式放在 references/。
- 避免同一条规则在多个文件维护不同版本；摘要可重复关键约束，完整定义应有单一来源。

## 文件与结构

- 根目录包含 SKILL.md，按需包含 references/、scripts/、assets/、best-practice-examples/。
- 每个技能有 references/checklist.md。目录名以 -best-practice 结尾时，另提供至少一个完整例子；示范技能作为资源，不计入根目录技能总数。
- 可执行工具及其测试放 scripts/；只供阅读、复制或适配的代码例子可以放 references/ 或 best-practice-examples/，必须说明用途。不要把例子当作可直接运行的程序。
- 不创建空目录、缓存、临时日志或替代入口的 README.md；项目级报告和测试产物放项目根目录 docs/。
- 必须存在的脚本、模板和文件使用 Markdown 链接。模板中的占位路径放代码块并明确标为示意，不作为真实资源引用。
- 资源可通过 references 文档或目录导航间接到达，不要求把所有子文件逐一堆进 SKILL.md。仅在脚本实际存在时建立 scripts/，不创建占位脚本。

## 依赖与安装

- dependency.python、dependency.system 使用 YAML 列表，可用块列表或内联列表。Python 条目采用 requirements 格式，system 列出实际需要的系统命令或工具，不混入 pip install。
- 写明运行环境和外部适配点；不得把个人路径、某个项目的包管理器或分层规范当作全局要求。
- 源文件存在、真实命令执行成功、真实业务流程完成是不同层次的证据；不能相互替代。

## 输出与验证

- 说明明确的输入、过程、输出、失败处理和完成条件；不得强制产出不存在的问题或凑固定数量的缺陷。
- README 中的名称、链接、description 与技能入口保持一致。
- 静态检查覆盖命名、元数据、资源与文档结构；业务语义和外部集成必须另外验证，缺失时标记 evidence-required。
- 用户查看最佳实践时，交付适用规则、示例及来源；用户要求检查时由 forge--check-all-skills 输出检查报告；没有授权时不自动修改其他项目或发布结果。
