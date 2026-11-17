// Configuración del embudo. Lo que cambia entre ambientes viene de variables
// de entorno (ver .env.example); lo demás se edita aquí.

import { parseYouTubeId } from "./lib/youtube";

const env = import.meta.env;

// Video de muestra de 15 s para la demo: la agenda se abre a los 9 s.
const SAMPLE_VIDEO =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";

export const vslConfig = {
  /** Ruta donde se monta el módulo dentro del sitio. */
  basePath: "/sesion",

  video: {
    /** ID o URL de un video de YouTube «no listado». Tiene prioridad sobre los demás. */
    // También acepta un enlace de YouTube puesto por error en VITE_VSL_VIDEO_SRC.
    youtubeId:
      parseYouTubeId((env.VITE_VSL_YOUTUBE_ID as string | undefined) || "") ||
      parseYouTubeId((env.VITE_VSL_VIDEO_SRC as string | undefined) || ""),
    src: (env.VITE_VSL_VIDEO_SRC as string | undefined) || SAMPLE_VIDEO,
    /** Identifica el avance guardado; cámbialo si cambias el video. */
    storageKey: "vsl-v1",
  },

  /** Fracción del video que hay que ver para desbloquear la agenda. */
  unlockAt: 0.6,

  /**
   * Cómo se obtiene la agenda:
   * - "seguro": Make vuelve a calificar y responde con un enlace de Calendly de un
   *   solo uso. La URL del evento nunca está en la página. (Recomendado.)
   * - "directo": la página usa VITE_VSL_CALENDLY_URL. Solo para pruebas rápidas.
   * Si no se indica: "directo" si hay URL de Calendly; si no, "seguro".
   */
  bookingMode: ((env.VITE_VSL_BOOKING_MODE as string | undefined) ||
    (env.VITE_VSL_CALENDLY_URL ? "directo" : "seguro")) as "seguro" | "directo",
  calendlyUrl: (env.VITE_VSL_CALENDLY_URL as string | undefined) || "",
  webhookUrl: (env.VITE_VSL_WEBHOOK_URL as string | undefined) || "",
  /** Cuánto esperar la respuesta de Make antes de mostrar el plan B. */
  bookingTimeoutMs: 12000,

  thanksVideoSrc: (env.VITE_VSL_THANKS_VIDEO_SRC as string | undefined) || "",
  notYetVideoSrc: (env.VITE_VSL_NOTYET_VIDEO_SRC as string | undefined) || "",
  /** Videos de testimonios, en orden. Enlace de YouTube o .mp4; los vacíos no se muestran. */
  testimonialVideos: [
    env.VITE_VSL_TESTIMONIAL_1,
    env.VITE_VSL_TESTIMONIAL_2,
    env.VITE_VSL_TESTIMONIAL_3,
    env.VITE_VSL_TESTIMONIAL_4,
    env.VITE_VSL_TESTIMONIAL_5,
  ].map((v) => ((v as string | undefined) || "").trim()),

  whatsapp: {
    /** Número en formato internacional, sin + ni espacios. Por confirmar. */
    number: "525649871454",
    message: (name: string) =>
      `Hola, soy ${name}. Ya agendé mi sesión con InmoLeads y confirmo mi asistencia.`,
  },

  instagram: { handle: "inmoleads.mkt", url: "https://www.instagram.com/inmoleads.mkt/" },

  /** ID del pixel de Meta. Vacío = no se carga el pixel. */
  metaPixelId: ((env.VITE_META_PIXEL_ID as string | undefined) || "").trim(),

  privacyUrl: "#",

  /** Página de términos de la garantía. Vacío = «*Aplican términos y condiciones» sin enlace. */
  termsUrl: "",

  /** Habilita ?unlock=1 y ?reset=1 para probar. Apagar en producción. */
  // VITE_VSL_DEBUG manda si está puesto («true» o «false»); si no, solo en `npm run dev`.
  debug: (() => {
    const v = String(env.VITE_VSL_DEBUG ?? "").trim().toLowerCase();
    if (v === "true") return true;
    if (v === "false") return false;
    return Boolean(env.DEV);
  })(),
};

export const paths = {
  landing: vslConfig.basePath,
  schedule: `${vslConfig.basePath}/agenda`,
  thanks: `${vslConfig.basePath}/gracias`,
  notYet: `${vslConfig.basePath}/todavia-no`,
};
