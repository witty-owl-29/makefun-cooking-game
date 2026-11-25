// The kitchen floor plan: where every station stands, what blocks the chef,
// and which station the chef is close enough to use.

import { INGREDIENT_IDS } from './recipes.js';

export const FLOOR = { x: 16, y: 168, w: 1248, h: 616 };
export const HUD_HEIGHT = 72;

// Ingredient bins along the top counter, left to right.
export const BINS = INGREDIENT_IDS.map((id, i) => ({
  kind: 'bin',
  id,
  x: 16 + i * 118,
  y: 88,
  w: 108,
  h: 80,
}));

export const TRASH = { kind: 'trash', x: 848, y: 88, w: 98, h: 80 };
export const SERVICE = { kind: 'service', x: 962, y: 88, w: 302, h: 80 };
export const BOARDS = [
  { kind: 'board', index: 0, x: 16, y: 276, w: 200, h: 92 },
  { kind: 'board', index: 1, x: 232, y: 276, w: 200, h: 92 },
];
export const WOKS = [
  { kind: 'wok', index: 0, x: 560, y: 276, w: 180, h: 92 },
  { kind: 'wok', index: 1, x: 756, y: 276, w: 180, h: 92 },
];
export const PLATING = { kind: 'plating', x: 952, y: 276, w: 312, h: 92 };

// Every solid rectangle the chef cannot walk through.
export function solidRects() {
  return [
    ...BINS,
    TRASH,
    SERVICE,
    ...BOARDS,
    ...WOKS,
    PLATING,
  ];
}

export function allStations() {
  return [
    ...BINS,
    TRASH,
    SERVICE,
    ...BOARDS,
    ...WOKS,
    PLATING,
  ];
}

function rectCenter(rect) {
  return { x: rect.x + rect.w / 2, y: rect.y + rect.h / 2 };
}

function distanceToRect(x, y, rect) {
  const cx = Math.max(rect.x, Math.min(x, rect.x + rect.w));
  const cy = Math.max(rect.y, Math.min(y, rect.y + rect.h));
  return Math.hypot(x - cx, y - cy);
}

// The nearest station within reach of the chef, or null.
export function nearestStation(x, y, reach = 78) {
  let best = null;
  let bestDistance = Infinity;
  for (const station of allStations()) {
    const d = distanceToRect(x, y, station);
    if (d < bestDistance) {
      bestDistance = d;
      best = station;
    }
  }
  return bestDistance <= reach ? best : null;
}

// Push a circle out of every solid rectangle and keep it inside the floor.
export function collideCircle(state, x, y, radius) {
  let px = Math.max(FLOOR.x + radius, Math.min(x, FLOOR.x + FLOOR.w - radius));
  let py = Math.max(FLOOR.y + radius, Math.min(y, FLOOR.y + FLOOR.h - radius));
  for (const rect of solidRects()) {
    const closestX = Math.max(rect.x, Math.min(px, rect.x + rect.w));
    const closestY = Math.max(rect.y, Math.min(py, rect.y + rect.h));
    const dx = px - closestX;
    const dy = py - closestY;
    const distSq = dx * dx + dy * dy;
    if (distSq < radius * radius) {
      if (distSq === 0) {
        py = rect.y + rect.h + radius;
      } else {
        const dist = Math.sqrt(distSq);
        px = closestX + (dx / dist) * radius;
        py = closestY + (dy / dist) * radius;
      }
    }
  }
  return { x: px, y: py };
}

export function stationLabel(station) {
  if (station.kind === 'bin') return station.id;
  if (station.kind === 'board') return 'Talenan';
  if (station.kind === 'wok') return 'Wajan';
  if (station.kind === 'plating') return 'Piring saji';
  if (station.kind === 'service') return 'Jendela saji';
  if (station.kind === 'trash') return 'Tempat sampah';
  return '';
}

export function stationCenter(station) {
  return rectCenter(station);
}
