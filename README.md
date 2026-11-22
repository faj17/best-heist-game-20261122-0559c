# The Midnight Vault

[![make.fun · best-heist-game-20261122-0559](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/faj17/best-heist-game-20261122-0559c/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/faj17/best-heist-game-20261122-0559c/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)

Built for the [make.fun "Make the best heist game" bounty](https://make.fun/bounty/best-heist-game-20261122-0559).
A top-down 2D heist game for the make.fun "Make the best heist game" bounty.
Three floors — The Gallery, The Vault Hall, The Rooftop — one thief, one
getaway. Static files only; no network, no build step.

## How to play

Open `game/index.html` from any static server (`node serve.ts`, then
http://localhost:8080) and click to begin.

| Key | Action |
| --- | --- |
| WASD / arrows | Move |
| Shift | Sneak (slower, harder to spot) |
| E | Grab loot, hold to crack a safe (3 s, noisy) |
| Click | Throw a coin — guards investigate the clink |
| Space | Smoke bomb — blinds guards and cameras |
| P | Pause |
| M | Mute |

Steal enough to meet the floor's loot quota and the exit opens. Guards
patrol with vision cones and chase when they spot you; cameras sweep the
room; being seen raises the alarm, and at 100% the building locks down.
Getting caught costs a heart — three hearts and the night is over. Vents
are thief-only shortcuts between the sides of a floor.

## Structure

- `game/src/main.js` — state machine, input, frame loop
- `game/src/levels.js` — the three floors (walls, loot, guards, cameras)
- `game/src/thief.js` — movement, sneaking, vents
- `game/src/guards.js` — patrols, vision cones, investigation, chase
- `game/src/cameras.js` — sweeping security cameras
- `game/src/alarm.js` — alarm meter and lockdown
- `game/src/loot.js` — loot, safes, coins, smoke
- `game/src/render.js` — all drawing, HUD and overlays
- `game/src/shots.js` — staged screenshot scenes
- `game/src/audio.js` — synthesised WebAudio sounds
- `game/src/utils.js` — math and geometry helpers

`main.ts` hands the game in: it copies `game/` and `screenshots/` to
`/output` and writes `dossier.json` with the vendored make.fun library.

## License

MIT — see `LICENSE`.
