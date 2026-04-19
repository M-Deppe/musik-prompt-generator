import { useEffect } from "react";
import { X } from "lucide-react";
import { useStore } from "@/store";
import { Sidebar } from "./Sidebar";
import { Preview } from "./Preview";

// Overlay-Wrapper fuer Mobile-Ansicht. Auf Screens >= lg (1024px) bleibt er
// inaktiv — die Haupt-Layout-Panels werden normal angezeigt. Auf kleineren
// Screens sind Sidebar und Preview im Hauptlayout versteckt (lg:flex) und
// dieser Overlay zeigt das gewaehlte Panel als Fullscreen-Modal an.

export const MobileOverlay = () => {
  const { state, dispatch } = useStore();
  const panel = state.mobilePanel;

  // Esc schliesst den Overlay — Touch-User koennen den Backdrop tappen.
  useEffect(() => {
    if (!panel) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dispatch({ type: "SET_MOBILE_PANEL", panel: null });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [panel, dispatch]);

  if (!panel) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex bg-black/60 backdrop-blur-sm lg:hidden"
      onClick={() => dispatch({ type: "SET_MOBILE_PANEL", panel: null })}
      role="dialog"
      aria-modal="true"
      aria-label={panel === "sidebar" ? "Navigation" : "Vorschau"}
    >
      <div
        className="ml-auto flex h-full w-[85vw] max-w-md flex-col bg-[var(--color-panel)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-3 py-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-dim)]">
            {panel === "sidebar" ? "Navigation" : "Vorschau & Export"}
          </span>
          <button
            onClick={() => dispatch({ type: "SET_MOBILE_PANEL", panel: null })}
            className="rounded p-1 text-[var(--color-text-dim)] hover:bg-[var(--color-panel-hover)] hover:text-[var(--color-text)]"
            aria-label="Schliessen"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          {panel === "sidebar" ? <Sidebar forceShow /> : <Preview forceShow />}
        </div>
      </div>
    </div>
  );
};
