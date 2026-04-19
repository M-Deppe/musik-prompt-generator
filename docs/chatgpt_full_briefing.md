# Suno Prompt Generator v2 — Vollständiges ChatGPT-Briefing

Stand: 2026-04-18 · Version 0.1.0 (UI v2.0.0) · Owner: Martin Deppe
Zweck: kompletter Quellcode-Dump für ChatGPT, mit Architektur-Übersicht.

---

## ÜBERSICHT (kompakt)

**Was:** Windows-natives Web-Tool (Vite + React 18 + TypeScript + Tailwind v4)
zum Bauen von Suno-AI-V5.5-Prompts. Lokale LLM-Anbindung via Ollama (kein
Cloud-API). State im Browser (localStorage).

**Drei Modi:** simple (500 Char) · custom (1000 Char) · studio (5000 Char)

**Sprache:** Kommunikation/UI auf Deutsch. Code englisch.

### Globale Konventionen
- Element-Order Suno V5.5: Genre → Mood → Vocal → Instr → Harmony → BPM → Production → Negations
- Tag-Prefix-Routing in `production[]`:
  - `key-*` `pr-*` `m-*` → Harmonie (Style)
  - `th-*` `lt-*` `narr-*` → Lyrics-only (NICHT in Style)
  - `uc-*` → Use-Case (Style)
  - `form-*` `ft-*` `sl-*` `trans-*` → Form (Sidebar-Counter)
  - rest → Production (Style)
- Routing in 3 Dateien synchron: `lib/promptBuilder.ts`, `lib/systemPrompts.ts`, `components/Sidebar.tsx`
- Persistenz: localStorage-Keys `mps.settings|history|presets|draft`

### LLM-Pipeline (Ketten in `lib/llm.ts`)
A. `runLlmBuilder` — Style-Prosa (BUILDER-System-Prompt)
B. `runLlmArrangement` — Section-Tags, nutzt llmOutput als Chain-Context
C. `runStyleAndArrangement` = "Full Pipeline" sequentiell A→B
D. `runLlmVariants` — 4 parallel: safe/experimental/minimal/intense
E. `runLlmFromIdea` — DE/EN-Idee → Prosa
F. `runLlmTitles` — 5 Titel aus Style+Lyrics
G. `runRefinement` — Output + User-Feedback → neue Version
H. `runSelfCritiqueLyrics` — 2. Pass über Lyrics
I. `findCliches` — DE/EN-Klischee-Filter

### Temperatur-Matrix
| Mode | style | arrangement | lyrics | title | sounds-like | critique |
|---|---|---|---|---|---|---|
| conservative | 0.30 | 0.40 | 0.50 | 0.50 | 0.30 | 0.20 |
| balanced | 0.60 | 0.65 | 0.80 | 0.75 | 0.40 | 0.30 |
| creative | 0.80 | 0.80 | 0.95 | 0.90 | 0.60 | 0.40 |
| wild | 1.00 | 1.00 | 1.20 | 1.10 | 0.80 | 0.50 |

### Variant-Config
| Variant | Temp | Hint |
|---|---|---|
| safe | 0.35 | Konservativ, radio-freundlich |
| experimental | 1.00 | Pushe Grenzen, mutige Descriptoren |
| minimal | 0.50 | Nur 3-5 essentielle Descriptoren |
| intense | 0.85 | Maximum Intensität |

---

# ORDNERSTRUKTUR

```
suno-prompt-gen-v2/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json / tsconfig.node.json
├── .gitignore
├── docs/
│   ├── ui_wireframes.md
│   ├── v2_vision.md
│   └── chatgpt_full_briefing.md  (DIESES FILE)
├── research/
│   ├── competitor_analysis.md
│   ├── songwriting_craft_2026.md
│   ├── suno_prompting_2026.md
│   └── v1_screenshot_analysis.md
├── resources/
│   ├── dos_donts.json
│   ├── genres.json
│   ├── instruments.json
│   ├── moods.json
│   ├── tags.json
│   ├── templates.json
│   ├── vocals.json
│   └── genres/
│       ├── electronic.json (~202 subgenres)
│       ├── rock_metal_pop.json (~219)
│       ├── hiphop_rnb_jazz_blues.json (~167)
│       └── world_classical_misc.json (~334)
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── store.ts
    ├── sections.ts
    ├── types.ts
    ├── index.css
    ├── lib/
    │   ├── allGenres.ts
    │   ├── knowledge.ts
    │   ├── llm.ts
    │   ├── ollama.ts
    │   ├── persistence.ts
    │   ├── promptBuilder.ts
    │   ├── suggestions.ts
    │   ├── systemPrompts.ts
    │   └── validator.ts
    ├── components/
    │   ├── AccordionSection.tsx
    │   ├── Content.tsx
    │   ├── Header.tsx
    │   ├── IdeaModal.tsx
    │   ├── InfoBanner.tsx
    │   ├── InfoModal.tsx
    │   ├── Preview.tsx
    │   ├── PromptPreviewModal.tsx
    │   ├── SettingsPanel.tsx
    │   ├── Sidebar.tsx
    │   └── VariantsPanel.tsx
    └── content/
        ├── CheckList.tsx
        ├── registry.tsx
        └── sections/   (26 Files: Aera, Bass, Blueprint, Drums, Dynamik,
                          Earcandy, Emotionen, ExcludeStyles, Gesang,
                          Grundstil, Guitars, Harmony, Keys, Lyrics,
                          MixMaster, Percussion, Placeholder, SongThema,
                          SoundQuality, Structure, Stuecktyp, StyleTags,
                          SunoStudio, Templates, Tempo, Winds)
```

---

# CONFIG-FILES

## package.json
```json
{
  "name": "suno-prompt-gen-v2",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "description": "Windows-native Suno Prompt Generator mit lokaler LLM-Anbindung",
  "author": "Martin Deppe",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "lucide-react": "^1.8.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.0.0",
    "@types/node": "^25.6.0",
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.4",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.6.3",
    "vite": "^5.4.11"
  }
}
```

## vite.config.ts
```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@resources": path.resolve(__dirname, "./resources"),
    },
  },
  server: { port: 5173, strictPort: true },
});
```

## tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": false,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "paths": { "@/*": ["./src/*"], "@resources/*": ["./resources/*"] },
    "baseUrl": "."
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

## tsconfig.node.json
```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "types": ["node"]
  },
  "include": ["vite.config.ts"]
}
```

## index.html
```html
<!doctype html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Music Prompt Studio V2</title>
  </head>
  <body class="antialiased">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

## .gitignore
```
node_modules/
dist/
*.local
.env
.env.local
*.log
*.tsbuildinfo
vite.config.d.ts
vite.config.js
target/
Cargo.lock
.DS_Store
Thumbs.db
.vscode/
.idea/
*.swp
```

## src/index.css
```css
@import "tailwindcss";

@theme {
  --color-bg: oklch(0.14 0.015 60);
  --color-panel: oklch(0.18 0.02 60);
  --color-panel-hover: oklch(0.22 0.025 65);
  --color-border: oklch(0.28 0.03 60);
  --color-border-strong: oklch(0.38 0.05 65);
  --color-amber: oklch(0.76 0.13 75);
  --color-amber-strong: oklch(0.82 0.14 80);
  --color-amber-dim: oklch(0.55 0.09 70);
  --color-amber-ring: oklch(0.76 0.13 75 / 0.3);
  --color-success: oklch(0.75 0.15 155);
  --color-success-dim: oklch(0.6 0.12 155);
  --color-warn: oklch(0.72 0.16 45);
  --color-danger: oklch(0.62 0.22 25);
  --color-text: oklch(0.92 0.02 75);
  --color-text-dim: oklch(0.62 0.04 65);
  --color-text-faint: oklch(0.45 0.03 60);
  --font-sans: "Inter", system-ui, -apple-system, sans-serif;
}

html, body, #root { height: 100%; margin: 0; }
body { font-family: var(--font-sans); background: var(--color-bg); color: var(--color-text); }

::-webkit-scrollbar { width: 10px; height: 10px; }
::-webkit-scrollbar-track { background: var(--color-bg); }
::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 5px; }
::-webkit-scrollbar-thumb:hover { background: var(--color-border-strong); }
```

---

# SOURCE — src/main.tsx
```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

# SOURCE — src/App.tsx
```tsx
import { StoreProvider, useStore } from "@/store";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Content } from "@/components/Content";
import { Preview } from "@/components/Preview";
import { SettingsPanel } from "@/components/SettingsPanel";
import { IdeaModal } from "@/components/IdeaModal";
import { InfoModal } from "@/components/InfoModal";
import { PromptPreviewModal } from "@/components/PromptPreviewModal";

const Shell = () => {
  const { state } = useStore();
  const k = state.resetCounter;
  return (
    <div className="flex h-screen flex-col bg-[var(--color-bg)]">
      <Header />
      <main className="flex flex-1 overflow-hidden">
        <Sidebar key={`sidebar-${k}`} />
        <Content key={`content-${k}`} />
        <Preview />
      </main>
      <SettingsPanel />
      <IdeaModal />
      <InfoModal />
      <PromptPreviewModal />
    </div>
  );
};

export const App = () => (
  <StoreProvider>
    <Shell />
  </StoreProvider>
);
```

# SOURCE — src/types.ts
```ts
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
  | "uplifting" | "melancholic" | "dark" | "calm"
  | "aggressive" | "romantic" | "cinematic";

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
};

export type ValidationIssue = {
  severity: "warn" | "error" | "info";
  message: string;
  field?: string;
};

export type CreativityMode = "conservative" | "balanced" | "creative" | "wild";
export type ArrangementLength = "short" | "standard" | "epic";

export type Settings = {
  ollamaUrl: string;
  ollamaModel: string;
  modelLyrics?: string;
  modelArrangement?: string;
  modelStyle?: string;
  temperature: number;
  creativityMode: CreativityMode;
  arrangementLength: ArrangementLength;
  autoRetryOnCliche: boolean;
  selfCritiqueLyrics: boolean;
};

export const DEFAULT_SETTINGS: Settings = {
  ollamaUrl: "http://localhost:11434",
  ollamaModel: "llama3.1:latest",
  temperature: 0.7,
  creativityMode: "balanced",
  arrangementLength: "standard",
  autoRetryOnCliche: true,
  selfCritiqueLyrics: false,
};

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
```

# SOURCE — src/store.ts
```ts
import { createContext, useContext, useReducer, useEffect, type Dispatch, type ReactNode } from "react";
import { createElement } from "react";
import type { PromptState, Settings } from "./types";
import { DEFAULT_SETTINGS } from "./types";
import type { Mode } from "./sections";
import type { HistoryEntry, Preset } from "./lib/persistence";
import {
  loadSettings, saveSettings, loadHistory, saveHistory,
  loadPresets, savePresets, loadDraft, saveDraft, migratePromptState,
} from "./lib/persistence";

export type VariantId = "safe" | "experimental" | "minimal" | "intense";

export type AppState = {
  mode: Mode;
  activeSection: string;
  prompt: PromptState;
  settings: Settings;
  llmOutput: string;
  llmLoading: boolean;
  llmError?: string;
  llmSourceStylePrompt: string;
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
  infoModal: "manual" | "imprint" | null;
  resetCounter: number;
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
  | { type: "SET_INFO_MODAL"; modal: "manual" | "imprint" | null }
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
  | { type: "RESET" };

export const initialState: AppState = {
  mode: "simple",
  activeSection: "grundstil",
  prompt: { moods: [], instruments: [], production: [], customTags: [],
            negatives: [], vocalLanguages: [], lyrics: "", title: "" },
  settings: DEFAULT_SETTINGS,
  llmOutput: "", llmLoading: false, llmSourceStylePrompt: "",
  llmArrangement: "", llmArrangementLoading: false, llmArrangementSourceStylePrompt: "",
  llmTitles: [], llmTitlesLoading: false,
  promptPreview: null,
  llmVariants: { safe: "", experimental: "", minimal: "", intense: "" },
  llmVariantsLoading: false,
  history: [], presets: [],
  settingsOpen: false, ideaOpen: false, infoModal: null,
  resetCounter: 0,
};

const toggle = (list: string[], value: string): string[] =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

const reducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case "SET_MODE":
      return { ...state, mode: action.mode, activeSection: action.mode === "studio" ? "suno-studio" : "grundstil" };
    case "SET_SECTION": return { ...state, activeSection: action.section };
    case "SET_MAIN_GENRE": return { ...state, prompt: { ...state.prompt, mainGenre: action.mainGenre, subgenre: undefined } };
    case "SET_SUBGENRE": return { ...state, prompt: { ...state.prompt, subgenre: action.subgenre, bpm: action.bpm ?? state.prompt.bpm } };
    case "SET_BPM": return { ...state, prompt: { ...state.prompt, bpm: action.bpm } };
    case "TOGGLE_MOOD": return { ...state, prompt: { ...state.prompt, moods: toggle(state.prompt.moods, action.mood) } };
    case "SET_VOCAL_CHARACTER": return { ...state, prompt: { ...state.prompt, vocalCharacter: action.value } };
    case "SET_VOCAL_DELIVERY": return { ...state, prompt: { ...state.prompt, vocalDelivery: action.value } };
    case "SET_VOCAL_EFFECTS": return { ...state, prompt: { ...state.prompt, vocalEffects: action.value } };
    case "TOGGLE_VOCAL_LANGUAGE": return { ...state, prompt: { ...state.prompt, vocalLanguages: toggle(state.prompt.vocalLanguages ?? [], action.language) } };
    case "SET_SECONDARY_GENRE": return { ...state, prompt: { ...state.prompt, secondaryGenre: action.genre } };
    case "SET_SOUNDS_LIKE": return { ...state, prompt: { ...state.prompt, soundsLike: action.value } };
    case "SET_SOUNDS_LIKE_DESCRIPTION": return { ...state, prompt: { ...state.prompt, soundsLikeDescription: action.value } };
    case "SET_INFO_MODAL": return { ...state, infoModal: action.modal };
    case "TOGGLE_INSTRUMENT": return { ...state, prompt: { ...state.prompt, instruments: toggle(state.prompt.instruments, action.instrument) } };
    case "TOGGLE_PRODUCTION": return { ...state, prompt: { ...state.prompt, production: toggle(state.prompt.production, action.tag) } };
    case "TOGGLE_CUSTOM_TAG": return { ...state, prompt: { ...state.prompt, customTags: toggle(state.prompt.customTags ?? [], action.tag) } };
    case "TOGGLE_NEGATIVE": return { ...state, prompt: { ...state.prompt, negatives: toggle(state.prompt.negatives, action.tag) } };
    case "SET_TITLE": return { ...state, prompt: { ...state.prompt, title: action.title } };
    case "SET_LYRICS": return { ...state, prompt: { ...state.prompt, lyrics: action.lyrics } };
    case "LOAD_TEMPLATE":
      return { ...state, prompt: { ...initialState.prompt, bpm: action.bpm, title: action.title,
        customTags: action.stylePrompt.split(",").map((s) => s.trim()).filter(Boolean) } };
    case "LOAD_PROMPT_STATE": return { ...state, prompt: action.prompt };
    case "SET_SETTINGS": {
      const next = { ...state.settings, ...action.settings };
      saveSettings(next);
      return { ...state, settings: next };
    }
    case "LLM_START": return { ...state, llmLoading: true, llmOutput: "", llmError: undefined };
    case "LLM_CHUNK": return { ...state, llmOutput: state.llmOutput + action.chunk };
    case "LLM_DONE": return { ...state, llmLoading: false, llmOutput: action.output, llmSourceStylePrompt: action.sourceStylePrompt ?? state.llmSourceStylePrompt };
    case "LLM_ERROR": return { ...state, llmLoading: false, llmError: action.message };
    case "LLM_RESET": return { ...state, llmOutput: "", llmError: undefined, llmSourceStylePrompt: "" };
    case "ARRANGEMENT_START": return { ...state, llmArrangementLoading: true, llmArrangement: "", llmArrangementError: undefined };
    case "ARRANGEMENT_CHUNK": return { ...state, llmArrangement: state.llmArrangement + action.chunk };
    case "ARRANGEMENT_DONE": return { ...state, llmArrangementLoading: false, llmArrangement: action.output, llmArrangementSourceStylePrompt: action.sourceStylePrompt ?? state.llmArrangementSourceStylePrompt };
    case "ARRANGEMENT_ERROR": return { ...state, llmArrangementLoading: false, llmArrangementError: action.message };
    case "ARRANGEMENT_RESET": return { ...state, llmArrangement: "", llmArrangementError: undefined };
    case "TITLES_START": return { ...state, llmTitlesLoading: true, llmTitles: [], llmTitlesError: undefined };
    case "TITLES_DONE": return { ...state, llmTitlesLoading: false, llmTitles: action.titles };
    case "TITLES_ERROR": return { ...state, llmTitlesLoading: false, llmTitlesError: action.message };
    case "TITLES_RESET": return { ...state, llmTitles: [], llmTitlesError: undefined };
    case "SHOW_PROMPT_PREVIEW": return { ...state, promptPreview: { visible: true, system: action.system, user: action.user, label: action.label } };
    case "HIDE_PROMPT_PREVIEW": return { ...state, promptPreview: null };
    case "LLM_VARIANTS_START": return { ...state, llmVariantsLoading: true, llmVariants: { safe: "", experimental: "", minimal: "", intense: "" } };
    case "LLM_VARIANT_DONE": return { ...state, llmVariants: { ...state.llmVariants, [action.variant]: action.output } };
    case "LLM_VARIANTS_END": return { ...state, llmVariantsLoading: false };
    case "SET_HISTORY": saveHistory(action.history); return { ...state, history: action.history };
    case "SET_PRESETS": savePresets(action.presets); return { ...state, presets: action.presets };
    case "TOGGLE_SETTINGS": return { ...state, settingsOpen: !state.settingsOpen };
    case "TOGGLE_IDEA": return { ...state, ideaOpen: !state.ideaOpen };
    case "RESET": return { ...initialState, settings: state.settings, history: state.history, presets: state.presets, resetCounter: state.resetCounter + 1 };
    default: return state;
  }
};

type Ctx = { state: AppState; dispatch: Dispatch<Action> };
const StoreContext = createContext<Ctx | null>(null);

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

  return createElement(StoreContext.Provider, { value: { state, dispatch } }, children);
};

export const useStore = (): Ctx => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
};
```

# SOURCE — src/sections.ts
```ts
import type { LucideIcon } from "lucide-react";
import {
  Music, Calendar, Activity, Waves, Clock, Sparkles, Mic, BookOpen, Tag, Ban,
  FileText, Drum, Layers, Volume2, Guitar, Piano, Sliders, FlaskConical, Blocks,
  Wind, Palette, SlidersHorizontal, Tags, Rocket, PenLine,
} from "lucide-react";

export type Mode = "simple" | "custom" | "studio";
export type Section = { id: string; label: string; icon: LucideIcon; iconColor?: string; };
export type Category = { id: string; label: string; icon: LucideIcon; iconColor?: string; sections: Section[]; };

const S = {
  grundstil: { id: "grundstil", label: "Grundstil & Mischung", icon: Music, iconColor: "text-emerald-400" },
  aera: { id: "aera", label: "Äera & Klangepoche", icon: Calendar, iconColor: "text-sky-400" },
  dynamik: { id: "dynamik", label: "Dynamik & Energie-Verlauf", icon: Activity, iconColor: "text-sky-400" },
  emotionen: { id: "emotionen", label: "Emotionen & Einsatz", icon: Waves, iconColor: "text-orange-400" },
  tempo: { id: "tempo", label: "Tempo & Groove", icon: Clock, iconColor: "text-fuchsia-400" },
  soundQuality: { id: "sound-quality", label: "Sound-Qualität & Suno Magic", icon: Sparkles, iconColor: "text-[var(--color-amber)]" },
  gesang: { id: "gesang", label: "Gesang", icon: Mic, iconColor: "text-pink-400" },
  songThema: { id: "song-thema", label: "Song-Thema & Einsatz", icon: BookOpen, iconColor: "text-red-400" },
  styleTags: { id: "style-tags", label: "Style-Tags eingeben", icon: Tag, iconColor: "text-[var(--color-amber)]" },
  excludeStyles: { id: "exclude-styles", label: "Exclude-Styles eingeben", icon: Ban, iconColor: "text-red-500" },
  blueprint: { id: "blueprint", label: "Prompt-Blueprint (KI-Struktur)", icon: FileText, iconColor: "text-sky-400" },
  stuecktyp: { id: "stuecktyp", label: "Stücktyp & Besetzung", icon: Layers, iconColor: "text-fuchsia-400" },
  drums: { id: "drums", label: "Drum & Beatdesign", icon: Drum, iconColor: "text-sky-400" },
  percussion: { id: "percussion", label: "Percussion layern", icon: Drum, iconColor: "text-orange-400" },
  bass: { id: "bass", label: "Bass & Low End", icon: Volume2, iconColor: "text-red-400" },
  guitars: { id: "guitars", label: "Gitarren & Clav", icon: Guitar, iconColor: "text-fuchsia-400" },
  winds: { id: "winds", label: "Bläser & Streicher", icon: Wind, iconColor: "text-amber-400" },
  keys: { id: "keys", label: "Tasten & Synths", icon: Piano, iconColor: "text-emerald-400" },
  earcandy: { id: "earcandy", label: "Earcandy & Kontrast", icon: Sparkles, iconColor: "text-[var(--color-amber)]" },
  harmony: { id: "harmony", label: "Harmonie & Tonalität", icon: Music, iconColor: "text-red-400" },
  structure: { id: "structure", label: "Struktur & Form", icon: Blocks, iconColor: "text-sky-400" },
  mixMaster: { id: "mix-master", label: "Mix & Master", icon: Sliders, iconColor: "text-[var(--color-amber)]" },
  sunoStudio: { id: "suno-studio", label: "Suno Studio", icon: FlaskConical, iconColor: "text-[var(--color-amber)]" },
  templates: { id: "templates", label: "Templates", icon: Rocket, iconColor: "text-[var(--color-amber)]" },
  lyrics: { id: "lyrics", label: "Lyrics", icon: PenLine, iconColor: "text-pink-400" },
} satisfies Record<string, Section>;

// Reihenfolge: 1 Genre → 2 Mood → 3 Song-Typ → 4 Vocals → 5 Instr →
// 6 Harmony → 7 BPM → 8 Production → 9 Negationen.

export const SIMPLE_CATEGORIES: Category[] = [
  { id: "start", label: "Schnellstart", icon: Rocket, iconColor: "text-[var(--color-amber)]", sections: [S.templates] },
  { id: "genre", label: "1. Genre & Aera", icon: Music, iconColor: "text-emerald-400", sections: [S.grundstil, S.aera] },
  { id: "mood", label: "2. Stimmung & Energie", icon: Palette, iconColor: "text-orange-400", sections: [S.emotionen, S.dynamik] },
  { id: "vocals", label: "3. Gesang", icon: Mic, iconColor: "text-pink-400", sections: [S.gesang] },
  { id: "tempo", label: "4. Tempo", icon: Clock, iconColor: "text-fuchsia-400", sections: [S.tempo] },
  { id: "production", label: "5. Sound & Produktion", icon: SlidersHorizontal, iconColor: "text-[var(--color-amber)]", sections: [S.soundQuality] },
  { id: "lyrics", label: "6. Lyrics & Thema", icon: PenLine, iconColor: "text-pink-400", sections: [S.lyrics, S.songThema] },
  { id: "tags", label: "7. Tags & Ausschluss", icon: Tags, iconColor: "text-[var(--color-amber)]", sections: [S.styleTags, S.excludeStyles, S.blueprint] },
];

export const CUSTOM_CATEGORIES: Category[] = [
  { id: "start", label: "Schnellstart", icon: Rocket, iconColor: "text-[var(--color-amber)]", sections: [S.templates] },
  { id: "genre", label: "1. Genre & Aera", icon: Music, iconColor: "text-emerald-400", sections: [S.grundstil, S.aera] },
  { id: "mood", label: "2. Stimmung & Energie", icon: Palette, iconColor: "text-orange-400", sections: [S.emotionen, S.dynamik] },
  { id: "form", label: "3. Song-Typ & Form", icon: Blocks, iconColor: "text-sky-400", sections: [S.stuecktyp, S.structure] },
  { id: "vocals", label: "4. Gesang", icon: Mic, iconColor: "text-pink-400", sections: [S.gesang] },
  { id: "rhythm", label: "5a. Instrumente — Rhythmus", icon: Drum, iconColor: "text-orange-400", sections: [S.drums, S.percussion, S.bass] },
  { id: "melody", label: "5b. Instrumente — Melodie", icon: Guitar, iconColor: "text-fuchsia-400", sections: [S.guitars, S.keys, S.winds, S.earcandy] },
  { id: "harmony", label: "6. Harmonie & Tonart", icon: Music, iconColor: "text-red-400", sections: [S.harmony] },
  { id: "tempo", label: "7. Tempo", icon: Clock, iconColor: "text-fuchsia-400", sections: [S.tempo] },
  { id: "production", label: "8. Sound & Produktion", icon: SlidersHorizontal, iconColor: "text-[var(--color-amber)]", sections: [S.soundQuality, S.mixMaster] },
  { id: "lyrics", label: "9. Lyrics & Thema", icon: PenLine, iconColor: "text-pink-400", sections: [S.lyrics, S.songThema] },
  { id: "tags", label: "10. Tags & Ausschluss", icon: Tags, iconColor: "text-[var(--color-amber)]", sections: [S.styleTags, S.excludeStyles, S.blueprint] },
];

export const STUDIO_CATEGORIES: Category[] = [
  { id: "studio", label: "Studio", icon: FlaskConical, iconColor: "text-[var(--color-amber)]", sections: [S.sunoStudio] },
];

export const getCategoriesForMode = (mode: Mode): Category[] =>
  mode === "simple" ? SIMPLE_CATEGORIES : mode === "custom" ? CUSTOM_CATEGORIES : STUDIO_CATEGORIES;

export const getSectionsForMode = (mode: Mode): Section[] =>
  getCategoriesForMode(mode).flatMap((c) => c.sections);

export const findCategoryOfSection = (mode: Mode, sectionId: string): Category | undefined =>
  getCategoriesForMode(mode).find((c) => c.sections.some((s) => s.id === sectionId));
```

# SOURCE — src/lib/ollama.ts
```ts
export type OllamaModel = {
  name: string; size: number; modified_at: string;
  details?: { parameter_size?: string; family?: string; };
};

export type GenerateOptions = {
  baseUrl: string; model: string; prompt: string;
  system?: string; temperature?: number;
  onChunk?: (chunk: string, full: string) => void;
  signal?: AbortSignal;
};

export const listModels = async (baseUrl: string): Promise<OllamaModel[]> => {
  const res = await fetch(`${baseUrl}/api/tags`);
  if (!res.ok) throw new Error(`Ollama ${res.status}`);
  const data = await res.json();
  return (data.models ?? []) as OllamaModel[];
};

export const ping = async (baseUrl: string): Promise<boolean> => {
  try {
    const res = await fetch(`${baseUrl}/api/tags`, { method: "GET" });
    return res.ok;
  } catch { return false; }
};

export const generate = async (opts: GenerateOptions): Promise<string> => {
  const res = await fetch(`${opts.baseUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: opts.model, prompt: opts.prompt, system: opts.system,
      stream: true, options: { temperature: opts.temperature ?? 0.7 },
    }),
    signal: opts.signal,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Ollama ${res.status}: ${text || res.statusText}`);
  }
  if (!res.body) throw new Error("Keine Response-Body von Ollama");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let full = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const obj = JSON.parse(line);
        if (obj.response) {
          full += obj.response;
          opts.onChunk?.(obj.response, full);
        }
      } catch { /* ignorieren */ }
    }
  }
  return full;
};
```

# SOURCE — src/lib/persistence.ts
```ts
import type { PromptState } from "@/types";
import type { Settings } from "@/types";

const KEY_SETTINGS = "mps.settings";
const KEY_HISTORY = "mps.history";
const KEY_PRESETS = "mps.presets";
const KEY_DRAFT = "mps.draft";

export type HistoryEntry = {
  id: string; createdAt: string; stylePrompt: string;
  llmOutput?: string; llmArrangement?: string;
  prompt: PromptState; rating?: number; notes?: string; title?: string;
};

export type Preset = {
  id: string; name: string; createdAt: string; prompt: PromptState;
};

const safeRead = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
};

const safeWrite = (key: string, value: unknown) => {
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch (e) { console.warn("localStorage write failed", e); }
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
  saveHistory(next); return next;
};

export const updateHistoryEntry = (id: string, patch: Partial<HistoryEntry>): HistoryEntry[] => {
  const current = loadHistory();
  const next = current.map((e) => (e.id === id ? { ...e, ...patch } : e));
  saveHistory(next); return next;
};

export const removeHistoryEntry = (id: string): HistoryEntry[] => {
  const current = loadHistory();
  const next = current.filter((e) => e.id !== id);
  saveHistory(next); return next;
};

export const addPreset = (preset: Preset): Preset[] => {
  const current = loadPresets();
  const next = [preset, ...current].slice(0, 50);
  savePresets(next); return next;
};

export const removePreset = (id: string): Preset[] => {
  const current = loadPresets();
  const next = current.filter((p) => p.id !== id);
  savePresets(next); return next;
};

export const CURRENT_EXPORT_VERSION = 3;

export const exportState = (state: { prompt: PromptState; title?: string }): string =>
  JSON.stringify({ ...state, exported_at: new Date().toISOString(), version: CURRENT_EXPORT_VERSION }, null, 2);

// Migriert importierte PromptState-Daten auf das aktuelle Schema.
// v1/v2 hatten evtl. `genre` (deprecated) und `structure` (tot) — beides wird weggeworfen.
export const migratePromptState = (raw: unknown): PromptState => {
  const base: PromptState = {
    moods: [], instruments: [], production: [], customTags: [],
    negatives: [], vocalLanguages: [], lyrics: "", title: "",
  };
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Record<string, unknown>;
  const arr = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x) => typeof x === "string") as string[] : []);
  const str = (v: unknown): string => (typeof v === "string" ? v : "");
  const optStr = (v: unknown): string | undefined => (typeof v === "string" && v ? v : undefined);
  const optNum = (v: unknown): number | undefined => (typeof v === "number" ? v : undefined);
  return {
    ...base,
    mainGenre: optStr(r.mainGenre), subgenre: optStr(r.subgenre),
    secondaryGenre: optStr(r.secondaryGenre),
    soundsLike: optStr(r.soundsLike), soundsLikeDescription: optStr(r.soundsLikeDescription),
    moods: arr(r.moods), bpm: optNum(r.bpm),
    vocalCharacter: optStr(r.vocalCharacter), vocalDelivery: optStr(r.vocalDelivery),
    vocalEffects: optStr(r.vocalEffects), vocalLanguages: arr(r.vocalLanguages),
    instruments: arr(r.instruments), production: arr(r.production),
    customTags: arr(r.customTags), negatives: arr(r.negatives),
    lyrics: str(r.lyrics), title: str(r.title),
  };
};
```

# SOURCE — src/lib/allGenres.ts
```ts
import electronicData from "@resources/genres/electronic.json";
import rockData from "@resources/genres/rock_metal_pop.json";
import hiphopData from "@resources/genres/hiphop_rnb_jazz_blues.json";
import worldData from "@resources/genres/world_classical_misc.json";

export type Subgenre = {
  id: string; name: string; parent_main: string; parent: string;
  bpm_min: number; bpm_max: number; keywords: string[]; origin: string;
};

export type MainGenre = { id: string; name: string; description: string; };

export const MAIN_GENRES: MainGenre[] = [
  { id: "electronic", name: "Electronic / EDM", description: "Elektronische Musik, Synthesizer und Drum-Machines" },
  { id: "rock", name: "Rock", description: "Gitarren-zentrierte Musik von Classic bis Alternative" },
  { id: "indie", name: "Indie / Alternative", description: "Unabhaengige und alternative Stile, oft mit Lo-Fi-Aesthetik" },
  { id: "metal", name: "Metal", description: "Schwere, verzerrte Gitarren-Musik mit vielen Subgenres" },
  { id: "punk", name: "Punk", description: "Schnelle, raue, rebellische Rock-Musik" },
  { id: "pop", name: "Pop", description: "Mainstream-orientierte Populärmusik in vielen Variationen" },
  { id: "hiphop", name: "Hip-Hop / Rap", description: "Rap, Beats, kulturelle Wurzeln im Hip-Hop" },
  { id: "rnb", name: "R&B", description: "Rhythm & Blues, Contemporary und Neo-Soul" },
  { id: "soul", name: "Soul", description: "Afroamerikanische Vokaltradition mit Gospel-Wurzeln" },
  { id: "funk", name: "Funk", description: "Groove-getriebene, rhythmische Musik" },
  { id: "jazz", name: "Jazz", description: "Improvisationsbasierte Musiktradition mit vielen Schulen" },
  { id: "blues", name: "Blues", description: "Traditionelle afroamerikanische Musikform" },
  { id: "reggae", name: "Reggae / Caribbean", description: "Karibische Musiktraditionen mit Offbeat-Rhythmen" },
  { id: "latin", name: "Latin", description: "Lateinamerikanische Musikformen" },
  { id: "world", name: "World", description: "Regionale und traditionelle Musik weltweit" },
  { id: "folk", name: "Folk", description: "Akustische, traditionelle und Singer-Songwriter-Musik" },
  { id: "country", name: "Country / Americana", description: "US-amerikanische traditionelle Musik" },
  { id: "classical", name: "Classical", description: "Klassische und zeitgenoessische Kunstmusik" },
  { id: "ambient", name: "Ambient", description: "Atmosphaerische, unaufdringliche Klangflaechen" },
  { id: "experimental", name: "Experimental", description: "Avantgarde und experimentelle Klangkunst" },
  { id: "soundtrack", name: "Soundtrack / Cinematic", description: "Film-, Spiel- und Trailermusik" },
  { id: "religious", name: "Religious / Spiritual", description: "Sakrale und spirituelle Musik" },
  { id: "novelty", name: "Novelty / Meme", description: "Kinderlieder, Internet-Memes, Parodien" },
];

const normalize = (list: Subgenre[], fallbackMain?: string): Subgenre[] =>
  list.map((s) => ({ ...s, parent_main: s.parent_main ?? fallbackMain ?? "unknown" }));

export const SUBGENRES: Subgenre[] = [
  ...normalize(electronicData.subgenres as Subgenre[], "electronic"),
  ...normalize(rockData.subgenres as Subgenre[]),
  ...normalize(hiphopData.subgenres as Subgenre[]),
  ...normalize(worldData.subgenres as Subgenre[]),
];

export const getSubgenreById = (id: string | undefined): Subgenre | undefined =>
  id ? SUBGENRES.find((s) => s.id === id) : undefined;

export const getSubgenresByMain = (mainId: string): Subgenre[] =>
  SUBGENRES.filter((s) => s.parent_main === mainId);

export const getMainGenreById = (id: string | undefined): MainGenre | undefined =>
  id ? MAIN_GENRES.find((m) => m.id === id) : undefined;

export const searchSubgenres = (query: string, limit = 50): Subgenre[] => {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return SUBGENRES.filter(
    (s) => s.name.toLowerCase().includes(q) || s.id.includes(q) ||
           s.keywords.some((k) => k.toLowerCase().includes(q)),
  ).slice(0, limit);
};
```

# SOURCE — src/lib/knowledge.ts
```ts
import moodsData from "@resources/moods.json";
import templatesData from "@resources/templates.json";
import dosDontsData from "@resources/dos_donts.json";
import vocalsData from "@resources/vocals.json";
import instrumentsData from "@resources/instruments.json";
import tagsData from "@resources/tags.json";
import type { Template, MoodsData } from "@/types";

export const templates = templatesData.templates as Template[];
export const moods = moodsData as unknown as MoodsData;
export const dosDonts = dosDontsData;
export const vocals = vocalsData;
export const instruments = instrumentsData;
export const tags = tagsData;

export const getTemplateById = (id: string): Template | undefined =>
  templates.find((t) => t.id === id);

export const findConflictingMoods = (selected: string[]): [string, string][] =>
  moods.conflict_pairs.filter(
    ([a, b]) => selected.includes(a) && selected.includes(b),
  );

export {
  MAIN_GENRES, SUBGENRES, getMainGenreById, getSubgenreById,
  getSubgenresByMain, searchSubgenres,
} from "./allGenres";
export type { MainGenre, Subgenre } from "./allGenres";
```

# SOURCE — src/lib/promptBuilder.ts
```ts
import type { PromptState } from "@/types";
import { getSubgenreById, MAIN_GENRES } from "./allGenres";

const joinNonEmpty = (parts: (string | undefined)[]): string =>
  parts.filter((p): p is string => Boolean(p && p.trim())).join(", ");

export const buildStylePrompt = (state: PromptState): string => {
  const subgenre = getSubgenreById(state.subgenre);
  const main = MAIN_GENRES.find((g) => g.id === state.mainGenre);
  const secondary = MAIN_GENRES.find((g) => g.id === state.secondaryGenre);

  const buildGenrePart = (): string | undefined => {
    const subName = subgenre?.name.toLowerCase();
    const mainName = main?.name.toLowerCase().split(" ")[0];
    if (subName && mainName) return subName.includes(mainName) ? subName : `${subName}, ${mainName}`;
    return subName ?? main?.name.toLowerCase();
  };
  const genrePart = buildGenrePart();
  const fusionPart = secondary ? `fusion with ${secondary.name.toLowerCase()}` : undefined;
  const soundsLikePart = state.soundsLikeDescription?.trim()
    ? state.soundsLikeDescription.trim().replace(/\.$/, "")
    : state.soundsLike?.trim()
      ? `reminiscent of ${state.soundsLike.trim()}`
      : undefined;
  const vocalPart = joinNonEmpty([state.vocalCharacter, state.vocalDelivery, state.vocalEffects]);
  const languagePart = (state.vocalLanguages ?? []).length
    ? `vocals in ${(state.vocalLanguages ?? []).map((l) => l.replace(/^lang-/, "")).join("/")}`
    : undefined;
  const moodPart = state.moods.join(", ");
  const instrumentPart = state.instruments.slice(0, 3).join(", ");
  const bpmPart = state.bpm ? `${state.bpm} BPM` : undefined;

  // Tag-Prefix-Routing in production[]:
  //   key-* / pr-* / m-*  → Harmonie
  //   th-* / lt-* / narr-* → Lyrics-only (NICHT in Style)
  //   uc-*                 → Use-Case
  //   rest                 → plain production
  const isHarmony = (t: string) => /^(key-|pr-|m-)/.test(t);
  const isLyricsOnly = (t: string) => /^(th-|lt-|narr-)/.test(t);
  const isUseCase = (t: string) => t.startsWith("uc-");

  const harmonyPart = state.production.filter(isHarmony)
    .map((t) => t.replace(/^(key-|pr-|m-)/, "")).join(", ");
  const useCasePart = state.production.filter(isUseCase)
    .map((t) => t.replace(/^uc-/, "")).join(", ");
  const productionPart = state.production
    .filter((t) => !isHarmony(t) && !isLyricsOnly(t) && !isUseCase(t)).join(", ");

  const customTagsPart = (state.customTags ?? []).join(", ");
  const negativePart = state.negatives.length
    ? state.negatives.map((n) => (n.startsWith("no ") ? n : `no ${n}`)).join(", ")
    : undefined;

  // Reihenfolge: Genre → Fusion → Mood → UseCase → Vocal → Lang →
  //              Instr → Harmony → BPM → Production → Custom → SoundRef → Negations
  return joinNonEmpty([
    genrePart, fusionPart, moodPart, useCasePart || undefined,
    vocalPart, languagePart, instrumentPart, harmonyPart || undefined,
    bpmPart, productionPart, customTagsPart,
    soundsLikePart, negativePart,
  ]);
};
```

# SOURCE — src/lib/systemPrompts.ts
```ts
import type { PromptState } from "@/types";
import { getSubgenreById, MAIN_GENRES } from "./allGenres";

// Model-agnostische System-Prompts fuer Suno V5.5.

export const SYSTEM_PROMPT_BUILDER = `You write Suno AI (V5.5) style prompts in English prose.

TASK
Produce 2-4 descriptive sentences under 1000 characters. Music-journalist voice. No tag list.

ELEMENT ORDER (STRICT — follow this sequence across the prose)
1. Genre and subgenre, with era fused to genre if provided ("80s synth-pop", "late 90s indie rock").
2. Secondary genre or fusion (if provided) attached right after primary genre.
3. Mood and emotional character.
4. Song form or type (ballad, anthem, groove, instrumental, etc.) if provided.
5. Vocal character, delivery and language (if provided).
6. Two to three SPECIFIC instruments.
7. Harmony or key (minor key, A minor, modal) if provided.
8. BPM as a number ("at 124 BPM", "a 96 BPM groove").
9. Production and mix descriptors ("warm analog", "polished radio-ready mix", "bedroom lo-fi", "stadium reverb", "dry close-miked", "punchy compression").
10. Sound reference at end as a nuance ("with Motown-style brass stabs"). No artist names.
11. Negations last, max 2, format "No X. No Y.".

CONTENT RULES
- Subgenre specific ("indie shoegaze" not "rock"). "boom bap hip hop" not "hip hop".
- Instruments specific ("Moog bass synth" not "synth"). "fingerpicked Telecaster" not "guitar".
- Maximum two genres. Dominant genre first.
- Mood concrete ("melancholic and bittersweet", not "sad").
- Use production descriptors actively — they are underused but high impact.

FORBIDDEN
- No artist names. Describe the sound signature instead.
- No command verbs: "create", "make", "generate", "write", "compose", "please".
- No vague genres without qualifier.
- No contradictory moods like "calm aggressive".
- No lyrical theme content in the style prompt.
- No section tags ([Verse], [Chorus]) — those belong in the lyrics box.

EXAMPLE OUTPUT
A nostalgic 80s synthwave track with a bittersweet, cinematic mood and a slow-building anthem form. A breathy female vocal sits upfront, delivered in English, centred on a steady 124 BPM pulse. Moog bass synth, gated reverb Linn drums, and shimmering arpeggios drive the groove in a minor key, shaped by warm analog production and a polished radio-ready mix. No acoustic instruments.

OUTPUT CONTRACT
Return only the prose prompt. No introduction. No explanation. No meta comments. No markdown.`;

export const SYSTEM_PROMPT_FROM_IDEA = `You write Suno AI (V5.5) style prompts in English prose.

TASK
The user describes a music idea in German or English. Convert it into 2-4 English sentences, under 1000 characters, in music-journalist voice.

ELEMENT ORDER (STRICT)
1. Genre + subgenre (+era fused).
2. Fusion / secondary genre.
3. Mood / emotion.
4. Song form (ballad, anthem, groove).
5. Vocal character + language.
6. Specific instruments (2-3 max).
7. Harmony / key (if applicable).
8. BPM as a number.
9. Production / mix descriptors.
10. Sound reference (nuance, no artist names).
11. Negations last (max 2, "No X. No Y.").

RULES
- Subgenre specific. Instruments specific. Max 2 genres. BPM as number.
- No artist names. No "create", "make", "generate", "please". No contradictory moods.
- No lyrical theme. No section tags.

EXAMPLE OUTPUT
A brooding dark synthwave ballad with a late-night, rain-soaked mood. A raspy male vocal in English sits upfront at 88 BPM. Deep Juno pad, muted Telecaster arpeggios and tight 808 kicks drive the track in a minor key, backed by warm analog production and a dry close-miked mix. No orchestral strings.

OUTPUT CONTRACT
Return only the prose prompt. No introduction. No explanation. No markdown.`;

export const buildUserPromptFromState = (state: PromptState): string => {
  const parts: string[] = [];
  const sub = getSubgenreById(state.subgenre);
  const main = MAIN_GENRES.find((g) => g.id === state.mainGenre);
  const secondary = MAIN_GENRES.find((g) => g.id === state.secondaryGenre);

  if (main) parts.push(`1. Main Genre: ${main.name}`);
  if (sub) parts.push(`1a. Subgenre: ${sub.name} (${sub.origin}, typical BPM ${sub.bpm_min}-${sub.bpm_max})`);
  if (secondary) parts.push(`2. Fusion / Secondary: ${secondary.name}`);
  if (state.moods.length) parts.push(`3. Mood: ${state.moods.join(", ")}`);
  if (state.vocalCharacter) parts.push(`5a. Vocal Character: ${state.vocalCharacter}`);
  if (state.vocalDelivery) parts.push(`5b. Vocal Delivery: ${state.vocalDelivery}`);
  if (state.vocalEffects) parts.push(`5c. Vocal Effects: ${state.vocalEffects}`);
  if ((state.vocalLanguages ?? []).length) {
    parts.push(`5d. Vocal Language: ${(state.vocalLanguages ?? []).map((l) => l.replace(/^lang-/, "")).join(", ")}`);
  }
  if (state.instruments.length) parts.push(`6. Instruments: ${state.instruments.slice(0, 3).join(", ")}`);

  const harmony = state.production.filter((t) => /^(key-|pr-|m-)/.test(t))
    .map((t) => t.replace(/^(key-|pr-|m-)/, ""));
  if (harmony.length) parts.push(`7. Harmony / Key / Progression: ${harmony.join(", ")}`);

  if (state.bpm) parts.push(`8. BPM: ${state.bpm}`);

  const production = state.production.filter((t) => !/^(key-|pr-|m-|th-|lt-|narr-|uc-)/.test(t));
  if (production.length) parts.push(`9. Production: ${production.join(", ")}`);

  const useCase = state.production.filter((t) => t.startsWith("uc-")).map((t) => t.replace(/^uc-/, ""));
  if (useCase.length) parts.push(`9a. Use case / context: ${useCase.join(", ")}`);

  if (state.soundsLikeDescription?.trim()) parts.push(`10. Sound reference: ${state.soundsLikeDescription.trim()}`);
  if (state.negatives.length) parts.push(`11. Negations: ${state.negatives.join(", ")}`);

  if (sub?.keywords.length) parts.push(`Typical keywords: ${sub.keywords.join(", ")}`);

  return parts.length
    ? `Baue einen Suno-Style-Prompt aus dieser Auswahl:\n\n${parts.join("\n")}`
    : "Keine spezifische Auswahl — generiere einen sinnvollen Beispiel-Prompt für modernen Pop.";
};
```

# SOURCE — src/lib/llm.ts
```ts
import type { Dispatch } from "react";
import type { Action, AppState } from "@/store";
import { generate } from "./ollama";
import { buildStylePrompt } from "./promptBuilder";
import { getTaskTemperature, type ArrangementLength } from "@/types";
import { SYSTEM_PROMPT_BUILDER, SYSTEM_PROMPT_FROM_IDEA, buildUserPromptFromState } from "./systemPrompts";

// --- Klischee-Detection --------------------------------------------------
const CLICHE_PHRASES_EN = [
  "echoes", "shattered dreams", "endless night", "fading light",
  "whispers in the dark", "burning bridges", "broken chains",
  "rise above", "set me free", "feel the pain", "by my side",
  "forever and always", "through the storm", "touch the sky",
  "reach the stars", "hold me tight", "meant to be", "stories untold",
];
const CLICHE_PHRASES_DE = [
  "mein herz brennt", "in dunkler nacht", "fuer immer und ewig",
  "für immer und ewig", "schatten der vergangenheit", "tief in mir",
  "das licht am ende", "bis in alle ewigkeit", "traeume werden wahr",
  "träume werden wahr", "sterne am himmel",
];

export const findCliches = (text: string): string[] => {
  const lower = text.toLowerCase();
  return [...CLICHE_PHRASES_EN, ...CLICHE_PHRASES_DE].filter((p) => lower.includes(p));
};

// --- Model-Routing --------------------------------------------------------
const pickModel = (state: AppState, task: "style" | "arrangement" | "lyrics" | "title"): string => {
  const s = state.settings;
  if (task === "lyrics" && s.modelLyrics) return s.modelLyrics;
  if (task === "arrangement" && s.modelArrangement) return s.modelArrangement;
  if (task === "style" && s.modelStyle) return s.modelStyle;
  return s.ollamaModel;
};

// --- Style-Builder --------------------------------------------------------
export const runLlmBuilder = async (state: AppState, dispatch: Dispatch<Action>, signal?: AbortSignal): Promise<void> => {
  dispatch({ type: "LLM_START" });
  const sourceStylePrompt = buildStylePrompt(state.prompt);
  try {
    const out = await generate({
      baseUrl: state.settings.ollamaUrl,
      model: pickModel(state, "style"),
      system: SYSTEM_PROMPT_BUILDER,
      prompt: buildUserPromptFromState(state.prompt),
      temperature: getTaskTemperature(state.settings.creativityMode, "style"),
      signal,
      onChunk: (chunk) => dispatch({ type: "LLM_CHUNK", chunk }),
    });
    dispatch({ type: "LLM_DONE", output: out.trim(), sourceStylePrompt });
  } catch (e) {
    dispatch({ type: "LLM_ERROR", message: e instanceof Error ? e.message : "Unbekannter Fehler" });
  }
};

// --- Variants -------------------------------------------------------------
export type VariantId = "safe" | "experimental" | "minimal" | "intense";

const VARIANT_CONFIG: Record<VariantId, { temperature: number; hint: string }> = {
  safe: { temperature: 0.35, hint: "Konservative radio-freundliche Version. Klassische Tags, sicher." },
  experimental: { temperature: 1.0, hint: "Pushe Grenzen. Ungewöhnliche Kombinationen, mutige Descriptoren." },
  minimal: { temperature: 0.5, hint: "Minimum-Prompt: nur 3-5 essentielle Descriptoren. Keine optionalen Tags." },
  intense: { temperature: 0.85, hint: "Maximum Intensität: energetisch, extrem, voll aufgedreht." },
};

export const runLlmVariants = async (state: AppState, dispatch: Dispatch<Action>): Promise<void> => {
  dispatch({ type: "LLM_VARIANTS_START" });
  const base = buildUserPromptFromState(state.prompt);
  const ids: VariantId[] = ["safe", "experimental", "minimal", "intense"];

  await Promise.all(
    ids.map(async (id) => {
      const cfg = VARIANT_CONFIG[id];
      try {
        const out = await generate({
          baseUrl: state.settings.ollamaUrl,
          model: pickModel(state, "style"),
          system: `${SYSTEM_PROMPT_BUILDER}\n\nVARIANT-HINWEIS: ${cfg.hint}`,
          prompt: base, temperature: cfg.temperature,
        });
        dispatch({ type: "LLM_VARIANT_DONE", variant: id, output: out.trim() });
      } catch (e) {
        dispatch({ type: "LLM_VARIANT_DONE", variant: id, output: `(Fehler: ${e instanceof Error ? e.message : "?"})` });
      }
    }),
  );
  dispatch({ type: "LLM_VARIANTS_END" });
};

// --- Arrangement ----------------------------------------------------------
const ARRANGEMENT_LENGTH_HINT: Record<ArrangementLength, string> = {
  short: "3 to 5 sections for a 1.5 to 2.5 minute song (intro, verse, chorus, maybe bridge, outro).",
  standard: "5 to 8 sections for a 3 to 4 minute song (full form with verses, chorus, pre-chorus, bridge, outro).",
  epic: "8 to 12 sections for a 4 to 6+ minute song (two-part form, extended bridge, interlude, multiple chorus variations).",
};

const buildArrangementSystemPrompt = (length: ArrangementLength): string => `You build Suno AI song arrangements in English. Output is a sequence of section tags with short production notes.

PURPOSE
This arrangement is a REFERENCE. The production notes either enrich the style prompt globally, or get compressed into inline tag modifiers like [Verse 1: warm piano]. They are NOT meant to be sung.

TASK
Given the user's style prompt, produce an arrangement. Length: ${ARRANGEMENT_LENGTH_HINT[length]}

TAG VOCABULARY
Base: [Intro], [Verse 1], [Verse 2], [Pre-Chorus], [Chorus], [Post-Chorus], [Bridge], [Outro]
Extended: [Hook], [Interlude], [Instrumental], [Break], [Breakdown], [Solo], [Refrain], [Drop], [Build], [Fade Out]

ENERGY ARC (required)
Intro low -> Verse rising -> Chorus peak -> Bridge valley -> Final Chorus highest -> Outro fading.
Reflect the arc in qualifiers: (quiet), (sparse), (building), (full), (half-time), (stripped back), (fade out).

FORMAT per section
[Tag] (optional qualifiers)
One or two comma-separated production descriptors. Instrumentation, dynamics, sonic color. NO lyrics.
Blank line between sections.

FORBIDDEN
No artist names. No lyrics. No explanation. No markdown headings.

EXAMPLE
[Intro] (sparse, low energy)
Ambient synth pad, filtered kick pulse, rising white noise sweep

[Verse 1] (restrained)
Clean Rhodes chords, minimal drum pattern, intimate close-miked vocals

[Chorus] (full, anthemic)
Layered harmonies, big reverb, driving four-on-floor, stadium-wide mix

OUTPUT CONTRACT
Return only the arrangement. No introduction.`;

export const runLlmArrangement = async (state: AppState, dispatch: Dispatch<Action>, signal?: AbortSignal): Promise<void> => {
  dispatch({ type: "ARRANGEMENT_START" });
  const stylePrompt = buildStylePrompt(state.prompt);
  if (!stylePrompt.trim()) {
    dispatch({ type: "ARRANGEMENT_ERROR", message: "Style-Prompt leer — erst Auswahl treffen" });
    return;
  }
  try {
    const chainContext = state.llmOutput
      ? `\n\nCONTEXT — the full style description for the song:\n"${state.llmOutput.trim()}"`
      : "";
    const out = await generate({
      baseUrl: state.settings.ollamaUrl,
      model: pickModel(state, "arrangement"),
      system: buildArrangementSystemPrompt(state.settings.arrangementLength),
      prompt: `Build a song arrangement matching: ${stylePrompt}${chainContext}`,
      temperature: getTaskTemperature(state.settings.creativityMode, "arrangement"),
      signal,
      onChunk: (chunk) => dispatch({ type: "ARRANGEMENT_CHUNK", chunk }),
    });
    dispatch({ type: "ARRANGEMENT_DONE", output: out.trim(), sourceStylePrompt: stylePrompt });
  } catch (e) {
    dispatch({ type: "ARRANGEMENT_ERROR", message: e instanceof Error ? e.message : "Unbekannter Fehler" });
  }
};

// --- Pipeline -------------------------------------------------------------
export const runStyleAndArrangement = async (state: AppState, dispatch: Dispatch<Action>, signal?: AbortSignal): Promise<void> => {
  const sourcePrompt = buildStylePrompt(state.prompt);
  if (!sourcePrompt.trim()) {
    dispatch({ type: "LLM_ERROR", message: "Erst Genre/Subgenre/Mood auswaehlen" });
    return;
  }
  await runLlmBuilder(state, dispatch, signal);
  await runLlmArrangement(state, dispatch, signal);
};

// --- From Idea ------------------------------------------------------------
export const runLlmFromIdea = async (state: AppState, idea: string, dispatch: Dispatch<Action>, signal?: AbortSignal): Promise<void> => {
  dispatch({ type: "LLM_START" });
  try {
    const out = await generate({
      baseUrl: state.settings.ollamaUrl,
      model: pickModel(state, "style"),
      system: SYSTEM_PROMPT_FROM_IDEA,
      prompt: `Die Idee: "${idea}". Baue daraus einen optimalen Suno-Style-Prompt.`,
      temperature: getTaskTemperature(state.settings.creativityMode, "style"),
      signal,
      onChunk: (chunk) => dispatch({ type: "LLM_CHUNK", chunk }),
    });
    dispatch({ type: "LLM_DONE", output: out.trim(), sourceStylePrompt: idea });
  } catch (e) {
    dispatch({ type: "LLM_ERROR", message: e instanceof Error ? e.message : "Unbekannter Fehler" });
  }
};

// --- Title Generator ------------------------------------------------------
const SYSTEM_PROMPT_TITLES = `You generate 5 short, evocative song titles.

RULES
- Each title is a standalone line, no numbering, no quotes, no explanation.
- 1 to 5 words per title.
- Concrete, image-driven. Avoid clichés ("Forever", "Endless Night", "Dreams", "Soul").
- Match the provided style, mood and lyrics if any.
- If a language is specified, titles are in that language.

OUTPUT CONTRACT
Exactly 5 lines, one title per line. Nothing else.`;

export const runLlmTitles = async (state: AppState, dispatch: Dispatch<Action>, signal?: AbortSignal): Promise<void> => {
  dispatch({ type: "TITLES_START" });
  const stylePrompt = buildStylePrompt(state.prompt);
  const lyrics = state.prompt.lyrics.trim();
  const style = state.llmOutput.trim() || stylePrompt;
  if (!style && !lyrics) {
    dispatch({ type: "TITLES_ERROR", message: "Erst Style oder Lyrics erzeugen" });
    return;
  }
  const langs = (state.prompt.vocalLanguages ?? [])
    .filter((l) => !["lang-whisper-only", "lang-simlish", "lang-glossolalia", "lang-phonetic", "lang-scat", "lang-ooh-aah"].includes(l))
    .map((l) => l.replace(/^lang-/, "")).join(", ");
  const userPrompt = [
    style ? `Style: ${style}` : "",
    lyrics ? `Lyrics excerpt:\n${lyrics.slice(0, 400)}` : "",
    langs ? `Language: ${langs}` : "",
    "Generate 5 song titles.",
  ].filter(Boolean).join("\n\n");
  try {
    const out = await generate({
      baseUrl: state.settings.ollamaUrl,
      model: pickModel(state, "title"),
      system: SYSTEM_PROMPT_TITLES,
      prompt: userPrompt,
      temperature: getTaskTemperature(state.settings.creativityMode, "title"),
      signal,
    });
    const titles = out.split("\n")
      .map((l) => l.trim().replace(/^[-*0-9.)"'\s]+/, "").replace(/["']+$/, ""))
      .filter((l) => l && l.length < 80).slice(0, 5);
    dispatch({ type: "TITLES_DONE", titles });
  } catch (e) {
    dispatch({ type: "TITLES_ERROR", message: e instanceof Error ? e.message : "Unbekannter Fehler" });
  }
};

// --- Refinement -----------------------------------------------------------
export const runRefinement = async (state: AppState, dispatch: Dispatch<Action>, target: "style" | "arrangement", feedback: string, signal?: AbortSignal): Promise<void> => {
  const current = target === "style" ? state.llmOutput : state.llmArrangement;
  if (!current.trim() || !feedback.trim()) return;
  const system = target === "style"
    ? `${SYSTEM_PROMPT_BUILDER}\n\nYou are refining a previous output based on user feedback. Keep the good parts, change what the feedback says.`
    : `${buildArrangementSystemPrompt(state.settings.arrangementLength)}\n\nYou are refining a previous arrangement based on user feedback.`;
  const userPrompt = `PREVIOUS OUTPUT:\n${current}\n\nUSER FEEDBACK: ${feedback}\n\nRewrite the output incorporating the feedback. Return only the new version.`;

  if (target === "style") dispatch({ type: "LLM_START" });
  else dispatch({ type: "ARRANGEMENT_START" });

  try {
    const out = await generate({
      baseUrl: state.settings.ollamaUrl,
      model: pickModel(state, target === "style" ? "style" : "arrangement"),
      system, prompt: userPrompt,
      temperature: getTaskTemperature(state.settings.creativityMode, target === "style" ? "style" : "arrangement"),
      signal,
      onChunk: (chunk) =>
        dispatch(target === "style" ? { type: "LLM_CHUNK", chunk } : { type: "ARRANGEMENT_CHUNK", chunk }),
    });
    if (target === "style") {
      dispatch({ type: "LLM_DONE", output: out.trim(), sourceStylePrompt: state.llmSourceStylePrompt });
    } else {
      dispatch({ type: "ARRANGEMENT_DONE", output: out.trim(), sourceStylePrompt: state.llmArrangementSourceStylePrompt });
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unbekannter Fehler";
    if (target === "style") dispatch({ type: "LLM_ERROR", message: msg });
    else dispatch({ type: "ARRANGEMENT_ERROR", message: msg });
  }
};

// --- Self-Critique (Lyrics) -----------------------------------------------
const SYSTEM_PROMPT_CRITIQUE_LYRICS = `You are a strict songwriting editor.

TASK
Review the provided song lyrics. Find lines that break any of these rules:
1. Contains cliché phrases or forbidden rhyme pairs (Herz/Schmerz, fire/desire, love/above, shattered dreams, endless night, etc.)
2. States an emotion without a concrete image ("I feel sad", "my heart is broken").
3. Invented words, broken grammar, wrong conjugation.
4. Missing rhyme in a section that should rhyme.
5. Verse and Chorus have the same syllable count.

OUTPUT
Return the lyrics with the offending lines REWRITTEN. Keep section tags, keep good lines as-is. Do not add explanation. Output only the corrected lyrics.`;

export const runSelfCritiqueLyrics = async (state: AppState, dispatch: Dispatch<Action>, signal?: AbortSignal): Promise<string | null> => {
  const current = state.prompt.lyrics.trim();
  if (!current) return null;
  try {
    const out = await generate({
      baseUrl: state.settings.ollamaUrl,
      model: pickModel(state, "lyrics"),
      system: SYSTEM_PROMPT_CRITIQUE_LYRICS,
      prompt: `ORIGINAL LYRICS:\n${current}\n\nRewrite offending lines.`,
      temperature: getTaskTemperature(state.settings.creativityMode, "critique"),
      signal,
    });
    const trimmed = out.trim();
    if (trimmed && trimmed !== current) {
      dispatch({ type: "SET_LYRICS", lyrics: trimmed });
      return trimmed;
    }
    return null;
  } catch { return null; }
};

export { buildArrangementSystemPrompt };
```

# SOURCE — src/lib/validator.ts
```ts
import type { PromptState, ValidationIssue } from "@/types";
import { dosDonts, findConflictingMoods } from "./knowledge";
import { getSubgenreById } from "./allGenres";

const STYLE_HARD_LIMIT = 1000;
const DESCRIPTOR_MIN = 4;
const DESCRIPTOR_MAX = 7;
const INSTRUMENTS_MAX = 3;
const FORBIDDEN = ["create", "make", "generate", "compose", "please"];

export const validate = (state: PromptState, stylePrompt: string): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  if (stylePrompt.length > STYLE_HARD_LIMIT) {
    issues.push({ severity: "error", message: `Style-Prompt ${stylePrompt.length} Zeichen — Suno schneidet bei ${STYLE_HARD_LIMIT} still ab.` });
  }

  const descriptorCount = stylePrompt.split(",").map((s) => s.trim()).filter(Boolean).length;
  if (descriptorCount > 0 && descriptorCount < DESCRIPTOR_MIN) {
    issues.push({ severity: "warn", message: `Nur ${descriptorCount} Descriptoren — zu generisch. Mindestens ${DESCRIPTOR_MIN} anstreben.` });
  }
  if (descriptorCount > DESCRIPTOR_MAX) {
    issues.push({ severity: "warn", message: `${descriptorCount} Descriptoren — Dilution-Risiko. Sweet Spot: ${DESCRIPTOR_MIN}–${DESCRIPTOR_MAX}.` });
  }

  const conflicts = findConflictingMoods(state.moods);
  conflicts.forEach(([a, b]) =>
    issues.push({ severity: "warn", message: `Widerspruechliche Moods: "${a}" + "${b}"`, field: "moods" }),
  );

  if (state.instruments.length > INSTRUMENTS_MAX) {
    issues.push({ severity: "warn", message: `${state.instruments.length} Instrumente — Suno kann verwirren. Limit: ${INSTRUMENTS_MAX}.`, field: "instruments" });
  }

  const lowerPrompt = stylePrompt.toLowerCase();
  const hits = FORBIDDEN.filter((w) => new RegExp(`\\b${w}\\b`).test(lowerPrompt));
  if (hits.length) {
    issues.push({ severity: "warn", message: `Befehls-Keywords gefunden: ${hits.join(", ")} — Suno ignoriert Kommandos.` });
  }

  const allTags = [...state.instruments, ...state.production, ...(state.customTags ?? [])].map((t) => t.toLowerCase());
  const seen = new Set<string>();
  const dupes = new Set<string>();
  for (const t of allTags) {
    if (seen.has(t)) dupes.add(t);
    else seen.add(t);
  }
  if (dupes.size > 0) {
    issues.push({ severity: "warn", message: `Doppelte Tags: ${[...dupes].join(", ")} — einmal reicht.` });
  }

  if (!state.bpm) {
    issues.push({ severity: "info", message: "Kein BPM angegeben — Groove ist unverankert.", field: "bpm" });
  } else {
    const sub = getSubgenreById(state.subgenre);
    if (sub && (state.bpm < sub.bpm_min || state.bpm > sub.bpm_max)) {
      issues.push({ severity: "info", message: `${state.bpm} BPM liegt ausserhalb der ueblichen Range ${sub.bpm_min}–${sub.bpm_max} fuer ${sub.name}.`, field: "bpm" });
    }
  }

  if (!state.mainGenre && !state.subgenre) {
    issues.push({ severity: "warn", message: "Kein Genre gewaehlt — Suno wird generisch.", field: "genre" });
  }

  const hasProgression = state.production.some((t) => t.startsWith("pr-"));
  const hasKey = state.production.some((t) => t.startsWith("key-"));
  if (hasProgression && !hasKey) {
    issues.push({ severity: "info", message: "Akkordfolge gewaehlt, aber keine Tonart — Suno rateten die Key.", field: "harmony" });
  }

  const negSet = new Set(state.negatives.map((n) => n.replace(/^no /, "").toLowerCase()));
  const contraInstruments = state.instruments.filter((i) =>
    [...negSet].some((n) => i.toLowerCase().includes(n)),
  );
  if (contraInstruments.length > 0) {
    issues.push({ severity: "error", message: `Ausschluss kollidiert mit Instrument: ${contraInstruments.join(", ")}.`, field: "negatives" });
  }

  return issues;
};

export { dosDonts };

export const preflightCheck = (state: PromptState): string[] => {
  const warnings: string[] = [];
  const hasNoVocals = state.negatives.some((n) => /^(no )?vocals?$/i.test(n.trim()));
  if (hasNoVocals && (state.vocalCharacter || state.vocalDelivery || (state.vocalLanguages ?? []).length)) {
    warnings.push("Widerspruch: 'no vocals' im Ausschluss, aber Vocal-Character/Delivery/Language gesetzt. Entscheide dich.");
  }
  if (!state.mainGenre && !state.subgenre && state.instruments.length === 0 && state.moods.length === 0) {
    warnings.push("Keine Auswahl — generiere einen generischen Prompt. Mindestens Genre oder Mood waehlen.");
  }
  if (state.instruments.length > 5) {
    warnings.push(`${state.instruments.length} Instrumente — Suno gibt bei >5 oft zufaellige Prioritaet.`);
  }
  const moodConflict = /\b(calm)\b.*\b(aggressive|intense|harsh)\b|\b(aggressive|intense|harsh)\b.*\b(calm)\b/i;
  const joinedMoods = state.moods.join(" ");
  if (moodConflict.test(joinedMoods)) {
    warnings.push("Widerspruechliche Moods (ruhig + aggressiv) — Suno kann das nicht aufloesen.");
  }
  return warnings;
};
```

# SOURCE — src/lib/suggestions.ts
```ts
export type SuggestionSet = {
  key: string;
  moods: string[]; drums: string[]; bass: string[];
  vocals: string[]; production: string[];
};

const SUGGESTIONS: SuggestionSet[] = [
  { key: "house", moods: ["euphoric", "feel-good"], drums: ["four-on-the-floor kick", "tight snare"], bass: ["side-chained bass", "warm bass"], vocals: ["soulful female", "vocal chops"], production: ["wide stereo field", "punchy"] },
  { key: "techno", moods: ["hypnotic", "dark"], drums: ["four-on-the-floor kick", "machine hi-hats"], bass: ["sub bass", "rolling bass"], vocals: ["rarely vocal", "vocoder"], production: ["industrial", "dry and tight"] },
  { key: "trance", moods: ["euphoric", "uplifting"], drums: ["rolling hats", "snare roll"], bass: ["rolling bass"], vocals: ["ethereal female", "anthemic"], production: ["wide stereo field", "big reverb"] },
  { key: "drum_and_bass", moods: ["energetic", "dark"], drums: ["amen break", "breakbeat"], bass: ["reese bass", "rolling bass"], vocals: ["vocal chops", "female"], production: ["punchy", "wide stereo field"] },
  { key: "dubstep", moods: ["aggressive", "dark"], drums: ["snare hits on 3", "heavy kick"], bass: ["wobble bass", "growly bass"], vocals: ["vocal chops"], production: ["compressed and loud"] },
  { key: "trap", moods: ["confident", "dark"], drums: ["trap hi-hats", "tuned 808"], bass: ["tuned 808", "sub bass"], vocals: ["melodic rap", "confident male"], production: ["punchy compressed mix", "half-time feel"] },
  { key: "synthwave", moods: ["nostalgic", "dreamy"], drums: ["gated snare", "analog drums"], bass: ["analog bass", "moog bass"], vocals: ["retro vocals", "airy female"], production: ["80s neon nostalgia", "gated reverb"] },
  { key: "lofi", moods: ["nostalgic", "chill"], drums: ["swung drums", "dusty samples"], bass: ["soft bass", "warm bass"], vocals: ["no vocals"], production: ["vinyl crackle", "tape warmth"] },
  { key: "rnb", moods: ["soulful", "intimate"], drums: ["soft swung drums"], bass: ["upright bass", "warm bass"], vocals: ["smooth female", "soulful delivery"], production: ["analog warmth", "intimate close"] },
  { key: "hiphop", moods: ["confident", "dark"], drums: ["boom bap", "tight snare"], bass: ["warm bass", "deep 808"], vocals: ["confident male rapper"], production: ["compressed vocals", "punchy"] },
  { key: "phonk", moods: ["dark", "aggressive"], drums: ["cowbells", "distorted drums"], bass: ["distorted 808"], vocals: ["pitched-down vocals", "spoken word"], production: ["lo-fi filtered", "tape saturation"] },
  { key: "rock_classic", moods: ["energetic", "raw"], drums: ["acoustic live drums", "tight snare"], bass: ["electric bass", "punchy bass"], vocals: ["powerful male", "raspy"], production: ["live feel", "warm analog"] },
  { key: "metal_heavy", moods: ["aggressive", "intense"], drums: ["double bass kick", "thunderous"], bass: ["distorted bass"], vocals: ["growled", "screamed"], production: ["compressed and loud", "scooped mids"] },
  { key: "grunge_90s", moods: ["dark", "raw"], drums: ["acoustic drums natural room"], bass: ["reese bass detuned"], vocals: ["male baritone", "raspy"], production: ["raw", "90s production"] },
  { key: "punk", moods: ["rebellious", "raw"], drums: ["fast drums", "tight snare"], bass: ["driving bass"], vocals: ["rebellious punk attitude"], production: ["raw", "unpolished"] },
  { key: "alternative", moods: ["dreamy", "melancholic"], drums: ["tight drums"], bass: ["warm bass"], vocals: ["airy female", "breathy"], production: ["wall of sound", "reverb-drenched"] },
  { key: "pop", moods: ["uplifting", "feel-good"], drums: ["tight drums"], bass: ["warm bass"], vocals: ["bright female", "polished"], production: ["polished radio-ready mix"] },
  { key: "indie", moods: ["nostalgic", "dreamy"], drums: ["soft drums"], bass: ["warm bass"], vocals: ["dreamy female", "intimate"], production: ["intimate close", "warm pads"] },
  { key: "jazz", moods: ["smoky", "intimate"], drums: ["brushed drums", "swung"], bass: ["upright bass", "walking"], vocals: ["seasoned jazz crooner"], production: ["warm analog", "live feel"] },
  { key: "blues", moods: ["soulful", "melancholic"], drums: ["shuffle pattern"], bass: ["walking bass"], vocals: ["weathered", "raspy"], production: ["warm analog", "live feel"] },
  { key: "classical", moods: ["dramatic", "emotional"], drums: ["timpani"], bass: ["double bass"], vocals: ["soprano", "choir"], production: ["cathedral reverb", "orchestral dynamics"] },
  { key: "ambient", moods: ["ethereal", "peaceful"], drums: ["no drums"], bass: ["sub drone"], vocals: ["ethereal", "wordless"], production: ["cathedral reverb", "vast expansive"] },
  { key: "soundtrack", moods: ["cinematic", "epic"], drums: ["taiko hits", "thunderous"], bass: ["sub impact"], vocals: ["ethereal choir", "powerful female"], production: ["stadium reverb", "epic orchestral"] },
  { key: "reggae", moods: ["feel-good", "intimate"], drums: ["rimshot", "offbeat"], bass: ["warm rolling bass"], vocals: ["warm male", "melodic"], production: ["warm reggae groove"] },
  { key: "latin", moods: ["passionate", "energetic"], drums: ["clave", "timbales"], bass: ["bassline"], vocals: ["passionate vocals"], production: ["warm", "live feel"] },
  { key: "country", moods: ["storytelling", "warm"], drums: ["shuffle"], bass: ["upright bass"], vocals: ["drawl vocals", "storytelling"], production: ["warm", "live feel"] },
  { key: "folk", moods: ["intimate", "nostalgic"], drums: ["light shaker"], bass: ["soft bass"], vocals: ["warm male", "storytelling"], production: ["intimate close", "warm"] },
];

const FALLBACK: SuggestionSet = {
  key: "default",
  moods: ["nostalgic", "dreamy"],
  drums: ["tight drums"], bass: ["warm bass"], vocals: ["smooth vocals"],
  production: ["polished", "wide stereo field"],
};

export const getSuggestions = (parent: string | undefined): SuggestionSet => {
  if (!parent) return FALLBACK;
  return SUGGESTIONS.find((s) => s.key === parent) ?? FALLBACK;
};
```

---

# COMPONENTS (vollständig)

## src/components/Header.tsx
Logo + Mode-Toggle (simple/custom/studio) + OllamaDot (30s-Polling auf /api/tags) + "Aus Idee" + Settings + Reset. SelectionBadge zählt mainGenre+subgenre+moods+instruments+negatives+production+customTags+vocalCharacter/Delivery/Effects.

## src/components/Sidebar.tsx
Akkordeon-Sidebar. countForCategory mappt Tag-Prefixes auf Counter:
- genre: mainGenre + subgenre + secondaryGenre + soundsLike
- mood: moods.length
- form: production.filter(/^(form-|ft-|sl-|trans-)/)
- vocals: vocalCharacter + Delivery + vocalFxCount + Languages
- rhythm/melody: instruments.length (shared)
- harmony: production.filter(/^(key-|pr-|m-)/)
- tempo: bpm ? 1 : 0
- production: production.filter(none of above prefixes)
- lyrics: title + lyrics + production.filter(/^(th-|lt-|narr-|uc-)/)
- tags: customTags + negatives

## src/components/Content.tsx
Aktive Section mit Icon-Header + OptimalOrderBanner + AvoidBanner + renderSection(activeSection).

## src/components/AccordionSection.tsx
Wiederverwendbar mit `title`, `optional`, `selectionCount`, `matchCount`, `onClear`, `defaultOpen`. Selection-Badge wenn count>0. Clear-X-Button rechts neben Count.

## src/content/CheckList.tsx
Suchbare Checklist mit Toggle. items: `{ id, label, hint? }[]`. searchable togglebar. maxHeight default `max-h-72`.

## src/components/InfoBanner.tsx
- `OptimalOrderBanner` — collapsible: "Genre → Mood → Instrumente → Vocals → Production" mit Erklärungs-DL
- `AvoidBanner` — rote Box: "Sätze statt Tags · widersprüchliche Tags · Künstlernamen · 3+ Genres mischen"

## src/components/InfoModal.tsx
Modal für `state.infoModal === "manual" | "imprint"`.

```tsx
const MANUAL = { title: "Handbuch", body: [
  { h: "Modi", p: "Simple = schneller Prompt, Custom = volle Kontrolle, Studio = für Suno Studio-Workflows." },
  { h: "Grundstil", p: "Haupt- und Subgenre wählen. Zweitstil optional für Fusionen (max. 2 Genres). 'Klingt wie' nutzt Ollama, um den Sound eines Künstlers zu beschreiben." },
  { h: "Gesang", p: "Stimmtyp, Vortragsstil, FX und Sprache wählen. Mehrere Sprachen möglich (Multi-Select)." },
  { h: "KI-Ausformulierung", p: "Rechts im Preview. Generiert aus deinen Auswahlen einen fertigen Suno-Style-Prompt via Ollama." },
  { h: "Tastenkürzel", p: "Enter im 'Klingt wie'-Feld startet die Analyse." },
  { h: "Ollama", p: "Muss lokal unter http://localhost:11434 laufen. Status-Dot oben rechts zeigt Verbindung." },
]};
const IMPRINT = { title: "Impressum", body: [
  { h: "Anbieter", p: "Martin Deppe" },
  { h: "Kontakt", p: "martindeppe1@googlemail.com" },
  { h: "Anwendung", p: "Music Prompt Studio v2 — Open-Source-Tool zur Erstellung von Suno-Prompts. Lokaler Einsatz, keine Datensammlung." },
  { h: "Haftungsausschluss", p: "Generierte Prompts sind Vorschläge. Für kommerzielle Nutzung der KI-generierten Musik gelten die Suno-Nutzungsbedingungen." },
]};
```

## src/components/IdeaModal.tsx
Textarea (4 Zeilen) + Generieren-Button → `runLlmFromIdea(state, idea, dispatch)`. Streamt llmOutput live in Preview-Pre. Reset-Button `LLM_RESET`.

## src/components/PromptPreviewModal.tsx
2-Spalten-Modal (md), zeigt `state.promptPreview.system` + `.user` als monospace-pre. "Alles kopieren" → `# SYSTEM\n...\n\n# USER\n...`.

## src/components/VariantsPanel.tsx
```tsx
const VARIANTS = [
  { id: "safe", label: "Safe / Radio", icon: Shield, color: "text-sky-400" },
  { id: "experimental", label: "Experimental", icon: FlaskConical, color: "text-fuchsia-400" },
  { id: "minimal", label: "Minimal", icon: Minus, color: "text-emerald-400" },
  { id: "intense", label: "Intense", icon: Zap, color: "text-orange-400" },
];
```
4-Karten-Grid. apply(text) → `LLM_DONE`. Copy via clipboard.

## src/components/SettingsPanel.tsx
Modal-Overlay. Sektionen:
1. Ollama-Endpoint (URL-Input + "Testen"-Button → ping → StatusPill idle/checking/online/offline)
2. Modell (Select aus `listModels`, zeigt name · parameter_size · family) + Hinweis-Box (qwen2.5:14b für DE, llama3.1:8b/qwen2.5:7b für EN)
3. Kreativitätsmodus (4-Button-Grid: konservativ/balanced/kreativ/wild)
4. Arrangement-Länge (3-Button-Grid: kurz 1.5-2.5/standard 3-4/episch 4-6+ min)
5. Qualitäts-Gates (2 Checkboxen: autoRetryOnCliche, selfCritiqueLyrics)
6. Model-Routing (3 Selects: modelStyle, modelArrangement, modelLyrics; "— Hauptmodell —" als Default)
7. Temperature (Legacy-Slider 0–1.5)

## src/components/Preview.tsx (rechte Spalte, ~680 Zeilen)
Reihenfolge oben→unten:
1. **Presets** (collapsible) — `addPreset` via `prompt("Preset-Name:")`, Load via `LOAD_PROMPT_STATE`, Delete via `removePreset`
2. **Pre-Flight Warnings** — `preflightCheck`-Output als gelbe Boxen
3. **Pipeline-Button** "Full Pipeline (Style + Arrangement)" → `runStyleAndArrangement`
4. **Mode-Badge + Export/Import JSON**
5. **Style Prompt (Roh)** — `buildStylePrompt`, Char-Limit-Bar (Limit = mode==='studio'?5000:mode==='custom'?1000:500), Copy
6. **KI-Ausformulierung** — `runLlmBuilder`, "veraltet"-Stale-Badge, Refine-Input (Enter-Submit), Eye-Button → `SHOW_PROMPT_PREVIEW`
7. **KI-Arrangement** — `runLlmArrangement`, Stale-Badge, Refine, Eye
8. **Titel-Generator** — `runLlmTitles`, je Titel "übernehmen" (→`SET_TITLE`) + Copy
9. **VariantsPanel**
10. **Validator-Issues** — `validate(prompt, stylePrompt).slice(0, 5)`
11. **"In Suno öffnen"** — copy + window.open suno.com/create
12. **"In Verlauf speichern"** → `addHistoryEntry`
13. **Verlauf** (collapsible) — Suchfeld (filtert title|stylePrompt|llmOutput), Liste max 10, Click restores via `LOAD_PROMPT_STATE` + LLM_DONE/RESET, Star-Rating via `prompt("Rating 1-5:")`, Trash

## src/content/registry.tsx
```tsx
const REGISTRY: Record<string, Entry> = {
  grundstil: { component: Grundstil },
  aera: { component: Aera },
  dynamik: { component: Dynamik },
  emotionen: { component: Emotionen },
  tempo: { component: Tempo },
  "sound-quality": { component: SoundQuality },
  gesang: { component: Gesang },
  "song-thema": { component: SongThema },
  "style-tags": { component: StyleTags },
  "exclude-styles": { component: ExcludeStyles },
  blueprint: { component: Blueprint },
  "suno-studio": { component: SunoStudio },
  templates: { component: Templates },
  lyrics: { component: Lyrics },
  stuecktyp: { component: Stuecktyp },
  drums: { component: Drums },
  percussion: { component: Percussion },
  bass: { component: Bass },
  guitars: { component: Guitars },
  keys: { component: Keys },
  winds: { component: Winds },
  earcandy: { component: Earcandy },
  harmony: { component: Harmony },
  structure: { component: Structure },
  "mix-master": { component: MixMaster },
};
export const renderSection = (sectionId, sectionLabel) => {
  const entry = REGISTRY[sectionId];
  if (!entry) return <Placeholder sectionLabel={sectionLabel} />;
  return <entry.component />;
};
```

---

# CONTENT-SECTIONS — Daten & Tag-IDs (alle 26)

Jede Section ist eine .tsx-Datei mit AccordionSection + CheckList. Alle Tag-IDs
beachten das Prefix-Routing (siehe oben). Nachstehend die kompletten Vokabulare.

## Templates.tsx
Lädt Template via `LOAD_TEMPLATE` (setzt bpm, title, customTags = stylePrompt.split(",")) + springt zu `grundstil`. Zeigt Grid mit BPM + style_prompt + Erklärungs-Akkordeon.

## Grundstil.tsx
Akkordeons: Hauptgenre (MAIN_GENRES), Subgenre (getSubgenresByMain), Zweitstil (Fusion, optional), SoundsLike (Künstler-Referenz mit Ollama-Analyse → soundsLikeDescription, Submit per Enter, "Tags in Style-Tags übernehmen" splittet description an "," in customTags).
**SoundsLike-Logik:** Nutzt einen kleinen System-Prompt (englisch, kommagetrennte Tags, 8-14 Tags, keine Künstlernamen), temp 0.4. Streamt direkt in `soundsLikeDescription`.
**SmartSuggestions:** Wenn sub gewählt, grüne Box "Passend zu: <subname>" mit `getSuggestions(sub.parent)` → Buttons je Mood/Drums/Bass/Vocals/Production. "Alle übernehmen" dispatcht alles parallel.

## Aera.tsx
Drei Accordions, alle dispatchen `TOGGLE_PRODUCTION` (Tags landen in production[]).

**DECADES (era-*):** era-1920s/1930s/1940s/early50s/late50s/early60s/late60s/early70s/late70s/early80s/late80s/early90s/late90s/early2000s/late2000s/early2010s/late2010s/early2020s/2020s-now/timeless

**PRODUCTION_ERAS (prod-*):** prod-acoustic-age/early-electric/tape-mono/tape-stereo/70s-warm/80s-digital/80s-drum-machine/90s-grunge/90s-adat/90s-sampler/2000s-daw/2000s-loudness/2010s-streaming/2010s-trap-prod/vintage/retro/modern/lofi/hifi/underground/radio/bedroom

**KLANG_REFERENZ (ref-*):** ref-motown-funk-brothers/wall-of-sound/spector-drums/abbey-road-66/studio-one-kingston/muscle-shoals/sun-studio/fame-studios/stax-memphis/chess-records/dfa-records/trident-studios/electric-lady/record-plant/compass-point/pye-studios/conny-plank/hansa-berlin/larrabee-la/skywalker-sound/sarm-west/town-house

## Emotionen.tsx
**Stimmung:** dispatcht `TOGGLE_MOOD`. Items aus `moods.groups` flattened (alle 7 Gruppen).

**ENERGY_LEVELS:** drone-static/ultra-minimal/whisper-quiet/breath-soft/very-low/low/chill-wave/mid-low/mid/medium-groove/mid-high/head-nod/high/dance-energy/anthemic/very-high/epic-climax/overdrive-explosive/maximum-intensity/maximal — `TOGGLE_PRODUCTION`

**CINEMATIC_TAGS:** epic-build/tension/release/triumphant/melancholic-strings/heroic/sinister/mystery/rising-action/falling-action/massive-hit/whisper-intro/villain-motif/love-theme/action-cue/chase-scene/horror-tension/revelation/denouement/final-battle/victory/defeat/melancholy-flashback/nostalgic-memory/hope-restored/dark-descent/awakening/transformation/betrayal/redemption/sacrifice/journey-begins/homecoming/loss-grief/wonder-awe/cold-open/interlude-calm/stinger/source-music/underscoring/leitmotif/end-credits/overture

**EMOTIONAL_ARCS (ea-*):** ea-steady/rising/falling/peaks-valleys/rollercoaster/slow-build-big-release/quiet-loud-quiet/crescendo/decrescendo/wave/spiral/plateau/explosion-decay/intro-drop/arch/fragmented/circular

## Dynamik.tsx
Vier Accordions, alle `TOGGLE_PRODUCTION`.

**FLOW (flow-*):** static/building/explosive/wave/fading/peak-middle/slow-burn/call-response/terraced/micro-dynamics/rubber-band/tension-hold/delayed-peak/early-peak/cyclic/spiral/fragmented/inverse-build/plateau/sudden-drop/cinematic-swell

**DROPS:** drop-massive/minimal/tension-release/false-drop, build-riser/snare-roll/silence, no-drop, drop-festival/half/melodic/bass-wub/808-heavy/hypnotic-loop/reese-bass/amen-break/trance-climax/scream/orchestra-stab/chord-stab/filter-open/reverse-cymbal/vocal-chop/pitch-riser/subtle-bass/double

**DYNAMIC_RANGE (dyn-*):** crushed/compressed/balanced/open/orchestral/punchy/smooth/pumping/natural/limiter-slammed/lufs-streaming/wide-range

**ENERGY_PROFILE (ep-*):** steady-climb/peaks-valleys/climax-mid/late-bloomer/fast-start/two-peaks/tidal/flat-line/staircase/downward-arc/pulse

## Tempo.tsx
**BPM:** Range-Slider 20–400 + Number-Input → `SET_BPM`. Empfehlungs-Box wenn Subgenre gewählt (sub.bpm_min–sub.bpm_max).

**GROOVES:** four-on-the-floor/swung/straight/half-time/double-time/syncopated/laid-back/pushed/polyrhythm/broken-beat/groove-boom-bap/amapiano/dembow/afrobeat/neo-soul/trance-rolling/dnb-breakbeat/drum-funk/shuffle-hard/shuffle-light/reggae/ska-offbeat/soca/bossa/samba/cumbia/baile-funk/trap-hi-hat/jersey-club/footwork/two-step/krautrock

**TIME_SIGNATURES (ts-*):** 4-4/3-4/6-8/12-8/5-4/7-4/7-8/5-8/9-8/11-8/2-4/cut-time/polymeter/mixed-meter/free-time

**TEMPO_CHARACTER (tc-*):** rushing/laid-back-feel/on-the-grid/human/quantized/elastic/rubato/metronomic/drunk/accelerando/ritardando/micro-timing

## SoundQuality.tsx
Drei Accordions, alle `TOGGLE_PRODUCTION`.

**QUALITY (q-*):** polished/radio-ready/studio-quality/broadcast/hifi/pristine/crystal/audiophile/superaudio/24bit (Polished); tape-warmth/vintage/analog-warm/abbey-road/motown/70s-riaa/80s-digital (Analog); raw/gritty/lofi/demo-quality/bedroom/garage-rough/punk-demo/cassette/vhs-audio/am-radio/lofi-bandcamp (Raw); streaming-mastered/vinyl-master/90s-adat/2000s-mp3/loudness-war/dynamic-streaming/boutique-studio (Modern)

**SUNO_MAGIC (m-*):** spacious/vocal-forward/wide-stereo/crisp-high/warm-bass/punchy/hyper-realistic/compressed-vocals/natural-dynamics/gentle-compression/cinematic-wide/intimate-close/radio-ready/festival-loud/club-loud/listening-mix/balanced/sparkling-top/round-bottom/dynamic-swing/modern-loud/audiophile-balanced/lush/airy/dry-mix

**SPACE (sp-*):** intimate/tight-dry/bedroom/vast/cathedral/stadium/gated/plate/spring/tape-delay/small-room/large-hall/chamber/ambient/basement/warehouse/vocal-booth/outdoor/forest/telephone/underwater/lofi-room/short-predelay/huge-ambient/shimmer

## Gesang.tsx
**VOICE_TYPES** → `SET_VOCAL_CHARACTER`: soprano-f/mezzo-f/alto-f/contralto-f/coloratura-soprano/dramatic-soprano/lyric-soprano/spinto-soprano/boy-soprano/girl-soprano/countertenor/castrato-style/lyric-tenor/dramatic-tenor/heldentenor/tenor-m/baritone-m/bass-baritone/bass-m/low-range-bass/androgynous/androgynous-ambiguous/child-voice/teen-voice/young-adult/mature-voice/elderly-weathered/robotic-synthetic/duet/choir/instrumental

**DELIVERIES** → `SET_VOCAL_DELIVERY`: whispered/spoken/breathy/belted/powerful/gentle/aggressive/soulful/operatic/rapped/falsetto/growled/screamed/melismatic/passionate/longing/vulnerable/confident/seductive/sarcastic/playful/melancholic-del/triumphant-del/defeated/hopeful/cynical/ethereal/dreamy/intense/restrained/loose-laid-back/pushed-urgent/rhythmic-staccato/legato-flowing/crooning/chanting/yodeling/scatting/humming

**VOCAL_FX** → `SET_VOCAL_EFFECTS` (split per ", "): reverb-drenched/dry-close-mic/auto-tuned/doubled-harmonies/layered-harmonies/lo-fi-filtered/bitcrushed/reversed/harmonizer/lo-fi-telephone/radio-effect/flanger/pitch-down/pitch-up/formant-shift/vocoder/talkbox/cathedral-reverb/plate-reverb/spring-reverb/tape-delay-slap/ping-pong-delay/chorus-vocals/double-tracked/comb-filtered/ring-modulated/granular-freeze/stutter-edit/gated-vocals/sidechain-vocals/underwater/distorted-vocals/chopped-screwed/slowed-reverb/nightcore-sped

**LANGUAGES (lang-*)** → `TOGGLE_VOCAL_LANGUAGE`: lang-de/en/es/fr/it/pt/ja/ko/zh/ar/hi/ru/tr/nl/sv/fi/no/da/el/pl/cs/hu/ro/bg/sr/hr/he/ta/bn/th/vi/id/sw/yo/xh/zu/la/grc/non/ang/sa/kli/sindarin/enya-gaelic + Non-Lexical: lang-simlish/glossolalia/phonetic/scat/ooh-aah/whisper-only

## SongThema.tsx
Vier Accordions, alle `TOGGLE_PRODUCTION`.

**THEMES (th-*):** love/heartbreak/longing/unrequited-love/new-love/long-distance/obsession/jealousy/friendship/family/childhood/nature/sea/mountains/forest/seasons/weather/night/dawn/city/suburbia/road-trip/travel/exile/homecoming/party/escape/freedom/rebellion/self-doubt/self-discovery/identity/gender/growing-up/aging/hope/spiritual/religion/philosophy/existential/money/work/failure/story/social/war/peace/environment/technology/internet/social-media/pandemic/mental-health/trauma/healing/addiction/nostalgia/memory/dreams/visions/memento-mori/afterlife/fantasy/scifi/horror/mythology/art-music/dance/sport/community/solitude/loneliness/power/justice/time/parallel-worlds/history/future-vision/pop-culture/night-life/anonymity/revenge/forgiveness

**USE_CASES (uc-*):** club/radio/film/trailer/videogame/podcast-intro/radio-jingle/festival-closer/nightclub/after-hours/chill-lounge/restaurant-bg/spa-yoga/workout/running/cycling/lifting/boxing/study/sleep/meditation/background/commercial/wedding/funeral/kids-birthday/christmas/halloween/intro/twitch/youtube-outro/tiktok/instagram-reel/gaming/corporate/documentary/fashion-show/art-installation/theater/short-film/alarm-ringtone

**LYRICAL_TONE (lt-*):** poetic/direct/cryptic/humorous/sarcastic/intimate/anthemic/storytelling/stream-of-consciousness/vulnerable/bragging/minimalist/abstract/concrete/nostalgic/futuristic/mystical/profane/sacred/provocative/confessional/playful/dark/philosophical/ironic/documentary

**NARRATIVE_PERSPECTIVE (narr-*):** first-person/second-person/third-person/omniscient/collective-we/character/dialog/observer/unreliable/stream

## StyleTags.tsx
Eigene Tags via Input + Enter (`TOGGLE_CUSTOM_TAG`). 200+ COMMON_TAGS in Chip-Liste (Synths, Gitarren, Drums, Bass, Tasten, Brass/Strings, Vocals, Production-Techniken, Atmosphäre, Sound-Design).

## ExcludeStyles.tsx
Vier Accordions mit `TOGGLE_NEGATIVE`:
- INSTRUMENTS (vocals/guitar/electric guitar/...)
- EFFECTS (reverb/delay/distortion/...)
- VOCALS (male/female/duet/...)
- EXCLUDE_GENRES ("no trap"/"no edm"/...)

## Blueprint.tsx
**5-Part-Formel-Display:** Genre/Mood/Vocals/Instrumente/Production/BPM aus aktuellem PromptState. Beispiel-Songstruktur als Pre-Block. "KI-Blueprint generieren" → `runLlmBuilder`.

## SunoStudio.tsx
Tag-Baukasten für Studio-Mode. Alle dispatchen `TOGGLE_PRODUCTION`.
- **Strukturelle Tags:** aus `tags.structure.tags`
- **Vokal-FX-Tags:** [Whispered], [Belted], [Screamed], [Falsetto], [Spoken], [Harmonies], [Ad-libs], [Vocal Run], [Choir], [Rapped]
- **Dynamik-Tags:** aus `tags.dynamic.tags`
- **Emotional-Modifiers:** aus `tags.emotional_modifiers.tags`
- **Kreativ-Tags V4.5+:** [Hyper-Realistic], [Crowd Sings], [Acapella], [Break: Silence], [Half-Time], [Double Time], [Key Change]
- **Parametrisierte Tags (Pro):** [Intro: ambient buildup, no drums], [Outro: fade out, reverb tail], [Drop: massive bass, EDM energy], etc.

## Stuecktyp.tsx
Vier Accordions, `TOGGLE_PRODUCTION`.

**FORM_TYPE (ft-*):** song/instrumental/interlude/jam/suite/remix/edit/radio-edit/extended-mix/dub-version/demo/live/acoustic/ballad/acapella/karaoke/alt-take/deconstructed/ambient-mix/bootleg/live-jam/studio-jam/improvisation/etude/prelude/fantasie/nocturne/rhapsody/overture/finale/medley/loop

**ENSEMBLE (en-*):** solo/singer-guitarist/singer-piano/duo/folk-duo/trio/power-trio/jazz-trio/quartet/string-quartet/jazz-quartet/band/rock-4piece/rock-5piece/big-band/brass-section/wind-ensemble/rhythm-section/orchestra/chamber/string-orchestra/one-person/looper-solo/choir/choir-acapella/barbershop/doo-wop/dj-set/laptop-solo/modular-setup/live-electronics/rapper-producer/hip-hop-crew

**SIZE (sz-*):** intimate-solo/minimal/sparse/duet-focused/trio-balance/medium/quartet-dynamics/section-based/dense/chamber-scale/layered-rich/orchestral-full/wall-of-sound/layered/ambient-cloud

**DURATION (dur-*):** sketch/vignette/short/pop-radio/standard/extended/epic/post-rock/symphony/drone

## Drums.tsx (`TOGGLE_INSTRUMENT`)
**KICK_SNARE:** kick-808/909/707/linndrum/sp1200/mpc/punchy/boomy/clicky/four-floor/sub-boomy/distorted/layered/lofi/jazz/acoustic-ludwig/gretsch/yamaha; snare-tight/clap/gated/rimshot/trap/acoustic/brushed/fat-rock/ringy/buzzy-jazz/crispy/reversed/vinyl/808-clap/tr8s/limp

**HIHATS:** hihat-trap/tight/loose/shuffled/machine/acoustic/rolling/side/16th/32nd/triplet/ghost/distorted/lofi/vinyl/2step/footwork/amen-style/velocity-swing/open-close

**DRUM_CHAR:** drums-thunderous/crisp/lofi/acoustic-live/programmed/chopped/swung/punchy/airy/dusty/roomy/tight-dry/stadium/gated-80s/dry-studio/vintage-tape/distorted/compressed/ambient/brush-jazz/machine-straight/humanized

**DRUM_PATTERNS (pat-*):** boom-bap/trap/dnb-amen/breakbeat/breakbeat-rave/motorik/blast/d-beat/shuffle/dembow/clave-son/clave-rumba/afro-six/tresillo/gallop/polka/bossa/samba/funk-groove/disco-four/house-groove/techno-steady/jungle-amen/dnb-rolling/footwork/drum-chopped-dnb/neo-soul-halftime/swung-backbeat/hyperpop-blast/hiphop-headnod/clave/drill-uk

## Percussion.tsx (`TOGGLE_INSTRUMENT`)
**PERCUSSION_LAYERS (pc-*):** shaker/tambourine/clap/snaps/cowbell/woodblock/triangle/tambourine-roll/bongos/congas/claves/maracas/guiro/cabasa/rattle/sleigh-bells/finger-cymbals/vibraslap/ratchet/cuica/surdo-floor/rimshot/snare-rim/kick-ghost/kick-double/brush-snare/log-drum/agogo

**WORLD_PERCUSSION (wp-*):** djembe/log-drums/talking-drum/tabla/taiko/frame-drum/cajón/timbales/guiro/agogo/udu/hang/dundun/dundunba/bata/congas-cuban/timbales-latin/pandeiro/tamborim/repique/caixa/surdo/berimbau/atabaque/ashiko/doumbek/riq/def/bendir/zarb/kanjira/mridangam/ghatam/bodhran/steeldrum

**FX_PERCUSSION (fx-*):** riser/downlifter/impact/sub-drop/whoosh/reverse-cymbal/glitch/vinyl-crackle/tape-stop/braam/boom/cinematic-hit/orchestral-hit/gunshot/thunder/bell-hit/tubular-bells/gong/crash-reverse/laser-zap/8bit-chip/noise-sweep/digital-crackle

**LATIN_AFRO_RHYTHMS (lar-*):** clave-son/clave-rumba/clave-bossa/tresillo/cascara/marcha/cha-cha/mambo/rumba-col/palmas/batucada/samba-bateria/candombe/afrobeat-groove/highlife/baiao/cumbia

## Bass.tsx (`TOGGLE_INSTRUMENT`)
**BASS_TYPE (bass-*):** 808/sub/reese/wobble/acid/moog-synth/taurus/sh101/juno/virus/serum/massive/diva/pro-one/synth/sidechain/electric/jazz/stingray/rickenbacker/hofner/fretless/5string/6string/slap/upright/organ/tuba/contrabass/bass-flute/keytar/sub-drone/808-portamento/electric-generic

**BASS_CHARACTER (bass-*):** deep/punchy/warm/detuned/distorted/dry/boomy/sidechain-pump/growly/buzzy/wobbly/plucky/dubby/muddy/clicky/thumpy/rubbery/sub-heavy/mid-scooped/fuzzy/aggressive/warm-analog/bright-digital/vintage/compressed/monophonic/layered

**BASS_PATTERN (bp-*):** walking/octave/root-fifth/syncopated/melodic/drone/staccato/legato/reggae-offbeat/funk-slap/disco-octaves/dnb-rolling/house-pump/dub-drops/ostinato/staccato-legato-mix/ghost-notes/chromatic-run/call-response/boom-bap-bass/trap-sliding

## Guitars.tsx (`TOGGLE_INSTRUMENT`)
**GUITAR_TYPE (g-*):** telecaster/strat/lespaul/hollowbody/acoustic-steel/nylon/12-string/baritone/slide/pedal-steel/banjo/mandolin/ukulele/rhodes-clav

**PEDAL_AMP (amp-*):** clean/crunch/overdrive/distortion/fuzz/chorus/flanger/phaser/reverb/tremolo/wah/delay/octaver

**PLAYSTYLE (g-*):** fingerpicked/strumming/arpeggios/riff/power-chords/palm-muted/shredding/tapping/slide-play/flamenco/travis-picking

**ROLE (g-*):** lead/rhythm/layered/atmospheric/counter

## Keys.tsx (`TOGGLE_INSTRUMENT`)
**KEYS (k-*):** grand/upright/rhodes/wurlitzer/hammond/celesta/harpsichord/toy-piano/clavinet/mellotron

**SYNTHS (s-*):** moog/jupiter/juno/prophet/dx7/tb303/supersaw/arp/vocoder/wavetable/granular/modular

**PADS (p-*):** warm-analog/atmospheric/ethereal/choir/string/glassy/evolving/dark-ambient

**LEADS (l-*):** sparkly/bright/arp/supersaw-lead/pluck/stab/squelchy/screamer

## Winds.tsx (`TOGGLE_INSTRUMENT`)
**BRASS (br-*):** trumpet/trumpet-muted/trombone/french-horn/tuba/flugelhorn/brass-ensemble/brass-fanfare/brass-stabs

**STRINGS (st-*):** violin/viola/cello/double-bass/string-quartet/full-strings/pizzicato/tremolo-strings/staccato-strings/legato-strings

**WOODWINDS (ww-*):** flute/piccolo/clarinet/bass-clarinet/oboe/bassoon/saxophone-tenor/saxophone-alto/saxophone-soprano/saxophone-baritone/pan-flute/tin-whistle/shakuhachi/didgeridoo

## Earcandy.tsx (`TOGGLE_INSTRUMENT`)
**FX_IDEAS (ec-*):** vinyl/tape-saturation/bit-crush/tape-stop/glitch/field-recording/foley/radio-static/cassette-hiss/autotune-artifact/reverse/hum-60hz/power-up/digital-error/modem/retro-blip/asmr-whisper/synthetic-voice/vocoder-bit/rain-ambiance/forest-atmo/crowd-murmur/applause/distant-traffic/bell-notification/ice-cream-truck

**TRANSITIONS (tr-*):** whoosh/riser-high/downlifter/noise-sweep/reverse-cymbal/drum-fill/silence/stutter/filter-up/filter-down/pitch-bend/half-time-drop/double-time/sidechain-fade/mute-all/isolate-vocal/isolate-bass/break-roll/snare-buildup/frozen-reverb/glitch-chop/tape-cut/dj-rewind/vinyl-scratch/risers-stack

**IMPACTS (im-*):** cinematic-hit/sub-impact/braam/taiko-hit/orchestral-hit/gun-shot/boom/thunder/whoosh-impact/hybrid-hit/dueling-braam/ensemble-stab/bass-drop/rising-hit/slam-door/metal-clang/explosion/crash-glass/electric-discharge/laser-impact/warp-jump/clockwork-tick/firework/shatter-mirror/crumble-rock

**TEXTURAL_LAYERS (tex-*):** ambient-pads/granular/drone/swell/harmonic-series/bells-sustained/choir-distant/wind-ambient/water-ambient/rain-ambient/white-noise/pink-noise/brown-noise/filtered-static/frozen-harmonies/reverse-pads/evolving-soundscape/sub-rumble/shimmer-reverb/string-texture/brass-swell

## Harmony.tsx (`TOGGLE_PRODUCTION`)
**KEYS_MAJOR (key-*):** c-major/g-major/d-major/a-major/e-major/f-major/bb-major/eb-major

**KEYS_MINOR (key-*):** a-minor/e-minor/b-minor/d-minor/g-minor/c-minor/f-minor

**PROGRESSIONS (pr-*):** i-v-vi-iv/vi-iv-i-v/ii-v-i/12-bar-blues/circle-fifths/andalusian/modal-interchange/pedal-point/tritone-sub/plagal

**MODES (m-*):** ionian/dorian/phrygian/lydian/mixolydian/aeolian/locrian/harmonic-minor/melodic-minor/pentatonic/blues-scale/chromatic

## Structure.tsx
**SONG_FORMS (form-*):** pop-classical/pop-modern/edm/rock-classic/rap-trap/short/ambient/jazz-standard/blues-12/through-composed → `TOGGLE_PRODUCTION`

**SECTION_LENGTH (sl-*):** intro-short/intro-long/verse-4bars/verse-8bars/verse-16bars/chorus-8bars/chorus-16bars/outro-fade/outro-hard/outro-extended

**TRANSITIONS (trans-*):** smooth/abrupt/build-up/breakdown/key-change/tempo-change/half-time-switch/beat-switch/drop/silence

**ArrangementGenerator** (eingebaut): Range-Slider 60–360s + Generieren-Button. Eigener System-Prompt deutsch. Nutzt globale `generate()`. "In Lyrics einfuegen" parsed `[`-Zeilen aus Output und appended an `state.prompt.lyrics`.

## MixMaster.tsx (`TOGGLE_PRODUCTION`)
**EQ_CHAR (eq-*):** bright/dark/warm/scooped/midrangy/thin/fat/crisp-highs/warm-bass/smiley/telephone/radio-compressed/hipass/lowpass/boom-heavy/analog-roll/digital-clean/presence/air-boost/flat

**DYN (d-*):** loud/punchy/open/sidechained/brick-walled/natural/over-compressed/breathing/wide-dynamic/narrow/transient-snap/smooth-sustains/natural-decay/electronic-tight/parallel

**STEREO (st-*):** wide/mono-punch/centered/m-s/panning-active/ping-pong-delay/haas/auto-pan/imager/spread/classic-mono/dual-mono/binaural/ms-wide/atmos

**LOUDNESS (loud-*):** 9-7/12-11/14/16/20/club/cinema/radio/edm/lofi/pop/deezer

**HARMONIC (harm-*):** tape-sat/tube/transformer/console/preamp/exciter/psychoacoustic/enhancer/analog-warmth/vintage-char/odd-order/even-order/parallel-sat/tape-slow/vinyl-sim

## Lyrics.tsx (komplexest, ~620 LOC)
**STRUCTURE_TAGS:** [Intro], [Verse 1-4], [Pre-Chorus], [Chorus], [Post-Chorus], [Hook], [Bridge], [Pre/Post-Bridge], [Solo], [Instrumental], [Drop], [Drop 2], [Build], [Breakdown], [Interlude], [Break], [Tag], [Refrain], [Coda], [Reprise], [Ad-lib Section], [Scat Section], [Call-Response], [Answer Phrase], [False Ending], [Return], [Extended Chorus], [Final Chorus], [Outro]

**INLINE_CUES:** (whispered), (belted), (spoken), (falsetto), (ad-lib), (harmonized), (building intensity), (stripped back), (key change), (half-time feel), (echoing), (fading), (raspy), (breathy), (double-track), (choir support), (call-response), (spoken aside), (growled), (screamed), (vocoded), (auto-tuned), (pitched down/up), (reversed), (distorted), (ethereal floaty), (hymnic powerful), (intimate close), (cinematic wide), (layered stack), (solo accented)

**Klick auf Tag/Cue:** `insert(token)` mit Cursor-Position-aware Einfügen, fügt `\n` davor wenn nötig.

**LyricsKi (KI-Lyrics-Generator):**
- REAL_LANGUAGES-Map (lang-de → "German" etc.) und NON_LEXICAL_STYLES (lang-simlish → "Simlish-style gibberish syllables...")
- Extrahiert Themes (th-*), Tonalities (lt-*), Vocal-Delivery aus PromptState
- Wenn Arrangement vorhanden: parsed Section-Tags via `arrangement.matchAll(/^\s*\[([^\]]+)\]/gm)` und gibt sie als BINDING STRUCTURE vor
- Genre-adaptive Regeln: wenn rap/hip-hop/trap/drill → Multi-Reim + Wordplay-Pflicht; edm/house/techno/trance/dubstep → Mantra-kurz; country → Narrative + ABCB; metal → Action-Verben; ballad/folk → Slant-Reim + Oblique Imagery; rock → Call-Response; pop → Hook-Dichte
- Few-Shot-Example: 2 vollständige Beispieltexte (DE/EN) mit Begründung
- 10 Non-Negotiable Rules (One Story, Show don't tell, Reim mandatory, real words, Verse≠Chorus syllables, Tense-Shift, Hook-Line, Bridge-NEW-info, Power-Positions, Concretion-Test)
- Forbidden Rhyme Pairs (DE/EN), Forbidden Phrases (DE/EN)
- Multilingual: single → durchgängig; mixed → `[Verse 1] (German)` Marker
- Style Anchor: wenn `llmOutput` da, als zusätzlicher Kontext
- **Auto-Retry:** wenn `findCliches(lyrics).length`, 2. Run mit Warning-Message
- **Self-Critique:** wenn Setting aktiv, `runSelfCritiqueLyrics`

## Placeholder.tsx
Fallback wenn section-id nicht in REGISTRY. Optional `accordions[]`-Liste für leere Akkordeons.

---

# RESOURCES (JSON-Daten)

## resources/moods.json (vollständig)
```json
{
  "groups": {
    "uplifting": ["euphoric","triumphant","uplifting","happy","anthemic","optimistic","joyful","hopeful","confident","feel-good"],
    "melancholic": ["nostalgic","melancholy","bittersweet","wistful","somber","longing","sad","reflective","introspective"],
    "dark": ["brooding","dark","menacing","ominous","mysterious","sinister","haunting","gritty","tense"],
    "calm": ["peaceful","calm","serene","gentle","soft","intimate","dreamy","ethereal","atmospheric","chill"],
    "aggressive": ["aggressive","intense","powerful","angry","rebellious","raw","savage","fierce"],
    "romantic": ["romantic","passionate","sensual","tender","vulnerable","yearning"],
    "cinematic": ["epic","cinematic","dramatic","climactic","grand","sweeping"]
  },
  "conflict_pairs": [
    ["aggressive","peaceful"],["aggressive","calm"],["aggressive","gentle"],
    ["intense","calm"],["angry","peaceful"],["euphoric","brooding"],
    ["happy","somber"],["happy","sad"],["uplifting","melancholy"],
    ["triumphant","somber"],["dark","feel-good"],["menacing","joyful"],
    ["gentle","raw"],["soft","savage"]
  ]
}
```

## resources/templates.json (vollständig)
```json
{
  "templates": [
    { "id": "indie_pop_anthem", "name": "Indie-Pop Anthem", "genre": "indie_pop",
      "style_prompt": "indie pop, clean guitar arps, warm pads, tight kick, bright female vocals, 102-112 BPM, polished mix", "bpm": 108,
      "explanation": "Genre fuehrend, dann Instrumente (3 reichen), dann Vocal-Charakter, BPM-Range, Production am Ende." },
    { "id": "lofi_study", "name": "Lo-Fi Study Beat", "genre": "lofi",
      "style_prompt": "lofi hip hop, swung drums, vintage Rhodes, soft bass, no vocals, 70-84 BPM, dusty vinyl crackle, -12 LUFS vibe", "bpm": 76,
      "explanation": "'no vocals' crowdet Vocals raus. 'dusty vinyl crackle' triggert Lo-Fi. LUFS als Vibe-Referenz." },
    { "id": "melodic_house", "name": "Melodic House", "genre": "melodic_house",
      "style_prompt": "melodic house, side-chained bass, bright plucks, euphoric, 120-126 BPM, wide stereo field, festival energy", "bpm": 124,
      "explanation": "Side-chained bass kritisch. Wide stereo + festival energy = Big Room ohne Instrument-Overload." },
    { "id": "trap_banger", "name": "Trap Banger", "genre": "trap",
      "style_prompt": "trap, rattling triplet hats, tuned 808, sparse keys, confident male vocals, 140 BPM half-time feel, punchy compressed mix", "bpm": 140,
      "explanation": "Half-time feel = Genre-Indikator. Sparse keys lässt Platz für Vocals. Triplet hats = Trap-Signature." },
    { "id": "cinematic_trailer", "name": "Cinematic Trailer Pop", "genre": "cinematic",
      "style_prompt": "cinematic pop, epic orchestral swells, powerful female vocals, light choir oohs, 88-110 BPM, triumphant, stadium reverb", "bpm": 100,
      "explanation": "Stadium reverb = Trailer. 'Light choir oohs' verhindert Overload. Triumphant koppelt an Genre." },
    { "id": "acoustic_folk", "name": "Acoustic Folk Story", "genre": "acoustic_folk",
      "style_prompt": "acoustic folk, fingerpicked guitar, light shaker, soft pads, warm male vocals, storytelling delivery, 90 BPM, intimate close", "bpm": 90,
      "explanation": "'Intimate close' triggert Dry-Room. 'Storytelling delivery' für narrative Vocals." },
    { "id": "synthwave_night_drive", "name": "Synthwave Night-Drive", "genre": "synthwave",
      "style_prompt": "synthwave, analog bass, gated snares, chorus guitars, Juno pads, 84-108 BPM, 80s neon nostalgia, polished retro production", "bpm": 96,
      "explanation": "Gated snares = 80s-Signature. Juno pads spezifischer als 'synth pads'. '80s neon nostalgia' Vibe-Keyword." },
    { "id": "amapiano_afro", "name": "Afro-Pop / Amapiano", "genre": "amapiano",
      "style_prompt": "amapiano, afro-pop groove, call-and-response chorus, swing feel, log drums, warm bass, 106 BPM, feel-good energy", "bpm": 106,
      "explanation": "Log drums = Amapiano-Signature. Call-response + swing feel koppeln Rhythm und Vocal-Struktur." },
    { "id": "kpop_hook", "name": "K-Pop Hook Factory", "genre": "kpop",
      "style_prompt": "k-pop, sparkly synths, tight drums, bass drops, stacked harmonies, high contrast sections, 126 BPM, radio-ready mix", "bpm": 126,
      "explanation": "'High contrast sections' K-Pop-typisch. Stacked harmonies = Layered Vocals." },
    { "id": "neo_soul", "name": "R&B / Neo-Soul", "genre": "rnb",
      "style_prompt": "neo-soul, smooth female vocals, warm Rhodes, upright bass, soulful delivery, 78 BPM, intimate, analog warmth", "bpm": 78,
      "explanation": "'Analog warmth' + 'intimate' = Neo-Soul. Upright bass stilistisch genau. 78 BPM Anker." }
  ]
}
```

## resources/dos_donts.json (gekürzt — Validator-Regeln)
```json
{
  "hard_limits": {
    "style_prompt_v3": 200, "style_prompt_v4_v5": 1000, "lyrics": 3000,
    "lines_per_verse_max": 8, "lines_per_verse_min": 4,
    "lines_per_chorus_max": 4, "lines_per_chorus_min": 2
  },
  "soft_limits": {
    "descriptors_sweet_spot_min": 4, "descriptors_sweet_spot_max": 7,
    "tags_total_min": 8, "tags_total_max": 20, "instruments_per_generation_max": 3
  },
  "dos": [
    { "rule": "Front-load wichtigste Tags", "reason": "Suno liest links-nach-rechts" },
    { "rule": "Spezifische Instrumente", "example": "clean jangly Telecaster statt guitar" },
    { "rule": "BPM angeben" },
    { "rule": "Bracket-Tags fuer Struktur" },
    { "rule": "Komma-separierte Descriptoren statt Saetze" },
    { "rule": "3-5 Varianten generieren" },
    { "rule": "Segmentweise generieren ~1:30, dann Extend" },
    { "rule": "Vocals zuerst im Prompt" }
  ],
  "donts": [
    { "rule": "Keine Befehle (create/make/generate/please)" },
    { "rule": "Keine technischen Instruktionen (4/4, make bass louder)" },
    { "rule": "Keine Kuenstlernamen" },
    { "rule": "Keine widerspruechlichen Mood-Tags" },
    { "rule": "Keine vagen Prompts ('Pop song about love')" },
    { "rule": "Keine generischen Genre-Labels" },
    { "rule": "Keine vollen Saetze im Style-Prompt" },
    { "rule": "Nicht >20 Tags" },
    { "rule": "Nicht <5 Tags" },
    { "rule": "Style-Prompt und Lyrics-Ton muessen zusammenpassen" }
  ],
  "magic_words": {
    "top_10_universal": ["spacious","vocal-forward","radio-ready mix","polished production","wide stereo field","crisp high-end","warm bass","punchy","studio quality","broadcast quality"]
  }
}
```

## resources/vocals.json (Schema)
```json
{
  "character": {
    "examples": ["raspy female vocals","smooth baritone","young male tenor","deep female alto","ethereal soprano","weathered storyteller voice","seasoned jazz crooner","rebellious punk attitude","confident male rapper","gospel powerhouse vocalist"],
    "ranges": ["soprano","alto","tenor","baritone","bass"],
    "tones": ["warm","bright","rich","dark","light","resonant","smooth","rough","clear","breathy","soulful","vulnerable","airy","nasal","smoky"]
  },
  "delivery": {
    "examples": ["breathy","powerful belt","whispered","spoken word","drawl","falsetto","aggressive","intimate","passionate","gentle","storytelling","anthemic"],
    "technique_tags": ["[Whispered]","[Soft]","[Gentle]","[Quiet]","[Spoken]","[Spoken Word]","[Powerful]","[Belted]","[Shouted]","[Screamed]","[Growled]","[Intense]","[Falsetto]","[Head Voice]","[Chest Voice]","[Breathy]","[Raspy]","[Smooth]","[Soulful]","[Operatic]","[Nasal]","[Airy]","[Harmonies]","[Ad-libs]","[Vocal Run]","[Melisma]","[Vibrato]","[Staccato]","[Legato]","[Call and Response]","[Chant]","[Choir]"],
    "rap_tags": ["[Rapped]","[Fast Rap]","[Slow Flow]","[Melodic Rap]","[Trap Flow]","[Boom Bap Flow]","[Mumble Rap]","[Double Time]"]
  },
  "effects": { "examples": ["reverb-drenched","dry close-mic","doubled harmonies","lo-fi filtered","auto-tuned","layered harmonies","compressed vocals","natural vocal dynamics","vocal-forward","stacked harmonies"] },
  "inline_cues": { "cues": ["(whispered)","(belted)","(spoken word)","(harmonized)","(ad-lib)","(falsetto)","(building intensity)","(stripped back)","(key change)","(half-time feel)","(fading)","(echoing)"] },
  "gender_options": ["female","male","non-binary / androgynous","duet (male and female)","choir / ensemble","instrumental (no vocals)"]
}
```

## resources/instruments.json (Schema)
Familien: guitars, drums, keys_synths, bass, orchestral, electronic, world_specialty, percussion. Jede mit `examples[]` und teilweise `generic_to_specific` + `descriptors`.
Beispiel guitars.descriptors: ["fingerpicked","clean electric","distorted","arpeggios","riffs","slide guitar","jangly","acoustic strumming","power chords","palm-muted"].

## resources/tags.json (Bracket-Tag-Bibliothek, vollständig)
```json
{
  "structure": { "tags": ["[Intro]","[Verse]","[Verse 1]","[Verse 2]","[Verse 3]","[Pre-Chorus]","[Chorus]","[Post-Chorus]","[Hook]","[Bridge]","[Outro]","[End]","[Refrain]","[Instrumental]","[Interlude]","[Break]","[Drop]","[Build]","[Solo]","[Guitar Solo]","[Breakdown]","[Fade In]","[Fade Out]"] },
  "dynamic": { "tags": ["[Fade In]","[Fade Out]","[Swell]","[Crescendo]","[Decrescendo]","[Building Intensity]","[Climactic]","[Soft Intro]","[Big Finish]"] },
  "emotional_modifiers": { "tags": ["[Angry Verse]","[Sad Verse]","[Triumphant Chorus]","[Happy Verse]","[Melancholic Bridge]","[Euphoric Drop]","[Dark Breakdown]"] },
  "negative": { "tags": ["[no vocals]","[no autotune]","[no reverb]","[no falsetto]","[no choir]","[no drums]","[no synths]","[no distortion]","[no electronic elements]","[no guitar solo]","[no harsh screech leads]","[no spoken words]","[instrumental only]"] },
  "performance": {
    "tags": ["[Crowd Sings]","[Acapella]","[Break: Silence]","[Half-Time]","[Double Time]","[Key Change]","[Hyper-Realistic]"],
    "notes": {
      "[Hyper-Realistic]": "Forciert 48kHz Output-Engine in V5",
      "[Crowd Sings]": "Erzeugt Live-Konzert-Feel",
      "[Break: Silence]": "Kompletter Klang-Stopp"
    }
  },
  "advanced_examples": [
    "[Intro: Slow Build, Synth Pad, 15 seconds]",
    "[Verse 1: Minimal Bass, Whispered Vocals]",
    "[Pre-Chorus: Rising Swell, Drum Roll]",
    "[Chorus: Exploding Energy, Full Band, Anthemic]",
    "[Post-Chorus: Catchy Hook, Synth Lead]",
    "[Bridge: Half-Time, Emotional, Stripped Back]",
    "[Guitar Solo: Screaming, Melodic, 20 seconds]",
    "[Outro: Fade Out, Echoing Vocals]",
    "[Instrumental Break: Electric Guitar Solo, Shredding, High Pitch]",
    "[Bridge: Half-Time, Trap Beat Switch, Heavy Bass]"
  ],
  "rules": [
    "Tag am TOP der Lyrics = globale Anweisung",
    "Tag DIREKT VOR Sektion = lokal und effektiver",
    "Tags auf separaten Zeilen funktionieren am besten",
    "Kurz halten — 1-3 Worte pro Tag",
    "Tag am Anfang der Section ist staerker"
  ]
}
```

## resources/genres.json (Legacy/Index — 30 Top-Level-Genres)
Schema pro Eintrag: `{ id, name, bpm_min, bpm_max, keywords[], instruments[], vocal_default, production }`. IDs:
lofi/rnb/hiphop/reggaeton/indie_folk/pop/indie_pop/rock/house/melodic_house/techno/trance/trap/synthwave/cinematic/acoustic_folk/amapiano/kpop/jazz/classical/metal/punk/reggae/ambient/drum_and_bass/dubstep/country/gospel_trap/baroque_dubstep/celtic_electronic.

## resources/genres/electronic.json (~202 Subgenres)
Schema: `{ id, name, parent, bpm_min, bpm_max, keywords[], origin }`. Cluster (parent):
- house: chicago, deep, tech, progressive, tribal, acid, garage, future, bass, funky, electro, afro, amapiano, gqom, jackin, slap, french, filter, vocal, soulful, melodic, organic, lo_fi, disco, diva, afrotech, bigroom, dutch, microhouse, latin, italo, ghetto, jazz, moombahton, tropical, outsider, pumping, hip_hop, kwaito, scouse
- techno: detroit, minimal, berlin, hard, dub, acid, industrial, ambient, melodic, peaktime, hypnotic, raw, birmingham, bleep, schranz, free, schaffel
- trance: progressive, uplifting, psy, goa, vocal, tech, hard, acid, dream, balearic, dark_psy, full_on, suomisaundi, nitzhonot, eurotrance, handz_up, minimal_psy
- drum_and_bass: liquid, neurofunk, jump_up, jungle, intelligent (+ weitere)
- dubstep, future_bass, trap_edm, hardstyle, hardcore, gabber, breakbeat, big_beat, idm, ambient_electronic, glitch, downtempo, chillout, electro, electroclash, witch_house, vaporwave, hyperpop, footwork, garage_uk, grime, juke, deconstructed_club etc.

## resources/genres/rock_metal_pop.json (~219 Subgenres)
Cluster: rock_classic, alternative, grunge_90s, punk, metal_heavy, pop, new_wave_postpunk, progressive_art, niche_regional, noise_industrial.
Beispiel-IDs: classic_rock, hard_rock, rockabilly, psychedelic_rock, glam_rock, southern_rock, blues_rock, garage_rock, rock_and_roll, surf_rock, heartland_rock, arena_rock, soft_rock, prog_rock, krautrock, kosmische_musik, math_rock, post_rock, space_rock, jam_band, country_rock; alternative_rock, indie_rock, indie_pop, dream_pop, shoegaze, slowcore, sadcore, twee_pop, jangle_pop, lo_fi_indie, math_pop, art_pop, baroque_pop, bedroom_pop, hyperpop_indie, chamber_pop, post_grunge, alt_country; grunge, post_grunge_90s, britpop, lo_fi_grunge, riot_grrrl, sludge_grunge; hardcore_punk, post_punk, anarcho_punk, crust_punk, screamo, emo, melodic_hardcore, pop_punk, ska_punk, oi_punk, queercore, riot_grrrl_punk, deathrock; heavy_metal, thrash_metal, death_metal, black_metal, doom_metal, sludge_metal, stoner_metal, power_metal, symphonic_metal, gothic_metal, folk_metal, viking_metal, pagan_metal, nu_metal, metalcore, deathcore, mathcore, technical_death, melodic_death, progressive_metal, djent, post_metal, blackgaze, drone_metal, funeral_doom; electropop, dance_pop, synthpop, teen_pop, bubblegum_pop, art_pop, jpop, kpop_pop, latin_pop, dancehall_pop, soft_pop, indie_pop_pop; new_wave, post_punk_main, no_wave, coldwave, minimal_synth, dark_wave, ethereal_wave; progressive_rock, krautrock_main, art_rock, psychedelic_pop, raga_rock, baroque_rock; tex_mex, christian_rock, j_rock, k_rock, latin_rock, swiss_rock; industrial, noise_rock, no_wave_main, drone, power_electronics, harsh_noise.

## resources/genres/hiphop_rnb_jazz_blues.json (~167 Subgenres)
Cluster pro Hauptgenre. IDs u.a.:
hiphop: old_school, boom_bap, east_coast, west_coast, golden_era, conscious, gangsta, dirty_south, chopped_screwed, crunk, snap, hyphy, jerkin, drill_uk, drill_chicago, drill_ny, trap, mumble_rap, cloud_rap, lo_fi_rap, emo_rap, melodic_rap, soundcloud_rap, plug_g, rage_rap, jazz_rap, conscious_lyrical, abstract_hiphop, alternative_hiphop, experimental_rap, christian_rap, latin_trap, k_rap, j_rap, afro_rap, drill_french, grime, hardcore_rap, horrorcore, political_rap, party_rap, mumble_modern, miami_bass, pop_rap, hyperpop_rap.
rnb: classic_rnb, neo_soul, contemporary_rnb, alternative_rnb, future_rnb, pbr_b, quiet_storm, new_jack_swing, urban_contemporary, soul_pop_rnb, indie_rnb, lo_fi_rnb.
jazz: bebop, cool, hard_bop, modal, free_jazz, fusion, smooth_jazz, acid_jazz, vocal_jazz, jazz_funk, latin_jazz, gypsy_jazz, manouche, swing, big_band, jazz_rap_rb, ecm_style, contemporary_jazz, bossa_jazz, dixieland.
blues: delta, chicago, electric, country_blues, jump_blues, blues_rock, soul_blues, gospel_blues, british_blues, swamp_blues, ragtime, piedmont, west_coast_blues, hill_country.
funk: pfunk, jazz_funk, electro_funk, soul_funk, deep_funk, go_go, funk_rock.
soul: northern_soul, southern_soul, philly_soul, motown, neo_soul_main, blue_eyed_soul, soul_jazz, gospel_soul.

## resources/genres/world_classical_misc.json (~334 Subgenres)
Hauptgenres: world, latin, reggae, country, folk, classical, ambient, experimental, soundtrack, religious, novelty.
reggae-Cluster IDs: roots_reggae, dub, dancehall, ragga, ska, rocksteady, lovers_rock, nyabinghi, mento, rockers_reggae, reggae_fusion, reggae_rock, soca, calypso, zouk, kompa, reggaeton, dembow, moombahton, dancehall_pop, dub_techno, ambient_dub, bouyon, steel_pan.
latin-Cluster: salsa, merengue, bachata, cumbia, vallenato, bolero, tango, milonga, tango_nuevo, mambo, chachacha, rumba, son_cubano, timba, guaracha, danzon, pachanga, latin_house, latin_pop, latin_trap, corrido, narcocorrido, corrido_tumbado, banda, norteño, ranchera, mariachi, tejano, cuarteto, tropical, plena, bomba, guajira, songo, batucada, samba, samba_rock, bossa_nova, mpb, choro, forro, axé, frevo, maracatu, candombe, chacarera, chicha, kuduro, funana.
country-Cluster: bluegrass, honky_tonk, outlaw_country, country_rock, alt_country, americana, country_pop, southern_country, modern_country, country_rap, western_swing, cowboy, gospel_country, christian_country, bro_country, neotrad, southern_rock, country_blues_main, hillbilly, rockabilly_main.
folk-Cluster: contemporary_folk, traditional_folk, folk_rock, folk_punk, anti_folk, freak_folk, indie_folk, folk_baroque, celtic_folk, irish_folk, scottish_folk, american_folk, appalachian_folk, gospel_folk, folk_pop, neo_folk, balkan_folk, eastern_european_folk, slovak_folk, balladry, sea_shanty, work_song.
classical-Cluster: baroque, classical_period, romantic, modernist, contemporary_classical, minimalism, post_minimalism, spectral, contemporary_choral, opera, art_song, lieder, chamber_music, symphonic, concerto, sonata, etude, choral_classical, sacred_classical, requiem, mass, neo_classical, atonal, twelve_tone, microtonal, electroacoustic, musique_concrete, modernist_chamber, contemporary_orchestra, scriabin_style.
ambient: dark_ambient, drone_ambient, ambient_techno, deep_ambient, isolationism, lowercase, illbient, ambient_house, ambient_dub_main, generative_ambient, field_recording, sound_art.
experimental: noise, harsh_noise, lowercase_exp, plunderphonics, musique_concrete_exp, sound_collage, glitch_art, fluxus_music, free_improvisation, computer_music, electroacoustic_exp, microtonal_exp, conceptual_music, indeterminate_music.
soundtrack: orchestral_soundtrack, cinematic, trailer_music, epic_orchestral, film_score, video_game_score, hybrid_score, modern_orchestral, dark_score, retro_synth_score, lounge_jazz_score.
religious: gregorian_chant, christian_contemporary, gospel, gospel_traditional, southern_gospel, urban_gospel, latin_christian, qawwali, sufi, hindustani_devotional, jewish_liturgical, klezmer_religious, taize, byzantine_chant, georgian_chant, christmas_carol, gospel_jazz, gospel_choir, indian_classical_devotional.
novelty: meme_music, comedy_song, parody, kids_music, nursery_rhyme, holiday_song, christmas_pop, halloween_song, sea_shanty_meme, elevator_music, library_music, jingle, advertisement_music, tv_theme.

---

# DOCS

## docs/v2_vision.md (Auszug)
**Vision:** Die einzige Windows-native Prompt-Workstation für Suno, die fundierte Prompt-Methodik (5-Part-Formel + Bracket-Theory) mit lokaler LLM-Ausformulierung und Prompt-Versionierung vereint.
**8 USPs:** offline-fähig (Ollama), 5-Part-Workflow, Bracket-Builder, Negative-Prompts mit Konflikt-Warnung, Genre→BPM-Range-Empfehlung, Lokale Historie+Versionierung+Rating, kommentierte Templates, Windows-Desktop.
**Original-Stack-Plan:** Tauri 2 + React + TypeScript + Rust-Backend + SQLite + ollama-rs. **Aktueller Stack ist abweichend** (kein Tauri/Rust, sondern reine Vite-Web-App mit localStorage statt SQLite).
**LLM-Aufgaben (geplant):** Ausformulierung, Prompt-Enhancement, Konflikt-Erkennung, Lyrics-Vorschläge, DE→EN-Übersetzung.

## docs/ui_wireframes.md
ASCII-Mockups der ursprünglich 7 Tabs. Aktuell drei Modi statt Tabs.
Globales Layout: Header (Logo · Mode-Toggle · OllamaDot · Settings · Reset) + Sidebar + Content + Preview-Spalte rechts.

## research/suno_prompting_2026.md (Kerninhalt)
**Suno V5.5** (März 2026), Syntax identisch zu V5. Style-Prompt: Komma-Tags + Prosa beide ok, Reihenfolge wiegt 60-70%. Sweet Spot 6-7 Tags / 2-4 Sätze / max 1000 Char. Subgenre/Instrumente spezifisch. BPM als Zahl. Max 2 Genres dominantes zuerst. Negationen max 2. Production-Descriptoren underused.
**Arrangement:** Tags in Lyrics-Box. Standard-Struktur 3-4 min: Intro → V1 → Pre-Chorus → Chorus → V2 → Pre-Chorus → Chorus → Bridge → Break → Chorus → Outro. Energiebogen Intro-niedrig → Chorus-Peak → Bridge-Valley → Final-Chorus-Peak.
**Lyrics:** Verse 8-10 Silben / 4-8 Zeilen, Chorus 10-12 / 2-6, Pre-Chorus 6-8 / 2-4. Verse≠Chorus. ABAB Verse + AABB Chorus schlägt Suno-Default.
Quellen: Suno-Help, hookgenius, jackrighteous, howtopromptsuno, cometapi, musicsmith, openmusicprompt.

## research/songwriting_craft_2026.md (Kerninhalt)
10 Kernprinzipien: Show don't tell, sensorische Spezifizität (Pat Pattison), Power Positions, Prosody, bewusster Reimtyp, Section-Funktion, Tense-Shift Verse-Past/Chorus-Present, Pronomen-Strategie, Spezifizität, One Song One Idea.
Anti-Patterns: KI-Stil-Klischeereime EN/DE, leere Intensifier, Abstrakta als Hauptaussage. Section-Funktionen festgelegt. Genre-Regeln: Pop/Rap/Country/Rock/Indie/RnB/Folk/Electronic.

## research/competitor_analysis.md (Kernpunkte)
9 analysierte Konkurrenten: MeinHomeStudio, Peak-Studios, SunoPrompt.com, HowToPromptSuno, AIFreeForever, JustBuildThings, Pseuno-AI, SunoReferenceArchitect, MusicGPT.
**Lücken die V2 schließt:** vollständige lokale LLM-Ausformulierung (alle anderen Cloud), Bracket-Notation-Builder, integriertes Negative-Prompt-System mit Konflikt-Erkennung, 5-Part-Formel-Workflow, BPM-Range-Empfehlung per Genre, Versionierung+Diff, kommentierte Templates, Windows-Desktop.

## research/v1_screenshot_analysis.md (Kernpunkte)
V1 = "Music Prompt Studio v1.1.0" mit 11 Simple-Steps + 23 Custom-Steps + Studio-Tag-Baukasten. Bernstein-Theme. Ollama-Modell-Dropdown inline (1B, 3B, 7B, 12B, Nemo, 14B, Song, Lyric).
**MUSS für V2-MVP-Parität:** Studio-Tag-Baukasten ✓, Presets ✓, Verlauf ✓, Export-Button ✓, Ollama-Modell inline ✓
**SOLLTE:** "Passend zu"-Smart-Suggestions ✓, 4-Varianten-Generator ✓, KI-Arrangement-Generator ✓, Songform-Auswahl ✓, PRO-TIPP-Boxen
**Bewusst weggelassen in V2:** Linearer 11/23-Step-Wizard, Footer-Navigation, exotische Songformen.

---

# SETUP & WORKFLOW

```bash
cd workspace/active/suno-prompt-gen-v2
npm install
ollama serve   # in separater Shell
ollama pull qwen2.5:14b   # Empfehlung für Deutsch
ollama pull llama3.1      # Englisch reicht
npm run dev
# http://localhost:5173
```

Skripte:
- `npm run dev` — Vite-Dev-Server, Port 5173 (strict)
- `npm run build` — `tsc -b && vite build`
- `npm run preview` — Vite-Preview
- `npm run typecheck` — `tsc --noEmit`

---

# KONVENTIONEN für ChatGPT

1. **Sprache:** Kommunikation auf Deutsch, knapp, sachlich, ohne Floskeln, ohne Emojis. Code-Identifier englisch.
2. **TypeScript strict.** 2-Space-Einrückung. Keine ungenutzten Imports.
3. **Element-Order Suno V5.5 ist heilig.** Änderungen am Style-Builder müssen die Reihenfolge respektieren (Genre → Mood → Vocal → Instr → Harmony → BPM → Production → Negations).
4. **Tag-Prefix-Routing in 3 Files synchron halten:** `lib/promptBuilder.ts`, `lib/systemPrompts.ts`, `components/Sidebar.tsx`.
5. **Persistenz-Migration:** bei Settings-/State-Schema-Änderungen `migratePromptState` und `CURRENT_EXPORT_VERSION` (aktuell 3) anpassen.
6. **Keine Cloud-API einführen.** Tool ist explizit lokal/Ollama.
7. **Kein Over-Engineering.** Bestehende Patterns respektieren — keine zusätzlichen Abstraktionen "auf Vorrat".
8. **Lyrics-System-Prompt** ist sehr aufwendig kuratiert (genre-adaptive, Few-Shot, Klischee-Filter, Auto-Retry, Self-Critique). Änderungen dort vorsichtig, getestet pro Genre.

---

# STATUS & ROADMAP

**Erledigt (v0.1.0):**
- Drei Modi (simple/custom/studio) mit Sidebar + Counter
- 26 Section-Komponenten mit ~5000 Tag-IDs
- buildStylePrompt mit korrektem Routing
- LLM-Pipeline mit 9 Ketten
- 4-Varianten-Generator parallel
- KI-Arrangement-Generator mit Chain-Context
- KI-Lyrics-Generator (genre-adaptive, Few-Shot, Klischee-Loop, Self-Critique)
- Title-Generator (5 Titel)
- "Aus Idee"-Modal
- "Klingt wie..."-Tag-Generator (Künstler→Tags)
- "Passend zu..."-Smart-Suggestions per Subgenre-Cluster
- Refine-Loop für Style + Arrangement
- Validator + Pre-Flight-Check
- Stale-Badge (LLM-Output ≠ aktueller Style)
- Presets + History (mit Suche, Rating)
- Export/Import JSON mit Migration
- Settings (Ollama-Endpoint, Modell-Routing pro Task, Kreativitätsmodus, Arrangement-Länge, Klischee-Auto-Retry, Self-Critique)
- Prompt-Preview-Modal (was geht wirklich an Ollama)

**Bekannte Lücken:**
- Self-Critique-UI-Feedback (welche Zeilen wurden umgeschrieben?)
- Variants → "Best-of"-Auswahl + Übernahme
- Refine-History pro Output
- Lyrics-Section: Reim-Map / Silben-Counter
- Studio-Modus inhaltlich weiter ausbauen
- Genre-DB-Erweiterung (vor allem World/Latin tiefer)
- Diff-View zwischen History-Versionen
- Audio-Reverse-Engineering (Phase 4)
- Echte Desktop-Verpackung (Tauri war ursprünglich geplant)

---

ENDE BRIEFING.

