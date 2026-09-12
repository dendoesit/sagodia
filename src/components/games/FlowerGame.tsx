"use client";

import { useEffect, useRef, useState } from "react";
import { FlowerGarden } from "@/components/art/nature";
import { Celebration } from "@/components/ui/Celebration";
import { PlaceFrame } from "@/components/ui/PlaceFrame";
import { SpeakCommand } from "@/components/ui/SpeakCommand";
import { useWordBubble } from "@/components/ui/WordBubble";

const STEPS = [
  { word: "Seed", color: "#D8A34A" },
  { word: "Water", color: "#4F8FE0" },
  { word: "Sun", color: "#FFD84D" },
  { word: "Flower", color: "#FF8FB1" },
];

function StepIcon({
  index,
  className,
}: {
  index: number;
  className?: string;
}) {
  if (index === 0) {
    return (
      <svg viewBox="0 0 100 100" className={className} aria-hidden>
        <ellipse cx={50} cy={53} rx={20} ry={13} fill="#D8A34A" stroke="#2F2A26" strokeWidth={6} transform="rotate(-24 50 53)" />
      </svg>
    );
  }
  if (index === 1) {
    return (
      <svg viewBox="0 0 100 100" className={className} aria-hidden>
        <path d="M50 10 Q82 48 50 86 Q18 48 50 10 Z" fill="#4F8FE0" stroke="#2F2A26" strokeWidth={6} />
        <path d="M37 54 Q42 68 55 70" fill="none" stroke="#BDEBFF" strokeWidth={7} strokeLinecap="round" />
      </svg>
    );
  }
  if (index === 2) {
    return (
      <svg viewBox="0 0 100 100" className={className} aria-hidden>
        <circle cx={50} cy={50} r={24} fill="#FFD84D" stroke="#2F2A26" strokeWidth={6} />
        <path d="M50 6 V17 M50 83 V94 M6 50 H17 M83 50 H94 M19 19 L27 27 M73 73 L81 81 M81 19 L73 27 M27 73 L19 81" stroke="#FFD84D" strokeWidth={8} strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <path d="M50 56 V92" stroke="#4A9B45" strokeWidth={8} strokeLinecap="round" />
      {[0, 60, 120, 180, 240, 300].map((angle) => (
        <ellipse
          key={angle}
          cx={50}
          cy={28}
          rx={10}
          ry={22}
          fill="#FF8FB1"
          stroke="#2F2A26"
          strokeWidth={4}
          transform={`rotate(${angle} 50 50)`}
        />
      ))}
      <circle cx={50} cy={50} r={15} fill="#FFD84D" stroke="#2F2A26" strokeWidth={5} />
    </svg>
  );
}

export function FlowerGame({ onHome }: { onHome: () => void }) {
  const { bubble } = useWordBubble();
  const [stepIndex, setStepIndex] = useState(0);
  const [growth, setGrowth] = useState(0);
  const [successes, setSuccesses] = useState(0);
  const [party, setParty] = useState(0);
  const timer = useRef<number | undefined>(undefined);
  const step = STEPS[stepIndex];

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const grow = () => {
    const nextGrowth = growth + 1;
    setGrowth(nextGrowth);
    setSuccesses((current) => current + 1);
    window.clearTimeout(timer.current);

    if (stepIndex === STEPS.length - 1) {
      setParty((current) => current + 1);
      timer.current = window.setTimeout(() => {
        setGrowth(0);
        setStepIndex(0);
      }, 3400);
      return;
    }

    timer.current = window.setTimeout(() => {
      setStepIndex((current) => current + 1);
    }, 950);
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-linear-to-b from-[#92D8FA] via-[#C7EEB7] to-[#76C763]">
      <div className="pointer-events-none absolute left-[8%] top-[17%] h-11 w-28 rounded-full bg-white/60 blur-[2px]" />
      <div className="pointer-events-none absolute right-[8%] top-[11%] h-24 w-24 rounded-full bg-[#FFE177]/80 shadow-[0_0_45px_rgba(255,225,119,0.55)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[31%] bg-[#64B455]/70" />
      <PlaceFrame
        onHome={onHome}
        prompt={
          <span className="flex items-center gap-2">
            <StepIcon index={stepIndex} className="h-10 w-10" />
            <span className="text-2xl font-bold">{step.word}!</span>
          </span>
        }
        bubble={bubble}
        bubbleTone="#3E7B35"
      >
        <div className="flex min-h-0 flex-1 flex-col px-3 pb-3">
          <div
            data-flower-growth={growth}
            className="relative grid min-h-0 flex-1 place-items-center overflow-hidden rounded-[36px] border-[5px] border-white/65 bg-white/30 shadow-[inset_0_8px_25px_rgba(71,132,62,0.12),0_9px_0_rgba(62,111,52,0.15)] backdrop-blur-[2px]"
          >
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[28%] bg-[#A96F48]/22" />
            <FlowerGarden stage={growth} className="relative h-full max-h-[31rem] w-full drop-shadow-[0_8px_0_rgba(47,42,38,0.1)]" />
          </div>

          <div className="mt-3 flex h-32 shrink-0 items-center justify-center gap-5 rounded-[30px] border-4 border-white/60 bg-white/32 px-4 shadow-[0_7px_0_rgba(62,111,52,0.14)] backdrop-blur-sm">
            <SpeakCommand
              key={step.word}
              word={step.word}
              onSuccess={grow}
            />
            <div className="flex gap-1.5" aria-label={`Step ${stepIndex + 1} of ${STEPS.length}`}>
              {STEPS.map((item, index) => (
                <span
                  key={item.word}
                  className={`grid h-9 w-9 place-items-center rounded-full border-2 ${
                    index < growth
                      ? "border-white bg-[#5FAF4E]"
                      : index === stepIndex
                        ? "border-white bg-[#F79420]"
                        : "border-white/40 bg-white/20"
                  }`}
                >
                  <StepIcon index={index} className="h-7 w-7" />
                </span>
              ))}
            </div>
          </div>
        </div>
      </PlaceFrame>

      <Celebration trigger={successes} />
      <Celebration trigger={party} big />
    </div>
  );
}
