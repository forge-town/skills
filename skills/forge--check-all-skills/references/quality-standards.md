# Skill 质量规则

完整编写规则见 [Skill 最佳实践](../../forge--show-skill-best-practice/references/standard.md)。description 少于 150 字符，lastUpdated 使用有效 YYYY-MM-DD 日期。静态检查使用以下边界。

## 静态检查

- forge-- 动作命名、name 与目录名一致、有效日期和简短单行 description。
- SKILL.md 正文不超过 20 个非空行；所有技能有 references/checklist.md。
- 根目录仅含入口和允许的资源目录，无空目录、临时文件或缓存。
- Python/system 依赖允许块列表与内联列表；system 不混入 pip 安装命令。
- 忽略围栏代码块中的示意路径，核对 Markdown 中真实的本地链接；不把远程链接可达性当作本地静态检查结果。
- README 有匹配的名称、链接和 description，且没有指向不存在技能的目录条目。
- 后缀为 -best-practice 的技能有非空 best-practice-examples/。

## 人工核对

逐个阅读正文和相关资源，核对名称、触发条件、行为、例子、输出和失败处理是否一致。真实集成、权限、凭据和网络流程按需另外验证。无法静态证明的项目保留 evidence-required。

## 报告语义

- pass：被明确列出的检查已通过；静态 pass 只表示结构与资源通过。
- error：确定的静态或内容错误，附实际路径和修正办法。
- evidence-required：未完成的人工核对或运行验证，不等于通过，也不等于已发现错误。

命令退出码只表示静态错误是否为零；即使退出 0，也必须阅读人工待验证项，不能宣称全部内容和外部流程已验证。

## 运行依赖

检查器使用 Node.js 文件 API 与 yaml 包解析前言。仓库内先执行 pnpm install，再运行 pnpm run check:skills / pnpm run test:skills；这两个命令的路径以当前仓库根目录为准。单独复制技能时须另行提供 yaml 解析依赖和 tsx，或在 Node 24+ 用类型剥离运行；不能把这个工具当作无依赖的独立二进制。环境和资源均未就绪时报告缺失，不伪造检查结果。
