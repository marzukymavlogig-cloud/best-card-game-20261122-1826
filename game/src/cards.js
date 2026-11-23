// cards.js — decks and drawing. One job: build, shuffle and draw cards.
// A deck is an array of card ids; a hand holds card objects (fresh copies
// so play never mutates the catalogue).
import { CARDS, DECK_SIZE, HAND_LIMIT } from './config.js';

/** A fresh 30-card deck: two copies of every catalogue card, shuffled. */
export function buildDeck(random) {
  const ids = [];
  for (const card of CARDS) ids.push(card.id, card.id);
  for (let i = ids.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids.slice(0, DECK_SIZE);
}

/** Turn a card id into a playable card object. */
export function toCard(id) {
  const def = CARDS.find((c) => c.id === id);
  return { ...def, effect: def.effect ? { ...def.effect } : null };
}

/**
 * Draw one card for `side` (state.player or state.ai). When the deck is
 * empty the discard pile is shuffled back in; when both are empty the side
 * takes 1 fatigue damage instead. Returns a short note for the log, or null.
 */
export function drawCard(state, side, random) {
  if (side.hand.length >= HAND_LIMIT) return 'hand full';
  if (side.deck.length === 0) {
    if (side.discard.length === 0) {
      side.life -= 1;
      return 'fatigue −1';
    }
    side.deck = side.discard;
    side.discard = [];
    for (let i = side.deck.length - 1; i > 0; i -= 1) {
      const j = Math.floor(random() * (i + 1));
      [side.deck[i], side.deck[j]] = [side.deck[j], side.deck[i]];
    }
  }
  side.hand.push(toCard(side.deck.pop()));
  return null;
}
