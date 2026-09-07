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
  speak,
  speakExclusive,
  vibrate,
} from "@/lib/audio";
import { FOODS, type FoodWord } from "@/lib/content";
import { useFindChallenge } from "@/lib/useFindChallenge";

type Flight = {
  key: number;
  food: FoodWord;
  from: { x: number; y: number; size: number };
  to: { x: number; y: number };
  silent: boolean;
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
        transition: "transform 620ms cubic-bezier(0.45, 0, 0.55, 1)",
        transform: go
          ? `translate(${dx}px, ${dy}px) scale(0.18) rotate(340deg)`
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
  onTap,
}: {
  food: FoodWord;
  hint: boolean;
  onTap: (food: FoodWord, rect: DOMRect) => void;
}) {
  const Glyph = FOOD_ART[food.id];
  return (
    <button
      type="button"
      aria-label={food.word}
      onPointerDown={(event) => {
        event.preventDefault();
        onTap(food, event.currentTarget.getBoundingClientRect());
      }}
      className={`grid h-full w-full place-items-center rounded-[26px] border-4 border-white/75 p-1 shadow-[0_6px_0_rgba(0,0,0,0.12)] transition-transform active:scale-90 ${
        hint ? "anim-hint" : ""
      }`}
      style={{ background: food.tint }}
    >
      <Glyph className="h-[86%] w-[86%]" title={food.word} />
    </button>
  );
}

export function KitchenGame({ onHome }: { onHome: () => void }) {
  const { bubble, showWord } = useWordBubble();
  const challenge = useFindChallenge(FOODS);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [mouth, setMouth] = useState<MunchyMouth>("smile");
  const [happy, setHappy] = useState(0);
  const munchyRef = useRef<HTMLDivElement>(null);
  const flightKey = useRef(0);
  const fed = useRef(0);
  const mouthTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(mouthTimer.current), []);

  const handleTap = (food: FoodWord, rect: DOMRect) => {
    const target = munchyRef.current?.getBoundingClientRect();
    if (!target) return;
    sfxWhoosh();
    vibrate();
    showWord(food.word);
    const correct = challenge.check(food);
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
        silent: correct,
      },
    ]);
    setMouth("open");
  };

  const handleArrive = (flight: Flight) => {
    setFlights((current) => current.filter((item) => item.key !== flight.key));
    sfxPop();
    setMouth("chew");
    fed.current += 1;
    // Food can be flung faster than Munchy can chew and talk, so a mouthful
    // that lands mid-sentence is eaten quietly instead of clipping the word.
    if (!flight.silent) speakExclusive([`${flight.food.word}!`, "Yum!"]);

    window.clearTimeout(mouthTimer.current);
    mouthTimer.current = window.setTimeout(() => setMouth("smile"), 900);

    if (fed.current % 5 === 0) {
      setHappy((n) => n + 1);
      sfxSparkle();
      if (!flight.silent) speak("Thank you! So tasty!", { interrupt: false });
    }
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-linear-to-b from-[#FFE9B8] to-[#F7B267]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 opacity-30 [background:repeating-linear-gradient(90deg,#fff_0_28px,transparent_28px_56px)]" />

      <PlaceFrame
        onHome={onHome}
        onAsk={challenge.start}
        asking={challenge.active}
        prompt={challenge.prompt}
        bubble={bubble}
        bubbleTone="#B5651D"
      >
        <div className="flex min-h-0 flex-1 flex-col items-center gap-2 px-2 pb-3 sm:px-4 landscape:flex-row landscape:gap-3">
          <div className="flex min-h-0 w-full flex-1 items-center justify-center landscape:h-full landscape:w-auto">
            <div
              ref={munchyRef}
              className="anim-bob aspect-square h-full max-h-full max-w-full"
            >
              <Munchy mouth={mouth} className="h-full w-full" title="Munchy" />
            </div>
          </div>

          {/* Square tiles: four columns by two rows is a 2:1 box, so the art
              never ends up marooned in a tall thin cell on a phone. */}
          <div className="grid aspect-2/1 w-full max-w-2xl shrink-0 grid-cols-4 grid-rows-2 gap-2 landscape:h-full landscape:w-auto landscape:max-w-none">
            {FOODS.map((food) => (
              <FoodTile
                key={food.id}
                food={food}
                hint={challenge.hint && challenge.target?.id === food.id}
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

      <Celebration trigger={challenge.celebrate} />
      <Celebration trigger={challenge.finale} big />
      <Celebration trigger={happy} />
    </div>
  );
}
