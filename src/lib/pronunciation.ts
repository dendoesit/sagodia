"use client";

/**
 * Pronunciation checking through the browser's recognition service. It is
 * strict about requiring the target word, but deliberately tolerant of small
 * pronunciation differences common in toddler speech.
 */

type Listener = { transcript: string; isFinal: boolean };
type RecognitionDone = {
  heardSpeech: boolean;
  error?: string;
};

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
let sharedRecognition: RecognitionLike | null = null;

declare global {
  interface Window {
    SpeechRecognition?: RecognitionConstructor;
    webkitSpeechRecognition?: RecognitionConstructor;
  }
}

let permissionWarmup: Promise<boolean> | null = null;

export function isRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(window.SpeechRecognition ?? window.webkitSpeechRecognition);
}

/**
 * Ask for microphone permission in the animal tap, then release the warm-up
 * stream before WebKit recognition takes ownership of the audio session.
 */
export function warmRecognitionPermission(): Promise<boolean> {
  if (
    typeof navigator === "undefined" ||
    !navigator.mediaDevices?.getUserMedia
  )
    return Promise.resolve(false);
  if (permissionWarmup) return permissionWarmup;

  permissionWarmup = navigator.mediaDevices
    .getUserMedia({ audio: true })
    .then((stream) => {
      stream.getTracks().forEach((track) => track.stop());
      return true;
    })
    .catch(() => false);
  return permissionWarmup;
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
export function listenForWord(
  onHeard: (result: Listener) => void,
  onDone?: (result: RecognitionDone) => void,
): (() => void) | null {
  const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
  if (!Recognition) return null;

  let stopped = false;
  let heardSpeech = false;
  let recognition: RecognitionLike;
  try {
    recognition = sharedRecognition ?? new Recognition();
    sharedRecognition = recognition;
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
        if (result[j].transcript.trim()) heardSpeech = true;
        onHeard({ transcript: result[j].transcript, isFinal: result.isFinal });
      }
    }
  };
  recognition.onerror = (event) => {
    if (stopped) return;
    stopped = true;
    onDone?.({ heardSpeech, error: event.error });
  };
  recognition.onend = () => {
    if (stopped) return;
    stopped = true;
    onDone?.({ heardSpeech });
  };

  try {
    recognition.start();
  } catch {
    sharedRecognition = null;
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
