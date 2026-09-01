import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { checkSkill, isValidSkillName, parseFrontmatter } from "./check-skills.ts";

async function makeSkill(name: string, files: Record<string, string>): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "forge-skill-test-"));
  const skillDir = join(root, name);
  await mkdir(skillDir, { recursive: true });
  for (const [relativePath, content] of Object.entries(files)) {
    const filePath = join(skillDir, relativePath);
    await mkdir(join(filePath, ".."), { recursive: true });
    await writeFile(filePath, content, "utf8");
  }
  return root;
}

test("accepts the forge namespace and rejects the unnamespaced directory", () => {
  assert.equal(isValidSkillName("forge_ui-components-best-practice"), true);
  assert.equal(isValidSkillName("ui-components-best-practice"), false);
});

test("description length is strictly less than 150", async () => {
  const frontmatter = parseFrontmatter(
    "---\nname: forge_demo\ndescription: " + "a".repeat(149) + "\n---\n",
  );
  assert.equal(frontmatter?.description.length, 149);

  const root = await makeSkill("forge_demo", {
    "SKILL.md": `---\nname: forge_demo\ndescription: ${"a".repeat(150)}\n---\n简要入口\n`,
    "references/checklist.md": "- [ ] 已完成演示操作\n",
  });
  try {
    const result = checkSkill(join(root, "forge_demo"), "| [forge_demo](skills/forge_demo) |");
    assert.match(result.errors.join("\n"), /少于 150/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("reports each missing structural requirement instead of silently passing", async () => {
  const root = await makeSkill("forge_demo-best-practice", {
    "SKILL.md":
      "---\nname: forge_demo-best-practice\ndescription: Must follow when 验证示例规范和检查结果，确保结构、元数据与可追溯证据满足项目要求。\n---\n简要入口\n",
    ".DS_Store": "temporary",
  });
  try {
    const result = checkSkill(join(root, "forge_demo-best-practice"), "");
    assert.ok(result.errors.includes("best-practice-examples/ 缺失或为空"));
    assert.ok(result.errors.includes("存在临时文件: .DS_Store"));
    assert.ok(result.errors.includes("README.md 中未记录"));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("frontmatter and README checks use forge names", async () => {
  const root = await makeSkill("forge_demo", {
    "SKILL.md":
      "---\nname: forge_demo\ndescription: Use when 执行一个可复用的演示操作并需要检查输入、输出和完成状态是否满足约束。\n---\n简要入口\n",
    "references/checklist.md": "- [ ] 已完成演示操作\n",
  });
  try {
    const result = checkSkill(join(root, "forge_demo"), "| [forge_demo](skills/forge_demo) |");
    assert.equal(result.passed, true);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("quality documentation uses the production threshold and evidence vocabulary", () => {
  const quality = readFileSync("skills/forge_check-all-skills/references/quality-standards.md", "utf8");
  const checklist = readFileSync("skills/forge_skill-best-practice/references/checklist.md", "utf8");
  assert.match(quality, /少于 150/);
  assert.match(quality, /evidence-required/);
  assert.match(checklist, /forge_/);
  assert.doesNotMatch(checklist, /长度在 100-150/);
});
