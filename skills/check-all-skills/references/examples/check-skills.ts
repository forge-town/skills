#!/usr/bin/env tsx
/**
 * Skill 合规性批量检查脚本 (TypeScript)
 * 检查项目：命名、前言区、目录结构、README.md 同步
 *
 * 使用方法:
 *   npx tsx check-skills.ts [skills-dir] [readme-file]
 *
 * 默认:
 *   skills-dir = ./skills
 *   readme-file = ./README.md
 */

import * as fs from "fs";
import * as path from "path";

interface CheckResult {
  skill: string;
  passed: boolean;
  errors: string[];
}

interface SkillFrontmatter {
  name: string;
  description: string;
}

// 解析 SKILL.md 前言区
function parseFrontmatter(content: string): SkillFrontmatter | null {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const frontmatter = match[1];
  const nameMatch = frontmatter.match(/^name:\s*(.+)$/m);
  const descMatch = frontmatter.match(/^description:\s*(.+)$/m);

  if (!nameMatch || !descMatch) return null;

  return {
    name: nameMatch[1].trim(),
    description: descMatch[1].trim(),
  };
}

// 检查目录名是否符合 kebab-case
function isValidSkillName(name: string): boolean {
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(name);
}

// 检查 skill 类型
function getSkillType(name: string): "verb" | "best-practice" | "integration" {
  if (name.endsWith("-best-practice")) return "best-practice";
  if (name.endsWith("-integration")) return "integration";
  return "verb";
}

// 检查单个 skill
function checkSkill(skillDir: string, readmeContent: string): CheckResult {
  const skill = path.basename(skillDir);
  const errors: string[] = [];

  // 1. 检查目录名规范
  if (!isValidSkillName(skill)) {
    errors.push("目录名非 kebab-case");
  }

  // 2. 检查 SKILL.md 存在
  const skillMdPath = path.join(skillDir, "SKILL.md");
  if (!fs.existsSync(skillMdPath)) {
    errors.push("缺少 SKILL.md");
    return { skill, passed: false, errors };
  }

  // 3. 检查前言区
  const content = fs.readFileSync(skillMdPath, "utf-8");
  const frontmatter = parseFrontmatter(content);

  if (!frontmatter) {
    errors.push("SKILL.md 前言区格式错误");
  } else {
    // 检查 name 与目录名一致
    if (frontmatter.name !== skill) {
      errors.push(`name 不匹配: ${frontmatter.name}`);
    }

    // 检查 description 长度 (100-150 字符)
    const descLen = frontmatter.description.length;
    if (descLen < 100 || descLen > 150) {
      errors.push(`description 长度: ${descLen} 字符`);
    }
  }

  // 4. 检查动词型 skill 是否有 references/checklist.md
  const skillType = getSkillType(skill);
  if (skillType === "verb") {
    const checklistPath = path.join(skillDir, "references", "checklist.md");
    if (!fs.existsSync(checklistPath)) {
      errors.push("动词型缺少 references/checklist.md");
    }
  }

  // 5. 检查 best-practice 型是否有 best-practice-examples/
  if (skillType === "best-practice") {
    const examplesDir = path.join(skillDir, "best-practice-examples");
    if (!fs.existsSync(examplesDir)) {
      errors.push("best-practice 型缺少 best-practice-examples/");
    } else {
      const files = fs.readdirSync(examplesDir);
      if (files.length === 0) {
        errors.push("best-practice-examples/ 为空");
      }
    }
  }

  // 6. 检查 README.md 中是否存在该 skill
  if (!readmeContent.includes(`[${skill}]`)) {
    errors.push("README.md 中未记录");
  }

  return {
    skill,
    passed: errors.length === 0,
    errors,
  };
}

// 主函数
function main() {
  const skillsDir = process.argv[2] || "./skills";
  const readmeFile = process.argv[3] || "./README.md";

  // 读取 README.md
  let readmeContent = "";
  if (fs.existsSync(readmeFile)) {
    readmeContent = fs.readFileSync(readmeFile, "utf-8");
  }

  // 获取所有 skill 目录
  const skillDirs = fs
    .readdirSync(skillsDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => path.join(skillsDir, dirent.name));

  console.log("=== Skill 合规性批量检查 ===\n");

  const results: CheckResult[] = [];
  let pass = 0;
  let error = 0;

  for (const skillDir of skillDirs) {
    const result = checkSkill(skillDir, readmeContent);
    results.push(result);

    if (result.passed) {
      console.log(`✅ ${result.skill}`);
      pass++;
    } else {
      console.log(`❌ ${result.skill}`);
      console.log(`   ${result.errors.map((e) => `[${e}]`).join(" ")}`);
      error++;
    }
  }

  console.log("\n=== 检查报告 ===");
  console.log(`总计: ${results.length} | 通过: ${pass} | 错误: ${error}`);

  if (error === 0) {
    console.log("✅ 所有技能符合规范！");
    process.exit(0);
  } else {
    process.exit(1);
  }
}

main();
