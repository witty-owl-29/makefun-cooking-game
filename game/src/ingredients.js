// Drawing for ingredients and finished dishes. Every piece of food in the
// game is drawn here with plain canvas shapes, so the same drawing shows in
// the bins, on the boards, in the woks, on the plate and on the order tickets.

import { INGREDIENTS } from './recipes.js';

// Draw one ingredient icon centred at (x, y) with the given radius. State
// changes the look: raw is plain, chopped is cut into pieces, cooked is
// golden-brown, burnt is blackened.
export function drawIngredientIcon(ctx, id, x, y, radius, state = 'raw') {
  const r = radius;
  ctx.save();
  ctx.translate(x, y);
  if (state === 'burnt') {
    ctx.fillStyle = '#2b2320';
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#4a3a32';
    ctx.beginPath();
    ctx.arc(-r * 0.3, -r * 0.25, r * 0.35, 0, Math.PI * 2);
    ctx.arc(r * 0.3, r * 0.2, r * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  if (id === 'rice') {
    ctx.fillStyle = state === 'cooked' ? '#f0c96a' : '#fbf7ea';
    ctx.beginPath();
    ctx.arc(0, r * 0.25, r * 0.85, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-r * 0.45, r * 0.1, r * 0.5, 0, Math.PI * 2);
    ctx.arc(r * 0.45, r * 0.05, r * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = state === 'cooked' ? '#d99a2b' : '#e3d9b8';
    for (let i = 0; i < 5; i += 1) {
      ctx.fillRect(-r * 0.6 + i * r * 0.3, -r * 0.5 + (i % 2) * r * 0.2, r * 0.12, r * 0.12);
    }
  } else if (id === 'noodle') {
    ctx.strokeStyle = state === 'cooked' ? '#e0a92e' : '#f2c94c';
    ctx.lineWidth = r * 0.28;
    ctx.lineCap = 'round';
    for (let i = 0; i < 3; i += 1) {
      ctx.beginPath();
      ctx.moveTo(-r * 0.8, -r * 0.5 + i * r * 0.5);
      ctx.quadraticCurveTo(0, -r * 0.9 + i * r * 0.5, r * 0.8, -r * 0.5 + i * r * 0.5);
      ctx.stroke();
    }
  } else if (id === 'chicken') {
    const meat = state === 'cooked' ? '#c97b3d' : '#f2a594';
    if (state === 'chopped') {
      ctx.fillStyle = meat;
      for (let i = 0; i < 3; i += 1) {
        ctx.beginPath();
        ctx.arc(-r * 0.5 + i * r * 0.5, (i % 2 === 0 ? -r * 0.3 : r * 0.35), r * 0.34, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      ctx.fillStyle = meat;
      ctx.beginPath();
      ctx.ellipse(0, r * 0.1, r * 0.75, r * 0.6, -0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fdf6e3';
      ctx.lineWidth = r * 0.22;
      ctx.beginPath();
      ctx.moveTo(r * 0.55, -r * 0.35);
      ctx.lineTo(r * 0.95, -r * 0.8);
      ctx.stroke();
      ctx.fillStyle = '#fdf6e3';
      ctx.beginPath();
      ctx.arc(r * 0.98, -r * 0.85, r * 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (id === 'veg') {
    const leaf = state === 'cooked' ? '#4e8f3a' : '#6fbf5a';
    if (state === 'chopped') {
      ctx.fillStyle = leaf;
      for (let i = 0; i < 4; i += 1) {
        ctx.save();
        ctx.translate(-r * 0.55 + (i % 2) * r * 0.9, -r * 0.45 + Math.floor(i / 2) * r * 0.85);
        ctx.rotate(i * 0.8);
        ctx.fillRect(-r * 0.35, -r * 0.14, r * 0.7, r * 0.28);
        ctx.restore();
      }
    } else {
      ctx.fillStyle = leaf;
      ctx.beginPath();
      ctx.ellipse(-r * 0.25, 0, r * 0.55, r * 0.8, -0.5, 0, Math.PI * 2);
      ctx.ellipse(r * 0.35, -r * 0.1, r * 0.5, r * 0.7, 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#3f7a2e';
      ctx.lineWidth = r * 0.1;
      ctx.beginPath();
      ctx.moveTo(-r * 0.25, -r * 0.7);
      ctx.lineTo(-r * 0.25, r * 0.7);
      ctx.stroke();
    }
  } else if (id === 'egg') {
    ctx.fillStyle = '#fffdf4';
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.95, r * 0.75, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = state === 'cooked' ? '#f0a832' : '#ffcf4d';
    ctx.beginPath();
    ctx.arc(r * 0.1, -r * 0.05, r * 0.42, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.beginPath();
    ctx.arc(r * 0.0, -r * 0.15, r * 0.14, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'chilli') {
    const red = state === 'chopped' ? '#d63a3a' : '#e5484d';
    if (state === 'chopped') {
      ctx.fillStyle = red;
      for (let i = 0; i < 3; i += 1) {
        ctx.beginPath();
        ctx.arc(-r * 0.5 + i * r * 0.5, (i % 2 === 0 ? -r * 0.3 : r * 0.3), r * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#fff3c4';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.12, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.strokeStyle = red;
      ctx.lineWidth = r * 0.42;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-r * 0.7, -r * 0.55);
      ctx.quadraticCurveTo(r * 0.2, r * 0.7, r * 0.75, -r * 0.35);
      ctx.stroke();
      ctx.strokeStyle = '#3f7a2e';
      ctx.lineWidth = r * 0.18;
      ctx.beginPath();
      ctx.moveTo(-r * 0.7, -r * 0.55);
      ctx.lineTo(-r * 0.95, -r * 0.85);
      ctx.stroke();
    }
  } else if (id === 'sauce') {
    ctx.fillStyle = '#8a5a2b';
    ctx.beginPath();
    ctx.moveTo(-r * 0.45, -r * 0.9);
    ctx.lineTo(r * 0.45, -r * 0.9);
    ctx.lineTo(r * 0.55, r * 0.6);
    ctx.quadraticCurveTo(r * 0.55, r * 0.95, 0, r * 0.95);
    ctx.quadraticCurveTo(-r * 0.55, r * 0.95, -r * 0.55, r * 0.6);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#d99a2b';
    ctx.fillRect(-r * 0.3, -r * 0.9, r * 0.6, r * 0.22);
    ctx.fillStyle = '#f7ead0';
    ctx.font = `bold ${Math.round(r * 0.7)}px Trebuchet MS, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('S', 0, r * 0.15);
  }
  ctx.restore();
}

// A plate holding its items, drawn as a white plate with the food on it.
export function drawPlateWithItems(ctx, items, x, y, radius) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#fdfbf6';
  ctx.beginPath();
  ctx.ellipse(0, 0, radius, radius * 0.82, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#d8c49a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, 0, radius * 0.78, radius * 0.62, 0, 0, Math.PI * 2);
  ctx.stroke();
  const slots = [
    [-radius * 0.38, -radius * 0.18],
    [radius * 0.38, -radius * 0.18],
    [-radius * 0.38, radius * 0.28],
    [radius * 0.38, radius * 0.28],
  ];
  items.forEach((item, i) => {
    const [sx, sy] = slots[i % slots.length];
    drawIngredientIcon(ctx, item.id, sx, sy, radius * 0.34, item.state);
  });
  ctx.restore();
}

// The small label under an ingredient icon.
export function ingredientLabel(id, state) {
  const base = INGREDIENTS[id].name;
  if (state === 'chopped') return `${base} cincang`;
  if (state === 'cooked') return `${base} masak`;
  if (state === 'burnt') return `${base} gosong`;
  return base;
}
