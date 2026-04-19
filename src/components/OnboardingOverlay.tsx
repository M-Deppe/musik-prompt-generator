import { useEffect, useState } from "react";
import { Music, Heart, Sparkles, X } from "lucide-react";

// Wird im localStorage gesetzt, sobald der User das Onboarding abgeschlossen
// oder explizit geschlossen hat. Ein zweites Mal erscheint das Overlay dann
// nicht — sowohl beim gleichen Tab als auch nach Reload.
const STORAGE_KEY = "mps.onboardingSeen";

const STEPS = [
  {
    n: 1,
    Icon: Music,
    title: "Genre wählen",
    body: "Links: Grundstil → Haupt- und Subgenre. Das Subgenre liefert die präziseste Richtung.",
  },
  {
    n: 2,
    Icon: Heart,
    title: "Stimmung + Vocals",
    body: "Emotionen setzt die Gefühlsrichtung. Gesang gibt dem Vokal Charakter und Sprache.",
  },
  {
    n: 3,
    Icon: Sparkles,
    title: "Generieren",
    body: "Rechts im Preview auf \u201EGenerieren\u201C klicken — Ollama baut daraus einen fertigen Style-Prompt (Suno oder Udio, oben wählbar).",
  },
];

// Einmaliges Willkommens-Overlay fuer neue Nutzer. Zeigt die drei Hauptschritte
// in kompakter Form. Dezent, nicht aggressiv — wer es schliesst, sieht es nie
// wieder (ausser localStorage wird geleert oder manuell reseted).
export const OnboardingOverlay = () => {
  const [visible, setVisible] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) !== "1";
    } catch {
      return true;
    }
  });

  // Mit ESC schliessbar, damit Keyboard-User nicht die Maus brauchen.
  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible]);

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Storage blockiert — dann eben nur in-memory bis Reload.
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      onClick={dismiss}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-[var(--color-amber-dim)] bg-[var(--color-panel)]/85 shadow-2xl backdrop-blur-xl"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[var(--color-border)] px-5 py-3">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-[var(--color-amber)]" />
            <h2
              id="onboarding-title"
              className="text-sm font-semibold uppercase tracking-wider text-[var(--color-amber)]"
            >
              Willkommen im Musik Prompt Generator
            </h2>
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="rounded-full p-1 text-[var(--color-text-dim)] transition hover:bg-[var(--color-panel-hover)] hover:text-[var(--color-text)]"
            aria-label="Onboarding schließen"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-5">
          <p className="text-sm text-[var(--color-text-dim)]">
            Drei Schritte bis zum fertigen Style-Prompt für Suno oder Udio. Alles bleibt lokal,
            dein State wird im Browser gespeichert.
          </p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {STEPS.map((step) => (
              <div
                key={step.n}
                className="flex flex-col gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)]/60 p-4"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-amber)]/15 text-[11px] font-bold text-[var(--color-amber)]">
                    {step.n}
                  </span>
                  <step.Icon size={14} className="text-[var(--color-amber-dim)]" />
                  <span className="text-[12px] font-semibold text-[var(--color-text)]">
                    {step.title}
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed text-[var(--color-text-dim)]">
                  {step.body}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2 rounded border border-[var(--color-border)] bg-[var(--color-bg)]/40 px-3 py-2 text-[11px] text-[var(--color-text-dim)]">
            <span>
              <span className="font-semibold text-[var(--color-amber)]">Voraussetzung:</span>{" "}
              Ollama läuft lokal unter <code className="rounded bg-[var(--color-bg)] px-1 text-[var(--color-text)]">http://localhost:11434</code>.
              Ein roter Hinweis-Banner erscheint oben, wenn es nicht erreichbar ist.
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={dismiss}
              className="rounded border border-[var(--color-amber)] bg-[var(--color-amber)]/15 px-4 py-2 text-sm font-medium text-[var(--color-amber)] hover:bg-[var(--color-amber)]/25"
            >
              Los geht's
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
