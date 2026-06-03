const MUTE_KEY = 'pulsex_sounds_muted';

let audioCtx = null;
let warmedUp = false;

function getCtx() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    try { audioCtx = new Ctor(); } catch { return null; }
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

// Resume the AudioContext on the first user gesture so that later sound
// calls triggered by SignalR / timers actually produce audio. Browsers
// block AudioContext.resume() unless it is called from a gesture handler,
// so we hook one-shot listeners at module load. Once resumed, the context
// stays "running" for the lifetime of the page.
function warmUp() {
  if (warmedUp) return;
  const ctx = getCtx();
  if (!ctx) return;
  ctx.resume?.().catch(() => {});
  if (ctx.state === 'running') warmedUp = true;
}

if (typeof window !== 'undefined') {
  const handler = () => {
    warmUp();
    if (warmedUp) {
      ['click', 'touchstart', 'keydown', 'pointerdown'].forEach((evt) =>
        window.removeEventListener(evt, handler, true)
      );
    }
  };
  ['click', 'touchstart', 'keydown', 'pointerdown'].forEach((evt) =>
    window.addEventListener(evt, handler, { capture: true, passive: true })
  );
}

function playTone(freqs, duration = 0.28) {
  if (isMuted()) return;
  try {
    const ctx = getCtx();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume?.().catch(() => {});

    const now = ctx.currentTime;
    const step = duration / freqs.length;

    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.connect(gain);
      gain.connect(ctx.destination);

      const start = now + i * step;
      const end = start + step;

      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.22, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, end);

      osc.start(start);
      osc.stop(end);
    });
  } catch {
    // silently fail
  }
}

export function isMuted() {
  return localStorage.getItem(MUTE_KEY) === 'true';
}

export function toggleMute() {
  const next = !isMuted();
  localStorage.setItem(MUTE_KEY, String(next));
  // Toggling counts as a user gesture — make sure the context is live so
  // the very next sound after enabling plays without needing another click.
  if (!next) warmUp();
  return next;
}

export function playMessageSound() {
  playTone([880, 1100]);
}

export function playNotificationSound() {
  playTone([660]);
}
