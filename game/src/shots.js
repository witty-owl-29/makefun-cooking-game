// Screenshot scenes. A ?shot= URL parameter sets the game up in a fixed,
// lively mid-game state so the screenshots show the kitchen at its best:
// the order board, ingredients on the counter, a dish mid-assembly, the
// timer, and a plate ready to serve. These are the game's own states, set
// with the same fields the loop updates.

import { resetGameState } from './state.js';
import { recipeById } from './recipes.js';
import { steamPuff } from './particles.js';

function makeOrder(state, id, dishId, patienceFraction) {
  const recipe = recipeById(dishId);
  const max = 75;
  return {
    id,
    dishId,
    name: recipe.name,
    price: recipe.price,
    patience: max * patienceFraction,
    maxPatience: max,
    flash: 0,
  };
}

// Set the state for one named shot. Returns the shot name, or null.
export function applyShot(state, shot) {
  if (!shot) return null;
  resetGameState(state);
  state.phase = 'play';

  if (shot === 'start') {
    state.phase = 'title';
    state.time = 1.2;
    return 'start';
  }

  if (shot === 'cover') {
    state.time = 75;
    state.shiftLeft = 105;
    state.coins = 340;
    state.score = 1250;
    state.combo = 3;
    state.comboTimer = 14;
    state.bestCombo = 3;
    state.served = 4;
    state.nextOrderId = 6;
    state.orders = [
      makeOrder(state, 3, 'nasi-goreng', 0.42),
      makeOrder(state, 4, 'mie-ayam', 0.66),
      makeOrder(state, 5, 'ayam-geprek', 0.82),
    ];
    state.boards[0] = { item: { id: 'veg', state: 'chopped' }, progress: 0 };
    state.boards[1] = { item: null, progress: 0 };
    state.woks[0] = { item: { id: 'chicken', state: 'raw' }, cook: 0.62, burn: 0 };
    state.woks[1] = { item: { id: 'noodle', state: 'raw' }, cook: 0.35, burn: 0 };
    state.plate.items = [
      { id: 'rice', state: 'cooked' },
      { id: 'egg', state: 'cooked' },
    ];
    state.plateOnCounter = true;
    state.chef.x = 880;
    state.chef.y = 430;
    state.chef.dirX = 0;
    state.chef.dirY = -1;
    state.chef.carrying = { kind: 'ingredient', id: 'chicken', state: 'chopped' };
    for (let i = 0; i < 6; i += 1) steamPuff(state, 650, 220);
    for (let i = 0; i < 4; i += 1) steamPuff(state, 846, 220);
    return 'cover';
  }

  if (shot === 'rush') {
    state.time = 128;
    state.shiftLeft = 52;
    state.rush = true;
    state.coins = 610;
    state.score = 2310;
    state.combo = 5;
    state.comboTimer = 9;
    state.bestCombo = 5;
    state.served = 8;
    state.nextOrderId = 12;
    state.orders = [
      makeOrder(state, 9, 'nasi-ayam-geprek', 0.14),
      makeOrder(state, 10, 'mie-ayam', 0.3),
      makeOrder(state, 11, 'tumis-sayur', 0.55),
      makeOrder(state, 12, 'nasi-goreng', 0.72),
    ];
    state.boards[0] = { item: { id: 'chicken', state: 'raw' }, progress: 0.55 };
    state.boards[1] = { item: { id: 'veg', state: 'chopped' }, progress: 0 };
    state.woks[0] = { item: { id: 'rice', state: 'raw' }, cook: 0.8, burn: 0 };
    state.woks[1] = { item: { id: 'egg', state: 'raw' }, cook: 0.5, burn: 0 };
    state.plate.items = [{ id: 'chicken', state: 'cooked' }];
    state.plateOnCounter = true;
    state.chef.x = 620;
    state.chef.y = 400;
    state.chef.dirX = -1;
    state.chef.dirY = 0;
    state.chef.carrying = { kind: 'ingredient', id: 'egg', state: 'raw' };
    state.chef.chopAnim = 0.1;
    for (let i = 0; i < 8; i += 1) steamPuff(state, 650, 220);
    for (let i = 0; i < 6; i += 1) steamPuff(state, 846, 220);
    return 'rush';
  }

  if (shot === 'serve') {
    state.time = 96;
    state.shiftLeft = 84;
    state.coins = 520;
    state.score = 1890;
    state.combo = 2;
    state.comboTimer = 16;
    state.bestCombo = 4;
    state.served = 6;
    state.nextOrderId = 8;
    state.orders = [
      makeOrder(state, 7, 'nasi-goreng', 0.5),
      makeOrder(state, 8, 'telur-dadar', 0.78),
    ];
    state.boards[0] = { item: null, progress: 0 };
    state.boards[1] = { item: { id: 'chilli', state: 'chopped' }, progress: 0 };
    state.woks[0] = { item: null, cook: 0, burn: 0 };
    state.woks[1] = { item: { id: 'chicken', state: 'raw' }, cook: 0.45, burn: 0 };
    state.plate.items = [
      { id: 'rice', state: 'cooked' },
      { id: 'egg', state: 'cooked' },
      { id: 'chicken', state: 'cooked' },
      { id: 'sauce', state: 'raw' },
    ];
    state.plateOnCounter = false;
    state.chef.x = 1113;
    state.chef.y = 205;
    state.chef.dirX = 0;
    state.chef.dirY = -1;
    state.chef.carrying = { kind: 'plate' };
    for (let i = 0; i < 4; i += 1) steamPuff(state, 846, 220);
    return 'serve';
  }

  return null;
}
