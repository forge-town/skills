#!/usr/bin/env tsx
/**
 * Skill 合规性批量检查脚本。
 *
 * 使用方法：
 *   pnpm exec tsx check-skills.ts [skills-dir] [readme-file]
 */

import * as fs from "node:fs";
import * as path from "node:path";

export type IssueStatus = "error" | "evidence-required";

export interface CheckIssue {
  ruleId: string;
  status: IssueStatus;
  message: string;
  actual?: string;
  suggestion?: string;
}

export interface CheckResult {
  skill: string;
  passed: boolean;
  errors: string[];
  issues: CheckIssue[];
  evidenceRequired: number;
}

export interface SkillFrontmatter {
  name: string;
  description: string;
  raw: string;
}

const DESCRIPTION_LIMIT = 150;
const BODY_LINE_LIMIT = 20;
const FORGE_SKILL_NAME = /^forge_[a-z0-9]+(-[a-z0-9]+)*$/;
const TEMPORARY_ENTRY = /^(?:__pycache__|\.pytest_cache|\.cache|tmp|temp|\.DS_Store|Thumbs\.db)$/;
const TEMPORARY_EXTENSION = /(?:\.py[co]|\.log)$/;
const ALLOWED_ROOT_ENTRIES = new Set([
  "SKILL.md",
  "references",
  "scripts",
  "assets",
  "best-practice-examples",
]);

export function parseFrontmatter(content: string): SkillFrontmatter | null {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) return null;
  const raw = match[1];
  const nameMatch = raw.match(/^name:\s*(.+)$/m);
  const descriptionMatch = raw.match(/^description:\s*(.+)$/m);
  if (!nameMatch || !descriptionMatch) return null;
  return {
    name: nameMatch[1].trim(),
    description: descriptionMatch[1].trim(),
    raw,
  };
}

export function isValidSkillName(name: string): boolean {
  return FORGE_SKILL_NAME.test(name);
}

function baseSkillName(name: string): string {
  return name.replace(/^forge_/, "");
}

function getSkillType(name: string): "verb" | "best-practice" | "integration" {
  const base = baseSkillName(name);
  if (base.endsWith("-best-practice")) return "best-practice";
  if (base.endsWith("-integration")) return "integration";
  return "verb";
}

function collectEntries(root: string): string[] {
  const entries: string[] = [];
  const visit = (current: string): void => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const absolute = path.join(current, entry.name);
      const relative = path.relative(root, absolute);
      const firstSegment = relative.split(path.sep)[0] ?? "";
      if (
        TEMPORARY_ENTRY.test(entry.name) ||
        TEMPORARY_EXTENSION.test(entry.name) ||
        TEMPORARY_ENTRY.test(firstSegment)
      ) {
        entries.push(relative);
      }
      if (entry.isDirectory()) visit(absolute);
    }
  };
  visit(root);
  return entries;
}

function bodyLineCount(content: string): number {
  const body = content.replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, "");
  return body.split(/\r?\n/).filter((line) => line.trim().length > 0).length;
}

function hasDependencyFormat(frontmatter: string, key: "python" | "system"): boolean {
  const dependency = frontmatter.match(/^dependency:\s*$([\s\S]*?)(?=^\S|$)/m);
  if (!dependency) return true;
  const line = dependency[1].match(new RegExp(`^\\s+${key}:\\s*(.+)$`, "m"));
  if (!line) return true;
  const value = line[1].trim();
  if (key === "system" && /pip(?:3)?\s+install|python\s+-m\s+pip/.test(value)) return false;
  return /^\[[^\]]*\]$/.test(value);
}

export function checkSkill(skillDir: string, readmeContent: string): CheckResult {
  const skill = path.basename(skillDir);
  const issues: CheckIssue[] = [];
  const errors: string[] = [];
  const report = (ruleId: string, message: string, suggestion: string, actual?: string): void => {
    issues.push({ ruleId, status: "error", message, suggestion, actual });
    errors.push(message);
  };

  if (!isValidSkillName(skill)) {
    report(
      "namespace.directory",
      "目录名必须使用 forge_ 前缀和 kebab-case 后缀",
      "将目录重命名为 forge_<kebab-case>",
      skill,
    );
  }

  const skillMdPath = path.join(skillDir, "SKILL.md");
  if (!fs.existsSync(skillMdPath)) {
    report("structure.skill-md", "缺少 SKILL.md", "在技能根目录创建 SKILL.md");
    return { skill, passed: false, errors, issues, evidenceRequired: 0 };
  }

  const content = fs.readFileSync(skillMdPath, "utf8");
  const frontmatter = parseFrontmatter(content);
  if (!frontmatter) {
    report(
      "frontmatter.parse",
      "SKILL.md 前言区格式错误",
      "添加包含 name 和 description 的 YAML 前言区",
    );
  } else {
    if (frontmatter.name !== skill) {
      report(
        "frontmatter.name",
        `name 不匹配: ${frontmatter.name}`,
        "使 frontmatter name 与目录名完全一致",
        frontmatter.name,
      );
    }

    const descriptionLength = frontmatter.description.length;
    if (descriptionLength >= DESCRIPTION_LIMIT) {
      report(
        "frontmatter.description.length",
        `description 长度: ${descriptionLength} 字符（必须少于 150 字符）`,
        "精简 description 至少于 150 个字符",
        String(descriptionLength),
      );
    }

    const skillType = getSkillType(skill);
    const requiredPrefix = skillType === "best-practice" ? "Must follow when" : "Use when";
    if (!frontmatter.description.startsWith(requiredPrefix)) {
      report(
        "frontmatter.description.prefix",
        `description 必须以 ${requiredPrefix} 开头`,
        `将 description 改为 ${requiredPrefix} ...`,
        frontmatter.description.slice(0, 40),
      );
    }

    const bodyLines = bodyLineCount(content);
    if (bodyLines > BODY_LINE_LIMIT) {
      report(
        "body.length",
        `SKILL.md 正文超过 ${BODY_LINE_LIMIT} 行`,
        "将详细流程和实现细节移动到 references/",
        String(bodyLines),
      );
    }

    if (!hasDependencyFormat(frontmatter.raw, "python")) {
      report(
        "dependency.python",
        "dependency.python 必须是列表",
        "使用 requirements.txt 格式的列表声明 Python 依赖",
      );
    }
    if (!hasDependencyFormat(frontmatter.raw, "system")) {
      report(
        "dependency.system",
        "dependency.system 必须是列表且不得包含 pip install 命令",
        "将 Python 包移到 dependency.python，system 仅保留系统命令",
      );
    }

    if (skillType === "verb") {
      const checklistPath = path.join(skillDir, "references", "checklist.md");
      if (!fs.existsSync(checklistPath)) {
        report("structure.checklist", "动词型缺少 references/checklist.md", "添加操作完成校验清单");
      }
    }
    if (skillType === "best-practice") {
      const examplesDir = path.join(skillDir, "best-practice-examples");
      if (!fs.existsSync(examplesDir) || fs.readdirSync(examplesDir).length === 0) {
        report(
          "structure.examples",
          "best-practice-examples/ 缺失或为空",
          "添加至少一个真实正例文件",
        );
      }
    }
  }

  for (const entry of fs.readdirSync(skillDir)) {
    if (!ALLOWED_ROOT_ENTRIES.has(entry)) {
      report(
        "structure.root-entry",
        `技能根目录存在未允许的条目: ${entry}`,
        "删除条目或移动到 references/",
        entry,
      );
    }
  }

  for (const entry of collectEntries(skillDir)) {
    report("cleanup.temporary", `存在临时文件: ${entry}`, "删除临时文件或目录", entry);
  }

  const readmeLink = `[${skill}](skills/${skill})`;
  if (!readmeContent.includes(readmeLink)) {
    report("readme.link", "README.md 中未记录", `添加 ${readmeLink} 链接`, readmeLink);
  }

  return { skill, passed: issues.length === 0, errors, issues, evidenceRequired: 0 };
}

function main(): void {
  const skillsDir = process.argv[2] || "./skills";
  const readmeFile = process.argv[3] || "./README.md";
  const readmeContent = fs.existsSync(readmeFile) ? fs.readFileSync(readmeFile, "utf8") : "";
  const skillDirs = fs
    .readdirSync(skillsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(skillsDir, entry.name));

  console.log("=== Skill 合规性批量检查 ===\n");
  let pass = 0;
  let error = 0;
  for (const skillDir of skillDirs) {
    const result = checkSkill(skillDir, readmeContent);
    if (result.passed) {
      console.log(`✅ ${result.skill}`);
      pass += 1;
    } else {
      console.log(`❌ ${result.skill}`);
      for (const issue of result.issues) {
        console.log(`   [${issue.ruleId}] ${issue.message} — ${issue.suggestion}`);
      }
      error += 1;
    }
  }
  console.log("\n=== 检查报告 ===");
  console.log(`总计: ${skillDirs.length} | 通过: ${pass} | 错误: ${error}`);
  console.log(error === 0 ? "✅ 所有技能符合规范！" : "❌ 仍有技能不符合规范。");
  process.exitCode = error === 0 ? 0 : 1;
}

if (process.argv[1]?.endsWith("check-skills.ts")) {
  main();
}
