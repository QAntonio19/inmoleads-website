import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { useId, useRef, useState, type FormEvent } from "react";
import { vslConfig } from "../config";
import { content } from "../content";
import { HONEYPOT_NAME, looksLikeBot } from "../lib/antibot";
import { cleanNational, formatNational, isCompleteNational, PHONE_COUNTRIES } from "../lib/phone";
import { options, type Answers, type OptionKey } from "../lib/qualify";
import { StepLabel } from "./Layout";

/** En el borrador, `whatsapp` guarda solo los 10 dígitos nacionales; la lada va aparte. */
type Draft = { [K in keyof Answers]: string } & { phoneCountry: string };
type Errors = Partial<Record<keyof Answers, string>>;

const EMPTY: Draft = {
  name: "",
  whatsapp: "",
  phoneCountry: PHONE_COUNTRIES[0].code,
  email: "",
  city: "",
  role: "",
  bought: "",
  goal: "",
  capital: "",
  timing: "",
};

const QUESTIONS: { key: OptionKey; label: string; hint?: string; cols: string }[] = [
  { key: "role", label: "¿Cuál es tu rol en el negocio?", cols: "sm:grid-cols-3" },
  { key: "bought", label: "¿Cuántas casas compraste en los últimos 12 meses?", cols: "grid-cols-2 sm:grid-cols-4" },
  { key: "goal", label: "¿Cuántas casas quieres comprar al mes?", hint: "Tu meta para los próximos meses", cols: "grid-cols-3" },
  { key: "capital", label: "¿Tienes capital o financiamiento listo para comprar?", cols: "sm:grid-cols-3" },
  { key: "timing", label: "¿Para cuándo quieres empezar a recibir citas con propietarios?", cols: "sm:grid-cols-2 lg:grid-cols-3" },
];

function validate(d: Draft): Errors {
  const e: Errors = {};
  if (d.name.trim().length < 2) e.name = "Escribe tu nombre.";
  if (d.whatsapp.length === 0) e.whatsapp = "Escribe tu WhatsApp.";
  else if (!isCompleteNational(d.whatsapp)) {
    const left = 10 - d.whatsapp.length;
    e.whatsapp = `Te ${left === 1 ? "falta 1 dígito" : `faltan ${left} dígitos`}: son 10, sin la lada.`;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email.trim())) e.email = "Revisa tu correo, parece incompleto.";
  if (d.city.trim().length < 2) e.city = "Escribe la ciudad o zona donde compras.";
  for (const q of QUESTIONS) if (!d[q.key]) e[q.key] = "Elige una opción.";
  return e;
}

export function ApplicationForm({
  onSubmit,
  busy = false,
}: {
  /** `bot`: el envío parece de un bot (campo trampa lleno o demasiado rápido). */
  onSubmit: (answers: Answers, meta: { bot: boolean }) => void;
  busy?: boolean;
}) {
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const formRef = useRef<HTMLFormElement>(null);
  const shownAt = useRef(Date.now());
  const uid = useId();

  const set = (k: keyof Answers, v: string) => {
    setDraft((d) => ({ ...d, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    if (busy) return;
    const e = validate(draft);
    setErrors(e);
    const first = Object.keys(e)[0];
    if (first) {
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    const honeypot = new FormData(formRef.current ?? undefined).get(HONEYPOT_NAME);
    const bot = looksLikeBot({ honeypot: String(honeypot ?? ""), elapsedMs: Date.now() - shownAt.current });
    const { phoneCountry, ...rest } = draft;
    onSubmit({ ...rest, whatsapp: `${phoneCountry}${draft.whatsapp}` } as Answers, { bot });
  };

  const phoneField = (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={`${uid}-whatsapp`} className="text-sm font-semibold">
        WhatsApp
      </label>
      <div
        className={`flex h-12 overflow-hidden rounded-lg border bg-background transition focus-within:border-primary focus-within:ring-4 focus-within:ring-ring/20 ${
          errors.whatsapp ? "border-destructive" : "border-input"
        }`}
      >
        <select
          id={`${uid}-phoneCountry`}
          aria-label="Lada del país"
          value={draft.phoneCountry}
          onChange={(e) => {
            const code = e.target.value;
            setDraft((d) => ({ ...d, phoneCountry: code, whatsapp: cleanNational(d.whatsapp, code) }));
          }}
          className="border-r border-input bg-muted/60 pl-3 pr-1 text-base font-semibold outline-none"
        >
          {PHONE_COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.short} +{c.code}
            </option>
          ))}
        </select>
        <input
          id={`${uid}-whatsapp`}
          name="whatsapp"
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder="644 123 4567"
          value={formatNational(draft.whatsapp)}
          onChange={(e) => set("whatsapp", cleanNational(e.target.value, draft.phoneCountry))}
          aria-invalid={Boolean(errors.whatsapp)}
          aria-describedby={errors.whatsapp ? `${uid}-whatsapp-err` : `${uid}-whatsapp-hint`}
          className="min-w-0 flex-1 bg-transparent px-3 text-base tabular-nums tracking-wide outline-none"
        />
      </div>
      {errors.whatsapp ? (
        <p id={`${uid}-whatsapp-err`} className="text-sm text-destructive">
          {errors.whatsapp}
        </p>
      ) : (
        <p id={`${uid}-whatsapp-hint`} className="text-sm text-muted-foreground">
          10 dígitos, sin la lada.
        </p>
      )}
    </div>
  );

  const text = (k: "name" | "email" | "city", label: string, type: string, extra: object = {}) => (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={`${uid}-${k}`} className="text-sm font-semibold">
        {label}
      </label>
      <input
        id={`${uid}-${k}`}
        name={k}
        type={type}
        value={draft[k]}
        onChange={(e) => set(k, e.target.value)}
        aria-invalid={Boolean(errors[k])}
        aria-describedby={errors[k] ? `${uid}-${k}-err` : undefined}
        className={`h-12 rounded-lg border bg-background px-4 text-base outline-none transition focus:border-primary focus:ring-4 focus:ring-ring/20 ${
          errors[k] ? "border-destructive" : "border-input"
        }`}
        {...extra}
      />
      {errors[k] && (
        <p id={`${uid}-${k}-err`} className="text-sm text-destructive">
          {errors[k]}
        </p>
      )}
    </div>
  );

  return (
    <form ref={formRef} onSubmit={submit} noValidate className="flex flex-col gap-8 rounded-xl border border-border bg-card p-5 sm:p-8">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <StepLabel>{content.form.step}</StepLabel>
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
            <CheckCircle2 className="h-4 w-4" aria-hidden />
            {content.unlocked.badge}
          </span>
        </div>
        <h2 className="font-display text-2xl font-bold sm:text-3xl">{content.form.title}</h2>
        <p className="text-muted-foreground">{content.form.intro}</p>
        <p className="text-sm text-muted-foreground">{content.form.keepWatching}</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {text("name", "Nombre", "text", { autoComplete: "name" })}
        {phoneField}
        {text("email", "Correo", "email", { autoComplete: "email", inputMode: "email" })}
        {text("city", "Ciudad o zona donde compras", "text", { autoComplete: "address-level2" })}
      </div>

      {/* Campo trampa: fuera de la vista, del teclado y de los lectores de pantalla. Solo un bot lo llena. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={`${uid}-hp`}>No llenes este campo</label>
        <input id={`${uid}-hp`} name={HONEYPOT_NAME} type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      {QUESTIONS.map((q) => (
        <fieldset key={q.key} className="flex flex-col gap-3" aria-invalid={Boolean(errors[q.key])}>
          <legend className="mb-3 font-semibold">
            {q.label}
            {q.hint && <span className="block text-sm font-normal text-muted-foreground">{q.hint}</span>}
          </legend>
          <div className={`grid gap-2 ${q.cols}`}>
            {options[q.key].map((o) => {
              const id = `${uid}-${q.key}-${o.value}`;
              return (
                <div key={o.value}>
                  <input
                    id={id}
                    type="radio"
                    name={q.key}
                    value={o.value}
                    checked={draft[q.key] === o.value}
                    onChange={() => set(q.key, o.value)}
                    className="peer sr-only"
                  />
                  <label
                    htmlFor={id}
                    className="flex h-full min-h-12 cursor-pointer items-center justify-center rounded-lg border border-input px-3 py-2.5 text-center text-sm font-medium transition hover:border-primary/60 peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-foreground peer-focus-visible:ring-4 peer-focus-visible:ring-ring/30"
                  >
                    {o.label}
                  </label>
                </div>
              );
            })}
          </div>
          {errors[q.key] && <p className="text-sm text-destructive">{errors[q.key]}</p>}
        </fieldset>
      ))}

      <button
        type="submit"
        disabled={busy}
        aria-busy={busy}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-7 py-4 text-lg font-semibold text-primary-foreground transition enabled:hover:brightness-110 focus:outline-none focus-visible:ring-4 focus-visible:ring-ring/40 disabled:cursor-wait disabled:opacity-80"
      >
        {busy ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            Buscando horarios…
          </>
        ) : (
          <>
            {content.form.submit}
            <ArrowRight className="h-5 w-5" aria-hidden />
          </>
        )}
      </button>
      <p className="-mt-4 text-center text-sm text-muted-foreground">
        {content.form.privacy}{" "}
        <a
          href={vslConfig.privacyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4 hover:text-foreground"
        >
          {content.form.privacyLink}
        </a>
        .
      </p>
    </form>
  );
}
