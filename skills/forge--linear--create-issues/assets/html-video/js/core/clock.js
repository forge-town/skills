// Master clock. Time is always anchorT + (now() − anchorNow) × rate — never an accumulated per-frame delta —
// so play, pause, seek, replay and rate changes cannot drift. The source switches to AudioContext.currentTime
// once audio runs, which makes picture and sound read the same clock.
(function (root) {
  const HV = root.HV = root.HV || {};

  HV.createClock = function createClock({ duration, now }) {
    let source = now, anchorT = 0, anchorNow = source(), rate = 1, playing = false, epoch = 0;
    const raw = () => (playing ? anchorT + (source() - anchorNow) * rate : anchorT);
    const time = () => Math.max(0, Math.min(duration, raw()));
    const reanchor = (t) => { anchorT = Math.max(0, Math.min(duration, t)); anchorNow = source(); epoch++; };
    return {
      time,
      get playing() { return playing; },
      get rate() { return rate; },
      get epoch() { return epoch; },
      // mapping used by the audio scheduler: source time at which master time T sounds
      sourceTimeOf(T) { return anchorNow + (T - anchorT) / rate; },
      play() { if (playing) return; if (time() >= duration) reanchor(0); else reanchor(anchorT); playing = true; },
      pause() { if (!playing) return; const t = time(); playing = false; reanchor(t); },
      seek(t) { reanchor(t); },
      restart() { reanchor(0); playing = true; },
      setRate(r) { const t = time(); rate = r; reanchor(t); },
      setSource(fn) { const t = time(); source = fn; reanchor(t); },
      ended() { return raw() >= duration; },
      // master time of what is audible now: output latency is in source (audio) seconds, master time runs at
      // `rate` master seconds per source second. Never earlier than the current anchor, so resume/seek don't jump back.
      audibleTime(latency) {
        if (!playing) return time();
        return Math.max(anchorT, Math.min(duration, raw() - latency * rate));
      },
    };
  };
})(typeof window !== 'undefined' ? window : globalThis);
