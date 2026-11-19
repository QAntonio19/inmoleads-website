import { Flame } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { paths, vslConfig } from "../config";
import { content } from "../content";
import { ApplicationForm } from "../components/ApplicationForm";
import { BookingGate } from "../components/BookingGate";
import { DebugBar } from "../components/DebugBar";
import { Layout } from "../components/Layout";
import { ProgressPanel } from "../components/ProgressPanel";
import { Benefits, Faq, FinalCta, Guarantee, HowItWorks, Stats, Testimonials } from "../components/Sections";
import { VslPlayer } from "../components/VslPlayer";
import { useWatchProgress } from "../hooks/useWatchProgress";
import { qualify, type Answers } from "../lib/qualify";
import { captureUtms, leadStore, newId, type Lead } from "../lib/session";
import { track } from "../lib/tracking";
import { requestBooking, sendLead } from "../lib/webhook";

export default function LandingPage() {
  const progress = useWatchProgress();
  const navigate = useNavigate();
  const { search } = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const formAnchor = useRef<HTMLDivElement>(null);
  const videoAnchor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    captureUtms(search);
    track("ViewContent", { content_name: "VSL InmoLeads" });
    if (vslConfig.debug) {
      const q = new URLSearchParams(search);
      if (q.get("reset") === "1") {
        progress.resetProgress();
        leadStore.clear();
      }
      if (q.get("unlock") === "1") progress.forceUnlock();
    }
    // Solo al montar la página.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openForm = () => {
    if (!showForm) track("VSL_FormOpen");
    setShowForm(true);
    requestAnimationFrame(() => formAnchor.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  /** Botón del final: con la agenda abierta lleva al formulario; si no, de vuelta al video. */
  const finalCta = () => {
    track("VSL_FinalCTA", { unlocked: progress.unlocked });
    if (progress.unlocked) openForm();
    else videoAnchor.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const submit = async (answers: Answers, { bot }: { bot: boolean }) => {
    // Bot: se le muestra la salida normal de «no calificas», sin avisar a Make ni a Meta.
    if (bot) {
      navigate(paths.notYet);
      return;
    }
    const result = qualify(answers);
    const lead: Lead = { id: newId(), answers, result, createdAt: new Date().toISOString() };
    track("VSL_Application", { status: result.status });

    if (!result.qualified) {
      leadStore.set(lead);
      void sendLead("aplicacion", lead);
      navigate(paths.notYet);
      return;
    }

    if (vslConfig.bookingMode === "seguro") {
      // Make vuelve a calificar y, si todo bien, responde con un enlace de un solo uso.
      setBusy(true);
      const answer = await requestBooking(lead);
      setBusy(false);
      if (answer.kind === "rejected") {
        leadStore.set({ ...lead, result: { ...result, qualified: false, status: "no_califica" } });
        navigate(paths.notYet);
        return;
      }
      if (answer.kind === "link") lead.bookingUrl = answer.url;
      else {
        console.error("[vsl] Make no entregó la agenda:", answer.reason);
        lead.bookingError = true;
        // Segundo intento sin esperar respuesta, para que el lead no se pierda.
        // Make puede deduplicar por lead_id.
        void sendLead("aplicacion", lead, { booking_error: answer.reason });
      }
    } else {
      void sendLead("aplicacion", lead);
    }

    leadStore.set(lead);
    // «Lead» solo para calificados: es la señal con la que conviene optimizar anuncios.
    track("Lead", { status: result.status }, lead.id);
    navigate(paths.schedule);
  };

  return (
    <Layout
      aside={
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary sm:text-sm">
          <Flame className="h-4 w-4" aria-hidden />
          {content.scarcity}
        </span>
      }
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-16 px-4 pb-20 pt-10 sm:px-6 sm:pt-14">
        <section className="mx-auto flex w-full max-w-4xl flex-col gap-8">
          <div className="flex flex-col gap-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground sm:text-sm">
              {content.eyebrow}
            </p>
            <h1 className="mx-auto max-w-3xl text-balance font-display text-3xl font-extrabold leading-tight sm:text-5xl">
              {content.headline}
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">{content.subhead}</p>
            <Benefits />
          </div>

          <div ref={videoAnchor} className="scroll-mt-6">
            <VslPlayer handlers={progress.handlers} />
          </div>
          <ProgressPanel progress={progress} />
          <Stats />
          <BookingGate unlocked={progress.unlocked} remainingToUnlock={progress.remainingToUnlock} onStart={openForm} />
        </section>

        <HowItWorks />
        <Testimonials />
        <Guarantee />

        {/* El formulario se abre aquí, debajo de la garantía, al tocar «Agendar» arriba o al final. */}
        <div ref={formAnchor} className="mx-auto w-full max-w-3xl scroll-mt-6 empty:hidden">
          {showForm && <ApplicationForm onSubmit={(a, meta) => void submit(a, meta)} busy={busy} />}
        </div>
        <Faq />
        <FinalCta unlocked={progress.unlocked} remainingToUnlock={progress.remainingToUnlock} onClick={finalCta} />
      </div>

      <DebugBar
        onUnlock={progress.forceUnlock}
        onReset={() => {
          progress.resetProgress();
          leadStore.clear();
          setShowForm(false);
        }}
      />
    </Layout>
  );
}
