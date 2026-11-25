// Everything the player sees: the kitchen, the food, the chef, the order
// board, the timer, and the title and game-over screens. All drawing is
// plain canvas shapes in a warm warung palette with a batik trim.

import { GAME_WIDTH, GAME_HEIGHT } from './state.js';
import { BINS, BOARDS, WOKS, PLATING, SERVICE, TRASH } from './kitchen.js';
import { INGREDIENTS, recipeById } from './recipes.js';
import { drawIngredientIcon, drawPlateWithItems, ingredientLabel } from './ingredients.js';
import { drawParticles } from './particles.js';
import { chefStationPrompt } from './chef.js';

const WOOD = '#8a5a2b';
const WOOD_DARK = '#6b4423';
const STEEL = '#c9d2d8';
const STEEL_DARK = '#9aa7b0';
const CREAM = '#f7ead0';
const TILE_A = '#f3e3c2';
const TILE_B = '#ecd9ae';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawBatikStrip(ctx, x, y, w, h) {
  ctx.save();
  ctx.fillStyle = '#7a2e1d';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#ffd166';
  const s = 14;
  for (let i = 0; i * s < w; i += 1) {
    const cx = x + i * s + s / 2;
    const cy = y + h / 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy - s / 2 + 2);
    ctx.lineTo(cx + s / 2 - 2, cy);
    ctx.lineTo(cx, cy + s / 2 - 2);
    ctx.lineTo(cx - s / 2 + 2, cy);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawFloor(ctx) {
  ctx.fillStyle = TILE_A;
  ctx.fillRect(0, 72, GAME_WIDTH, GAME_HEIGHT - 72);
  ctx.fillStyle = TILE_B;
  const tile = 64;
  for (let ty = 72; ty < GAME_HEIGHT; ty += tile) {
    for (let tx = 0; tx < GAME_WIDTH; tx += tile) {
      if (((tx / tile) + (ty / tile)) % 2 === 0) {
        ctx.fillRect(tx, ty, tile, tile);
      }
    }
  }
  ctx.strokeStyle = 'rgba(138,90,43,0.25)';
  ctx.lineWidth = 1;
  for (let tx = 0; tx <= GAME_WIDTH; tx += tile) {
    ctx.beginPath();
    ctx.moveTo(tx, 72);
    ctx.lineTo(tx, GAME_HEIGHT);
    ctx.stroke();
  }
  for (let ty = 72; ty <= GAME_HEIGHT; ty += tile) {
    ctx.beginPath();
    ctx.moveTo(0, ty);
    ctx.lineTo(GAME_WIDTH, ty);
    ctx.stroke();
  }
  drawBatikStrip(ctx, 0, 72, GAME_WIDTH, 16);
  drawFloorDecor(ctx);
}

function drawFloorDecor(ctx) {
  // A batik rug in the middle of the floor, a potted plant, and crates, so
  // the walkable floor reads as a lived-in kitchen and not bare tiles.
  ctx.save();
  ctx.fillStyle = '#7a2e1d';
  roundRect(ctx, 430, 520, 420, 160, 12);
  ctx.fill();
  ctx.strokeStyle = '#ffd166';
  ctx.lineWidth = 3;
  roundRect(ctx, 442, 532, 396, 136, 8);
  ctx.stroke();
  ctx.fillStyle = '#ffd166';
  const s = 22;
  for (let i = 0; i < 16; i += 1) {
    const cx = 470 + (i % 8) * 44;
    const cy = 556 + Math.floor(i / 8) * 88;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 8);
    ctx.lineTo(cx + 8, cy);
    ctx.lineTo(cx, cy + 8);
    ctx.lineTo(cx - 8, cy);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = '#f5e9d3';
  ctx.font = 'bold 26px Trebuchet MS, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('DAPUR KILAT', 640, 600);
  ctx.font = 'bold 13px Trebuchet MS, sans-serif';
  ctx.fillStyle = '#ffd166';
  ctx.fillText('★ GOLDEN WOK ★', 640, 632);

  // Potted plant, bottom left.
  ctx.fillStyle = '#b3541e';
  ctx.beginPath();
  ctx.moveTo(52, 716);
  ctx.lineTo(92, 716);
  ctx.lineTo(86, 752);
  ctx.lineTo(58, 752);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#4e8f3a';
  for (let i = 0; i < 5; i += 1) {
    ctx.beginPath();
    ctx.ellipse(72 + (i - 2) * 10, 700 - (i % 2) * 12, 9, 18, (i - 2) * 0.35, 0, Math.PI * 2);
    ctx.fill();
  }

  // Crates, bottom right.
  ctx.fillStyle = '#a8763e';
  ctx.fillRect(1150, 700, 64, 52);
  ctx.fillRect(1180, 648, 56, 48);
  ctx.strokeStyle = '#6b4423';
  ctx.lineWidth = 3;
  ctx.strokeRect(1150, 700, 64, 52);
  ctx.strokeRect(1180, 648, 56, 48);
  ctx.beginPath();
  ctx.moveTo(1150, 700);
  ctx.lineTo(1214, 752);
  ctx.moveTo(1214, 700);
  ctx.lineTo(1150, 752);
  ctx.stroke();
  ctx.fillStyle = '#6fbf5a';
  ctx.beginPath();
  ctx.arc(1196, 644, 8, 0, Math.PI * 2);
  ctx.arc(1212, 640, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawCounter(ctx, x, y, w, h, topColor) {
  ctx.fillStyle = WOOD_DARK;
  roundRect(ctx, x, y + 8, w, h - 8, 8);
  ctx.fill();
  ctx.fillStyle = topColor;
  roundRect(ctx, x, y, w, 22, 8);
  ctx.fill();
}

function drawBins(ctx, state) {
  for (const bin of BINS) {
    drawCounter(ctx, bin.x, bin.y, bin.w, bin.h, STEEL);
    ctx.fillStyle = '#5d6b73';
    roundRect(ctx, bin.x + 8, bin.y + 26, bin.w - 16, 34, 6);
    ctx.fill();
    drawIngredientIcon(ctx, bin.id, bin.x + bin.w / 2, bin.y + 43, 15);
    ctx.fillStyle = '#3a2a18';
    ctx.font = 'bold 13px Trebuchet MS, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(INGREDIENTS[bin.id].name, bin.x + bin.w / 2, bin.y + 70);
  }
}

function drawBoards(ctx, state) {
  for (const board of BOARDS) {
    drawCounter(ctx, board.x, board.y, board.w, board.h, '#d9a05b');
    ctx.fillStyle = '#f7ead0';
    roundRect(ctx, board.x + 14, board.y + 26, board.w - 28, 52, 6);
    ctx.fill();
    ctx.strokeStyle = '#c9a86a';
    ctx.lineWidth = 2;
    ctx.stroke();
    const slot = state.boards[board.index];
    if (slot.item) {
      drawIngredientIcon(ctx, slot.item.id, board.x + board.w / 2, board.y + 52, 20, slot.item.state);
      if (slot.progress > 0) {
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.fillRect(board.x + 24, board.y + 82, board.w - 48, 6);
        ctx.fillStyle = '#6fbf5a';
        ctx.fillRect(board.x + 24, board.y + 82, (board.w - 48) * slot.progress, 6);
      }
    } else {
      ctx.fillStyle = '#b99c6b';
      ctx.font = 'bold 14px Trebuchet MS, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('TALENAN', board.x + board.w / 2, board.y + 54);
    }
    ctx.fillStyle = '#3a2a18';
    ctx.font = 'bold 12px Trebuchet MS, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Cincang di sini', board.x + board.w / 2, board.y + 12);
  }
}

function drawWoks(ctx, state, time) {
  for (const wok of WOKS) {
    drawCounter(ctx, wok.x, wok.y, wok.w, wok.h, '#3a3f45');
    const cx = wok.x + wok.w / 2;
    const cy = wok.y + 52;
    ctx.fillStyle = '#22252a';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 62, 26, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#4a4f55';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 52, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    const slot = state.woks[wok.index];
    if (slot.item) {
      drawIngredientIcon(ctx, slot.item.id, cx, cy - 4, 18, slot.item.state === 'burnt' ? 'burnt' : slot.item.state);
      if (slot.item.state === 'burnt') {
        ctx.fillStyle = '#e5484d';
        ctx.font = 'bold 13px Trebuchet MS, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('GOSONG!', cx, cy - 30);
      } else {
        const frac = slot.cook;
        ctx.strokeStyle = 'rgba(255,255,255,0.35)';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(cx, cy, 70, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = frac >= 1 ? '#ffd166' : '#ff8c42';
        ctx.beginPath();
        ctx.arc(cx, cy, 70, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2);
        ctx.stroke();
        if (frac >= 1) {
          ctx.fillStyle = '#ffd166';
          ctx.font = 'bold 14px Trebuchet MS, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('MATANG!', cx, cy - 30);
        }
      }
    } else {
      ctx.fillStyle = '#8a939c';
      ctx.font = 'bold 14px Trebuchet MS, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('WAJAN', cx, cy + 4);
    }
    // Burner flames.
    const flicker = 0.6 + Math.sin(time * 9 + wok.index * 2) * 0.4;
    ctx.fillStyle = `rgba(255,140,66,${0.5 + flicker * 0.4})`;
    ctx.beginPath();
    ctx.ellipse(cx - 24, wok.y + wok.h - 6, 12, 5 + flicker * 3, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 24, wok.y + wok.h - 6, 12, 5 + flicker * 3, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPlating(ctx, state) {
  drawCounter(ctx, PLATING.x, PLATING.y, PLATING.w, PLATING.h, STEEL);
  ctx.fillStyle = '#3a2a18';
  ctx.font = 'bold 13px Trebuchet MS, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('PIRING SAJI', PLATING.x + PLATING.w / 2, PLATING.y + 12);
  if (state.plateOnCounter) {
    drawPlateWithItems(ctx, state.plate.items, PLATING.x + 90, PLATING.y + 54, 34);
    if (state.plate.items.length > 0) {
      ctx.fillStyle = '#3a2a18';
      ctx.font = '12px Trebuchet MS, sans-serif';
      ctx.textAlign = 'left';
      state.plate.items.forEach((item, i) => {
        ctx.fillText(`• ${ingredientLabel(item.id, item.state)}`, PLATING.x + 140, PLATING.y + 34 + i * 16);
      });
    } else {
      ctx.fillStyle = '#7a6a55';
      ctx.font = '13px Trebuchet MS, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('Piring kosong — taruh bahan di sini', PLATING.x + 140, PLATING.y + 54);
    }
  } else {
    ctx.fillStyle = '#7a6a55';
    ctx.font = '13px Trebuchet MS, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Piring sedang dibawa chef', PLATING.x + PLATING.w / 2, PLATING.y + 54);
  }
}

function drawServiceAndTrash(ctx, state) {
  drawCounter(ctx, SERVICE.x, SERVICE.y, SERVICE.w, SERVICE.h, '#b3541e');
  ctx.fillStyle = '#fff3e0';
  ctx.font = 'bold 16px Trebuchet MS, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('JENDELA SAJI  •  SERVE HERE', SERVICE.x + SERVICE.w / 2, SERVICE.y + 34);
  ctx.fillStyle = '#ffd166';
  ctx.beginPath();
  ctx.arc(SERVICE.x + SERVICE.w - 40, SERVICE.y + 52, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#7a2e1d';
  ctx.fillRect(SERVICE.x + SERVICE.w - 52, SERVICE.y + 60, 24, 5);
  ctx.fillStyle = '#fff3e0';
  ctx.font = '13px Trebuchet MS, sans-serif';
  ctx.fillText('Sajikan hidangan yang selesai di sini', SERVICE.x + SERVICE.w / 2, SERVICE.y + 66);

  drawCounter(ctx, TRASH.x, TRASH.y, TRASH.w, TRASH.h, '#5d6b73');
  ctx.fillStyle = '#3a444a';
  roundRect(ctx, TRASH.x + 22, TRASH.y + 26, TRASH.w - 44, 40, 6);
  ctx.fill();
  ctx.fillStyle = '#f5e9d3';
  ctx.font = 'bold 13px Trebuchet MS, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SAMPAH', TRASH.x + TRASH.w / 2, TRASH.y + 47);
}

function drawOrders(ctx, state) {
  ctx.fillStyle = '#7a2e1d';
  roundRect(ctx, 12, 8, 716, 58, 8);
  ctx.fill();
  ctx.fillStyle = '#ffd166';
  ctx.font = 'bold 13px Trebuchet MS, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('PESANAN', 24, 20);
  if (state.orders.length === 0) {
    ctx.fillStyle = '#f5e9d3';
    ctx.font = '13px Trebuchet MS, sans-serif';
    ctx.fillText('Belum ada pesanan — bersiaplah!', 24, 44);
    return;
  }
  state.orders.forEach((order, i) => {
    const x = 16 + i * 176;
    const y = 28;
    const w = 168;
    const h = 34;
    const frac = Math.max(0, order.patience / order.maxPatience);
    const low = order.patience < 12;
    const flashing = low && Math.floor(state.time * 4) % 2 === 0;
    ctx.fillStyle = flashing ? '#8f2f24' : '#fdf6e3';
    roundRect(ctx, x, y, w, h, 6);
    ctx.fill();
    const recipe = recipeById(order.dishId);
    ctx.fillStyle = flashing ? '#fdf6e3' : '#3a2a18';
    ctx.font = 'bold 14px Trebuchet MS, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(order.name, x + 8, y + 11);
    if (recipe) {
      recipe.needs.forEach((need, j) => {
        drawIngredientIcon(ctx, need[0], x + 16 + j * 26, y + 26, 9, need[1]);
      });
    }
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(x + 8, y + h - 6, w - 16, 4);
    ctx.fillStyle = frac > 0.5 ? '#6fbf5a' : frac > 0.25 ? '#f0a832' : '#e5484d';
    ctx.fillRect(x + 8, y + h - 6, (w - 16) * frac, 4);
  });
}

function drawHud(ctx, state) {
  const minutes = Math.floor(state.shiftLeft / 60);
  const seconds = Math.floor(state.shiftLeft % 60);
  const timeText = `${minutes}:${String(seconds).padStart(2, '0')}`;
  ctx.fillStyle = '#241a12';
  roundRect(ctx, 744, 8, 520, 58, 8);
  ctx.fill();
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillStyle = state.shiftLeft <= 30 ? '#ff6b5e' : '#f5e9d3';
  ctx.font = 'bold 26px Trebuchet MS, sans-serif';
  ctx.fillText(`⏱ ${timeText}`, 760, 38);
  ctx.fillStyle = '#ffd166';
  ctx.font = 'bold 20px Trebuchet MS, sans-serif';
  ctx.fillText(`🪙 ${state.coins}`, 900, 38);
  ctx.fillStyle = '#f5e9d3';
  ctx.font = 'bold 18px Trebuchet MS, sans-serif';
  ctx.fillText(`Skor ${state.score}`, 1010, 38);
  ctx.fillStyle = state.combo >= 2 ? '#ff8c42' : '#8a7a63';
  ctx.font = 'bold 18px Trebuchet MS, sans-serif';
  ctx.fillText(state.combo >= 2 ? `KOMBO x${state.combo}` : 'Kombo —', 1130, 38);
  ctx.font = '18px Trebuchet MS, sans-serif';
  let hearts = '';
  for (let i = 0; i < 3; i += 1) hearts += i < state.hearts ? '❤' : '♡';
  ctx.fillStyle = '#ff6b7a';
  ctx.fillText(hearts, 1130, 58);
  ctx.fillStyle = '#8a7a63';
  ctx.font = '12px Trebuchet MS, sans-serif';
  ctx.fillText('Shift 3 menit', 760, 58);

  if (state.rush && state.phase === 'play') {
    ctx.save();
    ctx.globalAlpha = 0.9 + Math.sin(state.time * 6) * 0.1;
    ctx.fillStyle = '#e5484d';
    ctx.font = 'bold 22px Trebuchet MS, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🔥 RUSH HOUR — PESANAN MEMBLUDAK! 🔥', GAME_WIDTH / 2, 470);
    ctx.restore();
  }
  if (state.banner && state.time < state.banner.until) {
    ctx.save();
    ctx.fillStyle = 'rgba(36,26,18,0.85)';
    roundRect(ctx, GAME_WIDTH / 2 - 260, 396, 520, 64, 10);
    ctx.fill();
    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 24px Trebuchet MS, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(state.banner.text, GAME_WIDTH / 2, 420);
    ctx.fillStyle = '#f5e9d3';
    ctx.font = '15px Trebuchet MS, sans-serif';
    ctx.fillText(state.banner.sub, GAME_WIDTH / 2, 444);
    ctx.restore();
  }
}

function drawChef(ctx, state) {
  const chef = state.chef;
  const bob = chef.moving ? Math.sin(chef.walkPhase) * 3 : 0;
  ctx.save();
  ctx.translate(chef.x, chef.y + bob * 0.4);
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath();
  ctx.ellipse(0, 20, 22, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  // Body: white coat with red apron.
  ctx.fillStyle = '#fdfbf6';
  ctx.beginPath();
  ctx.arc(0, 2, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#c0392b';
  ctx.beginPath();
  ctx.moveTo(-12, -6);
  ctx.lineTo(12, -6);
  ctx.lineTo(9, 18);
  ctx.lineTo(-9, 18);
  ctx.closePath();
  ctx.fill();
  // Head and tall chef hat.
  ctx.fillStyle = '#f2c89b';
  ctx.beginPath();
  ctx.arc(0, -16, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fdfbf6';
  ctx.beginPath();
  ctx.ellipse(0, -28, 14, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(-11, -36, 22, 10);
  ctx.fillStyle = '#3a2a18';
  ctx.beginPath();
  ctx.arc(-4, -17, 1.8, 0, Math.PI * 2);
  ctx.arc(5, -17, 1.8, 0, Math.PI * 2);
  ctx.fill();
  // Arms point toward the facing direction.
  ctx.strokeStyle = '#fdfbf6';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(chef.dirX * 18, chef.dirY * 14 + 2);
  ctx.stroke();
  // Carried item floats above the hat.
  if (chef.carrying) {
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath();
    ctx.arc(0, -52, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#d8c49a';
    ctx.lineWidth = 2;
    ctx.stroke();
    if (chef.carrying.kind === 'plate') {
      drawPlateWithItems(ctx, state.plate.items, 0, -52, 15);
    } else {
      drawIngredientIcon(ctx, chef.carrying.id, 0, -52, 13, chef.carrying.state);
    }
  }
  // Chop animation: a knife flashing over the board.
  if (chef.chopAnim > 0) {
    ctx.save();
    ctx.translate(chef.dirX * 26, chef.dirY * 20 - 8);
    ctx.rotate(0.7);
    ctx.fillStyle = '#c9d2d8';
    ctx.fillRect(-2, -14, 5, 22);
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(-2, 8, 5, 8);
    ctx.restore();
  }
  ctx.restore();
}

function drawPrompt(ctx, state) {
  const prompt = chefStationPrompt(state);
  if (!prompt || state.phase !== 'play') return;
  ctx.save();
  ctx.font = 'bold 15px Trebuchet MS, sans-serif';
  const w = ctx.measureText(prompt.text).width + 24;
  ctx.fillStyle = 'rgba(36,26,18,0.88)';
  roundRect(ctx, prompt.x - w / 2, prompt.y - 16, w, 28, 14);
  ctx.fill();
  ctx.fillStyle = '#ffd166';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(prompt.text, prompt.x, prompt.y - 1);
  ctx.restore();
}

function drawTitle(ctx, state) {
  ctx.fillStyle = 'rgba(36,26,18,0.72)';
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd166';
  ctx.font = 'bold 84px Trebuchet MS, sans-serif';
  ctx.fillText('GOLDEN WOK', GAME_WIDTH / 2, 250);
  ctx.fillStyle = '#f5e9d3';
  ctx.font = 'bold 34px Trebuchet MS, sans-serif';
  ctx.fillText('— DAPUR KILAT —', GAME_WIDTH / 2, 305);
  ctx.font = '20px Trebuchet MS, sans-serif';
  ctx.fillText('Ambil bahan, cincang, masak di wajan, sajikan sebelum pelanggan kabur.', GAME_WIDTH / 2, 360);
  ctx.fillText('WASD / panah untuk jalan  •  E untuk berinteraksi  •  tekan E berulang untuk mencincang', GAME_WIDTH / 2, 392);
  ctx.fillText('Sajikan beruntun untuk kombo. Shift 3 menit. Rush hour di menit terakhir!', GAME_WIDTH / 2, 424);
  const blink = Math.floor(state.time * 2) % 2 === 0;
  if (blink) {
    ctx.fillStyle = '#ff8c42';
    ctx.font = 'bold 26px Trebuchet MS, sans-serif';
    ctx.fillText('Tekan ENTER atau klik untuk mulai', GAME_WIDTH / 2, 500);
  }
  ctx.restore();
}

function drawGameOver(ctx, state) {
  ctx.fillStyle = 'rgba(36,26,18,0.78)';
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd166';
  ctx.font = 'bold 64px Trebuchet MS, sans-serif';
  ctx.fillText(state.hearts <= 0 ? 'DAPUR TUTUP!' : 'SHIFT SELESAI!', GAME_WIDTH / 2, 250);
  ctx.fillStyle = '#f5e9d3';
  ctx.font = '24px Trebuchet MS, sans-serif';
  ctx.fillText(`Hidangan tersaji: ${state.served}    •    Hangus: ${state.expired}`, GAME_WIDTH / 2, 320);
  ctx.fillText(`Kombo terbaik: x${state.bestCombo}    •    Koin: ${state.coins}`, GAME_WIDTH / 2, 360);
  ctx.fillStyle = '#ffd166';
  ctx.font = 'bold 44px Trebuchet MS, sans-serif';
  ctx.fillText(`SKOR ${state.score}`, GAME_WIDTH / 2, 430);
  const blink = Math.floor(state.time * 2) % 2 === 0;
  if (blink) {
    ctx.fillStyle = '#ff8c42';
    ctx.font = 'bold 24px Trebuchet MS, sans-serif';
    ctx.fillText('Tekan R untuk shift berikutnya', GAME_WIDTH / 2, 500);
  }
  ctx.restore();
}

export function render(ctx, state) {
  drawFloor(ctx);
  drawBins(ctx, state);
  drawBoards(ctx, state);
  drawWoks(ctx, state, state.time);
  drawPlating(ctx, state);
  drawServiceAndTrash(ctx, state);
  drawOrders(ctx, state);
  drawHud(ctx, state);
  if (state.phase !== 'title') drawChef(ctx, state);
  drawParticles(ctx, state);
  drawPrompt(ctx, state);
  if (state.phase === 'title') drawTitle(ctx, state);
  if (state.phase === 'over') drawGameOver(ctx, state);
}
