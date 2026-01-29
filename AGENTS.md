# SKILLS.md

This file provides guidance for creating and using skills in this repository.

## Repository Overview

A collection of skills that extend AI capabilities. Skills are packaged instructions and scripts for various development tasks.

## Creating a New Skill

### Directory Structure

```
skills/
  {skill-name}/           # kebab-case directory name
    SKILL.md              # Required: skill definition
    scripts/              # Required: executable scripts
      {script-name}.ts    # TypeScript scripts (preferred)
```

### Naming Conventions

- **Skill directory**: `kebab-case` (e.g., `vercel-deploy`, `log-monitor`)
- **SKILL.md**: Always uppercase, always this exact filename
- **Scripts**: `kebab-case.ts` (e.g., `deploy.ts`, `fetch-logs.ts`)

### SKILL.md Format

```markdown
---
name: {skill-name}
description: {One sentence describing when to use this skill. Include trigger phrases like "Deploy my app", "Check logs", etc.}
---

# {Skill Title}

{Brief description of what the skill does.}

## How It Works

{Numbered list explaining the skill's workflow}

## Usage

```bash
pnpx tsx /mnt/skills/user/{skill-name}/scripts/{script}.ts [args]
```

**Arguments:**
- `arg1` - Description (defaults to X)

**Examples:**
{Show 2-3 common usage patterns}

## Output

{Show example output users will see}

## Present Results

{Template for how results should be formatted when presenting to users}

## Troubleshooting

{Common issues and solutions, especially network/permissions errors}
```

### Script Requirements

- Use TypeScript with proper type annotations

### Installation

Skills can be installed by copying the skill directory to the appropriate location or adding the SKILL.md content to your project knowledge.

If the skill requires network access, ensure the necessary domains are allowed.
