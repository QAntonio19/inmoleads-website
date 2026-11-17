import { useEffect, useRef } from "react";
import { vslConfig } from "../config";
import type { PlayerHandlers } from "../hooks/useWatchProgress";
import { YouTubePlayer } from "./YouTubePlayer";

/**
 * Reproductor del VSL, en este orden de prioridad:
 * 1. YouTube no listado (VITE_VSL_YOUTUBE_ID) · gratis
 * 2. <video> nativo con VITE_VSL_VIDEO_SRC (.mp4)
 */
export function VslPlayer({ handlers }: { handlers: PlayerHandlers }) {
  const { youtubeId, src } = vslConfig.video;
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-secondary shadow-[0_20px_60px_-15px_hsl(18_100%_50%/0.3)]">
      {youtubeId ? (
        <YouTubePlayer videoId={youtubeId} handlers={handlers} />
      ) : (
        <Html5Player src={src} handlers={handlers} />
      )}
    </div>
  );
}

function Html5Player({ src, handlers }: { src: string; handlers: PlayerHandlers }) {
  const ref = useRef<HTMLVideoElement>(null);

  // Si los metadatos cargaron antes de montar los listeners, igual reportamos la duración.
  useEffect(() => {
    const v = ref.current;
    if (v && v.readyState >= 1) handlers.onReady(v.duration);
  }, [handlers]);

  return (
    <video
      ref={ref}
      className="h-full w-full"
      src={src}
      controls
      playsInline
      preload="metadata"
      controlsList="nodownload noplaybackrate"
      disablePictureInPicture
      onLoadedMetadata={(e) => handlers.onReady(e.currentTarget.duration)}
      onPlay={handlers.onPlay}
      onTimeUpdate={(e) => {
        const v = e.currentTarget;
        if (!v.paused && !v.seeking) handlers.onTime(v.currentTime);
      }}
      onPause={handlers.onBreak}
      onSeeking={handlers.onBreak}
      onEnded={handlers.onBreak}
    />
  );
}
