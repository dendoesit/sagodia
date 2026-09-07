/**
 * Audio for a pre-reader game: spoken English words plus synthesized sound
 * effects. Everything is generated at runtime so the app ships no media files
 * and works offline once installed.
 *
 * iOS only allows audio and speech that starts inside a user gesture, so
 * `unlockAudio()` must be called from the first tap (see StartGate).
 */

let audioCtx: AudioContext | null = null;
let voices: SpeechSynthesisVoice[] = [];
let muted = false;
let speechRate = 0.85;
let unlocked = false;

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const Ctor = window.AudioContext ?? (window as WebkitWindow).webkitAudioContext;
    if (!Ctor) return null;
    audioCtx = new Ctor();
  }
  if (audioCtx.state === "suspended") void audioCtx.resume();
  return audioCtx;
}

function hasSpeech(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

function refreshVoices() {
  if (!hasSpeech()) return;
  voices = window.speechSynthesis.getVoices();
}

export function initAudio() {
  if (!hasSpeech()) return;
  refreshVoices();
  window.speechSynthesis.addEventListener("voiceschanged", refreshVoices);
}

/** Must run inside a real user gesture, once per session. */
export function unlockAudio() {
  const ctx = getCtx();
  if (ctx) {
    const source = ctx.createBufferSource();
    source.buffer = ctx.createBuffer(1, 1, 22050);
    source.connect(ctx.destination);
    source.start(0);
  }
  if (hasSpeech()) {
    refreshVoices();
    const primer = new SpeechSynthesisUtterance(" ");
    primer.volume = 0;
    window.speechSynthesis.speak(primer);
  }
  unlocked = true;
}

export function isUnlocked() {
  return unlocked;
}

export function setMuted(value: boolean) {
  muted = value;
  if (value && hasSpeech()) window.speechSynthesis.cancel();
}

export function setSpeechRate(rate: number) {
  speechRate = rate;
}

/** Prefer warm, clear voices that toddlers find easy to follow. */
const PREFERRED_VOICES = [
  "Samantha",
  "Karen",
  "Moira",
  "Google US English",
  "Microsoft Aria",
  "Microsoft Jenny",
  "Microsoft Zira",
  "Fiona",
];

function pickVoice(): SpeechSynthesisVoice | null {
  const english = voices.filter((v) => v.lang.replace("_", "-").toLowerCase().startsWith("en"));
  if (english.length === 0) return null;
  for (const name of PREFERRED_VOICES) {
    const match = english.find((v) => v.name.includes(name));
    if (match) return match;
  }
  return english.find((v) => v.lang.toLowerCase().startsWith("en-us")) ?? english[0];
}

export type SpeakOptions = {
  /** Cut off whatever is currently being said. Default true. */
  interrupt?: boolean;
  /** Multiplier applied on top of the global rate. */
  rate?: number;
  pitch?: number;
  delay?: number;
  onEnd?: () => void;
};

export function speak(text: string, options: SpeakOptions = {}) {
  const { interrupt = true, rate = 1, pitch = 1.15, delay = 0, onEnd } = options;
  if (muted || !hasSpeech()) {
    if (onEnd) window.setTimeout(onEnd, 300);
    return;
  }
  const start = () => {
    if (muted) return;
    if (interrupt) window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = pickVoice();
    if (voice) utterance.voice = voice;
    utterance.lang = voice?.lang ?? "en-US";
    utterance.rate = Math.max(0.4, Math.min(1.4, speechRate * rate));
    utterance.pitch = pitch;
    utterance.volume = 1;
    if (onEnd) utterance.onend = () => onEnd();
    window.speechSynthesis.speak(utterance);
  };
  if (delay > 0) window.setTimeout(start, delay);
  else start();
}

/** Say several short phrases back to back, e.g. ["Cow", "Moo"]. */
export function speakSequence(parts: string[], options: SpeakOptions = {}) {
  parts.forEach((part, index) => {
    speak(part, { ...options, interrupt: index === 0 && options.interrupt !== false });
  });
}

export function stopSpeaking() {
  if (hasSpeech()) window.speechSynthesis.cancel();
}

function tone(
  freq: number,
  startOffset: number,
  duration: number,
  {
    type = "sine",
    gain = 0.18,
    sweepTo,
  }: { type?: OscillatorType; gain?: number; sweepTo?: number } = {},
) {
  const ctx = getCtx();
  if (!ctx || muted) return;
  const t0 = ctx.currentTime + startOffset;
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (sweepTo) osc.frequency.exponentialRampToValueAtTime(sweepTo, t0 + duration);
  amp.gain.setValueAtTime(0.0001, t0);
  amp.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(amp).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.05);
}

function noise(startOffset: number, duration: number, gainValue = 0.12) {
  const ctx = getCtx();
  if (!ctx || muted) return;
  const t0 = ctx.currentTime + startOffset;
  const frames = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frames; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 1400;
  const amp = ctx.createGain();
  amp.gain.value = gainValue;
  source.connect(filter).connect(amp).connect(ctx.destination);
  source.start(t0);
}

export function sfxTap() {
  tone(660, 0, 0.09, { type: "triangle", gain: 0.14 });
}

export function sfxPop() {
  tone(880, 0, 0.12, { type: "sine", gain: 0.2, sweepTo: 220 });
  noise(0, 0.08, 0.06);
}

export function sfxWhoosh() {
  noise(0, 0.22, 0.07);
  tone(300, 0, 0.2, { type: "sine", gain: 0.08, sweepTo: 900 });
}

export function sfxSuccess() {
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
    tone(f, i * 0.09, 0.28, { type: "triangle", gain: 0.16 });
  });
}

export function sfxSparkle() {
  [1318.5, 1567.98, 2093].forEach((f, i) => {
    tone(f, i * 0.06, 0.18, { type: "sine", gain: 0.09 });
  });
}

export function sfxFanfare() {
  const notes = [523.25, 523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5];
  notes.forEach((f, i) => {
    tone(f, i * 0.13, 0.3, { type: "triangle", gain: 0.15 });
  });
}

export function sfxDoor() {
  tone(392, 0, 0.16, { type: "triangle", gain: 0.14, sweepTo: 784 });
  tone(784, 0.1, 0.22, { type: "sine", gain: 0.1 });
}

export function vibrate(pattern: number | number[] = 12) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      /* ignored: unsupported on iOS */
    }
  }
}
