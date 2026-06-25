// Synthesized sound effects via the Web Audio API — no audio files, so nothing
// to license (BRIEF §5). Off by default; toggled from the Sounds menu.

export type Sfx = 'buy' | 'sell' | 'travel' | 'encounter' | 'cash' | 'lose' | 'click';

let ctx: AudioContext | null = null;
let enabled = false;

function ensureCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  // Browsers start the context suspended until a user gesture.
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

export function setSoundEnabled(on: boolean): void {
  enabled = on;
  if (on) ensureCtx();
}

export function isSoundEnabled(): boolean {
  return enabled;
}

/** Play a short tone (or sequence) with a quick decay envelope. */
function tone(notes: Array<[freq: number, start: number, dur: number]>, type: OscillatorType, vol: number) {
  const ac = ensureCtx();
  if (!ac) return;
  const now = ac.currentTime;
  for (const [freq, start, dur] of notes) {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, now + start);
    gain.gain.linearRampToValueAtTime(vol, now + start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);
    osc.connect(gain).connect(ac.destination);
    osc.start(now + start);
    osc.stop(now + start + dur + 0.02);
  }
}

export function playSfx(name: Sfx): void {
  if (!enabled) return;
  switch (name) {
    case 'buy':
      tone([[440, 0, 0.08], [660, 0.06, 0.1]], 'square', 0.06);
      break;
    case 'sell':
    case 'cash':
      tone([[660, 0, 0.07], [880, 0.06, 0.1], [1320, 0.12, 0.12]], 'square', 0.06);
      break;
    case 'travel':
      tone([[330, 0, 0.12]], 'sawtooth', 0.05);
      break;
    case 'encounter':
      tone([[160, 0, 0.18], [120, 0.14, 0.22]], 'sawtooth', 0.08);
      break;
    case 'lose':
      tone([[300, 0, 0.2], [220, 0.18, 0.25], [140, 0.38, 0.4]], 'triangle', 0.08);
      break;
    case 'click':
      tone([[800, 0, 0.04]], 'square', 0.03);
      break;
  }
}
