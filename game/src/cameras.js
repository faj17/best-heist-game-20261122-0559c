// Security cameras: wall-mounted, sweeping cones. A camera that holds
// the thief in its cone raises the alarm fast — break line of sight or
// drop smoke to shake it.

import { angleDiff, angleTo, dist, losClear } from './utils.js';

export function newCameras(defs) {
  return defs.map((d) => ({
    x: d.x, y: d.y,
    base: d.base, sweep: d.sweep, range: d.range, speed: d.speed,
    angle: d.base,
    t: Math.random() * 10,
    seen: false,
    hold: 0, // seconds the thief has been continuously in the cone
  }));
}

// Returns true when any camera currently has the thief in its cone.
export function updateCameras(cams, dt, thief, level, smokeClouds) {
  let anySeen = false;
  for (const c of cams) {
    c.t += dt;
    c.angle = c.base + Math.sin(c.t * c.speed) * c.sweep;
    const d = dist(c.x, c.y, thief.x, thief.y);
    let seen = false;
    if (d < c.range) {
      const a = angleTo(c.x, c.y, thief.x, thief.y);
      if (Math.abs(angleDiff(a, c.angle)) < 0.5 && losClear(c.x, c.y, thief.x, thief.y, level.walls)) {
        seen = true;
        for (const s of smokeClouds) {
          if (dist(s.x, s.y, thief.x, thief.y) < s.r) { seen = false; break; }
        }
      }
    }
    c.seen = seen;
    if (seen) { c.hold += dt; anySeen = true; } else { c.hold = 0; }
  }
  return anySeen;
}
