import type { ReactNode } from "react";
import { vslConfig } from "../config";

/** Logo sin enlace: la landing no tiene salidas. */
export function Wordmark() {
  return (
    <span className="font-display text-xl font-extrabold tracking-tight text-foreground">
      INMO<span className="text-primary">LEADS</span>
    </span>
  );
}

export function Layout({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Wordmark />
          {aside}
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-6 text-sm text-muted-foreground sm:px-6">
          <span>© {new Date().getFullYear()} InmoLeads</span>
          <a
            href={vslConfig.privacyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline-offset-4 hover:underline"
          >
            Aviso de privacidad
          </a>
        </div>
      </footer>
    </div>
  );
}

export function StepLabel({ children }: { children: ReactNode }) {
  return <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">{children}</p>;
}
