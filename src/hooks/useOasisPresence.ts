"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PresenceRecord, SeatId } from "@/lib/oasis";

const STORAGE_KEY = "focus-oasis:presence";
const CHANNEL_NAME = "focus-oasis:presence";
const SESSION_ID_KEY = "focus-oasis:session-id";
const ACTIVE_NAME_KEY = "focus-oasis:active-name";
const SAVED_NAME_KEY = "focus-oasis:saved-name";
const STALE_AFTER_MS = 15_000;
const HEARTBEAT_MS = 4_000;

type SeatRequestResult =
  | { ok: true }
  | {
      ok: false;
      occupant: PresenceRecord;
    };

function getSessionId() {
  if (typeof window === "undefined") {
    return "server-session";
  }

  const existing = window.sessionStorage.getItem(SESSION_ID_KEY);
  if (existing) {
    return existing;
  }

  const next = crypto.randomUUID();
  window.sessionStorage.setItem(SESSION_ID_KEY, next);
  return next;
}

function pickColor(seed: string) {
  const palette = ["#ffcf96", "#88aef6", "#87c9a5", "#d7a0f2", "#f4a88d", "#f0d27a"];
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }

  return palette[hash % palette.length];
}

function readPresenceMap() {
  if (typeof window === "undefined") {
    return {} as Record<string, PresenceRecord>;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {} as Record<string, PresenceRecord>;
    }

    return JSON.parse(raw) as Record<string, PresenceRecord>;
  } catch {
    return {} as Record<string, PresenceRecord>;
  }
}

function writePresenceMap(map: Record<string, PresenceRecord>) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

function prunePresenceMap(map: Record<string, PresenceRecord>, now = Date.now()) {
  return Object.fromEntries(
    Object.entries(map).filter(([, record]) => now - record.updatedAt < STALE_AFTER_MS),
  ) as Record<string, PresenceRecord>;
}

export function useOasisPresence() {
  const [sessionId] = useState(getSessionId);
  const [ready, setReady] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [activeName, setActiveName] = useState<string | null>(null);
  const [seatId, setSeatId] = useState<SeatId | null>(null);
  const [others, setOthers] = useState<PresenceRecord[]>([]);

  const channelRef = useRef<BroadcastChannel | null>(null);

  const color = useMemo(() => pickColor(sessionId), [sessionId]);

  const syncFromStorage = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    const nextMap = prunePresenceMap(readPresenceMap());
    writePresenceMap(nextMap);

    const records = Object.values(nextMap)
      .filter((record) => record.id !== sessionId)
      .sort((left, right) => right.updatedAt - left.updatedAt);

    setOthers(records);
  }, [sessionId]);

  const publish = useCallback(
    (name: string, nextSeatId: SeatId | null) => {
      const nextMap = prunePresenceMap(readPresenceMap());
      nextMap[sessionId] = {
        id: sessionId,
        name,
        seatId: nextSeatId,
        color,
        mood: nextSeatId ? "Settled in for a focus session" : "Looking for a quiet seat",
        updatedAt: Date.now(),
      };

      writePresenceMap(nextMap);
      syncFromStorage();
      channelRef.current?.postMessage({ type: "presence-updated" });
    },
    [color, sessionId, syncFromStorage],
  );

  const purgeSelfPresence = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    const nextMap = prunePresenceMap(readPresenceMap());
    if (!nextMap[sessionId]) {
      return;
    }

    delete nextMap[sessionId];
    writePresenceMap(nextMap);
    channelRef.current?.postMessage({ type: "presence-removed" });
  }, [sessionId]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const remembered = window.localStorage.getItem(SAVED_NAME_KEY) ?? "";
    const active = window.sessionStorage.getItem(ACTIVE_NAME_KEY);

    const frame = window.requestAnimationFrame(() => {
      setDraftName(remembered);
      setActiveName(active);
      setReady(true);
      syncFromStorage();
    });

    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        syncFromStorage();
      }
    };

    window.addEventListener("storage", handleStorage);

    if ("BroadcastChannel" in window) {
      const channel = new BroadcastChannel(CHANNEL_NAME);
      channelRef.current = channel;
      channel.addEventListener("message", syncFromStorage);
    }

    const cleanupInterval = window.setInterval(syncFromStorage, HEARTBEAT_MS);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("storage", handleStorage);
      window.clearInterval(cleanupInterval);
      channelRef.current?.close();
      channelRef.current = null;
    };
  }, [syncFromStorage]);

  useEffect(() => {
    if (!activeName) {
      purgeSelfPresence();
      return;
    }

    const initialPublish = window.setTimeout(() => {
      publish(activeName, seatId);
    }, 0);

    const heartbeat = window.setInterval(() => {
      publish(activeName, seatId);
    }, HEARTBEAT_MS);

    const handleBeforeUnload = () => {
      purgeSelfPresence();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.clearTimeout(initialPublish);
      window.clearInterval(heartbeat);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      purgeSelfPresence();
    };
  }, [activeName, publish, purgeSelfPresence, seatId]);

  const join = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) {
      return false;
    }

    window.localStorage.setItem(SAVED_NAME_KEY, trimmed);
    window.sessionStorage.setItem(ACTIVE_NAME_KEY, trimmed);
    setDraftName(trimmed);
    setActiveName(trimmed);
    return true;
  }, []);

  const signOut = useCallback(() => {
    setSeatId(null);
    setActiveName(null);
    window.sessionStorage.removeItem(ACTIVE_NAME_KEY);
    purgeSelfPresence();
    syncFromStorage();
  }, [purgeSelfPresence, syncFromStorage]);

  const requestSeat = useCallback(
    (nextSeatId: SeatId): SeatRequestResult => {
      const activeRecords = Object.values(prunePresenceMap(readPresenceMap()));
      const takenBy = activeRecords.find(
        (record) => record.id !== sessionId && record.seatId === nextSeatId,
      );

      if (takenBy) {
        syncFromStorage();
        return { ok: false, occupant: takenBy };
      }

      setSeatId(nextSeatId);
      return { ok: true };
    },
    [sessionId, syncFromStorage],
  );

  const standUp = useCallback(() => {
    setSeatId(null);
  }, []);

  const currentUser = useMemo(() => {
    if (!activeName) {
      return null;
    }

      return {
        id: sessionId,
        name: activeName,
        seatId,
        color,
        mood: seatId ? "Settled in for a focus session" : "Looking for a quiet seat",
        updatedAt: 0,
      } satisfies PresenceRecord;
    }, [activeName, color, seatId, sessionId]);

  return {
    ready,
    draftName,
    setDraftName,
    activeName,
    currentUser,
    others,
    selectedSeat: seatId,
    join,
    signOut,
    requestSeat,
    standUp,
  };
}
