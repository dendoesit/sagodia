"use client";

import { useState } from "react";
import { ANIMAL_ART } from "@/components/art/animals";
import { Celebration } from "@/components/ui/Celebration";
import { PlaceFrame } from "@/components/ui/PlaceFrame";
import { SayAlong, type SayItem } from "@/components/ui/SayAlong";
import { useWordBubble } from "@/components/ui/WordBubble";
import {
  sfxPop,
  speakTapped,
  stopSpeaking,
  vibrate,
} from "@/lib/audio";
import { ANIMALS, type AnimalWord } from "@/lib/content";
import {
  isRecognitionSupported,
  warmRecognitionPermission,
} from "@/lib/pronunciation";
import { useFindChallenge } from "@/lib/useFindChallenge";
import { useSettings } from "@/lib/settings";
import { primeVoiceInput } from "@/lib/useVoiceListener";

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
  const { checkPronunciation } = useSettings();
  const challenge = useFindChallenge(ANIMALS, {
    voice: (animal) => [animal.sound],
    question: (word) => `Touch the ${word}!`,
  });
  const [saying, setSaying] = useState(false);
  const [sayItem, setSayItem] = useState<SayItem>(SAY_ITEMS[0]);

  const handleTap = (animal: AnimalWord) => {
    sfxPop();
    vibrate();
    showWord(animal.word);
    // During a round the challenge speaks for both of us, and it needs the
    // animal's own noise to work it into "Woof woof! Not the cat. Meow!".
    if (challenge.check(animal, [animal.word, animal.sound]) !== "idle") {
      return;
    }
    const selected =
      SAY_ITEMS.find((item) => item.id === animal.id) ?? SAY_ITEMS[0];
    // Strict browser recognition must own the microphone by itself on WebKit.
    // Free-attempt mode keeps the local volume listener.
    if (checkPronunciation && isRecognitionSupported()) {
      void warmRecognitionPermission();
    } else if (!checkPronunciation) {
      void primeVoiceInput();
    }
    setSayItem(selected);
    setSaying(true);
    // Say only the target word; the child gets a short turn immediately after.
    speakTapped(`repeat-${animal.id}`, [animal.word]);
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
        onAsk={saying ? undefined : challenge.start}
        asking={challenge.active}
        prompt={saying ? null : challenge.prompt}
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

        {saying ? (
          <SayAlong
            items={SAY_ITEMS}
            first={sayItem}
            promptAlreadyPlaying
            onHome={() => {
              stopSpeaking();
              setSaying(false);
              onHome();
            }}
            onExit={() => {
              stopSpeaking();
              setSaying(false);
            }}
          />
        ) : null}
      </PlaceFrame>

      <Celebration trigger={challenge.celebrate} />
      <Celebration trigger={challenge.finale} big />
    </div>
  );
}
