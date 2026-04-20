export type Genre = {
  id: string;
  name: string;
  bpm_min: number;
  bpm_max: number;
  keywords: string[];
  instruments: string[];
  vocal_default: string;
  production: string;
};

export type Template = {
  id: string;
  name: string;
  genre: string;
  style_prompt: string;
  bpm: number;
  explanation: string;
};

export type MoodGroup =
  | "uplifting"
  | "melancholic"
  | "dark"
  | "calm"
  | "aggressive"
  | "romantic"
  | "cinematic";

export type MoodsData = {
  groups: Record<MoodGroup, string[]>;
  conflict_pairs: [string, string][];
};

export type PromptState = {
  mainGenre?: string;
  subgenre?: string;
  secondaryGenre?: string;
  soundsLike?: string;
  soundsLikeDescription?: string;
  moods: string[];
  bpm?: number;
  vocalCharacter?: string;
  vocalDelivery?: string;
  vocalEffects?: string;
  vocalLanguages: string[];
  instruments: string[];
  production: string[];
  customTags: string[];
  negatives: string[];
  lyrics: string;
  title: string;
  // Optionaler Seed-Text, der am Anfang des Roh-Style-Prompts steht. Wird vom
  // "Aus Idee"-Flow gesetzt, damit das KI-Ergebnis als Basis sichtbar ist und
  // der User Section-Auswahlen drumherum haengen kann.
  customStylePrompt?: string;
};

export type ValidationIssue = {
  severity: "warn" | "error" | "info";
  message: string;
  field?: string;
};

export type PromptScore = {
  total: number; // 0-100, clamped
  parts: {
    genre: number;       // 0-25
    specificity: number; // 0-25
    production: number;  // 0-20
    bonus: number;       // 0-15
    penalty: number;     // <=0
  };
  hints: string[]; // konkrete Verbesserungsvorschlaege, sortiert nach Impact
};

export type CreativityMode = "conservative" | "balanced" | "creative" | "wild";
export type ArrangementLength = "short" | "standard" | "epic";

export type BackgroundVariant = "network" | "liquid" | "stream" | "aurora" | "off";
export type ThemeMode = "dark" | "light";
export type PromptTarget = "suno" | "udio";
export type CloudProvider = "none" | "anthropic" | "openai";

export type Settings = {
  ollamaUrl: string;
  ollamaModel: string;
  // Optional: spezifische Modelle pro Task. Wenn leer, wird ollamaModel genutzt.
  modelLyrics?: string;
  modelArrangement?: string;
  modelStyle?: string;
  temperature: number;
  creativityMode: CreativityMode;
  arrangementLength: ArrangementLength;
  // Auto-Retry: Wenn Output Klischee-Phrasen enthaelt, einmal automatisch regenerieren.
  autoRetryOnCliche: boolean;
  // Self-Critique: nach Lyrics-Gen zweiter Pass zur Qualitaetspruefung.
  selfCritiqueLyrics: boolean;
  // Auto-Refine: nach Style-LLM-Call wird der Score geprueft. Liegt er unter
  // diesem Schwellenwert, wird einmal automatisch mit den Hints als Feedback
  // refined. 0 = aus. Sinnvoller Bereich: 50-70.
  autoRefineMinScore: number;
  // Auto-Backup-Intervall in Tagen. 0 = aus, sonst wird bei App-Start
  // automatisch ein Backup runtergeladen wenn letztes > N Tage alt ist.
  autoBackupDays: number;
  // Animierter Hintergrund — User kann Stil oder komplett deaktivieren.
  backgroundVariant: BackgroundVariant;
  // Theme-Modus — wirkt auf body-class, CSS-Variables swappen.
  theme: ThemeMode;
  // Ziel-Plattform. Beeinflusst LLM-System-Prompt (Prosa vs Tag-Liste),
  // Lyrics-Struktur-Tags und sichtbare UI-Hinweise.
  target: PromptTarget;
  // Cloud-Fallback — wenn Ollama offline ist, kann optional ein Cloud-Provider
  // einspringen. API-Key wird NUR im LocalStorage gehalten, nicht committet.
  cloudProvider: CloudProvider;
  cloudApiKey: string;
  cloudModel: string; // z.B. "claude-haiku-4-5" oder "gpt-4o-mini"
};

export const DEFAULT_SETTINGS: Settings = {
  ollamaUrl: "http://localhost:11434",
  ollamaModel: "llama3.1:latest",
  temperature: 0.7,
  creativityMode: "balanced",
  arrangementLength: "standard",
  autoRetryOnCliche: true,
  selfCritiqueLyrics: false,
  autoRefineMinScore: 0,
  autoBackupDays: 0,
  backgroundVariant: "network",
  theme: "dark",
  target: "suno",
  cloudProvider: "none",
  cloudApiKey: "",
  cloudModel: "",
};

// Pro-Task-Temperatur-Mapping auf Basis des CreativityMode.
// Style: faktisch-beschreibend — niedrig. Lyrics: braucht Variation — hoch.
export const getTaskTemperature = (
  mode: CreativityMode,
  task: "style" | "arrangement" | "lyrics" | "title" | "sounds-like" | "critique",
): number => {
  const matrix: Record<CreativityMode, Record<string, number>> = {
    conservative: { style: 0.3, arrangement: 0.4, lyrics: 0.5, title: 0.5, "sounds-like": 0.3, critique: 0.2 },
    balanced: { style: 0.6, arrangement: 0.65, lyrics: 0.8, title: 0.75, "sounds-like": 0.4, critique: 0.3 },
    creative: { style: 0.8, arrangement: 0.8, lyrics: 0.95, title: 0.9, "sounds-like": 0.6, critique: 0.4 },
    wild: { style: 1.0, arrangement: 1.0, lyrics: 1.2, title: 1.1, "sounds-like": 0.8, critique: 0.5 },
  };
  return matrix[mode][task];
};
