// The one master timeline: scene lifetimes, item reveals, narration clips, sound-effect cues and the music score
// all derive from story data here. Nothing else keeps its own timer.
// Scene length: `dur` seconds (narration-driven, the generator default) or legacy `beats` on the music grid.
// Item reveals: `itemAt` seconds from scene start (timed to the narration) or legacy itemStart/itemStep in beats.
(function (root) {
  const HV = root.HV = root.HV || {};

  function buildTimeline(story) {
    const errors = [];
    const bpm = story.music && story.music.bpm || 120, beat = 60 / bpm;
    let cursor = 0;
    const scenes = story.scenes.map((s, index) => {
      const len = s.dur != null ? s.dur : s.beats * beat;
      if (!(len > 0)) errors.push(`scene ${s.id}: dur or beats must be > 0`);
      const start = cursor, end = cursor + len;
      cursor = end;
      const items = s.items || [];
      const itemStart = (s.itemStart ?? 4) * beat, itemStep = (s.itemStep ?? 2) * beat;
      // item i becomes visible at reveals[i]; overlay, particles and sfx all read this same list
      const reveals = items.map((_, i) => start + (s.itemAt ? s.itemAt[i] : itemStart + i * itemStep));
      if (s.itemAt && s.itemAt.length !== items.length) errors.push(`scene ${s.id}: itemAt must time every item`);
      if (reveals.some((r, i) => i && r < reveals[i - 1])) errors.push(`scene ${s.id}: items must reveal in order`);
      if (reveals.length && reveals[reveals.length - 1] > end - 0.5) errors.push(`scene ${s.id}: items reveal too late for its lifetime`);
      return { ...s, index, start, end, len, enter: s.enter ?? 0.6, exit: s.exit ?? 0.45, reveals };
    });
    const duration = cursor;
    const byId = Object.fromEntries(scenes.map((s) => [s.id, s]));

    const narration = (story.narration || []).map((line, i) => {
      const sc = byId[line.scene];
      if (!sc) { errors.push(`narration ${i}: unknown scene ${line.scene}`); return null; }
      const t = sc.start + line.at, d = line.dur;
      if (line.at < 0 || t + d > sc.end + 1e-6) errors.push(`narration ${line.id || i}: must fit inside scene ${sc.id}`);
      return { ...line, t, d, end: t + d };
    }).filter(Boolean);

    // automatic cut impacts and reveal ticks belong to the opt-in cinematic style only (story.effects === 'cinematic';
    // legacy stories without the field keep them). Explicit per-scene sfx cues are always honored.
    const auto = (story.effects ?? 'cinematic') === 'cinematic', sfx = [];
    scenes.forEach((s) => {
      if (auto && s.index > 0) sfx.push({ t: s.start, kind: s.hit || 'impact', v: 0.5 + 0.5 * (s.energy || 0) });
      if (auto) s.reveals.forEach((t, i) => sfx.push({ t, kind: 'tick', v: 0.6, n: i }));
      (s.sfx || []).forEach((c) => sfx.push({ t: s.start + c.at, kind: c.kind, v: c.v ?? 0.6 }));
    });
    sfx.forEach((c) => { c.d = c.d || 0.4; });

    const tl = {
      bpm, beat, duration, scenes, narration, sfx, errors,
      chapters: scenes.map((s) => ({ t: s.start, id: s.id, label: s.chapter || s.id })),
      sceneAt(t) {
        if (t >= duration) return scenes.length - 1;
        if (t <= 0) return 0;
        let lo = 0, hi = scenes.length - 1;
        while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (scenes[mid].start <= t) lo = mid; else hi = mid - 1; }
        return lo;
      },
      // explicit lifetime: alive only on [start, end); the final scene holds its last frame at duration
      frameAt(t) {
        const tc = Math.max(0, Math.min(duration, t)), scene = scenes[tl.sceneAt(tc)], local = tc - scene.start;
        const fadeIn = HV.util.ss(0, scene.enter, local), fadeOut = scene.index === scenes.length - 1 ? 1 : 1 - HV.util.ss(scene.len - scene.exit, scene.len, local);
        return { t: tc, scene, local, alpha: fadeIn * fadeOut };
      },
      // sentence cues (from the TTS provider) give captions that follow the voice; otherwise the whole line shows
      captionAt(t) {
        const line = narration.find((n) => t >= n.t && t < n.end + 0.3);
        if (!line) return '';
        if (!line.cues || !line.cues.length) return line.text;
        const rel = t - line.t;
        let cue = line.cues[0];
        for (const c of line.cues) if (c.at <= rel) cue = c;
        return cue.text;
      },
    };
    tl.score = HV.buildScore ? HV.buildScore(tl, story) : [];
    return tl;
  }
  HV.buildTimeline = buildTimeline;
})(typeof window !== 'undefined' ? window : globalThis);
