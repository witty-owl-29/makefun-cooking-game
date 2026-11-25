// Golden Wok — Dapur Kilat. Boot, input, the game loop, and the per-frame
// update that ties the kitchen together: the chef, the woks, the orders,
// the shift timer, and the rush hour.

import { GAME_WIDTH, GAME_HEIGHT, SHIFT_SECONDS, RUSH_AT_SECONDS_LEFT, createGameState, resetGameState } from './state.js';
import { moveChef, interact, setServeDish } from './chef.js';
import { updateOrders, serveDish, spawnOrder } from './orders.js';
import { updateParticles, steamPuff } from './particles.js';
import { render } from './renderer.js';
import { applyShot } from './shots.js';
import {
  ensureAudio, playPop, playChop, playDing, playCoin, playError, playTick,
  playBurn, setSizzleLevel, toggleMute,
} from './audio.js';
import { INGREDIENTS } from './recipes.js';
import { allStations } from './kitchen.js';

setServeDish((state, dish) => serveDish(state, dish));

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const state = createGameState();

const params = new URLSearchParams(window.location.search);
const shotName = applyShot(state, params.get('shot'));
const shotMode = shotName !== null;

const input = { left: false, right: false, up: false, down: false, interact: false };
let lastTickSecond = -1;

function keyDown(event) {
  const key = event.key.toLowerCase();
  if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) {
    event.preventDefault();
  }
  ensureAudio();
  if (key === 'arrowleft' || key === 'a') input.left = true;
  if (key === 'arrowright' || key === 'd') input.right = true;
  if (key === 'arrowup' || key === 'w') input.up = true;
  if (key === 'arrowdown' || key === 's') input.down = true;
  if (key === 'e' || key === ' ') {
    if (!input.interact) interactPressed();
    input.interact = true;
  }
  if (key === 'enter') startGame();
  if (key === 'p' && state.phase === 'play') {
    state.paused = !state.paused;
  }
  if (key === 'm') toggleMute();
  if (key === 'r' && state.phase === 'over') {
    resetGameState(state);
    playPop();
  }
}

function keyUp(event) {
  const key = event.key.toLowerCase();
  if (key === 'arrowleft' || key === 'a') input.left = false;
  if (key === 'arrowright' || key === 'd') input.right = false;
  if (key === 'arrowup' || key === 'w') input.up = false;
  if (key === 'arrowdown' || key === 's') input.down = false;
  if (key === 'e' || key === ' ') input.interact = false;
}

function interactPressed() {
  if (state.phase !== 'play' || state.paused) return;
  const before = state.chef.carrying;
  const result = interact(state);
  if (result === 'grab' || result === 'place' || result === 'plate') playPop();
  if (result === 'chop') playChop();
  if (result === 'served') {
    playDing();
    playCoin();
  }
  if (result === 'no-orders' || result === 'not-a-dish' || result === 'hands-full' || result === 'burnt' || result === 'not-ready') {
    playError();
  }
  if (result === 'trash') playPop();
  if (before !== state.chef.carrying) state.chef.target = null;
}

function canvasPosition(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * (GAME_WIDTH / rect.width),
    y: (event.clientY - rect.top) * (GAME_HEIGHT / rect.height),
  };
}

canvas.addEventListener('mousedown', (event) => {
  ensureAudio();
  if (state.phase === 'title') {
    startGame();
    return;
  }
  if (state.phase !== 'play' || state.paused) return;
  const pos = canvasPosition(event);
  const station = stationAtPoint(pos.x, pos.y);
  state.chef.target = { x: pos.x, y: pos.y, station };
});

// The station the click landed on, if the click was on a station at all.
// A click on the open floor is just a walk target, never an interaction.
function stationAtPoint(x, y) {
  for (const station of allStations()) {
    if (x >= station.x - 6 && x <= station.x + station.w + 6
      && y >= station.y - 6 && y <= station.y + station.h + 6) {
      return station;
    }
  }
  return null;
}

function startGame() {
  if (state.phase !== 'title') return;
  resetGameState(state);
  spawnOrder(state);
  playPop();
}

function updateWoks(state, dt) {
  let cooking = 0;
  for (const wok of state.woks) {
    if (!wok.item) continue;
    if (wok.item.state === 'burnt') continue;
    const def = INGREDIENTS[wok.item.id];
    cooking += 1;
    wok.cook = Math.min(1, wok.cook + dt / def.cookTime);
    if (wok.cook >= 1) {
      wok.item.state = 'cooked';
      wok.burn += dt;
      if (wok.burn > 4) {
        wok.item.state = 'burnt';
        wok.burn = 0;
        playBurn();
      }
    }
  }
  state.sizzleLevel = cooking / 2;
  setSizzleLevel(state.sizzleLevel);
}

function updateShift(state, dt) {
  state.shiftLeft = Math.max(0, state.shiftLeft - dt);
  const second = Math.floor(state.shiftLeft);
  if (state.shiftLeft <= 10 && second !== lastTickSecond && state.shiftLeft > 0) {
    lastTickSecond = second;
    playTick();
  }
  if (!state.rush && state.shiftLeft <= RUSH_AT_SECONDS_LEFT) {
    state.rush = true;
    state.banner = { text: 'RUSH HOUR!', sub: 'Pesanan datang lebih cepat — tetap tenang, chef!', until: state.time + 3 };
    playDing();
  }
  if (state.shiftLeft <= 0 || state.hearts <= 0) {
    state.phase = 'over';
    setSizzleLevel(0);
  }
}

function update(dt) {
  if (state.phase !== 'play' || state.paused) return;
  state.time += dt;
  moveChef(state, dt, input);
  if (state.chef.chopAnim > 0) state.chef.chopAnim -= dt;
  updateWoks(state, dt);
  updateOrders(state, dt);
  updateShift(state, dt);
  // Steam rises from every cooking wok.
  for (const wok of state.woks) {
    if (wok.item && wok.cook < 1 && state.rng() < dt * 6) {
      steamPuff(state, wok.x + wok.w / 2, wok.y + 30);
    }
  }
  updateParticles(state, dt);
  if (state.banner && state.time >= state.banner.until) state.banner = null;
}

let lastNow = performance.now();

function frame(now) {
  const dt = Math.min(0.05, (now - lastNow) / 1000);
  lastNow = now;
  if (shotMode) {
    // In a screenshot scene the kitchen holds still while steam drifts, so
    // the picture is the same every time it is taken.
    state.time += dt;
    updateParticles(state, dt);
    for (const wok of state.woks) {
      if (wok.item && state.rng() < dt * 3) steamPuff(state, wok.x + wok.w / 2, wok.y + 30);
    }
  } else {
    update(dt);
  }
  render(ctx, state);
  requestAnimationFrame(frame);
}

window.addEventListener('keydown', keyDown);
window.addEventListener('keyup', keyUp);
window.__goldenWok = { state, input, startGame };

// A first order is already waiting when a fresh shift starts from the
// title screen; the loop below keeps the title screen alive until then.
requestAnimationFrame(frame);
