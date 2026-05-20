"use client";

import type { RealtimeChannel } from "@supabase/supabase-js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PresenceRecord, SeatId } from "@/lib/oasis";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";

const STORAGE_KEY = "focus-oasis:presence";
const CHANNEL_NAME = "focus-oasis:presence";
const SESSION_ID_KEY = "focus-oasis:session-id";
const ACTIVE_NAME_KEY = "focus-oasis:active-name";
const SAVED_NAME_KEY = "focus-oasis:saved-name";
const ROOM_CHANNEL = "focus-oasis:shared-room";
const STALE_AFTER_MS = 15_000;
const HEARTBEAT_MS = 4_000;

type SeatRequestResult =
  | { ok: true }
  | {
      ok: false;
      occupant: PresenceRecord;
    };

type RealtimeMode = "supabase" | "local";

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

function flattenPresenceState(state: Record<string, PresenceRecord[]>) {
  return Object.values(state)
    .flat()
    .sort((left, right) => right.updatedAt - left.updatedAt);
}

export function useOasisPresence() {
  const [sessionId] = useState(getSessionId);
  const [ready, setReady] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [activeName, setActiveName] = useState<string | null>(null);
  const [seatId, setSeatId] = useState<SeatId | null>(null);
  const [others, setOthers] = useState<PresenceRecord[]>([]);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const localChannelRef = useRef<BroadcastChannel | null>(null);

  const color = useMemo(() => pickColor(sessionId), [sessionId]);
  const realtimeMode: RealtimeMode = isSupabaseConfigured ? "supabase" : "local";

  const setOthersFromRecords = useCallback(
    (records: PresenceRecord[]) => {
      setOthers(
        records
          .filter((record) => record.id !== sessionId)
          .sort((left, right) => right.updatedAt - left.updatedAt),
      );
    },
    [sessionId],
  );

  const syncLocalFromStorage = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    const nextMap = prunePresenceMap(readPresenceMap());
    writePresenceMap(nextMap);
    setOthersFromRecords(Object.values(nextMap));
  }, [setOthersFromRecords]);

  const localPublish = useCallback(
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
      syncLocalFromStorage();
      localChannelRef.current?.postMessage({ type: "presence-updated" });
    },
    [color, sessionId, syncLocalFromStorage],
  );

  const purgeLocalPresence = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    const nextMap = prunePresenceMap(readPresenceMap());
    if (!nextMap[sessionId]) {
      return;
    }

    delete nextMap[sessionId];
    writePresenceMap(nextMap);
    localChannelRef.current?.postMessage({ type: "presence-removed" });
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
      if (realtimeMode === "local") {
        syncLocalFromStorage();
      }
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [realtimeMode, syncLocalFromStorage]);

  useEffect(() => {
    if (realtimeMode !== "local" || typeof window === "undefined") {
      return;
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        syncLocalFromStorage();
      }
    };

    window.addEventListener("storage", handleStorage);

    if ("BroadcastChannel" in window) {
      const channel = new BroadcastChannel(CHANNEL_NAME);
      localChannelRef.current = channel;
      channel.addEventListener("message", syncLocalFromStorage);
    }

    const cleanupInterval = window.setInterval(syncLocalFromStorage, HEARTBEAT_MS);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.clearInterval(cleanupInterval);
      localChannelRef.current?.close();
      localChannelRef.current = null;
    };
  }, [realtimeMode, syncLocalFromStorage]);

  useEffect(() => {
    if (realtimeMode !== "supabase" || !activeName) {
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return;
    }

    const channel = supabase.channel(ROOM_CHANNEL, {
      config: {
        presence: {
          key: sessionId,
        },
      },
    });

    channelRef.current = channel;

    const syncPresence = () => {
      const nextRecords = flattenPresenceState(
        channel.presenceState<PresenceRecord>() as Record<string, PresenceRecord[]>,
      );
      setOthersFromRecords(nextRecords);
    };

    channel
      .on("presence", { event: "sync" }, syncPresence)
      .on("presence", { event: "join" }, syncPresence)
      .on("presence", { event: "leave" }, syncPresence)
      .subscribe();

    return () => {
      if (channelRef.current === channel) {
        channelRef.current = null;
      }

      void channel.untrack();
      void supabase.removeChannel(channel);
    };
  }, [activeName, realtimeMode, sessionId, setOthersFromRecords]);

  useEffect(() => {
    if (!activeName) {
      if (realtimeMode === "local") {
        purgeLocalPresence();
        const frame = window.requestAnimationFrame(() => {
          syncLocalFromStorage();
        });
        return () => {
          window.cancelAnimationFrame(frame);
        };
      }
      return;
    }

    const publishPresence = async () => {
      if (realtimeMode === "supabase") {
        if (!channelRef.current) {
          return;
        }

        await channelRef.current.track({
          id: sessionId,
          name: activeName,
          seatId,
          color,
          mood: seatId ? "Settled in for a focus session" : "Looking for a quiet seat",
          updatedAt: Date.now(),
        } satisfies PresenceRecord);
        return;
      }

      localPublish(activeName, seatId);
    };

    const initialPublish = window.setTimeout(() => {
      void publishPresence();
    }, 120);

    const heartbeat = window.setInterval(() => {
      void publishPresence();
    }, HEARTBEAT_MS);

    const handleBeforeUnload = () => {
      if (realtimeMode === "supabase") {
        void channelRef.current?.untrack();
      } else {
        purgeLocalPresence();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.clearTimeout(initialPublish);
      window.clearInterval(heartbeat);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (realtimeMode === "local") {
        purgeLocalPresence();
      }
    };
  }, [activeName, color, localPublish, purgeLocalPresence, realtimeMode, seatId, sessionId, syncLocalFromStorage]);

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
    setOthers([]);
    window.sessionStorage.removeItem(ACTIVE_NAME_KEY);

    if (realtimeMode === "supabase") {
      void channelRef.current?.untrack();
    } else {
      purgeLocalPresence();
      syncLocalFromStorage();
    }
  }, [purgeLocalPresence, realtimeMode, syncLocalFromStorage]);

  const requestSeat = useCallback(
    (nextSeatId: SeatId): SeatRequestResult => {
      const takenBy = others.find((record) => record.seatId === nextSeatId);

      if (takenBy) {
        return { ok: false, occupant: takenBy };
      }

      setSeatId(nextSeatId);
      return { ok: true };
    },
    [others],
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
    realtimeMode,
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
