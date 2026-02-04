# 技能验证指南

此指南提供验证技能结构和内容的逐步检查清单，确保技能符合标准并能正常工作。

## 验证概述

技能验证检查以下方面：
- 必需文件存在
- 文件格式正确
- 元数据完整
- 命名约定遵循标准

## 必需文件检查

### 1. SKILL.md 存在性
- [ ] 技能目录包含 `SKILL.md` 文件
- [ ] 文件位于技能根目录
- [ ] 文件可读且不为空

## 前言验证

### 2. YAML 前言格式
- [ ] 文件以 `---` 开头
- [ ] 前言是有效的 YAML 格式
- [ ] 前言以 `---` 结束，后跟内容

### 3. 必需字段
- [ ] 包含 `name` 字段
- [ ] 包含 `description` 字段
- [ ] 字段值是字符串类型

### 4. 可选字段
- [ ] `license` 字段（如果存在）是字符串
- [ ] `allowed-tools` 字段（如果存在）是有效格式
- [ ] `metadata` 字段（如果存在）是字典

## 名称验证

### 5. 命名约定
- [ ] 使用连字符大小写（kebab-case）
- [ ] 仅包含小写字母、数字和连字符
- [ ] 不以连字符开头或结尾
- [ ] 不包含连续连字符
- [ ] 长度不超过 64 个字符

## 描述验证

### 6. 描述要求
- [ ] 是非空字符串
- [ ] 不包含尖括号（`<` 或 `>`）
- [ ] 长度不超过 1024 个字符
- [ ] 提供清晰的使用场景和触发条件

## 结构验证

### 7. 目录结构
- [ ] 技能目录名称与 `name` 字段匹配
- [ ] `scripts/` 目录（如果存在）包含可执行文件
- [ ] `references/` 目录（如果存在）包含文档文件
- [ ] 无无关文件或目录

### 8. 文件完整性
- [ ] 所有引用的脚本文件存在
- [ ] 所有引用的参考文件存在
- [ ] 文件路径正确且可访问

## 内容质量检查

### 9. SKILL.md 内容
- [ ] 包含有用的概述部分
- [ ] 提供清晰的使用说明
- [ ] 包含实际示例（如果适用）
- [ ] 引用关系正确（参见引用梳理指南）

### 10. 资源文件
- [ ] 脚本文件有适当的执行权限
- [ ] 参考文档格式正确且有用
- [ ] 文件命名一致且描述性

## 自动化验证步骤

虽然此指南是手动的，但您可以创建简单的验证脚本：

```python
import os
import re
import yaml

def validate_skill(skill_path):
    # 检查 SKILL.md 存在
    skill_md = os.path.join(skill_path, "SKILL.md")
    if not os.path.exists(skill_md):
        return False, "未找到 SKILL.md"
    
    # 读取并验证前言
    with open(skill_md, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if not content.startswith("---"):
        return False, "未找到 YAML 前言"
    
    # 提取前言
    match = re.match(r"^---\n(.*?)\n---", content, re.DOTALL)
    if not match:
        return False, "无效的前言格式"
    
    frontmatter_text = match.group(1)
    
    # 解析 YAML
    try:
        frontmatter = yaml.safe_load(frontmatter_text)
    except yaml.YAMLError as e:
        return False, f"前言中的无效 YAML：{e}"
    
    # 检查必需字段
    if "name" not in frontmatter:
        return False, "前言中缺少 'name'"
    if "description" not in frontmatter:
        return False, "前言中缺少 'description'"
    
    # 验证名称格式
    name = frontmatter["name"]
    if not re.match(r"^[a-z0-9-]+$", name):
        return False, f"名称 '{name}' 应为连字符大小写"
    
    return True, "技能有效！"
```

## 常见验证错误及修复

| 错误 | 可能原因 | 修复方法 |
|------|----------|----------|
| 未找到 SKILL.md | 文件缺失或位置错误 | 在技能根目录创建 SKILL.md |
| 无效的前言格式 | YAML 语法错误 | 检查 YAML 格式，使用在线验证器 |
| 缺少 'name' | 前言不完整 | 添加 name 字段 |
| 名称格式错误 | 不符合命名约定 | 使用 kebab-case 格式 |
| 描述过长 | 描述超过 1024 字符 | 缩短描述，保留关键信息 |

## 验证通过的标准

技能验证通过当：
- 所有必需检查标记为 ✓
- 无阻塞性错误
- 内容质量检查合理
- 技能可以安全打包和分发

## 后续步骤

验证通过后，技能可以：
- 打包成分发格式
- 安装到其他环境
- 提交到技能仓库