// The thief: movement, sneaking, wall sliding and vent shortcuts.

import { moveCircle, pointInRect } from './utils.js';
import { BOUNDS } from './levels.js';

export const WALK_SPEED = 215;
export const SNEAK_SPEED = 105;
export const THIEF_R = 13;

export function newThief(x, y) {
  return {
    x, y, r: THIEF_R,
    vx: 0, vy: 0,
    dir: -Math.PI / 2, // facing up at spawn
    sneaking: false,
    moving: false,
    ventCooldown: 0,
  };
}

// input: {up,down,left,right,sneak} — booleans from main.js.
// Returns nothing; mutates thief. Handles vents (thief-only shortcuts).
export function updateThief(t, input, dt, level, onVent) {
  const speed = input.sneak ? SNEAK_SPEED : WALK_SPEED;
  let mx = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  let my = (input.down ? 1 : 0) - (input.up ? 1 : 0);
  const len = Math.hypot(mx, my);
  if (len > 0) {
    mx /= len;
    my /= len;
    t.dir = Math.atan2(my, mx);
  }
  t.sneaking = !!input.sneak && len > 0;
  t.moving = len > 0;
  t.vx = mx * speed;
  t.vy = my * speed;
  moveCircle(t, t.vx * dt, t.vy * dt, level.walls, BOUNDS);

  if (t.ventCooldown > 0) t.ventCooldown -= dt;
  if (t.ventCooldown <= 0) {
    for (const v of level.vents) {
      if (pointInRect(t.x, t.y, v)) {
        t.x = v.tx;
        t.y = v.ty;
        t.ventCooldown = 1.2;
        if (onVent) onVent();
        break;
      }
    }
  }
}
