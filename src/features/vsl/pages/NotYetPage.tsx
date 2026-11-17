import { Instagram } from "lucide-react";
import { vslConfig } from "../config";
import { content } from "../content";
import { Layout } from "../components/Layout";
import { VideoBox } from "../components/VideoBox";
import { track } from "../lib/tracking";

export default function NotYetPage() {
  return (
    <Layout>
      <div className="mx-auto flex max-w-2xl flex-col gap-8 px-4 pb-20 pt-10 text-center sm:px-6 sm:pt-14">
        <div className="flex flex-col gap-3">
          <h1 className="text-balance font-display text-3xl font-extrabold leading-tight sm:text-4xl">
            {content.notYet.title}
          </h1>
          <p className="text-lg text-muted-foreground">{content.notYet.body}</p>
        </div>

        <VideoBox src={vslConfig.notYetVideoSrc} label={content.notYet.videoLabel} />

        <a
          href={vslConfig.instagram.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("VSL_InstagramFollow")}
          className="mx-auto inline-flex items-center justify-center gap-2 rounded-lg bg-secondary px-7 py-4 text-lg font-semibold text-secondary-foreground transition hover:brightness-125 focus:outline-none focus-visible:ring-4 focus-visible:ring-ring/40"
        >
          <Instagram className="h-5 w-5" aria-hidden />
          Seguir a @{vslConfig.instagram.handle}
        </a>
      </div>
    </Layout>
  );
}
