"use client";

import { useEffect, useRef, useState } from "react";
import { Frog, LilyPad } from "@/components/art/nature";
import { Celebration } from "@/components/ui/Celebration";
import { PlaceFrame } from "@/components/ui/PlaceFrame";
import { SpeakCommand } from "@/components/ui/SpeakCommand";
import { useWordBubble } from "@/components/ui/WordBubble";

type FrogCommand = {
  word: string;
  animation: string;
  move: number;
};

const COMMANDS: FrogCommand[] = [
  { word: "Jump", animation: "anim-action-jump", move: 1 },
  { word: "Run", animation: "anim-frog-run", move: 2 },
  { word: "Walk", animation: "anim-frog-walk", move: 1 },
  { word: "Stop", animation: "anim-frog-stop", move: 0 },
  { word: "Clap", animation: "anim-frog-clap", move: 0 },
  { word: "Sit", animation: "anim-frog-sit", move: 0 },
  { word: "Stand", animation: "anim-frog-stand", move: 0 },
  { word: "Turn", animation: "anim-action-spin", move: 0 },
];

const PAD_POSITIONS = [2, 21, 40, 59, 78];

export function FrogGame({ onHome }: { onHome: () => void }) {
  const { bubble } = useWordBubble();
  const [commandIndex, setCommandIndex] = useState(0);
  const [pad, setPad] = useState(0);
  const [action, setAction] = useState<FrogCommand | null>(null);
  const [actionKey, setActionKey] = useState(0);
  const [wins, setWins] = useState(0);
  const [party, setParty] = useState(0);
  const timer = useRef<number | undefined>(undefined);
  const command = COMMANDS[commandIndex];

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const perform = () => {
    setAction(command);
    setActionKey((current) => current + 1);
    if (command.move > 0) {
      setPad((current) => (current + command.move) % PAD_POSITIONS.length);
    }
    const nextWins = wins + 1;
    setWins(nextWins);
    if (nextWins % COMMANDS.length === 0) {
      setParty((current) => current + 1);
    }

    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setAction(null);
      setCommandIndex((current) => (current + 1) % COMMANDS.length);
    }, 950);
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-linear-to-b from-[#9EDCFA] via-[#BDECF5] to-[#67C6D0]">
      <div className="pointer-events-none absolute right-[7%] top-[12%] h-24 w-24 rounded-full bg-[#FFE177]/80 shadow-[0_0_45px_rgba(255,225,119,0.55)]" />
      <div className="pointer-events-none absolute left-[8%] top-[21%] h-10 w-24 rounded-full bg-white/55 blur-[2px]" />
      <PlaceFrame
        onHome={onHome}
        prompt={
          <span className="flex items-center gap-2">
            <Frog className="h-10 w-10" />
            <span className="text-2xl font-bold">{command.word}!</span>
          </span>
        }
        bubble={bubble}
        bubbleTone="#287C53"
      >
        <div className="flex min-h-0 flex-1 flex-col px-3 pb-3">
          <div className="relative min-h-0 flex-1 overflow-hidden rounded-[34px] border-[5px] border-white/65 bg-linear-to-b from-[#8DD6F0]/70 to-[#4EB8C9]/85 shadow-[inset_0_8px_24px_rgba(30,116,136,0.16),0_9px_0_rgba(35,101,118,0.15)]">
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%] bg-[#43AEBB]/35" />
            <div className="pointer-events-none absolute inset-x-0 bottom-[8%] grid grid-cols-5 items-end gap-1 px-1">
              {PAD_POSITIONS.map((_, index) => (
                <LilyPad
                  key={index}
                  className={`w-full ${
                    index % 2 === 0 ? "-rotate-2" : "rotate-2"
                  }`}
                  fill={index === pad ? "#80CD64" : "#61B452"}
                />
              ))}
            </div>
            <div
              data-frog-action={action?.word.toLowerCase() ?? "ready"}
              data-frog-pad={pad}
              className="absolute bottom-[15%] w-[20%] transition-[left] duration-700 ease-out"
              style={{ left: `${PAD_POSITIONS[pad]}%` }}
            >
              <div
                key={actionKey}
                className={`h-full w-full ${
                  action?.animation ?? "anim-bob"
                }`}
              >
                <Frog className="h-full w-full drop-shadow-[0_7px_0_rgba(47,42,38,0.16)]" title="Frog" />
              </div>
            </div>
          </div>

          <div className="mt-3 flex h-32 shrink-0 items-center justify-center gap-5 rounded-[30px] border-4 border-white/60 bg-white/28 px-4 shadow-[0_7px_0_rgba(35,101,118,0.14)] backdrop-blur-sm">
            <SpeakCommand
              key={command.word}
              word={command.word}
              onSuccess={perform}
            />
            <div className="grid grid-cols-4 gap-1.5" aria-label={`${commandIndex + 1} of ${COMMANDS.length} commands`}>
              {COMMANDS.map((item, index) => (
                <span
                  key={item.word}
                  className={`h-3 w-3 rounded-full ${
                    index < commandIndex
                      ? "bg-[#5FAF4E]"
                      : index === commandIndex
                        ? "bg-[#F79420]"
                        : "bg-[#2F2A26]/15"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </PlaceFrame>

      <Celebration trigger={wins} />
      <Celebration trigger={party} big />
    </div>
  );
}
