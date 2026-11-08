let ctx = null;
const getCtx = () => {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
};

export const playClick = () => {
  try {
    const c = getCtx(), t = c.currentTime;
    const o = c.createOscillator(), g = c.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(880, t);
    o.frequency.exponentialRampToValueAtTime(1320, t + 0.06);
    g.gain.setValueAtTime(0.12, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    o.connect(g).connect(c.destination);
    o.start(t); o.stop(t + 0.12);
  } catch {}
};

// rhythmic tick-tick during the spin, slowing near the end (spin lasts ~4.6s)
export const playSpin = () => {
  try {
    const c = getCtx(), t0 = c.currentTime;
    const ticks = 46;
    for (let i = 0; i < ticks; i++) {
      const frac = i / ticks;
      const t = t0 + 4.4 * Math.pow(frac, 1.6); // ease-out spacing
      const o = c.createOscillator(), g = c.createGain();
      o.type = "triangle";
      o.frequency.setValueAtTime(1900 - 500 * frac, t);
      g.gain.setValueAtTime(0.06, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      o.connect(g).connect(c.destination);
      o.start(t); o.stop(t + 0.06);
    }
  } catch {}
};

export const playWin = () => {
  try {
    const c = getCtx(), t0 = c.currentTime;
    [523, 659, 784, 1047].forEach((f, i) => {
      const t = t0 + i * 0.13;
      const o = c.createOscillator(), g = c.createGain();
      o.type = "sine";
      o.frequency.setValueAtTime(f, t);
      g.gain.setValueAtTime(0.14, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
      o.connect(g).connect(c.destination);
      o.start(t); o.stop(t + 0.5);
    });
  } catch {}
  try { navigator.vibrate?.([120, 60, 120, 60, 220]); } catch {}
};
