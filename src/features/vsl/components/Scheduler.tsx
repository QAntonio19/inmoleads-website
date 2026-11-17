import { CalendarCheck, MessageCircle } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { vslConfig } from "../config";
import { getUtms, normalizePhone, type Lead } from "../lib/session";
import { leadRef } from "../lib/webhook";

export interface ScheduledInfo {
  eventUri: string;
  inviteeUri: string;
  demo: boolean;
}

interface CalendlyApi {
  initInlineWidget(opts: {
    url: string;
    parentElement: HTMLElement;
    prefill?: { name?: string; email?: string; customAnswers?: Record<string, string> };
    utm?: Record<string, string | undefined>;
  }): void;
}

declare global {
  interface Window {
    Calendly?: CalendlyApi;
  }
}

const WIDGET_SRC = "https://assets.calendly.com/assets/external/widget.js";

function loadCalendly(): Promise<CalendlyApi> {
  if (window.Calendly) return Promise.resolve(window.Calendly);
  return new Promise((resolve, reject) => {
    let s = document.querySelector<HTMLScriptElement>(`script[src="${WIDGET_SRC}"]`);
    if (!s) {
      s = document.createElement("script");
      s.src = WIDGET_SRC;
      s.async = true;
      document.head.appendChild(s);
    }
    s.addEventListener("load", () => (window.Calendly ? resolve(window.Calendly) : reject(new Error("Calendly no cargó"))));
    s.addEventListener("error", () => reject(new Error("No se pudo cargar Calendly")));
  });
}

/**
 * Calendly incrustado con los datos del formulario.
 * - Modo seguro: usa el enlace de un solo uso que mandó Make; si Make falló, ofrece WhatsApp.
 * - Modo directo: usa VITE_VSL_CALENDLY_URL, o el selector de demo si no hay URL.
 */
export function Scheduler({ lead, onScheduled }: { lead: Lead; onScheduled: (info: ScheduledInfo) => void }) {
  if (vslConfig.bookingMode === "seguro") {
    if (lead.bookingUrl) return <CalendlyInline url={lead.bookingUrl} lead={lead} onScheduled={onScheduled} />;
    return <BookingFallback lead={lead} />;
  }
  return vslConfig.calendlyUrl ? (
    <CalendlyInline url={vslConfig.calendlyUrl} lead={lead} onScheduled={onScheduled} />
  ) : (
    <DemoScheduler onScheduled={onScheduled} />
  );
}

/** Plan B si Make no respondió: el lead califica, así que lo agendamos por WhatsApp. */
function BookingFallback({ lead }: { lead: Lead }) {
  const name = lead.answers.name.trim();
  const text = `Hola, soy ${name}. Vi el video y apliqué en la página; quiero agendar mi sesión con InmoLeads.`;
  const href = `https://wa.me/${vslConfig.whatsapp.number}?text=${encodeURIComponent(text)}`;
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-6 text-center sm:p-8">
      <p className="font-display text-xl font-bold">No pudimos cargar los horarios en este momento</p>
      <p className="max-w-md text-muted-foreground">
        Tu aplicación sí califica. Escríbenos por WhatsApp y te agendamos la sesión directamente.
      </p>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#25D366] px-7 py-4 text-lg font-semibold text-[#0b3d1f] transition hover:brightness-105"
      >
        <MessageCircle className="h-5 w-5" aria-hidden />
        Agendar por WhatsApp
      </a>
    </div>
  );
}

function CalendlyInline({ url, lead, onScheduled }: { url: string; lead: Lead; onScheduled: (i: ScheduledInfo) => void }) {
  const host = useRef<HTMLDivElement>(null);
  const done = useRef(onScheduled);
  done.current = onScheduled;
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const utms = getUtms();
    const full = new URL(url);
    full.searchParams.set("hide_gdpr_banner", "1");
    // Calendly guarda este valor en la cita (tracking.salesforce_uuid). Así, cuando alguien
    // cancela o reagenda, Make encuentra el lead de Kommo por su referencia.
    full.searchParams.set("salesforce_uuid", leadRef(lead.id));
    // Prellenado también en la URL. El widget actual de Calendly manda `prefill` por postMessage
    // solo durante 250 ms tras cargar el iframe; si Calendly tarda más, el formulario queda vacío.
    // Los parámetros en la URL no dependen de tiempos. a1 = WhatsApp, a2 = Ciudad.
    full.searchParams.set("name", lead.answers.name.trim());
    full.searchParams.set("email", lead.answers.email.trim());
    full.searchParams.set("a1", `+${normalizePhone(lead.answers.whatsapp)}`);
    full.searchParams.set("a2", lead.answers.city.trim());

    loadCalendly()
      .then((Calendly) => {
        if (cancelled || !host.current) return;
        host.current.innerHTML = "";
        Calendly.initInlineWidget({
          url: full.toString(),
          parentElement: host.current,
          prefill: {
            name: lead.answers.name.trim(),
            email: lead.answers.email.trim(),
            // a1 = primera pregunta del evento en Calendly (WhatsApp), a2 = segunda (Ciudad).
            customAnswers: { a1: `+${normalizePhone(lead.answers.whatsapp)}`, a2: lead.answers.city.trim() },
          },
          utm: {
            utmSource: utms.utm_source,
            utmMedium: utms.utm_medium,
            utmCampaign: utms.utm_campaign,
            utmContent: utms.utm_content,
            utmTerm: utms.utm_term,
          },
        });
      })
      .catch((e: Error) => !cancelled && setError(e.message));

    const onMessage = (e: MessageEvent) => {
      if (e.origin !== "https://calendly.com") return;
      const data = e.data as { event?: string; payload?: { event?: { uri?: string }; invitee?: { uri?: string } } };
      if (data?.event === "calendly.event_scheduled") {
        done.current({
          eventUri: data.payload?.event?.uri ?? "",
          inviteeUri: data.payload?.invitee?.uri ?? "",
          demo: false,
        });
      }
    };
    window.addEventListener("message", onMessage);
    return () => {
      cancelled = true;
      window.removeEventListener("message", onMessage);
    };
  }, [url, lead]);

  if (error) {
    return (
      <p className="rounded-xl border border-destructive/40 bg-destructive/5 p-6 text-center">
        No pudimos cargar el calendario. Recarga la página; si sigue igual, escríbenos por WhatsApp y te agendamos.
      </p>
    );
  }
  return <div ref={host} className="h-[720px] min-w-[320px] overflow-hidden rounded-xl border border-border" />;
}

/** Selector de ejemplo para la demo, mientras no hay cuenta de Calendly conectada. */
function DemoScheduler({ onScheduled }: { onScheduled: (i: ScheduledInfo) => void }) {
  const days = useMemo(() => nextWeekdays(5), []);
  const times = ["10:00 am", "12:30 pm", "4:00 pm"];
  const [day, setDay] = useState(0);
  const [time, setTime] = useState<string | null>(null);
  const fmt = new Intl.DateTimeFormat("es-MX", { weekday: "short", day: "numeric", month: "short" });

  return (
    <div className="flex flex-col gap-6 rounded-xl border border-border bg-card p-5 sm:p-8">
      <p className="rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">
        Modo demo: así se verá el paso. Con <code className="font-semibold">VITE_VSL_CALENDLY_URL</code> configurada, aquí
        aparece el calendario real de Calendly.
      </p>
      <div className="flex flex-col gap-1">
        <p className="font-display text-lg font-bold">Sesión InmoLeads</p>
        <p className="text-sm text-muted-foreground">45 min · Google Meet</p>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {days.map((d, i) => (
          <button
            key={d.toISOString()}
            type="button"
            onClick={() => {
              setDay(i);
              setTime(null);
            }}
            aria-pressed={day === i}
            className={`rounded-lg border px-2 py-3 text-sm font-medium capitalize transition ${
              day === i ? "border-primary bg-primary/10" : "border-input hover:border-primary/60"
            }`}
          >
            {fmt.format(d)}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {times.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTime(t)}
            aria-pressed={time === t}
            className={`rounded-lg border px-2 py-3 text-sm font-semibold transition ${
              time === t ? "border-primary bg-primary text-primary-foreground" : "border-input hover:border-primary/60"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      <button
        type="button"
        disabled={!time}
        onClick={() => onScheduled({ eventUri: "", inviteeUri: "", demo: true })}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3.5 font-semibold text-primary-foreground transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <CalendarCheck className="h-5 w-5" aria-hidden />
        Confirmar sesión
      </button>
    </div>
  );
}

function nextWeekdays(n: number): Date[] {
  const out: Date[] = [];
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  while (out.length < n) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) out.push(new Date(d));
  }
  return out;
}
