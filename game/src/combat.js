// combat.js — playing a card. One job: resolve a card play, its bonuses,
// its effect, and the win/lose check. Used by the player and by the AI alike.
import { ADVANTAGE_BONUS, ELEMENTS, RESONANCE_BONUS } from './config.js';
import { drawCard } from './cards.js';
import { addLog } from './log.js';

/** Damage of `card` for `side`, with advantage and resonance bonuses. */
export function cardDamage(state, side, card) {
  const me = side === 'player' ? state.player : state.ai;
  const foe = side === 'player' ? state.ai : state.player;
  let dmg = card.atk;
  let notes = [];
  if (foe.ward && ELEMENTS[card.element].beats === foe.ward) {
    dmg += ADVANTAGE_BONUS;
    notes.push(`advantage +${ADVANTAGE_BONUS}`);
  }
  if (me.lastElement === card.element) {
    dmg += RESONANCE_BONUS;
    notes.push(`resonance +${RESONANCE_BONUS}`);
  }
  return { dmg, notes };
}

/**
 * Play hand[handIndex] for `side`. Returns { ok, reason } — a failed play
 * (wrong phase, not enough mana) changes nothing, so the UI can shake the
 * card and say why.
 */
export function playCard(state, side, handIndex, audio) {
  if (state.screen !== 'duel' || state.phase !== side) return { ok: false, reason: 'not your turn' };
  const me = side === 'player' ? state.player : state.ai;
  const foe = side === 'player' ? state.ai : state.player;
  const card = me.hand[handIndex];
  if (!card) return { ok: false, reason: 'no card there' };
  if (card.cost > state.mana) return { ok: false, reason: `needs ${card.cost} mana` };
  state.mana -= card.cost;
  me.hand.splice(handIndex, 1);
  me.discard.push(card.id);
  me.ward = card.element;
  const { dmg, notes } = cardDamage(state, side, card);
  me.lastElement = card.element;
  // Armour soaks damage first.
  let remaining = dmg;
  if (foe.armor > 0) {
    const soaked = Math.min(foe.armor, remaining);
    foe.armor -= soaked;
    remaining -= soaked;
  }
  foe.life -= remaining;
  const who = side === 'player' ? 'You' : 'Mira';
  const bonus = notes.length ? ` (${notes.join(', ')})` : '';
  addLog(state, `${who} play ${card.name} — ${dmg} damage${bonus}.`);
  state.plays.unshift({ side, card, dmg, notes });
  if (state.plays.length > 4) state.plays.length = 4;
  state.floats.push({ x: 640, y: side === 'player' ? 250 : 590, text: remaining === 0 ? 'BLOCKED' : `−${remaining}`, color: remaining === 0 ? '#9fb4d8' : '#ffd34d', t: 1.2, big: true });
  if (card.effect) {
    if (card.effect.heal) {
      me.life = Math.min(me.maxLife, me.life + card.effect.heal);
      addLog(state, `${who} heal +${card.effect.heal} life.`);
    }
    if (card.effect.shield) {
      me.armor += card.effect.shield;
      addLog(state, `${who} gain +${card.effect.shield} armour.`);
    }
    if (card.effect.draw) {
      for (let i = 0; i < card.effect.draw; i += 1) drawCard(state, me, Math.random);
      addLog(state, `${who} draw ${card.effect.draw} card.`);
    }
  }
  if (side === 'player') {
    state.stats.played += 1;
    state.stats.damage += remaining;
  }
  if (audio) audio.playCard(card.element);
  checkEnd(state);
  return { ok: true, dmg: remaining };
}

/** Win when a side's life hits zero; records the result for the session. */
export function checkEnd(state) {
  if (state.screen !== 'duel') return;
  if (state.ai.life <= 0) {
    state.ai.life = 0;
    state.winner = 'player';
    state.screen = 'win';
    state.record.wins += 1;
    addLog(state, 'Mira falls — you win the duel!');
  } else if (state.player.life <= 0) {
    state.player.life = 0;
    state.winner = 'ai';
    state.screen = 'loss';
    state.record.losses += 1;
    addLog(state, 'Your life reaches zero — Mira wins the duel.');
  }
}
