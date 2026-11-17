import { useCallback, useMemo, useRef, useState } from "react";
import { vslConfig } from "../config";
import { progressStore } from "../lib/session";
import { track, VIDEO_MILESTONES } from "../lib/tracking";
import { WatchTracker } from "../lib/watchTracker";

export interface PlayerHandlers {
  /** El reproductor conoce la duración. */
  onReady: (duration: number) => void;
  /** Posición actual mientras reproduce. */
  onTime: (seconds: number) => void;
  /** Pausa, seek o fin: corta la cuenta para no sumar saltos. */
  onBreak: () => void;
  onPlay: () => void;
}

export interface WatchProgress {
  duration: number;
  watchedSeconds: number;
  fraction: number;
  unlocked: boolean;
  /** Segundos de video que faltan para desbloquear; null si aún no hay duración. */
  remainingToUnlock: number | null;
  handlers: PlayerHandlers;
  forceUnlock: () => void;
  resetProgress: () => void;
}

const SAVE_EVERY_MS = 2000;

export function useWatchProgress(): WatchProgress {
  const key = vslConfig.video.storageKey;
  const tracker = useRef<WatchTracker | null>(null);
  const prevFraction = useRef(0);
  const lastSave = useRef(0);
  const playedOnce = useRef(false);

  const [snap, setSnap] = useState(() => ({
    duration: 0,
    watchedSeconds: 0,
    unlocked: progressStore.isUnlocked(key),
  }));

  const sync = useCallback(
    (forceSave = false) => {
      const t = tracker.current;
      if (!t) return;
      const fraction = t.fraction;

      for (const m of VIDEO_MILESTONES) {
        if (prevFraction.current < m.at && fraction >= m.at) {
          track(m.name, { watched_seconds: Math.round(t.watchedSeconds) });
        }
      }
      prevFraction.current = fraction;

      const now = Date.now();
      if (forceSave || now - lastSave.current > SAVE_EVERY_MS) {
        progressStore.save(key, t.serialize());
        lastSave.current = now;
      }

      setSnap((s) => {
        let unlocked = s.unlocked;
        if (!unlocked && fraction >= vslConfig.unlockAt) {
          unlocked = true;
          progressStore.setUnlocked(key);
          track("VSL_Unlock", { watched_seconds: Math.round(t.watchedSeconds) });
        }
        return { duration: t.duration, watchedSeconds: t.watchedSeconds, unlocked };
      });
    },
    [key],
  );

  const handlers = useMemo<PlayerHandlers>(
    () => ({
      onReady(duration) {
        if (!duration || !Number.isFinite(duration)) return;
        if (tracker.current && Math.abs(tracker.current.duration - duration) < 1) return;
        tracker.current = new WatchTracker(duration, progressStore.load(key));
        prevFraction.current = tracker.current.fraction;
        sync();
      },
      onTime(seconds) {
        tracker.current?.tick(seconds);
        sync();
      },
      onBreak() {
        tracker.current?.reset();
        sync(true);
      },
      onPlay() {
        if (!playedOnce.current) {
          playedOnce.current = true;
          track("VSL_Play");
        }
      },
    }),
    [key, sync],
  );

  const forceUnlock = useCallback(() => {
    progressStore.setUnlocked(key);
    setSnap((s) => ({ ...s, unlocked: true }));
  }, [key]);

  const resetProgress = useCallback(() => {
    progressStore.clear(key);
    const d = tracker.current?.duration;
    tracker.current = d ? new WatchTracker(d) : null;
    prevFraction.current = 0;
    setSnap({ duration: d ?? 0, watchedSeconds: 0, unlocked: false });
  }, [key]);

  const fraction = snap.duration > 0 ? snap.watchedSeconds / snap.duration : 0;
  const remainingToUnlock =
    snap.duration > 0 ? Math.max(0, snap.duration * vslConfig.unlockAt - snap.watchedSeconds) : null;

  return { ...snap, fraction, remainingToUnlock, handlers, forceUnlock, resetProgress };
}
