#!/usr/bin/env node

// 检查DAO文件是否遵循最佳实践的脚本
const fs = require("fs");
const path = require("path");

function checkDaoFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const issues = [];

  // 检查导出形式
  if (!content.includes("export const") || !content.includes("Dao = {")) {
    issues.push("DAO应导出为对象形式: export const {tableName}Dao = { ... }");
  }

  // 检查方法命名
  const camelCaseMethods = content.match(/async\s+(\w+)\s*\(/g);
  if (camelCaseMethods) {
    camelCaseMethods.forEach((match) => {
      const methodName = match.replace(/async\s+/, "").replace(/\s*\(/, "");
      if (methodName.charAt(0) !== methodName.charAt(0).toLowerCase()) {
        issues.push(`方法名应使用驼峰命名: ${methodName}`);
      }
    });
  }

  // 检查导入
  if (!content.includes('from "drizzle-orm"')) {
    issues.push("应从drizzle-orm导入必要的函数");
  }

  return issues;
}

const filePath = process.argv[2];
if (!filePath) {
  console.log("用法: node check-dao.js <dao-file-path>");
  process.exit(1);
}

const issues = checkDaoFile(filePath);
if (issues.length === 0) {
  console.log("DAO文件符合最佳实践");
} else {
  console.log("发现问题:");
  issues.forEach((issue) => console.log("- " + issue));
}
