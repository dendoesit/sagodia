"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { HomeGlyph, StarGlyph } from "@/components/art/friends";
import { Celebration } from "@/components/ui/Celebration";
import { RoundButton } from "@/components/ui/PlaceFrame";
import {
  sfxFanfare,
  sfxSparkle,
  sfxSuccess,
  isSpeechBusy,
  speak,
  stopSpeaking,
  subscribeSpeechBusy,
  vibrate,
} from "@/lib/audio";
import { pickRandom } from "@/lib/content";
import {
  isRecognitionSupported,
  listenForWord,
  matchesWord,
  warmRecognitionPermission,
} from "@/lib/pronunciation";
import { useSettings } from "@/lib/settings";
import { useVoiceListener } from "@/lib/useVoiceListener";

export type SayItem = {
  id: string;
  word: string;
  tint: string;
  Art: React.ComponentType<{ className?: string; title?: string }>;
};

type Phase = "prompt" | "listening" | "timeout" | "cheer";

const STARS_PER_ROUND = 5;
/** A short turn: hear the word, repeat it, or continue without getting stuck. */
const RESPONSE_MS = 3200;
/** Safety net: iOS sometimes never fires `onend` for an utterance. */
const PROMPT_FALLBACK_MS = 3400;

/**
 * Repeat-after-me, played on top of whichever place the child is already in.
 *
 * The app says one word, then visibly listens: the ring around the picture
 * breathes with the child's real voice. With pronunciation checking enabled,
 * the recognised word must match before a star is awarded.
 */
export function SayAlong({
  items,
  first,
  promptAlreadyPlaying = false,
  onHome,
  onExit,
}: {
  items: SayItem[];
  first: SayItem;
  promptAlreadyPlaying?: boolean;
  onHome: () => void;
  onExit: () => void;
}) {
  const { checkPronunciation, showWords } = useSettings();
  const recognitionSupported = isRecognitionSupported();
  const [item, setItem] = useState(first);
  const [phase, setPhase] = useState<Phase>("prompt");
  const [micReady, setMicReady] = useState(false);
  const [recognitionFailed, setRecognitionFailed] = useState(false);
  const [stars, setStars] = useState(0);
  const [cheer, setCheer] = useState(0);
  const [party, setParty] = useState(0);
  const strictChecking =
    checkPronunciation && recognitionSupported && !recognitionFailed;

  const ringRef = useRef<HTMLDivElement>(null);
  const meterRef = useRef<HTMLDivElement>(null);
  const phaseRef = useRef<Phase>("prompt");
  const itemRef = useRef(first);
  const timers = useRef<number[]>([]);
  const stopRecognition = useRef<(() => void) | null>(null);
  const stopBusySubscription = useRef<(() => void) | null>(null);
  const matched = useRef(false);
  const alive = useRef(true);
  /** Breaks the cycle: presenting listens, and listening presents the next one. */
  const presentRef = useRef<(next: SayItem) => void>(() => {});
  const beginListeningRef = useRef<() => void>(() => {});

  const clearTimers = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }, []);

  const endRecognition = useCallback(() => {
    stopRecognition.current?.();
    stopRecognition.current = null;
  }, []);

  const paintLevel = useCallback((level: number) => {
    const listening = phaseRef.current === "listening";
    const value = listening ? level : 0;
    if (ringRef.current) {
      ringRef.current.style.transform = `scale(${1 + value * 0.2})`;
      ringRef.current.style.opacity = String(
        listening ? 0.5 + value * 0.5 : 0.24,
      );
    }
    if (meterRef.current) {
      meterRef.current.style.transform = `scaleX(${Math.max(0.04, value)})`;
    }
  }, []);

  const heard = useCallback(() => {
    if (!alive.current || phaseRef.current !== "listening") return;
    const word = itemRef.current;

    clearTimers();
    endRecognition();
    phaseRef.current = "cheer";
    setPhase("cheer");

    const wasPerfect = matched.current;
    setCheer((n) => n + 1);
    if (wasPerfect) sfxSparkle();
    sfxSuccess();
    vibrate(30);

    const nextStars = stars + 1;
    setStars(nextStars);
    const full = nextStars >= STARS_PER_ROUND;

    if (full) {
      sfxFanfare();
      setParty((n) => n + 1);
    }
    // Keep the success reply on the bundled Web Audio path. Dynamic browser
    // speech can leave iOS recognition unable to start the next round.
    speak(word.word);

    timers.current.push(
      window.setTimeout(
        () => {
          if (!alive.current) return;
          if (full) setStars(0);
          presentRef.current(pickRandom(items, word));
        },
        full ? 3200 : 2000,
      ),
    );
  }, [clearTimers, endRecognition, items, stars]);

  const registerAttempt = useCallback(() => {
    // In strict mode loudness only drives the listening animation. The
    // recognition transcript, not the presence of noise, decides the result.
    if (!checkPronunciation) heard();
  }, [checkPronunciation, heard]);

  const {
    arm,
    disarm,
    start: startMic,
    stop: stopMic,
  } = useVoiceListener({
    onFrame: paintLevel,
    onSpeech: registerAttempt,
  });

  const leave = useCallback(
    (goHome: boolean) => {
      if (!alive.current) return;
      alive.current = false;
      clearTimers();
      endRecognition();
      stopBusySubscription.current?.();
      stopBusySubscription.current = null;
      disarm();
      stopMic();
      stopSpeaking();
      if (goHome) onHome();
      else onExit();
    },
    [
      clearTimers,
      disarm,
      endRecognition,
      onExit,
      onHome,
      stopMic,
    ],
  );

  const beginListening = useCallback(() => {
    if (!alive.current || phaseRef.current === "cheer") return;
    const word = itemRef.current;

    clearTimers();
    endRecognition();
    disarm();
    phaseRef.current = "listening";
    setPhase("listening");
    matched.current = false;
    arm();

    if (strictChecking) {
      const stop = listenForWord(
        ({ transcript }) => {
          if (!matchesWord(transcript, word.word)) return;
          matched.current = true;
          heard();
        },
        ({ heardSpeech, error }) => {
          stopRecognition.current = null;
          if (
            !alive.current ||
            phaseRef.current !== "listening" ||
            matched.current
          )
            return;

          if (error && error !== "no-speech" && error !== "aborted") {
            disarm();
            setRecognitionFailed(true);
            setMicReady(false);
            return;
          }

          if (!heardSpeech) {
            disarm();
            phaseRef.current = "timeout";
            setPhase("timeout");
            return;
          }

          let restarted = false;
          const restart = () => {
            if (restarted || !alive.current) return;
            restarted = true;
            beginListeningRef.current();
          };
          if (heardSpeech) {
            speak("Try again!", { onEnd: restart });
            timers.current.push(window.setTimeout(restart, 3500));
          } else {
            timers.current.push(window.setTimeout(restart, 300));
          }
        },
      );
      if (!stop) {
        disarm();
        setRecognitionFailed(true);
        setMicReady(false);
        return;
      }
      stopRecognition.current = stop;
    }

    timers.current.push(
      window.setTimeout(() => {
        if (!alive.current || phaseRef.current !== "listening") return;
        endRecognition();
        disarm();
        phaseRef.current = "timeout";
        setPhase("timeout");
      }, RESPONSE_MS),
    );
  }, [
    arm,
    clearTimers,
    disarm,
    endRecognition,
    heard,
    strictChecking,
  ]);

  const present = useCallback(
    (next: SayItem) => {
      clearTimers();
      endRecognition();
      disarm();
      itemRef.current = next;
      setItem(next);
      phaseRef.current = "prompt";
      setPhase("prompt");

      let started = false;
      const go = () => {
        if (started) return;
        started = true;
        beginListening();
      };
      speak(next.word, { onEnd: go });
      timers.current.push(window.setTimeout(go, PROMPT_FALLBACK_MS));
    },
    [beginListening, clearTimers, disarm, endRecognition],
  );

  useEffect(() => {
    presentRef.current = present;
  }, [present]);

  useEffect(() => {
    beginListeningRef.current = beginListening;
  }, [beginListening]);

  const listenAfterCurrentPrompt = useCallback(() => {
    stopBusySubscription.current?.();
    if (!isSpeechBusy()) {
      beginListening();
      return;
    }
    stopBusySubscription.current = subscribeSpeechBusy(() => {
      if (isSpeechBusy()) return;
      stopBusySubscription.current?.();
      stopBusySubscription.current = null;
      beginListening();
    });
  }, [beginListening]);

  // The animal tap opens this overlay, starts its spoken prompt, and grants
  // microphone permission. There is no separate microphone button.
  const kickoff = useRef(false);
  useEffect(() => {
    if (kickoff.current) return;
    kickoff.current = true;
    void (async () => {
      // Browser recognition owns the microphone in strict mode. Opening a
      // second getUserMedia stream at the same time stalls WebKit recognition.
      const ok = checkPronunciation
        ? strictChecking && (await warmRecognitionPermission())
        : await startMic();
      if (!alive.current) return;
      if (checkPronunciation && !ok) setRecognitionFailed(true);
      setMicReady(ok);
      if (promptAlreadyPlaying) listenAfterCurrentPrompt();
      else presentRef.current(first);
    })();
  }, [
    checkPronunciation,
    first,
    listenAfterCurrentPrompt,
    promptAlreadyPlaying,
    startMic,
    strictChecking,
  ]);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      timers.current.forEach((id) => window.clearTimeout(id));
      stopRecognition.current?.();
      stopBusySubscription.current?.();
    };
  }, []);

  const continueRound = useCallback(() => {
    if (!alive.current) return;
    clearTimers();
    endRecognition();
    disarm();
    presentRef.current(pickRandom(items, itemRef.current));
  }, [clearTimers, disarm, endRecognition, items]);

  const Art = item.Art;
  const listening = phase === "listening";
  const automaticListening =
    micReady &&
    (!checkPronunciation || (recognitionSupported && !recognitionFailed));

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-[#2F2A26]/55 px-4 pb-4 pt-[5rem] backdrop-blur-[3px] sm:pt-[5.75rem]">
      <div className="absolute inset-x-0 top-0 z-50 flex items-start justify-between p-3">
        <RoundButton label="Back to town" onPress={() => leave(true)}>
          <HomeGlyph className="h-7 w-7 sm:h-8 sm:w-8" />
        </RoundButton>
        <RoundButton label="Stop saying words" onPress={() => leave(false)}>
          <svg viewBox="0 0 100 100" className="h-6 w-6" aria-hidden>
            <path
              d="M26 26 L74 74 M74 26 L26 74"
              stroke="#FFFFFF"
              strokeWidth={12}
              strokeLinecap="round"
            />
          </svg>
        </RoundButton>
      </div>

      <div className="flex w-full max-w-3xl flex-col items-center justify-center gap-4 landscape:flex-row landscape:gap-8">
        <div className="relative grid aspect-square w-[min(64vw,32dvh)] shrink-0 place-items-center landscape:w-[min(38vw,54dvh)]">
          <div
            ref={ringRef}
            className={`absolute inset-0 rounded-full border-[7px] transition-colors duration-300 ${
              listening ? "border-[#FFD22E]" : "border-white"
            }`}
            style={{ opacity: 0.24, willChange: "transform" }}
          />
          <div
            className="absolute inset-[9%] grid place-items-center rounded-full border-4 border-white/85 shadow-[0_10px_0_rgba(0,0,0,0.2)]"
            style={{ background: item.tint }}
          >
            <Art className="h-[78%] w-[78%]" title={item.word} />
          </div>
          {phase === "cheer" ? (
            <span className="anim-pop-in absolute -right-1 -top-1 block h-14 w-14 sm:h-16 sm:w-16">
              <StarGlyph filled className="h-full w-full drop-shadow" />
            </span>
          ) : null}
        </div>

        <div className="flex w-full max-w-xs flex-col items-center gap-3">
          {showWords ? (
            <p
              key={item.id}
              className="anim-pop-in text-3xl font-bold text-white drop-shadow-lg sm:text-4xl"
            >
              {item.word}
            </p>
          ) : null}

          {phase === "timeout" ? (
            <button
              type="button"
              aria-label="Continue to another animal"
              onPointerDown={(event) => {
                event.preventDefault();
                continueRound();
              }}
              className="anim-pop-in flex min-h-20 items-center gap-3 rounded-full border-4 border-white bg-[#F79420] px-6 py-3 text-xl font-bold text-white shadow-[0_8px_0_rgba(0,0,0,0.2)] transition-transform active:scale-95"
            >
              <span>Continue</span>
              <svg viewBox="0 0 100 100" className="h-10 w-10" aria-hidden>
                <path
                  d="M20 50 H75 M55 28 L78 50 L55 72"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={10}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          ) : automaticListening ? (
            <>
              <div
                aria-label={listening ? "Your turn" : "Getting ready"}
                className={`flex h-16 w-28 items-center justify-center gap-1.5 rounded-3xl border-4 transition-colors sm:h-20 sm:w-32 ${
                  listening
                    ? "border-white bg-[#5FAF4E]"
                    : "border-white/40 bg-white/15"
                }`}
              >
                {[0, 1, 2, 3].map((bar) => (
                  <span
                    key={bar}
                    className={`w-2 rounded-full bg-white ${
                      listening ? "anim-listen-bar" : "h-3 opacity-50"
                    }`}
                    style={
                      listening
                        ? { animationDelay: `${bar * 110}ms` }
                        : undefined
                    }
                  />
                ))}
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-white/25">
                <div
                  ref={meterRef}
                  className="h-full w-full origin-left rounded-full bg-[#FFD22E]"
                  style={{ transform: "scaleX(0.04)", willChange: "transform" }}
                />
              </div>
            </>
          ) : (
            // No microphone: the child says the word out loud anyway and a
            // grown-up (or the child) taps the tick.
            <button
              type="button"
              aria-label="I said it"
              onPointerDown={(event) => {
                event.preventDefault();
                matched.current = false;
                heard();
              }}
              className="grid h-24 w-24 place-items-center rounded-full border-8 border-white bg-[#5FAF4E] shadow-[0_8px_0_rgba(0,0,0,0.2)] transition-transform active:scale-90 sm:h-28 sm:w-28"
            >
              <svg viewBox="0 0 100 100" className="h-12 w-12" aria-hidden>
                <path
                  d="M20 52 L42 74 L82 28"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth={12}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}

          <div className="flex items-center justify-center gap-1.5">
            {Array.from({ length: STARS_PER_ROUND }, (_, i) => (
              <StarGlyph
                key={i}
                filled={i < stars}
                className={`h-8 w-8 sm:h-10 sm:w-10 ${
                  i === stars - 1 && phase === "cheer" ? "anim-pop-in" : ""
                }`}
              />
            ))}
          </div>

        </div>
      </div>

      <Celebration trigger={cheer} />
      <Celebration trigger={party} big />
    </div>
  );
}
