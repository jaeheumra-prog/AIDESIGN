"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";

type SeatId = "window-left" | "window-right" | "library-left" | "library-right";
type Occupant = {
  id: string;
  name: string;
  seatId: SeatId;
  color: string;
  mood: string;
  kind: "you" | "guest";
};

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

const mockGuests: Occupant[] = [
  {
    id: "mina",
    name: "Mina",
    seatId: "window-right",
    color: "#80a8ff",
    mood: "Reviewing lecture notes",
    kind: "guest",
  },
  {
    id: "jiho",
    name: "Jiho",
    seatId: "library-left",
    color: "#7bc59e",
    mood: "Working through practice sets",
    kind: "guest",
  },
];

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
  const [notice, setNotice] = useState("Two seats are softly occupied right now. Pick an open chair and settle in.");

  const occupants = useMemo(() => {
    const you: Occupant[] = selectedSeat
      ? [
          {
            id: "you",
            name: "You",
            seatId: selectedSeat,
            color: "#ffcf96",
            mood: "Settled in for a focus session",
            kind: "you",
          },
        ]
      : [];

    return [...mockGuests, ...you];
  }, [selectedSeat]);

  const occupiedSeatIds = useMemo(
    () => new Set(mockGuests.map((occupant) => occupant.seatId)),
    [],
  );

  const handleSeatSelect = (seatId: SeatId) => {
    setSelectedSeat(seatId);
    setNotice(`You slid into ${seatLabels[seatId]}. The room quieted down around your desk.`);
  };

  const handleSeatBlocked = (seatId: SeatId) => {
    setNotice(`${seatLabels[seatId]} is already taken. Someone is there, deep in their own little study orbit.`);
  };

  const seatCopy = useMemo(() => {
    if (!selectedSeat) {
      return {
        title: "Choose a seat",
        description: notice,
      };
    }

    return {
      title: seatLabels[selectedSeat],
      description: `${seatDescriptions[selectedSeat]} ${notice}`,
    };
  }, [notice, selectedSeat]);

  return (
    <>
      <OasisCanvas
        selectedSeat={selectedSeat}
        occupants={occupants}
        onSeatSelect={handleSeatSelect}
        onSeatBlocked={handleSeatBlocked}
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 p-6 text-[#f4eadb]">
        <div className="max-w-sm">
          <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[#f4eadb]/55">Study Lounge Prototype</p>
          <h2 className="mt-3 text-2xl font-semibold">{seatCopy.title}</h2>
          <p className="mt-2 text-sm leading-6 text-[#f4eadb]/72">{seatCopy.description}</p>
        </div>

        <div className="pointer-events-auto flex items-end gap-4">
          <div className="min-w-[250px] rounded-md border border-[#f4eadb]/12 bg-[#1b1512]/82 p-4 backdrop-blur-sm">
            <p className="text-[0.68rem] uppercase tracking-[0.24em] text-[#f4eadb]/52">Live Seats</p>
            <div className="mt-3 space-y-3 text-sm">
              {(
                Object.keys(seatLabels) as SeatId[]
              ).map((seatId) => {
                const occupant = occupants.find((entry) => entry.seatId === seatId) ?? null;
                const isMockTaken = occupiedSeatIds.has(seatId);
                const statusLabel = occupant
                  ? occupant.kind === "you"
                    ? "You"
                    : occupant.name
                  : "Open";

                const statusTone = occupant
                  ? occupant.kind === "you"
                    ? "text-[#ffd39e]"
                    : "text-[#e5b5ae]"
                  : "text-[#a5d8bb]";

                return (
                  <div key={seatId} className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[#f4eadb]">{seatLabels[seatId]}</p>
                      <p className="mt-1 text-xs leading-5 text-[#f4eadb]/55">
                        {occupant ? occupant.mood : "Free for a new focus session"}
                      </p>
                    </div>
                    <p className={`shrink-0 text-xs font-medium ${statusTone}`}>
                      {isMockTaken ? statusLabel : selectedSeat === seatId ? statusLabel : "Open"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {selectedSeat ? (
            <button
              type="button"
              onClick={() => {
                setSelectedSeat(null);
                setNotice("You stood up, and your chair is open again for the next visitor.");
              }}
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
