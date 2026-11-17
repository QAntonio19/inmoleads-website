// Reglas de calificación (BANT) tal como vienen en el wireframe.

export type Role = "dueno" | "socio" | "otro";
export type Bought = "0" | "1-4" | "5-20" | "20+";
export type Goal = "1-3" | "4-15" | "15+";
export type Capital = "si" | "1-3m" | "no";
export type Timing = "2w" | "month" | "next-month" | "2-3m" | "3m+";

export interface Answers {
  name: string;
  whatsapp: string;
  email: string;
  city: string;
  role: Role;
  bought: Bought;
  goal: Goal;
  capital: Capital;
  timing: Timing;
}

export type Status = "no_califica" | "califica" | "prioridad_alta";

export interface Qualification {
  qualified: boolean;
  status: Status;
  /** Rol «Otro»: agenda, pero el SDR confirma que entre el dueño o socio. */
  confirmOwner: boolean;
  /** Motivos de descalificación, para Kommo. */
  reasons: string[];
}

export function qualify(a: Pick<Answers, "role" | "bought" | "capital" | "timing">): Qualification {
  const reasons: string[] = [];
  if (a.bought === "0") reasons.push("0 casas en 12 meses");
  if (a.capital === "no") reasons.push("Sin capital ni financiamiento");
  if (a.timing === "3m+") reasons.push("Quiere empezar en más de 3 meses");

  if (reasons.length > 0) {
    return { qualified: false, status: "no_califica", confirmOwner: false, reasons };
  }

  const isOwner = a.role === "dueno" || a.role === "socio";
  const fivePlus = a.bought === "5-20" || a.bought === "20+";
  const startsSoon = a.timing === "2w" || a.timing === "month";

  return {
    qualified: true,
    status: isOwner && fivePlus && startsSoon ? "prioridad_alta" : "califica",
    confirmOwner: a.role === "otro",
    reasons,
  };
}

export const options = {
  role: [
    { value: "dueno", label: "Dueño" },
    { value: "socio", label: "Socio" },
    { value: "otro", label: "Otro (empleado, asesor, familiar)" },
  ],
  bought: [
    { value: "0", label: "0" },
    { value: "1-4", label: "1–4" },
    { value: "5-20", label: "5–20" },
    { value: "20+", label: "Más de 20" },
  ],
  goal: [
    { value: "1-3", label: "1–3" },
    { value: "4-15", label: "4–15" },
    { value: "15+", label: "Más de 15" },
  ],
  capital: [
    { value: "si", label: "Sí, ya lo tengo" },
    { value: "1-3m", label: "En 1–3 meses" },
    { value: "no", label: "Todavía no" },
  ],
  timing: [
    { value: "2w", label: "En las próximas 2 semanas" },
    { value: "month", label: "Este mes" },
    { value: "next-month", label: "El próximo mes" },
    { value: "2-3m", label: "En 2–3 meses" },
    { value: "3m+", label: "En más de 3 meses" },
  ],
} as const;

export type OptionKey = keyof typeof options;

/** Etiqueta legible de una respuesta, para mandarla al CRM. */
export function labelOf(key: OptionKey, value: string): string {
  const list = options[key] as readonly { value: string; label: string }[];
  return list.find((o) => o.value === value)?.label ?? value;
}
