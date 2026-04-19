import { useEffect, useState } from "react";
import { X, CheckCircle2, XCircle, Loader2, Download, Upload, Database, AlertCircle } from "lucide-react";
import { useStore } from "@/store";
import { listModels, ping, type OllamaModel } from "@/lib/ollama";
import {
  daysSinceLastBackup,
  exportFullBackup,
  parseFullBackup,
  setLastBackupAt,
  writeFullBackupToStorage,
  type FullBackup,
  type RestoreOptions,
} from "@/lib/persistence";

export const SettingsPanel = () => {
  const { state, dispatch } = useStore();
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [status, setStatus] = useState<"idle" | "checking" | "online" | "offline">("idle");
  const [error, setError] = useState<string | null>(null);
  // Backup/Restore-Workflow
  const [pendingBackup, setPendingBackup] = useState<FullBackup | null>(null);
  const [restoreOptions, setRestoreOptions] = useState<RestoreOptions>({
    settings: true, history: true, presets: true, draft: true,
  });
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [restoreStatus, setRestoreStatus] = useState<string | null>(null);
  // Re-render-Trigger fuer "vor X Tagen"-Anzeige nach Backup-Klick
  const [backupTick, setBackupTick] = useState(0);
  const daysSince = daysSinceLastBackup();
  void backupTick; // Lint-Hint: backupTick treibt nur den Re-Render

  const downloadBackup = () => {
    const json = exportFullBackup();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    a.href = url;
    a.download = `mps-backup-${stamp}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setLastBackupAt();
    setBackupTick((n) => n + 1);
    setRestoreStatus("Backup heruntergeladen.");
    // Auto-Clear uebernimmt der useEffect unten — kein freier setTimeout, der
    // bei Unmount (Modal geschlossen) noch auf unmounted Component feuert.
  };

  // Erfolgs-/Status-Banner nach 3s ausblenden, mit Cleanup bei Unmount.
  useEffect(() => {
    if (!restoreStatus) return;
    const id = setTimeout(() => setRestoreStatus(null), 3000);
    return () => clearTimeout(id);
  }, [restoreStatus]);

  const pickBackupFile = () => {
    setRestoreError(null);
    setRestoreStatus(null);
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const parsed = parseFullBackup(text);
        if (!parsed) {
          setRestoreError("Datei ist kein gueltiges Full-Backup (mps-full-backup).");
          setPendingBackup(null);
          return;
        }
        setPendingBackup(parsed);
        // Default: Settings deaktiviert lassen koennte sicherer sein, aber
        // wenn der User explizit ein Backup importiert, will er meistens alles.
        setRestoreOptions({ settings: true, history: true, presets: true, draft: !!parsed.draft });
      } catch (e) {
        setRestoreError(e instanceof Error ? e.message : "Datei konnte nicht gelesen werden.");
        setPendingBackup(null);
      }
    };
    input.click();
  };

  const applyRestore = () => {
    if (!pendingBackup) return;
    const applied = writeFullBackupToStorage(pendingBackup, restoreOptions);

    // Store-State synchronisieren — sonst sieht der User trotz erfolgreichem
    // Schreiben in localStorage seine alte UI bis zum naechsten Reload.
    if (applied.settings) {
      dispatch({ type: "SET_SETTINGS", settings: pendingBackup.settings });
    }
    if (applied.history) {
      dispatch({ type: "SET_HISTORY", history: pendingBackup.history });
    }
    if (applied.presets) {
      dispatch({ type: "SET_PRESETS", presets: pendingBackup.presets });
    }
    if (applied.draft && pendingBackup.draft) {
      dispatch({ type: "LOAD_PROMPT_STATE", prompt: pendingBackup.draft });
    }

    const parts: string[] = [];
    if (applied.settings) parts.push("Settings");
    if (applied.history) parts.push(`${pendingBackup.history.length} History-Einträge`);
    if (applied.presets) parts.push(`${pendingBackup.presets.length} Presets`);
    if (applied.draft) parts.push("Draft");
    setRestoreStatus(parts.length > 0 ? `Restored: ${parts.join(", ")}` : "Nichts uebernommen.");
    setPendingBackup(null);
  };

  const cancelRestore = () => {
    setPendingBackup(null);
    setRestoreError(null);
  };

  useEffect(() => {
    if (!state.settingsOpen) return;
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.settingsOpen]);

  const refresh = async () => {
    setStatus("checking");
    setError(null);
    try {
      const online = await ping(state.settings.ollamaUrl);
      if (!online) {
        setStatus("offline");
        return;
      }
      const m = await listModels(state.settings.ollamaUrl);
      setModels(m);
      setStatus("online");
    } catch (e) {
      setStatus("offline");
      setError(e instanceof Error ? e.message : "Unbekannter Fehler");
    }
  };

  if (!state.settingsOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={() => dispatch({ type: "TOGGLE_SETTINGS" })}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)]/85 shadow-2xl backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex shrink-0 items-center justify-between border-b border-[var(--color-border)] px-5 py-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--color-text)]">
            Einstellungen
          </h2>
          <button
            onClick={() => dispatch({ type: "TOGGLE_SETTINGS" })}
            className="rounded-full p-1.5 text-[var(--color-text-dim)] hover:bg-[var(--color-panel-hover)] hover:text-[var(--color-text)]"
          >
            <X size={16} />
          </button>
        </header>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
          <section className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-amber)]">
                Ollama-Endpoint
              </label>
              <StatusPill status={status} />
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={state.settings.ollamaUrl}
                onChange={(e) =>
                  dispatch({ type: "SET_SETTINGS", settings: { ollamaUrl: e.target.value } })
                }
                placeholder="http://localhost:11434"
                className="flex-1 rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] focus:border-[var(--color-amber-dim)] focus:outline-none"
              />
              <button
                onClick={refresh}
                className="rounded border border-[var(--color-amber-dim)] bg-[var(--color-amber)]/10 px-3 py-2 text-xs text-[var(--color-amber)] hover:bg-[var(--color-amber)]/20"
              >
                Testen
              </button>
            </div>
            {error && (
              <p className="text-xs text-[var(--color-danger)]">
                {error}
              </p>
            )}
          </section>

          <section className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-amber)]">
              Modell ({models.length} verfügbar)
            </label>
            <select
              value={state.settings.ollamaModel}
              onChange={(e) =>
                dispatch({ type: "SET_SETTINGS", settings: { ollamaModel: e.target.value } })
              }
              className="rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] focus:border-[var(--color-amber-dim)] focus:outline-none"
            >
              {models.length === 0 && (
                <option value={state.settings.ollamaModel}>{state.settings.ollamaModel}</option>
              )}
              {models.map((m) => (
                <option key={m.name} value={m.name}>
                  {m.name}
                  {m.details?.parameter_size ? ` · ${m.details.parameter_size}` : ""}
                  {m.details?.family ? ` · ${m.details.family}` : ""}
                </option>
              ))}
            </select>
            <div className="mt-1 rounded border border-[var(--color-border)] bg-[var(--color-bg)]/40 p-2 text-[10px] leading-relaxed text-[var(--color-text-dim)]">
              <p className="mb-1 font-semibold uppercase tracking-wider text-[var(--color-amber-dim)]">
                Modell-Empfehlung fuer Songtexte
              </p>
              <ul className="flex flex-col gap-0.5">
                <li>Deutsch / andere Sprachen: <code className="text-[var(--color-text)]">qwen2.5:14b</code> oder hoeher. Gemma 2/3 8B ist auf Deutsch schwach (Grammatik, Reime).</li>
                <li>Englisch: <code className="text-[var(--color-text)]">llama3.1:8b</code> oder <code className="text-[var(--color-text)]">qwen2.5:7b</code> reichen fuer solide Ergebnisse.</li>
                <li>Style-/Arrangement-Prompts: alle 7B+-Modelle okay.</li>
              </ul>
            </div>
          </section>

          {/* --- Cloud-Fallback ------------------------------------------- */}
          <section className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-amber)]">
              Cloud-Fallback (optional)
            </label>
            <p className="text-[10px] leading-snug text-[var(--color-text-faint)]">
              Wenn Ollama offline ist, kann ein Cloud-Provider einspringen. Key wird
              NUR im Browser (localStorage) gespeichert — nichts geht an Dritte ausser
              den Provider selbst.
            </p>
            <div className="grid grid-cols-3 gap-1">
              {(
                [
                  { id: "none", label: "Keiner" },
                  { id: "anthropic", label: "Claude" },
                  { id: "openai", label: "OpenAI" },
                ] as const
              ).map((p) => (
                <button
                  key={p.id}
                  onClick={() =>
                    dispatch({ type: "SET_SETTINGS", settings: { cloudProvider: p.id } })
                  }
                  className={`rounded border px-2 py-1 text-[10px] transition ${
                    state.settings.cloudProvider === p.id
                      ? "border-[var(--color-amber)] bg-[var(--color-amber)]/15 text-[var(--color-amber)]"
                      : "border-[var(--color-border)] text-[var(--color-text-dim)] hover:text-[var(--color-text)]"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            {state.settings.cloudProvider !== "none" && (
              <>
                <input
                  type="password"
                  value={state.settings.cloudApiKey}
                  onChange={(e) =>
                    dispatch({
                      type: "SET_SETTINGS",
                      settings: { cloudApiKey: e.target.value },
                    })
                  }
                  placeholder={
                    state.settings.cloudProvider === "anthropic"
                      ? "sk-ant-..."
                      : "sk-..."
                  }
                  className="rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1 text-[11px] text-[var(--color-text)] focus:border-[var(--color-amber-dim)] focus:outline-none"
                />
                <input
                  type="text"
                  value={state.settings.cloudModel}
                  onChange={(e) =>
                    dispatch({
                      type: "SET_SETTINGS",
                      settings: { cloudModel: e.target.value },
                    })
                  }
                  placeholder={
                    state.settings.cloudProvider === "anthropic"
                      ? "claude-haiku-4-5-20251001 (default)"
                      : "gpt-4o-mini (default)"
                  }
                  className="rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1 text-[10px] text-[var(--color-text)] focus:border-[var(--color-amber-dim)] focus:outline-none"
                />
              </>
            )}
          </section>

          {/* --- Erscheinungsbild ----------------------------------------- */}
          <section className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-amber)]">
              Erscheinungsbild
            </label>

            {/* Theme-Toggle */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-[var(--color-text-dim)]">Modus</span>
              <div className="grid grid-cols-2 gap-1">
                {(["dark", "light"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => dispatch({ type: "SET_SETTINGS", settings: { theme: t } })}
                    className={`rounded border px-3 py-1 text-[10px] transition ${
                      state.settings.theme === t
                        ? "border-[var(--color-amber)] bg-[var(--color-amber)]/15 text-[var(--color-amber)]"
                        : "border-[var(--color-border)] text-[var(--color-text-dim)] hover:text-[var(--color-text)]"
                    }`}
                  >
                    {t === "dark" ? "🌙 Dunkel" : "☀ Hell"}
                  </button>
                ))}
              </div>
            </div>

            {/* Background-Variant */}
            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-[var(--color-text-dim)]">Hintergrund-Animation</span>
              <div className="grid grid-cols-5 gap-1">
                {(
                  [
                    { id: "network", label: "Netzwerk" },
                    { id: "liquid", label: "Liquid" },
                    { id: "stream", label: "Stream" },
                    { id: "aurora", label: "Aurora" },
                    { id: "off", label: "Aus" },
                  ] as const
                ).map((v) => (
                  <button
                    key={v.id}
                    onClick={() =>
                      dispatch({ type: "SET_SETTINGS", settings: { backgroundVariant: v.id } })
                    }
                    className={`rounded border px-2 py-1 text-[10px] transition ${
                      state.settings.backgroundVariant === v.id
                        ? "border-[var(--color-amber)] bg-[var(--color-amber)]/15 text-[var(--color-amber)]"
                        : "border-[var(--color-border)] text-[var(--color-text-dim)] hover:text-[var(--color-text)]"
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-[var(--color-text-faint)]">
                Rein visuell — beeinflusst keine Generierung. „Aus" zeigt nur eine statische Grundflaeche.
              </p>
            </div>
          </section>

          <section className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-amber)]">
              Kreativitaetsmodus
            </label>
            <div className="grid grid-cols-4 gap-1">
              {(["conservative", "balanced", "creative", "wild"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => dispatch({ type: "SET_SETTINGS", settings: { creativityMode: m } })}
                  className={`rounded border px-2 py-1 text-[10px] transition ${
                    state.settings.creativityMode === m
                      ? "border-[var(--color-amber)] bg-[var(--color-amber)]/15 text-[var(--color-amber)]"
                      : "border-[var(--color-border)] text-[var(--color-text-dim)] hover:text-[var(--color-text)]"
                  }`}
                >
                  {m === "conservative" ? "konservativ" : m === "balanced" ? "balanced" : m === "creative" ? "kreativ" : "wild"}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-[var(--color-text-faint)]">
              Automatische Temperatur pro Task: Style niedrig, Lyrics hoch, Kritik deterministisch.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-amber)]">
              Arrangement-Laenge
            </label>
            <div className="grid grid-cols-3 gap-1">
              {(["short", "standard", "epic"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => dispatch({ type: "SET_SETTINGS", settings: { arrangementLength: l } })}
                  className={`rounded border px-2 py-1 text-[10px] transition ${
                    state.settings.arrangementLength === l
                      ? "border-sky-500 bg-sky-500/15 text-sky-400"
                      : "border-[var(--color-border)] text-[var(--color-text-dim)] hover:text-[var(--color-text)]"
                  }`}
                >
                  {l === "short" ? "kurz 1.5-2.5 min" : l === "standard" ? "standard 3-4 min" : "episch 4-6+ min"}
                </button>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-amber)]">
              Qualitaets-Gates
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-[11px] text-[var(--color-text-dim)]">
              <input
                type="checkbox"
                checked={state.settings.autoRetryOnCliche}
                onChange={(e) =>
                  dispatch({ type: "SET_SETTINGS", settings: { autoRetryOnCliche: e.target.checked } })
                }
                className="accent-[var(--color-amber)]"
              />
              Auto-Retry bei Klischees (Lyrics) — kostet 1 extra LLM-Call
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-[11px] text-[var(--color-text-dim)]">
              <input
                type="checkbox"
                checked={state.settings.selfCritiqueLyrics}
                onChange={(e) =>
                  dispatch({ type: "SET_SETTINGS", settings: { selfCritiqueLyrics: e.target.checked } })
                }
                className="accent-[var(--color-amber)]"
              />
              Self-Critique (Lyrics) — zweiter Pass schreibt schwache Zeilen neu
            </label>
            <div className="mt-1 flex flex-col gap-1 rounded border border-[var(--color-border)] bg-[var(--color-bg)]/40 p-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[var(--color-text-dim)]">
                  Auto-Refine Style bei Score &lt;
                </span>
                <span className="tabular-nums text-[var(--color-amber)]">
                  {state.settings.autoRefineMinScore === 0
                    ? "aus"
                    : `${state.settings.autoRefineMinScore}/100`}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={state.settings.autoRefineMinScore}
                onChange={(e) =>
                  dispatch({
                    type: "SET_SETTINGS",
                    settings: { autoRefineMinScore: Number(e.target.value) },
                  })
                }
                className="accent-[var(--color-amber)]"
              />
              <p className="text-[10px] leading-snug text-[var(--color-text-faint)]">
                Nach Style-Generierung wird der Score geprüft. Liegt er unter dem Schwellenwert,
                folgt automatisch ein Refinement-Pass mit den Hints als Feedback. Empfehlung 50–70.
                Kostet 1 zusätzlichen LLM-Call.
              </p>
            </div>
          </section>

          <section className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-amber)]">
              Model-Routing (optional)
            </label>
            <p className="text-[10px] text-[var(--color-text-faint)]">
              Leer lassen = Hauptmodell nutzen. Separates Modell z.B. fuer Lyrics, wenn dein Haupt schwach auf Deutsch ist.
            </p>
            {(
              [
                ["modelStyle", "Style / Ausformulierung"],
                ["modelArrangement", "Arrangement"],
                ["modelLyrics", "Lyrics"],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="flex items-center gap-2">
                <span className="w-32 shrink-0 text-[10px] text-[var(--color-text-dim)]">{label}</span>
                <select
                  value={state.settings[key] ?? ""}
                  onChange={(e) =>
                    dispatch({
                      type: "SET_SETTINGS",
                      settings: { [key]: e.target.value || undefined } as never,
                    })
                  }
                  className="flex-1 rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1 text-[11px] text-[var(--color-text)]"
                >
                  <option value="">— Hauptmodell —</option>
                  {models.map((m) => (
                    <option key={m.name} value={m.name}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </section>

          <section className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-amber)]">
                Temperature (Legacy-Slider — durch Kreativitaetsmodus ueberlagert)
              </label>
              <span className="text-xs tabular-nums text-[var(--color-text-dim)]">
                {state.settings.temperature.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={1.5}
              step={0.05}
              value={state.settings.temperature}
              onChange={(e) =>
                dispatch({
                  type: "SET_SETTINGS",
                  settings: { temperature: Number(e.target.value) },
                })
              }
              className="accent-[var(--color-amber)]"
            />
          </section>

          {/* --- Backup & Restore ---------------------------------------- */}
          <section className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-amber)]">
              <Database size={12} />
              Backup & Restore
            </label>
            <p className="text-[10px] text-[var(--color-text-faint)]">
              Sichert Settings, History, Presets und aktuellen Draft als JSON-Datei.
              Lokal gespeicherte Daten gehen sonst bei Browser-Reset verloren.
            </p>

            {/* Last-Backup-Anzeige + Soft-Reminder */}
            <BackupStatusLine days={daysSince} />

            {/* Auto-Backup-Intervall */}
            <div className="flex items-center justify-between gap-2 rounded border border-[var(--color-border)] bg-[var(--color-bg)]/40 px-2 py-1.5 text-[11px]">
              <span className="text-[var(--color-text-dim)]">Auto-Backup</span>
              <select
                value={state.settings.autoBackupDays}
                onChange={(e) =>
                  dispatch({
                    type: "SET_SETTINGS",
                    settings: { autoBackupDays: Number(e.target.value) },
                  })
                }
                className="rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-1.5 py-0.5 text-[10px] text-[var(--color-text)]"
              >
                <option value={0}>aus</option>
                <option value={7}>alle 7 Tage</option>
                <option value={14}>alle 14 Tage</option>
                <option value={30}>alle 30 Tage</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={downloadBackup}
                className="flex flex-1 items-center justify-center gap-1.5 rounded border border-[var(--color-amber-dim)] bg-[var(--color-amber)]/10 px-3 py-1.5 text-[11px] text-[var(--color-amber)] hover:bg-[var(--color-amber)]/20"
              >
                <Download size={11} />
                Backup erstellen
              </button>
              <button
                onClick={pickBackupFile}
                className="flex flex-1 items-center justify-center gap-1.5 rounded border border-[var(--color-border)] px-3 py-1.5 text-[11px] text-[var(--color-text-dim)] hover:text-[var(--color-text)]"
              >
                <Upload size={11} />
                Restore aus Datei
              </button>
            </div>

            {restoreError && (
              <p className="rounded border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 px-2 py-1 text-[10px] text-[var(--color-danger)]">
                {restoreError}
              </p>
            )}

            {restoreStatus && !pendingBackup && (
              <p className="rounded border border-[var(--color-success)]/30 bg-[var(--color-success)]/5 px-2 py-1 text-[10px] text-[var(--color-success)]">
                ✓ {restoreStatus}
              </p>
            )}

            {/* Inline-Restore-Panel */}
            {pendingBackup && (
              <div className="flex flex-col gap-2 rounded border border-[var(--color-amber-dim)]/40 bg-[var(--color-amber)]/5 p-3">
                <p className="text-[11px] text-[var(--color-text)]">
                  <span className="font-semibold text-[var(--color-amber)]">Backup erkannt</span>
                  {pendingBackup.exported_at && (
                    <span className="text-[var(--color-text-dim)]">
                      {" — vom "}
                      {new Date(pendingBackup.exported_at).toLocaleString("de-DE", {
                        dateStyle: "short", timeStyle: "short",
                      })}
                    </span>
                  )}
                </p>
                <div className="flex flex-col gap-1">
                  <RestoreCheckbox
                    label={`Settings ${Object.keys(pendingBackup.settings).length === 0 ? "(leer im Backup)" : ""}`}
                    checked={restoreOptions.settings}
                    disabled={Object.keys(pendingBackup.settings).length === 0}
                    onChange={(v) => setRestoreOptions((o) => ({ ...o, settings: v }))}
                  />
                  <RestoreCheckbox
                    label={`History (${pendingBackup.history.length} Einträge)`}
                    checked={restoreOptions.history}
                    onChange={(v) => setRestoreOptions((o) => ({ ...o, history: v }))}
                  />
                  <RestoreCheckbox
                    label={`Presets (${pendingBackup.presets.length} Einträge)`}
                    checked={restoreOptions.presets}
                    onChange={(v) => setRestoreOptions((o) => ({ ...o, presets: v }))}
                  />
                  <RestoreCheckbox
                    label={`Draft ${!pendingBackup.draft ? "(kein Draft im Backup)" : ""}`}
                    checked={restoreOptions.draft}
                    disabled={!pendingBackup.draft}
                    onChange={(v) => setRestoreOptions((o) => ({ ...o, draft: v }))}
                  />
                </div>
                <p className="text-[10px] text-[var(--color-text-faint)]">
                  Aktivierte Bereiche überschreiben den aktuellen Zustand. Nicht gewählte
                  Bereiche bleiben unangetastet.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={applyRestore}
                    className="flex-1 rounded border border-[var(--color-amber)] bg-[var(--color-amber)]/15 px-3 py-1 text-[11px] font-medium text-[var(--color-amber)] hover:bg-[var(--color-amber)]/25"
                  >
                    Übernehmen
                  </button>
                  <button
                    onClick={cancelRestore}
                    className="flex-1 rounded border border-[var(--color-border)] px-3 py-1 text-[11px] text-[var(--color-text-dim)] hover:text-[var(--color-text)]"
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            )}
          </section>

          <p className="rounded border border-[var(--color-border)] bg-[var(--color-bg)] p-3 text-[11px] text-[var(--color-text-dim)]">
            <span className="font-semibold text-[var(--color-amber)]">Hinweis:</span> Ollama läuft
            lokal — kein Cloud-API, keine Kosten. Start:{" "}
            <code className="rounded bg-[var(--color-panel)] px-1 text-[var(--color-text)]">ollama serve</code>{" "}
            in einer Shell.
          </p>
        </div>
      </div>
    </div>
  );
};

// --- Helper-Komponenten fuer Backup-UI -----------------------------------

const BackupStatusLine = ({ days }: { days: number | null }) => {
  if (days === null) {
    return (
      <div className="flex items-center gap-1.5 rounded border border-[var(--color-warn)]/30 bg-[var(--color-warn)]/5 px-2 py-1 text-[10px] text-[var(--color-warn)]">
        <AlertCircle size={10} />
        Noch kein Backup erstellt — empfohlen
      </div>
    );
  }
  const label =
    days === 0 ? "heute" : days === 1 ? "gestern" : `vor ${days} Tagen`;
  if (days >= 7) {
    return (
      <div className="flex items-center gap-1.5 rounded border border-[var(--color-warn)]/30 bg-[var(--color-warn)]/5 px-2 py-1 text-[10px] text-[var(--color-warn)]">
        <AlertCircle size={10} />
        Letztes Backup {label} — neues empfohlen
      </div>
    );
  }
  return (
    <div className="text-[10px] text-[var(--color-text-faint)]">
      Letztes Backup: {label}
    </div>
  );
};

type RestoreCheckboxProps = {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
};

const RestoreCheckbox = ({ label, checked, disabled, onChange }: RestoreCheckboxProps) => (
  <label
    className={`flex cursor-pointer items-center gap-2 text-[11px] ${
      disabled ? "cursor-not-allowed text-[var(--color-text-faint)]" : "text-[var(--color-text-dim)]"
    }`}
  >
    <input
      type="checkbox"
      checked={checked && !disabled}
      disabled={disabled}
      onChange={(e) => onChange(e.target.checked)}
      className="accent-[var(--color-amber)]"
    />
    {label}
  </label>
);

const StatusPill = ({ status }: { status: "idle" | "checking" | "online" | "offline" }) => {
  const cfg = {
    idle: { icon: null, label: "–", cls: "text-[var(--color-text-faint)] border-[var(--color-border)]" },
    checking: { icon: <Loader2 size={10} className="animate-spin" />, label: "prüfe", cls: "text-[var(--color-text-dim)] border-[var(--color-border)]" },
    online: { icon: <CheckCircle2 size={10} />, label: "online", cls: "text-[var(--color-success)] border-[var(--color-success)]/30 bg-[var(--color-success)]/10" },
    offline: { icon: <XCircle size={10} />, label: "offline", cls: "text-[var(--color-danger)] border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10" },
  }[status];

  return (
    <span className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] ${cfg.cls}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
};
