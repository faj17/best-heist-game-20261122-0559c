// The three floors of The Midnight Vault.
// Every floor is one room inside the same play bounds (x 24..1256, y 84..696).
// walls: solid rectangles. vents: thief-only shortcuts {x,y,w,h,tx,ty}.
// loot: grab with E. safes: hold E for 3 s, noisy. exit: locked until quota.

export const BOUNDS = { x: 24, y: 84, w: 1232, h: 612 };

export const LEVELS = [
  {
    name: 'Floor 1 — The Gallery',
    sub: 'Lift the paintings, crack the safe, slip out the east door.',
    quota: 1200,
    start: { x: 80, y: 640 },
    exit: { x: 1180, y: 96, w: 64, h: 44, label: 'EAST DOOR' },
    walls: [
      { x: 600, y: 200, w: 24, h: 280 }, // central partition
      { x: 300, y: 250, w: 90, h: 60 }, // pedestals
      { x: 880, y: 250, w: 90, h: 60 },
      { x: 300, y: 480, w: 90, h: 60 },
      { x: 880, y: 480, w: 90, h: 60 },
      { x: 480, y: 120, w: 320, h: 28 }, // long display case
    ],
    vents: [
      { x: 44, y: 340, w: 36, h: 30, tx: 1184, ty: 355 },
      { x: 1184, y: 340, w: 36, h: 30, tx: 62, ty: 355 },
    ],
    loot: [
      { x: 150, y: 120, kind: 'painting', value: 400, label: 'Starry Vault' },
      { x: 1120, y: 120, kind: 'painting', value: 450, label: 'The Gilded Cat' },
      { x: 150, y: 620, kind: 'painting', value: 350, label: 'Midnight Orchid' },
      { x: 1120, y: 620, kind: 'painting', value: 500, label: 'The Iron Duchess' },
      { x: 640, y: 420, kind: 'vase', value: 250, label: 'Porcelain Vase' },
    ],
    safes: [
      { x: 640, y: 640, value: 900, label: 'The Iron Vault' },
    ],
    guards: [
      { path: [[250, 200], [250, 550], [500, 550], [500, 200]], speed: 72 },
      { path: [[780, 200], [1030, 200], [1030, 550], [780, 550]], speed: 72 },
    ],
    cameras: [
      { x: 640, y: 100, base: Math.PI / 2, sweep: 0.65, range: 270, speed: 0.55 },
    ],
    coins: 3,
    smoke: 2,
  },
  {
    name: 'Floor 2 — The Vault Hall',
    sub: 'The vault row is watched. Read the cones before you move.',
    quota: 2000,
    start: { x: 640, y: 640 },
    exit: { x: 36, y: 96, w: 64, h: 44, label: 'WEST DOOR' },
    walls: [
      { x: 440, y: 110, w: 400, h: 70 }, // vault row backing
      { x: 280, y: 300, w: 24, h: 200 }, // side partitions
      { x: 976, y: 300, w: 24, h: 200 },
      { x: 560, y: 360, w: 160, h: 90 }, // central island
    ],
    vents: [
      { x: 44, y: 600, w: 36, h: 30, tx: 1184, ty: 130 },
      { x: 1184, y: 600, w: 36, h: 30, tx: 62, ty: 130 },
    ],
    loot: [
      { x: 480, y: 210, kind: 'gold', value: 600, label: 'Gold Bars' },
      { x: 800, y: 210, kind: 'gold', value: 600, label: 'Gold Bars' },
      { x: 150, y: 150, kind: 'painting', value: 400, label: 'The Pale Widow' },
      { x: 1130, y: 150, kind: 'painting', value: 400, label: 'The Brass Saint' },
      { x: 640, y: 405, kind: 'diamond', value: 800, label: 'The Blue Tear' },
    ],
    safes: [
      { x: 520, y: 210, value: 1000, label: 'Vault Safe A' },
      { x: 760, y: 210, value: 1000, label: 'Vault Safe B' },
    ],
    guards: [
      { path: [[200, 220], [200, 580], [420, 580], [420, 220]], speed: 78 },
      { path: [[860, 220], [1080, 220], [1080, 580], [860, 580]], speed: 78 },
      { path: [[480, 520], [800, 520], [800, 620], [480, 620]], speed: 66 },
    ],
    cameras: [
      { x: 400, y: 100, base: Math.PI / 2, sweep: 0.7, range: 260, speed: 0.6 },
      { x: 880, y: 100, base: Math.PI / 2, sweep: 0.7, range: 260, speed: 0.6 },
    ],
    coins: 3,
    smoke: 2,
  },
  {
    name: 'Floor 3 — The Rooftop',
    sub: 'One last score on the roof. The helicopter is waiting.',
    quota: 2600,
    start: { x: 80, y: 640 },
    exit: { x: 600, y: 350, w: 80, h: 80, label: 'HELIPAD' },
    walls: [
      { x: 250, y: 200, w: 110, h: 80 }, // AC units
      { x: 920, y: 200, w: 110, h: 80 },
      { x: 250, y: 480, w: 110, h: 80 },
      { x: 920, y: 480, w: 110, h: 80 },
      { x: 560, y: 120, w: 160, h: 40 }, // skylight housing
    ],
    vents: [
      { x: 44, y: 360, w: 36, h: 30, tx: 1184, ty: 375 },
      { x: 1184, y: 360, w: 36, h: 30, tx: 62, ty: 375 },
    ],
    loot: [
      { x: 150, y: 150, kind: 'crate', value: 500, label: 'Smuggled Crates' },
      { x: 1130, y: 150, kind: 'crate', value: 500, label: 'Smuggled Crates' },
      { x: 150, y: 620, kind: 'crate', value: 600, label: 'Sealed Crates' },
      { x: 1130, y: 620, kind: 'crate', value: 600, label: 'Sealed Crates' },
      { x: 640, y: 390, kind: 'diamond', value: 1200, label: 'The Midnight Star' },
    ],
    safes: [
      { x: 640, y: 150, value: 1200, label: 'Roof Safe' },
    ],
    guards: [
      { path: [[180, 160], [180, 560], [420, 560], [420, 160]], speed: 84 },
      { path: [[860, 160], [1100, 160], [1100, 560], [860, 560]], speed: 84 },
      { path: [[480, 300], [800, 300], [800, 480], [480, 480]], speed: 74 },
    ],
    cameras: [
      { x: 320, y: 100, base: Math.PI / 2, sweep: 0.8, range: 280, speed: 0.7 },
      { x: 960, y: 100, base: Math.PI / 2, sweep: 0.8, range: 280, speed: 0.7 },
    ],
    coins: 3,
    smoke: 2,
  },
];
