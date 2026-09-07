"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ANIMAL_ART } from "@/components/art/animals";
import { FOOD_ART } from "@/components/art/foods";
import { MicGlyph, StarGlyph } from "@/components/art/friends";
import { Celebration } from "@/components/ui/Celebration";
import { PlaceFrame, RoundButton } from "@/components/ui/PlaceFrame";
import { sfxFanfare, sfxSparkle, sfxSuccess, sfxTap, speak, vibrate } from "@/lib/audio";
import { ANIMALS, FOODS, randomCheer } from "@/lib/content";
import { isRecognitionSupported, listenForWord, matchesWord } from "@/lib/pronunciation";
import { useSettings } from "@/lib/settings";
import { useVoiceListener } from "@/lib/useVoiceListener";

type SayWord = {
  id: string;
  word: string;
  tint: string;
  Art: React.ComponentType<{ className?: string; title?: string }>;
};

type Phase = "intro" | "prompt" | "listening" | "success";

const STARS_PER_ROUND = 5;
/** How long to wait before gently repeating the word. */
const NUDGE_MS = 7000;
/** Safety net: iOS sometimes never fires `onend` for an utterance. */
const PROMPT_FALLBACK_MS = 3800;

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildDeck(): SayWord[] {
  const animals = ANIMALS.map((animal) => ({
    id: `animal-${animal.id}`,
    word: animal.word,
    tint: animal.tint,
    Art: ANIMAL_ART[animal.id],
  }));
  const foods = FOODS.map((food) => ({
    id: `food-${food.id}`,
    word: food.word,
    tint: food.tint,
    Art: FOOD_ART[food.id],
  }));
  // Animals first: they are the words a three-year-old already knows in their
  // own language, so the very first try is one they can win.
  return [...shuffle(animals), ...shuffle(foods)];
}

/**
 * Repeat-after-me. The app says a word, then visibly listens: a ring around
 * the picture breathes with the child's actual voice. Any attempt earns a
 * star — the goal is to get them talking, not to grade them.
 */
export function SayItGame({ onHome }: { onHome: () => void }) {
  const { checkPronunciation } = useSettings();
  const [deck] = useState(buildDeck);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("intro");
  const [micReady, setMicReady] = useState(false);
  const [stars, setStars] = useState(0);
  const [perfect, setPerfect] = useState(false);
  const [cheer, setCheer] = useState(0);
  const [party, setParty] = useState(0);

  const ringRef = useRef<HTMLDivElement>(null);
  const meterRef = useRef<HTMLDivElement>(null);
  const phaseRef = useRef<Phase>("intro");
  const wordRef = useRef<SayWord | null>(null);
  const timers = useRef<number[]>([]);
  const stopRecognition = useRef<(() => void) | null>(null);
  const matched = useRef(false);
  const alive = useRef(true);
  /** Breaks the cycle: asking listens, and listening asks the next word. */
  const askRef = useRef<(word: SayWord) => void>(() => {});

  const current = deck[index % deck.length];

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

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
      ringRef.current.style.transform = `scale(${1 + value * 0.22})`;
      ringRef.current.style.opacity = String(listening ? 0.45 + value * 0.55 : 0.2);
    }
    if (meterRef.current) {
      meterRef.current.style.transform = `scaleX(${Math.max(0.04, value)})`;
    }
  }, []);

  const heard = useCallback(() => {
    if (!alive.current || phaseRef.current !== "listening") return;
    const word = wordRef.current;
    if (!word) return;

    clearTimers();
    endRecognition();
    phaseRef.current = "success";
    setPhase("success");

    const wasPerfect = matched.current;
    setPerfect(wasPerfect);
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
      speak(`${wasPerfect ? "Perfect" : randomCheer().replace("!", "")}! ${word.word}! Five stars!`);
    } else {
      speak(wasPerfect ? `Perfect! ${word.word}!` : `${randomCheer()} ${word.word}!`);
    }

    const nextIndex = index + 1;
    timers.current.push(
      window.setTimeout(
        () => {
          if (!alive.current) return;
          if (full) setStars(0);
          setIndex(nextIndex);
          askRef.current(deck[nextIndex % deck.length]);
        },
        full ? 3000 : 1900,
      ),
    );
  }, [clearTimers, deck, endRecognition, index, stars]);

  const listener = useVoiceListener({ onFrame: paintLevel, onSpeech: heard });
  const { arm, disarm, start: startMic } = listener;

  const beginListening = useCallback(() => {
    if (!alive.current || phaseRef.current === "success") return;
    const word = wordRef.current;
    if (!word) return;

    phaseRef.current = "listening";
    setPhase("listening");
    matched.current = false;
    arm();

    if (checkPronunciation && isRecognitionSupported()) {
      stopRecognition.current = listenForWord(({ transcript }) => {
        if (!matchesWord(transcript, word.word)) return;
        matched.current = true;
        heard();
      });
    }

    timers.current.push(
      window.setTimeout(() => {
        if (!alive.current || phaseRef.current !== "listening") return;
        speak(word.word, { rate: 0.85 });
        arm();
      }, NUDGE_MS),
    );
  }, [arm, checkPronunciation, heard]);

  const ask = useCallback(
    (word: SayWord) => {
      clearTimers();
      endRecognition();
      disarm();
      wordRef.current = word;
      phaseRef.current = "prompt";
      setPhase("prompt");
      setPerfect(false);

      let started = false;
      const go = () => {
        if (started) return;
        started = true;
        beginListening();
      };
      speak(`Can you say... ${word.word}?`, { onEnd: go });
      timers.current.push(window.setTimeout(go, PROMPT_FALLBACK_MS));
    },
    [beginListening, clearTimers, disarm, endRecognition],
  );

  useEffect(() => {
    askRef.current = ask;
  }, [ask]);

  useEffect(
    () => () => {
      timers.current.forEach((id) => window.clearTimeout(id));
      stopRecognition.current?.();
    },
    [],
  );

  const begin = async () => {
    sfxTap();
    vibrate();
    const ok = await startMic();
    if (!alive.current) return;
    setMicReady(ok);
    if (!ok) speak("I cannot hear you, but you can still say the words. Tap the big button!");
    setPhase("prompt");
    ask(deck[0]);
  };

  const repeatWord = () => {
    const word = wordRef.current;
    if (!word) return;
    sfxTap();
    speak(word.word, { rate: 0.8 });
    if (phaseRef.current === "listening") arm();
  };

  const Art = current.Art;
  const listening = phase === "listening";

  return (
    <div className="relative h-full w-full overflow-hidden bg-linear-to-b from-[#9CC4FF] to-[#4F6FE0]">
      <PlaceFrame
        onHome={onHome}
        prompt={phase === "intro" ? null : current.word}
        extraButton={
          phase === "intro" ? undefined : (
            <RoundButton label="Say it again" onPress={repeatWord}>
              <svg viewBox="0 0 100 100" className="h-7 w-7 sm:h-8 sm:w-8" aria-hidden>
                <path
                  d="M18 38 L18 62 L38 62 L62 82 L62 18 L38 38 Z"
                  fill="#FFFFFF"
                  stroke="#2F2A26"
                  strokeWidth={5}
                  strokeLinejoin="round"
                />
                <path
                  d="M74 34 q12 16 0 32"
                  stroke="#FFFFFF"
                  strokeWidth={6}
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </RoundButton>
          )
        }
      >
        {phase === "intro" ? (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
            <button
              type="button"
              aria-label="Start saying words"
              onPointerDown={(event) => {
                event.preventDefault();
                void begin();
              }}
              className="anim-bob grid h-40 w-40 place-items-center rounded-full border-8 border-white bg-[#FFD22E] shadow-[0_10px_0_rgba(0,0,0,0.18)] transition-transform active:scale-90 sm:h-48 sm:w-48"
            >
              <MicGlyph className="h-24 w-24 sm:h-28 sm:w-28" fill="#FFFFFF" />
            </button>
            <p className="max-w-sm text-lg font-semibold text-white drop-shadow sm:text-2xl">
              I will say a word. You say it back to me!
            </p>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-3 pb-2 landscape:flex-row landscape:gap-8">
            <div className="relative grid h-[min(64vw,38dvh)] w-[min(64vw,38dvh)] shrink-0 place-items-center landscape:h-[min(42vw,56dvh)] landscape:w-[min(42vw,56dvh)]">
              <div
                ref={ringRef}
                className="absolute inset-0 rounded-full border-8 border-white transition-[border-color] duration-300"
                style={{ opacity: 0.25, willChange: "transform" }}
              />
              <div
                className="absolute inset-[10%] grid place-items-center rounded-full border-4 border-white/80 shadow-lg"
                style={{ background: current.tint }}
              >
                <Art className="h-[78%] w-[78%]" title={current.word} />
              </div>
              {phase === "success" ? (
                <div className="anim-pop-in absolute -right-1 -top-1 h-14 w-14 sm:h-16 sm:w-16">
                  <StarGlyph filled className="h-full w-full drop-shadow" />
                </div>
              ) : null}
            </div>

            <div className="flex w-full max-w-xs shrink-0 flex-col items-center gap-3 landscape:w-48">
              {micReady ? (
                <>
                  <div
                    className={`grid h-20 w-20 place-items-center rounded-full border-4 transition-colors sm:h-24 sm:w-24 ${
                      listening ? "border-white bg-[#5FAF4E]" : "border-white/50 bg-white/20"
                    }`}
                  >
                    <MicGlyph className="h-10 w-10 sm:h-12 sm:w-12" />
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-white/25">
                    <div
                      ref={meterRef}
                      className="h-full w-full origin-left rounded-full bg-[#FFD22E]"
                      style={{ transform: "scaleX(0.04)", willChange: "transform" }}
                    />
                  </div>
                  <p className="text-base font-semibold text-white/90 drop-shadow sm:text-lg">
                    {listening ? "I'm listening…" : "Listen…"}
                  </p>
                </>
              ) : (
                <button
                  type="button"
                  aria-label="I said it"
                  onPointerDown={(event) => {
                    event.preventDefault();
                    matched.current = false;
                    heard();
                  }}
                  className="grid h-24 w-24 place-items-center rounded-full border-8 border-white bg-[#5FAF4E] shadow-[0_8px_0_rgba(0,0,0,0.18)] transition-transform active:scale-90 sm:h-28 sm:w-28"
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
                    className={`h-9 w-9 sm:h-11 sm:w-11 ${i === stars - 1 && phase === "success" ? "anim-pop-in" : ""}`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </PlaceFrame>

      <Celebration trigger={perfect ? cheer : 0} />
      <Celebration trigger={party} big />
    </div>
  );
}
