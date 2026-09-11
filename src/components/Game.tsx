"use client";

import { useEffect, useState } from "react";
import { HubWorld } from "@/components/HubWorld";
import { StartGate } from "@/components/StartGate";
import { ActionGame } from "@/components/games/ActionGame";
import { BalloonGame } from "@/components/games/BalloonGame";
import { CleanupGame } from "@/components/games/CleanupGame";
import { DressGame } from "@/components/games/DressGame";
import { FarmGame } from "@/components/games/FarmGame";
import { KitchenGame } from "@/components/games/KitchenGame";
import { PaintGame } from "@/components/games/PaintGame";
import { ShapesGame } from "@/components/games/ShapesGame";
import { TrainGame } from "@/components/games/TrainGame";
import { initAudio, stopSpeaking } from "@/lib/audio";
import type { PlaceId } from "@/lib/content";
import { hydrateSettings } from "@/lib/settings";

const GAMES: Record<PlaceId, React.ComponentType<{ onHome: () => void }>> = {
  farm: FarmGame,
  kitchen: KitchenGame,
  paint: PaintGame,
  balloons: BalloonGame,
  shapes: ShapesGame,
  station: TrainGame,
  dress: DressGame,
  cleanup: CleanupGame,
  actions: ActionGame,
};

export function Game() {
  const [started, setStarted] = useState(false);
  const [place, setPlace] = useState<PlaceId | null>(null);

  useEffect(() => {
    initAudio();
    hydrateSettings();
  }, []);

  useEffect(() => {
    if (
      process.env.NODE_ENV !== "production" ||
      !("serviceWorker" in navigator)
    )
      return;
    const register = () =>
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });
  }, []);

  // Stop mid-sentence speech when the child leaves a place or backgrounds the app.
  useEffect(() => {
    const onHidden = () => {
      if (document.visibilityState === "hidden") stopSpeaking();
    };
    document.addEventListener("visibilitychange", onHidden);
    return () => document.removeEventListener("visibilitychange", onHidden);
  }, []);

  const goHome = () => {
    stopSpeaking();
    setPlace(null);
  };

  const Active = place ? GAMES[place] : null;

  return (
    <main className="app-shell no-select">
      {!started ? (
        <StartGate onStart={() => setStarted(true)} />
      ) : Active ? (
        <div key={place} className="anim-pop-in h-full w-full">
          <Active onHome={goHome} />
        </div>
      ) : (
        <HubWorld onOpen={setPlace} />
      )}
    </main>
  );
}
