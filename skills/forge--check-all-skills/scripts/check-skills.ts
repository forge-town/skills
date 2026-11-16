#!/usr/bin/env tsx
/**
 * Skill 合规性批量检查脚本。
 *
 * 使用方法：
 *   pnpm exec tsx check-skills.ts [skills-dir] [readme-file]
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { parseDocument } from "yaml";

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
  lastUpdated: string | null;
  raw: string;
  values: Record<string, unknown>;
}

const DESCRIPTION_LIMIT = 150;
const BODY_LINE_LIMIT = 20;
const FORGE_SKILL_NAME = /^forge--(?:linear--)?([a-z]+)(?:-[a-z0-9]+(?:-[a-z0-9]+)*)?$/;
const ACTION_VERBS = new Set([
  "assess", "backfill", "brainstorm", "build", "check", "clean", "configure", "convert",
  "create", "debug", "delete", "deploy", "design", "draw", "export", "fetch",
  "generate", "implement", "import", "inspect", "install", "integrate",
  "list", "manage", "migrate", "organize", "plan", "query", "read", "refactor",
  "remove", "render", "repair", "review", "revise", "scan", "search", "show",
  "submit", "sync", "test", "update", "validate", "verify", "write",
]);
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
  const document = parseDocument(raw);
  if (document.errors.length > 0) return null;
  const values = document.toJSON() as unknown;
  if (!values || typeof values !== "object" || Array.isArray(values)) return null;
  const fields = values as Record<string, unknown>;
  if (typeof fields.name !== "string" || typeof fields.description !== "string") return null;
  return {
    name: fields.name.trim(),
    description: fields.description.trim(),
    lastUpdated: typeof fields.lastUpdated === "string" ? fields.lastUpdated : null,
    raw,
    values: fields,
  };
}

export function isValidIsoDate(value: string): boolean {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function isValidSkillName(name: string): boolean {
  const match = name.match(FORGE_SKILL_NAME);
  const action = name.replace(/^forge--(?:linear--)?/, "");
  return name.length <= 64 && match !== null && ACTION_VERBS.has(match[1]) &&
    (name === "forge--brainstorm" || action !== match[1]);
}

function baseSkillName(name: string): string {
  return name.replace(/^forge--(?:linear--)?/, "");
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

function hasDependencyFormat(fields: Record<string, unknown>, key: "python" | "system"): boolean {
  if (fields.dependency === undefined) return true;
  const dependency = fields.dependency;
  if (!dependency || typeof dependency !== "object" || Array.isArray(dependency)) return false;
  const value = (dependency as Record<string, unknown>)[key];
  if (value === undefined) return true;
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== "string" || !entry.trim())) return false;
  return key !== "system" || !value.some((entry) => /pip(?:3)?\s+install|python\s+-m\s+pip/.test(entry));
}

function withoutFencedExamples(content: string): string {
  let fence: string | null = null;
  return content.split(/\r?\n/).filter((line) => {
    const match = line.match(/^\s*(`{3,}|~{3,})/);
    if (match) {
      if (fence === null) fence = match[1][0];
      else if (match[1][0] === fence) fence = null;
      return false;
    }
    return fence === null;
  }).join("\n");
}

function resourceFiles(root: string): string[] {
  return fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(root, entry.name);
    return entry.isDirectory() ? resourceFiles(file) : entry.isFile() ? [file] : [];
  });
}

export function staleReadmeEntries(skillsDir: string, readmeContent: string): string[] {
  const names = [...readmeContent.matchAll(/\[[^\]]+\]\(skills\/([^/)]+)\)/g)].map((match) => match[1]);
  return [...new Set(names)].filter((name) => !fs.existsSync(path.join(skillsDir, name, "SKILL.md")));
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
      "目录名使用 forge-- 动作命名；仅 Linear 使用 forge--linear-- 二级范畴；brainstorm 可直接使用",
      "将目录重命名为 forge--<verb>-<noun>；新增动作动词时同步 ACTION_VERBS",
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
      "添加包含 name、description 和 lastUpdated 的 YAML 前言区",
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

    if (!frontmatter.lastUpdated) {
      report(
        "frontmatter.last-updated.required",
        "缺少 lastUpdated 编辑日期",
        "在前言区添加 ISO 格式的 lastUpdated: YYYY-MM-DD",
      );
    } else if (!isValidIsoDate(frontmatter.lastUpdated)) {
      report(
        "frontmatter.last-updated.format",
        `lastUpdated 格式无效: ${frontmatter.lastUpdated}`,
        "使用有效的 ISO 日期，例如 2026-09-01",
        frontmatter.lastUpdated,
      );
    }

    const allowedFields = new Set(["name", "description", "lastUpdated", "dependency"]);
    for (const key of Object.keys(frontmatter.values)) {
      if (!allowedFields.has(key)) report("frontmatter.field", `未支持的前言字段: ${key}`, "使用仓库文档中声明的字段");
    }
    if (frontmatter.description.includes("\n") || /[<>]/.test(frontmatter.description)) {
      report("frontmatter.description.format", "description 必须单行且不包含尖括号", "使用简短、单行的 Use when 描述");
    }
    const descriptionLength = [...frontmatter.description].length;
    if (descriptionLength >= DESCRIPTION_LIMIT) {
      report(
        "frontmatter.description.length",
        `description 长度: ${descriptionLength} 字符（必须少于 150 字符）`,
        "精简 description 至少于 150 个字符",
        String(descriptionLength),
      );
    }

    const skillType = getSkillType(skill);
    const requiredPrefix = "Use when";
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

    if (!hasDependencyFormat(frontmatter.values, "python")) {
      report(
        "dependency.python",
        "dependency.python 必须是列表",
        "使用 requirements.txt 格式的列表声明 Python 依赖",
      );
    }
    if (!hasDependencyFormat(frontmatter.values, "system")) {
      report(
        "dependency.system",
        "dependency.system 必须是列表且不得包含 pip install 命令",
        "将 Python 包移到 dependency.python，system 仅保留系统命令",
      );
    }

    {
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

  for (const file of resourceFiles(skillDir)) {
    if (!file.endsWith(".md")) continue;
    const text = withoutFencedExamples(fs.readFileSync(file, "utf8"));
    for (const match of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
      const target = match[1].split("#")[0];
      if (!target || /^[a-z][a-z0-9+.-]*:/i.test(target)) continue;
      const cleanTarget = target.startsWith("<") && target.endsWith(">") ? target.slice(1, -1) : target;
      if (!fs.existsSync(path.resolve(path.dirname(file), decodeURI(cleanTarget)))) {
        report("resource.link", `资源链接不存在: ${path.relative(skillDir, file)} -> ${target}`, "修正路径或删除失效入口", target);
      }
    }
  }
  const visitDirectories = (directory: string): void => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const child = path.join(directory, entry.name);
      if (fs.readdirSync(child).length === 0) report("structure.empty", `空目录: ${path.relative(skillDir, child)}`, "删除空目录或提供实际资源");
      else visitDirectories(child);
    }
  };
  visitDirectories(skillDir);

  for (const entry of collectEntries(skillDir)) {
    report("cleanup.temporary", `存在临时文件: ${entry}`, "删除临时文件或目录", entry);
  }

  const readmeLink = `[${skill}](skills/${skill})`;
  if (!readmeContent.includes(readmeLink)) {
    report("readme.link", "README.md 中未记录", `添加 ${readmeLink} 链接`, readmeLink);
  }

  if (frontmatter && readmeContent.includes(readmeLink)) {
    const row = readmeContent.split(/\r?\n/).find((line) => line.includes(readmeLink));
    const description = row?.split("|")[2]?.trim();
    if (description !== frontmatter.description) report("readme.description", "README description 与 SKILL.md 不一致", "同步 README 的实际 description");
  }
  issues.push({
    ruleId: "content.manual", status: "evidence-required",
    message: "名称、正文、示例与实际交付的一致性，以及外部集成，需人工或运行验证",
    suggestion: "阅读相关资源，记录实际输入输出和未覆盖范围",
  });
  return { skill, passed: errors.length === 0, errors, issues, evidenceRequired: 1 };
}

function main(): void {
  const skillsDir = process.argv[2] || "./skills";
  const readmeFile = process.argv[3] || "./README.md";
  const readmeContent = fs.existsSync(readmeFile) ? fs.readFileSync(readmeFile, "utf8") : "";
  const skillDirs = fs
    .readdirSync(skillsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(skillsDir, entry.name)).sort();

  console.log("=== Skill 合规性批量检查 ===\n");
  let pass = 0;
  let error = 0;
  let evidenceRequired = 0;
  for (const skillDir of skillDirs) {
    const result = checkSkill(skillDir, readmeContent);
    if (result.passed) {
      console.log(`✅ ${result.skill} [static-pass]`);
      pass += 1;
    } else {
      console.log(`❌ ${result.skill} [static-error]`);
      error += 1;
    }
    evidenceRequired += result.evidenceRequired;
    for (const issue of result.issues) {
      const actual = issue.actual ? ` | 实际: ${issue.actual}` : "";
      console.log(`   [${issue.ruleId}] ${issue.status} | ${issue.message}${actual} | ${issue.suggestion}`);
    }
  }
  for (const name of staleReadmeEntries(skillsDir, readmeContent)) {
    console.log(`❌ [readme.stale] README 指向不存在的技能: ${name}`);
    error += 1;
  }
  console.log("\n=== 检查报告 ===");
  console.log(
    `总计: ${skillDirs.length} | 静态通过: ${pass} | 静态错误: ${error} | 人工待验证: ${evidenceRequired}`,
  );
  console.log(error === 0 ? "✅ 静态检查通过；人工内容与外部运行验证仍需另行记录。" : "❌ 存在静态错误。");
  process.exitCode = error === 0 ? 0 : 1;
}

if (process.argv[1]?.endsWith("check-skills.ts")) {
  main();
}
