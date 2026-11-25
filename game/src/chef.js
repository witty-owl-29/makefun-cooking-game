// The chef: walking, carrying one thing, and every interaction with a
// station. One action per station, decided by what the chef holds and what
// the station holds.

import { INGREDIENTS, completedDish } from './recipes.js';
import { collideCircle, nearestStation, stationCenter } from './kitchen.js';
import { addFloat, chopChip } from './particles.js';

export function moveChef(state, dt, input) {
  const chef = state.chef;
  let mx = 0;
  let my = 0;
  if (input.left) mx -= 1;
  if (input.right) mx += 1;
  if (input.up) my -= 1;
  if (input.down) my += 1;

  // Click-to-move: walk toward the target until close, then stop.
  if (mx === 0 && my === 0 && chef.target) {
    const dx = chef.target.x - chef.x;
    const dy = chef.target.y - chef.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 10) {
      const station = chef.target.station;
      chef.target = null;
      if (station) interactWithStation(state, station);
    } else {
      mx = dx / dist;
      my = dy / dist;
    }
  }

  const len = Math.hypot(mx, my);
  if (len > 0) {
    const nx = chef.x + (mx / len) * chef.speed * dt;
    const ny = chef.y + (my / len) * chef.speed * dt;
    const fixed = collideCircle(state, nx, ny, chef.radius);
    chef.x = fixed.x;
    chef.y = fixed.y;
    chef.dirX = mx / len;
    chef.dirY = my / len;
    chef.moving = true;
    chef.walkPhase += dt * 11;
  } else {
    chef.moving = false;
  }
}

// What the interact key does at the nearest station.
export function interact(state) {
  const station = nearestStation(state.chef.x, state.chef.y);
  if (!station) return;
  interactWithStation(state, station);
}

function interactWithStation(state, station) {
  const chef = state.chef;
  if (station.kind === 'bin') return grabFromBin(state, station.id);
  if (station.kind === 'board') return useBoard(state, station.index);
  if (station.kind === 'wok') return useWok(state, station.index);
  if (station.kind === 'plating') return usePlating(state);
  if (station.kind === 'service') return serveAtWindow(state);
  if (station.kind === 'trash') return useTrash(state);
  return null;
}

function grabFromBin(state, id) {
  const chef = state.chef;
  if (chef.carrying) {
    addFloat(state, chef.x, chef.y - 40, 'Tangan penuh!', '#e5484d');
    return 'hands-full';
  }
  chef.carrying = { kind: 'ingredient', id, state: 'raw' };
  return 'grab';
}

function useBoard(state, index) {
  const chef = state.chef;
  const board = state.boards[index];
  if (board.item && !chef.carrying) {
    const def = INGREDIENTS[board.item.id];
    if (def.chop && board.item.state === 'raw') {
      // One press of E is one chop. Three chops finish the job.
      board.progress = Math.min(1, board.progress + 0.34);
      chef.chopAnim = 0.12;
      chopChip(state, chef.x, chef.y - 24, INGREDIENTS[board.item.id].color);
      if (board.progress >= 1) {
        board.item.state = 'chopped';
        board.progress = 0;
        addFloat(state, board.x + board.w / 2, board.y - 8, 'Cincang!', '#6fbf5a');
      }
      return 'chop';
    }
    chef.carrying = board.item;
    board.item = null;
    board.progress = 0;
    return 'grab';
  }
  if (!board.item && chef.carrying && chef.carrying.kind === 'ingredient') {
    const def = INGREDIENTS[chef.carrying.id];
    if (!def.chop || chef.carrying.state !== 'raw') {
      addFloat(state, chef.x, chef.y - 40, 'Tidak perlu dicincang', '#e5484d');
      return 'no-chop';
    }
    board.item = chef.carrying;
    board.progress = 0;
    chef.carrying = null;
    return 'place';
  }
  return null;
}

// Chopping is one press of E per chop, handled inside useBoard: the press
// that starts a hold must not also pick the ingredient back up, so there is
// no hold-to-chop path at all.

function useWok(state, index) {
  const chef = state.chef;
  const wok = state.woks[index];
  if (wok.item && !chef.carrying) {
    if (wok.item.state === 'burnt') {
      // A burnt piece can be picked up so it can be thrown away.
      addFloat(state, chef.x, chef.y - 40, 'Gosong! Buang dulu', '#e5484d');
      chef.carrying = wok.item;
      state.woks[index] = { item: null, cook: 0, burn: 0 };
      return 'grab';
    }
    if (wok.cook < 1) {
      addFloat(state, chef.x, chef.y - 40, 'Belum matang!', '#e5484d');
      return 'not-ready';
    }
    chef.carrying = wok.item;
    state.woks[index] = { item: null, cook: 0, burn: 0 };
    return 'grab';
  }
  if (!wok.item && chef.carrying && chef.carrying.kind === 'ingredient') {
    const def = INGREDIENTS[chef.carrying.id];
    if (!def.cook) {
      addFloat(state, chef.x, chef.y - 40, 'Tidak perlu dimasak', '#e5484d');
      return 'no-cook';
    }
    if (chef.carrying.state === 'cooked') {
      addFloat(state, chef.x, chef.y - 40, 'Sudah matang!', '#e5484d');
      return 'already-cooked';
    }
    wok.item = chef.carrying;
    wok.cook = 0;
    wok.burn = 0;
    chef.carrying = null;
    return 'place';
  }
  return null;
}

function usePlating(state) {
  const chef = state.chef;
  if (chef.carrying && chef.carrying.kind === 'plate') {
    if (state.plateOnCounter) return null;
    state.plateOnCounter = true;
    chef.carrying = null;
    return 'place';
  }
  if (chef.carrying && chef.carrying.kind === 'ingredient') {
    if (!state.plateOnCounter) {
      addFloat(state, chef.x, chef.y - 40, 'Piring sedang dibawa', '#e5484d');
      return 'no-plate';
    }
    if (state.plate.items.length >= 4) {
      addFloat(state, chef.x, chef.y - 40, 'Piring penuh!', '#e5484d');
      return 'plate-full';
    }
    state.plate.items.push(chef.carrying);
    chef.carrying = null;
    const dish = completedDish(state.plate.items);
    if (dish) addFloat(state, 1108, 180, `${dish.name} siap!`, '#d99a2b');
    return 'plate';
  }
  if (!chef.carrying && state.plateOnCounter) {
    chef.carrying = { kind: 'plate' };
    state.plateOnCounter = false;
    return 'grab';
  }
  return null;
}

function serveAtWindow(state) {
  const chef = state.chef;
  if (!chef.carrying || chef.carrying.kind !== 'plate') {
    addFloat(state, chef.x, chef.y - 40, 'Bawa piringnya dulu!', '#e5484d');
    return 'no-plate';
  }
  const dish = completedDish(state.plate.items);
  if (!dish) {
    addFloat(state, chef.x, chef.y - 40, 'Piring belum jadi hidangan!', '#e5484d');
    return 'not-a-dish';
  }
  return serveDish(state, dish);
}

function useTrash(state) {
  const chef = state.chef;
  if (chef.carrying && chef.carrying.kind === 'ingredient') {
    chef.carrying = null;
    return 'trash';
  }
  if (chef.carrying && chef.carrying.kind === 'plate') {
    state.plate.items = [];
    state.plateOnCounter = true;
    chef.carrying = null;
    addFloat(state, chef.x, chef.y - 40, 'Piring dikosongkan', '#8a5a2b');
    return 'trash';
  }
  return null;
}

// Serving is shared with orders.js through this hook to avoid a cycle.
export let serveDish = () => 'no-orders';
export function setServeDish(fn) {
  serveDish = fn;
}

export function chefStationPrompt(state) {
  const station = nearestStation(state.chef.x, state.chef.y);
  if (!station) return null;
  const chef = state.chef;
  const center = stationCenter(station);
  if (station.kind === 'bin') {
    return chef.carrying ? null : { x: center.x, y: station.y - 10, text: `E: Ambil ${INGREDIENTS[station.id].name}` };
  }
  if (station.kind === 'board') {
    const board = state.boards[station.index];
    if (board.item) {
      const def = INGREDIENTS[board.item.id];
      if (def.chop && board.item.state === 'raw') return { x: center.x, y: station.y - 10, text: 'E: Cincang' };
      return { x: center.x, y: station.y - 10, text: 'E: Ambil' };
    }
    return chef.carrying ? { x: center.x, y: station.y - 10, text: 'E: Letakkan' } : null;
  }
  if (station.kind === 'wok') {
    const wok = state.woks[station.index];
    if (wok.item) return { x: center.x, y: station.y - 10, text: wok.cook >= 1 ? 'E: Angkat' : 'Memasak...' };
    return chef.carrying ? { x: center.x, y: station.y - 10, text: 'E: Masukkan wajan' } : null;
  }
  if (station.kind === 'plating') {
    if (chef.carrying && chef.carrying.kind === 'plate') return { x: center.x, y: station.y - 10, text: 'E: Letakkan piring' };
    if (chef.carrying) return { x: center.x, y: station.y - 10, text: 'E: Taruh di piring' };
    return { x: center.x, y: station.y - 10, text: 'E: Ambil piring' };
  }
  if (station.kind === 'service') {
    return { x: center.x, y: station.y - 10, text: 'E: Sajikan!' };
  }
  if (station.kind === 'trash') {
    return chef.carrying ? { x: center.x, y: station.y - 10, text: 'E: Buang' } : null;
  }
  return null;
}
