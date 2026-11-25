// Orders: spawning, patience, serving, and the score. An order is a ticket
// on the board with a dish and a patience bar. Serve the right dish in time
// for coins and a tip; let the bar run out and a heart is lost.

import { pickRecipe, recipeById } from './recipes.js';
import { addFloat, burst } from './particles.js';
import { COMBO_WINDOW_SECONDS, MAX_ORDERS } from './state.js';

export function spawnOrder(state) {
  const recipe = pickRecipe(state.rng, state.served);
  const basePatience = state.rush ? 42 + state.rng() * 18 : 58 + state.rng() * 28;
  const order = {
    id: state.nextOrderId,
    dishId: recipe.id,
    name: recipe.name,
    price: recipe.price,
    patience: basePatience,
    maxPatience: basePatience,
    flash: 0,
  };
  state.nextOrderId += 1;
  state.orders.push(order);
  return order;
}

export function updateOrders(state, dt) {
  // Spawn on a timer that tightens as the shift goes on, and tighter still
  // in the rush hour.
  state.spawnTimer -= dt;
  if (state.spawnTimer <= 0 && state.orders.length < MAX_ORDERS) {
    spawnOrder(state);
    const base = state.rush ? 8 : 14;
    const tighten = (1 - state.shiftLeft / 180) * 4;
    state.spawnTimer = Math.max(6, base - tighten) + state.rng() * 3;
  }

  for (const order of state.orders) {
    order.patience -= dt;
    if (order.patience < 12) order.flash += dt;
  }

  const expired = state.orders.filter((order) => order.patience <= 0);
  for (const order of expired) {
    state.orders.splice(state.orders.indexOf(order), 1);
    state.expired += 1;
    state.hearts -= 1;
    state.combo = 0;
    state.comboTimer = 0;
    addFloat(state, 640, 120, `${order.name} hangus! -1 hati`, '#e5484d');
    burst(state, 640, 120, '#e5484d', 10);
  }

  if (state.comboTimer > 0) {
    state.comboTimer -= dt;
    if (state.comboTimer <= 0) state.combo = 0;
  }
}

// Serve a finished plate. Returns 'served' or 'no-orders'.
export function serveDish(state, dish) {
  const at = state.orders.findIndex((order) => order.dishId === dish.id);
  if (at === -1) {
    addFloat(state, state.chef.x, state.chef.y - 40, 'Tidak ada yang pesan ini', '#e5484d');
    return 'no-orders';
  }
  const order = state.orders[at];
  state.orders.splice(at, 1);
  const patienceFraction = Math.max(0, order.patience / order.maxPatience);
  const tip = Math.round(dish.price * 0.5 * patienceFraction);
  const comboBonus = state.combo * 10;
  const earned = dish.price + tip + comboBonus;
  state.coins += earned;
  state.score += earned + state.combo * 25;
  state.served += 1;
  state.combo += 1;
  state.comboTimer = COMBO_WINDOW_SECONDS;
  state.bestCombo = Math.max(state.bestCombo, state.combo);
  state.plate.items = [];
  state.plateOnCounter = true;
  state.chef.carrying = null;
  addFloat(state, 1113, 150, `+${earned} koin`, '#d99a2b');
  if (state.combo >= 2) {
    addFloat(state, 1113, 120, `KOMBO x${state.combo}!`, '#e5484d');
  }
  burst(state, 1113, 150, '#ffd166', 16);
  return 'served';
}

export function dishName(dishId) {
  const recipe = recipeById(dishId);
  return recipe ? recipe.name : dishId;
}
