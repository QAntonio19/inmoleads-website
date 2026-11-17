import type { ReactNode } from "react";
import { vslConfig } from "../config";
// Copia de src/assets/Logotipo.png del sitio, dentro del módulo para que funcione en ambos repos.
import logo from "../assets/logo.png";

/** Logo sin enlace: la landing no tiene salidas. */
export function Wordmark() {
  return <img src={logo} alt="InmoLeads by Expertiz Digital" width={600} height={212} className="h-9 w-auto sm:h-10" />;
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
