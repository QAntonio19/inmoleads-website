// Eventos para Meta Pixel (fbq) y Google (gtag).
// El pixel de Meta lo carga este módulo (initPixel) con VITE_META_PIXEL_ID, solo en /sesion.
// Si el sitio ya tiene su propio pixel cargado, se usa ese y no se carga otro.

type Fbq = ((cmd: string, ...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[];
  push?: Fbq;
  loaded?: boolean;
  version?: string;
};
type Gtag = (cmd: "event", name: string, params?: object) => void;

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
    gtag?: Gtag;
  }
}

let pixelReady = false;

/**
 * Carga el pixel de Meta (código base oficial) y lo inicia con el ID de VITE_META_PIXEL_ID.
 * Hay que llamarlo antes de mandar eventos: mientras el script baja, los eventos quedan en fila.
 * El PageView lo manda pageView() en cada cambio de ruta.
 */
export function initPixel(pixelId: string): void {
  if (pixelReady || !pixelId || typeof window === "undefined") return;
  pixelReady = true;
  if (window.fbq) {
    // El sitio ya cargó el script del pixel: solo se inicia nuestro ID.
    window.fbq("init", pixelId);
    return;
  }
  const fbq: Fbq = function (...args: unknown[]) {
    if (fbq.callMethod) fbq.callMethod(...args);
    else fbq.queue!.push(args);
  } as Fbq;
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = "2.0";
  fbq.queue = [];
  window.fbq = fbq;
  if (!window._fbq) window._fbq = fbq;

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(script);

  fbq("init", pixelId);
}

/** PageView de Meta. En una app de una sola página hay que mandarlo en cada cambio de ruta. */
export function pageView(): void {
  try {
    window.fbq?.("track", "PageView");
  } catch {
    /* un error de medición nunca debe romper la página */
  }
  if (import.meta.env.DEV) console.info("[vsl:track]", "PageView", location.pathname);
}

/** Eventos estándar de Meta que usamos. Los demás van como personalizados. */
const STANDARD = new Set(["ViewContent", "Lead", "Schedule", "Contact"]);

export function track(name: string, params: Record<string, unknown> = {}, eventId?: string): void {
  try {
    if (window.fbq) {
      window.fbq(STANDARD.has(name) ? "track" : "trackCustom", name, params, eventId ? { eventID: eventId } : undefined);
    }
    window.gtag?.("event", name, params);
  } catch {
    /* un error de medición nunca debe romper la página */
  }
  if (import.meta.env.DEV) console.info("[vsl:track]", name, params, eventId ?? "");
}

/**
 * Hitos de avance del video (segundos realmente vistos). «Completo» se marca al
 * 95% porque el último segundo casi nunca se registra entero.
 */
export const VIDEO_MILESTONES = [
  { at: 0.25, name: "VSL_25" },
  { at: 0.5, name: "VSL_50" },
  { at: 0.75, name: "VSL_75" },
  { at: 0.95, name: "VSL_Complete" },
] as const;
