import { vslConfig } from "../config";

/** Atajos de prueba (solo con debug activo): desbloquear sin ver el video y reiniciar. */
export function DebugBar({ onUnlock, onReset }: { onUnlock: () => void; onReset: () => void }) {
  if (!vslConfig.debug) return null;
  return (
    <div className="fixed bottom-3 left-3 z-50 flex items-center gap-1 rounded-full border border-border bg-background/95 p-1 text-xs shadow-lg backdrop-blur">
      <span className="px-2 font-semibold text-muted-foreground">Prueba</span>
      <button type="button" onClick={onUnlock} className="rounded-full px-3 py-1.5 font-semibold hover:bg-muted">
        Desbloquear
      </button>
      <button type="button" onClick={onReset} className="rounded-full px-3 py-1.5 font-semibold hover:bg-muted">
        Reiniciar
      </button>
    </div>
  );
}
