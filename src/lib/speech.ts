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
let speechContext: AudioContext | null = null;
let activeSource: AudioBufferSourceNode | null = null;
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

type QueuedSpeech = {
  parts: string[];
  options: SpeakOptions;
};
let pendingSpeech: QueuedSpeech[] = [];
const bufferCache = new Map<string, Promise<AudioBuffer>>();

type WebSpeechWindow = Window & {
  speechSynthesis?: SpeechSynthesis;
  SpeechSynthesisUtterance?: typeof SpeechSynthesisUtterance;
  webkitAudioContext?: typeof AudioContext;
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

function ensureSpeechContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!speechContext) {
    const Constructor =
      window.AudioContext ??
      (window as WebSpeechWindow).webkitAudioContext;
    if (!Constructor) return null;
    speechContext = new Constructor();
  }
  return speechContext;
}

function loadBuffer(
  context: AudioContext,
  src: string,
): Promise<AudioBuffer> {
  const cached = bufferCache.get(src);
  if (cached) return cached;
  const loading = fetch(src)
    .then((response) => {
      if (!response.ok) throw new Error(`Speech clip ${response.status}`);
      return response.arrayBuffer();
    })
    .then((data) => context.decodeAudioData(data))
    .catch((error) => {
      bufferCache.delete(src);
      throw error;
    });
  bufferCache.set(src, loading);
  return loading;
}

function setBusy(value: boolean) {
  if (busy === value) return;
  busy = value;
  busyListeners.forEach((listener) => listener());
}

function clearCurrent() {
  window.clearTimeout(timer);
  if (activeSource) {
    activeSource.onended = null;
    try {
      activeSource.stop();
    } catch {
      /* the source may already have ended */
    }
    activeSource.disconnect();
    activeSource = null;
  }
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

function playWithMedia(
  src: string,
  text: string,
  rate: number,
  pitch: number,
  id: number,
  done: () => void,
) {
  const player = ensureMedia();
  if (!player) {
    speakWithBrowser(text, rate, pitch, done);
    return;
  }

  player.onended = () => {
    if (id === batchId) done();
  };
  player.onerror = () => {
    if (id !== batchId) return;
    player.onended = null;
    player.onerror = null;
    speakWithBrowser(text, rate, pitch, done);
  };
  player.src = src;
  player.playbackRate = Math.max(0.65, Math.min(1.15, speechRate * rate));
  player.volume = 1;
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

function playPart(
  text: string,
  rate: number,
  pitch: number,
  id: number,
  done: () => void,
) {
  const src = SPEECH_CLIPS[normalize(text)];
  if (!src) {
    speakWithBrowser(text, rate, pitch, done);
    return;
  }

  const context = ensureSpeechContext();
  if (!context) {
    playWithMedia(src, text, rate, pitch, id, done);
    return;
  }

  void context
    .resume()
    .then(() => loadBuffer(context, src))
    .then((buffer) => {
      if (id !== batchId) return;
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.playbackRate.value = Math.max(
        0.65,
        Math.min(1.15, speechRate * rate),
      );
      source.connect(context.destination);
      source.onended = () => {
        if (activeSource === source) activeSource = null;
        source.disconnect();
        if (id === batchId) done();
      };
      activeSource = source;
      source.start();
    })
    .catch(() => {
      if (id !== batchId) return;
      // A regular media element remains a last-resort fallback for browsers
      // without working Web Audio decoding.
      playWithMedia(src, text, rate, pitch, id, done);
    });
}

/**
 * One deterministic queue for both bundled clips and browser-speech fallback.
 *
 * Bundled clips use one unlocked Web Audio context. Besides reliable playback,
 * this avoids the iOS audio-session bug where HTML media playback can leave
 * SpeechRecognition running without ever returning a result.
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

function playNextQueued() {
  if (busy) return;
  const queued = pendingSpeech.shift();
  if (!queued) return;
  const { onEnd, ...options } = queued.options;
  speakBatch(queued.parts, {
    ...options,
    onEnd: () => {
      onEnd?.();
      playNextQueued();
    },
  });
}

export function initSpeech() {
  if (typeof window === "undefined") return;
  ensureMedia();
  refreshVoices();
  if (hasWebSpeech()) {
    window.speechSynthesis.addEventListener("voiceschanged", refreshVoices);
  }
}

/** Unlock speech playback inside the initial play-button tap. */
export function unlockSpeech() {
  const context = ensureSpeechContext();
  if (context) {
    void context.resume();
    const source = context.createBufferSource();
    source.buffer = context.createBuffer(1, 1, 22050);
    source.connect(context.destination);
    source.start();
  }
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
    Boolean(activeSource) ||
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
  pendingSpeech = [];
  speakBatch([text], options);
}

export function speakSequence(
  parts: string[],
  options: SpeakOptions = {},
) {
  pendingSpeech = [];
  speakBatch(parts, options);
}

/**
 * Add a phrase behind any speech already playing. Balloon counting uses this
 * so every pop is pronounced in order instead of interrupting the number
 * before it.
 */
export function enqueueSpeech(
  parts: string[],
  options: SpeakOptions = {},
) {
  pendingSpeech.push({ parts, options });
  playNextQueued();
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
  pendingSpeech = [];
  speakBatch(parts, options);
  return true;
}

export function stopSpeaking() {
  pendingSpeech = [];
  batchId += 1;
  if (typeof window !== "undefined") clearCurrent();
  setBusy(false);
}
