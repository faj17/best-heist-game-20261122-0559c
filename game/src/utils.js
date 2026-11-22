// Shared math and geometry helpers for The Midnight Vault.
// Nothing here knows about the game state; every function is pure.

export function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v;
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function dist(ax, ay, bx, by) {
  return Math.hypot(bx - ax, by - ay);
}

// Smallest signed difference between two angles, in (-PI, PI].
export function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d <= -Math.PI) d += Math.PI * 2;
  return d;
}

export function angleTo(ax, ay, bx, by) {
  return Math.atan2(by - ay, bx - ax);
}

export function money(n) {
  return '$' + Math.round(n).toLocaleString('en-US');
}

// Do two axis-aligned rectangles overlap?
export function rectsHit(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

export function pointInRect(px, py, r) {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}

// Does segment (x1,y1)-(x2,y2) hit rectangle r? Used for vision line-of-sight.
function segHitsRect(x1, y1, x2, y2, r) {
  if (pointInRect(x1, y1, r) || pointInRect(x2, y2, r)) return true;
  const edges = [
    [r.x, r.y, r.x + r.w, r.y],
    [r.x + r.w, r.y, r.x + r.w, r.y + r.h],
    [r.x + r.w, r.y + r.h, r.x, r.y + r.h],
    [r.x, r.y + r.h, r.x, r.y],
  ];
  for (const [ex1, ey1, ex2, ey2] of edges) {
    const d = (x2 - x1) * (ey2 - ey1) - (y2 - y1) * (ex2 - ex1);
    if (d === 0) continue;
    const t = ((ex1 - x1) * (ey2 - ey1) - (ey1 - y1) * (ex2 - ex1)) / d;
    const u = ((ex1 - x1) * (y2 - y1) - (ey1 - y1) * (x2 - x1)) / d;
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) return true;
  }
  return false;
}

// True when nothing (wall) blocks the line between two points.
export function losClear(x1, y1, x2, y2, walls) {
  for (const w of walls) {
    if (segHitsRect(x1, y1, x2, y2, w)) return false;
  }
  return true;
}

// Move a circle (entity with x, y, r) by (dx, dy), sliding along walls.
// Returns true when the entity actually moved.
export function moveCircle(e, dx, dy, walls, bounds) {
  let moved = false;
  const nx = clamp(e.x + dx, bounds.x + e.r, bounds.x + bounds.w - e.r);
  if (!walls.some((w) => circleHitsRect(nx, e.y, e.r, w))) {
    if (nx !== e.x) moved = true;
    e.x = nx;
  }
  const ny = clamp(e.y + dy, bounds.y + e.r, bounds.y + bounds.h - e.r);
  if (!walls.some((w) => circleHitsRect(e.x, ny, e.r, w))) {
    if (ny !== e.y) moved = true;
    e.y = ny;
  }
  return moved;
}

export function circleHitsRect(cx, cy, r, rect) {
  const qx = clamp(cx, rect.x, rect.x + rect.w);
  const qy = clamp(cy, rect.y, rect.y + rect.h);
  return dist(cx, cy, qx, qy) < r;
}
