// Transport and boot. One master clock drives picture and audio; the frame loop only reads it.
(function (root) {
  const HV = root.HV;
  const $ = (id) => document.getElementById(id);
  const params = new URLSearchParams(location.search);
  const story = HV.story, theme = HV.themes[params.get('theme') || story.theme] || Object.values(HV.themes)[0];
  const tl = HV.buildTimeline(story);
  const W = 1600, H = 900;
  const stage = $('stage'), cv = $('cv'), ctx = cv.getContext('2d'), poster = $('poster');
  const playBtn = $('play'), scrub = $('scrub'), tc = $('tc'), rateSel = $('rate'), muteBtn = $('mute'), vol = $('volume'), musicVol = $('music'), ccBtn = $('cc'), status = $('status');
  const perfNow = () => performance.now() / 1000;
  const clock = HV.createClock({ duration: tl.duration, now: perfNow });
  // ?music=0..1 trims the score under the narration (also adjustable with the Music slider); ?mix=music,voice,effects overrides bus levels
  const trim = params.has('music') ? Math.max(0, Math.min(1, +params.get('music'))) : 1;
  // Empty or omitted mix values retain the story defaults; Number('') would otherwise mute the music.
  const mixQ = (params.get('mix') || '').split(',').map((value) => value.trim() === '' ? NaN : Number(value));
  const audio = HV.createAudio(tl, story, { musicTrim: trim, mix: Object.fromEntries(['music', 'voice', 'effects'].map((k, i) => [k, mixQ[i]]).filter(([, v]) => Number.isFinite(v))) });
  musicVol.value = String(trim);
  let captions = params.get('cc') !== '0', lastFrame = null;

  if (tl.errors.length) { status.textContent = 'Timeline errors: ' + tl.errors.join('; '); console.error('timeline', tl.errors); }
  const st = document.documentElement.style;
  st.setProperty('--bg', theme.bg); st.setProperty('--ink', theme.ink); st.setProperty('--muted', theme.muted);
  st.setProperty('--accent', theme.palette[0]); st.setProperty('--accent2', theme.palette[1] || theme.palette[0]);
  st.setProperty('--font', theme.font); st.setProperty('--mono', theme.mono);
  for (const k of ['page', 'panel', 'line']) if (theme[k]) st.setProperty(`--${k}`, theme[k]);
  document.documentElement.dataset.theme = theme.name;
  document.title = story.title;
  // localized chrome: every visible control label and note follows story.ui (generated per language)
  const ui = story.ui || {};
  if (ui.htmlLang) document.documentElement.lang = ui.htmlLang;
  const setText = (id, v) => { if (v) $(id).textContent = v; };
  setText('hint', ui.hint); setText('rate-label', ui.rate); setText('poster', ui.poster);
  if (ui.restart) { $('restart').setAttribute('aria-label', ui.restart); $('restart').title = ui.restart; }
  if (ui.seek) scrub.setAttribute('aria-label', ui.seek);
  if (ui.volume) vol.setAttribute('aria-label', ui.volume);
  if (ui.music) { musicVol.setAttribute('aria-label', ui.music); setText('music-label', ui.music); }
  if (ui.cc) ccBtn.setAttribute('aria-label', ui.cc);
  if (ui.chapters) $('chapters').setAttribute('aria-label', ui.chapters);
  if (ui.alt) { const a = $('lang-link'); a.href = ui.alt; a.textContent = ui.langLink; a.hidden = false; }
  $('title').textContent = story.title;
  $('voice-note').textContent = story.voiceNote || '';
  HV.overlay.init($('overlay'), tl, $('caption'));
  $('chapters').innerHTML = tl.chapters.map((c, i) => `<button type="button" data-i="${i}"><small>${HV.util.fmt(c.t)}</small>${HV.util.esc(c.label)}</button>`).join('');
  scrub.max = tl.duration.toFixed(3);

  function resize() {
    const dpr = Math.min(2, root.devicePixelRatio || 1);
    cv.width = Math.round(stage.clientWidth * dpr); cv.height = Math.round(stage.clientHeight * dpr);
    renderAt(clock.time());
  }
  function renderAt(t) {
    const f = tl.frameAt(t), sx = cv.width / W;
    ctx.setTransform(sx, 0, 0, sx, 0, 0);
    ctx.fillStyle = theme.bg; ctx.fillRect(0, 0, W, H);
    if (theme.calm) HV.atmosphere.backdrop(ctx, f, W, H, theme);
    else { HV.atmosphere.mist(ctx, f, W, H, theme); HV.atmosphere.beams(ctx, f, W, H, theme); }
    const n = HV.particles.compute(f, W, H);
    HV.particles.draw(ctx, n, theme.palette);
    HV.overlay.render(f, tl, captions);
    scrub.value = f.t.toFixed(3);
    tc.textContent = `${HV.util.fmt(f.t)} / ${HV.util.fmt(tl.duration)}`;
    [...$('chapters').children].forEach((b, i) => b.setAttribute('aria-current', String(i === f.scene.index)));
    lastFrame = { t: f.t, scene: f.scene.id, local: f.local, alpha: f.alpha, particles: n };
    return lastFrame;
  }
  function syncUi() {
    playBtn.textContent = clock.playing ? '❚❚' : clock.time() >= tl.duration ? '↺' : '▶';
    const mode = clock.playing ? 'pause' : clock.time() >= tl.duration ? 'replay' : 'play';
    playBtn.dataset.state = mode;
    playBtn.setAttribute('aria-label', ui[mode] || { pause: 'Pause', replay: 'Replay', play: 'Play' }[mode]);
    muteBtn.setAttribute('aria-pressed', String(audio.muted)); muteBtn.textContent = audio.muted ? '🔇' : '🔊';
    muteBtn.setAttribute('aria-label', audio.muted ? ui.unmute || 'Unmute' : ui.mute || 'Mute');
    ccBtn.setAttribute('aria-pressed', String(captions));
  }
  function loop() {
    if (clock.playing && clock.ended()) { clock.pause(); clock.seek(tl.duration); }
    audio.pump(clock);
    // picture lags by the device output latency (converted to master time at the current rate) so it lands on what is heard
    renderAt(clock.audibleTime(audio.latency()));
    syncUi();
    requestAnimationFrame(loop);
  }
  // all playback starts from a user gesture; audio failure leaves silent playback on the same clock
  async function gestureStart(action) {
    poster.hidden = true;
    if (!audio.running()) {
      const ok = await audio.ensure().catch(() => false);
      if (ok) clock.setSource(() => audio.ctx.currentTime);
      const p = audio.state().problems;
      if (p.length) status.textContent = p.join('; ');
    }
    action();
  }
  const toggle = () => gestureStart(() => (clock.playing ? clock.pause() : clock.play()));
  playBtn.addEventListener('click', toggle);
  poster.addEventListener('click', () => gestureStart(() => clock.restart()));
  stage.addEventListener('click', (e) => { if (e.target === stage || e.target === cv) toggle(); });
  scrub.addEventListener('input', () => clock.seek(+scrub.value));
  rateSel.addEventListener('change', () => clock.setRate(+rateSel.value));
  muteBtn.addEventListener('click', () => { audio.setMuted(!audio.muted); syncUi(); });
  vol.addEventListener('input', () => audio.setVolume(+vol.value));
  musicVol.addEventListener('input', () => audio.setMusicTrim(+musicVol.value));
  ccBtn.addEventListener('click', () => { captions = !captions; syncUi(); });
  $('restart').addEventListener('click', () => gestureStart(() => clock.restart()));
  $('chapters').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) clock.seek(tl.chapters[+b.dataset.i].t); });
  document.addEventListener('keydown', (e) => {
    if (e.target.closest('input, select, button')) return;
    if (e.code === 'Space') { e.preventDefault(); toggle(); }
    if (e.code === 'KeyM') muteBtn.click();
    if (e.code === 'KeyC') ccBtn.click();
    if (e.code === 'ArrowRight') clock.seek(clock.time() + 5);
    if (e.code === 'ArrowLeft') clock.seek(clock.time() - 5);
  });

  new ResizeObserver(resize).observe(stage);
  const start = parseFloat(location.hash.slice(1));
  // A poster preview must never advance the playback cursor. Only an explicit deep link selects a later start.
  clock.seek(Number.isFinite(start) ? start : 0);
  if (Number.isFinite(start)) poster.hidden = true;
  resize(); syncUi(); requestAnimationFrame(loop);

  // test / export hooks: evaluate any frame deterministically without touching playback
  HV.debug = {
    timeline: tl, clock, audio,
    renderAt: (t) => renderAt(t),
    state: () => ({ ...lastFrame, playing: clock.playing, rate: clock.rate, clock: clock.time(), epoch: clock.epoch, audio: audio.state(),
      latency: audio.latency(), audible: clock.audibleTime(audio.latency()),
      audioClock: audio.running() ? audio.ctx.currentTime : null, visibleScenes: HV.overlay.visibleScenes() }),
    particlesAt(t) { const f = tl.frameAt(t), n = HV.particles.compute(f, W, H); return { scene: f.scene.id, n, maxX: n ? Math.max(...HV.particles.buf.x.slice(0, n)) : null, front: HV.particles.front(f, W) }; },
  };
  root.__ready = true;
})(window);
