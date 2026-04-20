import { useMemo, useState } from "react";
import {
  Copy,
  Download,
  Upload,
  ExternalLink,
  Sparkles,
  Loader2,
  Star,
  Trash2,
  Play,
  Plus,
  ChevronUp,
  ChevronDown,
  Search,
  X,
  Blocks,
  Zap,
  Eye,
  Tag as TagIcon,
  MessageSquare,
  Link2,
  Check,
  FileText,
  Gavel,
} from "lucide-react";
import { useStore } from "@/store";
import { buildStylePrompt } from "@/lib/promptBuilder";
import { validate, preflightCheck, scorePrompt } from "@/lib/validator";
import { runLlmBuilder, runLlmArrangement, runStyleAndArrangement, runLlmTitles, runRefinement, buildArrangementSystemPrompt } from "@/lib/llm";
import { runJudge } from "@/lib/llmJudge";
import { analyzeArrangement, buildArrangementRefineFeedback } from "@/lib/arrangementInsights";
import { buildUserPromptFromState, SYSTEM_PROMPT_BUILDER } from "@/lib/systemPrompts";
import { buildShareUrl } from "@/lib/urlState";
import { formatSentencesForDisplay } from "@/lib/sentenceSplit";
import { loadFavorites, addFavorite, removeFavorite, isFavorite } from "@/lib/titleFavorites";
import { CompareModal } from "./CompareModal";
import { VariantsPanel } from "./VariantsPanel";
import {
  addHistoryEntry,
  addPreset,
  exportState,
  migratePromptState,
  removeHistoryEntry,
  removePreset,
  updateHistoryEntry,
  type HistoryEntry,
} from "@/lib/persistence";


export const Preview = ({ forceShow = false }: { forceShow?: boolean } = {}) => {
  const { state, dispatch } = useStore();
  const stylePrompt = buildStylePrompt(state.prompt);
  const issues = validate(state.prompt, stylePrompt);
  const preflightWarnings = preflightCheck(state.prompt);
  const score = scorePrompt(state.prompt, stylePrompt);
  const llmStale =
    !!state.llmOutput &&
    !!state.llmSourceStylePrompt &&
    state.llmSourceStylePrompt !== stylePrompt;
  const arrangementStale =
    !!state.llmArrangement &&
    !!state.llmArrangementSourceStylePrompt &&
    state.llmArrangementSourceStylePrompt !== stylePrompt;
  const charLimit = state.mode === "studio" ? 5000 : state.mode === "custom" ? 1000 : 500;
  const [presetsOpen, setPresetsOpen] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(true);
  const [historyQuery, setHistoryQuery] = useState("");
  // History-Filter: Minimal-Score, Minimal-Rating. Null = kein Filter.
  const [historyMinScore, setHistoryMinScore] = useState<number | null>(null);
  const [historyMinRating, setHistoryMinRating] = useState<number | null>(null);

  const filteredHistory = useMemo(() => {
    const q = historyQuery.trim().toLowerCase();
    return state.history.filter((h) => {
      if (q) {
        const hit =
          (h.title ?? "").toLowerCase().includes(q) ||
          h.stylePrompt.toLowerCase().includes(q) ||
          (h.llmOutput ?? "").toLowerCase().includes(q);
        if (!hit) return false;
      }
      if (historyMinScore !== null) {
        const s = scorePrompt(h.prompt, h.llmOutput?.trim() || h.stylePrompt).total;
        if (s < historyMinScore) return false;
      }
      if (historyMinRating !== null && (h.rating ?? 0) < historyMinRating) return false;
      return true;
    });
  }, [state.history, historyQuery, historyMinScore, historyMinRating]);

  const finalText = useMemo(() => state.llmOutput || stylePrompt, [state.llmOutput, stylePrompt]);

  const runLlm = () => runLlmBuilder(state, dispatch);
  const runArrangement = () => runLlmArrangement(state, dispatch);
  const runPipeline = () => runStyleAndArrangement(state, dispatch);
  const runTitles = () => runLlmTitles(state, dispatch);
  const pipelineRunning = state.llmLoading || state.llmArrangementLoading;

  const [refineStyleInput, setRefineStyleInput] = useState("");
  const [refineArrInput, setRefineArrInput] = useState("");
  // Chat-Log: historische Refine-Feedbacks in dieser Session. Nicht persistent —
  // reset bei neuem LLM-Call. Nur visueller Verlauf, was schon gefragt wurde.
  const [refineLog, setRefineLog] = useState<Array<{ feedback: string; ts: number }>>([]);

  const submitStyleRefine = async () => {
    const fb = refineStyleInput.trim();
    if (!fb || state.llmLoading) return;
    setRefineLog((curr) => [...curr, { feedback: fb, ts: Date.now() }].slice(-8));
    setRefineStyleInput("");
    await runRefinement(state, dispatch, "style", fb);
  };
  const [shareCopied, setShareCopied] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(() => loadFavorites());
  // Compare-View: User markiert bis zu 2 History-Entries, Compare-Button aktiviert.
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const compareA = state.history.find((h) => h.id === compareIds[0]);
  const compareB = state.history.find((h) => h.id === compareIds[1]);

  const toggleCompare = (id: string) => {
    setCompareIds((curr) => {
      if (curr.includes(id)) return curr.filter((c) => c !== id);
      if (curr.length >= 2) return [curr[1], id]; // älteste rausschieben
      return [...curr, id];
    });
  };

  const toggleFavorite = (title: string) => {
    if (isFavorite(title)) setFavorites(removeFavorite(title));
    else setFavorites(addFavorite(title));
  };

  // Teilt den aktuellen PromptState als Hash-Link — der Empfaenger bekommt
  // exakt diese Auswahl (ohne History, ohne Settings, ohne LLM-Outputs).
  const copyShareLink = async () => {
    try {
      const url = buildShareUrl(state.prompt);
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      window.setTimeout(() => setShareCopied(false), 2000);
    } catch {
      // clipboard blockiert (Insecure Context etc.) — zeigt dem User zumindest
      // den Link in einem prompt() als Fallback, damit er manuell kopieren kann.
      window.prompt("Share-Link (manuell kopieren):", buildShareUrl(state.prompt));
    }
  };

  const previewStylePrompt = () =>
    dispatch({
      type: "SHOW_PROMPT_PREVIEW",
      label: "KI-Ausformulierung",
      system: SYSTEM_PROMPT_BUILDER,
      user: buildUserPromptFromState(state.prompt),
    });
  const previewArrangementPrompt = () =>
    dispatch({
      type: "SHOW_PROMPT_PREVIEW",
      label: "KI-Arrangement",
      system: buildArrangementSystemPrompt(state.settings.arrangementLength),
      user: `Build a song arrangement matching: ${stylePrompt}${state.llmOutput ? `\n\nCONTEXT — the full style description for the song:\n"${state.llmOutput.trim()}"` : ""}`,
    });

  // Markdown-Export: sammelt alles Wichtige in einer .md-Datei. Fuer User
  // die den Prompt ausserhalb des Tools dokumentieren (Notion, Obsidian, etc.).
  const exportMarkdown = () => {
    const lines: string[] = [];
    const title = state.prompt.title || "Untitled Track";
    lines.push(`# ${title}`, "");
    lines.push(`> Generiert mit Musik Prompt Generator · Ziel: **${state.settings.target.toUpperCase()}** · ${new Date().toLocaleString("de-DE")}`, "");
    if (state.prompt.mainGenre || state.prompt.subgenre) {
      lines.push("## Genre");
      if (state.prompt.mainGenre) lines.push(`- **Hauptgenre**: ${state.prompt.mainGenre}`);
      if (state.prompt.subgenre) lines.push(`- **Subgenre**: ${state.prompt.subgenre}`);
      if (state.prompt.secondaryGenre) lines.push(`- **Zweitstil**: ${state.prompt.secondaryGenre}`);
      if (state.prompt.bpm) lines.push(`- **BPM**: ${state.prompt.bpm}`);
      lines.push("");
    }
    if (state.prompt.moods.length) {
      lines.push("## Stimmung", state.prompt.moods.join(", "), "");
    }
    if (stylePrompt) {
      lines.push("## Roh-Style-Prompt", "```", stylePrompt, "```", "");
    }
    if (state.llmOutput) {
      lines.push("## KI-Ausformulierung", "```", state.llmOutput, "```", "");
    }
    if (state.llmArrangement) {
      lines.push("## Arrangement", "```", state.llmArrangement, "```", "");
    }
    if (state.prompt.lyrics) {
      lines.push("## Lyrics", "```", state.prompt.lyrics, "```", "");
    }
    if (state.llmTitles.length) {
      lines.push("## Titel-Vorschläge");
      state.llmTitles.forEach((t) => lines.push(`- ${t}`));
      lines.push("");
    }
    const md = lines.join("\n");
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    a.href = url;
    a.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "prompt"}-${stamp}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const saveToHistory = () => {
    const entry: HistoryEntry = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      stylePrompt,
      llmOutput: state.llmOutput || undefined,
      llmArrangement: state.llmArrangement || undefined,
      prompt: state.prompt,
      title: state.prompt.title || undefined,
    };
    const next = addHistoryEntry(entry);
    dispatch({ type: "SET_HISTORY", history: next });
  };

  const exportJson = () => {
    const data = exportState({
      prompt: state.prompt,
      title: state.prompt.title,
      llmOutput: state.llmOutput,
      llmArrangement: state.llmArrangement,
      llmVariants: state.llmVariants,
      llmTitles: state.llmTitles,
      settings: state.settings,
    });
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mps-prompt-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        if (!data.prompt) {
          alert("Import fehlgeschlagen: keine prompt-Sektion im JSON.");
          return;
        }
        const migrated = migratePromptState(data.prompt);
        dispatch({ type: "LOAD_PROMPT_STATE", prompt: migrated });
        // v4-Bundle: optionale LLM-Outputs wiederherstellen.
        // Settings bleiben bewusst unangetastet — sonst koennte ein fremder
        // Export die lokale Modell-Konfig ueberschreiben.
        if (typeof data.llmOutput === "string" && data.llmOutput.trim()) {
          dispatch({ type: "LLM_DONE", output: data.llmOutput });
        } else {
          dispatch({ type: "LLM_RESET" });
        }
        if (typeof data.llmArrangement === "string" && data.llmArrangement.trim()) {
          dispatch({ type: "ARRANGEMENT_DONE", output: data.llmArrangement });
        } else {
          dispatch({ type: "ARRANGEMENT_RESET" });
        }
        if (Array.isArray(data.llmTitles) && data.llmTitles.length > 0) {
          dispatch({ type: "TITLES_DONE", titles: data.llmTitles.filter((t: unknown) => typeof t === "string") });
        }
        if (data.llmVariants && typeof data.llmVariants === "object") {
          dispatch({ type: "LLM_VARIANTS_START" });
          for (const id of ["safe", "experimental", "minimal", "intense"] as const) {
            const v = data.llmVariants[id];
            if (typeof v === "string" && v.trim()) {
              dispatch({ type: "LLM_VARIANT_DONE", variant: id, output: v });
            }
          }
          dispatch({ type: "LLM_VARIANTS_END" });
        }
      } catch (e) {
        alert("Import fehlgeschlagen: " + (e instanceof Error ? e.message : "?"));
      }
    };
    input.click();
  };

  const [presetTagFilter, setPresetTagFilter] = useState<string | null>(null);

  const allPresetTags = useMemo(() => {
    const set = new Set<string>();
    state.presets.forEach((p) => (p.tags ?? []).forEach((t) => set.add(t)));
    return [...set].sort();
  }, [state.presets]);

  const filteredPresets = useMemo(
    () =>
      presetTagFilter
        ? state.presets.filter((p) => (p.tags ?? []).includes(presetTagFilter))
        : state.presets,
    [state.presets, presetTagFilter],
  );

  const editPresetTags = (presetId: string) => {
    const current = state.presets.find((p) => p.id === presetId);
    if (!current) return;
    const raw = window.prompt(
      "Tags (kommasepariert, z.B. favorit, trailer, demo):",
      (current.tags ?? []).join(", "),
    );
    if (raw === null) return;
    const tags = raw
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
    const next = state.presets.map((p) =>
      p.id === presetId ? { ...p, tags: tags.length ? tags : undefined } : p,
    );
    dispatch({ type: "SET_PRESETS", presets: next });
  };

  const savePreset = () => {
    const name = window.prompt("Preset-Name:") ?? "";
    if (!name.trim()) return;
    const rawTags = window.prompt("Tags (optional, kommasepariert):", "") ?? "";
    const tags = rawTags
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
    const next = addPreset({
      id: crypto.randomUUID(),
      name: name.trim(),
      createdAt: new Date().toISOString(),
      prompt: state.prompt,
      ...(tags.length ? { tags } : {}),
    });
    dispatch({ type: "SET_PRESETS", presets: next });
  };

  // Auf Mobile wird Preview via MobileOverlay gerendert — dann forceShow.
  // Im Hauptlayout unter lg ausblenden, damit nichts doppelt erscheint.
  const visibility = forceShow ? "flex w-full" : "hidden w-[360px] lg:flex";

  return (
    <aside
      className={`${visibility} shrink-0 flex-col gap-3 overflow-y-auto border-l border-[var(--color-border)] bg-[var(--color-panel)]/60 p-4 backdrop-blur-md`}
      aria-label="Vorschau und Export"
    >
      {/* Presets */}
      <section className="overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)]">
        <button
          onClick={() => setPresetsOpen(!presetsOpen)}
          className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-text)]"
        >
          <span className="flex items-center gap-2">
            <Sparkles size={12} className="text-[var(--color-amber)]" />
            Presets
            <span className="rounded-full bg-[var(--color-panel-hover)] px-1.5 text-[10px] text-[var(--color-text-dim)]">
              {state.presets.length}
            </span>
          </span>
          {presetsOpen ? (
            <ChevronUp size={12} className="text-[var(--color-text-dim)]" />
          ) : (
            <ChevronDown size={12} className="text-[var(--color-text-dim)]" />
          )}
        </button>
        {presetsOpen && (
          <div className="border-t border-[var(--color-border)] p-2">
            <button
              onClick={savePreset}
              className="mb-1.5 flex w-full items-center gap-1.5 rounded border border-[var(--color-amber-dim)] bg-[var(--color-amber)]/10 px-2 py-1 text-[11px] text-[var(--color-amber)] hover:bg-[var(--color-amber)]/20"
            >
              <Plus size={10} />
              Aktuelles als Preset speichern
            </button>
            {allPresetTags.length > 0 && (
              <div className="mb-1.5 flex flex-wrap gap-1">
                {allPresetTags.map((t) => {
                  const active = presetTagFilter === t;
                  return (
                    <button
                      key={t}
                      onClick={() => setPresetTagFilter(active ? null : t)}
                      className={`rounded-full border px-1.5 py-0 text-[9px] uppercase tracking-wider transition ${
                        active
                          ? "border-[var(--color-amber)] bg-[var(--color-amber)]/20 text-[var(--color-amber)]"
                          : "border-[var(--color-border)] text-[var(--color-text-dim)] hover:text-[var(--color-amber)]"
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
                {presetTagFilter && (
                  <button
                    onClick={() => setPresetTagFilter(null)}
                    className="rounded-full px-1.5 py-0 text-[9px] text-[var(--color-text-faint)] underline hover:text-[var(--color-text)]"
                  >
                    reset
                  </button>
                )}
              </div>
            )}
            {state.presets.length === 0 && (
              <p className="py-2 text-center text-[11px] text-[var(--color-text-faint)]">
                Keine Presets gespeichert
              </p>
            )}
            {state.presets.length > 0 && filteredPresets.length === 0 && (
              <p className="py-2 text-center text-[11px] text-[var(--color-text-faint)]">
                Kein Preset mit Tag „{presetTagFilter}"
              </p>
            )}
            {filteredPresets.map((p) => (
              <div
                key={p.id}
                className="flex flex-col gap-0.5 rounded border border-transparent px-2 py-1 text-[12px] hover:bg-[var(--color-panel-hover)]"
              >
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => dispatch({ type: "LOAD_PROMPT_STATE", prompt: p.prompt })}
                    className="flex-1 truncate text-left text-[var(--color-text)]"
                  >
                    {p.name}
                  </button>
                  <button
                    onClick={() => editPresetTags(p.id)}
                    className="rounded p-0.5 text-[var(--color-text-faint)] opacity-50 hover:bg-[var(--color-panel-hover)] hover:text-[var(--color-amber)] hover:opacity-100"
                    title="Tags bearbeiten"
                  >
                    <TagIcon size={10} />
                  </button>
                  <button
                    onClick={() => dispatch({ type: "SET_PRESETS", presets: removePreset(p.id) })}
                    className="rounded p-0.5 text-[var(--color-danger)] opacity-50 hover:bg-[var(--color-danger)]/10 hover:opacity-100"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
                {(p.tags ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-0.5 pl-0.5">
                    {(p.tags ?? []).map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-[var(--color-amber)]/10 px-1.5 text-[9px] text-[var(--color-amber-dim)]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Pre-Flight Warnings */}
      {preflightWarnings.length > 0 && (
        <section className="flex flex-col gap-1">
          {preflightWarnings.map((w, i) => (
            <div
              key={i}
              className="rounded border border-[var(--color-warn)]/40 bg-[var(--color-warn)]/5 px-2 py-1 text-[11px] text-[var(--color-warn)]"
            >
              ⚠ {w}
            </div>
          ))}
        </section>
      )}

      {/* Pipeline-Button: Style + Arrangement in einem Rutsch */}
      <button
        onClick={runPipeline}
        disabled={pipelineRunning || !stylePrompt}
        className="flex items-center justify-center gap-2 rounded-full border-2 border-[var(--color-amber)] bg-gradient-to-r from-[var(--color-amber)]/20 to-sky-500/20 px-4 py-2.5 text-sm font-semibold text-[var(--color-amber)] transition hover:from-[var(--color-amber)]/30 hover:to-sky-500/30 disabled:opacity-40"
        title="Generiert KI-Ausformulierung und Arrangement sequenziell aus aktuellen Auswahlen"
      >
        {pipelineRunning ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
        {pipelineRunning ? "Pipeline laeuft..." : "Full Pipeline (Style + Arrangement)"}
      </button>

      {/* Mode-Badge + Export/Import */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--color-amber-dim)] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-amber)]">
          <Sparkles size={10} />
          {state.mode}
        </span>
        <div className="flex shrink-0 flex-wrap gap-1">
          <button
            onClick={copyShareLink}
            title="Link zum Teilen in Zwischenablage kopieren"
            className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition ${
              shareCopied
                ? "border-[var(--color-success)]/60 bg-[var(--color-success)]/10 text-[var(--color-success)]"
                : "border-[var(--color-border)] text-[var(--color-text-dim)] hover:text-[var(--color-text)]"
            }`}
          >
            {shareCopied ? <Check size={12} /> : <Link2 size={12} />}
            {shareCopied ? "Kopiert" : "Link"}
          </button>
          <button
            onClick={importJson}
            title="Import JSON"
            className="flex items-center gap-1 rounded-full border border-[var(--color-border)] px-2.5 py-1 text-xs text-[var(--color-text-dim)] hover:text-[var(--color-text)]"
          >
            <Upload size={12} />
          </button>
          <button
            onClick={exportMarkdown}
            title="Als Markdown-Datei exportieren"
            className="flex items-center gap-1 rounded-full border border-[var(--color-border)] px-2.5 py-1 text-xs text-[var(--color-text-dim)] hover:text-[var(--color-text)]"
          >
            <FileText size={12} />
          </button>
          <button
            onClick={exportJson}
            title="Export JSON"
            className="flex items-center gap-1 rounded-full border border-[var(--color-border)] px-2.5 py-1 text-xs text-[var(--color-text-dim)] hover:text-[var(--color-text)]"
          >
            <Download size={12} />
            Export
          </button>
        </div>
      </div>

      {/* Roh-Style-Prompt */}
      <section className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
        <header className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-text)]">
            Style Prompt (Roh)
          </span>
          <button
            onClick={() => navigator.clipboard.writeText(stylePrompt)}
            disabled={!stylePrompt}
            title="Kopiert genau den Roh-Style-Prompt — nicht die KI-Ausformulierung"
            className="flex shrink-0 items-center gap-1 rounded-full border border-[var(--color-border)] px-3 py-1 text-[11px] text-[var(--color-text)] transition hover:bg-[var(--color-panel-hover)] disabled:opacity-40"
          >
            <Copy size={10} />
            Kopieren
          </button>
        </header>
        <pre className="max-h-32 overflow-auto whitespace-pre-wrap break-words rounded bg-[var(--color-panel)] p-2 font-mono text-xs text-[var(--color-text)]">
          {stylePrompt || (
            <span className="text-[var(--color-text-faint)]">Wähle Optionen in den Sektionen...</span>
          )}
        </pre>
        <div className="mt-2 flex items-center gap-2">
          <div className="h-1 flex-1 rounded-full bg-[var(--color-panel)]">
            <div
              className={`h-full rounded-full transition-all ${
                stylePrompt.length > charLimit ? "bg-[var(--color-danger)]" : "bg-[var(--color-amber)]"
              }`}
              style={{ width: `${Math.min((stylePrompt.length / charLimit) * 100, 100)}%` }}
            />
          </div>
          <span className="text-[10px] tabular-nums text-[var(--color-text-dim)]">
            {stylePrompt.length} / {charLimit}
          </span>
        </div>
      </section>

      {/* Prompt-Score */}
      <ScoreCard score={score} hasContent={!!stylePrompt} />

      {/* LLM-Ausgabe */}
      <section className="rounded-lg border border-[var(--color-amber-dim)]/40 bg-[var(--color-bg)] p-3">
        <header className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <span className="flex min-w-0 flex-wrap items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-amber)]">
            <Sparkles size={11} />
            KI-Ausformulierung
            {state.llmAutoRefined && (
              <span
                title="Output wurde nach niedrigem Score automatisch nachgeschaerft."
                className="rounded-full border border-[var(--color-success)]/40 bg-[var(--color-success)]/10 px-1.5 py-0 text-[9px] font-medium text-[var(--color-success)]"
              >
                auto-refined
              </span>
            )}
            {llmStale && (
              <span
                title="Style-Prompt wurde nach Generierung geaendert. Neu generieren empfohlen."
                className="rounded-full border border-[var(--color-warn)]/40 bg-[var(--color-warn)]/10 px-1.5 py-0 text-[9px] font-medium text-[var(--color-warn)]"
              >
                veraltet
              </span>
            )}
          </span>
          <div className="flex shrink-0 items-center gap-1">
            <button
              onClick={previewStylePrompt}
              title="Zeig den Prompt, der an Ollama geht"
              className="rounded-full border border-[var(--color-border)] p-1 text-[var(--color-text-dim)] hover:text-[var(--color-text)]"
            >
              <Eye size={10} />
            </button>
            <button
              onClick={runLlm}
              disabled={state.llmLoading || !stylePrompt}
              className="flex items-center gap-1 rounded-full bg-[var(--color-amber)] px-3 py-1 text-[11px] font-medium text-neutral-950 transition hover:bg-[var(--color-amber-strong)] disabled:opacity-40"
            >
              {state.llmLoading ? (
                <Loader2 size={10} className="animate-spin" />
              ) : (
                <Play size={10} fill="currentColor" />
              )}
              {state.llmLoading ? "schreibt..." : "Generieren"}
            </button>
          </div>
        </header>
        <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-words rounded bg-[var(--color-panel)] p-2 font-mono text-xs leading-relaxed text-[var(--color-text)]">
          {state.llmOutput ? (
            // Display-only: ein Satz pro Zeile fuer bessere Lesbarkeit.
            // Kopieren/Export nutzen unveraendert state.llmOutput als Fliesstext.
            formatSentencesForDisplay(state.llmOutput)
          ) : state.llmError ? (
            <span className="text-[var(--color-danger)]">{state.llmError}</span>
          ) : (
            <span className="text-[var(--color-text-faint)]">
              Klick „Generieren" — Ollama schreibt den Prompt aus.
            </span>
          )}
        </pre>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[10px] text-[var(--color-text-faint)]">
            {state.settings.modelStyle || state.settings.ollamaModel}
          </span>
          {state.llmOutput && (
            <div className="flex gap-1">
              <button
                onClick={async () => {
                  dispatch({ type: "JUDGE_START" });
                  const result = await runJudge(state);
                  dispatch({ type: "JUDGE_DONE", result });
                }}
                disabled={state.judgeLoading || !state.llmOutput}
                title="Zweiter LLM-Pass bewertet den Prompt"
                className="flex items-center gap-1 rounded-full border border-[var(--color-border)] px-2 py-0.5 text-[10px] text-[var(--color-text-dim)] hover:text-[var(--color-text)] disabled:opacity-40"
              >
                {state.judgeLoading ? <Loader2 size={8} className="animate-spin" /> : <Gavel size={8} />}
                Bewerten
              </button>
              <button
                onClick={() => navigator.clipboard.writeText(state.llmOutput)}
                className="flex items-center gap-1 rounded-full border border-[var(--color-border)] px-2 py-0.5 text-[10px] text-[var(--color-text-dim)] hover:text-[var(--color-text)]"
              >
                <Copy size={8} />
                Kopieren
              </button>
            </div>
          )}
        </div>
        {state.judgeResult && (
          <JudgeCard result={state.judgeResult} />
        )}
        {state.llmOutput && (
          <div className="mt-2 flex flex-col gap-1">
            {refineLog.length > 0 && (
              <div className="flex flex-col gap-0.5 rounded border border-[var(--color-border)] bg-[var(--color-bg)]/60 p-1.5 text-[10px]">
                <span className="text-[9px] uppercase tracking-wider text-[var(--color-text-faint)]">
                  Verlauf ({refineLog.length})
                </span>
                {refineLog.slice(-5).map((l) => (
                  <div key={l.ts} className="flex items-start gap-1 text-[var(--color-text-dim)]">
                    <span className="text-[var(--color-amber-dim)]">›</span>
                    <span className="flex-1">{l.feedback}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-1">
              <input
                type="text"
                value={refineStyleInput}
                onChange={(e) => setRefineStyleInput(e.target.value)}
                placeholder="Refine: z.B. 'duester, weniger Pop'..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") submitStyleRefine();
                }}
                className="flex-1 rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1 text-[10px] text-[var(--color-text)] focus:border-[var(--color-amber-dim)] focus:outline-none"
              />
              <button
                onClick={submitStyleRefine}
                disabled={!refineStyleInput.trim() || state.llmLoading}
                className="flex items-center gap-1 rounded border border-[var(--color-amber-dim)] bg-[var(--color-amber)]/10 px-2 py-1 text-[10px] text-[var(--color-amber)] disabled:opacity-40"
              >
                <MessageSquare size={9} />
                Refine
              </button>
              {refineLog.length > 0 && (
                <button
                  onClick={() => setRefineLog([])}
                  className="rounded border border-[var(--color-border)] px-2 py-1 text-[10px] text-[var(--color-text-faint)] hover:text-[var(--color-text)]"
                  title="Verlauf leeren"
                >
                  <X size={9} />
                </button>
              )}
            </div>
          </div>
        )}
      </section>

      {/* KI-Arrangement-Generator */}
      <section className="rounded-lg border border-sky-500/30 bg-[var(--color-bg)] p-3">
        <header className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <span className="flex min-w-0 flex-wrap items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-sky-400">
            <Blocks size={11} />
            KI-Arrangement-Generator
            {arrangementStale && (
              <span
                title="Style-Prompt wurde nach Arrangement-Generierung geaendert."
                className="rounded-full border border-[var(--color-warn)]/40 bg-[var(--color-warn)]/10 px-1.5 py-0 text-[9px] font-medium text-[var(--color-warn)]"
              >
                veraltet
              </span>
            )}
          </span>
          <div className="flex shrink-0 items-center gap-1">
            <button
              onClick={previewArrangementPrompt}
              title="Zeig den Prompt"
              className="rounded-full border border-[var(--color-border)] p-1 text-[var(--color-text-dim)] hover:text-[var(--color-text)]"
            >
              <Eye size={10} />
            </button>
            <button
              onClick={runArrangement}
              disabled={state.llmArrangementLoading || (!stylePrompt && !state.llmOutput)}
              className="flex items-center gap-1 rounded-full bg-sky-500 px-3 py-1 text-[11px] font-medium text-neutral-950 transition hover:bg-sky-400 disabled:opacity-40"
            >
              {state.llmArrangementLoading ? (
                <Loader2 size={10} className="animate-spin" />
              ) : (
                <Play size={10} fill="currentColor" />
              )}
              {state.llmArrangementLoading ? "baut..." : "Generieren"}
            </button>
          </div>
        </header>
        <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-words rounded bg-[var(--color-panel)] p-2 font-mono text-xs text-[var(--color-text)]">
          {state.llmArrangement ||
            (state.llmArrangementError ? (
              <span className="text-[var(--color-danger)]">{state.llmArrangementError}</span>
            ) : (
              <span className="text-[var(--color-text-faint)]">
                Klick „Generieren" — Ollama baut eine Song-Struktur [Intro] · [Verse] · [Chorus] ... (für Suno-Lyrics-Box; bei Udio nur als Referenz nutzbar)
              </span>
            ))}
        </pre>
        {state.llmArrangement && (
          <div className="mt-2 flex items-center justify-end">
            <button
              onClick={() => navigator.clipboard.writeText(state.llmArrangement)}
              className="flex items-center gap-1 rounded-full border border-[var(--color-border)] px-2 py-0.5 text-[10px] text-[var(--color-text-dim)] hover:text-[var(--color-text)]"
            >
              <Copy size={8} />
              Kopieren
            </button>
          </div>
        )}
        {state.llmArrangement && (
          <div className="mt-2 flex gap-1">
            <input
              type="text"
              value={refineArrInput}
              onChange={(e) => setRefineArrInput(e.target.value)}
              placeholder="Refine: 'kuerzere Bridge'..."
              onKeyDown={async (e) => {
                if (e.key === "Enter" && refineArrInput.trim() && !state.llmArrangementLoading) {
                  await runRefinement(state, dispatch, "arrangement", refineArrInput.trim());
                  setRefineArrInput("");
                }
              }}
              className="flex-1 rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1 text-[10px] text-[var(--color-text)] focus:border-sky-500 focus:outline-none"
            />
            <button
              onClick={async () => {
                if (!refineArrInput.trim()) return;
                await runRefinement(state, dispatch, "arrangement", refineArrInput.trim());
                setRefineArrInput("");
              }}
              disabled={!refineArrInput.trim() || state.llmArrangementLoading}
              className="flex items-center gap-1 rounded border border-sky-500/40 bg-sky-500/10 px-2 py-1 text-[10px] text-sky-400 disabled:opacity-40"
            >
              <MessageSquare size={9} />
              Refine
            </button>
          </div>
        )}
      </section>

      {/* Style-aus-Arrangement-Insights */}
      {state.llmArrangement && <ArrangementInsightsPanel />}

      {/* Titel-Generator */}
      <section className="rounded-lg border border-emerald-500/30 bg-[var(--color-bg)] p-3">
        <header className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <span className="flex shrink-0 items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-400">
            <TagIcon size={11} />
            Titel-Generator
          </span>
          <button
            onClick={runTitles}
            disabled={state.llmTitlesLoading || (!state.llmOutput && !stylePrompt && !state.prompt.lyrics)}
            className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-500 px-3 py-1 text-[11px] font-medium text-neutral-950 transition hover:bg-emerald-400 disabled:opacity-40"
          >
            {state.llmTitlesLoading ? <Loader2 size={10} className="animate-spin" /> : <Play size={10} fill="currentColor" />}
            {state.llmTitlesLoading ? "denkt..." : "5 Titel"}
          </button>
        </header>
        {state.llmTitlesError && (
          <p className="text-[11px] text-[var(--color-danger)]">{state.llmTitlesError}</p>
        )}
        {state.llmTitles.length > 0 && (
          <ul className="flex flex-col gap-1">
            {state.llmTitles.map((t, i) => (
              <li key={i} className="flex flex-wrap items-center justify-between gap-2 rounded border border-[var(--color-border)] bg-[var(--color-panel)] px-2 py-1">
                <span className="min-w-0 truncate text-[12px] text-[var(--color-text)]">{t}</span>
                <div className="flex shrink-0 gap-1">
                  <button
                    onClick={() => toggleFavorite(t)}
                    className={`rounded border px-1.5 py-0.5 text-[10px] transition ${
                      favorites.includes(t)
                        ? "border-[var(--color-amber)] bg-[var(--color-amber)]/15 text-[var(--color-amber)]"
                        : "border-[var(--color-border)] text-[var(--color-text-dim)] hover:text-[var(--color-amber)]"
                    }`}
                    title={favorites.includes(t) ? "Aus Favoriten entfernen" : "Als Favorit speichern"}
                  >
                    <Star
                      size={10}
                      fill={favorites.includes(t) ? "currentColor" : "none"}
                    />
                  </button>
                  <button
                    onClick={() => dispatch({ type: "SET_TITLE", title: t })}
                    className="rounded border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400 hover:bg-emerald-500/20"
                  >
                    uebernehmen
                  </button>
                  <button
                    onClick={() => navigator.clipboard.writeText(t)}
                    className="rounded border border-[var(--color-border)] px-1.5 py-0.5 text-[10px] text-[var(--color-text-dim)] hover:text-[var(--color-text)]"
                  >
                    <Copy size={8} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {!state.llmTitles.length && !state.llmTitlesError && !state.llmTitlesLoading && (
          <p className="text-[10px] text-[var(--color-text-faint)]">
            Generiert 5 Titel-Vorschlaege auf Basis von Style-Output und Lyrics.
          </p>
        )}
        {favorites.length > 0 && (
          <details className="mt-2 rounded border border-[var(--color-border)] bg-[var(--color-bg)]/60">
            <summary className="cursor-pointer px-2 py-1 text-[10px] uppercase tracking-wider text-[var(--color-amber-dim)]">
              Favoriten ({favorites.length})
            </summary>
            <ul className="flex flex-col gap-0.5 p-1">
              {favorites.map((t) => (
                <li
                  key={t}
                  className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-[var(--color-text)] hover:bg-[var(--color-panel-hover)]"
                >
                  <Star size={9} fill="currentColor" className="shrink-0 text-[var(--color-amber)]" />
                  <span className="flex-1 truncate">{t}</span>
                  <button
                    onClick={() => dispatch({ type: "SET_TITLE", title: t })}
                    className="text-[9px] text-emerald-400 hover:underline"
                    title="Als Titel übernehmen"
                  >
                    übernehmen
                  </button>
                  <button
                    onClick={() => setFavorites(removeFavorite(t))}
                    className="text-[9px] text-[var(--color-danger)]/70 hover:text-[var(--color-danger)]"
                    title="Entfernen"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          </details>
        )}
      </section>

      {/* 4-Varianten */}
      <VariantsPanel />

      {/* Warnungen */}
      {issues.length > 0 && (
        <section className="flex flex-col gap-1">
          {issues.slice(0, 5).map((i, idx) => (
            <div
              key={idx}
              className={`rounded border px-2 py-1 text-[11px] ${
                i.severity === "error"
                  ? "border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 text-[var(--color-danger)]"
                  : i.severity === "warn"
                    ? "border-[var(--color-warn)]/30 bg-[var(--color-warn)]/5 text-[var(--color-warn)]"
                    : "border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-dim)]"
              }`}
            >
              {i.message}
            </div>
          ))}
        </section>
      )}

      {/* Aktionen */}
      <div className="flex flex-col gap-2">
        <button
          onClick={async () => {
            await navigator.clipboard.writeText(finalText);
            const targetUrl =
              state.settings.target === "udio"
                ? "https://www.udio.com/create"
                : "https://suno.com/create";
            window.open(targetUrl, "_blank");
          }}
          disabled={!finalText}
          className="flex items-center justify-center gap-2 rounded-full border border-sky-500/40 bg-sky-500/5 px-4 py-2 text-sm text-sky-400 transition hover:bg-sky-500/15 disabled:opacity-40"
        >
          <ExternalLink size={14} />
          In {state.settings.target === "udio" ? "Udio" : "Suno"} öffnen
        </button>
        <button
          onClick={saveToHistory}
          disabled={!stylePrompt && !state.llmOutput}
          className="flex items-center justify-center gap-2 rounded-full border border-[var(--color-border)] px-4 py-1.5 text-xs text-[var(--color-text-dim)] hover:text-[var(--color-text)] disabled:opacity-40"
        >
          <Star size={12} />
          In Verlauf speichern
        </button>
      </div>

      {/* Verlauf */}
      <section className="mt-auto overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)]">
        <button
          onClick={() => setHistoryOpen(!historyOpen)}
          className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-text)]"
        >
          <span>Verlauf</span>
          <span className="flex items-center gap-2">
            <span className="rounded-full bg-[var(--color-panel-hover)] px-1.5 text-[10px] text-[var(--color-text-dim)]">
              {state.history.length}
            </span>
            {historyOpen ? (
              <ChevronUp size={12} className="text-[var(--color-text-dim)]" />
            ) : (
              <ChevronDown size={12} className="text-[var(--color-text-dim)]" />
            )}
          </span>
        </button>
        {historyOpen && state.history.length > 0 && (
          <div className="border-t border-[var(--color-border)] p-2">
            <div className="relative mb-1.5">
              <Search size={11} className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[var(--color-text-faint)]" />
              <input
                type="text"
                value={historyQuery}
                onChange={(e) => setHistoryQuery(e.target.value)}
                placeholder="Suchen..."
                className="w-full rounded border border-[var(--color-border)] bg-[var(--color-bg)] py-1 pl-7 pr-7 text-[11px] text-[var(--color-text)] placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-amber-dim)] focus:outline-none"
              />
              {historyQuery && (
                <button
                  onClick={() => setHistoryQuery("")}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-[var(--color-text-faint)] hover:text-[var(--color-text)]"
                  title="Suche leeren"
                >
                  <X size={10} />
                </button>
              )}
            </div>
            {/* Filter: Min-Score + Min-Rating */}
            <div className="mb-1.5 flex items-center gap-2 text-[10px] text-[var(--color-text-faint)]">
              <span>Filter:</span>
              <select
                value={historyMinScore ?? ""}
                onChange={(e) => setHistoryMinScore(e.target.value ? Number(e.target.value) : null)}
                className="rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-1 py-0.5 text-[10px] text-[var(--color-text-dim)]"
                title="Mindest-Score"
              >
                <option value="">Score ≥ —</option>
                <option value="40">≥ 40</option>
                <option value="60">≥ 60</option>
                <option value="80">≥ 80</option>
              </select>
              <select
                value={historyMinRating ?? ""}
                onChange={(e) => setHistoryMinRating(e.target.value ? Number(e.target.value) : null)}
                className="rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-1 py-0.5 text-[10px] text-[var(--color-text-dim)]"
                title="Mindest-Rating"
              >
                <option value="">Rating ≥ —</option>
                <option value="3">≥ 3 ★</option>
                <option value="4">≥ 4 ★</option>
                <option value="5">= 5 ★</option>
              </select>
              {(historyMinScore !== null || historyMinRating !== null) && (
                <button
                  onClick={() => {
                    setHistoryMinScore(null);
                    setHistoryMinRating(null);
                  }}
                  className="text-[var(--color-text-dim)] underline hover:text-[var(--color-text)]"
                  title="Filter zurücksetzen"
                >
                  reset
                </button>
              )}
            </div>
            {filteredHistory.length === 0 && (
              <p className="py-2 text-center text-[11px] text-[var(--color-text-faint)]">
                Keine Treffer
              </p>
            )}
            {compareIds.length > 0 && (
              <div className="mb-1.5 flex items-center justify-between rounded bg-[var(--color-amber)]/10 px-2 py-1 text-[10px] text-[var(--color-amber)]">
                <span>
                  {compareIds.length}/2 zum Vergleich ausgewählt
                </span>
                <div className="flex gap-1">
                  {compareIds.length === 2 && (
                    <button
                      onClick={() => setCompareOpen(true)}
                      className="rounded bg-[var(--color-amber)] px-2 py-0.5 text-[10px] font-semibold text-neutral-950"
                    >
                      Vergleichen
                    </button>
                  )}
                  <button
                    onClick={() => setCompareIds([])}
                    className="rounded border border-[var(--color-border)] px-2 py-0.5 text-[10px] text-[var(--color-text-dim)] hover:text-[var(--color-text)]"
                  >
                    clear
                  </button>
                </div>
              </div>
            )}
            {filteredHistory.slice(0, 10).map((h) => (
              <div
                key={h.id}
                className="group flex items-start gap-1 rounded px-2 py-1 hover:bg-[var(--color-panel-hover)]"
              >
                <input
                  type="checkbox"
                  checked={compareIds.includes(h.id)}
                  onChange={() => toggleCompare(h.id)}
                  title="Für Vergleich markieren"
                  className="mt-1 shrink-0 accent-[var(--color-amber)]"
                />
                <button
                  onClick={() => {
                    dispatch({ type: "LOAD_PROMPT_STATE", prompt: h.prompt });
                    if (h.llmOutput) {
                      dispatch({ type: "LLM_DONE", output: h.llmOutput, sourceStylePrompt: h.stylePrompt });
                    } else {
                      dispatch({ type: "LLM_RESET" });
                    }
                    if (h.llmArrangement) {
                      dispatch({ type: "ARRANGEMENT_DONE", output: h.llmArrangement });
                    } else {
                      dispatch({ type: "ARRANGEMENT_RESET" });
                    }
                  }}
                  className="flex flex-1 flex-col overflow-hidden text-left text-[11px]"
                >
                  <span className="truncate text-[var(--color-text)]">
                    {h.title || h.stylePrompt.slice(0, 40) || "untitled"}
                  </span>
                  <span className="text-[10px] text-[var(--color-text-faint)]">
                    {new Date(h.createdAt).toLocaleString("de-DE", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </span>
                </button>
                <button
                  onClick={() => {
                    const raw = window.prompt("Rating 1-5:");
                    if (raw === null) return; // abgebrochen oder prompt() in dieser Umgebung deaktiviert
                    const rating = Number(raw);
                    if (!Number.isFinite(rating) || rating < 1 || rating > 5) return;
                    dispatch({
                      type: "SET_HISTORY",
                      history: updateHistoryEntry(h.id, { rating: Math.round(rating) }),
                    });
                  }}
                  className="opacity-0 group-hover:opacity-100"
                >
                  <Star
                    size={10}
                    className={h.rating ? "text-[var(--color-amber)]" : "text-[var(--color-text-faint)]"}
                    fill={h.rating ? "currentColor" : "none"}
                  />
                </button>
                <button
                  onClick={() =>
                    dispatch({ type: "SET_HISTORY", history: removeHistoryEntry(h.id) })
                  }
                  className="rounded p-0.5 text-[var(--color-danger)] opacity-0 hover:bg-[var(--color-danger)]/10 group-hover:opacity-60 group-hover:hover:opacity-100"
                >
                  <Trash2 size={10} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {compareOpen && compareA && compareB && (
        <CompareModal
          a={compareA}
          b={compareB}
          onClose={() => setCompareOpen(false)}
          onApply={(entry) => {
            dispatch({ type: "LOAD_PROMPT_STATE", prompt: entry.prompt });
            if (entry.llmOutput) {
              dispatch({ type: "LLM_DONE", output: entry.llmOutput, sourceStylePrompt: entry.stylePrompt });
            }
            if (entry.llmArrangement) {
              dispatch({ type: "ARRANGEMENT_DONE", output: entry.llmArrangement });
            }
            setCompareOpen(false);
            setCompareIds([]);
          }}
        />
      )}
    </aside>
  );
};

// --- Score-Card -----------------------------------------------------------
// Zeigt deterministischen Prompt-Score (0-100) mit Aufschluesselung und
// konkreten Verbesserungsvorschlaegen. Kein LLM-Call.
type Score = ReturnType<typeof scorePrompt>;

const scoreColor = (total: number): string => {
  if (total >= 70) return "text-[var(--color-success)]";
  if (total >= 40) return "text-[var(--color-warn)]";
  return "text-[var(--color-danger)]";
};
const scoreBarBg = (total: number): string => {
  if (total >= 70) return "bg-[var(--color-success)]";
  if (total >= 40) return "bg-[var(--color-warn)]";
  return "bg-[var(--color-danger)]";
};

// Farb-Skala pro Einzelbalken — der Nutzer soll auf einen Blick erkennen,
// wo ihm Punkte fehlen. < 40% = rot (Schwachstelle), < 75% = amber, sonst = gruen.
const barColor = (value: number, max: number): string => {
  const pct = max > 0 ? (value / max) * 100 : 0;
  if (pct >= 75) return "bg-[var(--color-success)]";
  if (pct >= 40) return "bg-[var(--color-amber)]";
  return "bg-[var(--color-danger)]";
};

// Qualitaets-Label. Leitet sich vom selben Prozentwert ab wie die Farbe,
// damit Text und Farbe konsistent sind.
const barLabel = (value: number, max: number): string => {
  const pct = max > 0 ? (value / max) * 100 : 0;
  if (pct >= 75) return "stark";
  if (pct >= 40) return "ok";
  if (pct > 0) return "schwach";
  return "fehlt";
};

const ScoreBar = ({ label, value, max }: { label: string; value: number; max: number }) => {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  const color = barColor(value, max);
  const qualityLabel = barLabel(value, max);
  return (
    <div className="flex items-center gap-2 text-[10px]">
      <span className="w-20 shrink-0 text-[var(--color-text-dim)]">{label}</span>
      <div className="h-1 flex-1 rounded-full bg-[var(--color-panel)]">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-14 shrink-0 text-right tabular-nums text-[var(--color-text-dim)]">
        {value}/{max}
      </span>
      <span
        className={`w-12 shrink-0 text-right text-[9px] uppercase tracking-wider ${
          qualityLabel === "stark"
            ? "text-[var(--color-success)]"
            : qualityLabel === "ok"
              ? "text-[var(--color-amber-dim)]"
              : "text-[var(--color-danger)]/80"
        }`}
      >
        {qualityLabel}
      </span>
    </div>
  );
};

// Penalty-Balken: zeigt die gezogenen Punkte als roter Balken relativ zu einem
// angenommenen Maximum von -25 (worst-case-stacking aus dem Score-Algorithmus).
// Gibt dem Nutzer ein Gefuehl "wie viel zieht mich runter" statt nur eine Zahl.
const PenaltyBar = ({ penalty }: { penalty: number }) => {
  const magnitude = Math.min(25, Math.abs(penalty));
  const pct = (magnitude / 25) * 100;
  return (
    <div className="flex items-center gap-2 text-[10px]">
      <span className="w-20 shrink-0 text-[var(--color-danger)]">Penalty</span>
      <div className="h-1 flex-1 rounded-full bg-[var(--color-panel)]">
        <div
          className="h-full rounded-full bg-[var(--color-danger)] transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-14 shrink-0 text-right tabular-nums text-[var(--color-danger)]">
        {penalty}
      </span>
      <span className="w-12 shrink-0 text-right text-[9px] uppercase tracking-wider text-[var(--color-danger)]/80">
        abzug
      </span>
    </div>
  );
};

const ScoreCard = ({ score, hasContent }: { score: Score; hasContent: boolean }) => {
  const [open, setOpen] = useState(true);
  if (!hasContent) return null;
  const { total, parts, hints } = score;

  return (
    <section className="overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)]">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-text)]"
      >
        <span className="flex items-center gap-2">
          <Sparkles size={12} className={scoreColor(total)} />
          Prompt Quality
        </span>
        <span className="flex items-center gap-2">
          <span className={`text-base font-bold tabular-nums ${scoreColor(total)}`}>
            {total}
            <span className="text-[10px] font-normal text-[var(--color-text-faint)]">/100</span>
          </span>
          {open ? (
            <ChevronUp size={12} className="text-[var(--color-text-dim)]" />
          ) : (
            <ChevronDown size={12} className="text-[var(--color-text-dim)]" />
          )}
        </span>
      </button>
      {open && (
        <div className="flex flex-col gap-2 border-t border-[var(--color-border)] px-3 py-2">
          {/* Top-Bar: Gesamt */}
          <div className="h-1 w-full rounded-full bg-[var(--color-panel)]">
            <div
              className={`h-full rounded-full transition-all ${scoreBarBg(total)}`}
              style={{ width: `${total}%` }}
            />
          </div>
          {/* Aufschluesselung */}
          <div className="mt-1 flex flex-col gap-1">
            <ScoreBar label="Genre" value={parts.genre} max={25} />
            <ScoreBar label="Spezifität" value={parts.specificity} max={25} />
            <ScoreBar label="Production" value={parts.production} max={20} />
            <ScoreBar label="Bonus" value={parts.bonus} max={15} />
            {parts.penalty < 0 && <PenaltyBar penalty={parts.penalty} />}
          </div>
          {/* Hints */}
          {hints.length > 0 && (
            <ul className="mt-1 flex flex-col gap-0.5 border-t border-[var(--color-border)] pt-2">
              {hints.map((h, i) => (
                <li key={i} className="text-[10px] leading-snug text-[var(--color-text-dim)]">
                  <span className="mr-1 text-[var(--color-amber-dim)]">›</span>
                  {h}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
};

// --- Arrangement-Insights-Panel ------------------------------------------
// Liest llmArrangement, leitet deterministisch Style-/Production-Suggestions ab
// und bietet zwei Aktionen:
//   (A) Suggestion Mode: Chips, die einzeln als Tags uebernommen werden.
//   (B) Refine Mode: einmaliger Style-Refine-Pass mit Insights als Feedback.
// Bewusst manuell — nichts wird stillschweigend gesetzt oder ueberschrieben.
const ArrangementInsightsPanel = () => {
  const { state, dispatch } = useStore();
  const [open, setOpen] = useState(false);
  const [refining, setRefining] = useState(false);
  const insights = useMemo(
    () => analyzeArrangement(state.llmArrangement),
    [state.llmArrangement],
  );

  if (insights.suggestions.length === 0) return null;

  const isActive = (s: { tag: string; target: "production" | "customTag" }): boolean =>
    s.target === "production"
      ? state.prompt.production.includes(s.tag)
      : (state.prompt.customTags ?? []).includes(s.tag);

  const toggleSuggestion = (s: { tag: string; target: "production" | "customTag" }) => {
    if (s.target === "production") {
      dispatch({ type: "TOGGLE_PRODUCTION", tag: s.tag });
    } else {
      dispatch({ type: "TOGGLE_CUSTOM_TAG", tag: s.tag });
    }
  };

  const applyAll = () => {
    insights.suggestions.forEach((s) => {
      if (!isActive(s)) toggleSuggestion(s);
    });
  };

  const refineWithArrangement = async () => {
    if (!state.llmOutput.trim()) return;
    const feedback = buildArrangementRefineFeedback(insights);
    if (!feedback) return;
    setRefining(true);
    try {
      await runRefinement(state, dispatch, "style", feedback);
    } finally {
      setRefining(false);
    }
  };

  return (
    <section className="overflow-hidden rounded-lg border border-sky-500/30 bg-[var(--color-bg)]">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-sky-400"
      >
        <span className="flex items-center gap-2">
          <Blocks size={12} />
          Style aus Arrangement
          <span className="rounded-full bg-sky-500/15 px-1.5 text-[10px] font-medium text-sky-400">
            {insights.suggestions.length}
          </span>
        </span>
        {open ? (
          <ChevronUp size={12} className="text-[var(--color-text-dim)]" />
        ) : (
          <ChevronDown size={12} className="text-[var(--color-text-dim)]" />
        )}
      </button>
      {open && (
        <div className="flex flex-col gap-2 border-t border-sky-500/20 px-3 py-2">
          {/* Pattern-Pills oben */}
          {insights.patterns.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {insights.patterns.map((p) => (
                <span
                  key={p}
                  className="rounded-full border border-sky-500/30 bg-sky-500/10 px-1.5 py-0 text-[9px] uppercase tracking-wider text-sky-400"
                >
                  {p}
                </span>
              ))}
            </div>
          )}

          {/* Suggestion-Chips */}
          <div className="flex flex-wrap gap-1">
            {insights.suggestions.map((s) => {
              const active = isActive(s);
              return (
                <button
                  key={s.tag}
                  onClick={() => toggleSuggestion(s)}
                  title={s.reason}
                  className={`rounded-full border px-2 py-0.5 text-[11px] transition ${
                    active
                      ? "border-sky-400 bg-sky-500/20 text-sky-300"
                      : "border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-dim)] hover:border-sky-500/40 hover:text-sky-300"
                  }`}
                >
                  {active ? "✓ " : "+ "}
                  {s.tag}
                </button>
              );
            })}
          </div>

          {/* Aktionen */}
          <div className="mt-1 flex gap-2">
            <button
              onClick={applyAll}
              className="flex-1 rounded border border-sky-500/40 bg-sky-500/10 px-2 py-1 text-[11px] text-sky-400 hover:bg-sky-500/20"
            >
              Alle übernehmen
            </button>
            <button
              onClick={refineWithArrangement}
              disabled={!state.llmOutput.trim() || refining || state.llmLoading}
              title={
                state.llmOutput.trim()
                  ? "Refined den existierenden Style mit den Arrangement-Insights als Feedback. Kostet 1 LLM-Call."
                  : "Erst KI-Ausformulierung generieren."
              }
              className="flex-1 rounded border border-sky-500/40 bg-sky-500/10 px-2 py-1 text-[11px] text-sky-400 hover:bg-sky-500/20 disabled:opacity-40"
            >
              {refining ? (
                <span className="flex items-center justify-center gap-1">
                  <Loader2 size={9} className="animate-spin" />
                  refine…
                </span>
              ) : (
                "Style refinen"
              )}
            </button>
          </div>
          <p className="text-[10px] leading-snug text-[var(--color-text-faint)]">
            Heuristisch abgeleitet aus dem Arrangement — Energie, Dynamik, Dichte.
            Form-Details bleiben drüben im Arrangement.
          </p>
        </div>
      )}
    </section>
  );
};

// --- Judge-Card -----------------------------------------------------------
// Zeigt das Resultat von runJudge (LLM-as-Judge). Score, Stärken, Schwächen,
// Verdict. Im Gegensatz zur ScoreCard ist das eine LLM-Meinung — nicht
// deterministisch, aber informativ.
import type { JudgeResult } from "@/lib/llmJudge";

const judgeColor = (score: number): string => {
  if (score >= 8) return "text-[var(--color-success)]";
  if (score >= 5) return "text-[var(--color-amber)]";
  return "text-[var(--color-danger)]";
};

const JudgeCard = ({ result }: { result: JudgeResult }) => {
  return (
    <div className="mt-2 rounded border border-[var(--color-border)] bg-[var(--color-panel)]/60 p-2">
      <div className="mb-1 flex items-center justify-between">
        <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-[var(--color-text-faint)]">
          <Gavel size={9} />
          LLM-Bewertung
        </span>
        <span className={`text-sm font-bold tabular-nums ${judgeColor(result.score)}`}>
          {result.score}/10
        </span>
      </div>
      {result.verdict && (
        <p className="mb-1.5 text-[10px] italic text-[var(--color-text-dim)]">{result.verdict}</p>
      )}
      <div className="grid grid-cols-2 gap-2 text-[10px]">
        {result.strengths.length > 0 && (
          <div>
            <span className="text-[9px] uppercase tracking-wider text-[var(--color-success-dim)]">
              Stärken
            </span>
            <ul className="mt-0.5 flex flex-col gap-0.5">
              {result.strengths.map((s, i) => (
                <li key={i} className="flex gap-1 text-[var(--color-text-dim)]">
                  <span className="text-[var(--color-success)]">+</span>
                  <span className="flex-1">{s}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {result.weaknesses.length > 0 && (
          <div>
            <span className="text-[9px] uppercase tracking-wider text-[var(--color-warn)]">
              Schwächen
            </span>
            <ul className="mt-0.5 flex flex-col gap-0.5">
              {result.weaknesses.map((w, i) => (
                <li key={i} className="flex gap-1 text-[var(--color-text-dim)]">
                  <span className="text-[var(--color-warn)]">−</span>
                  <span className="flex-1">{w}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
