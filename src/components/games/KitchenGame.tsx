"use client";

import { useEffect, useRef, useState } from "react";
import { FOOD_ART } from "@/components/art/foods";
import { Munchy, type MunchyMouth } from "@/components/art/friends";
import { Celebration } from "@/components/ui/Celebration";
import { PlaceFrame } from "@/components/ui/PlaceFrame";
import { useWordBubble } from "@/components/ui/WordBubble";
import {
  sfxPop,
  sfxSparkle,
  sfxWhoosh,
  speakTapped,
  vibrate,
} from "@/lib/audio";
import { FOODS, type FoodWord, pickRandom } from "@/lib/content";
import { useSpeechBusy } from "@/lib/useSpeechBusy";

type Flight = {
  key: number;
  food: FoodWord;
  from: { x: number; y: number; size: number };
  to: { x: number; y: number };
  /** Munchy sending it back: flies out of the mouth and grows, not shrinks. */
  spat?: boolean;
};

function FlyingFood({
  flight,
  onArrive,
}: {
  flight: Flight;
  onArrive: () => void;
}) {
  const [go, setGo] = useState(false);
  const Glyph = FOOD_ART[flight.food.id];

  useEffect(() => {
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setGo(true));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, []);

  const dx = flight.to.x - flight.from.x;
  const dy = flight.to.y - flight.from.y;

  return (
    <div
      className="pointer-events-none fixed z-40"
      style={{
        left: flight.from.x - flight.from.size / 2,
        top: flight.from.y - flight.from.size / 2,
        width: flight.from.size,
        height: flight.from.size,
        transition: flight.spat
          ? "transform 700ms cubic-bezier(0.3, 1.3, 0.6, 1)"
          : "transform 620ms cubic-bezier(0.45, 0, 0.55, 1)",
        transform: go
          ? `translate(${dx}px, ${dy}px) scale(${flight.spat ? 1 : 0.18}) rotate(${
              flight.spat ? -420 : 340
            }deg)`
          : flight.spat
            ? "scale(0.2)"
            : "none",
      }}
      onTransitionEnd={onArrive}
    >
      <Glyph className="h-full w-full" />
    </div>
  );
}

function FoodTile({
  food,
  hint,
  disabled,
  onTap,
}: {
  food: FoodWord;
  hint: boolean;
  disabled: boolean;
  onTap: (food: FoodWord, rect: DOMRect) => void;
}) {
  const Glyph = FOOD_ART[food.id];
  return (
    <button
      type="button"
      aria-label={food.word}
      disabled={disabled}
      onPointerDown={(event) => {
        event.preventDefault();
        onTap(food, event.currentTarget.getBoundingClientRect());
      }}
      className={`grid h-full w-full place-items-center rounded-[26px] border-4 border-white/75 p-1 shadow-[0_6px_0_rgba(0,0,0,0.12)] transition-[filter,opacity,transform] active:scale-90 disabled:opacity-55 disabled:saturate-50 ${
        hint ? "anim-hint" : ""
      }`}
      style={{ background: food.tint }}
    >
      <Glyph className="h-[86%] w-[86%]" title={food.word} />
    </button>
  );
}

function withArticle(word: string): string {
  const lower = word.toLowerCase();
  if (lower === "broccoli" || lower === "grapes") return `some ${lower}`;
  return `${/^[aeiou]/.test(lower) ? "an" : "a"} ${lower}`;
}

export function KitchenGame({ onHome }: { onHome: () => void }) {
  const { showWord } = useWordBubble();
  const speechBusy = useSpeechBusy();
  const [wanted, setWanted] = useState(() => pickRandom(FOODS));
  const [flights, setFlights] = useState<Flight[]>([]);
  const [mouth, setMouth] = useState<MunchyMouth>("smile");
  const [wrong, setWrong] = useState(false);
  const [happy, setHappy] = useState(0);
  const munchyRef = useRef<HTMLButtonElement>(null);
  const flightKey = useRef(0);
  const fed = useRef(0);
  const mouthTimer = useRef<number | undefined>(undefined);
  const wrongTimer = useRef<number | undefined>(undefined);
  const requestTimer = useRef<number | undefined>(undefined);
  const foodLocked = speechBusy || flights.length > 0;
  const WantedArt = FOOD_ART[wanted.id];

  useEffect(
    () => () => {
      window.clearTimeout(mouthTimer.current);
      window.clearTimeout(wrongTimer.current);
      window.clearTimeout(requestTimer.current);
    },
    [],
  );

  const handleTap = (food: FoodWord, rect: DOMRect) => {
    if (foodLocked) return;
    const target = munchyRef.current?.getBoundingClientRect();
    if (!target) return;
    sfxWhoosh();
    vibrate();
    showWord(food.word);
    flightKey.current += 1;
    setFlights((current) => [
      ...current,
      {
        key: flightKey.current,
        food,
        from: {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          size: rect.width,
        },
        to: {
          x: target.left + target.width / 2,
          y: target.top + target.height * 0.62,
        },
      },
    ]);
    setMouth("open");
  };

  const handleArrive = (flight: Flight) => {
    setFlights((current) => current.filter((item) => item.key !== flight.key));

    // A spat-out mouthful has already had its say on the way in.
    if (flight.spat) return;

    sfxPop();

    const correct = flight.food.id === wanted.id;
    if (!correct) {
      // Name the fruit that was actually touched, then show the answer rather
      // than reading another instruction over it.
      speakTapped(flight.food.id, [flight.food.word]);
      setMouth("open");
      setWrong(true);
      window.clearTimeout(mouthTimer.current);
      window.clearTimeout(wrongTimer.current);
      mouthTimer.current = window.setTimeout(() => setMouth("smile"), 900);
      wrongTimer.current = window.setTimeout(() => setWrong(false), 900);
      flightKey.current += 1;
      setFlights((current) => [
        ...current,
        {
          key: flightKey.current,
          food: flight.food,
          from: { ...flight.to, size: flight.from.size },
          to: { x: flight.from.x, y: flight.from.y },
          spat: true,
        },
      ]);
      return;
    }

    setMouth("chew");
    fed.current += 1;
    speakTapped(flight.food.id, [`${flight.food.word}!`, "Yum!"]);

    window.clearTimeout(mouthTimer.current);
    mouthTimer.current = window.setTimeout(() => setMouth("smile"), 900);
    window.clearTimeout(requestTimer.current);
    requestTimer.current = window.setTimeout(() => {
      setWanted((current) => pickRandom(FOODS, current));
    }, 900);

    if (fed.current % 5 === 0) {
      setHappy((n) => n + 1);
      sfxSparkle();
    }
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-linear-to-b from-[#FFE9B8] to-[#F7B267]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 opacity-30 [background:repeating-linear-gradient(90deg,#fff_0_28px,transparent_28px_56px)]" />

      <PlaceFrame
        onHome={onHome}
        prompt={
          <span className="flex items-center gap-2">
            <WantedArt className="h-9 w-9" title={wanted.word} />
            <span>Munchie wants {withArticle(wanted.word)}.</span>
          </span>
        }
      >
        <div className="flex min-h-0 flex-1 flex-col items-center gap-2 px-2 pb-3 sm:px-4 landscape:flex-row landscape:gap-3">
          <div className="flex min-h-0 w-full flex-1 items-center justify-center landscape:h-full landscape:w-auto">
            <button
              type="button"
              ref={munchyRef}
              aria-label={`Munchie wants ${withArticle(wanted.word)}`}
              disabled={speechBusy}
              onPointerDown={(event) => {
                event.preventDefault();
                speakTapped(`munchie-${wanted.id}`, [
                  `Munchie wants ${withArticle(wanted.word)}.`,
                ]);
              }}
              className={`aspect-square h-full max-h-full max-w-full ${
                wrong ? "anim-shake" : "anim-bob"
              } transition-transform active:scale-95`}
            >
              <Munchy mouth={mouth} className="h-full w-full" title="Munchy" />
            </button>
          </div>

          {/* Square tiles: four columns by two rows is a 2:1 box, so the art
              never ends up marooned in a tall thin cell on a phone. */}
          <div className="grid aspect-2/1 w-full max-w-2xl shrink-0 grid-cols-4 grid-rows-2 gap-2 landscape:h-full landscape:w-auto landscape:max-w-none">
            {FOODS.map((food) => (
              <FoodTile
                key={food.id}
                food={food}
                hint={wrong && wanted.id === food.id}
                disabled={foodLocked}
                onTap={handleTap}
              />
            ))}
          </div>
        </div>
      </PlaceFrame>

      {flights.map((flight) => (
        <FlyingFood
          key={flight.key}
          flight={flight}
          onArrive={() => handleArrive(flight)}
        />
      ))}

      <Celebration trigger={happy} />
    </div>
  );
}
