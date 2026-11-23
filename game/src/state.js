// state.js — match setup and turn flow. One job: own the game state object
// and move it between turns. Combat lives in combat.js, AI in ai.js.
import { DIFFICULTIES, START_LIFE } from './config.js';
import { buildDeck, drawCard } from './cards.js';
import { addLog } from './log.js';

export function freshSide(life) {
  return {
    life, maxLife: life, armor: 0,
    deck: [], hand: [], discard: [],
    ward: null, lastElement: null,
  };
}

/** A brand-new match on `difficultyKey`, hands dealt, player to move. */
export function newMatch(state, difficultyKey, random) {
  const diff = DIFFICULTIES[difficultyKey] || DIFFICULTIES.adept;
  state.difficulty = difficultyKey;
  state.screen = 'duel';
  state.round = 1;
  state.phase = 'player';
  state.mana = 1;
  state.manaMax = 1;
  state.player = freshSide(START_LIFE);
  state.ai = freshSide(diff.aiLife);
  state.player.deck = buildDeck(random);
  state.ai.deck = buildDeck(random);
  state.log = [];
  state.plays = [];
  state.floats = [];
  state.stats = { played: 0, damage: 0, rounds: 1 };
  state.winner = null;
  state.aiTimer = 0;
  state.aiActed = false;
  state.banner = '';
  state.bannerT = 0;
  for (let i = 0; i < 3; i += 1) {
    drawCard(state, state.player, random);
    drawCard(state, state.ai, random);
  }
  if (diff.aiCards === 4) drawCard(state, state.ai, random);
  addLog(state, `Duel begins — Mira the Tidecaller (${diff.label}).`);
  addLog(state, 'Round 1: 1 mana. Play a card, then end your turn.');
  state.banner = 'YOUR TURN';
  state.bannerT = 1.6;
}

/**
 * Start a turn for `side` ('player' or 'ai'). Mana grows once per round —
 * when the player's turn begins — and the AI's bonus applies on its own
 * turns. One card is drawn.
 */
export function startTurn(state, side, random) {
  const diff = DIFFICULTIES[state.difficulty];
  if (side === 'player') state.round += 1;
  const bonus = side === 'ai' ? diff.aiManaBonus : 0;
  state.manaMax = Math.min(10, state.round + bonus);
  state.mana = state.manaMax;
  const who = side === 'player' ? state.player : state.ai;
  who.lastElement = null;
  const note = drawCard(state, who, random);
  if (note === 'fatigue −1') {
    addLog(state, `${side === 'player' ? 'You' : 'Mira'} draw from an empty deck — fatigue −1 life.`);
  }
  state.phase = side;
  state.stats.rounds = state.round;
  if (side === 'player') {
    state.banner = 'YOUR TURN';
    addLog(state, `Round ${state.round}: your mana grows to ${state.manaMax}.`);
  } else {
    state.banner = "MIRA'S TURN";
    addLog(state, `Round ${state.round}: Mira takes the table.`);
  }
  state.bannerT = 1.4;
  state.aiTimer = 1.0;
  state.aiActed = false;
}
