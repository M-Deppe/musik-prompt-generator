import { createContext, useCallback, useContext, useEffect, useReducer, useRef, useState, type Dispatch, type ReactNode } from "react";
import { createElement } from "react";
import type { PromptState, Settings } from "./types";
import { DEFAULT_SETTINGS } from "./types";
import type { Mode } from "./sections";
import type { HistoryEntry, Preset } from "./lib/persistence";
import type { JudgeResult } from "./lib/llmJudge";
import {
  loadSettings,
  saveSettings,
  loadHistory,
  saveHistory,
  loadPresets,
  savePresets,
  loadDraft,
  saveDraft,
  migratePromptState,
} from "./lib/persistence";

export type VariantId =
  | "safe"
  | "experimental"
  | "minimal"
  | "intense"
  | "vintage"
  | "modern"
  | "cinematic"
  | "lofi";

export type AppState = {
  mode: Mode;
  activeSection: string;
  prompt: PromptState;
  settings: Settings;
  llmOutput: string;
  llmLoading: boolean;
  llmError?: string;
  llmSourceStylePrompt: string;
  // True wenn der letzte Builder-Lauf durch Auto-Refine nachgeschaerft wurde.
  // Wird im UI als kleines Badge angezeigt.
  llmAutoRefined: boolean;
  llmArrangement: string;
  llmArrangementLoading: boolean;
  llmArrangementError?: string;
  llmArrangementSourceStylePrompt: string;
  llmTitles: string[];
  llmTitlesLoading: boolean;
  llmTitlesError?: string;
  promptPreview: { visible: boolean; system: string; user: string; label: string } | null;
  llmVariants: Record<VariantId, string>;
  llmVariantsLoading: boolean;
  history: HistoryEntry[];
  presets: Preset[];
  settingsOpen: boolean;
  ideaOpen: boolean;
  infoModal: "manual" | "imprint" | "stats" | null;
  // Wird bei RESET inkrementiert. Layout-Komponenten koennen per key={resetCounter}
  // voll remounted werden — das schliesst lokale AccordionSection-States.
  resetCounter: number;
  // Liste der lokal verfuegbaren Ollama-Modelle (nur Namen, z.B. "qwen2.5:14b").
  // Wird beim App-Start aus /api/tags geladen und ist Input fuer Auto-Routing.
  // Leer = Ollama offline oder noch nicht gefetched; dann fallback auf User-Default.
  availableModels: string[];
  // LLM-as-Judge Resultat. Wird beim Generieren zurueckgesetzt.
  judgeResult: JudgeResult | null;
  judgeLoading: boolean;
  // Mobile-Layout-Overlay. Auf kleinen Screens (< lg) sind Sidebar und Preview
  // standardmaessig versteckt; dieser State entscheidet, welches Panel als
  // Overlay angezeigt wird. Auf grossen Screens ignoriert.
  mobilePanel: "sidebar" | "preview" | null;
};

export type Action =
  | { type: "SET_MODE"; mode: Mode }
  | { type: "SET_SECTION"; section: string }
  | { type: "SET_MAIN_GENRE"; mainGenre: string }
  | { type: "SET_SUBGENRE"; subgenre: string; bpm?: number }
  | { type: "SET_BPM"; bpm: number }
  | { type: "TOGGLE_MOOD"; mood: string }
  | { type: "SET_VOCAL_CHARACTER"; value: string }
  | { type: "SET_VOCAL_DELIVERY"; value: string }
  | { type: "SET_VOCAL_EFFECTS"; value: string }
  | { type: "TOGGLE_VOCAL_LANGUAGE"; language: string }
  | { type: "SET_SECONDARY_GENRE"; genre: string }
  | { type: "SET_SOUNDS_LIKE"; value: string }
  | { type: "SET_SOUNDS_LIKE_DESCRIPTION"; value: string }
  | { type: "SET_INFO_MODAL"; modal: "manual" | "imprint" | "stats" | null }
  | { type: "TOGGLE_INSTRUMENT"; instrument: string }
  | { type: "TOGGLE_PRODUCTION"; tag: string }
  | { type: "TOGGLE_CUSTOM_TAG"; tag: string }
  | { type: "TOGGLE_NEGATIVE"; tag: string }
  | { type: "SET_TITLE"; title: string }
  | { type: "SET_LYRICS"; lyrics: string }
  | { type: "LOAD_TEMPLATE"; stylePrompt: string; bpm: number; title: string }
  | { type: "LOAD_PROMPT_STATE"; prompt: PromptState }
  | { type: "SET_SETTINGS"; settings: Partial<Settings> }
  | { type: "LLM_START" }
  | { type: "LLM_CHUNK"; chunk: string }
  | { type: "LLM_DONE"; output: string; sourceStylePrompt?: string }
  | { type: "LLM_ERROR"; message: string }
  | { type: "LLM_RESET" }
  | { type: "LLM_AUTO_REFINED" }
  | { type: "LLM_REFINE_START" }
  | { type: "LLM_REFINE_FAIL" }
  | { type: "ARRANGEMENT_START" }
  | { type: "ARRANGEMENT_CHUNK"; chunk: string }
  | { type: "ARRANGEMENT_DONE"; output: string; sourceStylePrompt?: string }
  | { type: "ARRANGEMENT_ERROR"; message: string }
  | { type: "ARRANGEMENT_RESET" }
  | { type: "TITLES_START" }
  | { type: "TITLES_DONE"; titles: string[] }
  | { type: "TITLES_ERROR"; message: string }
  | { type: "TITLES_RESET" }
  | { type: "SHOW_PROMPT_PREVIEW"; system: string; user: string; label: string }
  | { type: "HIDE_PROMPT_PREVIEW" }
  | { type: "LLM_VARIANTS_START" }
  | { type: "LLM_VARIANT_DONE"; variant: VariantId; output: string }
  | { type: "LLM_VARIANTS_END" }
  | { type: "SET_HISTORY"; history: HistoryEntry[] }
  | { type: "SET_PRESETS"; presets: Preset[] }
  | { type: "TOGGLE_SETTINGS" }
  | { type: "TOGGLE_IDEA" }
  | { type: "SET_AVAILABLE_MODELS"; models: string[] }
  | { type: "JUDGE_START" }
  | { type: "JUDGE_DONE"; result: JudgeResult | null }
  | { type: "SET_MOBILE_PANEL"; panel: "sidebar" | "preview" | null }
  | { type: "RESET" };

export const initialState: AppState = {
  mode: "simple",
  activeSection: "grundstil",
  prompt: {
    moods: [],
    instruments: [],
    production: [],
    customTags: [],
    negatives: [],
    vocalLanguages: [],
    lyrics: "",
    title: "",
  },
  settings: DEFAULT_SETTINGS,
  llmOutput: "",
  llmLoading: false,
  llmSourceStylePrompt: "",
  llmAutoRefined: false,
  llmArrangement: "",
  llmArrangementLoading: false,
  llmArrangementSourceStylePrompt: "",
  llmTitles: [],
  llmTitlesLoading: false,
  promptPreview: null,
  llmVariants: { safe: "", experimental: "", minimal: "", intense: "", vintage: "", modern: "", cinematic: "", lofi: "" },
  llmVariantsLoading: false,
  history: [],
  presets: [],
  settingsOpen: false,
  ideaOpen: false,
  infoModal: null,
  resetCounter: 0,
  availableModels: [],
  judgeResult: null,
  judgeLoading: false,
  mobilePanel: null,
};

const toggle = (list: string[], value: string): string[] =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

const reducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case "SET_MODE":
      return { ...state, mode: action.mode, activeSection: action.mode === "studio" ? "suno-studio" : "grundstil" };
    case "SET_SECTION":
      // Mobile-Overlay schliessen, sonst bleibt Sidebar-Overlay offen nach Klick.
      return { ...state, activeSection: action.section, mobilePanel: null };
    case "SET_MAIN_GENRE":
      return { ...state, prompt: { ...state.prompt, mainGenre: action.mainGenre, subgenre: undefined } };
    case "SET_SUBGENRE":
      return { ...state, prompt: { ...state.prompt, subgenre: action.subgenre, bpm: action.bpm ?? state.prompt.bpm } };
    case "SET_BPM":
      return { ...state, prompt: { ...state.prompt, bpm: action.bpm } };
    case "TOGGLE_MOOD":
      return { ...state, prompt: { ...state.prompt, moods: toggle(state.prompt.moods, action.mood) } };
    case "SET_VOCAL_CHARACTER":
      return { ...state, prompt: { ...state.prompt, vocalCharacter: action.value } };
    case "SET_VOCAL_DELIVERY":
      return { ...state, prompt: { ...state.prompt, vocalDelivery: action.value } };
    case "SET_VOCAL_EFFECTS":
      return { ...state, prompt: { ...state.prompt, vocalEffects: action.value } };
    case "TOGGLE_VOCAL_LANGUAGE":
      return { ...state, prompt: { ...state.prompt, vocalLanguages: toggle(state.prompt.vocalLanguages ?? [], action.language) } };
    case "SET_SECONDARY_GENRE":
      return { ...state, prompt: { ...state.prompt, secondaryGenre: action.genre } };
    case "SET_SOUNDS_LIKE":
      return { ...state, prompt: { ...state.prompt, soundsLike: action.value } };
    case "SET_SOUNDS_LIKE_DESCRIPTION":
      return { ...state, prompt: { ...state.prompt, soundsLikeDescription: action.value } };
    case "SET_INFO_MODAL":
      return { ...state, infoModal: action.modal };
    case "TOGGLE_INSTRUMENT":
      return { ...state, prompt: { ...state.prompt, instruments: toggle(state.prompt.instruments, action.instrument) } };
    case "TOGGLE_PRODUCTION":
      return { ...state, prompt: { ...state.prompt, production: toggle(state.prompt.production, action.tag) } };
    case "TOGGLE_CUSTOM_TAG":
      return { ...state, prompt: { ...state.prompt, customTags: toggle(state.prompt.customTags ?? [], action.tag) } };
    case "TOGGLE_NEGATIVE":
      return { ...state, prompt: { ...state.prompt, negatives: toggle(state.prompt.negatives, action.tag) } };
    case "SET_TITLE":
      return { ...state, prompt: { ...state.prompt, title: action.title } };
    case "SET_LYRICS":
      return { ...state, prompt: { ...state.prompt, lyrics: action.lyrics } };
    case "LOAD_TEMPLATE":
      return {
        ...state,
        prompt: {
          ...initialState.prompt,
          bpm: action.bpm,
          title: action.title,
          customTags: action.stylePrompt.split(",").map((s) => s.trim()).filter(Boolean),
        },
      };
    case "LOAD_PROMPT_STATE":
      return { ...state, prompt: action.prompt };
    case "SET_SETTINGS": {
      const next = { ...state.settings, ...action.settings };
      saveSettings(next);
      return { ...state, settings: next };
    }
    case "LLM_START":
      return { ...state, llmLoading: true, llmOutput: "", llmError: undefined, llmAutoRefined: false, judgeResult: null };
    case "LLM_CHUNK":
      return { ...state, llmOutput: state.llmOutput + action.chunk };
    case "LLM_DONE":
      return {
        ...state,
        llmLoading: false,
        llmOutput: action.output,
        llmSourceStylePrompt: action.sourceStylePrompt ?? state.llmSourceStylePrompt,
      };
    case "LLM_ERROR":
      return { ...state, llmLoading: false, llmError: action.message };
    case "LLM_RESET":
      return { ...state, llmOutput: "", llmError: undefined, llmSourceStylePrompt: "", llmAutoRefined: false };
    case "LLM_AUTO_REFINED":
      return { ...state, llmAutoRefined: true };
    case "LLM_REFINE_START":
      // Behaelt llmOutput und llmError unangetastet — Refine ist non-destruktiv.
      return { ...state, llmLoading: true };
    case "LLM_REFINE_FAIL":
      // Refine fehlgeschlagen oder leerer Output: Loading aus, ersten Output behalten.
      return { ...state, llmLoading: false };
    case "ARRANGEMENT_START":
      return { ...state, llmArrangementLoading: true, llmArrangement: "", llmArrangementError: undefined };
    case "ARRANGEMENT_CHUNK":
      return { ...state, llmArrangement: state.llmArrangement + action.chunk };
    case "ARRANGEMENT_DONE":
      return {
        ...state,
        llmArrangementLoading: false,
        llmArrangement: action.output,
        llmArrangementSourceStylePrompt: action.sourceStylePrompt ?? state.llmArrangementSourceStylePrompt,
      };
    case "ARRANGEMENT_ERROR":
      return { ...state, llmArrangementLoading: false, llmArrangementError: action.message };
    case "ARRANGEMENT_RESET":
      return { ...state, llmArrangement: "", llmArrangementError: undefined };
    case "TITLES_START":
      return { ...state, llmTitlesLoading: true, llmTitles: [], llmTitlesError: undefined };
    case "TITLES_DONE":
      return { ...state, llmTitlesLoading: false, llmTitles: action.titles };
    case "TITLES_ERROR":
      return { ...state, llmTitlesLoading: false, llmTitlesError: action.message };
    case "TITLES_RESET":
      return { ...state, llmTitles: [], llmTitlesError: undefined };
    case "SHOW_PROMPT_PREVIEW":
      return {
        ...state,
        promptPreview: { visible: true, system: action.system, user: action.user, label: action.label },
      };
    case "HIDE_PROMPT_PREVIEW":
      return { ...state, promptPreview: null };
    case "LLM_VARIANTS_START":
      return {
        ...state,
        llmVariantsLoading: true,
        llmVariants: { safe: "", experimental: "", minimal: "", intense: "", vintage: "", modern: "", cinematic: "", lofi: "" },
      };
    case "LLM_VARIANT_DONE":
      return {
        ...state,
        llmVariants: { ...state.llmVariants, [action.variant]: action.output },
      };
    case "LLM_VARIANTS_END":
      return { ...state, llmVariantsLoading: false };
    case "SET_HISTORY":
      saveHistory(action.history);
      return { ...state, history: action.history };
    case "SET_PRESETS":
      savePresets(action.presets);
      return { ...state, presets: action.presets };
    case "TOGGLE_SETTINGS":
      return { ...state, settingsOpen: !state.settingsOpen };
    case "TOGGLE_IDEA":
      return { ...state, ideaOpen: !state.ideaOpen };
    case "SET_AVAILABLE_MODELS":
      return { ...state, availableModels: action.models };
    case "JUDGE_START":
      return { ...state, judgeLoading: true };
    case "JUDGE_DONE":
      return { ...state, judgeLoading: false, judgeResult: action.result };
    case "SET_MOBILE_PANEL":
      return { ...state, mobilePanel: action.panel };
    case "RESET":
      return {
        ...initialState,
        settings: state.settings,
        history: state.history,
        presets: state.presets,
        availableModels: state.availableModels, // Model-Liste beim Reset behalten
        resetCounter: state.resetCounter + 1,
        // mobilePanel und judgeResult werden durch ...initialState auf null
        // gesetzt — explizit, damit klar ist dass RESET auch UI-Ephemera clear.
      };
    default:
      return state;
  }
};

type Ctx = {
  state: AppState;
  dispatch: Dispatch<Action>;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
};
const StoreContext = createContext<Ctx | null>(null);

// Max Undo-Stack-Tiefe. 20 ist genug fuer Power-User, bleibt aber mit dem
// Speicher im Rahmen. PromptStates sind kleine Objekte.
const UNDO_LIMIT = 20;

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState, (base) => {
    const draft = loadDraft();
    return {
      ...base,
      settings: loadSettings() ?? base.settings,
      history: loadHistory(),
      presets: loadPresets(),
      prompt: draft ? migratePromptState(draft) : base.prompt,
    };
  });

  useEffect(() => {
    const id = setTimeout(() => saveDraft(state.prompt), 300);
    return () => clearTimeout(id);
  }, [state.prompt]);

  // --- Undo/Redo ---------------------------------------------------------
  // Stack und Pointer in Refs, damit das Pushen keine Rerender ausloest.
  // Separater State fuer canUndo/canRedo, damit die Buttons reactive bleiben.
  const stackRef = useRef<PromptState[]>([state.prompt]);
  const indexRef = useRef(0);
  const suppressRef = useRef(false);
  const [undoTick, setUndoTick] = useState(0);

  useEffect(() => {
    // Beim Anwenden von undo/redo nicht in den Stack schreiben.
    if (suppressRef.current) {
      suppressRef.current = false;
      return;
    }
    const current = stackRef.current[indexRef.current];
    // Dedup: wenn Prompt strukturell identisch (JSON-Vergleich), nicht pushen.
    if (JSON.stringify(current) === JSON.stringify(state.prompt)) return;
    // Alles nach current-Index verwerfen (neuer Branch).
    stackRef.current = stackRef.current.slice(0, indexRef.current + 1);
    stackRef.current.push(state.prompt);
    if (stackRef.current.length > UNDO_LIMIT) {
      stackRef.current.shift();
    } else {
      indexRef.current++;
    }
    setUndoTick((t) => t + 1);
  }, [state.prompt]);

  const undo = useCallback(() => {
    if (indexRef.current <= 0) return;
    indexRef.current--;
    suppressRef.current = true;
    dispatch({ type: "LOAD_PROMPT_STATE", prompt: stackRef.current[indexRef.current] });
    setUndoTick((t) => t + 1);
  }, []);

  const redo = useCallback(() => {
    if (indexRef.current >= stackRef.current.length - 1) return;
    indexRef.current++;
    suppressRef.current = true;
    dispatch({ type: "LOAD_PROMPT_STATE", prompt: stackRef.current[indexRef.current] });
    setUndoTick((t) => t + 1);
  }, []);

  const canUndo = indexRef.current > 0;
  const canRedo = indexRef.current < stackRef.current.length - 1;
  void undoTick; // Re-Render-Trigger

  return createElement(
    StoreContext.Provider,
    { value: { state, dispatch, undo, redo, canUndo, canRedo } },
    children,
  );
};

export const useStore = (): Ctx => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
};
