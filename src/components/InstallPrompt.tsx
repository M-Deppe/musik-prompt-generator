import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

// Fängt das beforeinstallprompt-Event ab und zeigt einen dezenten Banner mit
// "Als App installieren"-Button. Nach Installation oder Dismiss verschwindet
// der Banner und kommt nicht wieder (sessionStorage-Flag).

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "mps.installPromptDismissed";

export const InstallPrompt = () => {
  const [evt, setEvt] = useState<BIPEvent | null>(null);
  const [dismissed, setDismissed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (dismissed) return;
    const handler = (e: Event) => {
      e.preventDefault();
      setEvt(e as BIPEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setEvt(null));
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, [dismissed]);

  const install = async () => {
    if (!evt) return;
    await evt.prompt();
    const result = await evt.userChoice;
    if (result.outcome === "accepted") {
      setEvt(null);
    }
  };

  const dismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // Ignoriere
    }
  };

  if (!evt || dismissed) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 flex max-w-sm items-center gap-3 rounded-lg border border-[var(--color-amber-dim)] bg-[var(--color-panel)]/90 p-3 shadow-2xl backdrop-blur-xl">
      <Download size={16} className="shrink-0 text-[var(--color-amber)]" />
      <div className="flex-1 text-[11px] leading-relaxed">
        <p className="font-semibold text-[var(--color-text)]">Als App installieren</p>
        <p className="text-[var(--color-text-dim)]">
          Starte Musik Prompt Generator im eigenen Fenster — direkt vom Desktop oder Home-Screen.
        </p>
      </div>
      <button
        onClick={install}
        className="shrink-0 rounded border border-[var(--color-amber)] bg-[var(--color-amber)]/15 px-3 py-1 text-[11px] font-semibold text-[var(--color-amber)] hover:bg-[var(--color-amber)]/25"
      >
        Installieren
      </button>
      <button
        onClick={dismiss}
        className="shrink-0 rounded p-1 text-[var(--color-text-faint)] hover:bg-[var(--color-panel-hover)] hover:text-[var(--color-text)]"
        aria-label="Dismiss"
      >
        <X size={12} />
      </button>
    </div>
  );
};
