import { useEffect, useState } from "react";
import { AlertCircle, X } from "lucide-react";
import { ping } from "@/lib/ollama";
import { useStore } from "@/store";

// Prominenter Hinweis-Banner unter dem Header, wenn Ollama nicht erreichbar ist.
// Ergaenzt den OllamaDot im Header — der Dot ist subtil, der Banner explizit
// fuer Erst-Onboarding und nach Crash. Kann pro Session weggeklickt werden.
//
// Polling 10 s — etwas schneller als der Header-Dot (30 s), weil dieses
// Element fuer den ersten "geht's"-Moment kritisch ist.
export const OllamaOfflineBanner = () => {
  const { state, dispatch } = useStore();
  const [online, setOnline] = useState<boolean | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      const ok = await ping(state.settings.ollamaUrl);
      if (!cancelled) setOnline(ok);
    };
    check();
    const interval = setInterval(check, 10_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [state.settings.ollamaUrl]);

  // Verstecken sobald Ollama erreichbar ist — Dismissal-State zuruecksetzen,
  // damit beim naechsten Offline-Event wieder ein Hinweis kommt.
  // `dismissed` bewusst NICHT in Deps: setDismissed(false) ist idempotent und
  // haenge-Abhaengigkeit loeste doppelte Effect-Laeufe aus.
  useEffect(() => {
    if (online === true) setDismissed(false);
  }, [online]);

  if (dismissed || online === null || online) return null;

  return (
    <div className="border-b border-[var(--color-warn)]/40 bg-[var(--color-warn)]/10 px-6 py-2">
      <div className="flex items-start gap-3">
        <AlertCircle size={16} className="mt-0.5 shrink-0 text-[var(--color-warn)]" />
        <div className="flex-1 text-xs leading-relaxed">
          <p className="font-semibold text-[var(--color-warn)]">
            Ollama nicht erreichbar — KI-Funktionen sind aus.
          </p>
          <p className="mt-0.5 text-[var(--color-text-dim)]">
            Starte Ollama:{" "}
            <code className="rounded bg-[var(--color-bg)] px-1.5 py-0.5 font-mono text-[var(--color-text)]">
              ollama serve
            </code>
            {" "}in einer Shell, oder nutze{" "}
            <code className="rounded bg-[var(--color-bg)] px-1.5 py-0.5 font-mono text-[var(--color-text)]">
              start.bat
            </code>
            {" "}im Projekt-Root.
            {" "}Endpoint:{" "}
            <button
              onClick={() => dispatch({ type: "TOGGLE_SETTINGS" })}
              className="rounded bg-[var(--color-bg)] px-1.5 py-0.5 font-mono text-[var(--color-text)] underline-offset-2 hover:underline"
              title="Endpoint in Settings aendern"
            >
              {state.settings.ollamaUrl}
            </button>
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="rounded p-1 text-[var(--color-warn)] hover:bg-[var(--color-warn)]/20"
          title="Hinweis ausblenden (kommt wieder beim naechsten Offline-Event)"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};
