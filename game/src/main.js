// The Midnight Vault — entry point.
// Owns the game state, the input, the frame loop and the phase machine.
// Phases: title → play → (paused | caught | floorclear | win | gameover).

import { newThief, updateThief } from './thief.js';
import { newGuards, updateGuards } from './guards.js';
import { newCameras, updateCameras } from './cameras.js';
import { newAlarm, updateAlarm } from './alarm.js';
import { newLootState, updateInteract, updateTools, throwCoin, dropSmoke, quotaMet } from './loot.js';
import { LEVELS } from './levels.js';
import { draw } from './render.js';
import { applyShot } from './shots.js';
import { sfx, unlockAudio, toggleMute, startHum, stopHum } from './audio.js';
import { dist, pointInRect } from './utils.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const keys = {};
let eHeld = false;

const S = {
  phase: 'title',
  levelIndex: 0,
  level: LEVELS[0],
  thief: newThief(LEVELS[0].start.x, LEVELS[0].start.y),
  guards: newGuards(LEVELS[0].guards),
  cameras: newCameras(LEVELS[0].cameras),
  alarm: newAlarm(),
  loot: newLootState(LEVELS[0]),
  hearts: 3,
  time: 0,
  totalLoot: 0,
  invulnTimer: 0,
  caughtTimer: 0,
  toast: '',
  toastTimer: 0,
  humOn: false,
};

export function setupFloor(state, idx) {
  state.levelIndex = idx;
  state.level = LEVELS[idx];
  state.thief = newThief(state.level.start.x, state.level.start.y);
  state.guards = newGuards(state.level.guards);
  state.cameras = newCameras(state.level.cameras);
  state.alarm = newAlarm();
  state.loot = newLootState(state.level);
  state.invulnTimer = 0;
  state.caughtTimer = 0;
  state.toast = '';
  state.toastTimer = 0;
}

function toast(msg, secs = 3) {
  S.toast = msg;
  S.toastTimer = secs;
}

function onLootEvent(name, data) {
  if (name === 'grab') {
    sfx.grab();
    toast(`Lifted ${data.label} — $${data.value}.`);
  } else if (name === 'safe') {
    sfx.safeOpen();
    S.alarm.value = Math.min(100, S.alarm.value + 12); // cracking is noisy
    toast(`Cracked ${data.label} — $${data.value}. The noise spiked the alarm.`);
  } else if (name === 'crackTick') {
    sfx.crackTick();
  } else if (name === 'quota') {
    sfx.unlock();
    toast('Quota met — the exit is open. Get out!');
  } else if (name === 'throwCoin') {
    sfx.throwCoin();
  } else if (name === 'smoke') {
    sfx.smoke();
    toast('Smoke out — they cannot see through it.');
  }
}

function resetRun() {
  S.hearts = 3;
  S.time = 0;
  S.totalLoot = 0;
  setupFloor(S, 0);
  S.phase = 'play';
}

function caught() {
  S.hearts -= 1;
  sfx.caught();
  stopHum();
  S.humOn = false;
  if (S.hearts <= 0) {
    S.phase = 'gameover';
    sfx.lose();
    return;
  }
  S.phase = 'caught';
  S.caughtTimer = 1.6;
  S.alarm.value = Math.min(100, S.alarm.value + 20);
  // Dragged back to the floor entrance; guards lose the trail.
  S.thief.x = S.level.start.x;
  S.thief.y = S.level.start.y;
  S.invulnTimer = 2.5;
  for (const g of S.guards) { g.mode = 'patrol'; g.alert = 0; }
}

function update(dt) {
  if (S.phase !== 'play') {
    if (S.phase === 'caught') {
      S.caughtTimer -= dt;
      if (S.caughtTimer <= 0) S.phase = 'play';
    }
    return;
  }
  S.time += dt;
  if (S.invulnTimer > 0) S.invulnTimer -= dt;
  if (S.toastTimer > 0) S.toastTimer -= dt;

  const input = {
    up: keys['KeyW'] || keys['ArrowUp'],
    down: keys['KeyS'] || keys['ArrowDown'],
    left: keys['KeyA'] || keys['ArrowLeft'],
    right: keys['KeyD'] || keys['ArrowRight'],
    sneak: keys['ShiftLeft'] || keys['ShiftRight'],
  };
  updateThief(S.thief, input, dt, S.level, () => { sfx.vent(); toast('Through the vent — guards cannot follow.'); });

  updateInteract(S, eHeld, dt, onLootEvent);
  updateTools(S, dt);

  const guardRes = updateGuards(S.guards, dt, S.thief, S.level, S.loot.smokeClouds, S.loot.thrownCoins);
  const camSeen = updateCameras(S.cameras, dt, S.thief, S.level, S.loot.smokeClouds);

  // Alarm pressure: guards seeing you, cameras holding you, lockdown chase.
  let pressure = 0;
  if (guardRes.spotted) pressure += 9;
  if (camSeen) pressure += 14;
  for (const g of S.guards) if (g.mode === 'chase') pressure += 3;
  if (guardRes.spotted && !S.humOn) { startHum(); S.humOn = true; }
  if (!guardRes.spotted && !camSeen && S.humOn) { stopHum(); S.humOn = false; }

  updateAlarm(S.alarm, dt, pressure, () => {
    sfx.lockdown();
    toast('LOCKDOWN! The exit is sealed for 8 seconds.');
    for (const g of S.guards) { g.mode = 'chase'; g.alert = 1; }
  }, () => {
    toast('Lockdown lifted — move now.');
  });

  if (guardRes.caught && S.invulnTimer <= 0) caught();

  // Exit: only when the quota is met and the building is not locked down.
  if (quotaMet(S) && !S.alarm.lockdown) {
    const e = S.level.exit;
    if (pointInRect(S.thief.x, S.thief.y, e)) {
      S.totalLoot += S.loot.value;
      if (S.levelIndex >= LEVELS.length - 1) {
        S.phase = 'win';
        sfx.win();
      } else {
        S.phase = 'floorclear';
        sfx.floorClear();
      }
    }
  }
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  update(dt);
  draw(ctx, S);
  requestAnimationFrame(frame);
}

// --- Input ---
window.addEventListener('keydown', (ev) => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(ev.code)) ev.preventDefault();
  keys[ev.code] = true;
  if (ev.code === 'KeyE') eHeld = true;
  if (ev.code === 'KeyM') toggleMute();
  if (ev.code === 'KeyP' && (S.phase === 'play' || S.phase === 'paused')) {
    S.phase = S.phase === 'play' ? 'paused' : 'play';
    sfx.click();
  }
  if (ev.code === 'Space' && S.phase === 'play') {
    dropSmoke(S, onLootEvent);
  }
});
window.addEventListener('keyup', (ev) => {
  keys[ev.code] = false;
  if (ev.code === 'KeyE') eHeld = false;
});
canvas.addEventListener('mousedown', (ev) => {
  unlockAudio();
  const rect = canvas.getBoundingClientRect();
  const x = ((ev.clientX - rect.left) / rect.width) * 1280;
  const y = ((ev.clientY - rect.top) / rect.height) * 720;
  if (S.phase === 'title') { sfx.click(); resetRun(); return; }
  if (S.phase === 'floorclear') { sfx.click(); setupFloor(S, S.levelIndex + 1); S.phase = 'play'; return; }
  if (S.phase === 'win' || S.phase === 'gameover') { sfx.click(); resetRun(); return; }
  if (S.phase !== 'play') return;
  // Click inside the room throws a coin to that spot.
  if (y > 84 && !throwCoin(S, x, y, onLootEvent)) {
    toast('Out of coins — the guards heard nothing.');
  }
});

// Staged screenshot scenes: ?shot=cover|chase|vault|escape
const params = new URLSearchParams(location.search);
const shot = params.get('shot');
if (shot) {
  applyShot(S, shot, setupFloor);
} else {
  setupFloor(S, 0);
}

// Probe handle for the playtest harness.
window.__game = {
  get phase() { return S.phase; },
  get loot() { return S.loot.value; },
  get alarm() { return S.alarm.value; },
  get hearts() { return S.hearts; },
  get levelIndex() { return S.levelIndex; },
  get thief() { return S.thief; },
  get guards() { return S.guards.map((g) => ({ x: Math.round(g.x), y: Math.round(g.y), mode: g.mode, alert: Math.round(g.alert * 100) / 100 })); },
  _state: S,
};

requestAnimationFrame(frame);
