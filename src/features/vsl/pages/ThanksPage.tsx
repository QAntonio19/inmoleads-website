import { CheckCircle2, MessageCircle } from "lucide-react";
import { Navigate } from "react-router-dom";
import { paths, vslConfig } from "../config";
import { content } from "../content";
import { Layout } from "../components/Layout";
import { VideoBox } from "../components/VideoBox";
import { canOpenSchedule } from "../lib/guards";
import { leadStore } from "../lib/session";
import { track } from "../lib/tracking";

export default function ThanksPage() {
  const lead = leadStore.get();
  if (!canOpenSchedule(lead)) return <Navigate to={paths.landing} replace />;

  const firstName = lead.answers.name.trim().split(/\s+/)[0] ?? "";
  const waUrl = `https://wa.me/${vslConfig.whatsapp.number}?text=${encodeURIComponent(
    vslConfig.whatsapp.message(lead.answers.name.trim()),
  )}`;

  return (
    <Layout>
      <div className="mx-auto flex max-w-2xl flex-col gap-8 px-4 pb-20 pt-10 sm:px-6 sm:pt-14">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
            <CheckCircle2 className="h-8 w-8" aria-hidden />
          </span>
          <h1 className="text-balance font-display text-3xl font-extrabold leading-tight sm:text-4xl">
            {firstName ? `${firstName}, ${content.thanks.title.toLowerCase()}` : content.thanks.title}
          </h1>
          <p className="text-lg text-muted-foreground">{content.thanks.body}</p>
        </div>

        <VideoBox src={vslConfig.thanksVideoSrc} label={content.thanks.videoLabel} />

        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6">
          <p className="font-semibold">{content.thanks.checklistTitle}</p>
          <ul className="flex flex-col gap-2">
            {content.thanks.checklist.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("Contact", { channel: "whatsapp" })}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#25D366] px-7 py-4 text-lg font-semibold text-[#0b3d1f] transition hover:brightness-105 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/40"
        >
          <MessageCircle className="h-5 w-5" aria-hidden />
          {content.thanks.cta}
        </a>
      </div>
    </Layout>
  );
}
