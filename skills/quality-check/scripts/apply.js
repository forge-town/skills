#!/usr/bin/env node
/**
 * quality-check skill - Apply standardized oxlint quality config
 */

const fs = require('fs');
const path = require('path');

const OXLINT_CONFIG = {
  plugins: ["import", "typescript", "react", "react-hooks", "jsx-a11y", "promise"],
  categories: {
    correctness: "error",
    suspicious: "warn",
    perf: "warn",
    pedantic: "off"
  },
  rules: {
    "no-console": "warn",
    "no-debugger": "error"
  }
};

const QUALITY_SCRIPTS = {
  quality: "pnpm run typecheck && pnpm run lint",
  typecheck: "tsc --noEmit",
  lint: "oxlint .",
  "lint:fix": "oxlint . --fix"
};

function applyQualityCheck(projectPath = '.') {
  const packageJsonPath = path.join(projectPath, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    console.error('❌ package.json not found');
    process.exit(1);
  }
  
  // Read and update package.json
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  packageJson.scripts = {
    ...packageJson.scripts,
    ...QUALITY_SCRIPTS
  };
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  console.log('✅ Updated package.json with quality scripts');
  
  // Create .oxlintrc.json
  const oxlintPath = path.join(projectPath, '.oxlintrc.json');
  fs.writeFileSync(oxlintPath, JSON.stringify(OXLINT_CONFIG, null, 2) + '\n');
  console.log('✅ Created .oxlintrc.json');
  
  console.log('\n📋 Quality check configured:');
  console.log('  - quality: typecheck → lint');
  console.log('  - typecheck: tsc --noEmit');
  console.log('  - lint: oxlint .');
  console.log('  - lint:fix: oxlint . --fix');
}

if (require.main === module) {
  applyQualityCheck(process.argv[2] || '.');
}

module.exports = { applyQualityCheck };
