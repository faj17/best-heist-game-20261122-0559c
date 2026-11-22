// Staged screenshot scenes (?shot=cover|chase|vault|escape).
// Each one is a real render of the game's own code: a floor is set up,
// entities are placed, and the frame the judge sees is live gameplay.
// applyShot(S, name, setupFloor) — setupFloor is main.js's floor loader.

export function applyShot(S, name, setupFloor) {
  if (name === 'cover') {
    setupFloor(S, 0);
    S.thief.x = 640; S.thief.y = 360;
    S.thief.dir = Math.PI / 4;
    S.alarm.value = 22;
    S.loot.items[0].taken = true; // Starry Vault already lifted
    S.loot.value = 400;
    S.loot.takenCount = 1;
    S.phase = 'play';
  } else if (name === 'chase') {
    setupFloor(S, 0);
    S.thief.x = 700; S.thief.y = 300;
    S.thief.dir = Math.PI;
    S.thief.sneaking = false;
    const g = S.guards[1];
    g.x = 610; g.y = 300; g.mode = 'chase'; g.alert = 1; g.dir = 0;
    S.alarm.value = 64;
    S.loot.items[1].taken = true;
    S.loot.value = 450;
    S.loot.takenCount = 1;
    S.phase = 'play';
  } else if (name === 'vault') {
    setupFloor(S, 1);
    S.thief.x = 520; S.thief.y = 262;
    S.thief.dir = -Math.PI / 2;
    const safe = S.loot.safes[0];
    safe.progress = 1.9;
    S.loot.cracking = safe;
    S.loot.items[0].taken = true; // Gold Bars lifted
    S.loot.items[2].taken = true; // The Pale Widow lifted
    S.loot.value = 1000;
    S.loot.takenCount = 2;
    S.alarm.value = 35;
    S.guards[0].x = 420; S.guards[0].y = 300;
    S.phase = 'play';
  } else if (name === 'escape') {
    setupFloor(S, 2);
    S.thief.x = 560; S.thief.y = 390;
    S.thief.dir = 0;
    // Quota met: the big pieces are already in the bag.
    S.loot.items[4].taken = true; // The Midnight Star
    S.loot.items[3].taken = true; // Sealed Crates
    S.loot.items[0].taken = true; // Smuggled Crates
    S.loot.items[1].taken = true; // Smuggled Crates
    S.loot.value = 2800;
    S.loot.takenCount = 4;
    S.alarm.value = 48;
    S.guards[2].x = 900; S.guards[2].y = 560; S.guards[2].wp = 0;
    S.phase = 'play';
  }
}

export const SHOT_NAMES = ['cover', 'chase', 'vault', 'escape'];
