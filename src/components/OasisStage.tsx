"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { useOasisPresence } from "@/hooks/useOasisPresence";
import { seatDescriptions, seatLabels, type PresenceRecord, type SeatId } from "@/lib/oasis";

type CanvasOccupant = Omit<PresenceRecord, "seatId"> & {
  seatId: SeatId;
  kind: "you" | "guest";
};

const OasisCanvas = dynamic(() => import("@/components/OasisCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-screen items-center justify-center bg-[#120f0d] text-sm tracking-[0.18em] text-[#f4eadb]/75 uppercase">
      Preparing the lounge...
    </div>
  ),
});

function LoginOverlay({
  draftName,
  setDraftName,
  onJoin,
}: {
  draftName: string;
  setDraftName: (value: string) => void;
  onJoin: () => void;
}) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#120f0d]/78 px-6 backdrop-blur-md">
      <div className="w-full max-w-md rounded-lg border border-[#f4eadb]/12 bg-[#1a1411]/88 p-7 text-[#f4eadb] shadow-2xl">
        <p className="text-[0.68rem] uppercase tracking-[0.3em] text-[#f4eadb]/52">Welcome Back To The Lounge</p>
        <h2 className="mt-4 text-3xl font-semibold">Focus Oasis</h2>
        <p className="mt-3 text-sm leading-6 text-[#f4eadb]/68">
          Pick the name you want other desks to see. Once you enter, your seat and presence will ripple across other open
          Oasis screens on this browser.
        </p>

        <label className="mt-6 block">
          <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-[#f4eadb]/48">Display Name</span>
          <input
            value={draftName}
            onChange={(event) => setDraftName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                onJoin();
              }
            }}
            placeholder="Ra Jae-heum"
            className="w-full rounded-md border border-[#f4eadb]/12 bg-[#241c18] px-4 py-3 text-base text-[#f4eadb] outline-none transition placeholder:text-[#f4eadb]/28 focus:border-[#ffca92]/55"
          />
        </label>

        <button
          type="button"
          onClick={onJoin}
          className="mt-5 inline-flex h-11 items-center justify-center rounded-md bg-[#e2ab73] px-5 text-sm font-medium text-[#241711] transition hover:bg-[#f0bb86]"
        >
          Enter The Study Room
        </button>
      </div>
    </div>
  );
}

export default function OasisStage() {
  const {
    ready,
    draftName,
    setDraftName,
    activeName,
    currentUser,
    others,
    selectedSeat,
    join,
    signOut,
    requestSeat,
    standUp,
  } = useOasisPresence();

  const [notice, setNotice] = useState(
    "Open the Oasis in another browser window, sign in there too, and you'll watch seats update across both screens.",
  );

  const occupants = useMemo<CanvasOccupant[]>(() => {
    const everyone = [...others];
    if (currentUser) {
      everyone.push(currentUser);
    }

    return everyone
      .filter((occupant): occupant is PresenceRecord & { seatId: SeatId } => occupant.seatId !== null)
      .map((occupant) => ({
        ...occupant,
        kind: occupant.id === currentUser?.id ? "you" : "guest",
      }));
  }, [currentUser, others]);

  const handleJoin = () => {
    const success = join(draftName);
    if (!success) {
      setNotice("A name is enough for now. Give yourself a small sign above the chair and step in.");
      return;
    }

    setNotice("You are inside the lounge now. Pick an open chair and the other open Oasis screens will see it.");
  };

  const handleSeatSelect = (seatId: SeatId) => {
    const result = requestSeat(seatId);

    if (!result.ok) {
      setNotice(`${seatLabels[seatId]} is already taken by ${result.occupant.name}. The room politely keeps that desk reserved.`);
      return;
    }

    setNotice(`You settled into ${seatLabels[seatId]}. Other open Oasis screens should now see your chair glow and your name appear.`);
  };

  const handleSeatBlocked = (seatId: SeatId) => {
    const occupant = occupants.find((entry) => entry.seatId === seatId && entry.kind === "guest");
    if (occupant) {
      setNotice(`${seatLabels[seatId]} is occupied by ${occupant.name}. They're ${occupant.mood.toLowerCase()}.`);
      return;
    }

    setNotice(`${seatLabels[seatId]} is already taken right now.`);
  };

  const seatCopy = useMemo(() => {
    if (!selectedSeat) {
      return {
        title: activeName ? "Choose a seat" : "Sign in to enter",
        description: notice,
      };
    }

    return {
      title: seatLabels[selectedSeat],
      description: `${seatDescriptions[selectedSeat]} ${notice}`,
    };
  }, [activeName, notice, selectedSeat]);

  return (
    <>
      <OasisCanvas
        selectedSeat={selectedSeat}
        occupants={occupants}
        onSeatSelect={handleSeatSelect}
        onSeatBlocked={handleSeatBlocked}
      />

      {!ready || !activeName ? (
        <LoginOverlay draftName={draftName} setDraftName={setDraftName} onJoin={handleJoin} />
      ) : null}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 p-6 text-[#f4eadb]">
        <div className="max-w-sm">
          <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[#f4eadb]/55">Shared Study Lounge</p>
          <h2 className="mt-3 text-2xl font-semibold">{seatCopy.title}</h2>
          <p className="mt-2 text-sm leading-6 text-[#f4eadb]/72">{seatCopy.description}</p>
        </div>

        <div className="pointer-events-auto flex items-end gap-4">
          <div className="max-h-[72vh] min-w-[300px] overflow-y-auto rounded-md border border-[#f4eadb]/12 bg-[#1b1512]/82 p-4 backdrop-blur-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[0.68rem] uppercase tracking-[0.24em] text-[#f4eadb]/52">Live Seats</p>
                <p className="mt-1 text-xs leading-5 text-[#f4eadb]/42">
                  {activeName ? `${activeName} is in the room.` : "Join from this screen to start sharing your seat."}
                </p>
              </div>

              {activeName ? (
                <button
                  type="button"
                  onClick={() => {
                    signOut();
                    setNotice("You slipped out of the room. Your chair is open again, and the other screens will see the lounge quiet down.");
                  }}
                  className="rounded-md border border-[#f4eadb]/14 bg-[#241c18] px-3 py-2 text-xs text-[#f4eadb]/86 transition hover:bg-[#2d221d]"
                >
                  Leave
                </button>
              ) : null}
            </div>

            <div className="mt-3 space-y-3 text-sm">
              {(Object.keys(seatLabels) as SeatId[]).map((seatId) => {
                const occupant = occupants.find((entry) => entry.seatId === seatId) ?? null;
                const statusLabel = occupant ? occupant.name : "Open";
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
                    <p className={`shrink-0 text-xs font-medium ${statusTone}`}>{statusLabel}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {selectedSeat ? (
            <button
              type="button"
              onClick={() => {
                standUp();
                setNotice("You stood up, and that little update should now ripple out to the other open Oasis screens.");
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
