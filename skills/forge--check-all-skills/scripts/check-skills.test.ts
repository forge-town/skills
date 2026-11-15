import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  checkSkill,
  isValidIsoDate,
  isValidSkillName,
  parseFrontmatter,
  staleReadmeEntries,
} from "./check-skills.ts";

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

function readmeFor(skillDir: string): string {
  const fields = parseFrontmatter(readFileSync(join(skillDir, "SKILL.md"), "utf8"));
  assert.ok(fields);
  return `| [${fields.name}](skills/${fields.name}) | ${fields.description} |`;
}

test("accepts the forge namespace and rejects the unnamespaced directory", () => {
  assert.equal(isValidSkillName("forge--show-skill-best-practice"), true);
  assert.equal(isValidSkillName("forge--brainstorm"), true);
  assert.equal(isValidSkillName("forge--brainstorming"), false);
  assert.equal(isValidSkillName("forge--skill-best-practice"), false);
  assert.equal(isValidSkillName("forge--check"), false);
  assert.equal(isValidSkillName("ui-components-best-practice"), false);
  assert.equal(isValidSkillName("forge_demo"), false);
  assert.equal(isValidSkillName("forge-demo"), false);
  assert.equal(isValidSkillName("forge---demo"), false);
  assert.equal(isValidSkillName("forge--show-demo--extra"), false);
});

test("supports only the Linear second namespace and still requires an action", async () => {
  for (const name of ["forge--linear--query-issues", "forge--linear--submit-acceptance", "forge--linear--review-acceptance"]) {
    assert.equal(isValidSkillName(name), true);
  }
  for (const name of ["forge--writing--write-report", "forge--report--write-daily", "forge--linear--issues", "forge--linear--query", "forge--linear--query--issues", "forge--linear--linear--query-issues"]) {
    assert.equal(isValidSkillName(name), false, name);
  }
  const name = "forge--linear--query-issues";
  const root = await makeSkill(name, {
    "SKILL.md": `---\nname: ${name}\ndescription: Use when 查询目标项目的真实任务清单。\nlastUpdated: 2026-11-15\n---\n按目标范围查询。\n`,
    "references/checklist.md": "- [ ] 已核对查询范围\n",
  });
  try {
    const result = checkSkill(join(root, name), readmeFor(join(root, name)));
    assert.equal(result.passed, true);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("description length is strictly less than 150", async () => {
  const frontmatter = parseFrontmatter(
    "---\nname: forge--show-demo\ndescription: " + "a".repeat(149) + "\n---\n",
  );
  assert.equal(frontmatter?.description.length, 149);

  const root = await makeSkill("forge--show-demo", {
    "SKILL.md": `---\nname: forge--show-demo\ndescription: ${"a".repeat(150)}\nlastUpdated: 2026-09-01\n---\n简要入口\n`,
    "references/checklist.md": "- [ ] 已完成演示操作\n",
  });
  try {
    const result = checkSkill(join(root, "forge--show-demo"), "| [forge--show-demo](skills/forge--show-demo) |");
    assert.match(result.errors.join("\n"), /少于 150/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("reports each missing structural requirement instead of silently passing", async () => {
  const root = await makeSkill("forge--show-demo-best-practice", {
    "SKILL.md":
      "---\nname: forge--show-demo-best-practice\ndescription: Use when 验证示例规范和检查结果，确保结构、元数据与可追溯证据满足项目要求。\nlastUpdated: 2026-09-01\n---\n简要入口\n",
    ".DS_Store": "temporary",
  });
  try {
    const result = checkSkill(join(root, "forge--show-demo-best-practice"), "");
    assert.ok(result.errors.includes("best-practice-examples/ 缺失或为空"));
    assert.ok(result.errors.includes("存在临时文件: .DS_Store"));
    assert.ok(result.errors.includes("README.md 中未记录"));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("frontmatter and README checks use forge names", async () => {
  const root = await makeSkill("forge--show-demo", {
    "SKILL.md":
      "---\nname: forge--show-demo\ndescription: Use when 执行一个可复用的演示操作并需要检查输入、输出和完成状态是否满足约束。\nlastUpdated: 2026-09-01\n---\n简要入口\n",
    "references/checklist.md": "- [ ] 已完成演示操作\n",
  });
  try {
    const result = checkSkill(join(root, "forge--show-demo"), readmeFor(join(root, "forge--show-demo")));
    assert.equal(result.passed, true);
    assert.equal(result.evidenceRequired, 1);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("requires a valid ISO lastUpdated date", async () => {
  assert.equal(isValidIsoDate("2026-09-01"), true);
  assert.equal(isValidIsoDate("2026-02-30"), false);
  assert.equal(isValidIsoDate("2026/09/01"), false);

  const missingRoot = await makeSkill("forge--show-demo", {
    "SKILL.md":
      "---\nname: forge--show-demo\ndescription: Use when 执行一个可复用的演示操作并需要检查输入、输出和完成状态是否满足约束。\n---\n简要入口\n",
    "references/checklist.md": "- [ ] 已完成演示操作\n",
  });
  try {
    const result = checkSkill(
      join(missingRoot, "forge--show-demo"),
      "| [forge--show-demo](skills/forge--show-demo) |",
    );
    assert.match(result.errors.join("\n"), /缺少 lastUpdated 编辑日期/);
  } finally {
    await rm(missingRoot, { recursive: true, force: true });
  }

  const root = await makeSkill("forge--show-demo", {
    "SKILL.md":
      "---\nname: forge--show-demo\ndescription: Use when 执行一个可复用的演示操作并需要检查输入、输出和完成状态是否满足约束。\nlastUpdated: 2026/09/01\n---\n简要入口\n",
    "references/checklist.md": "- [ ] 已完成演示操作\n",
  });
  try {
    const result = checkSkill(join(root, "forge--show-demo"), "| [forge--show-demo](skills/forge--show-demo) |");
    assert.match(result.errors.join("\n"), /lastUpdated 格式无效/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("quality documentation uses the production threshold and evidence vocabulary", () => {
  const quality = readFileSync("skills/forge--check-all-skills/references/quality-standards.md", "utf8");
  const checklist = readFileSync("skills/forge--show-skill-best-practice/references/standard.md", "utf8");
  assert.match(quality, /少于 150/);
  assert.match(quality, /evidence-required/);
  assert.match(quality, /lastUpdated/);
  assert.match(checklist, /forge--/);
  assert.match(checklist, /lastUpdated/);
  assert.match(checklist, /YYYY-MM-DD/);
  assert.doesNotMatch(checklist, /长度在 100-150/);
});

test("validates referenced resources while ignoring fenced template paths", async () => {
  const root = await makeSkill("forge--show-demo", {
    "SKILL.md": "---\nname: forge--show-demo\ndescription: Use when 展示示例并验证真实资源与模板边界。\nlastUpdated: 2026-11-15\n---\n[真实资源](references/missing.md)\n```text\n[示意](references/template-only.md)\n```\n",
    "references/checklist.md": "- [ ] 已检查\n",
  });
  try {
    const result = checkSkill(join(root, "forge--show-demo"), readmeFor(join(root, "forge--show-demo")));
    const links = result.issues.filter((issue) => issue.ruleId === "resource.link");
    assert.equal(links.length, 1);
    assert.match(links[0].actual ?? "", /missing/);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("detects README description drift and stale skill entries", async () => {
  const root = await makeSkill("forge--show-demo", {
    "SKILL.md": "---\nname: forge--show-demo\ndescription: Use when 展示示例。\nlastUpdated: 2026-11-15\n---\n示例\n",
    "references/checklist.md": "- [ ] 已检查\n",
  });
  try {
    const readme = "| [forge--show-demo](skills/forge--show-demo) | 旧描述 |\n| [forge--removed](skills/forge--removed) | 过期 |";
    assert.ok(checkSkill(join(root, "forge--show-demo"), readme).issues.some((issue) => issue.ruleId === "readme.description"));
    assert.deepEqual(staleReadmeEntries(root, readme), ["forge--removed"]);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("accepts YAML block lists and rejects scalar or pip system dependencies", async () => {
  for (const [dependency, expected] of [
    ["dependency:\n  python:\n    - PyYAML>=5.1\n  system:\n    - node", true],
    ["dependency:\n  python: [PyYAML>=5.1]\n  system: [node]", true],
    ["dependency:\n  python: PyYAML", false],
    ["dependency:\n  system: [pip install requests]", false],
  ] as const) {
    const root = await makeSkill("forge--show-demo", {
      "SKILL.md": `---\nname: forge--show-demo\ndescription: Use when 展示示例。\nlastUpdated: 2026-11-15\n${dependency}\n---\n示例\n`,
      "references/checklist.md": "- [ ] 已检查\n",
    });
    try {
      const result = checkSkill(join(root, "forge--show-demo"), readmeFor(join(root, "forge--show-demo")));
      assert.equal(result.passed, expected);
      if (expected) assert.equal(result.evidenceRequired, 1);
    } finally { await rm(root, { recursive: true, force: true }); }
  }
});
