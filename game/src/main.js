// main.js — wiring and frame loop. One job: own the canvas, the state
// object and the loop, and expose a test handle for the play-test driver.
import { VIEW } from './config.js';
import { createAudio } from './audio.js';
import { newMatch, startTurn } from './state.js';
import { aiStep } from './ai.js';
import { render } from './render.js';
import { attachInput, endPlayerTurn } from './input.js';
import { applyScene } from './shots.js';
import { playCard } from './combat.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

function fitCanvas() {
  const scale = Math.min(window.innerWidth / VIEW.width, window.innerHeight / VIEW.height);
  canvas.width = VIEW.width;
  canvas.height = VIEW.height;
  canvas.style.width = `${Math.floor(VIEW.width * scale)}px`;
  canvas.style.height = `${Math.floor(VIEW.height * scale)}px`;
}
window.addEventListener('resize', fitCanvas);
fitCanvas();

const audio = createAudio();
const state = {
  screen: 'title',
  difficulty: 'adept',
  round: 1,
  phase: 'player',
  mana: 0,
  manaMax: 0,
  player: null,
  ai: null,
  log: [],
  plays: [],
  floats: [],
  stats: { played: 0, damage: 0, rounds: 1 },
  record: { wins: 0, losses: 0 },
  winner: null,
  hover: -1,
  paused: false,
  banner: '',
  bannerT: 0,
  aiTimer: 0,
  aiActed: false,
  _layout: null,
};

attachInput(canvas, state, audio, Math.random);
applyScene(state, window.location.search);

let last = performance.now();
let aiClock = 0;
function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  if (state.bannerT > 0) state.bannerT -= dt;
  for (const f of state.floats) f.t -= dt;
  state.floats = state.floats.filter((f) => f.t > 0);
  // Mira's turn: one card roughly every 0.9 s, then she passes.
  if (state.screen === 'duel' && state.phase === 'ai' && !state.paused) {
    aiClock += dt;
    if (aiClock >= 0.9) {
      aiClock = 0;
      const result = aiStep(state, audio);
      if (result === 'pass' || state.screen !== 'duel') {
        if (state.screen === 'duel') startTurn(state, 'player', Math.random);
      }
    }
  } else {
    aiClock = 0;
  }
  render(ctx, state);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// Test handle: the play-test driver drives the real game through this.
window.__cardGame = {
  state,
  audio,
  playCard: (index) => playCard(state, 'player', index, audio),
  endTurn: () => endPlayerTurn(state, audio, Math.random),
  newMatch: (difficulty) => newMatch(state, difficulty, Math.random),
  aiStep: () => aiStep(state, audio),
};
