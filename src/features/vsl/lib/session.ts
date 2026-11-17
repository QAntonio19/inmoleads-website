// Estado que viaja entre las pantallas del embudo: UTMs, avance del video y el
// lead. Todo en el navegador; si el almacenamiento está bloqueado, se sigue sin él.

import type { Answers, Qualification } from "./qualify";

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid"] as const;
export type Utms = Partial<Record<(typeof UTM_KEYS)[number], string>>;

export interface Lead {
  id: string;
  answers: Answers;
  result: Qualification;
  createdAt: string;
  /** Modo seguro: enlace de Calendly de un solo uso que mandó Make. */
  bookingUrl?: string;
  /** Modo seguro: Make no respondió a tiempo; se ofrece agendar por WhatsApp. */
  bookingError?: boolean;
}

function read(store: "local" | "session", key: string): string | null {
  try {
    return (store === "local" ? localStorage : sessionStorage).getItem(key);
  } catch {
    return null;
  }
}

function write(store: "local" | "session", key: string, value: string | null): void {
  try {
    const s = store === "local" ? localStorage : sessionStorage;
    if (value === null) s.removeItem(key);
    else s.setItem(key, value);
  } catch {
    /* almacenamiento no disponible */
  }
}

/** Guarda los UTMs de la URL de llegada (solo si trae alguno). */
export function captureUtms(search: string): void {
  const params = new URLSearchParams(search);
  const found: Utms = {};
  for (const k of UTM_KEYS) {
    const v = params.get(k);
    if (v) found[k] = v;
  }
  if (Object.keys(found).length > 0) write("session", "vsl_utms", JSON.stringify(found));
}

export function getUtms(): Utms {
  try {
    return JSON.parse(read("session", "vsl_utms") || "{}") as Utms;
  } catch {
    return {};
  }
}

export const progressStore = {
  load: (key: string) => read("local", `vsl_progress_${key}`),
  save: (key: string, bits: string) => write("local", `vsl_progress_${key}`, bits),
  isUnlocked: (key: string) => read("local", `vsl_unlocked_${key}`) === "1",
  setUnlocked: (key: string) => write("local", `vsl_unlocked_${key}`, "1"),
  clear: (key: string) => {
    write("local", `vsl_progress_${key}`, null);
    write("local", `vsl_unlocked_${key}`, null);
  },
};

export const leadStore = {
  get(): Lead | null {
    try {
      const raw = read("session", "vsl_lead");
      return raw ? (JSON.parse(raw) as Lead) : null;
    } catch {
      return null;
    }
  },
  set(lead: Lead): void {
    write("session", "vsl_lead", JSON.stringify(lead));
  },
  clear(): void {
    write("session", "vsl_lead", null);
  },
};

export function newId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
}

/** Solo dígitos. Si son 10 dígitos (México), antepone 52. */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  return digits.length === 10 ? `52${digits}` : digits;
}
