// config.js — the fixed numbers and card catalogue of Ember Sigils.
// One job: hold the constants every other module reads. Nothing here runs.

// Logical canvas size. The page scales the canvas to the window; the game
// itself always lays out in this space, so screenshots are deterministic.
export const VIEW = { width: 1280, height: 860 };

// The four elements. `beats` names the element this one has advantage over:
// Ember > Gale > Stone > Tide > Ember, a circle with no dead end.
export const ELEMENTS = {
  ember: { name: 'Ember', color: '#e2482e', dark: '#8f1f10', light: '#ffb199', beats: 'gale', symbol: 'flame' },
  tide: { name: 'Tide', color: '#2e86e2', dark: '#123f7d', light: '#a8cfff', beats: 'ember', symbol: 'wave' },
  gale: { name: 'Gale', color: '#2fae7d', dark: '#0f5c40', light: '#a5ecd2', beats: 'stone', symbol: 'swirl' },
  stone: { name: 'Stone', color: '#c98a2e', dark: '#6e4a10', light: '#ffd98f', beats: 'tide', symbol: 'peak' },
};
export const ELEMENT_ORDER = ['ember', 'gale', 'stone', 'tide'];

// Every card in the game. cost = mana crystals, atk = base damage.
// effect: heal (restore own life), draw (draw cards), shield (gain armour).
// A 30-card deck is two copies of each of these fifteen.
export const CARDS = [
  { id: 'spark', name: 'Ember Spark', element: 'ember', cost: 1, atk: 2, effect: null },
  { id: 'lash', name: 'Tide Lash', element: 'tide', cost: 1, atk: 2, effect: null },
  { id: 'dart', name: 'Gale Dart', element: 'gale', cost: 1, atk: 2, effect: null },
  { id: 'pebble', name: 'Pebble Shot', element: 'stone', cost: 1, atk: 2, effect: null },
  { id: 'imp', name: 'Flame Imp', element: 'ember', cost: 2, atk: 4, effect: null },
  { id: 'serpent', name: 'Wave Serpent', element: 'tide', cost: 2, atk: 4, effect: null },
  { id: 'kite', name: 'Storm Kite', element: 'gale', cost: 2, atk: 4, effect: null },
  { id: 'golem', name: 'Moss Golem', element: 'stone', cost: 2, atk: 3, effect: { shield: 3 } },
  { id: 'drake', name: 'Cinder Drake', element: 'ember', cost: 3, atk: 6, effect: null },
  { id: 'current', name: 'Deep Current', element: 'tide', cost: 3, atk: 5, effect: { draw: 1 } },
  { id: 'talon', name: 'Sky Talon', element: 'gale', cost: 3, atk: 6, effect: null },
  { id: 'heart', name: 'Mountain Heart', element: 'stone', cost: 3, atk: 4, effect: { heal: 4 } },
  { id: 'phoenix', name: 'Phoenix Rebirth', element: 'ember', cost: 4, atk: 7, effect: { heal: 3 } },
  { id: 'maelstrom', name: 'Maelstrom', element: 'tide', cost: 4, atk: 8, effect: null },
  { id: 'avalanche', name: 'Avalanche', element: 'stone', cost: 5, atk: 9, effect: { shield: 2 } },
];
export const DECK_SIZE = 30;
export const HAND_LIMIT = 7;
export const START_LIFE = 20;
export const MAX_MANA = 10;

// The three difficulties, picked on the title screen.
export const DIFFICULTIES = {
  apprentice: { label: 'Apprentice', aiLife: 16, aiCards: 3, aiManaBonus: 0, aiSmart: false, blurb: 'Learn the elements.' },
  adept: { label: 'Adept', aiLife: 20, aiCards: 3, aiManaBonus: 0, aiSmart: true, blurb: 'A fair duel.' },
  archmage: { label: 'Archmage', aiLife: 24, aiCards: 4, aiManaBonus: 1, aiSmart: true, blurb: 'Deeper hand, +1 mana.' },
};

export function cardById(id) {
  return CARDS.find((c) => c.id === id) || null;
}

// Advantage bonus: +2 attack when the played card's element beats the
// opponent's ward (the element of the last card they played).
export const ADVANTAGE_BONUS = 2;
// Resonance bonus: +2 attack when the card's element matches the last card
// the same side played this turn.
export const RESONANCE_BONUS = 2;
