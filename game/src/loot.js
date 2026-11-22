// Loot, safes, coins and smoke: the thief's tools and the score.
// E grabs loose loot instantly; a safe needs E held for 3 s and is noisy.
// Coins are thrown with a mouse click (guards investigate the clink).
// Space drops a smoke cloud that blinds guards and cameras for 5 s.

import { dist } from './utils.js';

export const GRAB_RANGE = 46;
export const CRACK_TIME = 3;

export function newLootState(level) {
  return {
    items: level.loot.map((l) => ({ ...l, taken: false })),
    safes: level.safes.map((s) => ({ ...s, cracked: false, progress: 0 })),
    value: 0,
    takenCount: 0,
    coinsLeft: level.coins,
    smokeLeft: level.smoke,
    thrownCoins: [], // {x,y,ttl,claimed}
    smokeClouds: [], // {x,y,r,ttl}
    cracking: null, // safe currently being cracked
  };
}

export function quotaMet(S) {
  return S.loot.value >= S.level.quota;
}

function nearestLoot(S, x, y) {
  let best = null;
  let bd = GRAB_RANGE;
  for (const it of S.loot.items) {
    if (it.taken) continue;
    const d = dist(x, y, it.x, it.y);
    if (d < bd) { bd = d; best = { kind: 'item', ref: it }; }
  }
  for (const s of S.loot.safes) {
    if (s.cracked) continue;
    const d = dist(x, y, s.x, s.y);
    if (d < bd) { bd = d; best = { kind: 'safe', ref: s }; }
  }
  return best;
}

// Called every frame while E is held (or released). Handles instant grabs
// and safe-cracking progress. onEvent(name, data) reports what happened.
export function updateInteract(S, eHeld, dt, onEvent) {
  const t = S.thief;
  const near = nearestLoot(S, t.x, t.y);
  S.loot.cracking = null;
  if (!near) return;
  if (near.kind === 'item') {
    if (eHeld && !near.ref.taken) {
      near.ref.taken = true;
      S.loot.value += near.ref.value;
      S.loot.takenCount += 1;
      onEvent('grab', near.ref);
      if (quotaMet(S)) onEvent('quota', null);
    }
    return;
  }
  // Safe: hold E; progress resets if you step away or let go.
  const safe = near.ref;
  if (eHeld) {
    S.loot.cracking = safe;
    safe.progress += dt;
    if (Math.floor(safe.progress * 4) !== Math.floor((safe.progress - dt) * 4)) onEvent('crackTick', safe);
    if (safe.progress >= CRACK_TIME) {
      safe.cracked = true;
      safe.progress = 0;
      S.loot.value += safe.value;
      S.loot.takenCount += 1;
      onEvent('safe', safe);
      if (quotaMet(S)) onEvent('quota', null);
    }
  } else {
    safe.progress = 0;
  }
}

export function throwCoin(S, x, y, onEvent) {
  if (S.loot.coinsLeft <= 0) return false;
  S.loot.coinsLeft -= 1;
  S.loot.thrownCoins.push({ x, y, ttl: 6, claimed: false });
  onEvent('throwCoin', { x, y });
  return true;
}

export function dropSmoke(S, onEvent) {
  if (S.loot.smokeLeft <= 0) return false;
  S.loot.smokeLeft -= 1;
  S.loot.smokeClouds.push({ x: S.thief.x, y: S.thief.y, r: 90, ttl: 5 });
  onEvent('smoke', null);
  return true;
}

export function updateTools(S, dt) {
  for (const c of S.loot.thrownCoins) c.ttl -= dt;
  S.loot.thrownCoins = S.loot.thrownCoins.filter((c) => c.ttl > 0);
  for (const s of S.loot.smokeClouds) s.ttl -= dt;
  S.loot.smokeClouds = S.loot.smokeClouds.filter((s) => s.ttl > 0);
}
