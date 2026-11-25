// Synthesized sound effects with plain WebAudio. No audio files, no
// network: every sound is built from oscillators and filtered noise.

let audioCtx = null;
let muted = false;
let sizzleNodes = null;

export function isMuted() {
  return muted;
}

export function toggleMute() {
  muted = !muted;
  if (sizzleNodes) sizzleNodes.gain.gain.value = muted ? 0 : 0.05;
  return muted;
}

// Call from a user gesture so the browser lets audio start.
export function ensureAudio() {
  if (audioCtx) {
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
    return;
  }
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AC();
  } catch {
    audioCtx = null;
  }
}

function tone(freq, duration, type, volume, when = 0, slideTo = null) {
  if (!audioCtx || muted) return;
  const t0 = audioCtx.currentTime + when;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + duration);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.05);
}

function noiseBurst(duration, volume, filterFreq) {
  if (!audioCtx || muted) return;
  const t0 = audioCtx.currentTime;
  const len = Math.floor(audioCtx.sampleRate * duration);
  const buffer = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = audioCtx.createBufferSource();
  src.buffer = buffer;
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = filterFreq;
  const gain = audioCtx.createGain();
  gain.gain.value = volume;
  src.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);
  src.start(t0);
}

export function playPop() {
  tone(520, 0.08, 'sine', 0.12, 0, 760);
}

export function playChop() {
  noiseBurst(0.07, 0.25, 900);
  tone(160, 0.07, 'triangle', 0.18, 0, 90);
}

export function playDing() {
  tone(880, 0.18, 'sine', 0.16);
  tone(1318, 0.3, 'sine', 0.14, 0.1);
}

export function playCoin() {
  tone(988, 0.09, 'square', 0.07);
  tone(1319, 0.09, 'square', 0.07, 0.08);
  tone(1568, 0.16, 'square', 0.07, 0.16);
}

export function playError() {
  tone(180, 0.22, 'sawtooth', 0.1, 0, 110);
}

export function playTick() {
  tone(1200, 0.05, 'square', 0.06);
}

export function playBurn() {
  noiseBurst(0.4, 0.2, 300);
  tone(220, 0.4, 'sawtooth', 0.08, 0, 70);
}

// A looping sizzle whose loudness follows how many woks are cooking.
export function setSizzleLevel(level) {
  if (!audioCtx) return;
  if (!sizzleNodes) {
    const len = audioCtx.sampleRate;
    const buffer = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i += 1) data[i] = Math.random() * 2 - 1;
    const src = audioCtx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 3000;
    const gain = audioCtx.createGain();
    gain.gain.value = 0;
    src.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    src.start();
    sizzleNodes = { gain };
  }
  sizzleNodes.gain.gain.value = muted ? 0 : level * 0.05;
}
