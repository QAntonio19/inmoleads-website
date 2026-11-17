// Envío de leads a Make o n8n. Se manda como formulario (x-www-form-urlencoded)
// para que el navegador no haga preflight de CORS; los dos lo leen sin configurar nada.

import { vslConfig } from "../config";
import { labelOf, type OptionKey } from "./qualify";
import { getUtms, normalizePhone, type Lead } from "./session";

export type LeadEvent = "aplicacion" | "agendo";

const KOMMO_STAGE = {
  no_califica: "No califica",
  califica: "Califica",
  prioridad_alta: "Califica",
} as const;

/** Referencia corta, solo letras y números, para encontrar el lead en Kommo. */
export function leadRef(leadId: string): string {
  return `VSL${leadId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 10)}`;
}

export function buildPayload(event: LeadEvent, lead: Lead, extra: Record<string, string> = {}): Record<string, string> {
  const { answers: a, result: r } = lead;
  const label = (k: OptionKey) => labelOf(k, a[k]);

  const tags = [
    r.status === "no_califica" ? "No califica" : "Califica",
    r.status === "prioridad_alta" ? "Prioridad alta" : "",
    r.confirmOwner ? "Confirmar dueño" : "",
    "VSL",
  ].filter(Boolean);

  const name = a.name.trim();
  const whatsapp = normalizePhone(a.whatsapp);
  const utms = getUtms();
  const stage = event === "agendo" ? "Agendó" : KOMMO_STAGE[r.status];
  const ref = leadRef(lead.id);

  const note = [
    `Formulario VSL · ${stage}`,
    `Rol: ${label("role")}`,
    `Casas compradas en 12 meses: ${label("bought")}`,
    `Meta de casas al mes: ${label("goal")}`,
    `Capital: ${label("capital")}`,
    `Cuándo quiere empezar: ${label("timing")}`,
    `Ciudad: ${a.city.trim()}`,
    r.reasons.length ? `No califica por: ${r.reasons.join("; ")}` : "",
    r.confirmOwner ? "Confirmar que sea dueño o socio." : "",
    extra.calendly_event_uri ? `ID de la cita en Calendly (API): ${extra.calendly_event_uri}` : "",
    extra.booking_error ? `Error al pedir agenda: ${extra.booking_error}` : "",
    utms.utm_source || utms.utm_campaign
      ? `Origen: ${[utms.utm_source, utms.utm_medium, utms.utm_campaign, utms.utm_content].filter(Boolean).join(" / ")}`
      : "",
    `Ref: ${ref}`,
  ].filter(Boolean);

  return {
    event,
    lead_id: lead.id,
    lead_ref: ref,
    created_at: lead.createdAt,
    sent_at: new Date().toISOString(),
    name,
    whatsapp,
    // Últimos 10 dígitos: así se busca el contacto en Kommo aunque esté guardado con +52, 521 o espacios.
    whatsapp_10: whatsapp.slice(-10),
    email: a.email.trim().toLowerCase(),
    city: a.city.trim(),
    role: label("role"),
    bought_12m: label("bought"),
    goal_per_month: label("goal"),
    capital: label("capital"),
    timing: label("timing"),
    // Códigos internos, para que Make vuelva a calificar con filtros simples.
    role_code: a.role,
    bought_code: a.bought,
    goal_code: a.goal,
    capital_code: a.capital,
    timing_code: a.timing,
    status: r.status,
    stage,
    tags: tags.join(","),
    disqualify_reasons: r.reasons.join("; "),
    page_url: typeof window !== "undefined" ? window.location.href : "",
    // Listos para pegar en el body JSON de Kommo (ya traen comillas y escapes).
    kommo_lead_name: JSON.stringify(`${name} · ${ref}`),
    kommo_contact_name: JSON.stringify(name),
    kommo_tags: JSON.stringify(tags.map((t) => ({ name: t }))),
    kommo_note: JSON.stringify(note.join("\n")),
    ...utms,
    ...extra,
    // Solo el ID de la cita (lo último de la URI), para consultarla en Make sin fórmulas.
    ...(extra.calendly_event_uri ? { calendly_event_uuid: extra.calendly_event_uri.split("/").pop() ?? "" } : {}),
  };
}

export type BookingAnswer =
  | { kind: "link"; url: string }
  | { kind: "rejected" }
  | { kind: "error"; reason: string };

/** Lee la respuesta de Make. Solo acepta enlaces de calendly.com. */
export function parseBookingResponse(body: unknown): BookingAnswer {
  if (!body || typeof body !== "object") return { kind: "error", reason: "respuesta vacía" };
  const b = body as { qualified?: unknown; booking_url?: unknown };
  const qualified = b.qualified === true || b.qualified === "true";
  if (!qualified) return { kind: "rejected" };
  if (typeof b.booking_url !== "string") return { kind: "error", reason: "sin booking_url" };
  try {
    const u = new URL(b.booking_url);
    if (u.protocol !== "https:" || !/(^|\.)calendly\.com$/.test(u.hostname)) {
      return { kind: "error", reason: "booking_url no es de Calendly" };
    }
    return { kind: "link", url: u.toString() };
  } catch {
    return { kind: "error", reason: "booking_url inválida" };
  }
}

/**
 * Modo seguro: manda la aplicación a Make y espera su respuesta, que trae el
 * enlace de un solo uso si califica. Cuenta como el aviso «aplicacion».
 */
export async function requestBooking(lead: Lead): Promise<BookingAnswer> {
  if (!vslConfig.webhookUrl) return { kind: "error", reason: "sin VITE_VSL_WEBHOOK_URL" };
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), vslConfig.bookingTimeoutMs);
  try {
    const res = await fetch(vslConfig.webhookUrl, {
      method: "POST",
      body: new URLSearchParams(buildPayload("aplicacion", lead, { wants_booking: "1" })),
      signal: ctrl.signal,
    });
    if (!res.ok) return { kind: "error", reason: `HTTP ${res.status}` };
    const text = await res.text();
    try {
      return parseBookingResponse(JSON.parse(text));
    } catch {
      return { kind: "error", reason: `respuesta no es JSON: ${text.slice(0, 60)}` };
    }
  } catch (err) {
    return { kind: "error", reason: ctrl.signal.aborted ? "tiempo agotado" : String(err) };
  } finally {
    clearTimeout(timer);
  }
}

export async function sendLead(event: LeadEvent, lead: Lead, extra?: Record<string, string>): Promise<void> {
  const payload = buildPayload(event, lead, extra);
  if (!vslConfig.webhookUrl) {
    console.info("[vsl:webhook] sin VITE_VSL_WEBHOOK_URL, no se envía:", payload);
    return;
  }
  try {
    await fetch(vslConfig.webhookUrl, {
      method: "POST",
      mode: "no-cors",
      keepalive: true,
      body: new URLSearchParams(payload),
    });
  } catch (err) {
    // No bloqueamos al prospecto si el webhook falla; queda en consola para depurar.
    console.error("[vsl:webhook] error al enviar", err);
  }
}
