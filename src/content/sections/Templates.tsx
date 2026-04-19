import { useState } from "react";
import { templates } from "@/lib/knowledge";
import { AccordionSection } from "@/components/AccordionSection";
import { useStore } from "@/store";
import { Sparkles, Radio, Skull, Film, FlaskConical, Music } from "lucide-react";
import { INTENTS, GENRE_INTENTS, applyIntent, type Intent, type IntentApplyReport } from "@/lib/intents";

const INTENT_ICONS: Record<string, typeof Radio> = {
  "radio-hit": Radio,
  underground: Skull,
  cinematic: Film,
  experimental: FlaskConical,
};

const accentClasses = (accent: string): { border: string; text: string; bg: string; hover: string } => {
  // Tailwind kann dynamische Klassen nicht statisch erkennen — daher Mapping.
  switch (accent) {
    case "amber":
      return {
        border: "border-[var(--color-amber-dim)]/50",
        text: "text-[var(--color-amber)]",
        bg: "bg-[var(--color-amber)]/5",
        hover: "hover:bg-[var(--color-amber)]/10 hover:border-[var(--color-amber)]",
      };
    case "fuchsia":
      return {
        border: "border-fuchsia-500/40",
        text: "text-fuchsia-400",
        bg: "bg-fuchsia-500/5",
        hover: "hover:bg-fuchsia-500/10 hover:border-fuchsia-400",
      };
    case "sky":
      return {
        border: "border-sky-500/40",
        text: "text-sky-400",
        bg: "bg-sky-500/5",
        hover: "hover:bg-sky-500/10 hover:border-sky-400",
      };
    case "emerald":
      return {
        border: "border-emerald-500/40",
        text: "text-emerald-400",
        bg: "bg-emerald-500/5",
        hover: "hover:bg-emerald-500/10 hover:border-emerald-400",
      };
    case "rose":
      return {
        border: "border-rose-500/40",
        text: "text-rose-400",
        bg: "bg-rose-500/5",
        hover: "hover:bg-rose-500/10 hover:border-rose-400",
      };
    case "violet":
      return {
        border: "border-violet-500/40",
        text: "text-violet-400",
        bg: "bg-violet-500/5",
        hover: "hover:bg-violet-500/10 hover:border-violet-400",
      };
    case "orange":
      return {
        border: "border-orange-500/40",
        text: "text-orange-400",
        bg: "bg-orange-500/5",
        hover: "hover:bg-orange-500/10 hover:border-orange-400",
      };
    case "slate":
      return {
        border: "border-slate-500/40",
        text: "text-slate-300",
        bg: "bg-slate-500/5",
        hover: "hover:bg-slate-500/10 hover:border-slate-400",
      };
    default:
      return {
        border: "border-[var(--color-border)]",
        text: "text-[var(--color-text)]",
        bg: "bg-[var(--color-bg)]",
        hover: "hover:bg-[var(--color-panel-hover)]",
      };
  }
};

const formatReport = (intent: Intent, r: IntentApplyReport): string => {
  const parts: string[] = [];
  if (r.mainGenreChanged) parts.push(`Genre → ${intent.mainGenre}`);
  if (r.subgenreReset) parts.push("Subgenre zurückgesetzt");
  if (r.creativityModeChanged) parts.push(`Modus → ${intent.settings.creativityMode}`);
  if (r.arrangementLengthChanged) parts.push(`Arrangement → ${intent.settings.arrangementLength}`);
  if (r.moodsAdded > 0) parts.push(`+${r.moodsAdded} Moods`);
  if (r.customTagsAdded > 0) parts.push(`+${r.customTagsAdded} Style-Tags`);
  if (r.negativesAdded > 0) parts.push(`+${r.negativesAdded} Negatives`);
  return parts.length > 0 ? parts.join(" · ") : "alles war schon gesetzt — keine Aenderung";
};

export const Templates = () => {
  const { state, dispatch } = useStore();
  const [lastApplied, setLastApplied] = useState<{ intent: Intent; report: IntentApplyReport } | null>(null);

  const load = (id: string) => {
    const tpl = templates.find((t) => t.id === id);
    if (!tpl) return;
    dispatch({
      type: "LOAD_TEMPLATE",
      stylePrompt: tpl.style_prompt,
      bpm: tpl.bpm,
      title: tpl.name,
    });
    dispatch({ type: "SET_SECTION", section: "grundstil" });
  };

  const applyIntentClick = (intent: Intent) => {
    const report = applyIntent(intent, state, dispatch);
    setLastApplied({ intent, report });
  };

  return (
    <div className="flex flex-col gap-3">
      <AccordionSection title="Intent (Quickstart)" defaultOpen>
        <p className="mb-3 text-xs text-[var(--color-text-dim)]">
          Schneller Charakter-Setter: setzt Modus, Arrangement-Länge und ergänzt Moods,
          Style-Tags und Negative-Vorschläge. <span className="text-[var(--color-amber)]">Bestehende Auswahl bleibt erhalten</span> —
          Tags werden nur hinzugefügt, nie entfernt.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {INTENTS.map((intent) => {
            const Icon = INTENT_ICONS[intent.id] ?? Sparkles;
            const c = accentClasses(intent.accent);
            return (
              <button
                key={intent.id}
                onClick={() => applyIntentClick(intent)}
                className={`group flex flex-col gap-1 rounded-lg border ${c.border} ${c.bg} p-3 text-left transition ${c.hover}`}
              >
                <div className="flex items-center gap-2">
                  <Icon size={14} className={c.text} />
                  <span className={`text-sm font-semibold ${c.text}`}>{intent.label}</span>
                </div>
                <p className="text-[11px] leading-snug text-[var(--color-text-dim)]">
                  {intent.description}
                </p>
                <div className="mt-1 flex flex-wrap gap-1 text-[9px] uppercase tracking-wider text-[var(--color-text-faint)]">
                  <span>{intent.settings.creativityMode}</span>
                  <span>·</span>
                  <span>{intent.settings.arrangementLength}</span>
                  <span>·</span>
                  <span>{intent.moods.length}m</span>
                  <span>·</span>
                  <span>{intent.customTags.length}t</span>
                  <span>·</span>
                  <span>{intent.negatives.length}n</span>
                </div>
              </button>
            );
          })}
        </div>
        {lastApplied && (
          <div className="mt-3 flex items-start gap-2 rounded border border-[var(--color-success)]/30 bg-[var(--color-success)]/5 px-3 py-2 text-[11px]">
            <Sparkles size={11} className="mt-0.5 shrink-0 text-[var(--color-success)]" />
            <div className="flex-1">
              <span className="font-medium text-[var(--color-success)]">
                {lastApplied.intent.label} angewandt:
              </span>{" "}
              <span className="text-[var(--color-text-dim)]">
                {formatReport(lastApplied.intent, lastApplied.report)}
              </span>
            </div>
            <button
              onClick={() => setLastApplied(null)}
              className="text-[var(--color-text-faint)] hover:text-[var(--color-text)]"
              title="Hinweis ausblenden"
            >
              ×
            </button>
          </div>
        )}
      </AccordionSection>

      <AccordionSection title="Genre-Quickstart" defaultOpen>
        <p className="mb-3 text-xs text-[var(--color-text-dim)]">
          Pro Hauptgenre ein charakteristischer Einstieg. Setzt das Hauptgenre und ergänzt passende
          Moods, Style-Tags und Negatives.{" "}
          <span className="text-[var(--color-amber)]">
            Bestehendes Subgenre wird bei Genre-Wechsel zurückgesetzt.
          </span>
        </p>
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
          {GENRE_INTENTS.map((intent) => {
            const c = accentClasses(intent.accent);
            const active = state.prompt.mainGenre === intent.mainGenre;
            return (
              <button
                key={intent.id}
                onClick={() => applyIntentClick(intent)}
                title={intent.description}
                className={`flex flex-col gap-0.5 rounded border ${c.border} ${c.bg} px-2 py-1.5 text-left transition ${c.hover} ${
                  active ? "ring-1 ring-[var(--color-amber-dim)]" : ""
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Music size={10} className={c.text} />
                  <span className={`truncate text-[11px] font-semibold ${c.text}`}>
                    {intent.label}
                  </span>
                </div>
                <span className="truncate text-[9px] uppercase tracking-wider text-[var(--color-text-faint)]">
                  {intent.settings.creativityMode} · {intent.settings.arrangementLength}
                </span>
              </button>
            );
          })}
        </div>
      </AccordionSection>

      <AccordionSection title="Starter-Templates" defaultOpen>
        <p className="mb-3 text-xs text-[var(--color-text-dim)]">
          10 kuratierte Genre-Templates aus dem Suno Prompt Mastery Guide. Click lädt Genre, BPM und
          vorgefertigten Style-Prompt als Startpunkt.
        </p>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => load(t.id)}
              className="group flex flex-col gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3 text-left transition hover:border-[var(--color-amber-dim)] hover:bg-[var(--color-amber)]/5"
            >
              <div className="flex items-baseline justify-between">
                <span className="font-medium text-[var(--color-text)]">{t.name}</span>
                <span className="text-[10px] text-[var(--color-text-faint)]">{t.bpm} BPM</span>
              </div>
              <pre className="line-clamp-2 whitespace-pre-wrap break-words font-mono text-[10px] text-[var(--color-text-dim)]">
                {t.style_prompt}
              </pre>
              <span className="flex items-center gap-1 text-[10px] text-[var(--color-amber-dim)] opacity-0 transition group-hover:opacity-100">
                <Sparkles size={9} /> Laden
              </span>
            </button>
          ))}
        </div>
      </AccordionSection>

      <AccordionSection title="Warum diese Templates" optional>
        <ul className="flex flex-col gap-2 text-xs text-[var(--color-text-dim)]">
          {templates.map((t) => (
            <li key={t.id} className="grid grid-cols-[120px_1fr] gap-3">
              <span className="font-medium text-[var(--color-amber)]">{t.name}</span>
              <span>{t.explanation}</span>
            </li>
          ))}
        </ul>
      </AccordionSection>
    </div>
  );
};
