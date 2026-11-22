// Guards: patrol waypoints, vision cones, investigation and chase.
// A guard sees the thief only inside its cone, in range, with a clear
// line of sight — and sneaking halves the range at which it notices you.

import { angleDiff, angleTo, clamp, dist, losClear, moveCircle } from './utils.js';
import { BOUNDS } from './levels.js';

export const GUARD_R = 14;
export const VISION_RANGE = 195;
export const VISION_HALF = 0.62; // ~35 degrees each side
export const PATROL_SPEED = 1; // multiplied by the level's per-guard speed
export const CHASE_SPEED = 165;

export function newGuards(defs) {
  return defs.map((d) => ({
    path: d.path,
    speed: d.speed,
    wp: 0,
    x: d.path[0][0],
    y: d.path[0][1],
    r: GUARD_R,
    dir: 0,
    alert: 0, // 0 calm .. 1 fully alerted
    mode: 'patrol', // patrol | investigate | chase
    inv: null, // investigation point {x,y}
    invTimer: 0,
    chaseTimer: 0,
    seen: false, // thief visible this frame
  }));
}

function canSee(g, thief, walls, smokeClouds) {
  const d = dist(g.x, g.y, thief.x, thief.y);
  const range = thief.sneaking ? VISION_RANGE * 0.55 : VISION_RANGE;
  if (d > range) return false;
  const a = angleTo(g.x, g.y, thief.x, thief.y);
  if (Math.abs(angleDiff(a, g.dir)) > VISION_HALF) return false;
  if (!losClear(g.x, g.y, thief.x, thief.y, walls)) return false;
  for (const s of smokeClouds) {
    // A smoke cloud between guard and thief blocks the view.
    if (dist(g.x, g.y, s.x, s.y) + dist(s.x, s.y, thief.x, thief.y) < d + s.r * 0.4) return false;
    if (dist(s.x, s.y, thief.x, thief.y) < s.r) return false;
  }
  return true;
}

// Returns { spotted: bool, caught: bool } for this frame.
export function updateGuards(guards, dt, thief, level, smokeClouds, coins) {
  let spotted = false;
  let caught = false;
  for (const g of guards) {
    g.seen = canSee(g, thief, level.walls, smokeClouds);
    if (g.seen) {
      const d = dist(g.x, g.y, thief.x, thief.y);
      // Closer + moving fast = noticed faster. Sneaking buys time.
      const rate = (thief.sneaking ? 0.55 : 1) * (1.6 - d / VISION_RANGE);
      g.alert = clamp(g.alert + dt * rate, 0, 1);
    } else {
      g.alert = clamp(g.alert - dt * 0.25, 0, 1);
    }

    if (g.alert > 0.55) {
      if (g.mode !== 'chase') g.chaseTimer = 0;
      g.mode = 'chase';
    } else if (g.mode === 'chase' && g.alert < 0.25) {
      g.mode = 'patrol';
    }

    // A thrown coin pulls the nearest calm guard to investigate.
    if (g.mode === 'patrol' && coins.length > 0) {
      const c = coins[coins.length - 1];
      if (!c.claimed && dist(g.x, g.y, c.x, c.y) < 320) {
        c.claimed = true;
        g.mode = 'investigate';
        g.inv = { x: c.x, y: c.y };
        g.invTimer = 3.5;
      }
    }

    if (g.mode === 'chase') {
      g.chaseTimer += dt;
      const a = angleTo(g.x, g.y, thief.x, thief.y);
      g.dir = a;
      moveCircle(g, Math.cos(a) * CHASE_SPEED * dt, Math.sin(a) * CHASE_SPEED * dt, level.walls, BOUNDS);
      if (g.seen) spotted = true;
      if (dist(g.x, g.y, thief.x, thief.y) < g.r + thief.r + 2) caught = true;
      if (g.chaseTimer > 6 && !g.seen) { g.mode = 'patrol'; g.alert = 0.2; }
    } else if (g.mode === 'investigate' && g.inv) {
      const a = angleTo(g.x, g.y, g.inv.x, g.inv.y);
      const d = dist(g.x, g.y, g.inv.x, g.inv.y);
      if (d > 12) {
        g.dir = a;
        moveCircle(g, Math.cos(a) * g.speed * 1.25 * dt, Math.sin(a) * g.speed * 1.25 * dt, level.walls, BOUNDS);
      } else {
        g.invTimer -= dt;
        g.dir += dt * 1.4; // look around
        if (g.invTimer <= 0) { g.mode = 'patrol'; g.inv = null; }
      }
    } else {
      // Patrol: walk the waypoint loop.
      const target = g.path[g.wp];
      const a = angleTo(g.x, g.y, target[0], target[1]);
      const d = dist(g.x, g.y, target[0], target[1]);
      if (d < 10) {
        g.wp = (g.wp + 1) % g.path.length;
      } else {
        g.dir = a;
        moveCircle(g, Math.cos(a) * g.speed * dt, Math.sin(a) * g.speed * dt, level.walls, BOUNDS);
      }
    }
  }
  return { spotted, caught };
}
