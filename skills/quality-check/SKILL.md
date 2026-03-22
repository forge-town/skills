# quality-check

Standardized code quality check configuration using oxlint only.

## Usage

Run this skill to add quality check scripts to your package.json:

```bash
openclaw skills apply quality-check
```

## What It Does

1. Adds quality scripts to package.json:
   - `quality`: typecheck + lint
   - `typecheck`: tsc --noEmit
   - `lint`: oxlint
   - `lint:fix`: oxlint --fix

2. Creates `.oxlintrc.json` with recommended rules

3. Updates turbo.json with quality task

## Requirements

- oxlint must be installed: `pnpm add -D oxlint`
- TypeScript must be installed

## Example

Before:
```json
{
  "scripts": {}
}
```

After:
```json
{
  "scripts": {
    "quality": "pnpm run typecheck && pnpm run lint",
    "typecheck": "tsc --noEmit",
    "lint": "oxlint .",
    "lint:fix": "oxlint . --fix"
  }
}
```
