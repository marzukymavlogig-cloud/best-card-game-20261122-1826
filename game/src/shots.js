// shots.js — screenshot scenes behind ?scene=title|table|win|loss.
// Each scene stages a fixed, hand-built state (no randomness), so the same
// URL always gives the same frame — a real render of the game's own code.
import { CARDS } from './config.js';
import { toCard } from './cards.js';
import { addLog } from './log.js';

function handOf(ids) {
  return ids.map((id) => toCard(id));
}

/** A mid-duel table: both hands visible, readable cards, life totals. */
export function stageTable(state) {
  state.screen = 'duel';
  state.difficulty = 'adept';
  state.round = 5;
  state.phase = 'player';
  state.mana = 5;
  state.manaMax = 5;
  state.paused = false;
  state.banner = '';
  state.bannerT = 0;
  state.player = {
    life: 14, maxLife: 20, armor: 3,
    deck: Array.from({ length: 17 }, (_, i) => CARDS[i % CARDS.length].id),
    hand: handOf(['phoenix', 'maelstrom', 'drake', 'current', 'golem', 'spark']),
    discard: ['lash', 'dart'],
    ward: 'ember', lastElement: 'ember',
  };
  state.ai = {
    life: 17, maxLife: 20, armor: 0,
    deck: Array.from({ length: 19 }, (_, i) => CARDS[(i + 3) % CARDS.length].id),
    hand: handOf(['talon', 'heart', 'serpent', 'imp', 'avalanche']),
    discard: ['pebble', 'kite'],
    ward: 'tide', lastElement: 'tide',
  };
  state.log = [];
  state.plays = [
    { side: 'ai', card: toCard('serpent'), dmg: 6, notes: ['advantage +2'] },
    { side: 'player', card: toCard('drake'), dmg: 6, notes: [] },
  ];
  state.floats = [];
  state.stats = { played: 7, damage: 26, rounds: 5 };
  state.hover = 1;
  addLog(state, 'You play Cinder Drake — 6 damage.');
  addLog(state, 'Mira plays Wave Serpent — 6 damage (advantage +2).');
  addLog(state, 'Mira: "The tide does not ask permission."');
  addLog(state, 'Round 5: your mana grows to 5.');
  addLog(state, 'You gain +3 armour from Moss Golem.');
}

/** A win screen, staged after a finished duel. */
export function stageWin(state) {
  stageTable(state);
  state.ai.life = 0;
  state.screen = 'win';
  state.winner = 'player';
  state.record.wins = 1;
  state.stats = { played: 11, damage: 41, rounds: 7 };
  addLog(state, 'Mira falls — you win the duel!');
}

/** A loss screen, staged after a finished duel. */
export function stageLoss(state) {
  stageTable(state);
  state.player.life = 0;
  state.screen = 'loss';
  state.winner = 'ai';
  state.record.losses = 1;
  state.stats = { played: 9, damage: 33, rounds: 6 };
  addLog(state, 'Your life reaches zero — Mira wins the duel.');
}

/** Apply ?scene= from the page URL. Unknown scenes leave the title screen. */
export function applyScene(state, search) {
  const scene = new URLSearchParams(search).get('scene');
  if (scene === 'table') stageTable(state);
  else if (scene === 'win') stageWin(state);
  else if (scene === 'loss') stageLoss(state);
}
