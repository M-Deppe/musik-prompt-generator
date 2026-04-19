# Suno Prompt Generator v2 — ChatGPT-Briefing

Stand: 2026-04-18 · Version 0.1.0 (UI v2.0.0) · Owner: Martin Deppe
Zweck dieses Dokuments: vollständiger Kontext für eine externe Iteration via ChatGPT.

---

## 1. Was ist das

Windows-natives Web-Tool (Vite + React 18 + TypeScript + Tailwind v4) zum Bauen
von Suno-AI-V5.5-Prompts. Lokale LLM-Anbindung über **Ollama** (kein Cloud-API,
keine Kosten). State im Browser, alles offline-fähig nach erstem Build.

Drei Modi:
- **simple** — geführter 7-Schritte-Flow, 500-Char-Limit
- **custom** — voller Editor, 10 Kategorien, 1000-Char-Limit
- **studio** — Studio-Sandbox, 5000-Char-Limit

---

## 2. Ordnerstruktur

```
suno-prompt-gen-v2/
├── index.html                       Vite-Einstieg
├── package.json                     React 18.3, Vite 5.4, TS 5.6, Tailwind 4
├── vite.config.ts                   Aliases @ → src, @resources → resources
├── tsconfig.json / tsconfig.node.json
│
├── docs/
│   ├── ui_wireframes.md
│   └── v2_vision.md
│
├── research/                        Recherche-Basis
│   ├── competitor_analysis.md
│   ├── songwriting_craft_2026.md
│   ├── suno_prompting_2026.md       ← Element-Order-Quelle
│   └── v1_screenshot_analysis.md
│
├── resources/                       Daten als JSON (importiert via @resources)
│   ├── dos_donts.json               Globale Do/Don't-Liste
│   ├── genres.json                  Legacy/Index
│   ├── genres/
│   │   ├── electronic.json
│   │   ├── rock_metal_pop.json
│   │   ├── hiphop_rnb_jazz_blues.json
│   │   └── world_classical_misc.json
│   ├── instruments.json
│   ├── moods.json                   { groups, conflict_pairs }
│   ├── tags.json
│   ├── templates.json               Schnellstart-Vorlagen
│   └── vocals.json
│
└── src/
    ├── main.tsx                     ReactDOM.createRoot
    ├── App.tsx                      <StoreProvider><Shell/>… Header/Sidebar/Content/Preview
    ├── store.ts                     useReducer + Context, lädt/persistiert via lib/persistence
    ├── sections.ts                  Mode-Definition, SIMPLE_/CUSTOM_/STUDIO_CATEGORIES
    ├── types.ts                     PromptState, Settings, getTaskTemperature
    ├── index.css                    Tailwind v4 + CSS-Vars für Farben
    │
    ├── lib/
    │   ├── allGenres.ts             MAIN_GENRES (23) + SUBGENRES (aus 4 JSONs)
    │   ├── knowledge.ts             Re-Exporte für moods/templates/dos/donts/tags
    │   ├── llm.ts                   Orchestrator: Builder, Variants, Arrangement, Pipeline,
    │   │                            FromIdea, Titles, Refinement, SelfCritique, Klischee-Filter
    │   ├── ollama.ts                listModels, ping, generate (streaming /api/generate)
    │   ├── persistence.ts           localStorage: settings/history/presets/draft + Migration
    │   ├── promptBuilder.ts         buildStylePrompt(state) → reiner Style-String
    │   ├── suggestions.ts           Subgenre-Cluster → passende Mood/Drum/Bass/Vocal/Production
    │   ├── systemPrompts.ts         SYSTEM_PROMPT_BUILDER, FROM_IDEA, buildUserPromptFromState
    │   └── validator.ts             validate() + preflightCheck()
    │
    ├── components/
    │   ├── Header.tsx               Logo, Mode-Toggle, Idee-Modal, OllamaDot, Settings, Reset
    │   ├── Sidebar.tsx              Akkordeon-Kategorien, Counter pro Kategorie
    │   ├── Content.tsx              Aktive Section + Banner, dispatcht renderSection
    │   ├── Preview.tsx              RECHTE Spalte: Pipeline-Button, Style-Roh, KI-Prosa,
    │   │                            Arrangement, Titel, Variants, Verlauf, Presets
    │   ├── VariantsPanel.tsx        4 Style-Varianten parallel
    │   ├── SettingsPanel.tsx        Ollama-Endpoint, Modelle, Kreativität, Routing
    │   ├── IdeaModal.tsx            "Aus Idee" Eingabe
    │   ├── InfoModal.tsx            Handbuch / Impressum
    │   ├── PromptPreviewModal.tsx   Zeigt System+User-Prompt vor LLM-Call
    │   ├── InfoBanner.tsx           OptimalOrderBanner, AvoidBanner
    │   └── AccordionSection.tsx     Wieder­verwendbares Akkordeon
    │
    └── content/
        ├── registry.tsx             section-id → Komponente (Map)
        ├── CheckList.tsx            Wieder­verwendbare Tag-Chip-Liste
        └── sections/                Eine .tsx pro UI-Sektion (siehe §4)
            Aera, Bass, Blueprint, Drums, Dynamik, Earcandy, Emotionen,
            ExcludeStyles, Gesang, Grundstil, Guitars, Harmony, Keys, Lyrics,
            MixMaster, Percussion, Placeholder, SongThema, SoundQuality,
            Structure, Stuecktyp, StyleTags, SunoStudio, Templates, Tempo, Winds
```

---

## 3. State-Modell (Single Source of Truth)

### `PromptState` — was der Nutzer auswählt
```ts
{
  mainGenre?: string         subgenre?: string         secondaryGenre?: string  // Fusion
  soundsLike?: string        soundsLikeDescription?: string
  moods: string[]
  bpm?: number
  vocalCharacter?: string    vocalDelivery?: string    vocalEffects?: string
  vocalLanguages: string[]   // mit Prefix "lang-"
  instruments: string[]      // max 3 empfohlen
  production: string[]       // PREFIX-CODIERT — siehe §6
  customTags: string[]       // freie Tags
  negatives: string[]        // ohne / mit "no " Prefix
  lyrics: string             title: string
}
```

### `Settings` — gespeicherte Konfiguration
```ts
{
  ollamaUrl: "http://localhost:11434"
  ollamaModel: "llama3.1:latest"        // Default
  modelLyrics?: string                   // optionales Routing
  modelArrangement?: string
  modelStyle?: string
  temperature: 0.7                       // Legacy-Slider
  creativityMode: "conservative"|"balanced"|"creative"|"wild"
  arrangementLength: "short"|"standard"|"epic"
  autoRetryOnCliche: boolean
  selfCritiqueLyrics: boolean
}
```

### `AppState` (zusätzlich zu prompt+settings)
- `mode`, `activeSection`
- LLM-Buckets: `llmOutput`, `llmArrangement`, `llmTitles[]`, `llmVariants{safe,experimental,minimal,intense}`
- Loading- und Error-Flags je Bucket
- `llmSourceStylePrompt`, `llmArrangementSourceStylePrompt` → für **Stale-Badge** ("veraltet" wenn Source ≠ aktueller Build)
- `promptPreview` für Modal "Was schicke ich an Ollama"
- `history[]`, `presets[]`
- `resetCounter` → Sidebar/Content remounten bei RESET (schließt Akkordeons)

Persistenz: alle Schreibwege in `lib/persistence.ts` (localStorage-Keys
`mps.settings|history|presets|draft`). Draft wird debounced (300 ms) gespeichert.

---

## 4. UI-Architektur — Modi & Kategorien

`sections.ts` definiert pro Mode eine `Category[]`. Reihenfolge folgt dem
Suno-V5.5-Element-Order (Genre → Mood → Vocal → Instr → Harmony → BPM → Production
→ Negations).

### simple (7 Steps + Schnellstart)
1. Schnellstart (Templates)
2. Genre & Aera (Grundstil, Aera)
3. Stimmung & Energie (Emotionen, Dynamik)
4. Gesang
5. Tempo
6. Sound & Produktion (SoundQuality)
7. Lyrics & Thema (Lyrics, SongThema)
8. Tags & Ausschluss (StyleTags, ExcludeStyles, Blueprint)

### custom (10 Steps)
+ Stuecktyp/Structure, Drums/Percussion/Bass, Guitars/Keys/Winds/Earcandy,
  Harmony, MixMaster

### studio
- nur SunoStudio-Section (Sandbox-Modus)

Alle Sections werden per `content/registry.tsx` (`section-id → Component`)
gerendert. Inputs dispatchen `Action`-Typen an den Reducer.

---

## 5. promptBuilder.ts — Roh-Style-Prompt

Funktion: `buildStylePrompt(state) → string`. Wird live bei jedem State-Change
neu berechnet, im Roh-Block angezeigt und an Ollama als Fallback geschickt.

**Regeln:**
- Subgenre-Name kombiniert mit Main-Genre nur, wenn Subgenre-Name das Main-Genre
  nicht schon enthält (`deep house` → kein extra `electronic`).
- soundsLikeDescription > soundsLike (wenn beide leer, weglassen).
- Vocals werden zu `"<character>, <delivery>, <effects>"` joined.
- `vocalLanguages[]` → `"vocals in en/de"`.
- Instruments auf erste 3 begrenzt.
- `production[]` wird nach **Prefix gerouted** (siehe §6).
- Negations zuletzt, jeweils mit `"no "` prefixed wenn fehlt.

**Output-Reihenfolge** (final geschrieben):
```
genre, fusion, mood, useCase, vocal, language,
instruments, harmony, bpm, production,
customTags, soundsLike, negations
```

---

## 6. Tag-Prefix-Routing (zentrale Logik)

Das Feld `production[]` ist überladen — es transportiert vier semantische
Klassen, gesteuert durch ID-Prefix. **Hier liegt der wichtigste Teil der
Routing-Logik:**

| Prefix     | Bedeutung                          | Wirkung                                  |
|------------|------------------------------------|------------------------------------------|
| `key-*`    | Tonart                             | → Style-Prompt unter "harmony"           |
| `pr-*`     | Akkord-Progression                 | → Style-Prompt unter "harmony"           |
| `m-*`      | Modus (dorisch, mixolydisch, …)    | → Style-Prompt unter "harmony"           |
| `th-*`     | Lyric-Thema                        | nur Lyrics-Kontext, NICHT in Style       |
| `lt-*`     | Lyric-Tonalität                    | nur Lyrics                               |
| `narr-*`   | Erzählperspektive                  | nur Lyrics                               |
| `uc-*`     | Use-Case / Einsatzzweck            | → Style-Prompt unter "useCase"           |
| `form-*`   | Songform                           | (Sidebar zählt als "form")               |
| `ft-*`/`sl-*`/`trans-*` | Form-Details                | wie form-*                                |
| _none_     | echte Production/Mix-Tags          | → Style-Prompt unter "production"         |

Same Routing-Logik existiert dreimal:
- `lib/promptBuilder.ts` (Roh-Style)
- `lib/systemPrompts.ts` (User-Prompt für LLM)
- `components/Sidebar.tsx` (Counter pro Kategorie)

→ **Wichtig:** Änderungen an Prefixes müssen in allen drei Files synchron sein.

---

## 7. LLM-Pipeline & Ketten (`lib/llm.ts`)

### Anbindung — `lib/ollama.ts`
- POST `${baseUrl}/api/generate`, body: `{ model, prompt, system, stream:true, options:{temperature} }`
- Streaming via `ReadableStream`-Reader, Chunks → `onChunk(chunk, full)`
- `listModels()` ruft `/api/tags`, `ping()` testet Verfügbarkeit
- Health-Check alle 30 s im Header (OllamaDot)

### Model-Routing
```ts
pickModel(state, task) =
  settings[`model${cap(task)}`] ?? settings.ollamaModel
// task ∈ {style, arrangement, lyrics, title}
```

### Temperatur-Matrix (creativityMode × task)
| Mode         | style | arrangement | lyrics | title | sounds-like | critique |
|--------------|-------|-------------|--------|-------|-------------|----------|
| conservative | 0.30  | 0.40        | 0.50   | 0.50  | 0.30        | 0.20     |
| balanced     | 0.60  | 0.65        | 0.80   | 0.75  | 0.40        | 0.30     |
| creative     | 0.80  | 0.80        | 0.95   | 0.90  | 0.60        | 0.40     |
| wild         | 1.00  | 1.00        | 1.20   | 1.10  | 0.80        | 0.50     |

### Ketten / Funktionen

#### A) `runLlmBuilder(state, dispatch)`
- system: `SYSTEM_PROMPT_BUILDER` (Music-Journalist-Voice, strikte Element-Order)
- user: `buildUserPromptFromState(state.prompt)` (numerierte Bullets 1–11)
- temp: `getTaskTemperature(mode, "style")`
- → streamt `LLM_CHUNK`, finalisiert mit `LLM_DONE` + `sourceStylePrompt`

#### B) `runLlmArrangement(state, dispatch)`
- system: `buildArrangementSystemPrompt(arrangementLength)`
  (Tag-Vokabular, Energy-Arc, Format pro Section, Forbidden-Liste, Beispiel)
- user: `"Build a song arrangement matching: <stylePrompt>"`
  + **Chain-Context:** wenn `llmOutput` existiert, wird die Prosa als Kontext
    angehängt (`CONTEXT — the full style description for the song: "..."`)
- länge: short / standard / epic → 3–5 / 5–8 / 8–12 Sections

#### C) `runStyleAndArrangement` (= "Full Pipeline"-Button)
- sequenziell: erst A, dann B
- B nutzt automatisch das gerade frisch generierte `llmOutput`

#### D) `runLlmVariants(state, dispatch)`
- 4 parallele Calls (`Promise.all`)
- **Variant-Config:**
  - `safe`         temp 0.35  "Konservativ, radio-freundlich"
  - `experimental` temp 1.00  "Pushe Grenzen, mutige Descriptoren"
  - `minimal`      temp 0.50  "Nur 3-5 essentielle Descriptoren"
  - `intense`      temp 0.85  "Maximum Intensität"
- Hint wird an SYSTEM_PROMPT_BUILDER angehängt.

#### E) `runLlmFromIdea(state, idea, dispatch)`
- system: `SYSTEM_PROMPT_FROM_IDEA` (akzeptiert DE/EN-Idee)
- user: `Die Idee: "<idea>". Baue daraus einen optimalen Suno-Style-Prompt.`

#### F) `runLlmTitles(state, dispatch)`
- system: `SYSTEM_PROMPT_TITLES` (5 Zeilen, 1–5 Wörter, keine Klischees)
- user: kombiniert `style + lyrics(.slice(0,400)) + language`
- Nachverarbeitung: split("\n"), trim, Bullet-Präfixe entfernen, Limit 80 Char, slice(0,5)

#### G) `runRefinement(state, dispatch, target, feedback)`
- target ∈ `"style" | "arrangement"`
- system: jeweiliger Builder-Prompt + Refining-Hinweis
- user: `PREVIOUS OUTPUT:\n…\nUSER FEEDBACK: …\nRewrite…`

#### H) `runSelfCritiqueLyrics(state, dispatch)`
- Zweiter Pass über bestehende Lyrics
- system: `SYSTEM_PROMPT_CRITIQUE_LYRICS` (Klischee-/Reim-/Grammatik-/Form-Regeln)
- ersetzt Lyrics nur wenn Output ≠ Original
- temp via `creativityMode × "critique"`

#### I) `findCliches(text)`
- DE+EN-Phrasen-Liste (Echoes, shattered dreams, Mein Herz brennt, …)
- Returns Trefferliste — UI/Auto-Retry kann darauf reagieren
- Setting `autoRetryOnCliche` schaltet das Verhalten

---

## 8. System-Prompts (`lib/systemPrompts.ts`)

### `SYSTEM_PROMPT_BUILDER`
Music-Journalist-Voice, 2–4 Sätze, <1000 Char.

**ELEMENT ORDER (strict):**
1 Genre+Subgenre (era fused) · 2 Fusion · 3 Mood · 4 Form · 5 Vocal+Lang ·
6 Instruments(2-3) · 7 Harmony/Key · 8 BPM · 9 Production/Mix · 10 Sound-Ref ·
11 Negations (max 2, "No X. No Y.")

**Forbidden:** artist names, "create/make/generate/please", vague genres,
contradictory moods, lyrical theme, section tags `[Verse]`.

### `SYSTEM_PROMPT_FROM_IDEA`
Wie BUILDER, aber Input ist freie DE/EN-Idee → Output English Prose.

### `SYSTEM_PROMPT_TITLES`
Exactly 5 lines, 1–5 words, image-driven, no clichés, language per Vocal-Lang.

### `SYSTEM_PROMPT_CRITIQUE_LYRICS`
Strict editor, sucht Klischees/Reime, "states emotion ohne image",
broken grammar, fehlende Reime, Verse=Chorus-Silbenzahl.

### `buildUserPromptFromState(prompt)`
Generiert nummerierte Bullets in der Element-Order:
```
1.  Main Genre
1a. Subgenre (origin, BPM-Range)
2.  Fusion
3.  Mood
5a. Vocal Character
5b. Vocal Delivery
5c. Vocal Effects
5d. Vocal Language
6.  Instruments (slice(0,3))
7.  Harmony / Key (aus production[] mit key-/pr-/m-)
8.  BPM
9.  Production (production[] ohne Prefixes)
9a. Use case (uc-)
10. Sound reference
11. Negations
+   Typical keywords (aus Subgenre)
```

---

## 9. Validator (`lib/validator.ts`)

### `validate(state, stylePrompt) → ValidationIssue[]`
- **error:** Style >1000 Char (Suno cuttet still); Negation ↔ Instrument-Konflikt
- **warn:** <4 oder >7 Descriptoren; widersprüchliche Moods (`conflict_pairs`);
  >3 Instrumente; Befehlswörter (create/make/generate/compose/please);
  doppelte Tags
- **info:** kein BPM; BPM außerhalb Subgenre-Range; kein Genre;
  Progression ohne Tonart

### `preflightCheck(state) → string[]`
Blocker vor LLM-Call:
- "no vocals" + Vocal-Felder gesetzt
- Komplett leere Auswahl
- >5 Instrumente
- Mood-Konflikt (Regex calm vs aggressive/intense/harsh)

---

## 10. Suggestions (`lib/suggestions.ts`)

`getSuggestions(parent) → SuggestionSet`. Subgenre-Cluster (`parent`-Feld
des Subgenres) → empfohlene Moods/Drums/Bass/Vocals/Production.

Cluster: house, techno, trance, drum_and_bass, dubstep, trap, synthwave, lofi,
rnb, hiphop, phonk, rock_classic, metal_heavy, grunge_90s, punk, alternative,
pop, indie, jazz, blues, classical, ambient, soundtrack, reggae, latin, country,
folk + Fallback.

UI: grüne "Passend zu: X"-Box in Grundstil-Section, Click übernimmt alles
oder einzelne Chips.

---

## 11. Persistence (`lib/persistence.ts`)

- Keys: `mps.settings`, `mps.history`, `mps.presets`, `mps.draft`
- History max 100, Presets max 50 Einträge (FIFO neue zuerst).
- Draft = aktueller PromptState, debounced 300 ms.
- Export-JSON: `{ prompt, title, exported_at, version: 3 }`.
- `migratePromptState(raw)` repariert v1/v2-Imports:
  - wirft `genre`-Feld (deprecated) und `structure` weg
  - setzt fehlende Felder (`vocalLanguages`, `secondaryGenre`, `soundsLike*`,
    `customTags`) auf Defaults

---

## 12. Datenmodelle in `resources/`

### `genres/*.json` → 23 Main-Genres + viele Subgenres
```ts
Subgenre = {
  id, name, parent_main, parent,    // parent = Cluster für suggestions.ts
  bpm_min, bpm_max, keywords[], origin
}
```

### `moods.json`
```ts
{
  groups: { uplifting|melancholic|dark|calm|aggressive|romantic|cinematic: string[] }
  conflict_pairs: [string, string][]   // → validate() warnt wenn beide aktiv
}
```

### `instruments.json`, `vocals.json`, `tags.json`, `templates.json`,
### `dos_donts.json` — JSON-Listen, importiert via `lib/knowledge.ts`.

---

## 13. UI-Flow in der Preview-Spalte (rechts)

1. **Presets** (collapsible) — speichern + laden + löschen
2. **Pre-Flight Warnings** (preflightCheck)
3. **Pipeline-Button** (runStyleAndArrangement)
4. **Mode-Badge + Export/Import** JSON
5. **Style Prompt (Roh)** — buildStylePrompt-Output, Char-Limit-Bar
   (500/1000/5000 je Mode)
6. **KI-Ausformulierung** — runLlmBuilder, Stale-Badge, Refine-Input,
   Eye-Button für Prompt-Preview
7. **KI-Arrangement** — runLlmArrangement, Stale-Badge, Refine
8. **Titel-Generator** — runLlmTitles, "übernehmen"-Buttons je Titel
9. **VariantsPanel** — runLlmVariants (4 parallel)
10. **Validator-Issues** (max 5 angezeigt)
11. **Aktionen:** "In Suno öffnen" (kopiert + öffnet suno.com/create),
    "In Verlauf speichern"
12. **Verlauf** (collapsible) — Suche, max 10 sichtbar, Rating, Delete,
    Click → State + LLM-Outputs wiederherstellen

---

## 14. Settings-Panel (vollständige Optionen)

| Setting              | Typ                                           | Wirkung                                 |
|----------------------|-----------------------------------------------|-----------------------------------------|
| `ollamaUrl`          | URL                                           | API-Endpoint, Default localhost:11434   |
| `ollamaModel`        | Select (aus `/api/tags`)                      | Hauptmodell                             |
| `creativityMode`     | conservative / balanced / creative / wild     | Steuert Temperatur-Matrix (§7)          |
| `arrangementLength`  | short / standard / epic                       | 3–5 / 5–8 / 8–12 Sections               |
| `autoRetryOnCliche`  | bool                                          | Lyrics-Retry bei Klischee-Treffer       |
| `selfCritiqueLyrics` | bool                                          | 2. Pass nach Lyrics-Gen                 |
| `modelStyle`         | Select / leer                                 | Optionales Modell-Override für Style    |
| `modelArrangement`   | Select / leer                                 | dito Arrangement                        |
| `modelLyrics`        | Select / leer                                 | dito Lyrics — nützlich wenn Hauptmodell schwach auf DE |
| `temperature`        | 0.0 – 1.5                                     | Legacy-Slider, wird durch creativityMode überlagert |

Modell-Empfehlungen im Panel:
- DE/andere Sprachen: `qwen2.5:14b+` (Gemma 8B schwach auf DE)
- EN: `llama3.1:8b` oder `qwen2.5:7b` reichen
- Style/Arrangement: alle 7B+ ok

---

## 15. Reducer-Actions (vollständig)

```
SET_MODE | SET_SECTION
SET_MAIN_GENRE | SET_SUBGENRE | SET_BPM
TOGGLE_MOOD
SET_VOCAL_CHARACTER | SET_VOCAL_DELIVERY | SET_VOCAL_EFFECTS
TOGGLE_VOCAL_LANGUAGE
SET_SECONDARY_GENRE | SET_SOUNDS_LIKE | SET_SOUNDS_LIKE_DESCRIPTION
SET_INFO_MODAL
TOGGLE_INSTRUMENT | TOGGLE_PRODUCTION | TOGGLE_CUSTOM_TAG | TOGGLE_NEGATIVE
SET_TITLE | SET_LYRICS
LOAD_TEMPLATE | LOAD_PROMPT_STATE
SET_SETTINGS
LLM_START | LLM_CHUNK | LLM_DONE | LLM_ERROR | LLM_RESET
ARRANGEMENT_START | ARRANGEMENT_CHUNK | ARRANGEMENT_DONE | ARRANGEMENT_ERROR | ARRANGEMENT_RESET
TITLES_START | TITLES_DONE | TITLES_ERROR | TITLES_RESET
SHOW_PROMPT_PREVIEW | HIDE_PROMPT_PREVIEW
LLM_VARIANTS_START | LLM_VARIANT_DONE | LLM_VARIANTS_END
SET_HISTORY | SET_PRESETS
TOGGLE_SETTINGS | TOGGLE_IDEA
RESET    // erhöht resetCounter, behält settings/history/presets
```

Stale-Badge-Mechanik: jeder LLM_DONE speichert `sourceStylePrompt`.
Preview vergleicht ihn mit aktuellem `buildStylePrompt(prompt)` — bei
Abweichung erscheint "veraltet"-Badge.

---

## 16. Setup / Run

```bash
cd workspace/active/suno-prompt-gen-v2
npm install                # Erstinstallation
ollama serve               # in separater Shell
ollama pull llama3.1       # Modell laden
npm run dev                # http://localhost:5173
npm run typecheck          # tsc --noEmit
npm run build              # tsc -b && vite build
```

---

## 17. Bekannte Roadmap-Punkte / Ideen

- Brandneuer **Auto-Retry-Loop** (Klischee-Filter ↔ Regen): aktuell nur Setting
  + `findCliches()`, Loop-Implementierung im Lyrics-Flow steht noch aus
- **Self-Critique-UI-Feedback** (welche Zeilen wurden umgeschrieben?)
- Variants → "Best-of"-Auswahl + Übernahme-Button
- Refine-History pro Output speichern
- Lyrics-Section: Reim-Map / Silben-Counter
- Studio-Modus inhaltlich ausbauen (aktuell Sandbox)
- Genre-DB-Erweiterung (vor allem World/Latin)

---

## 18. Wichtige Konventionen für ChatGPT (bitte einhalten)

- **Kommunikation immer auf Deutsch**, knapp, ohne Floskeln, ohne Emojis.
- **Code-Identifier englisch**, Kommentare wo nötig deutsch.
- TypeScript bevorzugen, 2-Space-Einrückung, keine ungenutzten Imports.
- Bestehende Patterns respektieren — kein Over-Engineering, keine zusätzlichen
  Abstraktionen "auf Vorrat".
- Element-Order von Suno V5.5 ist heilig — Änderungen am Style-Builder
  müssen sie respektieren (siehe §6 + §8).
- Tag-Prefix-Routing in **drei Files synchron halten** (promptBuilder,
  systemPrompts, Sidebar).
- Bei Settings-/State-Änderungen `migratePromptState` und `CURRENT_EXPORT_VERSION`
  beachten.
- Keine Cloud-API einführen — Tool ist explizit lokal/Ollama.
