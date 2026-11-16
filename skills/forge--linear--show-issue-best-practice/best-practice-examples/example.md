# 两个完整 Feature 示例

两类表单都保留摘要：做什么／从哪开始／怎样算完成。完整 JSON 中已填写这三项。表单中摘要在基本信息之后；生成的正文从摘要开始，标题和基本信息只放 Linear 原生字段。


表单 Header 的“查看示例”统一展示以下两个场景，查看不会覆盖草稿；确认“使用此示例填写”后可编辑并查看同一份映射结果。

## Todo List：新增、完成筛选与刷新保留

[完整字段与四条验收案例](todo-feature.json)。初始两条待办；输入“周五前提交报销材料”，新增、勾选完成、按状态筛选，刷新后保留。反例包括空输入与 81 字输入的确切提示。

[可操作原型](../../forge--linear--show-issue-form/assets/examples/todolist.html) 使用本地浏览器存储；每例打开带 reset=1 的完整链接准备固定初态，页面随后移除 reset 参数以便检查刷新持久化。JSON 的 {{TODO_URL}} 由表单按实际路径解析。

## 类幸存者游戏：升级暂停、三选一强化后继续

[完整字段与五条验收案例](survivors-feature.json)。初态经验 4/5、攻击力 10；首个击杀触发升级，战斗冻结；选择“力量 +20%”后攻击力为 12，恢复战斗。另含不选择保持暂停、Escape 不能跳过、移速强化单独生效。

[可操作原型](../../forge--linear--show-issue-form/assets/examples/survivors.html) 是固定数据的升级机制演示；JSON 的 {{SURVIVORS_URL}} 由表单按实际路径解析。范围不包括完整游戏或进度存档。

两个原型均无需登录和组织；完整入口可为本地 file 或 HTTP URL。示例是需求写法，不是已上线产品或验收通过证明。

Bugfix 写法见 [独立示例](bugfix-example.md)。旧 [检索字段样例](issue-example.json) 仅保留为模型回归夹具，Header 不再加载它。

人物在 Linear Markdown 中使用标准斜体；HTML 预览同步显示斜体，不把 HTML 标签写回 Linear。
