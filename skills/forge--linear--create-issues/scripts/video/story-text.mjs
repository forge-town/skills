// Localized narration templates and player UI strings for story videos. Narration joins approved phrases with
// natural connectors, says each fact once, and never adds features, results, dates or promises not in the spec.
const trimEnd = (s) => String(s).trim().replace(/[。．.；;，,！!]+$/u, '');
const lowerFirst = (s) => (/^(?:[A-Z][a-z]|A )/.test(s) ? s[0].toLowerCase() + s.slice(1) : s);
const article = (s) => (/^[aeiou]/i.test(s) ? 'an' : 'a');
const enList = (xs, join = 'and') => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} ${join} ${xs[xs.length - 1]}`);
const ZH_ORD = ['第一项', '第二项', '第三项', '第四项'], EN_ORD = ['First', 'Second', 'Third', 'Fourth'];
const ZH_STEP = ['先', '再', '接着', '最后'], EN_STEP = ['First', 'Then', 'Next', 'Finally'];
const ZH_NEXT = ['接下来是', '然后是'], EN_NEXT = ["Next, there's", "Then there's"];
const stepWord = (list, i, n) => (i === n - 1 && n > 1 ? list[3] : list[Math.min(i, 2)]);

// --- semantic de-duplication of AC summaries against task scope items ---------------------------------------------
const STOP = new Set(['the', 'a', 'an', 'and', 'or', 'of', 'to', 'in', 'on', 'is', 'are', 'its', 'it', 'with', 'from', 'for', 'after', 'that']);
function tokens(text, lang) {
  if (lang === 'zh') return (String(text).toLowerCase().match(/[一-鿿]|[a-z0-9]+/g) || []);
  return (String(text).toLowerCase().match(/[a-z0-9]+/g) || []).filter((w) => !STOP.has(w)).map((w) => w.replace(/(ing|es|s)$/, ''));
}
const grams = (t, lang) => new Set(lang === 'zh' ? t.slice(1).map((x, i) => t[i] + x) : t);
// share of the AC's grams already present in one scope item
export function overlap(ac, item, lang) {
  const a = grams(tokens(ac, lang), lang), b = grams(tokens(item, lang), lang);
  if (!a.size) return 1;
  let n = 0; for (const g of a) if (b.has(g)) n++;
  return n / a.size;
}
const THRESHOLD = { zh: 0.4, en: 0.5 };
// AC IDs that add a behavior not already stated by the task's scope items, decided across every language in the spec
// so zh and en videos explain the same things
export function distinctAcIds(spec, taskId) {
  const langs = Object.keys(spec.langs);
  const ids = spec.langs[langs[0]].acs.filter((a) => a.task === taskId).map((a) => a.id);
  return ids.filter((id) => langs.every((lang) => {
    const l = spec.langs[lang], ac = l.acs.find((a) => a.id === id), task = l.tasks.find((t) => t.id === taskId);
    return task.items.every((item) => overlap(ac.summary, item, lang) < THRESHOLD[lang]);
  }));
}

export const WORDS = {
  zh: {
    ch: { intro: '开场', problem: '背景介绍', story: '用户故事', overview: '任务总览', flow: '用户流程', outcome: '目标预期与范围', end: '结尾' },
    background: '背景介绍', story: '用户故事', as: '作为', want: '我希望', so: '从而', flow: '用户流程', scope: '范围', pts: '点', outcome: '目标预期与范围',
    excludes: '不包含：', join: '、', demo: '虚构演示 · 合成语音旁白',
    overview: (n) => `任务总览 · ${n} 项`,
    ordinal: (i) => `${ZH_ORD[i]}任务`,
    // calm, collegial walkthrough: soft connectors, each approved phrase said once and verbatim (shot anchors rely on it)
    intro: (spec, title, n) => `我们一起来看看这条需求要解决什么问题，以及它拆成的 ${n} 项任务。`,
    problemLine: (text) => `先看背景介绍：${trimEnd(text)}。`,
    storyLine: (s) => `所以，${trimEnd(s.as)}希望${trimEnd(s.want)}，这样${trimEnd(s.so)}。`,
    overviewLine: (tasks) => `整件事拆成 ${tasks.length} 项任务：${tasks.map((t, i) => `${i === tasks.length - 1 ? '最后是 ' : ''}${t.id}，${trimEnd(t.name)}`).join('；')}。`,
    taskLine: (i, t, acs, n = 4) => `${i === 0 ? '先看' : i === n - 1 ? '最后是' : ZH_NEXT[(i - 1) % 2]} ${t.id}，${trimEnd(t.name)}。在这里，${t.items.map(trimEnd).join('，')}。`
      + (acs.length ? `验收的时候，我们还会确认${acs.map((a) => trimEnd(a.summary)).join('，以及')}。` : ''),
    flowLine: (steps) => `把整个过程串起来：${steps.map((x, i) => `${stepWord(ZH_STEP, i, steps.length)}${trimEnd(x)}`).join('，')}。`,
    outcomeLine: (s) => (s.overview ? `目标预期是：${(Array.isArray(s.overview) ? s.overview : [s.overview]).map(trimEnd).join('；')}。` : '') + (s.nonGoals && s.nonGoals.length ? `还有一点需要说明：这次不包含${s.nonGoals.map(trimEnd).join('和')}。` : `完成以后，${trimEnd(s.story.so)}。`),
    endLine: (n, demo) => `以上就是这条需求的全部 ${n} 项任务。${demo ? '本视频为虚构演示，旁白由合成语音生成。' : ''}`,
    voiceNote: (v) => `旁白：合成语音（${v}，edge-tts 生成），非真人录音；字幕与语音来自同一时间轴。配乐为浏览器实时合成的钢琴音色，可用“音乐”滑块调低。`,
    noVoiceNote: '旁白：按要求不含人声，字幕即旁白文本；配乐由浏览器实时合成。',
  },
  en: {
    ch: { intro: 'Intro', problem: 'Background Introduction', story: 'User story', overview: 'Task overview', flow: 'User flow', outcome: 'Expected outcomes and scope', end: 'End' },
    background: 'Background Introduction', story: 'User story', as: 'As', want: 'I want', so: 'So that', flow: 'User flow', scope: 'Scope', pts: 'pt', outcome: 'Expected outcomes and scope',
    excludes: 'Excludes: ', join: ', ', demo: 'Fictional demo · synthetic voice narration',
    overview: (n) => `Task overview · ${n} tasks`,
    ordinal: (i) => `${EN_ORD[i]} task`,
    intro: (spec, title, n) => `Let's walk through this change together: ${lowerFirst(trimEnd(title))}. It comes down to ${n} tasks, and we'll start with where things stand today.`,
    problemLine: (text) => `${trimEnd(text)}.`,
    storyLine: (s) => `Put simply, as ${article(s.as)} ${trimEnd(s.as)}, I want to ${lowerFirst(trimEnd(s.want))}, so that ${lowerFirst(trimEnd(s.so))}.`,
    overviewLine: (tasks) => `The work breaks down into ${tasks.length} tasks: ${tasks.map((t, i) => `${i === tasks.length - 1 ? 'and ' : ''}${t.id}, ${trimEnd(t.name)}`).join('; ')}.`,
    taskLine: (i, t, acs, n = 4) => `${i === 0 ? "Let's start with" : i === n - 1 ? "Finally, there's" : EN_NEXT[(i - 1) % 2]} ${t.id}: ${trimEnd(t.name)}. ${t.items.map((x) => `${trimEnd(x)}.`).join(' ')}`
      + (acs.length ? ` When we test it, we'll also check ${acs.length > 1 ? 'that' : 'this'}: ${acs.map((a) => lowerFirst(trimEnd(a.summary))).join('; and ')}.` : ''),
    flowLine: (steps) => `Here's the whole flow, end to end. ${steps.map((x, i) => `${stepWord(EN_STEP, i, steps.length)}, ${lowerFirst(trimEnd(x))}.`).join(' ')}`,
    outcomeLine: (s) => (s.overview ? `Expected outcomes: ${(Array.isArray(s.overview) ? s.overview : [s.overview]).map(trimEnd).join('; ')}. ` : '') + (s.nonGoals && s.nonGoals.length ? `One note on scope: this change doesn't include ${enList(s.nonGoals.map((x) => lowerFirst(trimEnd(x))), 'or')}.` : `When it's done, ${lowerFirst(trimEnd(s.story.so))}.`),
    endLine: (n, demo) => `And that's the whole picture, across all ${n} tasks.${demo ? ' This is a fictional demo, narrated with a synthetic voice.' : ''}`,
    voiceNote: (v) => `Narration: synthetic voice (${v}, generated with edge-tts), not a human recording. Captions and voice share one timeline. The piano score is synthesized live; use the Music slider to lower it.`,
    noVoiceNote: 'Narration: no spoken voice by request; captions carry the narration text. The score is synthesized live.',
  },
};

export const UI_TEXT = {
  zh: { htmlLang: 'zh-CN', poster: '▶ 播放（开启声音）', play: '播放', pause: '暂停', replay: '重播', restart: '从头播放', seek: '进度', rate: '速度',
    cc: '字幕', mute: '静音', unmute: '取消静音', volume: '音量', music: '音乐', chapters: '章节', hint: 'Space 播放/暂停 · M 静音 · C 字幕 · ←/→ 5 秒', langLink: 'English version →' },
  en: { htmlLang: 'en', poster: '▶ Play (sound on)', play: 'Play', pause: 'Pause', replay: 'Replay', restart: 'Restart', seek: 'Seek', rate: 'Speed',
    cc: 'Captions', mute: 'Mute', unmute: 'Unmute', volume: 'Volume', music: 'Music', chapters: 'Chapters', hint: 'Space play/pause · M mute · C captions · ←/→ 5 s', langLink: '中文版 →' },
};
