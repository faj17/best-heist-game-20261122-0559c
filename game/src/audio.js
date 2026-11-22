// All sound is synthesised in WebAudio — no audio files, no network.
// The context is created lazily on the first user gesture (browser rule).

let ctx = null;
let muted = false;
let humNodes = null;

function ensure() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

export function unlockAudio() {
  ensure();
}

export function toggleMute() {
  muted = !muted;
  if (muted) stopHum();
  return muted;
}

function tone(freq, dur, type = 'sine', vol = 0.12, slideTo = null, delay = 0) {
  const c = ensure();
  if (!c || muted) return;
  const t0 = c.currentTime + delay;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  if (slideTo !== null) o.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(c.destination);
  o.start(t0);
  o.stop(t0 + dur + 0.05);
}

function noiseBurst(dur, vol = 0.1, lowpass = 1200) {
  const c = ensure();
  if (!c || muted) return;
  const len = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = c.createBufferSource();
  src.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.value = lowpass;
  const g = c.createGain();
  g.gain.value = vol;
  src.connect(f).connect(g).connect(c.destination);
  src.start();
}

// A low tension drone while the alarm is hot; started/stopped by the game.
export function startHum() {
  const c = ensure();
  if (!c || muted || humNodes) return;
  const o = c.createOscillator();
  o.type = 'sawtooth';
  o.frequency.value = 55;
  const f = c.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.value = 220;
  const g = c.createGain();
  g.gain.value = 0.035;
  o.connect(f).connect(g).connect(c.destination);
  o.start();
  humNodes = { o, g };
}

export function stopHum() {
  if (!humNodes) return;
  try {
    humNodes.g.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.05);
    humNodes.o.stop(ctx.currentTime + 0.3);
  } catch (_) { /* already stopped */ }
  humNodes = null;
}

export const sfx = {
  click() { tone(660, 0.06, 'triangle', 0.08); },
  grab() { tone(520, 0.09, 'triangle', 0.14); tone(780, 0.12, 'triangle', 0.12, null, 0.07); },
  coin() { tone(1180, 0.07, 'square', 0.06); tone(1560, 0.1, 'square', 0.05, null, 0.06); },
  throwCoin() { tone(900, 0.12, 'sine', 0.1, 300); },
  smoke() { noiseBurst(0.5, 0.14, 900); },
  crackTick() { tone(340, 0.05, 'square', 0.07); },
  safeOpen() { tone(220, 0.15, 'triangle', 0.14, 440); tone(660, 0.25, 'triangle', 0.12, null, 0.12); },
  spotted() { tone(880, 0.12, 'sawtooth', 0.1, 660); tone(880, 0.12, 'sawtooth', 0.1, 660, 0.14); },
  caught() { tone(392, 0.22, 'sawtooth', 0.14, 98); noiseBurst(0.25, 0.1, 500); },
  lockdown() { tone(220, 0.4, 'sawtooth', 0.13, 110); tone(220, 0.4, 'sawtooth', 0.13, 110, 0.45); },
  unlock() { tone(523, 0.1, 'triangle', 0.12); tone(659, 0.1, 'triangle', 0.12, null, 0.09); tone(784, 0.18, 'triangle', 0.12, null, 0.18); },
  floorClear() { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.16, 'triangle', 0.12, null, i * 0.1)); },
  win() { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.22, 'triangle', 0.13, null, i * 0.12)); },
  lose() { [330, 262, 196].forEach((f, i) => tone(f, 0.3, 'triangle', 0.12, null, i * 0.16)); },
  vent() { noiseBurst(0.3, 0.09, 2400); tone(300, 0.2, 'sine', 0.07, 700); },
};
