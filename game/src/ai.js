// ai.js — Mira the Tidecaller. One job: decide what the AI plays each turn
// and speak in character, so her choices can be read and countered.
// Apprentice Mira picks a random affordable card and sometimes passes early;
// Adept and Archmage Mira play the best value card they can afford.
import { cardDamage, playCard } from './combat.js';
import { addLog } from './log.js';

export const TAUNTS = [
  'Mira: "The tide does not ask permission."',
  'Mira: "I read your hand in the ripples."',
  'Mira: "Every card you spend is a stone I keep."',
  'Mira: "The deep current favours the patient."',
  'Mira: "Your ember burns bright — and brief."',
];
export const WIN_LINES = [
  'Mira: "The tide takes another ember."',
  'Mira: "Well played. The sea remembers."',
];

/** Score a card for the AI: damage per mana, plus its effect's worth. */
export function scoreCard(state, card) {
  const { dmg } = cardDamage(state, 'ai', card);
  let value = dmg;
  if (card.effect) {
    if (card.effect.heal) value += card.effect.heal * 0.8;
    if (card.effect.shield) value += card.effect.shield * 0.8;
    if (card.effect.draw) value += 2;
  }
  return value / Math.max(1, card.cost);
}

/**
 * One AI step, called from the main loop while phase is 'ai'. Plays one card
 * per call (the loop spaces calls ~0.9 s apart), then ends the turn when
 * nothing worth playing remains. Returns 'played', 'pass' or 'wait'.
 */
export function aiStep(state, audio) {
  if (state.screen !== 'duel' || state.phase !== 'ai') return 'wait';
  const smart = state.difficulty !== 'apprentice';
  const playable = state.ai.hand
    .map((card, i) => ({ card, i }))
    .filter((entry) => entry.card.cost <= state.mana);
  if (playable.length === 0) return 'pass';
  let pick;
  if (smart) {
    pick = playable.reduce((best, entry) =>
      scoreCard(state, entry.card) > scoreCard(state, best.card) ? entry : best);
  } else {
    pick = playable[Math.floor(Math.random() * playable.length)];
    // Apprentice Mira sometimes banks her mana and passes early.
    if (Math.random() < 0.25 && state.ai.hand.length > 1) return 'pass';
  }
  return playAiCard(state, pick.i, audio);
}

function playAiCard(state, handIndex, audio) {
  const result = playCard(state, 'ai', handIndex, audio);
  if (result.ok && Math.random() < 0.35) {
    addLog(state, TAUNTS[Math.floor(Math.random() * TAUNTS.length)]);
  }
  return result.ok ? 'played' : 'pass';
}
