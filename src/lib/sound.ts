/**
 * Tiny synthesized sound engine — no audio files, everything is generated
 * with the Web Audio API. Keeps the bundle small and avoids asset licensing.
 *
 * Browsers require a user gesture before audio can play, so the
 * AudioContext is created lazily on first call (which always happens from
 * inside a click handler in this app).
 */
let ctx: AudioContext | null = null;
let ambientNodes: {
  osc1: OscillatorNode;
  osc2: OscillatorNode;
  gain: GainNode;
  filter: BiquadFilterNode;
} | null = null;
let soundEnabled = typeof window !== "undefined" ? localStorage.getItem("setupverse-sound") !== "0" : true;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function isSoundEnabled() {
  return soundEnabled;
}

export function setSoundEnabled(next: boolean) {
  soundEnabled = next;
  if (typeof window !== "undefined") localStorage.setItem("setupverse-sound", next ? "1" : "0");
  if (!next) stopAmbient();
}

/** A short, soft blip for UI interactions. Pitch varies so repeated clicks don't feel robotic. */
export function playClick(freq = 660) {
  if (!soundEnabled) return;
  const c = getCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, c.currentTime);
  osc.frequency.exponentialRampToValueAtTime(freq * 0.72, c.currentTime + 0.09);
  gain.gain.setValueAtTime(0.001, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.06, c.currentTime + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.14);
  osc.connect(gain).connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + 0.16);
}

/** A slightly brighter confirmation chime — used for save/success actions. */
export function playSuccess() {
  if (!soundEnabled) return;
  playClick(520);
  setTimeout(() => playClick(780), 90);
}

/** A soft low thud — used for destructive/reset actions. */
export function playThud() {
  if (!soundEnabled) return;
  const c = getCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(180, c.currentTime);
  osc.frequency.exponentialRampToValueAtTime(70, c.currentTime + 0.18);
  gain.gain.setValueAtTime(0.08, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.22);
  osc.connect(gain).connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + 0.24);
}

/** Converts a hex color to a hue in [0, 360), used to tint the ambient drone's tone. */
function hexToHue(hex: string): number {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(
    hex.length === 4
      ? hex.replace(/^#?([0-9a-f])([0-9a-f])([0-9a-f])$/i, "#$1$1$2$2$3$3")
      : hex,
  );
  if (!m) return 190;
  const r = parseInt(m[1]!, 16) / 255;
  const g = parseInt(m[2]!, 16) / 255;
  const b = parseInt(m[3]!, 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  if (d === 0) return 190;
  let h = 0;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h *= 60;
  return h < 0 ? h + 360 : h;
}

/** Starts (or re-tints) a soft ambient drone whose brightness follows the given accent color. */
export function startAmbient(colorHex: string) {
  if (!soundEnabled) return;
  const c = getCtx();
  if (!c) return;
  const hue = hexToHue(colorHex);
  // Map hue to a pleasant low base frequency — warmer hues sit lower, cooler hues higher.
  const base = 55 + (hue / 360) * 20;

  if (ambientNodes) {
    ambientNodes.osc1.frequency.setTargetAtTime(base, c.currentTime, 0.6);
    ambientNodes.osc2.frequency.setTargetAtTime(base * 1.5, c.currentTime, 0.6);
    ambientNodes.filter.frequency.setTargetAtTime(400 + hue * 4, c.currentTime, 0.6);
    return;
  }

  const osc1 = c.createOscillator();
  const osc2 = c.createOscillator();
  const filter = c.createBiquadFilter();
  const gain = c.createGain();
  osc1.type = "sine";
  osc2.type = "sine";
  osc1.frequency.value = base;
  osc2.frequency.value = base * 1.5;
  filter.type = "lowpass";
  filter.frequency.value = 400 + hue * 4;
  filter.Q.value = 0.7;
  gain.gain.value = 0;
  osc1.connect(filter);
  osc2.connect(filter);
  filter.connect(gain).connect(c.destination);
  osc1.start();
  osc2.start();
  gain.gain.linearRampToValueAtTime(0.028, c.currentTime + 1.2);
  ambientNodes = { osc1, osc2, gain, filter };
}

export function setAmbientColor(colorHex: string) {
  if (ambientNodes) startAmbient(colorHex);
}

export function stopAmbient() {
  if (!ambientNodes || !ctx) return;
  const c = ctx;
  const nodes = ambientNodes;
  nodes.gain.gain.linearRampToValueAtTime(0, c.currentTime + 0.4);
  setTimeout(() => {
    nodes.osc1.stop();
    nodes.osc2.stop();
  }, 450);
  ambientNodes = null;
}
