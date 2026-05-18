"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";

type SeatId = "window-left" | "window-right" | "library-left" | "library-right";

const seatLabels: Record<SeatId, string> = {
  "window-left": "Window Desk A",
  "window-right": "Window Desk B",
  "library-left": "Library Table A",
  "library-right": "Library Table B",
};

const seatDescriptions: Record<SeatId, string> = {
  "window-left": "A quiet corner with the window glow and a soft desk lamp.",
  "window-right": "A balanced seat for deep focus and a wider room view.",
  "library-left": "Closer to the shelves, like studying between old stories.",
  "library-right": "Warm overhead light and a little more breathing room.",
};

const OasisCanvas = dynamic(() => import("@/components/OasisCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-screen items-center justify-center bg-[#120f0d] text-sm tracking-[0.18em] text-[#f4eadb]/75 uppercase">
      Preparing the lounge...
    </div>
  ),
});

export default function OasisStage() {
  const [selectedSeat, setSelectedSeat] = useState<SeatId | null>(null);

  const seatCopy = useMemo(() => {
    if (!selectedSeat) {
      return {
        title: "Choose a seat",
        description: "Click a chair to settle in. The camera will ease into place like you're pulling up to the desk.",
      };
    }

    return {
      title: seatLabels[selectedSeat],
      description: seatDescriptions[selectedSeat],
    };
  }, [selectedSeat]);

  return (
    <>
      <OasisCanvas selectedSeat={selectedSeat} onSeatSelect={setSelectedSeat} />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 p-6 text-[#f4eadb]">
        <div className="max-w-sm">
          <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[#f4eadb]/55">Study Lounge Prototype</p>
          <h2 className="mt-3 text-2xl font-semibold">{seatCopy.title}</h2>
          <p className="mt-2 text-sm leading-6 text-[#f4eadb]/72">{seatCopy.description}</p>
        </div>

        <div className="pointer-events-auto flex items-center gap-3">
          {selectedSeat ? (
            <button
              type="button"
              onClick={() => setSelectedSeat(null)}
              className="rounded-md border border-[#f4eadb]/18 bg-[#1c1613]/78 px-4 py-2 text-sm text-[#f4eadb] transition hover:bg-[#2a211d]"
            >
              Stand Up
            </button>
          ) : null}
        </div>
      </div>
    </>
  );
}
