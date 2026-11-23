// input.js — keyboard and mouse. One job: translate clicks and keys into
// game actions. Hit regions come from the last render's layout.
import { playCard } from './combat.js';
import { newMatch, startTurn } from './state.js';
import { addLog } from './log.js';

function inside(px, py, rect) {
  return rect && px >= rect.x && px <= rect.x + rect.w && py >= rect.y && py <= rect.y + rect.h;
}

/** Wire the canvas. `hooks` gives input the live state, audio and random. */
export function attachInput(canvas, state, audio, random, hooks) {
  function toGame(e) {
    const rect = canvas.getBoundingClientRect();
    const sx = 1280 / rect.width;
    const sy = 860 / rect.height;
    return { x: (e.clientX - rect.left) * sx, y: (e.clientY - rect.top) * sy };
  }

  canvas.addEventListener('mousemove', (e) => {
    const p = toGame(e);
    state.hover = -1;
    const layout = state._layout;
    if (!layout) return;
    for (const rect of layout.hand) {
      if (inside(p.x, p.y, rect)) state.hover = rect.index;
    }
  });

  canvas.addEventListener('click', (e) => {
    audio.unlock();
    const p = toGame(e);
    const layout = state._layout;
    if (!layout) return;
    if (state.screen === 'title') {
      for (const d of layout.difficulties) {
        if (inside(p.x, p.y, d)) {
          audio.click();
          newMatch(state, d.key, random);
          return;
        }
      }
      return;
    }
    if (state.screen === 'win' || state.screen === 'loss') return;
    if (state.paused) return;
    if (inside(p.x, p.y, layout.endTurn)) {
      endPlayerTurn(state, audio, random);
      return;
    }
    for (const rect of layout.hand) {
      if (inside(p.x, p.y, rect)) {
        tryPlay(state, rect.index, audio);
        return;
      }
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.repeat) return;
    const key = e.key;
    if (key === 'm' || key === 'M') {
      const muted = audio.toggleMute();
      addLog(state, muted ? 'Sound muted.' : 'Sound on.');
      return;
    }
    if (key === 'Escape') {
      if (state.screen === 'duel') state.paused = !state.paused;
      else if (state.screen === 'win' || state.screen === 'loss') state.screen = 'title';
      return;
    }
    if (key === 'r' || key === 'R') {
      state.paused = false;
      newMatch(state, state.difficulty, random);
      return;
    }
    if (state.screen === 'title' && ['1', '2', '3'].includes(key)) {
      audio.click();
      newMatch(state, ['apprentice', 'adept', 'archmage'][Number(key) - 1], random);
      return;
    }
    if (state.screen !== 'duel' || state.paused) return;
    if (key === ' ') {
      e.preventDefault();
      endPlayerTurn(state, audio, random);
      return;
    }
    if (/^[1-7]$/.test(key)) {
      tryPlay(state, Number(key) - 1, audio);
    }
  });
}

function tryPlay(state, index, audio) {
  if (state.phase !== 'player') return;
  const result = playCard(state, 'player', index, audio);
  if (!result.ok) {
    audio.denied();
    addLog(state, `Cannot play: ${result.reason}.`);
  }
}

/** End the player's turn and hand the table to Mira. Exported for tests. */
export function endPlayerTurn(state, audio, random) {
  if (state.screen !== 'duel' || state.phase !== 'player' || state.paused) return;
  audio.endTurn();
  startTurn(state, 'ai', random);
}
