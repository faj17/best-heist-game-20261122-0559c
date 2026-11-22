// All drawing: the room, its people and cones, the HUD and the overlays.
// Canvas is 1280x720; the top 72 px are the HUD, the room lives below.

import { money } from './utils.js';
import { BOUNDS } from './levels.js';

const W = 1280;
const H = 720;

function cone(ctx, x, y, dir, range, half, color) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, range, dir - half, dir + half);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function drawFloor(ctx, level, floorIndex) {
  // Dark museum floor with a red carpet runner down the middle.
  ctx.fillStyle = floorIndex === 2 ? '#23262e' : '#26221f';
  ctx.fillRect(BOUNDS.x, BOUNDS.y, BOUNDS.w, BOUNDS.h);
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 1;
  for (let x = BOUNDS.x + 40; x < BOUNDS.x + BOUNDS.w; x += 40) {
    ctx.beginPath(); ctx.moveTo(x, BOUNDS.y); ctx.lineTo(x, BOUNDS.y + BOUNDS.h); ctx.stroke();
  }
  for (let y = BOUNDS.y + 40; y < BOUNDS.y + BOUNDS.h; y += 40) {
    ctx.beginPath(); ctx.moveTo(BOUNDS.x, y); ctx.lineTo(BOUNDS.x + BOUNDS.w, y); ctx.stroke();
  }
  // Carpet runner.
  ctx.fillStyle = floorIndex === 2 ? 'rgba(120,40,50,0.35)' : 'rgba(140,30,40,0.4)';
  ctx.fillRect(596, BOUNDS.y, 88, BOUNDS.h);
  ctx.strokeStyle = 'rgba(220,180,90,0.5)';
  ctx.strokeRect(596, BOUNDS.y, 88, BOUNDS.h);
  // Rooftop: helipad circle.
  if (floorIndex === 2) {
    ctx.beginPath();
    ctx.arc(640, 390, 105, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(220,180,90,0.12)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(220,180,90,0.7)';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = 'rgba(220,180,90,0.85)';
    ctx.font = 'bold 44px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('H', 640, 406);
  }
  // Gold trim around the room.
  ctx.strokeStyle = '#b98a2f';
  ctx.lineWidth = 4;
  ctx.strokeRect(BOUNDS.x, BOUNDS.y, BOUNDS.w, BOUNDS.h);
}

function drawWalls(ctx, level) {
  for (const w of level.walls) {
    ctx.fillStyle = '#3a3230';
    ctx.fillRect(w.x, w.y, w.w, w.h);
    ctx.strokeStyle = '#b98a2f';
    ctx.lineWidth = 2;
    ctx.strokeRect(w.x + 1, w.y + 1, w.w - 2, w.h - 2);
  }
}

function drawVents(ctx, level) {
  for (const v of level.vents) {
    ctx.fillStyle = '#1c1c22';
    ctx.fillRect(v.x, v.y, v.w, v.h);
    ctx.strokeStyle = '#8a8f9a';
    ctx.lineWidth = 2;
    ctx.strokeRect(v.x, v.y, v.w, v.h);
    ctx.beginPath();
    for (let i = 1; i < 4; i++) {
      ctx.moveTo(v.x + 4, v.y + (v.h / 4) * i);
      ctx.lineTo(v.x + v.w - 4, v.y + (v.h / 4) * i);
    }
    ctx.stroke();
  }
}

function drawExit(ctx, S) {
  const e = S.level.exit;
  const open = S.loot.value >= S.level.quota;
  const locked = S.alarm.lockdown;
  ctx.fillStyle = open && !locked ? '#1f7a3a' : '#5a1f24';
  ctx.fillRect(e.x, e.y, e.w, e.h);
  ctx.strokeStyle = open && !locked ? '#7dff9a' : '#c0392b';
  ctx.lineWidth = 3;
  ctx.strokeRect(e.x, e.y, e.w, e.h);
  if (open && !locked) {
    ctx.save();
    ctx.shadowColor = '#7dff9a';
    ctx.shadowBlur = 18;
    ctx.strokeStyle = '#7dff9a';
    ctx.strokeRect(e.x, e.y, e.w, e.h);
    ctx.restore();
  }
  ctx.fillStyle = '#f5e9c8';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  const labelY = e.y + e.h + 16 > BOUNDS.y + BOUNDS.h - 4 ? e.y - 8 : e.y + e.h + 16;
  ctx.fillText(open && !locked ? 'EXIT OPEN' : e.label, e.x + e.w / 2, labelY);
}

function drawLoot(ctx, S) {
  for (const it of S.loot.items) {
    if (it.taken) continue;
    ctx.save();
    ctx.translate(it.x, it.y);
    if (it.kind === 'painting') {
      ctx.fillStyle = '#b98a2f';
      ctx.fillRect(-22, -16, 44, 32);
      ctx.fillStyle = '#7a5fd0';
      ctx.fillRect(-18, -12, 36, 24);
      ctx.fillStyle = '#e8d27a';
      ctx.beginPath(); ctx.arc(-6, -2, 6, 0, Math.PI * 2); ctx.fill();
    } else if (it.kind === 'vase') {
      ctx.fillStyle = '#4a90d9';
      ctx.beginPath();
      ctx.moveTo(-8, -14); ctx.quadraticCurveTo(-16, 0, -8, 14);
      ctx.lineTo(8, 14); ctx.quadraticCurveTo(16, 0, 8, -14); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#e8d27a'; ctx.fillRect(-8, -18, 16, 5);
    } else if (it.kind === 'gold') {
      ctx.fillStyle = '#e8b73a';
      for (let i = -1; i <= 1; i++) ctx.fillRect(i * 12 - 9, -6, 16, 10);
      ctx.fillStyle = '#f7dc7d';
      ctx.fillRect(-9, -10, 16, 4);
    } else if (it.kind === 'diamond') {
      ctx.fillStyle = '#7fd4ff';
      ctx.beginPath();
      ctx.moveTo(0, -16); ctx.lineTo(13, -4); ctx.lineTo(8, 12); ctx.lineTo(-8, 12); ctx.lineTo(-13, -4);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#dff4ff'; ctx.lineWidth = 2; ctx.stroke();
    } else { // crate
      ctx.fillStyle = '#8a6a3a';
      ctx.fillRect(-18, -14, 36, 28);
      ctx.strokeStyle = '#5a4423'; ctx.lineWidth = 2;
      ctx.strokeRect(-18, -14, 36, 28);
      ctx.beginPath(); ctx.moveTo(-18, -14); ctx.lineTo(18, 14); ctx.moveTo(18, -14); ctx.lineTo(-18, 14); ctx.stroke();
    }
    ctx.restore();
    ctx.fillStyle = '#f5e9c8';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(money(it.value), it.x, it.y + 30);
  }
  for (const s of S.loot.safes) {
    ctx.fillStyle = '#2c2f36';
    ctx.fillRect(s.x - 22, s.y - 18, 44, 36);
    ctx.strokeStyle = '#b98a2f';
    ctx.lineWidth = 2;
    ctx.strokeRect(s.x - 22, s.y - 18, 44, 36);
    ctx.beginPath(); ctx.arc(s.x, s.y, 8, 0, Math.PI * 2);
    ctx.strokeStyle = '#d7d7d7'; ctx.stroke();
    ctx.fillStyle = '#f5e9c8';
    ctx.font = '10px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(s.cracked ? 'OPEN' : money(s.value), s.x, s.y + 32);
    if (S.loot.cracking === s && s.progress > 0) {
      ctx.beginPath();
      ctx.arc(s.x, s.y, 26, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * s.progress) / 3);
      ctx.strokeStyle = '#ffd34d'; ctx.lineWidth = 4; ctx.stroke();
    }
  }
}

function drawGuards(ctx, S) {
  for (const g of S.guards) {
    const alertColor = g.mode === 'chase' ? 'rgba(255,60,50,0.30)'
      : g.alert > 0.3 ? 'rgba(255,180,60,0.24)' : 'rgba(255,220,90,0.16)';
    cone(ctx, g.x, g.y, g.dir, 195, 0.62, alertColor);
    // Body: navy uniform, cap, facing tick.
    ctx.fillStyle = '#2c4a7a';
    ctx.beginPath(); ctx.arc(g.x, g.y, g.r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#9db8dd'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#1d3355';
    ctx.beginPath(); ctx.arc(g.x, g.y - 4, 7, Math.PI, 0); ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(g.x, g.y);
    ctx.lineTo(g.x + Math.cos(g.dir) * (g.r + 6), g.y + Math.sin(g.dir) * (g.r + 6));
    ctx.stroke();
    if (g.alert > 0.05) {
      ctx.fillStyle = g.mode === 'chase' ? '#ff3c32' : '#ffb43c';
      ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(g.mode === 'chase' ? '!' : '?', g.x, g.y - g.r - 8);
    }
    if (g.mode === 'investigate' && g.inv) {
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(g.x, g.y); ctx.lineTo(g.inv.x, g.inv.y); ctx.stroke();
      ctx.setLineDash([]);
    }
  }
}

function drawCameras(ctx, S) {
  for (const c of S.cameras) {
    cone(ctx, c.x, c.y, c.angle, c.range, 0.5, c.seen ? 'rgba(255,50,40,0.30)' : 'rgba(255,80,60,0.14)');
    ctx.fillStyle = '#33363d';
    ctx.fillRect(c.x - 10, c.y - 7, 20, 14);
    ctx.strokeStyle = c.seen ? '#ff3c32' : '#c0392b';
    ctx.lineWidth = 2;
    ctx.strokeRect(c.x - 10, c.y - 7, 20, 14);
    ctx.fillStyle = c.seen ? '#ff3c32' : '#ff6b5e';
    ctx.beginPath(); ctx.arc(c.x + Math.cos(c.angle) * 12, c.y + Math.sin(c.angle) * 12, 3, 0, Math.PI * 2); ctx.fill();
  }
}

function drawThief(ctx, S) {
  const t = S.thief;
  if (S.invulnTimer > 0 && Math.floor(S.time * 12) % 2 === 0) return; // blink while invulnerable
  // Shadow.
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath(); ctx.ellipse(t.x, t.y + 10, 12, 5, 0, 0, Math.PI * 2); ctx.fill();
  // Hooded figure.
  ctx.fillStyle = t.sneaking ? '#3d3350' : '#241f2e';
  ctx.beginPath(); ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#e8d27a'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#0c0a12';
  ctx.beginPath(); ctx.arc(t.x + Math.cos(t.dir) * 4, t.y + Math.sin(t.dir) * 4, 7, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#7dff9a';
  ctx.beginPath();
  ctx.arc(t.x + Math.cos(t.dir) * 7, t.y + Math.sin(t.dir) * 7, 2.5, 0, Math.PI * 2);
  ctx.fill();
  if (t.sneaking) {
    ctx.fillStyle = '#c9b8ff';
    ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('SNEAK', t.x, t.y - t.r - 8);
  }
}

function drawTools(ctx, S) {
  for (const c of S.loot.thrownCoins) {
    ctx.fillStyle = '#e8b73a';
    ctx.beginPath(); ctx.arc(c.x, c.y, 6, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(232,183,58,0.7)';
    ctx.beginPath(); ctx.arc(c.x, c.y, 12 + Math.sin(S.time * 6) * 2, 0, Math.PI * 2); ctx.stroke();
  }
  for (const s of S.loot.smokeClouds) {
    ctx.fillStyle = `rgba(200,200,210,${0.35 * (s.ttl / 5)})`;
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(220,220,230,0.25)';
    ctx.beginPath(); ctx.arc(s.x - 20, s.y + 12, s.r * 0.6, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(s.x + 24, s.y - 14, s.r * 0.55, 0, Math.PI * 2); ctx.fill();
  }
}

function drawHud(ctx, S) {
  ctx.fillStyle = '#14100e';
  ctx.fillRect(0, 0, W, 72);
  ctx.fillStyle = '#b98a2f';
  ctx.fillRect(0, 72, W, 3);
  ctx.fillStyle = '#f5e9c8';
  ctx.font = 'bold 17px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(S.level.name, 24, 30);
  ctx.font = '13px sans-serif';
  ctx.fillStyle = '#c9b8a0';
  ctx.fillText(S.level.sub, 24, 52);

  // Loot.
  ctx.textAlign = 'right';
  ctx.fillStyle = '#e8d27a';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText(`LOOT ${money(S.loot.value)} / ${money(S.level.quota)}`, 700, 30);
  ctx.fillStyle = S.loot.value >= S.level.quota ? '#7dff9a' : '#c9b8a0';
  ctx.font = '12px sans-serif';
  ctx.fillText(S.loot.value >= S.level.quota ? 'QUOTA MET — GET TO THE EXIT' : `${S.loot.takenCount} items taken`, 700, 52);

  // Alarm meter.
  const ax = 730, ay = 18, aw = 190, ah = 16;
  ctx.fillStyle = '#3a1518';
  ctx.fillRect(ax, ay, aw, ah);
  const frac = S.alarm.value / 100;
  ctx.fillStyle = frac < 0.5 ? '#e8b73a' : frac < 0.8 ? '#ff7a2a' : '#ff3c32';
  ctx.fillRect(ax, ay, aw * frac, ah);
  ctx.strokeStyle = '#f5e9c8'; ctx.lineWidth = 1;
  ctx.strokeRect(ax, ay, aw, ah);
  ctx.fillStyle = '#f5e9c8';
  ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'left';
  ctx.fillText(S.alarm.lockdown ? 'LOCKDOWN!' : `ALARM ${Math.round(S.alarm.value)}%`, ax, ay + ah + 16);

  // Hearts.
  ctx.font = '18px sans-serif';
  ctx.textAlign = 'left';
  let hx = 960;
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = i < S.hearts ? '#ff4d6d' : '#4a2a30';
    ctx.fillText('♥', hx + i * 26, 32);
  }
  // Tools.
  ctx.fillStyle = '#f5e9c8';
  ctx.font = '13px sans-serif';
  ctx.fillText(`◉ coins ${S.loot.coinsLeft}   ☁ smoke ${S.loot.smokeLeft}`, 960, 54);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#c9b8a0';
  ctx.font = '12px sans-serif';
  ctx.fillText(`TIME ${Math.floor(S.time / 60)}:${String(Math.floor(S.time % 60)).padStart(2, '0')}`, 1256, 30);
}

function overlay(ctx, title, lines, color = '#f5e9c8') {
  ctx.fillStyle = 'rgba(10,8,10,0.72)';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = color;
  ctx.font = 'bold 42px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, W / 2, H / 2 - 40);
  ctx.fillStyle = '#e8e0c8';
  ctx.font = '17px sans-serif';
  lines.forEach((l, i) => ctx.fillText(l, W / 2, H / 2 + 8 + i * 28));
}

export function draw(ctx, S) {
  ctx.clearRect(0, 0, W, H);
  if (S.phase === 'title') {
    drawFloor(ctx, S.level, S.levelIndex);
    drawWalls(ctx, S.level);
    drawLoot(ctx, S);
    drawGuards(ctx, S);
    drawCameras(ctx, S);
    drawThief(ctx, S);
    overlay(ctx, 'THE MIDNIGHT VAULT', [
      'A three-floor heist. Steal the quota, dodge the cones, reach the exit.',
      'WASD move · SHIFT sneak · E grab / crack safes · CLICK throw a coin · SPACE smoke · P pause',
      'Click anywhere to begin the job.',
    ], '#e8d27a');
    return;
  }
  drawFloor(ctx, S.level, S.levelIndex);
  drawVents(ctx, S.level);
  drawExit(ctx, S);
  drawLoot(ctx, S);
  drawTools(ctx, S);
  drawGuards(ctx, S);
  drawCameras(ctx, S);
  drawThief(ctx, S);
  drawHud(ctx, S);

  if (S.phase === 'paused') {
    overlay(ctx, 'PAUSED', ['Press P to keep working the job.']);
  } else if (S.phase === 'caught') {
    overlay(ctx, 'CAUGHT!', [`The guard dragged you back to the door. ${S.hearts} ${S.hearts === 1 ? 'heart' : 'hearts'} left.`]);
  } else if (S.phase === 'floorclear') {
    overlay(ctx, 'FLOOR CLEARED', [
      `${S.level.name} — ${money(S.loot.value)} lifted.`,
      'Click to move to the next floor.',
    ], '#7dff9a');
  } else if (S.phase === 'win') {
    overlay(ctx, 'CLEAN GETAWAY', [
      `All three floors. ${money(S.totalLoot)} lifted in ${Math.floor(S.time / 60)}:${String(Math.floor(S.time % 60)).padStart(2, '0')}.`,
      'The Midnight Vault is empty — and so is the trail. Click to play again.',
    ], '#7dff9a');
  } else if (S.phase === 'gameover') {
    overlay(ctx, 'BUSTED', [
      'Three strikes and the night is over.',
      'Click to try the job again.',
    ], '#ff6b5e');
  }
  if (S.alarm.lockdown && S.phase === 'play') {
    ctx.fillStyle = '#ff3c32';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`⚠ LOCKDOWN — EXIT SEALED ${Math.ceil(S.alarm.lockdownTimer)}s ⚠`, W / 2, 110);
  }
  if (S.toast && S.toastTimer > 0) {
    ctx.fillStyle = 'rgba(20,16,14,0.85)';
    const tw = ctx.measureText(S.toast).width + 32;
    ctx.fillRect((W - tw) / 2, H - 56, tw, 30);
    ctx.fillStyle = '#e8d27a';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(S.toast, W / 2, H - 36);
  }
}
