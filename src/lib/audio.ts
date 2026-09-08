"use client";

import {
  initSpeech,
  setSpeechMuted,
  unlockSpeech,
} from "@/lib/speech";

export {
  enqueueSpeech,
  isSpeaking,
  isSpeechBusy,
  speak,
  speakExclusive,
  speakSequence,
  speakTapped,
  stopSpeaking,
  subscribeSpeechBusy,
  type SpeakOptions,
} from "@/lib/speech";

let audioCtx: AudioContext | null = null;
let muted = false;
let unlocked = false;

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const Constructor =
      window.AudioContext ?? (window as WebkitWindow).webkitAudioContext;
    if (!Constructor) return null;
    audioCtx = new Constructor();
  }
  if (audioCtx.state === "suspended") void audioCtx.resume();
  return audioCtx;
}

export function initAudio() {
  initSpeech();
}

/** Unlock Web Audio and the reusable speech player in the first real tap. */
export function unlockAudio() {
  const context = getCtx();
  if (context) {
    const source = context.createBufferSource();
    source.buffer = context.createBuffer(1, 1, 22050);
    source.connect(context.destination);
    source.start(0);
  }
  unlockSpeech();
  unlocked = true;
}

export function isUnlocked() {
  return unlocked;
}

/** Shared with the microphone listener so both live on one AudioContext. */
export function getAudioContext(): AudioContext | null {
  return getCtx();
}

export function setMuted(value: boolean) {
  muted = value;
  setSpeechMuted(value);
}

function tone(
  frequency: number,
  startOffset: number,
  duration: number,
  {
    type = "sine",
    gain = 0.18,
    sweepTo,
  }: { type?: OscillatorType; gain?: number; sweepTo?: number } = {},
) {
  const context = getCtx();
  if (!context || muted) return;
  const startedAt = context.currentTime + startOffset;
  const oscillator = context.createOscillator();
  const amplifier = context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startedAt);
  if (sweepTo) {
    oscillator.frequency.exponentialRampToValueAtTime(
      sweepTo,
      startedAt + duration,
    );
  }
  amplifier.gain.setValueAtTime(0.0001, startedAt);
  amplifier.gain.exponentialRampToValueAtTime(gain, startedAt + 0.012);
  amplifier.gain.exponentialRampToValueAtTime(
    0.0001,
    startedAt + duration,
  );
  oscillator.connect(amplifier).connect(context.destination);
  oscillator.start(startedAt);
  oscillator.stop(startedAt + duration + 0.05);
}

function noise(startOffset: number, duration: number, gainValue = 0.12) {
  const context = getCtx();
  if (!context || muted) return;
  const startedAt = context.currentTime + startOffset;
  const frames = Math.floor(context.sampleRate * duration);
  const buffer = context.createBuffer(1, frames, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let index = 0; index < frames; index += 1) {
    data[index] =
      (Math.random() * 2 - 1) * (1 - index / frames);
  }
  const source = context.createBufferSource();
  source.buffer = buffer;
  const filter = context.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 1400;
  const amplifier = context.createGain();
  amplifier.gain.value = gainValue;
  source.connect(filter).connect(amplifier).connect(context.destination);
  source.start(startedAt);
}

export function sfxTap() {
  tone(660, 0, 0.09, { type: "triangle", gain: 0.14 });
}

export function sfxPop() {
  tone(880, 0, 0.12, {
    type: "sine",
    gain: 0.2,
    sweepTo: 220,
  });
  noise(0, 0.08, 0.06);
}

export function sfxWhoosh() {
  noise(0, 0.22, 0.07);
  tone(300, 0, 0.2, {
    type: "sine",
    gain: 0.08,
    sweepTo: 900,
  });
}

export function sfxSuccess() {
  [523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => {
    tone(frequency, index * 0.09, 0.28, {
      type: "triangle",
      gain: 0.16,
    });
  });
}

export function sfxSparkle() {
  [1318.5, 1567.98, 2093].forEach((frequency, index) => {
    tone(frequency, index * 0.06, 0.18, {
      type: "sine",
      gain: 0.09,
    });
  });
}

export function sfxFanfare() {
  const notes = [
    523.25, 523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5,
  ];
  notes.forEach((frequency, index) => {
    tone(frequency, index * 0.13, 0.3, {
      type: "triangle",
      gain: 0.15,
    });
  });
}

/** Soft and short: a missed balloon is a small "aw", never a buzzer. */
export function sfxMiss() {
  tone(392, 0, 0.18, {
    type: "sine",
    gain: 0.12,
    sweepTo: 262,
  });
  tone(262, 0.14, 0.22, { type: "sine", gain: 0.08 });
}

export function sfxWhistle() {
  tone(784, 0, 0.55, {
    type: "sine",
    gain: 0.13,
    sweepTo: 587,
  });
  tone(1175, 0.04, 0.5, {
    type: "sine",
    gain: 0.08,
    sweepTo: 880,
  });
  noise(0, 0.5, 0.04);
}

/** Chuffs that speed up as the train pulls away. */
export function sfxChuffs() {
  let at = 0;
  for (let index = 0; index < 11; index += 1) {
    noise(at, 0.13, 0.09);
    tone(110, at, 0.11, { type: "sine", gain: 0.09 });
    at += Math.max(0.1, 0.3 - index * 0.02);
  }
}

export function sfxCouple() {
  tone(160, 0, 0.1, { type: "square", gain: 0.07 });
  noise(0.02, 0.09, 0.05);
}

export function sfxDoor() {
  tone(392, 0, 0.16, {
    type: "triangle",
    gain: 0.14,
    sweepTo: 784,
  });
  tone(784, 0.1, 0.22, { type: "sine", gain: 0.1 });
}

export function vibrate(pattern: number | number[] = 12) {
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) {
    return;
  }
  try {
    navigator.vibrate(pattern);
  } catch {
    // Unsupported on iOS; the visual and audio feedback remain.
  }
}
