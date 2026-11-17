import { useCallback, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { paths } from "../config";
import { content } from "../content";
import { Layout, StepLabel } from "../components/Layout";
import { Scheduler, type ScheduledInfo } from "../components/Scheduler";
import { canOpenSchedule } from "../lib/guards";
import { leadStore } from "../lib/session";
import { track } from "../lib/tracking";
import { sendLead } from "../lib/webhook";

export default function SchedulePage() {
  const [lead] = useState(() => leadStore.get());
  const navigate = useNavigate();

  const onScheduled = useCallback(
    (info: ScheduledInfo) => {
      if (!lead) return;
      void sendLead("agendo", lead, {
        calendly_event_uri: info.eventUri,
        calendly_invitee_uri: info.inviteeUri,
        demo: info.demo ? "1" : "0",
      });
      track("Schedule", { status: lead.result.status }, `${lead.id}-schedule`);
      navigate(paths.thanks);
    },
    [lead, navigate],
  );

  // Solo llega aquí quien calificó en el formulario.
  if (!canOpenSchedule(lead)) return <Navigate to={paths.landing} replace />;

  return (
    <Layout>
      <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 pb-20 pt-10 sm:px-6 sm:pt-14">
        <div className="flex flex-col gap-3">
          <StepLabel>{content.schedule.step}</StepLabel>
          <h1 className="text-balance font-display text-3xl font-extrabold leading-tight sm:text-4xl">
            {content.schedule.title}
          </h1>
          <p className="text-lg text-muted-foreground">{content.schedule.body}</p>
        </div>
        <Scheduler lead={lead} onScheduled={onScheduled} />
      </div>
    </Layout>
  );
}
