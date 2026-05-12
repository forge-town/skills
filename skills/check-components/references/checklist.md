# 组件规范检查完成清单

执行完毕后逐项确认（规则定义见 `component-unit-best-practice`）：

- [ ] 目标目录已递归扫描（包含所有子文件夹）
- [ ] 所有组件文件夹已识别（PascalCase 目录名）
- [ ] 每个组件文件夹已检查以下四项：
  - [ ] `index.ts` 桶导出文件存在
  - [ ] `ComponentName.tsx` 组件文件存在
  - [ ] `ComponentName.test.tsx` 单元测试文件存在
  - [ ] `ComponentName.stories.tsx` Storybook 故事文件存在
- [ ] 违规项已按文件夹路径和缺失文件类型标注
- [ ] 输出报告包含：通过数 / 警告数 / 错误数 / 总计
