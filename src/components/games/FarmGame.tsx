"use client";

import { useState } from "react";
import { ANIMAL_ART } from "@/components/art/animals";
import { MicGlyph } from "@/components/art/friends";
import { Celebration } from "@/components/ui/Celebration";
import { PlaceFrame, RoundButton } from "@/components/ui/PlaceFrame";
import { SayAlong, type SayItem } from "@/components/ui/SayAlong";
import { useWordBubble } from "@/components/ui/WordBubble";
import { sfxPop, sfxTap, speak, speakExclusive, vibrate } from "@/lib/audio";
import { ANIMALS, type AnimalWord } from "@/lib/content";
import { useFindChallenge } from "@/lib/useFindChallenge";

const SAY_ITEMS: SayItem[] = ANIMALS.map((animal) => ({
  id: animal.id,
  word: animal.word,
  tint: animal.tint,
  Art: ANIMAL_ART[animal.id],
}));

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
  /** "picking" waits for the child to choose the animal the round starts on. */
  const [sayMode, setSayMode] = useState<"off" | "picking" | "saying">("off");
  const [sayItem, setSayItem] = useState<SayItem>(SAY_ITEMS[0]);

  const handleTap = (animal: AnimalWord) => {
    if (sayMode === "picking") {
      sfxTap();
      vibrate();
      setSayItem(
        SAY_ITEMS.find((item) => item.id === animal.id) ?? SAY_ITEMS[0],
      );
      setSayMode("saying");
      return;
    }
    sfxPop();
    vibrate();
    showWord(animal.word);
    // Refused while the last animal is still talking: the name and its sound
    // are the whole point, and a second tap used to cut them both off.
    if (!challenge.check(animal)) {
      speakExclusive([animal.word, animal.sound]);
    }
  };

  const toggleSay = () => {
    if (sayMode !== "off") {
      setSayMode("off");
      return;
    }
    sfxTap();
    challenge.stop();
    setSayMode("picking");
    speak("Pick an animal and say its name with me!");
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
        onAsk={sayMode === "off" ? challenge.start : undefined}
        asking={challenge.active}
        prompt={
          sayMode === "picking"
            ? "Pick an animal!"
            : sayMode === "saying"
              ? null
              : challenge.prompt
        }
        bubble={bubble}
        bubbleTone="#2E6B3A"
        extraButton={
          <RoundButton
            label="Say the animals with me"
            active={sayMode !== "off"}
            onPress={toggleSay}
          >
            <MicGlyph className="h-7 w-7 sm:h-8 sm:w-8" />
          </RoundButton>
        }
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

        {sayMode === "saying" ? (
          <SayAlong
            items={SAY_ITEMS}
            first={sayItem}
            onExit={() => setSayMode("off")}
          />
        ) : null}
      </PlaceFrame>

      <Celebration trigger={challenge.celebrate} />
      <Celebration trigger={challenge.finale} big />
    </div>
  );
}
