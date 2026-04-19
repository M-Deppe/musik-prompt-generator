import { useEffect, useState } from "react";
import { Zap, Wrench, FlaskConical, RotateCcw, Settings as SettingsIcon, Sparkles, BarChart3, Menu, Eye } from "lucide-react";
import { useStore } from "@/store";
import type { Mode } from "@/sections";
import { ping } from "@/lib/ollama";

const MODES: { id: Mode; label: string; icon: typeof Zap }[] = [
  { id: "simple", label: "Simple", icon: Zap },
  { id: "custom", label: "Custom", icon: Wrench },
  { id: "studio", label: "Studio", icon: FlaskConical },
];

export const Header = () => {
  const { state, dispatch } = useStore();

  return (
    <header
      role="banner"
      className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-panel)]/75 px-6 py-3 backdrop-blur-xl"
    >
      <a href="#main-content" className="skip-link">
        Zum Hauptinhalt springen
      </a>
      {/* Logo + Links */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 items-end gap-0.5" aria-hidden="true">
            {[3, 6, 4, 8, 5, 7, 4].map((h, i) => (
              <div
                key={i}
                className="w-1 rounded-sm bg-[var(--color-amber)]"
                style={{ height: `${h * 3}px` }}
              />
            ))}
          </div>
          <div className="leading-tight">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-semibold text-[var(--color-text)]">Musik Prompt Generator</span>
              <span className="text-xs text-[var(--color-amber)]">V1.0.0</span>
            </div>
            <div className="text-[10px] uppercase tracking-widest text-[var(--color-text-faint)]">
              BY M.DEPPE
            </div>
          </div>
        </div>
        <nav className="flex gap-4 text-sm">
          <button
            onClick={() => dispatch({ type: "SET_INFO_MODAL", modal: "manual" })}
            className="text-[var(--color-amber-dim)] transition hover:text-[var(--color-amber)]"
          >
            Handbuch
          </button>
          <button
            onClick={() => dispatch({ type: "SET_INFO_MODAL", modal: "imprint" })}
            className="text-[var(--color-amber-dim)] transition hover:text-[var(--color-amber)]"
          >
            Impressum
          </button>
        </nav>
      </div>

      {/* Mode-Toggle — Studio ist nur bei target=suno verfuegbar, weil die
          einzige Section dort (suno-studio) Suno-spezifische Meta-Tags nutzt. */}
      <div className="flex rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] p-1">
        {MODES.map(({ id, label, icon: Icon }) => {
          const active = state.mode === id;
          const disabled = id === "studio" && state.settings.target !== "suno";
          return (
            <button
              key={id}
              onClick={() => !disabled && dispatch({ type: "SET_MODE", mode: id })}
              disabled={disabled}
              title={disabled ? "Studio-Modus ist Suno-spezifisch" : undefined}
              className={`flex items-center gap-2 rounded-full px-5 py-1.5 text-sm font-medium transition ${
                active
                  ? "bg-[var(--color-amber)] text-neutral-950 shadow"
                  : disabled
                    ? "cursor-not-allowed text-[var(--color-text-faint)] opacity-40"
                    : "text-[var(--color-text-dim)] hover:text-[var(--color-text)]"
              }`}
            >
              <Icon size={14} strokeWidth={2.5} />
              {label}
            </button>
          );
        })}
      </div>

      {/* Rechts: Idee, Counter, Settings, Reset */}
      <div className="flex items-center gap-2">
        {/* Mobile-Only: Panel-Toggles, auf lg versteckt */}
        <button
          onClick={() => dispatch({ type: "SET_MOBILE_PANEL", panel: "sidebar" })}
          className="rounded-full p-2 text-[var(--color-text-dim)] transition hover:bg-[var(--color-panel-hover)] hover:text-[var(--color-text)] lg:hidden"
          aria-label="Navigation oeffnen"
          title="Navigation"
        >
          <Menu size={16} />
        </button>
        <button
          onClick={() => dispatch({ type: "SET_MOBILE_PANEL", panel: "preview" })}
          className="rounded-full p-2 text-[var(--color-text-dim)] transition hover:bg-[var(--color-panel-hover)] hover:text-[var(--color-text)] lg:hidden"
          aria-label="Vorschau oeffnen"
          title="Vorschau"
        >
          <Eye size={16} />
        </button>
        <OllamaDot />
        <TargetToggle />
        <button
          onClick={() => dispatch({ type: "TOGGLE_IDEA" })}
          className="flex items-center gap-1.5 rounded-full border border-[var(--color-amber-dim)] bg-[var(--color-amber)]/10 px-3 py-1.5 text-xs text-[var(--color-amber)] transition hover:bg-[var(--color-amber)]/20"
        >
          <Sparkles size={12} />
          Aus Idee
        </button>
        <SelectionBadge />
        <button
          onClick={() => dispatch({ type: "SET_INFO_MODAL", modal: "stats" })}
          className="rounded-full p-2 text-[var(--color-text-dim)] transition hover:bg-[var(--color-panel-hover)] hover:text-[var(--color-text)]"
          title="Statistik"
          aria-label="Statistik oeffnen"
        >
          <BarChart3 size={16} />
        </button>
        <button
          onClick={() => dispatch({ type: "TOGGLE_SETTINGS" })}
          className="rounded-full p-2 text-[var(--color-text-dim)] transition hover:bg-[var(--color-panel-hover)] hover:text-[var(--color-text)]"
          title="Einstellungen"
          aria-label="Einstellungen oeffnen"
        >
          <SettingsIcon size={16} />
        </button>
        <button
          onClick={() => dispatch({ type: "RESET" })}
          className="rounded-full p-2 text-[var(--color-text-dim)] transition hover:bg-[var(--color-panel-hover)] hover:text-[var(--color-text)]"
          title="Zuruecksetzen"
          aria-label="Alle Eingaben zuruecksetzen"
        >
          <RotateCcw size={16} />
        </button>
      </div>
    </header>
  );
};

const OllamaDot = () => {
  const { state } = useStore();
  const [online, setOnline] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      const ok = await ping(state.settings.ollamaUrl);
      if (!cancelled) setOnline(ok);
    };
    check();
    const interval = setInterval(check, 30_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [state.settings.ollamaUrl]);

  const cls =
    online === null
      ? "bg-[var(--color-text-faint)]"
      : online
        ? "bg-[var(--color-success)]"
        : "bg-[var(--color-danger)]";
  const label =
    online === null ? "Ollama-Status prüfen..." : online ? "Ollama online" : "Ollama offline";

  // Rein visueller Indikator — kein Klick, kein Link zu Settings.
  return (
    <div
      title={label}
      className="flex items-center gap-1.5 rounded-full border border-[var(--color-border)] px-2.5 py-1.5 text-[11px] text-[var(--color-text-dim)]"
    >
      <span className={`h-2 w-2 rounded-full ${cls}`} />
      Ollama
    </div>
  );
};

// Target-Toggle: schaltet zwischen Suno und Udio um. Beeinflusst den LLM-
// System-Prompt (Prosa vs. Tag-Liste), kosmetische UI-Hinweise und
// Sichtbarkeit von Suno-spezifischen Sections (z.B. SunoStudio).
const TargetToggle = () => {
  const { state, dispatch } = useStore();
  const target = state.settings.target;
  const setTarget = (t: typeof target) =>
    dispatch({ type: "SET_SETTINGS", settings: { target: t } });

  return (
    <div
      className="flex items-center overflow-hidden rounded-full border border-[var(--color-border)]"
      title="Ziel-Plattform — beeinflusst den generierten Style-Prompt (Suno = Prosa, Udio = Tag-Liste)"
    >
      {(["suno", "udio"] as const).map((t) => {
        const active = target === t;
        return (
          <button
            key={t}
            type="button"
            onClick={() => setTarget(t)}
            className={`px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition ${
              active
                ? "bg-[var(--color-amber)] text-neutral-950"
                : "text-[var(--color-text-dim)] hover:bg-[var(--color-panel-hover)] hover:text-[var(--color-text)]"
            }`}
          >
            {t}
          </button>
        );
      })}
    </div>
  );
};

const SelectionBadge = () => {
  const { state } = useStore();
  const count = countSelections(state);
  if (count === 0) return null;
  return (
    <span className="rounded-full border border-[var(--color-amber-dim)] px-3 py-1 text-xs text-[var(--color-amber)]">
      {count} {count === 1 ? "Auswahl" : "Auswahlen"}
    </span>
  );
};

const countSelections = (s: ReturnType<typeof useStore>["state"]): number => {
  const p = s.prompt;
  let c = 0;
  if (p.mainGenre) c++;
  if (p.subgenre) c++;
  c += p.moods.length;
  c += p.instruments.length;
  c += p.negatives.length;
  c += p.production.length;
  c += (p.customTags ?? []).length;
  if (p.vocalCharacter) c++;
  if (p.vocalDelivery) c++;
  if (p.vocalEffects) c++;
  return c;
};
