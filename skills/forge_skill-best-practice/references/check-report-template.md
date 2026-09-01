# 技能库文档完整性检查报告模板

## 完整检查报告示例

### 报告头部

```markdown
## 📋 技能库文档完整性检查报告

**检查时间**: 2025-02-10 10:42:00
**检查对象**: 项目根目录 README.md 和 skills/ 目录
**检查结果**: ❌ 发现问题
```

---

### 目录结构说明

```
README.md                 # 项目根目录下的 README 文件
skills/                    # 技能目录
├── forge_barrel-export-best-practice # 技能子目录 1
├── forge_check-all-items             # 技能子目录 2
├── forge_xxx1-best-practice          # 技能子目录 3
├── forge_xxx2-best-practice          # 技能子目录 4
└── forge_xxx3-best-practice          # 技能子目录 5
```

---

### 1. 实际存在的技能目录

```
共 5 个技能：
- forge_barrel-export-best-practice
- forge_check-all-items
- forge_xxx1-best-practice
- forge_xxx2-best-practice
- forge_xxx3-best-practice
```

---

### 2. README.md 中记录的技能

```
共 2 个技能：
- forge_barrel-export-best-practice
- forge_check-all-items
```

---

### 3. 对比结果

#### ❌ 遗漏的技能（3个）

以下技能在 `skills/` 目录中存在，但没有在 README.md 表格中被记录：

```markdown
| [forge_xxx1-best-practice](skills/forge_xxx1-best-practice) | xxx1最佳实践检查工具 |
| [forge_xxx2-best-practice](skills/forge_xxx2-best-practice) | xxx2最佳实践检查工具 |
| [forge_xxx3-best-practice](skills/forge_xxx3-best-practice) | xxx3最佳实践检查工具 |
```

#### ✅ 冗余的技能（0个）

无。

---

### 4. 自动修复建议

#### 4.1 自动添加遗漏的技能到 README.md

**方法 1：使用 Python 脚本自动修复**
```python
#!/usr/bin/env python3
import re
from pathlib import Path

def add_missing_skills_to_readme():
    """自动将遗漏的技能添加到 README.md"""

    readme_path = Path("README.md")
    skills_dir = Path("skills")

    # 读取 README.md
    with open(readme_path, 'r', encoding='utf-8') as f:
        readme_content = f.read()

    # 获取实际存在的技能目录
    actual_skills = sorted([d.name for d in skills_dir.iterdir() if d.is_dir()])

    # 提取表格中已有的技能
    pattern = r'\[([^\]]+)\]\(skills/[^\)]+\)'
    recorded_skills = sorted(set(re.findall(pattern, readme_content)))

    # 找出遗漏的技能
    missing_skills = set(actual_skills) - set(recorded_skills)

    if not missing_skills:
        print("✅ 所有技能都已记录在 README.md 中")
        return

    # 生成添加内容
    new_lines = []
    for skill in sorted(missing_skills):
        # 读取技能的 SKILL.md 获取描述
        skill_md_path = skills_dir / skill / "SKILL.md"
        description = "待添加描述"
        if skill_md_path.exists():
            with open(skill_md_path, 'r', encoding='utf-8') as f:
                content = f.read()
                match = re.search(r'description:\s*(.+)', content)
                if match:
                    description = match.group(1)

        new_lines.append(f"| [{skill}](skills/{skill}) | {description} |")

    # 找到表格结束位置（在"## "章节之前）
    table_end_match = re.search(r'(\n##\s+[^\n]+\n)', readme_content)
    if table_end_match:
        insert_position = table_end_match.start(1)
        # 在表格结束前插入新行
        new_content = readme_content[:insert_position] + '\n'.join(new_lines) + '\n' + readme_content[insert_position:]
    else:
        print("❌ 无法找到合适的插入位置")
        return

    # 写回 README.md
    with open(readme_path, 'w', encoding='utf-8') as f:
        f.write(new_content)

    print(f"✅ 已成功添加 {len(missing_skills)} 个技能到 README.md")
    for skill in sorted(missing_skills):
        print(f"  - {skill}")

if __name__ == "__main__":
    add_missing_skills_to_readme()
```

**方法 2：使用 Bash 脚本自动修复**
```bash
#!/bin/bash

# 自动添加遗漏的技能到 README.md

README_FILE="README.md"
SKILLS_DIR="skills"

# 获取实际存在的技能目录
actual_skills=$(find "$SKILLS_DIR" -maxdepth 1 -type d ! -name "$SKILLS_DIR" | sed "s|$SKILLS_DIR/||" | sort)

# 获取 README 中记录的技能
recorded_skills=$(grep -E "^\| \[" "$README_FILE" | sed 's/|.*\[\([^]]*\)\].*/\1/' | sort)

# 找出遗漏的技能
missing_skills=""
for skill in $actual_skills; do
    if ! echo "$recorded_skills" | grep -q "^$skill$"; then
        missing_skills="$missing_skills $skill"
    fi
done

if [ -z "$missing_skills" ]; then
    echo "✅ 所有技能都已记录在 README.md 中"
    exit 0
fi

# 生成添加内容
new_lines=""
for skill in $missing_skills; do
    # 尝试从 SKILL.md 获取描述
    skill_md="$SKILLS_DIR/$skill/SKILL.md"
    description="待添加描述"
    if [ -f "$skill_md" ]; then
        desc=$(grep "^description:" "$skill_md" | sed 's/description: //')
        if [ -n "$desc" ]; then
            description="$desc"
        fi
    fi
    new_lines="$new_lines| [$skill](skills/$skill) | $description |"$'\n'
done

# 在表格结束前插入新行（在"## "章节之前）
if grep -q "^##\s" "$README_FILE"; then
    # 找到第一个"## "章节的位置
    first_section=$(grep -n "^##\s" "$README_FILE" | head -1 | cut -d: -f1)
    if [ -n "$first_section" ]; then
        # 在该位置之前插入新行
        sed -i "$((first_section-1))a\\$new_lines" "$README_FILE"
        echo "✅ 已成功添加 $(echo $missing_skills | wc -w) 个技能到 README.md"
        for skill in $missing_skills; do
            echo "  - $skill"
        done
    fi
fi
```

#### 4.2 自动删除冗余的技能从 README.md

**Python 脚本**：
```python
#!/usr/bin/env python3
import re
from pathlib import Path

def remove_redundant_skills_from_readme():
    """自动从 README.md 删除冗余的技能"""

    readme_path = Path("README.md")
    skills_dir = Path("skills")

    # 读取 README.md
    with open(readme_path, 'r', encoding='utf-8') as f:
        readme_content = f.read()

    # 获取实际存在的技能目录
    actual_skills = sorted([d.name for d in skills_dir.iterdir() if d.is_dir()])

    # 提取表格中已有的技能
    pattern = r'\[([^\]]+)\]\(skills/[^\)]+\)'
    recorded_skills = sorted(set(re.findall(pattern, readme_content)))

    # 找出冗余的技能
    redundant_skills = set(recorded_skills) - set(actual_skills)

    if not redundant_skills:
        print("✅ README.md 中没有冗余的技能")
        return

    # 删除冗余技能的行
    lines = readme_content.split('\n')
    new_lines = []
    removed_count = 0

    for line in lines:
        # 检查这一行是否包含冗余技能的链接
        should_remove = False
        for skill in redundant_skills:
            if f'[{skill}](skills/{skill})' in line:
                should_remove = True
                removed_count += 1
                break

        if not should_remove:
            new_lines.append(line)

    # 写回 README.md
    new_content = '\n'.join(new_lines)
    with open(readme_path, 'w', encoding='utf-8') as f:
        f.write(new_content)

    print(f"✅ 已成功删除 {removed_count} 个冗余技能从 README.md")
    for skill in sorted(redundant_skills):
        print(f"  - {skill}")

if __name__ == "__main__":
    remove_redundant_skills_from_readme()
```

---

### 5. 完整的自动化脚本（检查+修复）

```python
#!/usr/bin/env python3
import re
from pathlib import Path

def check_and_fix_skills_readme():
    """检查并自动修复技能库文档完整性"""

    readme_path = Path("README.md")
    skills_dir = Path("skills")

    # 读取 README.md
    with open(readme_path, 'r', encoding='utf-8') as f:
        readme_content = f.read()

    # 获取实际存在的技能目录
    actual_skills = sorted([d.name for d in skills_dir.iterdir() if d.is_dir()])

    # 提取表格中已有的技能
    pattern = r'\[([^\]]+)\]\(skills/[^\)]+\)'
    recorded_skills = sorted(set(re.findall(pattern, readme_content)))

    # 找出遗漏和冗余的技能
    missing_skills = set(actual_skills) - set(recorded_skills)
    redundant_skills = set(recorded_skills) - set(actual_skills)

    print("## 技能库文档完整性检查与自动修复\n")
    print(f"实际技能数：{len(actual_skills)}")
    print(f"记录技能数：{len(recorded_skills)}")
    print(f"遗漏技能数：{len(missing_skills)}")
    print(f"冗余技能数：{len(redundant_skills)}\n")

    # 自动添加遗漏的技能
    if missing_skills:
        print("### 自动添加遗漏的技能")
        new_lines = []
        for skill in sorted(missing_skills):
            # 读取技能的 SKILL.md 获取描述
            skill_md_path = skills_dir / skill / "SKILL.md"
            description = "待添加描述"
            if skill_md_path.exists():
                with open(skill_md_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    match = re.search(r'description:\s*(.+)', content)
                    if match:
                        description = match.group(1)

            new_lines.append(f"| [{skill}](skills/{skill}) | {description} |")
            print(f"  - {skill}: {description[:50]}...")

        # 找到表格结束位置
        table_end_match = re.search(r'(\n##\s+[^\n]+\n)', readme_content)
        if table_end_match:
            insert_position = table_end_match.start(1)
            readme_content = readme_content[:insert_position] + '\n'.join(new_lines) + '\n' + readme_content[insert_position:]
            print(f"\n✅ 已成功添加 {len(missing_skills)} 个技能到 README.md")

    # 自动删除冗余的技能
    if redundant_skills:
        print("\n### 自动删除冗余的技能")
        lines = readme_content.split('\n')
        new_lines = []
        removed_count = 0

        for line in lines:
            should_remove = False
            for skill in redundant_skills:
                if f'[{skill}](skills/{skill})' in line:
                    should_remove = True
                    removed_count += 1
                    print(f"  - {skill}")
                    break

            if not should_remove:
                new_lines.append(line)

        readme_content = '\n'.join(new_lines)
        print(f"\n✅ 已成功删除 {removed_count} 个冗余技能从 README.md")

    # 写回 README.md
    if missing_skills or redundant_skills:
        with open(readme_path, 'w', encoding='utf-8') as f:
            f.write(readme_content)
    else:
        print("\n✅ 所有技能都已正确记录在 README.md 中，无需修复")

if __name__ == "__main__":
    check_and_fix_skills_readme()
```

---

### 6. 简化版报告模板

### 模板 1：发现问题

```markdown
### 技能库文档完整性检查

**遗漏的技能**（3个）：
- [forge_xxx1-best-practice](skills/forge_xxx1-best-practice)
- [forge_xxx2-best-practice](skills/forge_xxx2-best-practice)
- [forge_xxx3-best-practice](skills/forge_xxx3-best-practice)

**冗余的技能**（0个）：无

**自动修复**：
✅ 已成功添加 3 个技能到 README.md
```

### 模板 2：通过检查

```markdown
### 技能库文档完整性检查

✅ **检查通过**

所有 5 个技能都已正确记录在 README.md 中。
```

---

## 使用说明

### 方法 1：手动执行脚本

```bash
# 检查并自动修复
python3 check_and_fix_skills_readme.py

# 或
bash check_and_fix_skills_readme.sh
```

### 方法 2：智能体自动执行

当用户执行 forge_skill-best-practice 时：
1. 运行检查脚本生成报告
2. 如果发现遗漏或冗余技能，自动运行修复脚本
3. 重新检查确认修复成功
4. 输出最终结果
