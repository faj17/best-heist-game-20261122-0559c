// The alarm meter (0–100). It climbs while the thief is seen and bleeds
// off while hidden. At 100 the building locks down: the exit seals, every
// guard converges on the thief, and the meter resets to 60 when it ends.

export function newAlarm() {
  return { value: 0, lockdown: false, lockdownTimer: 0 };
}

export function updateAlarm(a, dt, pressure, onLockdown, onLockdownEnd) {
  if (a.lockdown) {
    a.lockdownTimer -= dt;
    if (a.lockdownTimer <= 0) {
      a.lockdown = false;
      a.value = 60;
      if (onLockdownEnd) onLockdownEnd();
    }
    return;
  }
  if (pressure > 0) a.value += dt * pressure;
  else a.value -= dt * 4; // slow bleed while unseen
  if (a.value < 0) a.value = 0;
  if (a.value >= 100) {
    a.value = 100;
    a.lockdown = true;
    a.lockdownTimer = 8;
    if (onLockdown) onLockdown();
  }
}
