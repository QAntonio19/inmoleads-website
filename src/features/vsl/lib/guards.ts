// Quién puede ver cada pantalla protegida. Las páginas usan esto para redirigir.

import { vslConfig } from "../config";
import { qualify } from "./qualify";
import type { Lead } from "./session";

/**
 * Solo un lead que califica puede ver la agenda y la confirmación. Se recalcula
 * con las respuestas en lugar de confiar en el resultado guardado, por si alguien
 * edita el almacenamiento del navegador.
 */
export function canSchedule(lead: Lead | null | undefined): lead is Lead {
  if (!lead?.answers) return false;
  try {
    return qualify(lead.answers).qualified;
  } catch {
    return false;
  }
}

/**
 * Para la pantalla de agenda. En modo seguro, además de calificar, hace falta que
 * Make haya respondido: con enlace, o con error (plan B por WhatsApp). Si Make
 * dijo que no califica, no hay ninguno de los dos y no entra.
 */
export function canOpenSchedule(lead: Lead | null | undefined, mode = vslConfig.bookingMode): lead is Lead {
  if (!canSchedule(lead)) return false;
  if (mode === "directo") return true;
  return Boolean(lead.bookingUrl) || lead.bookingError === true;
}
