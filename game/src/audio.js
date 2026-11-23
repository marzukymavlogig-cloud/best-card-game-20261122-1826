// audio.js — WebAudio synth sounds. One job: make every sound from code.
// No audio files, no network. Mute toggles everything.
export function createAudio() {
  let ctx = null;
  let muted = false;

  function ensure() {
    if (!ctx) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        ctx = new AC();
      } catch {
        ctx = null;
      }
    }
    if (ctx && ctx.state === 'suspended') void ctx.resume();
    return ctx;
  }

  function tone(freq, dur, type, vol, when = 0, slide = 0) {
    if (muted) return;
    const ac = ensure();
    if (!ac) return;
    const t0 = ac.currentTime + when;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t0 + dur);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  return {
    get muted() { return muted; },
    toggleMute() { muted = !muted; return muted; },
    unlock() { ensure(); },
    playCard(element) {
      const base = { ember: 320, tide: 260, gale: 420, stone: 180 }[element] || 300;
      tone(base, 0.12, 'triangle', 0.16);
      tone(base * 1.5, 0.16, 'triangle', 0.12, 0.05);
    },
    denied() { tone(140, 0.12, 'square', 0.08, 0, -40); },
    draw() { tone(520, 0.07, 'sine', 0.1); },
    heal() { tone(660, 0.12, 'sine', 0.12); tone(880, 0.16, 'sine', 0.1, 0.08); },
    endTurn() { tone(240, 0.1, 'triangle', 0.12); tone(180, 0.14, 'triangle', 0.1, 0.07); },
    win() {
      [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.28, 'triangle', 0.16, i * 0.13));
    },
    lose() {
      [392, 330, 262, 196].forEach((f, i) => tone(f, 0.3, 'sine', 0.14, i * 0.15));
    },
    click() { tone(700, 0.05, 'sine', 0.08); },
  };
}
