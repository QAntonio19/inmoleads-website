import { Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { isYouTubeShort, loadYouTubeApi, parseYouTubeId, YT_STATE, type YTPlayer } from "../lib/youtube";

/**
 * Video corto (Edgar, testimonios). Acepta un enlace de YouTube (no listado o Short) o un .mp4.
 * Sin src, muestra un recuadro de ejemplo.
 */
export function VideoBox({ src, label, className = "" }: { src?: string; label: string; className?: string }) {
  const ytId = src ? parseYouTubeId(src) : "";

  if (ytId) {
    return <CleanYouTube videoId={ytId} vertical={isYouTubeShort(src ?? "")} label={label} className={className} />;
  }

  if (src) {
    return (
      <video
        className={`aspect-video w-full rounded-xl bg-secondary ${className}`}
        src={src}
        controls
        playsInline
        preload="metadata"
        aria-label={label}
      />
    );
  }

  return (
    <div
      className={`flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-xl bg-secondary px-6 text-center text-secondary-foreground ${className}`}
      role="img"
      aria-label={label}
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Play className="h-6 w-6 translate-x-0.5" aria-hidden />
      </span>
      <span className="text-sm opacity-80">{label}</span>
    </div>
  );
}

/** El que está sonando ahora, para pausarlo cuando se reproduce otro. */
let current: YTPlayer | null = null;

const POLL_MS = 250;
/**
 * Al arrancar, YouTube muestra unos segundos su interfaz (canal, título, logo de Shorts).
 * El video arranca en silencio detrás de la portada; pasado este tiempo vuelve al
 * segundo 0, activa el sonido y se descubre ya limpio.
 */
const WARMUP_MS = 2500;

/**
 * Los Shorts traen su interfaz pintada dentro del video (logo, canal, título, «Me gusta»,
 * «Compartir») y no se puede apagar. Truco: el reproductor se dibuja grande (720×1280),
 * donde esa interfaz ocupa solo las orillas, y se amplía SHORT_ZOOM veces dentro del
 * recuadro para que las orillas queden fuera. Se pierde ~13 % de cada borde del video.
 */
const SHORT_W = 720;
const SHORT_H = 1280;
const SHORT_ZOOM = 1.35;

/**
 * YouTube sin la interfaz de YouTube: reproductor sin controles, tapado por una capa propia.
 * Así no se ven el título, el canal, «Ver en YouTube», los botones de Shorts ni los videos
 * sugeridos al terminar. El reproductor se carga al dar play (más ligero con varios videos).
 * Ver WARMUP_MS: el arranque se hace tapado para que no asome la interfaz inicial.
 */
function CleanYouTube({
  videoId,
  vertical,
  label,
  className,
}: {
  videoId: string;
  vertical: boolean;
  label: string;
  className: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const [boxWidth, setBoxWidth] = useState(0);
  const player = useRef<YTPlayer | null>(null);
  const warmup = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const revealed = useRef(false);

  const [requested, setRequested] = useState(false);
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const [muted, setMuted] = useState(false);
  const [mutedStart, setMutedStart] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(false);

  // Ancho del recuadro, para escalar el reproductor de los Shorts.
  useEffect(() => {
    if (!vertical || !box.current) return;
    const el = box.current;
    const ro = new ResizeObserver(() => setBoxWidth(el.clientWidth));
    ro.observe(el);
    setBoxWidth(el.clientWidth);
    return () => ro.disconnect();
  }, [vertical]);

  useEffect(() => {
    if (!requested) return;
    let cancelled = false;
    let poll: ReturnType<typeof setInterval> | undefined;

    // Arranque tapado y en silencio (en silencio, todos los navegadores dejan reproducir).
    const play = (p: YTPlayer) => {
      if (current && current !== p) current.pauseVideo();
      current = p;
      p.mute();
      p.playVideo();
    };

    const reveal = (p: YTPlayer) => {
      p.seekTo(0, true);
      p.unMute();
      revealed.current = true;
      setStarted(true);
      // Si el navegador no dejó activar el sonido (algunos iPhone), se pide tocar.
      setTimeout(() => {
        const stillMuted = p.isMuted();
        setMuted(stillMuted);
        setMutedStart(stillMuted);
      }, 400);
    };

    loadYouTubeApi()
      .then((YT) => {
        if (cancelled || !host.current) return;
        player.current = new YT.Player(host.current, {
          videoId,
          host: "https://www.youtube-nocookie.com",
          playerVars: {
            controls: 0,
            disablekb: 1,
            fs: 0,
            rel: 0,
            playsinline: 1,
            iv_load_policy: 3,
            cc_load_policy: 0,
            modestbranding: 1,
          },
          events: {
            onReady: (e) => play(e.target),
            onStateChange: (e) => {
              const p = e.target;
              clearInterval(poll);
              if (e.data === YT_STATE.PLAYING) {
                p.unloadModule?.("captions");
                if (current && current !== p) current.pauseVideo();
                current = p;
                if (!revealed.current) {
                  clearTimeout(warmup.current);
                  warmup.current = setTimeout(() => reveal(p), WARMUP_MS);
                }
                setPlaying(true);
                setEnded(false);
                poll = setInterval(() => {
                  const d = p.getDuration() || 0;
                  setProgress(d ? p.getCurrentTime() / d : 0);
                }, POLL_MS);
              } else if (e.data !== YT_STATE.BUFFERING) {
                setPlaying(false);
                if (e.data === YT_STATE.ENDED) {
                  setEnded(true);
                  setProgress(1);
                }
              }
            },
          },
        });
      })
      .catch(() => !cancelled && setError(true));

    return () => {
      cancelled = true;
      clearInterval(poll);
      clearTimeout(warmup.current);
      revealed.current = false;
      if (current === player.current) current = null;
      player.current?.destroy();
      player.current = null;
    };
  }, [requested, videoId]);

  const toggle = () => {
    const p = player.current;
    if (!p) return;
    if (playing) {
      p.pauseVideo();
      return;
    }
    if (current && current !== p) current.pauseVideo();
    current = p;
    p.playVideo();
  };

  const toggleMute = () => {
    const p = player.current;
    if (!p) return;
    if (p.isMuted()) p.unMute();
    else p.mute();
    setMuted(!muted);
    setMutedStart(false);
  };

  const thumb = vertical
    ? `https://i.ytimg.com/vi/${videoId}/oardefault.jpg`
    : `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  return (
    <div
      ref={box}
      className={`relative w-full overflow-hidden rounded-xl bg-black ${vertical ? "aspect-[9/16]" : "aspect-video"} ${className}`}
    >
      {requested &&
        (vertical ? (
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 [&_iframe]:h-full [&_iframe]:w-full"
            style={{
              width: SHORT_W,
              height: SHORT_H,
              transform: `translate(-50%, -50%) scale(${(boxWidth / SHORT_W) * SHORT_ZOOM})`,
            }}
          >
            <div ref={host} />
          </div>
        ) : (
          <div className="absolute inset-0 [&_iframe]:h-full [&_iframe]:w-full">
            <div ref={host} />
          </div>
        ))}

      {error ? (
        <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-sm text-white">
          No pudimos cargar el video.
        </div>
      ) : !started ? (
        // Portada: miniatura y botón propio. Tapa la pantalla de carga de YouTube.
        <button
          type="button"
          onClick={() => setRequested(true)}
          aria-label={`Reproducir: ${label}`}
          className="group absolute inset-0 z-20 flex items-center justify-center focus:outline-none"
        >
          <img
            src={thumb}
            alt=""
            loading="lazy"
            onError={(e) => {
              const img = e.currentTarget;
              if (!img.src.endsWith("hqdefault.jpg")) img.src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
            }}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition group-hover:scale-105 group-focus-visible:ring-4 group-focus-visible:ring-white/60">
            {requested ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <Play className="h-6 w-6 translate-x-0.5" aria-hidden />
            )}
          </span>
        </button>
      ) : (
        // Capa propia encima del video: no deja llegar el mouse a YouTube, así no aparece su interfaz.
        // La capa oscura va en todo el recuadro (también detrás de los controles) al pausar o terminar.
        <div
          className={`group absolute inset-0 z-10 flex flex-col transition ${playing ? "bg-transparent" : "bg-black/90"}`}
          onClick={toggle}
        >
          <div className="flex flex-1 items-center justify-center">
            {!playing && (
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                {ended ? <RotateCcw className="h-6 w-6" aria-hidden /> : <Play className="h-6 w-6 translate-x-0.5" aria-hidden />}
              </span>
            )}
          </div>

          {mutedStart && muted && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleMute();
              }}
              className="absolute inset-x-0 top-3 mx-auto flex w-fit items-center gap-1.5 rounded-full bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-lg"
            >
              <VolumeX className="h-4 w-4" aria-hidden />
              Activar sonido
            </button>
          )}

          <div
            className={`flex items-center gap-1 bg-gradient-to-t from-black/80 to-transparent px-2 pb-2 pt-6 text-white transition-opacity ${
              playing ? "opacity-0 group-hover:opacity-100 focus-within:opacity-100" : "opacity-100"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label={playing ? "Pausar" : "Reproducir"}
              onClick={toggle}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-white/15"
            >
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/25" aria-hidden>
              <div className="h-full bg-primary transition-[width] duration-200" style={{ width: `${progress * 100}%` }} />
            </div>
            <button
              type="button"
              aria-label={muted ? "Activar sonido" : "Silenciar"}
              onClick={toggleMute}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-white/15"
            >
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
