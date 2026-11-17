import { ChevronDown, ShieldCheck } from "lucide-react";
import { vslConfig } from "../config";
import { content } from "../content";
import { isYouTubeShort } from "../lib/youtube";
import { VideoBox } from "./VideoBox";

const isPlaceholder = (text: string) => text.trim().startsWith("[");

export function Testimonials() {
  const t = content.testimonials;
  const withVideo = t.items
    .map((item, i) => ({ ...item, videoSrc: vslConfig.testimonialVideos[i] ?? "" }))
    .filter((item) => item.videoSrc);
  // Sin ningún video configurado se muestran 3 recuadros de ejemplo (demo).
  const items = withVideo.length ? withVideo : t.items.slice(0, 3).map((item) => ({ ...item, videoSrc: "" }));
  const allVertical = withVideo.length > 0 && withVideo.every((item) => isYouTubeShort(item.videoSrc));

  return (
    <section className="flex flex-col gap-6">
      <h2 className="font-display text-2xl font-bold sm:text-3xl">{t.title}</h2>
      {/* Shorts verticales: en celular se deslizan de lado; en computadora, todos en una fila. */}
      <div
        className={
          allVertical
            ? "-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0 lg:grid lg:grid-cols-5 lg:overflow-visible"
            : "grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        }
      >
        {items.map((item, i) => (
          <figure key={i} className={`flex flex-col gap-3 ${allVertical ? "w-[44%] shrink-0 snap-start sm:w-[30%] lg:w-auto" : ""}`}>
            <VideoBox src={item.videoSrc} label={`Testimonio ${i + 1}`} />
            {(!withVideo.length || !isPlaceholder(item.name)) && (
              <figcaption className="flex flex-col">
                <span className="font-semibold">
                  {item.name} · {item.city}
                </span>
                <span className="text-sm text-muted-foreground">{item.result}</span>
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    </section>
  );
}

export function Guarantee() {
  return (
    <section className="flex flex-col items-start gap-4 rounded-xl bg-secondary p-6 text-secondary-foreground sm:flex-row sm:items-center sm:gap-6 sm:p-8">
      <ShieldCheck className="h-12 w-12 shrink-0 text-primary" aria-hidden />
      <div className="flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Garantía</p>
        <h2 className="font-display text-2xl font-bold text-secondary-foreground">{content.guarantee.title}</h2>
        {vslConfig.termsUrl ? (
          <a
            href={vslConfig.termsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[13px] underline underline-offset-4 opacity-70 hover:opacity-100"
          >
            {content.guarantee.terms}
          </a>
        ) : (
          <p className="text-[13px] opacity-70">{content.guarantee.terms}</p>
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
