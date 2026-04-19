import type { PromptState, Settings } from "@/types";
import { DEFAULT_SETTINGS } from "@/types";

const KEY_SETTINGS = "mps.settings";
const KEY_HISTORY = "mps.history";
const KEY_PRESETS = "mps.presets";
const KEY_DRAFT = "mps.draft";
const KEY_LAST_BACKUP = "mps.lastBackupAt";

export type HistoryEntry = {
  id: string;
  createdAt: string;
  stylePrompt: string;
  llmOutput?: string;
  llmArrangement?: string;
  prompt: PromptState;
  rating?: number;
  notes?: string;
  title?: string;
};

export type Preset = {
  id: string;
  name: string;
  createdAt: string;
  prompt: PromptState;
  /** Optionale Tags zum Kategorisieren/Filtern — z.B. "favorit", "trailer", "demo". */
  tags?: string[];
};

const safeRead = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const safeWrite = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn("localStorage write failed", e);
  }
};

export const loadSettings = (): Settings | null => safeRead<Settings | null>(KEY_SETTINGS, null);
export const saveSettings = (s: Settings) => safeWrite(KEY_SETTINGS, s);

export const loadHistory = (): HistoryEntry[] => safeRead<HistoryEntry[]>(KEY_HISTORY, []);
export const saveHistory = (h: HistoryEntry[]) => safeWrite(KEY_HISTORY, h);

export const loadPresets = (): Preset[] => safeRead<Preset[]>(KEY_PRESETS, []);
export const savePresets = (p: Preset[]) => safeWrite(KEY_PRESETS, p);

export const loadDraft = (): PromptState | null => safeRead<PromptState | null>(KEY_DRAFT, null);
export const saveDraft = (p: PromptState) => safeWrite(KEY_DRAFT, p);

export const addHistoryEntry = (entry: HistoryEntry): HistoryEntry[] => {
  const current = loadHistory();
  const next = [entry, ...current].slice(0, 100);
  saveHistory(next);
  return next;
};

export const updateHistoryEntry = (id: string, patch: Partial<HistoryEntry>): HistoryEntry[] => {
  const current = loadHistory();
  const next = current.map((e) => (e.id === id ? { ...e, ...patch } : e));
  saveHistory(next);
  return next;
};

export const removeHistoryEntry = (id: string): HistoryEntry[] => {
  const current = loadHistory();
  const next = current.filter((e) => e.id !== id);
  saveHistory(next);
  return next;
};

export const addPreset = (preset: Preset): Preset[] => {
  const current = loadPresets();
  const next = [preset, ...current].slice(0, 50);
  savePresets(next);
  return next;
};

export const removePreset = (id: string): Preset[] => {
  const current = loadPresets();
  const next = current.filter((p) => p.id !== id);
  savePresets(next);
  return next;
};

export const CURRENT_EXPORT_VERSION = 4;

// Bundle-Export. v4: enthaelt zusaetzlich alle LLM-Outputs sowie optional
// die Settings (zur Reproduzierbarkeit). Settings werden beim Import bewusst
// IGNORIERT (sonst koennte ein fremder Export die Modell-Konfig ueberschreiben);
// der Nutzer kann sie manuell in den Settings uebernehmen.
export type ExportBundle = {
  prompt: PromptState;
  title?: string;
  llmOutput?: string;
  llmArrangement?: string;
  llmVariants?: Record<string, string>;
  llmTitles?: string[];
  settings?: Settings;
  exported_at: string;
  version: number;
};

export const exportState = (data: {
  prompt: PromptState;
  title?: string;
  llmOutput?: string;
  llmArrangement?: string;
  llmVariants?: Record<string, string>;
  llmTitles?: string[];
  settings?: Settings;
}): string => {
  const bundle: ExportBundle = {
    prompt: data.prompt,
    title: data.title,
    // Nur befuellte LLM-Felder mit aufnehmen — sonst clutter im JSON.
    ...(data.llmOutput?.trim() ? { llmOutput: data.llmOutput } : {}),
    ...(data.llmArrangement?.trim() ? { llmArrangement: data.llmArrangement } : {}),
    ...(data.llmVariants && Object.values(data.llmVariants).some(Boolean)
      ? { llmVariants: data.llmVariants }
      : {}),
    ...(data.llmTitles && data.llmTitles.length > 0 ? { llmTitles: data.llmTitles } : {}),
    ...(data.settings ? { settings: data.settings } : {}),
    exported_at: new Date().toISOString(),
    version: CURRENT_EXPORT_VERSION,
  };
  return JSON.stringify(bundle, null, 2);
};

// Migriert importierte PromptState-Daten auf das aktuelle Schema.
// v1/v2 hatten evtl. `genre` (deprecated) und `structure` (tot) — beides wird weggeworfen.
// Fehlende neuere Felder (vocalLanguages, secondaryGenre, soundsLike*, customTags) werden gesetzt.
export const migratePromptState = (raw: unknown): PromptState => {
  const base: PromptState = {
    moods: [],
    instruments: [],
    production: [],
    customTags: [],
    negatives: [],
    vocalLanguages: [],
    lyrics: "",
    title: "",
  };
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Record<string, unknown>;
  const arr = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x) => typeof x === "string") as string[] : []);
  const str = (v: unknown): string => (typeof v === "string" ? v : "");
  const optStr = (v: unknown): string | undefined => (typeof v === "string" && v ? v : undefined);
  const optNum = (v: unknown): number | undefined => (typeof v === "number" ? v : undefined);
  return {
    ...base,
    mainGenre: optStr(r.mainGenre),
    subgenre: optStr(r.subgenre),
    secondaryGenre: optStr(r.secondaryGenre),
    soundsLike: optStr(r.soundsLike),
    soundsLikeDescription: optStr(r.soundsLikeDescription),
    moods: arr(r.moods),
    bpm: optNum(r.bpm),
    vocalCharacter: optStr(r.vocalCharacter),
    vocalDelivery: optStr(r.vocalDelivery),
    vocalEffects: optStr(r.vocalEffects),
    vocalLanguages: arr(r.vocalLanguages),
    instruments: arr(r.instruments),
    production: arr(r.production),
    customTags: arr(r.customTags),
    negatives: arr(r.negatives),
    lyrics: str(r.lyrics),
    title: str(r.title),
  };
};

// --- Full Backup & Restore ----------------------------------------------
// Sichert ALLES was im localStorage liegt: settings + history + presets + draft.
// Im Gegensatz zum exportState() (v4-Bundle, einzelner Prompt) ist das hier
// fuer Disaster-Recovery: localStorage-Reset, neuer Browser, Inkognito, etc.

export const FULL_BACKUP_VERSION = 1;

export type FullBackup = {
  type: "mps-full-backup";
  version: number;
  exported_at: string;
  settings: Settings;
  history: HistoryEntry[];
  presets: Preset[];
  draft: PromptState | null;
};

export const buildFullBackup = (): FullBackup => ({
  type: "mps-full-backup",
  version: FULL_BACKUP_VERSION,
  exported_at: new Date().toISOString(),
  // Fallback auf DEFAULT_SETTINGS statt {} — sonst verliert ein Import auf einem
  // anderen Geraet alle Defaults, weil writeFullBackupToStorage zwar das leere
  // Objekt skippt, ein Backup ohne Settings aber intransparent ist.
  settings: loadSettings() ?? DEFAULT_SETTINGS,
  history: loadHistory(),
  presets: loadPresets(),
  draft: loadDraft(),
});

export const exportFullBackup = (): string =>
  JSON.stringify(buildFullBackup(), null, 2);

// Defensives Parsing: nimmt was strukturell wie ein FullBackup aussieht,
// fehlende Felder werden als leer interpretiert. Falscher type → null,
// damit das UI "ungueltige Datei" sagen kann.
export const parseFullBackup = (text: string): FullBackup | null => {
  try {
    const obj = JSON.parse(text);
    if (!obj || typeof obj !== "object") return null;
    if (obj.type !== "mps-full-backup") return null;
    return {
      type: "mps-full-backup",
      version: typeof obj.version === "number" ? obj.version : 0,
      exported_at: typeof obj.exported_at === "string" ? obj.exported_at : "",
      settings: obj.settings && typeof obj.settings === "object"
        ? (obj.settings as Settings)
        : ({} as Settings),
      history: Array.isArray(obj.history) ? (obj.history as HistoryEntry[]) : [],
      presets: Array.isArray(obj.presets) ? (obj.presets as Preset[]) : [],
      draft: obj.draft && typeof obj.draft === "object"
        ? migratePromptState(obj.draft)
        : null,
    };
  } catch {
    return null;
  }
};

export type RestoreOptions = {
  settings: boolean;
  history: boolean;
  presets: boolean;
  draft: boolean;
};

// Schreibt selektiv in localStorage. Returnt was wirklich angewandt wurde,
// damit das UI korrekten Status melden kann. WICHTIG: dispatcht NICHTS —
// der Caller muss den Store-State separat reload-en (Page-Reload oder
// gezielte Dispatches), sonst bleibt die App out-of-sync.
export const writeFullBackupToStorage = (
  backup: FullBackup,
  options: RestoreOptions,
): RestoreOptions => {
  const applied: RestoreOptions = { settings: false, history: false, presets: false, draft: false };
  if (options.settings && backup.settings && Object.keys(backup.settings).length > 0) {
    saveSettings(backup.settings);
    applied.settings = true;
  }
  if (options.history) {
    saveHistory(backup.history);
    applied.history = true;
  }
  if (options.presets) {
    savePresets(backup.presets);
    applied.presets = true;
  }
  if (options.draft && backup.draft) {
    saveDraft(backup.draft);
    applied.draft = true;
  }
  return applied;
};

// --- Last-Backup-Timestamp ----------------------------------------------
// Wird beim Export gesetzt; UI zeigt "vor X Tagen" und bei >7 Tagen einen
// dezenten Reminder im Settings-Panel.

export const getLastBackupAt = (): string | null => {
  try {
    return localStorage.getItem(KEY_LAST_BACKUP);
  } catch {
    return null;
  }
};

export const setLastBackupAt = (iso = new Date().toISOString()): void => {
  try {
    localStorage.setItem(KEY_LAST_BACKUP, iso);
  } catch (e) {
    console.warn("lastBackupAt write failed", e);
  }
};

/** Tage seit letztem Backup (gerundet). null wenn noch nie gesichert. */
export const daysSinceLastBackup = (): number | null => {
  const iso = getLastBackupAt();
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;
  const diffMs = Date.now() - then;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
};
