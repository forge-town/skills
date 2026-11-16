> 当前表单映射约束（2026-11-16）：字段、章节和正文只以统一最佳实践契约及 scripts/assemble-issue.mjs 输出为准；本文中的旧章节模板、摘要字段、双语正文拼接或反向生成正文仅属历史工具约定，不得作为第二个正文源。附件与独立验证要求仍适用，文案从当前表单取得，不能覆盖生成的 issue.md。

# Lean 形式化 PRD 规范

## 目标

每条确认后的 Issue 必须附带一份真实可编译的 `formalization.lean`。形式化文件是产品语义的规范来源：不同自然语言只要需求一致，就必须归一到同一个 Lean 值；Markdown 与 HTML 是该值的自然语言表示。

## 有限符号原则

只使用版本化的七类业务符号组合 `FormalPrd`：

| 类别 | 回答的问题 | 初始闭合集合 |
|---|---|---|
| `Actor` | 谁执行 | visitor、member、manager、administrator、operator、reviewer、system |
| `Action` | 做什么 | view、create、edit、submit、approve、reject、publish、archive、retry、invite |
| `Entity` | 对什么 | account、workspace、membership、issue、requirement、document、artifact、record、notification |
| `Guard` | 在什么条件下 | authenticated、authorized、validInput、targetExists、targetMissing、notDuplicate、ready |
| `Outcome` | 得到什么结果 | visible、persisted、notified、navigated、blocked、unchanged、completed |
| `Surface` | 在哪里发生 | page、dialog、menu、panel、list、detail、inbox、background |
| `Control` | 通过什么触发 | link、button、iconButton、form、selector、switch、systemEvent |

Issue 实例不得在语义核心中使用 `String`、自由文本谓词或单条 Issue 私有的 `inductive` 构造子。自然语言标题、说明和模板只属于表示层。

当现有符号无法表达真实业务时，停止 Issue 定稿：先提出词汇扩展及其业务定义，更新版本化核心词汇并验证旧 Issue 仍可编译，再使用新符号。不得用近似符号掩盖语义缺口。

## 必备定义与证明

以 [形式化模板](../assets/formalization-template.lean) 为基础生成 `formalization.lean`，并完成以下内容：

1. 声明唯一规范值 `canonicalPrd : FormalPrd`。
2. 声明来源表述的有限构造子及 `normalize`；不得把整段自然语言作为证明输入。
3. 证明 `canonicalPrd` 满足 `WellFormed`。
4. 存在多个来源表述时，证明它们的 `normalize` 结果相等。
5. 为每个 Task 和 AC 给出到 `Guard` 或 `Outcome` 的可追踪关系；不可追踪内容不得出现在 Markdown 或 HTML。
6. 使用项目锁定的 Lean 工具链真实编译；存在 `sorry`、`admit`、未解目标或仅凭注释声称通过时不得交付。

## 反向翻译

反向翻译必须从 `canonicalPrd` 生成，不得从原始 PRD 摘要回写。使用穷尽、确定性的语言模板，固定输出顺序为：

1. 角色与操作表面。
2. 控件与业务动作。
3. 按枚举顺序列出的前置条件。
4. 按枚举顺序列出的可观察结果。

同一个 `FormalPrd` 在同一语言和模板版本下只能生成一份文本。生成文本必须自然、清晰、没有“适当处理”“符合预期”等不可判定表述。

## 正文与证明分离

- Linear description、`issue.md` 与 `issue.html` 只展示业务背景、目标、Task、动作、流程、规则和验收标准等产品规格。
- 不在业务正文、摘要、目录或参考中加入“Lean 形式化 / Lean Formalization”、证明代码、词汇版本、规范值标识、定理名、Guard / Outcome 符号映射或“反向生成 PRD”段落；不要换成折叠区块或改名后继续展示。
- 形式化仍用于内部语义核对，完整定义、证明和追踪信息保留在独立 `formalization.lean` 附件。反向生成文本可保存在本地验证记录，不追加为第二份业务正文。
- 不包含证明章节不等于放弃语义一致性：仍对照形式化输入核对业务事实与验收项。
- 用户只要求清理正文时，保留独立 Lean 附件；只有用户另行要求才取消或删除该附件。
- 此规则排除的是内部证明说明，不禁止业务需求本身确实涉及 Lean 时使用必要的产品名称。
- 写入前运行 `node scripts/validate-issue-body.mjs <issue.md>`；历史正文清理后检查业务章节和参考是否保持不变。脚本是常见泄漏检查，不能替代完整内容审阅。

## 验证

- 确认七类字段值均来自闭合集合。
- 确认规范值不含自由字符串或私有构造子。
- 确认所有 Task 与 AC 都能追踪到规范值。
- 运行 Lean 编译并检查不存在 `sorry`、`admit` 和未解目标。
- 对不同来源表述执行归一化并比较 Lean 值。
- 反向生成文本后，再次归一化并确认仍等于 `canonicalPrd`。
- 确认 Markdown、HTML 与 Lean 的角色、动作、条件和结果一致。
