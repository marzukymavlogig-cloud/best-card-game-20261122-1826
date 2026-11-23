// render.js — everything the eye sees. One job: draw the table, the cards,
// the hands, the HUD and the screens on the canvas. All art is drawn here
// in code; no images, no external assets.
import { ELEMENTS, ELEMENT_ORDER, DIFFICULTIES, VIEW } from './config.js';
import { cardDamage } from './combat.js';

const CARD_W = 118;
const CARD_H = 164;

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function text(ctx, s, x, y, font, color, align = 'center', baseline = 'middle') {
  ctx.fillStyle = color;
  ctx.font = font;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  ctx.fillText(s, x, y);
}

/** Draw one element's symbol (flame, wave, swirl, peak) centred at x,y. */
export function drawSymbol(ctx, element, x, y, size, color) {
  const el = ELEMENTS[element];
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.12;
  ctx.lineCap = 'round';
  const s = size;
  if (el.symbol === 'flame') {
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.5);
    ctx.bezierCurveTo(s * 0.42, -s * 0.1, s * 0.34, s * 0.42, 0, s * 0.5);
    ctx.bezierCurveTo(-s * 0.34, s * 0.42, -s * 0.42, -s * 0.1, 0, -s * 0.5);
    ctx.fill();
    ctx.fillStyle = '#fff3c4';
    ctx.beginPath();
    ctx.ellipse(0, s * 0.16, s * 0.13, s * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (el.symbol === 'wave') {
    ctx.beginPath();
    for (let i = 0; i <= 24; i += 1) {
      const px = -s * 0.5 + (i / 24) * s;
      const py = Math.sin((i / 24) * Math.PI * 2) * s * 0.14;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    for (let i = 24; i >= 0; i -= 1) {
      const px = -s * 0.5 + (i / 24) * s;
      const py = Math.sin((i / 24) * Math.PI * 2) * s * 0.14 + s * 0.22;
      ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  } else if (el.symbol === 'swirl') {
    ctx.beginPath();
    for (let a = 0; a <= Math.PI * 3.2; a += 0.15) {
      const r = (a / (Math.PI * 3.2)) * s * 0.5;
      const px = Math.cos(a) * r;
      const py = Math.sin(a) * r;
      if (a === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.1, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.moveTo(-s * 0.5, s * 0.4);
    ctx.lineTo(-s * 0.12, -s * 0.42);
    ctx.lineTo(s * 0.14, s * 0.08);
    ctx.lineTo(s * 0.34, -s * 0.22);
    ctx.lineTo(s * 0.5, s * 0.4);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

/** Draw one card face (or its back). Returns nothing; hit rects live in layout. */
export function drawCardFace(ctx, card, x, y, w, h, opts = {}) {
  const el = ELEMENTS[card.element];
  if (opts.faceDown) {
    rr(ctx, x, y, w, h, 10);
    ctx.fillStyle = '#241a4d';
    ctx.fill();
    ctx.strokeStyle = '#8f7bd8';
    ctx.lineWidth = 2;
    ctx.stroke();
    rr(ctx, x + 8, y + 8, w - 16, h - 16, 7);
    ctx.strokeStyle = '#5d4ba8';
    ctx.stroke();
    drawSymbol(ctx, 'ember', x + w / 2, y + h / 2, Math.min(w, h) * 0.42, '#8f7bd8');
    return;
  }
  const dim = opts.dim;
  rr(ctx, x, y, w, h, 10);
  ctx.fillStyle = dim ? '#3a3348' : '#f7f1de';
  ctx.fill();
  ctx.strokeStyle = dim ? '#555' : el.color;
  ctx.lineWidth = 3;
  ctx.stroke();
  // Element band.
  rr(ctx, x + 6, y + 6, w - 12, 30, 6);
  ctx.fillStyle = el.color;
  ctx.fill();
  text(ctx, el.name.toUpperCase(), x + w / 2, y + 21, `bold ${Math.max(11, w * 0.11)}px Georgia, serif`, '#fff');
  // Cost gem, top-left.
  ctx.beginPath();
  ctx.arc(x + 16, y + 52, 13, 0, Math.PI * 2);
  ctx.fillStyle = '#2b6cb0';
  ctx.fill();
  ctx.strokeStyle = '#bfe0ff';
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, String(card.cost), x + 16, y + 53, 'bold 17px Georgia, serif', '#fff');
  // Element symbol, large.
  drawSymbol(ctx, card.element, x + w / 2, y + h * 0.42, w * 0.42, el.color);
  // Name.
  text(ctx, card.name, x + w / 2, y + h * 0.66, `bold ${Math.max(11, w * 0.105)}px Georgia, serif`, dim ? '#999' : '#241a2e');
  // Effect line.
  if (card.effect) {
    const eff = card.effect.heal ? `Heal ${card.effect.heal}` : card.effect.shield ? `Shield ${card.effect.shield}` : `Draw ${card.effect.draw}`;
    text(ctx, eff, x + w / 2, y + h * 0.78, `${Math.max(10, w * 0.09)}px system-ui, sans-serif`, dim ? '#888' : '#5a4a6a');
  }
  // Attack, bottom-left, big and readable.
  text(ctx, 'ATK', x + 12, y + h - 26, `bold ${Math.max(10, w * 0.09)}px system-ui, sans-serif`, dim ? '#888' : '#8f1f10', 'left');
  text(ctx, String(card.atk), x + 12, y + h - 8, 'bold 26px Georgia, serif', dim ? '#888' : '#241a2e', 'left');
  // Element initial, bottom-right.
  text(ctx, el.name[0], x + w - 14, y + h - 12, 'bold 22px Georgia, serif', el.color, 'right');
}

function lifeBar(ctx, x, y, w, life, maxLife, armor, label) {
  rr(ctx, x, y, w, 26, 13);
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.fill();
  const frac = Math.max(0, life / maxLife);
  if (frac > 0) {
    rr(ctx, x + 2, y + 2, (w - 4) * frac, 22, 11);
    ctx.fillStyle = frac > 0.5 ? '#57c465' : frac > 0.25 ? '#e8a13a' : '#e2482e';
    ctx.fill();
  }
  text(ctx, `${label}  ${life} / ${maxLife}${armor ? `   🛡 ${armor}` : ''}`, x + w / 2, y + 13, 'bold 15px system-ui, sans-serif', '#fff');
}

function manaGems(ctx, x, y, mana, manaMax) {
  text(ctx, 'MANA', x, y - 14, 'bold 12px system-ui, sans-serif', '#bfae7a', 'left');
  for (let i = 0; i < 10; i += 1) {
    const gx = x + i * 26;
    ctx.beginPath();
    ctx.moveTo(gx + 9, y - 2);
    ctx.lineTo(gx + 18, y + 9);
    ctx.lineTo(gx + 9, y + 20);
    ctx.lineTo(gx, y + 9);
    ctx.closePath();
    if (i < manaMax) {
      ctx.fillStyle = i < mana ? '#4fc3f7' : '#274b63';
      ctx.fill();
      ctx.strokeStyle = '#bfe8ff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    } else {
      ctx.strokeStyle = '#3a3a55';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }
  text(ctx, `${mana}/${manaMax}`, x + 268, y + 9, 'bold 16px Georgia, serif', '#bfe8ff', 'left');
}

function panel(ctx, x, y, w, h) {
  rr(ctx, x, y, w, h, 12);
  ctx.fillStyle = 'rgba(12,10,32,0.72)';
  ctx.fill();
  ctx.strokeStyle = '#4a3f7d';
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

export function render(ctx, state) {
  const W = VIEW.width;
  const H = VIEW.height;
  state._layout = { hand: [], endTurn: null, difficulties: [], restart: null };
  // Table.
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#171233');
  grad.addColorStop(0.5, '#1d2b4d');
  grad.addColorStop(1, '#141126');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = '#c9a227';
  ctx.lineWidth = 4;
  ctx.strokeRect(8, 8, W - 16, H - 16);
  ctx.strokeStyle = 'rgba(201,162,39,0.25)';
  ctx.lineWidth = 1;
  ctx.strokeRect(20, 20, W - 40, H - 40);

  if (state.screen === 'title') return renderTitle(ctx, state);
  if (state.screen === 'win' || state.screen === 'loss') {
    renderDuel(ctx, state);
    return renderEnd(ctx, state);
  }
  renderDuel(ctx, state);
  if (state.paused) {
    ctx.fillStyle = 'rgba(8,6,20,0.72)';
    ctx.fillRect(0, 0, W, H);
    text(ctx, 'PAUSED', 640, 380, 'bold 64px Georgia, serif', '#ffd34d');
    text(ctx, 'Esc — resume    R — restart    M — mute', 640, 440, '20px system-ui, sans-serif', '#cfc6ee');
  }
}

function renderTitle(ctx, state) {
  text(ctx, 'EMBER SIGILS', 640, 130, 'bold 84px Georgia, serif', '#ffd34d');
  text(ctx, '— Duel of the Four Elements —', 640, 185, 'italic 26px Georgia, serif', '#cfc6ee');
  text(ctx, 'An original card duel. Outwit Mira the Tidecaller, turn by turn.', 640, 222, '19px system-ui, sans-serif', '#a99fd0');

  // Advantage circle: Ember > Gale > Stone > Tide > Ember.
  const cx = 640;
  const cy = 335;
  const R = 66;
  const order = ['ember', 'gale', 'stone', 'tide'];
  const pos = order.map((el, i) => {
    const a = -Math.PI / 2 + (i / 4) * Math.PI * 2;
    return { el, x: cx + Math.cos(a) * R, y: cy + Math.sin(a) * R };
  });
  ctx.strokeStyle = '#8f7bd8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.stroke();
  for (let i = 0; i < 4; i += 1) {
    const a = pos[i];
    const b = pos[(i + 1) % 4];
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    text(ctx, '›', mx, my, 'bold 22px Georgia, serif', '#ffd34d');
  }
  for (const p of pos) {
    const el = ELEMENTS[p.el];
    ctx.beginPath();
    ctx.arc(p.x, p.y, 34, 0, Math.PI * 2);
    ctx.fillStyle = el.color;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    drawSymbol(ctx, p.el, p.x, p.y, 30, '#fff');
    text(ctx, el.name, p.x, p.y + 52, 'bold 15px system-ui, sans-serif', '#fff');
  }
  text(ctx, 'Advantage +2 attack  •  Same element twice in a row: Resonance +2', 640, 482, '17px system-ui, sans-serif', '#cfc6ee');

  // Difficulty buttons.
  const keys = ['apprentice', 'adept', 'archmage'];
  keys.forEach((key, i) => {
    const d = DIFFICULTIES[key];
    const x = 290 + i * 240;
    const y = 520;
    const w = 220;
    const h = 96;
    const sel = state.difficulty === key;
    rr(ctx, x, y, w, h, 12);
    ctx.fillStyle = sel ? '#3a2c12' : 'rgba(12,10,32,0.8)';
    ctx.fill();
    ctx.strokeStyle = sel ? '#ffd34d' : '#4a3f7d';
    ctx.lineWidth = sel ? 3 : 1.5;
    ctx.stroke();
    text(ctx, `${i + 1} — ${d.label}`, x + w / 2, y + 24, 'bold 20px Georgia, serif', sel ? '#ffd34d' : '#fff');
    text(ctx, `Mira: ${d.aiLife} life`, x + w / 2, y + 50, '15px system-ui, sans-serif', '#cfc6ee');
    text(ctx, d.blurb, x + w / 2, y + 74, '13px system-ui, sans-serif', '#a99fd0');
    state._layout.difficulties.push({ key, x, y, w, h });
  });
  text(ctx, 'Click a difficulty — or press 1 / 2 / 3 — to begin the duel', 640, 652, '18px system-ui, sans-serif', '#fff');
  text(ctx, 'Play cards with click or keys 1–7  •  Space — end turn  •  R — restart  •  M — mute  •  Esc — pause', 640, 688, '16px system-ui, sans-serif', '#a99fd0');
  text(ctx, 'Mana grows each round. Armour soaks damage. An empty deck costs 1 life.', 640, 718, '16px system-ui, sans-serif', '#a99fd0');
  if (state.record.wins + state.record.losses > 0) {
    text(ctx, `Session record: ${state.record.wins} wins — ${state.record.losses} losses`, 640, 752, 'bold 18px Georgia, serif', '#ffd34d');
  }
  text(ctx, 'Best of luck, duelist. The sigils are listening.', 640, 800, 'italic 16px Georgia, serif', '#8f7bd8');
}

function renderDuel(ctx, state) {
  const W = VIEW.width;
  // Top bar.
  text(ctx, 'EMBER SIGILS', 90, 40, 'bold 22px Georgia, serif', '#ffd34d', 'left');
  text(ctx, `Round ${state.round}  •  ${DIFFICULTIES[state.difficulty].label}`, 640, 40, 'bold 17px system-ui, sans-serif', '#cfc6ee');
  text(ctx, `Wins ${state.record.wins} — Losses ${state.record.losses}`, 1190, 40, 'bold 17px system-ui, sans-serif', '#cfc6ee', 'right');

  // Opponent: portrait, name, life, ward, deck.
  ctx.beginPath();
  ctx.arc(80, 108, 34, 0, Math.PI * 2);
  ctx.fillStyle = ELEMENTS.tide.color;
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.stroke();
  drawSymbol(ctx, 'tide', 80, 108, 34, '#fff');
  text(ctx, 'MIRA, THE TIDECALLER', 130, 92, 'bold 20px Georgia, serif', '#fff', 'left');
  text(ctx, state.phase === 'ai' ? '— thinking…' : state.phase === 'player' ? '— your move' : '', 130, 118, '16px system-ui, sans-serif', '#a99fd0', 'left');
  lifeBar(ctx, 130, 130, 340, state.ai.life, state.ai.maxLife, state.ai.armor, 'LIFE');
  if (state.ai.ward) {
    const el = ELEMENTS[state.ai.ward];
    rr(ctx, 490, 130, 150, 26, 13);
    ctx.fillStyle = el.color;
    ctx.fill();
    text(ctx, `Ward: ${el.name}`, 565, 143, 'bold 14px system-ui, sans-serif', '#fff');
  }
  text(ctx, `Deck ${state.ai.deck.length}   Discard ${state.ai.discard.length}`, 660, 143, '15px system-ui, sans-serif', '#a99fd0', 'left');

  // Opponent hand, face down, fanned across the top.
  const aiHand = state.ai.hand;
  const aiW = 62;
  const aiH = 86;
  const aiSpan = Math.min(560, aiHand.length * 52);
  const aiX0 = 640 - aiSpan / 2;
  aiHand.forEach((_, i) => {
    const x = aiX0 + (aiHand.length > 1 ? (i / (aiHand.length - 1)) * (aiSpan - aiW) : 0);
    drawCardFace(ctx, { element: 'ember' }, x, 176, aiW, aiH, { faceDown: true });
  });
  text(ctx, `Mira holds ${aiHand.length} card${aiHand.length === 1 ? '' : 's'}`, 640, 282, '15px system-ui, sans-serif', '#a99fd0');

  // Battlefield: last plays, centre.
  panel(ctx, 330, 300, 620, 150);
  text(ctx, 'LAST PLAYS', 640, 322, 'bold 13px system-ui, sans-serif', '#8f7bd8');
  const plays = state.plays;
  if (plays.length === 0) {
    text(ctx, 'No cards played yet — the table waits.', 640, 380, 'italic 18px Georgia, serif', '#a99fd0');
  } else {
    plays.slice(0, 2).forEach((play, i) => {
      const el = ELEMENTS[play.card.element];
      const x = 360 + i * 300;
      drawSymbol(ctx, play.card.element, x + 30, 388, 44, el.color);
      text(ctx, `${play.side === 'player' ? 'YOU' : 'MIRA'} — ${play.card.name}`, x + 62, 372, 'bold 17px Georgia, serif', '#fff', 'left');
      text(ctx, `${play.dmg} damage${play.notes.length ? '  (' + play.notes.join(', ') + ')' : ''}`, x + 62, 400, '15px system-ui, sans-serif', '#ffd34d', 'left');
      text(ctx, `${ELEMENTS[play.card.element].name}  •  cost ${play.card.cost}  •  ATK ${play.card.atk}`, x + 62, 424, '14px system-ui, sans-serif', '#a99fd0', 'left');
    });
  }

  // Turn log, right side.
  panel(ctx, 1000, 300, 250, 260);
  text(ctx, 'TURN LOG', 1125, 322, 'bold 13px system-ui, sans-serif', '#8f7bd8');
  state.log.slice(-8).forEach((line, i) => {
    const shown = line.length > 36 ? line.slice(0, 35) + '…' : line;
    text(ctx, shown, 1014, 348 + i * 26, '13px system-ui, sans-serif', '#cfc6ee', 'left');
  });

  // Floating damage numbers.
  for (const f of state.floats) {
    const alpha = Math.max(0, Math.min(1, f.t));
    ctx.globalAlpha = alpha;
    text(ctx, f.text, f.x, f.y - (1.2 - f.t) * 30, 'bold 40px Georgia, serif', f.color);
    ctx.globalAlpha = 1;
  }

  // Player info: life, armour, deck, mana.
  text(ctx, 'YOU', 60, 600, 'bold 20px Georgia, serif', '#fff', 'left');
  lifeBar(ctx, 60, 618, 340, state.player.life, state.player.maxLife, state.player.armor, 'LIFE');
  if (state.player.ward) {
    const el = ELEMENTS[state.player.ward];
    rr(ctx, 420, 618, 150, 26, 13);
    ctx.fillStyle = el.color;
    ctx.fill();
    text(ctx, `Ward: ${el.name}`, 495, 631, 'bold 14px system-ui, sans-serif', '#fff');
  }
  text(ctx, `Deck ${state.player.deck.length}   Discard ${state.player.discard.length}`, 590, 631, '15px system-ui, sans-serif', '#a99fd0', 'left');
  manaGems(ctx, 60, 668, state.mana, state.manaMax);

  // End Turn button.
  const et = { x: 1090, y: 620, w: 150, h: 52 };
  const canEnd = state.screen === 'duel' && state.phase === 'player' && !state.paused;
  rr(ctx, et.x, et.y, et.w, et.h, 10);
  ctx.fillStyle = canEnd ? '#c9a227' : '#3a3348';
  ctx.fill();
  ctx.strokeStyle = canEnd ? '#ffe9a8' : '#555';
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, state.phase === 'ai' ? "MIRA'S TURN" : 'END TURN', et.x + et.w / 2, et.y + 27, 'bold 17px Georgia, serif', canEnd ? '#241a2e' : '#999');
  state._layout.endTurn = et;

  // Player hand, fanned along the bottom.
  const hand = state.player.hand;
  const span = Math.min(760, hand.length * 108);
  const x0 = 640 - span / 2;
  hand.forEach((card, i) => {
    const x = x0 + (hand.length > 1 ? (i / (hand.length - 1)) * (span - CARD_W) : 0);
    const hover = state.hover === i;
    const y = 676 - (hover ? 26 : 0);
    const affordable = card.cost <= state.mana && state.phase === 'player' && state.screen === 'duel';
    drawCardFace(ctx, card, x, y, CARD_W, CARD_H, { dim: !affordable });
    if (hover && affordable) {
      const { dmg, notes } = cardDamage(state, 'player', card);
      text(ctx, `Would deal ${dmg} damage${notes.length ? ' (' + notes.join(', ') + ')' : ''}`, 640, 600, 'bold 16px system-ui, sans-serif', '#ffd34d');
    }
    if (hover) {
      ctx.strokeStyle = '#ffd34d';
      ctx.lineWidth = 3;
      rr(ctx, x - 2, y - 2, CARD_W + 4, CARD_H + 4, 12);
      ctx.stroke();
    }
    // Key badge on the card's top-right corner: press 1–7 to play.
    ctx.beginPath();
    ctx.arc(x + CARD_W - 6, y + 6, 11, 0, Math.PI * 2);
    ctx.fillStyle = '#c9a227';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    text(ctx, String(i + 1), x + CARD_W - 6, y + 7, 'bold 13px Georgia, serif', '#241a2e');
    state._layout.hand.push({ x, y, w: CARD_W, h: CARD_H, index: i });
  });

  // Turn banner.
  if (state.bannerT > 0 && state.banner) {
    ctx.globalAlpha = Math.min(1, state.bannerT);
    text(ctx, state.banner, 640, 520, 'bold 44px Georgia, serif', '#ffd34d');
    ctx.globalAlpha = 1;
  }

  // Footer hints.
  text(ctx, '1–7 play card   •   Space end turn   •   R restart   •   M mute   •   Esc pause', 640, 844, '12px system-ui, sans-serif', '#6f659a');
}

function renderEnd(ctx, state) {
  const won = state.screen === 'win';
  ctx.fillStyle = 'rgba(8,6,20,0.78)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  panel(ctx, 340, 190, 600, 420);
  text(ctx, won ? 'VICTORY' : 'DEFEAT', 640, 270, 'bold 72px Georgia, serif', won ? '#ffd34d' : '#e2482e');
  text(ctx, won ? 'Mira bows. The sigils are yours.' : 'Mira: "The tide takes another ember."', 640, 330, 'italic 22px Georgia, serif', '#cfc6ee');
  text(ctx, `Rounds played: ${state.stats.rounds}    Cards played: ${state.stats.played}    Damage dealt: ${state.stats.damage}`, 640, 390, '18px system-ui, sans-serif', '#fff');
  text(ctx, `Session record: ${state.record.wins} wins — ${state.record.losses} losses`, 640, 428, 'bold 19px Georgia, serif', '#ffd34d');
  text(ctx, won ? '🏆  The duel is won — but Mira will want a rematch.' : 'The table is reset. Study the elements and try again.', 640, 466, '17px system-ui, sans-serif', '#a99fd0');
  text(ctx, 'R — duel again      Esc — title screen', 640, 540, 'bold 19px system-ui, sans-serif', '#fff');
}
