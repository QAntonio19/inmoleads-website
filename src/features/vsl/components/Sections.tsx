import { ArrowRight, Check, ChevronDown, Mic, ShieldCheck } from "lucide-react";
import { vslConfig } from "../config";
import { content } from "../content";
import { isYouTubeShort } from "../lib/youtube";
import { LockedButton } from "./BookingGate";
import { VideoBox } from "./VideoBox";

/** Chips de tiempo y esfuerzo, arriba del video. */
export function Benefits() {
  return (
    <ul className="flex flex-col items-center gap-2 sm:flex-row sm:flex-wrap sm:justify-center">
      {content.benefits.map((b) => (
        <li
          key={b}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/60 px-3 py-1.5 text-sm font-semibold"
        >
          <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden />
          {b}
        </li>
      ))}
    </ul>
  );
}

/** Cifras de la empresa, debajo del avance del video. */
export function Stats() {
  return (
    <ul className="grid grid-cols-3 gap-2 sm:gap-4">
      {content.stats.map((s) => (
        <li key={s.value} className="flex flex-col items-center rounded-xl border border-border px-2 py-3 text-center sm:py-4">
          <span className="font-display text-lg font-extrabold leading-tight sm:text-2xl">{s.value}</span>
          <span className="text-xs text-muted-foreground sm:text-sm">{s.label}</span>
        </li>
      ))}
    </ul>
  );
}

export function HowItWorks() {
  const h = content.howItWorks;
  return (
    <section className="flex flex-col gap-6">
      <h2 className="font-display text-2xl font-bold sm:text-3xl">{h.title}</h2>
      <ol className="grid gap-4 md:grid-cols-3">
        {h.steps.map((step, i) => (
          <li key={step.title} className="flex flex-col gap-2 rounded-xl bg-muted/60 p-5 sm:p-6">
            <span className="font-display text-3xl font-extrabold text-primary/60" aria-hidden>
              {i + 1}
            </span>
            <h3 className="font-semibold">{step.title}</h3>
            <p className="text-sm text-muted-foreground">{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function Testimonials() {
  const t = content.testimonials;
  const all = t.items.map((item, i) => ({ ...item, videoSrc: vslConfig.testimonialVideos[i] ?? "" }));
  const withVideo = all.filter((item) => item.videoSrc);
  // Sin ningún video configurado (demo) o con debug se muestran también los que faltan, como recuadro pendiente.
  const items = vslConfig.debug || !withVideo.length ? all : withVideo;
  const vertical = withVideo.length > 0 && withVideo.every((item) => isYouTubeShort(item.videoSrc));

  return (
    <section className="flex flex-col gap-6">
      <h2 className="font-display text-2xl font-bold sm:text-3xl">{t.title}</h2>
      {/* Shorts verticales: en celular se deslizan de lado; en computadora, todos en una fila. */}
      <div
        className={
          vertical
            ? "-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0 lg:grid lg:grid-cols-5 lg:overflow-visible"
            : "grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        }
      >
        {items.map((item, i) => {
          const who = [item.name, item.city].filter(Boolean).join(" · ");
          return (
            <figure
              key={i}
              className={`flex flex-col gap-3 ${vertical ? "w-[44%] shrink-0 snap-start sm:w-[30%] lg:w-auto" : ""}`}
            >
              {item.videoSrc || !withVideo.length ? (
                <VideoBox src={item.videoSrc} label={`Testimonio de ${item.name}`} />
              ) : (
                <PendingMedia vertical={vertical} />
              )}
              <figcaption className="flex flex-col">
                {item.result && <span className="font-display font-bold leading-snug">{item.result}</span>}
                <span className="text-sm text-muted-foreground">{who}</span>
              </figcaption>
            </figure>
          );
        })}
      </div>
    </section>
  );
}

/** Solo con debug: testimonio que existe en audio y aún no tiene foto o video. */
function PendingMedia({ vertical }: { vertical: boolean }) {
  return (
    <div
      className={`flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/50 px-4 text-center text-sm text-muted-foreground ${
        vertical ? "aspect-[9/16]" : "aspect-video"
      }`}
    >
      <Mic className="h-5 w-5" aria-hidden />
      Audio · falta foto o video
    </div>
  );
}

export function Guarantee() {
  const g = content.guarantee;
  return (
    <section className="flex flex-col items-start gap-4 rounded-xl bg-secondary p-6 text-secondary-foreground sm:flex-row sm:items-center sm:gap-6 sm:p-8 xl:-mx-8 xl:p-10">
      <ShieldCheck className="h-12 w-12 shrink-0 text-primary" aria-hidden />
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Garantía</p>
        <h2 className="text-balance font-display text-2xl font-bold text-secondary-foreground sm:text-3xl">{g.title}</h2>
        <p className="text-sm opacity-80">{g.condition}</p>
        {vslConfig.termsUrl && (
          <a
            href={vslConfig.termsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[13px] underline underline-offset-4 opacity-70 hover:opacity-100"
          >
            {g.terms}
          </a>
        )}
      </div>
    </section>
  );
}

export function Faq() {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-display text-2xl font-bold sm:text-3xl">Preguntas frecuentes</h2>
      <div className="divide-y divide-border border-y border-border">
        {content.faq.map((f) => (
          <details key={f.q} className="group py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
              {f.q}
              <ChevronDown className="h-5 w-5 shrink-0 transition group-open:rotate-180" aria-hidden />
            </summary>
            <p className="pt-2 text-muted-foreground">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

/** Repetición del botón al final, con el mismo candado del video. */
export function FinalCta({
  unlocked,
  remainingToUnlock,
  onClick,
}: {
  unlocked: boolean;
  remainingToUnlock: number | null;
  onClick: () => void;
}) {
  const f = content.finalCta;
  return (
    <section className="flex flex-col items-center gap-4 rounded-xl bg-muted/60 px-6 py-10 text-center xl:-mx-8">
      <h2 className="text-balance font-display text-2xl font-bold sm:text-3xl">{f.title}</h2>
      {unlocked ? (
        <button
          type="button"
          onClick={onClick}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-7 py-3.5 text-lg font-semibold text-primary-foreground transition hover:brightness-110 focus:outline-none focus-visible:ring-4 focus-visible:ring-ring/40"
        >
          {f.cta}
          <ArrowRight className="h-5 w-5" aria-hidden />
        </button>
      ) : (
        <>
          <LockedButton label={f.cta} remainingToUnlock={remainingToUnlock} onClick={onClick} />
          <p className="text-sm text-muted-foreground">{f.lockedNote}</p>
        </>
      )}
    </section>
  );
}
