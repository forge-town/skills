import assert from 'node:assert/strict';
import test from 'node:test';
import { findFormalizationLeaks } from './validate-issue-body.mjs';

test('accepts business tasks and legitimate Lean product names', () => {
  assert.deepEqual(findFormalizationLeaks('## 任务\n### T1：更新 Lean 编辑器\n- [ ] 验证打开文件\n## 验收标准\n- [ ] [T1][AC-01] 显示结果'), []);
});
test('rejects Chinese and English proof sections and collapsed variants', () => {
  for (const value of ['## Lean 形式化', '## Lean Formalization', '>>> Lean 形式化']) {
    assert.equal(findFormalizationLeaks(value).length, 1);
  }
});
test('rejects proof values even when the section is renamed', () => {
  assert.equal(findFormalizationLeaks('## 技术说明\n- 规范值：`canonicalPrd`').length, 1);
});
test('rejects reverse output and theorem metadata', () => {
  for (const value of ['反向生成 PRD：', '- Reverse-generated PRD: x', '- 良构定理：x', '- Task / AC 追踪：x']) {
    assert.equal(findFormalizationLeaks(value).length, 1);
  }
});
test('does not edit or discard input business content', () => {
  const body = '## 任务\n- [ ] 保留中文与链接 https://example.com\n## Lean 形式化\n证明\n>>> 参考\n业务引用\n>>>';
  const before = body;
  assert.ok(findFormalizationLeaks(body).length);
  assert.equal(body, before);
});
