"use client";

import { useState } from "react";
import { ANIMAL_ART } from "@/components/art/animals";
import { Celebration } from "@/components/ui/Celebration";
import { PlaceFrame } from "@/components/ui/PlaceFrame";
import { useWordBubble } from "@/components/ui/WordBubble";
import { sfxPop, speakSequence, vibrate } from "@/lib/audio";
import { ANIMALS, type AnimalWord } from "@/lib/content";
import { useFindChallenge } from "@/lib/useFindChallenge";

function AnimalTile({
  animal,
  hint,
  onTap,
}: {
  animal: AnimalWord;
  hint: boolean;
  onTap: (animal: AnimalWord) => void;
}) {
  const [taps, setTaps] = useState(0);
  const Glyph = ANIMAL_ART[animal.id];
  return (
    <button
      type="button"
      aria-label={animal.word}
      onPointerDown={(event) => {
        event.preventDefault();
        setTaps((n) => n + 1);
        onTap(animal);
      }}
      className={`relative grid h-full w-full place-items-center rounded-[28px] border-4 border-white/75 p-1 shadow-[0_6px_0_rgba(0,0,0,0.12)] transition-transform active:scale-95 ${
        hint ? "anim-hint" : ""
      }`}
      style={{ background: animal.tint }}
    >
      <span
        key={taps}
        className={`block h-[88%] w-[88%] ${taps > 0 ? "anim-wiggle" : ""}`}
      >
        <Glyph className="h-full w-full" title={animal.word} />
      </span>
    </button>
  );
}

export function FarmGame({ onHome }: { onHome: () => void }) {
  const { bubble, showWord } = useWordBubble();
  const challenge = useFindChallenge(ANIMALS);

  const handleTap = (animal: AnimalWord) => {
    sfxPop();
    vibrate();
    showWord(animal.word);
    if (!challenge.check(animal)) {
      speakSequence([animal.word, animal.sound]);
    }
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-linear-to-b from-[#8ED7FF] via-[#BFEFA0] to-[#7FC96A]">
      <svg
        viewBox="0 0 100 60"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 w-full"
        aria-hidden
      >
        <path d="M0 30 Q 25 12 50 26 T 100 20 L100 60 L0 60 Z" fill="#6FBF5C" />
        <path d="M0 44 Q 30 32 60 42 T 100 38 L100 60 L0 60 Z" fill="#5CA94A" />
      </svg>

      <PlaceFrame
        onHome={onHome}
        onAsk={challenge.start}
        asking={challenge.active}
        prompt={challenge.prompt}
        bubble={bubble}
        bubbleTone="#2E6B3A"
      >
        <div className="grid min-h-0 flex-1 auto-rows-fr grid-cols-2 gap-2 px-2 pb-3 sm:gap-3 sm:px-4 landscape:grid-cols-4">
          {ANIMALS.map((animal) => (
            <AnimalTile
              key={animal.id}
              animal={animal}
              hint={challenge.hint && challenge.target?.id === animal.id}
              onTap={handleTap}
            />
          ))}
        </div>
      </PlaceFrame>

      <Celebration trigger={challenge.celebrate} />
      <Celebration trigger={challenge.finale} big />
    </div>
  );
}
