"use client";

import { SPEECH_CLIPS } from "@/lib/speechClips.generated";

export type SpeakOptions = {
  /** Cut off whatever is currently being said. Default true. */
  interrupt?: boolean;
  /** Multiplier applied on top of the parent's selected speed. */
  rate?: number;
  pitch?: number;
  delay?: number;
  onEnd?: () => void;
};

let muted = false;
let speechRate = 1;
let media: HTMLAudioElement | null = null;
let activeUtterance: SpeechSynthesisUtterance | null = null;
let timer: number | undefined;
let batchId = 0;
let busy = false;
let voices: SpeechSynthesisVoice[] = [];
const busyListeners = new Set<() => void>();
/** Keeps two short words from running into one another. */
const BETWEEN_WORDS_MS = 220;
/** Small hands need a beat after a phrase before another tap can replace it. */
const AFTER_PHRASE_MS = 280;

type WebSpeechWindow = Window & {
  speechSynthesis?: SpeechSynthesis;
  SpeechSynthesisUtterance?: typeof SpeechSynthesisUtterance;
};

function hasWebSpeech(): boolean {
  if (typeof window === "undefined") return false;
  const speechWindow = window as WebSpeechWindow;
  return Boolean(
    speechWindow.speechSynthesis &&
      speechWindow.SpeechSynthesisUtterance,
  );
}

function refreshVoices() {
  if (!hasWebSpeech()) return;
  voices = window.speechSynthesis.getVoices();
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .trim()
    .replace(/\s+/g, " ");
}

function ensureMedia(): HTMLAudioElement | null {
  if (typeof Audio === "undefined") return null;
  if (!media) {
    media = new Audio();
    media.preload = "auto";
  }
  return media;
}

function setBusy(value: boolean) {
  if (busy === value) return;
  busy = value;
  busyListeners.forEach((listener) => listener());
}

function clearCurrent() {
  window.clearTimeout(timer);
  const player = media;
  if (player) {
    player.onended = null;
    player.onerror = null;
    player.pause();
    player.removeAttribute("src");
    player.load();
  }
  if (hasWebSpeech()) window.speechSynthesis.cancel();
  if (activeUtterance) {
    activeUtterance.onend = null;
    activeUtterance.onerror = null;
    activeUtterance = null;
  }
}

/** Warm, clear voices used only when a sentence has no bundled clip. */
const PREFERRED_VOICES = [
  "Samantha",
  "Ava",
  "Allison",
  "Susan",
  "Karen",
  "Moira",
  "Fiona",
  "Google US English",
  "Microsoft Aria",
  "Microsoft Jenny",
  "Microsoft Michelle",
  "Microsoft Zira",
];

function pickVoice(): SpeechSynthesisVoice | null {
  const english = voices.filter((voice) =>
    voice.lang.replace("_", "-").toLowerCase().startsWith("en"),
  );
  for (const name of PREFERRED_VOICES) {
    const match = english.find((voice) => voice.name.includes(name));
    if (match) return match;
  }
  return (
    english.find((voice) =>
      voice.lang.replace("_", "-").toLowerCase().startsWith("en-us"),
    ) ??
    english[0] ??
    null
  );
}

function speakWithBrowser(
  text: string,
  rate: number,
  pitch: number,
  done: () => void,
) {
  if (!hasWebSpeech()) {
    done();
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  const voice = pickVoice();
  if (voice) utterance.voice = voice;
  utterance.lang = voice?.lang ?? "en-US";
  utterance.rate = Math.max(
    0.5,
    Math.min(1.25, 0.82 * speechRate * rate),
  );
  utterance.pitch = pitch;
  utterance.volume = 1;
  utterance.onend = done;
  utterance.onerror = done;
  activeUtterance = utterance;

  if (window.speechSynthesis.paused) window.speechSynthesis.resume();
  window.speechSynthesis.speak(utterance);
}

function playPart(
  text: string,
  rate: number,
  pitch: number,
  id: number,
  done: () => void,
) {
  const src = SPEECH_CLIPS[normalize(text)];
  const player = ensureMedia();

  if (!src || !player) {
    speakWithBrowser(text, rate, pitch, done);
    return;
  }

  player.onended = () => {
    if (id === batchId) done();
  };
  player.onerror = () => {
    if (id !== batchId) return;
    // The generated file may be unavailable on the first request of a very
    // stale PWA install. Browser speech keeps that tap useful while the
    // service worker fetches the fresh asset.
    player.onended = null;
    player.onerror = null;
    speakWithBrowser(text, rate, pitch, done);
  };
  player.src = src;
  player.playbackRate = Math.max(0.65, Math.min(1.15, speechRate * rate));
  player.volume = 1;
  // Force source selection before play. Without this, WebKit (and Chromium
  // after an ended clip) can keep currentSrc pointed at the previous word and
  // resolve play() without ever requesting the newly assigned file.
  player.load();

  const attempt = player.play();
  if (attempt) {
    void attempt.catch(() => {
      if (id !== batchId) return;
      player.onended = null;
      player.onerror = null;
      speakWithBrowser(text, rate, pitch, done);
    });
  }
}

/**
 * One deterministic queue for both bundled clips and browser-speech fallback.
 *
 * A single reusable <audio> element is important on iOS: once the child has
 * started it with the first tap, later words can use that same unlocked media
 * session. Creating a fresh element for every animal would reintroduce the
 * autoplay failure this module exists to avoid.
 */
function speakBatch(parts: string[], options: SpeakOptions = {}) {
  const {
    interrupt = true,
    rate = 1,
    pitch = 1.05,
    delay = 0,
    onEnd,
  } = options;
  const queue = parts.map((part) => part.trim()).filter(Boolean);

  if (muted || queue.length === 0) {
    onEnd?.();
    return;
  }
  if (!interrupt && busy) return;

  const id = ++batchId;
  clearCurrent();
  setBusy(true);

  let index = 0;
  let finished = false;
  const finish = () => {
    if (finished || id !== batchId) return;
    finished = true;
    activeUtterance = null;
    setBusy(false);
    onEnd?.();
  };
  const advance = () => {
    if (id !== batchId) return;
    timer = window.setTimeout(
      index < queue.length ? next : finish,
      index < queue.length ? BETWEEN_WORDS_MS : AFTER_PHRASE_MS,
    );
  };
  const next = () => {
    if (id !== batchId) return;
    const part = queue[index++];
    if (!part) return finish();
    playPart(part, rate, pitch, id, advance);
  };

  if (delay > 0) timer = window.setTimeout(next, delay);
  else next();
}

export function initSpeech() {
  if (typeof window === "undefined") return;
  ensureMedia();
  refreshVoices();
  if (hasWebSpeech()) {
    window.speechSynthesis.addEventListener("voiceschanged", refreshVoices);
  }
}

/** Prepare the reusable media element inside the initial play-button tap. */
export function unlockSpeech() {
  ensureMedia()?.load();
  refreshVoices();
}

export function setSpeechMuted(value: boolean) {
  muted = value;
  if (value) stopSpeaking();
}

export function setSpeechRate(value: number) {
  speechRate = value;
}

export function isSpeaking(): boolean {
  const mediaSpeaking = Boolean(media && !media.paused && !media.ended);
  return (
    mediaSpeaking ||
    Boolean(hasWebSpeech() && window.speechSynthesis.speaking)
  );
}

export function isSpeechBusy(): boolean {
  return busy;
}

export function subscribeSpeechBusy(listener: () => void) {
  busyListeners.add(listener);
  return () => busyListeners.delete(listener);
}

export function speak(text: string, options: SpeakOptions = {}) {
  speakBatch([text], options);
}

export function speakSequence(
  parts: string[],
  options: SpeakOptions = {},
) {
  speakBatch(parts, options);
}

export function speakExclusive(
  parts: string[],
  options: SpeakOptions = {},
): boolean {
  if (busy) return false;
  speakBatch(parts, options);
  return true;
}

export function speakTapped(
  _key: string,
  parts: string[],
  options: SpeakOptions = {},
): boolean {
  if (busy) return false;
  speakBatch(parts, options);
  return true;
}

export function stopSpeaking() {
  batchId += 1;
  if (typeof window !== "undefined") clearCurrent();
  setBusy(false);
}
