# Ember Sigils — Duel of the Four Elements

[![make.fun](https://make.fun/badge.svg)](https://make.fun/bounty/best-card-game-20261122-1826)
[![bounty](https://make.fun/bounty/best-card-game-20261122-1826/badge.svg)](https://make.fun/bounty/best-card-game-20261122-1826)
[![entry](https://make.fun/entry/best-card-game-20261122-1826/badge.svg)](https://make.fun/bounty/best-card-game-20261122-1826)

An original 1-v-1 card duel against Mira the Tidecaller, built for the
[best card game bounty](https://make.fun/bounty/best-card-game-20261122-1826).
No libraries, no network requests, no copied art — every card, symbol and
sound is drawn or synthesised in code.

## The game

Both duelists start at 20 life. Mana grows by one crystal each round (up to
10). Each turn you draw a card and spend mana to play cards from your hand;
every card has a cost, an attack value and one of four elements — **Ember,
Tide, Gale, Stone** — in an advantage circle (Ember beats Gale, Gale beats
Stone, Stone beats Tide, Tide beats Ember).

- **Advantage +2 attack** when your card's element beats the opponent's ward
  (the element of the last card they played).
- **Resonance +2 attack** when you play the same element twice in one turn.
- Cards also heal, draw, or raise armour that soaks damage.
- An empty deck costs 1 life (fatigue) when you must draw.
- Mira has a readable personality: she taunts, plays greedily on Adept and
  Archmage, and plays loose and sometimes passes early on Apprentice.

Three difficulties (Apprentice 16 life, Adept 20, Archmage 24 with a mana
bonus and a deeper opening hand), a turn log, and a session win/loss record.

## Controls

- **Click / tap** a card to play it, or press **1–7**
- **Space** — end turn
- **R** — restart the duel
- **M** — mute
- **Esc** — pause (or back to the title screen from an end screen)

## Play it

```sh
node serve.ts
# open http://localhost:8080
```

Screenshots use `?scene=title|table|win|loss` presets that stage a fixed,
deterministic state of the real game.

## Layout

- `game/index.html` — the page and canvas
- `game/src/config.js` — constants, the four elements, the 15-card catalogue
- `game/src/cards.js` — deck building, shuffling, drawing, fatigue
- `game/src/state.js` — match setup and turn flow
- `game/src/combat.js` — playing a card, bonuses, effects, win/lose
- `game/src/ai.js` — Mira's decisions and taunts
- `game/src/log.js` — the turn log
- `game/src/render.js` — all canvas art: table, cards, HUD, screens
- `game/src/input.js` — mouse and keyboard
- `game/src/audio.js` — WebAudio synth sounds
- `game/src/shots.js` — deterministic screenshot scenes
- `game/src/main.js` — wiring and frame loop
- `main.ts` — hands the entry in (copies `game/` + `screenshots/`, writes `dossier.json`)
- `vendor/makefun-game.ts` — the kit's vendored library, unchanged

## License

MIT — see [LICENSE](LICENSE).
