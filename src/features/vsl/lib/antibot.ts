// Filtro barato contra bots que llenan formularios. No protege el webhook de Make
// de quien le mande datos directo (la URL es pública); para eso, el filtro de Make
// o un servidor intermedio.

/** Nombre del campo trampa: oculto para personas, tentador para bots. */
export const HONEYPOT_NAME = "empresa_sitio_web";

/** Nadie llena 4 datos y 5 preguntas en menos de esto. */
export const MIN_FILL_MS = 3000;

export function looksLikeBot({ honeypot, elapsedMs }: { honeypot: string; elapsedMs: number }): boolean {
  return honeypot.trim() !== "" || elapsedMs < MIN_FILL_MS;
}
