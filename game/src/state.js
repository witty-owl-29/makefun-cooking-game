// Game-wide constants and the mutable state of one shift.
// Everything the game draws or updates lives here, so a screenshot scene can
// set it up directly and the loop can run it unchanged.

export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 800;
export const SHIFT_SECONDS = 180;
export const RUSH_AT_SECONDS_LEFT = 60;
export const MAX_HEARTS = 3;
export const MAX_ORDERS = 4;
export const COMBO_WINDOW_SECONDS = 20;

// A small deterministic random source, so a screenshot scene plays the same
// way every time it is set up.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function nextRandom() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function clamp(value, min, max) {
  return value < min ? min : value > max ? max : value;
}

export function createGameState() {
  return {
    phase: 'title', // title | play | over
    paused: false,
    time: 0,
    shiftLeft: SHIFT_SECONDS,
    rush: false,
    coins: 0,
    score: 0,
    combo: 0,
    comboTimer: 0,
    bestCombo: 0,
    hearts: MAX_HEARTS,
    served: 0,
    expired: 0,
    nextOrderId: 1,
    spawnTimer: 6,
    orders: [],
    chef: {
      x: 640,
      y: 600,
      radius: 20,
      speed: 265,
      dirX: 0,
      dirY: 1,
      moving: false,
      walkPhase: 0,
      carrying: null, // { kind: 'ingredient', id, state } | { kind: 'plate' }
      chopAnim: 0,
      target: null, // { x, y, station } click-to-move target
    },
    boards: [
      { item: null, progress: 0 },
      { item: null, progress: 0 },
    ],
    woks: [
      { item: null, cook: 0, burn: 0 },
      { item: null, cook: 0, burn: 0 },
    ],
    plate: { items: [] },
    plateOnCounter: true,
    particles: [],
    floats: [],
    sizzleLevel: 0,
    banner: null, // { text, sub, until }
    rng: mulberry32(20261125),
  };
}

// Reset a state in place for a fresh shift.
export function resetGameState(state) {
  const fresh = createGameState();
  for (const key of Object.keys(fresh)) state[key] = fresh[key];
  state.phase = 'play';
}
