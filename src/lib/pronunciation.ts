"use client";

/**
 * Optional pronunciation checking. Off by default: recognising a
 * three-year-old's speech is unreliable, and on most browsers it ships audio
 * to a cloud service, which is not something a children's app should do
 * without the parent choosing it.
 *
 * When it is on, a match only ever *upgrades* the praise. A word it fails to
 * recognise still earns the child a star.
 */

type Listener = { transcript: string; isFinal: boolean };

interface RecognitionEventLike {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface RecognitionErrorLike {
  error: string;
}

interface RecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: RecognitionEventLike) => void) | null;
  onerror: ((event: RecognitionErrorLike) => void) | null;
  onend: (() => void) | null;
}

type RecognitionConstructor = new () => RecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: RecognitionConstructor;
    webkitSpeechRecognition?: RecognitionConstructor;
  }
}

export function isRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(window.SpeechRecognition ?? window.webkitSpeechRecognition);
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z]/g, "");
}

function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  const previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    let diagonal = previous[0];
    previous[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const next = Math.min(
        previous[j] + 1,
        previous[j - 1] + 1,
        diagonal + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      diagonal = previous[j];
      previous[j] = next;
    }
  }
  return previous[b.length];
}

/**
 * Generous on purpose. A toddler saying "tow" for "cow" or "nana" for
 * "banana" is doing exactly what we want, so near misses count.
 */
export function matchesWord(transcript: string, target: string): boolean {
  const wanted = normalize(target);
  if (!wanted) return false;
  const whole = normalize(transcript);
  if (whole.includes(wanted)) return true;

  const tolerance = wanted.length <= 4 ? 1 : 2;
  return transcript
    .split(/\s+/)
    .map(normalize)
    .filter(Boolean)
    .some((word) => editDistance(word, wanted) <= tolerance);
}

/**
 * Starts recognition and reports transcripts. Returns a stop function, or
 * null when the browser cannot do this.
 */
export function listenForWord(onHeard: (result: Listener) => void): (() => void) | null {
  const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
  if (!Recognition) return null;

  let stopped = false;
  let recognition: RecognitionLike;
  try {
    recognition = new Recognition();
  } catch {
    return null;
  }

  recognition.lang = "en-US";
  recognition.interimResults = true;
  recognition.maxAlternatives = 5;
  recognition.continuous = false;

  recognition.onresult = (event) => {
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      const result = event.results[i];
      for (let j = 0; j < result.length; j += 1) {
        onHeard({ transcript: result[j].transcript, isFinal: result.isFinal });
      }
    }
  };
  recognition.onerror = () => {
    stopped = true;
  };

  try {
    recognition.start();
  } catch {
    return null;
  }

  return () => {
    if (stopped) return;
    stopped = true;
    try {
      recognition.abort();
    } catch {
      /* already gone */
    }
  };
}
