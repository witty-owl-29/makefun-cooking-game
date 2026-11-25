// Particles and floating texts: steam over the woks, sizzle sparks, the
// burst when a dish is served, and the little popups that say what happened.

export function addFloat(state, x, y, text, color) {
  state.floats.push({ x, y, text, color, life: 1.4, maxLife: 1.4 });
}

export function burst(state, x, y, color, count) {
  for (let i = 0; i < count; i += 1) {
    const angle = (i / count) * Math.PI * 2 + state.rng() * 0.5;
    const speed = 40 + state.rng() * 90;
    state.particles.push({
      kind: 'spark',
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 30,
      life: 0.6 + state.rng() * 0.4,
      maxLife: 1,
      size: 2 + state.rng() * 3,
      color,
    });
  }
}

export function steamPuff(state, x, y) {
  state.particles.push({
    kind: 'steam',
    x: x + (state.rng() - 0.5) * 30,
    y,
    vx: (state.rng() - 0.5) * 12,
    vy: -28 - state.rng() * 22,
    life: 1.1 + state.rng() * 0.5,
    maxLife: 1.6,
    size: 7 + state.rng() * 8,
    color: '#ffffff',
  });
}

export function chopChip(state, x, y, color) {
  for (let i = 0; i < 5; i += 1) {
    state.particles.push({
      kind: 'chip',
      x,
      y,
      vx: (state.rng() - 0.5) * 120,
      vy: -40 - state.rng() * 70,
      life: 0.5,
      maxLife: 0.5,
      size: 2 + state.rng() * 2,
      color,
    });
  }
}

export function updateParticles(state, dt) {
  for (const p of state.particles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += p.kind === 'steam' ? -6 * dt : 220 * dt;
    p.life -= dt;
  }
  state.particles = state.particles.filter((p) => p.life > 0);
  for (const f of state.floats) {
    f.y -= 34 * dt;
    f.life -= dt;
  }
  state.floats = state.floats.filter((f) => f.life > 0);
}

export function drawParticles(ctx, state) {
  for (const p of state.particles) {
    const alpha = Math.max(0, p.life / p.maxLife);
    ctx.save();
    if (p.kind === 'steam') {
      ctx.globalAlpha = alpha * 0.45;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (1.6 - alpha * 0.6), 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const f of state.floats) {
    const alpha = Math.max(0, f.life / f.maxLife);
    ctx.globalAlpha = alpha;
    ctx.font = 'bold 20px Trebuchet MS, sans-serif';
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(40,20,8,0.85)';
    ctx.strokeText(f.text, f.x, f.y);
    ctx.fillStyle = f.color;
    ctx.fillText(f.text, f.x, f.y);
  }
  ctx.restore();
}
