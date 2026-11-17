import { Maximize, Minimize, Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { PlayerHandlers } from "../hooks/useWatchProgress";
import { formatClock } from "../lib/watchTracker";
import { loadYouTubeApi, YT_STATE, type YTPlayer } from "../lib/youtube";

const POLL_MS = 250;
/** Si en este tiempo no empezó a reproducirse, el navegador bloqueó el play con sonido. */
const AUTOPLAY_CHECK_MS = 1500;

/**
 * Video de YouTube (no listado) con controles propios: sin barra para adelantar,
 * sin enlaces hacia YouTube y sin videos sugeridos al pausar o terminar.
 *
 * Antes del primer play, una portada propia (miniatura + botón) tapa la pantalla
 * inicial de YouTube, que trae el título y «Ver en YouTube». Si el navegador no deja
 * arrancar con sonido (algunos iPhone), arranca en silencio y pide tocar para activarlo.
 */
export function YouTubePlayer({ videoId, handlers }: { videoId: string; handlers: PlayerHandlers }) {
  const frame = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const player = useRef<YTPlayer | null>(null);
  const h = useRef(handlers);
  h.current = handlers;

  const [ready, setReady] = useState(false);
  const [started, setStarted] = useState(false);
  const [mutedStart, setMutedStart] = useState(false);
  const startCheck = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lastState = useRef<number>(-1);
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const [muted, setMuted] = useState(false);
  const [time, setTime] = useState({ current: 0, duration: 0 });
  const [fullscreen, setFullscreen] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let poll: ReturnType<typeof setInterval> | undefined;

    const readTime = (p: YTPlayer) => {
      const current = p.getCurrentTime() || 0;
      const duration = p.getDuration() || 0;
      setTime({ current, duration });
      return { current, duration };
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
            modestbranding: 1,
            cc_load_policy: 0,
          },
          events: {
            onReady: (e) => {
              setReady(true);
              const d = e.target.getDuration();
              if (d) h.current.onReady(d);
              setTime((t) => ({ ...t, duration: d || t.duration }));
            },
            onStateChange: (e) => {
              const p = e.target;
              lastState.current = e.data;
              clearInterval(poll);
              if (e.data === YT_STATE.PLAYING) {
                clearTimeout(startCheck.current);
                // Sin subtítulos, aunque el video o la cuenta de quien lo ve los tenga activados.
                p.unloadModule?.("captions");
                setStarted(true);
                setPlaying(true);
                setEnded(false);
                setMuted(p.isMuted());
                h.current.onReady(p.getDuration());
                h.current.onPlay();
                poll = setInterval(() => h.current.onTime(readTime(p).current), POLL_MS);
              } else if (e.data === YT_STATE.BUFFERING) {
                // El tiempo no avanza mientras carga; no cortamos la cuenta.
              } else {
                setPlaying(false);
                readTime(p);
                h.current.onBreak();
                if (e.data === YT_STATE.ENDED) setEnded(true);
              }
            },
          },
        });
      })
      .catch(() => !cancelled && setError(true));

    return () => {
      cancelled = true;
      clearInterval(poll);
      clearTimeout(startCheck.current);
      player.current?.destroy();
      player.current = null;
    };
  }, [videoId]);

  useEffect(() => {
    const onFs = () => setFullscreen(document.fullscreenElement === frame.current);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const toggle = useCallback(() => {
    const p = player.current;
    if (!p) return;
    if (playing) p.pauseVideo();
    else p.playVideo();
  }, [playing]);

  /** Primer play desde la portada propia. */
  const start = () => {
    const p = player.current;
    if (!p) return;
    p.unMute();
    p.playVideo();
    clearTimeout(startCheck.current);
    startCheck.current = setTimeout(() => {
      // Si está cargando, no es un bloqueo: solo va lento.
      if (lastState.current === YT_STATE.BUFFERING || lastState.current === YT_STATE.PLAYING) return;
      // No arrancó: el navegador bloqueó el sonido. Arrancamos en silencio.
      p.mute();
      p.playVideo();
      setMutedStart(true);
    }, AUTOPLAY_CHECK_MS);
  };

  const unmuteAfterStart = () => {
    player.current?.unMute();
    setMuted(false);
    setMutedStart(false);
  };

  const toggleMute = () => {
    const p = player.current;
    if (!p) return;
    if (p.isMuted()) p.unMute();
    else p.mute();
    setMuted(!muted);
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void frame.current?.requestFullscreen?.();
  };

  const canFullscreen = typeof document !== "undefined" && document.fullscreenEnabled;

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center p-6 text-center text-secondary-foreground">
        No pudimos cargar el video. Revisa tu conexión y recarga la página.
      </div>
    );
  }

  return (
    <div ref={frame} className="relative h-full w-full bg-black">
      <div className="absolute inset-0 [&_iframe]:h-full [&_iframe]:w-full">
        <div ref={host} />
      </div>

      {!started && (
        // Portada propia: tapa el título y «Ver en YouTube» de la pantalla inicial.
        <button
          type="button"
          onClick={start}
          disabled={!ready}
          aria-label="Reproducir el video"
          className="group absolute inset-0 z-20 flex items-center justify-center bg-black focus:outline-none"
        >
          <img
            src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-80"
          />
          <span className="relative flex items-center gap-2 rounded-full bg-primary px-6 py-4 text-lg font-semibold text-primary-foreground shadow-lg transition group-hover:brightness-110 group-focus-visible:ring-4 group-focus-visible:ring-white/60">
            <Play className="h-6 w-6" aria-hidden />
            {ready ? "Ver el video" : "Cargando…"}
          </span>
        </button>
      )}

      {started && mutedStart && muted && (
        <button
          type="button"
          onClick={unmuteAfterStart}
          className="absolute inset-x-0 top-4 z-20 mx-auto flex w-fit items-center gap-2 rounded-full bg-primary px-5 py-3 font-semibold text-primary-foreground shadow-lg"
        >
          <VolumeX className="h-5 w-5" aria-hidden />
          Toca para activar el sonido
        </button>
      )}

      {started && (
        // Capa propia: cubre el video para que no se pueda ir a YouTube ni adelantar.
        <div className="group absolute inset-0 z-10 flex flex-col" onClick={toggle}>
          <div
            className={`flex flex-1 items-center justify-center transition ${
              playing ? "bg-transparent" : "bg-black/70"
            }`}
          >
            {!playing && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggle();
                }}
                className="flex items-center gap-2 rounded-full bg-primary px-6 py-4 text-lg font-semibold text-primary-foreground shadow-lg transition hover:brightness-110 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/60"
              >
                {ended ? <RotateCcw className="h-6 w-6" aria-hidden /> : <Play className="h-6 w-6" aria-hidden />}
                {ended ? "Volver a ver" : "Continuar"}
              </button>
            )}
          </div>

          <div
            className={`flex items-center gap-1 bg-gradient-to-t from-black/80 to-transparent px-2 pb-2 pt-6 text-white transition-opacity sm:gap-2 sm:px-3 ${
              playing ? "opacity-0 group-hover:opacity-100 focus-within:opacity-100" : "opacity-100"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <IconButton label={playing ? "Pausar" : "Reproducir"} onClick={toggle}>
              {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </IconButton>
            <span className="px-1 text-sm tabular-nums">
              {formatClock(time.current)} / {formatClock(time.duration)}
            </span>
            <span className="flex-1" />
            <IconButton label={muted ? "Activar sonido" : "Silenciar"} onClick={toggleMute}>
              {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </IconButton>
            {canFullscreen && (
              <IconButton label={fullscreen ? "Salir de pantalla completa" : "Pantalla completa"} onClick={toggleFullscreen}>
                {fullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
              </IconButton>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
    >
      {children}
    </button>
  );
}
