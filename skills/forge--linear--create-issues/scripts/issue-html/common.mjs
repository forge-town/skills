// Shared helpers for the issue spec → issue.md / issue.html generator.
export const LANGS = { 'zh-CN': ['zh'], 'zh-en': ['zh', 'en'] };
export const KINDS = ['page', 'modal', 'drawer', 'menu'];

export function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Localized value: either a plain string shared by every language or { zh, en }.
export function L(value, lang) {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  return value[lang] ?? '';
}

export const hasText = (value, lang) => L(value, lang).trim().length > 0;

// Visible labels that belong to the document chrome, not the business spec.
export const UI = {
  zh: {
    summary: '摘要', background: '背景介绍', story: '用户故事', overview: '目标预期', tasks: '任务',
    userFlow: '用户流程', flow: '业务流程图',
    prototypes: '界面原型', frontend: '前端变更',  tech: '技术说明',
    nonGoals: '非目标', acs: '验收标准', testCases: '测试用例', reference: '参考',
    as: '作为一个', want: '我希望', so: '从而能够', points: '点',
    given: '给定', when: '当', then: '那么',
    cols: ['用户操作', '入口位置', '页面或区域', '控件', '操作结果'],
    pages: '页面', ui: 'UI 变更', interaction: '交互变更',
    trigger: '触发入口', state: '当前状态', kinds: { page: '页面', modal: 'Dialog', drawer: 'Drawer', menu: 'Menu' },
    meta: { product: 'Product', domain: 'Domain', type: 'Type', estimate: 'Estimate', priority: 'Priority', dependencies: '依赖' },
    toc: '目录', protoIndex: '原型索引', close: '关闭', parent: '父级', related: '相关',
  },
  en: {
    summary: 'Summary', background: 'Background Introduction', story: 'User Story', overview: 'Expected Outcomes', tasks: 'Tasks',
    userFlow: 'User Flow', flow: 'Business Flow Diagram',
    prototypes: 'UI Prototypes', frontend: 'Frontend Changes',  tech: 'Technical Notes',
    nonGoals: 'Non-Goals', acs: 'Acceptance Criteria', testCases: 'Test Cases', reference: 'Reference',
    as: 'As a', want: 'I want to', so: 'So that', points: 'points',
    given: 'Given', when: 'When', then: 'Then',
    cols: ['User action', 'Entry point', 'Page or area', 'Control', 'Result'],
    pages: 'Pages', ui: 'UI Changes', interaction: 'Interaction Changes',
    trigger: 'Trigger', state: 'State', kinds: { page: 'Page', modal: 'Dialog', drawer: 'Drawer', menu: 'Menu' },
    meta: { product: 'Product', domain: 'Domain', type: 'Type', estimate: 'Estimate', priority: 'Priority', dependencies: 'Dependencies' },
    toc: 'Contents', protoIndex: 'Prototype index', close: 'Close', parent: 'Parent', related: 'Related',
  },
};

// Section order shared by Markdown and HTML so both outputs stay in parity.
export function sectionsFor(spec, lang) {
  const s = spec.langs[lang];
  const list = [
    ['background', !!s.background], ['overview', !!s.overview], ['story', !!s.story], ['tasks', true],
    ['userFlow', !!(s.userFlow && s.userFlow.length)], ['flow', !!spec.flow],
    ['prototypes', !!(spec.components && spec.components.length)],

    ['nonGoals', !!(s.nonGoals && s.nonGoals.length)], ['acs', true], ['testCases', true],
  ];
  return list.filter(([, on]) => on).map(([key]) => key);
}

export const anchor = (lang, key) => `${lang}-${key}`;

export function acceptanceFields(a, lang) {
  return [['Given', a.given], ['When', a.when], ['Then', a.then]];
}
export const testCaseFields = acceptanceFields;

export const personText = value => esc(value).replace(/&lt;u&gt;([\s\S]*?)&lt;\/u&gt;/gi,'<em>$1</em>');
export const person = value => '<em>'+esc(value)+'</em>';
