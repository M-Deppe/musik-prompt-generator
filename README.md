# Musik Prompt Generator V1

Lokaler Style-Prompt-Generator für **Suno** und **Udio** mit strukturierter
Auswahl, KI-Ausformulierung über Ollama, Variant-Generator, Titel-Generator,
Arrangement-Builder und Lyrics-Assistent. Browser-basiert, läuft komplett
lokal. Optionaler Cloud-Fallback (Anthropic / OpenAI) wenn Ollama offline ist.

Ziel-Plattform wird im Header umgeschaltet — Suno bekommt einen Prosa-Prompt
mit optionalen Struktur-Tags in den Lyrics, Udio eine komma-separierte
Tag-Liste ohne Meta-Tags. Der strukturierte Roh-Prompt funktioniert für beide.

## Stack

- React 18 + TypeScript + Vite 5
- TailwindCSS v4 (JIT)
- Vitest + @testing-library/react (131 Tests)
- Ollama als primäres LLM-Backend, optionaler Cloud-Fallback

## Entwicklung

```bash
npm install
npm run dev         # Vite-Dev-Server auf http://localhost:5173
npm run typecheck   # TypeScript check
npm test            # Vitest once
npm run test:watch  # Vitest im Watch-Modus
npm run test:ui     # Vitest mit Browser-UI
npm run build       # Production-Build
```

**Voraussetzung**: Ollama läuft lokal unter `http://localhost:11434`.
Start mit `ollama serve` in einer Shell oder über `start.bat`.

## Features

### Prompt-Aufbau

- **3 Modi**: Simple, Custom, Studio — unterschiedlich viele Sektionen
- **23 Hauptgenres + ~200 Subgenres** mit BPM-Ranges und Keywords
- **Zweitstil** aus allen Subgenres für Fusion
- **Genre-Quickstart**: 23 Presets die Mood/Tags/Settings passend setzen
- **55 Moods** in 7 Gruppen mit Konflikt-Paaren und Beschreibungen
- **Strukturierte Sections** für Drums, Bass, Guitars, Keys, Winds, Percussion,
  Harmony, Structure, Dynamik, Earcandy, MixMaster, SoundQuality, StyleTags,
  Emotionen, Gesang, Tempo, Aera, SongThema, Stuecktyp, ExcludeStyles,
  SunoStudio, Lyrics, Templates, Blueprint
- **Klingt-wie-Analyse**: LLM extrahiert Style-Parameter aus Künstlernamen

### KI-Features (lokal via Ollama)

- **Target-Toggle**: Suno (Prosa) ↔ Udio (Tag-Liste) im Header, beeinflusst
  LLM-System-Prompt, Aktions-Button ("In Suno/Udio öffnen") und UI-Hinweise
- **Style-Ausformulierung**: strukturierter Roh-Prompt → Ziel-spezifischer
  Style-Prompt (Prosa für Suno, Tag-Liste für Udio) mit SELF-VERIFICATION +
  Penalty-Framing
- **Qualitäts-Gates**: Auto-Retry bei Klischees, Self-Critique-Pass für Lyrics,
  Auto-Refine Style bei niedrigem Score (3 unabhängig schaltbar)
- **Variants**: 8 parallele Style-Varianten — safe/experimental/minimal/intense/
  vintage/modern/cinematic/lofi mit Vergleichs-Metriken und Vote-Tracking
- **LLM-as-Judge**: zweiter LLM-Pass bewertet den Style-Output mit 1–10 Score
  inkl. Stärken, Schwächen und Verdict (JSON-Schema)
- **Genre-Crossover-Assistent**: bei Haupt + Zweitgenre schlägt das LLM
  Bridge-Instruments, Production-Hints, Mood-Palette und Pitfalls vor
- **Arrangement-Generator**: strukturierte Section-Liste mit Pipe-Syntax
- **Lyrics-Generator**: genre-adaptive Songtexte
- **Titel-Generator**: 5 Vorschläge basierend auf Style + Lyrics, mit Favoriten
- **Refinement**: User-Feedback → umgeschriebener Output mit Verlauf
- **Auto-Model-Routing**: Sprache im Prompt → passendes Ollama-Modell
  (qwen2.5 für Deutsch, llama3.1 für Englisch etc.)
- **Kreativitätsmodus**: konservativ/balanced/kreativ/wild, steuert Temperatur
  pro Task — Style niedrig (klar), Lyrics hoch (variantenreich), Critique
  deterministisch
- **Cloud-Fallback**: Anthropic- oder OpenAI-Key in Settings hinterlegen,
  springt automatisch ein wenn Ollama-Fetch fehlschlägt

### Qualität & Workflow

- **Score-Engine**: 0-100 Bewertung nach Genre-Klarheit, Spezifität,
  Production-Dichte, Bonus, Penalty — mit farbigen Balken pro Kategorie
- **Validator**: Hard-Errors bei >1000 Zeichen, Negation-Kollisionen,
  doppelten Tags; Warnings bei Descriptoren-Range, Command-Keywords,
  widersprüchlichen Moods
- **Preflight-Check**: blockierende Inkonsistenzen vor LLM-Call
- **History**: letzte 100 Prompts mit Rating, Notes, Suche, Min-Score-Filter
- **Compare-View**: zwei History-Einträge nebeneinander mit Score-Delta und
  Apply-Buttons
- **Presets**: 50 benannte PromptStates speichern, mit Tags und Filter-Pills
- **Templates**: 10 kuratierte Genre-Starter
- **Stats-Modal**: Top-Genres, Top-Moods, Ø Score, BPM, Rating, Aktivität

### UX

- **Deep-Linking**: `#s=v1:base64` im URL-Hash → shareable Prompts
- **Keyboard-Shortcuts**: Ctrl+Enter/S/K/I/Z/Shift+Z/Y/Slash, Esc schließt
  Modale; Undo/Redo mit 20-Schritte-Stack
- **Backup/Restore**: Full-Export aller localStorage-Daten als JSON
- **Auto-Backup-Schedule**: optional alle 7 / 14 / 30 Tage automatisch
- **7-Tage-Reminder-Banner** wenn Backup überfällig
- **Onboarding-Overlay** beim ersten Besuch
- **ErrorBoundary** mit State-Export bei Render-Fehlern
- **Dark/Light-Mode** via body-Class + CSS-Variables
- **Suche** in jeder Section mit Substring-Match auf Label/Hint/ID
- **~215 Einstellungs-Beschreibungen** neben Items
- **Section-Counter** in Sidebar zeigt wo Auswahlen sitzen
- **Animierter Hintergrund** (network/liquid/stream/aurora/off) in Settings
  wählbar
- **PWA**: installierbar via beforeinstallprompt-Banner, Service-Worker
  cacht App-Shell für Offline-Start
- **Mobile-Layout**: auf < 1024px Sidebar und Preview als Overlay via
  Hamburger/Eye-Buttons im Header
- **A11y**: sichtbarer Focus-Ring (`:focus-visible`), Skip-Link, ARIA-Labels,
  respektiert `prefers-reduced-motion`

### Schutzmaßnahmen

- **Auto-Save** des Prompts alle 300 ms
- **Auto-Fetch** der Ollama-Modellliste alle 60 s
- **isAbortError-Guards** in allen LLM-Calls
- **Race-Schutz** bei Reset-während-Generation (cancelled-Ref in Lyrics,
  signal.aborted in runRefinement)
- **TypeScript strict**, 131 Tests decken validator, ErrorBoundary,
  BackupReminder, Onboarding, autoModelRouting, urlState, variantStats,
  historyStats, llm.formatArrangement, sentenceSplit, titleFavorites,
  CheckList-Suche

## Architektur

```
src/
├── App.tsx                  Shell + globale Effects (SW, Shared-Link, Theme)
├── main.tsx                 React-Entry, SW-Cleanup im Dev
├── store.ts                 useReducer-Store, localStorage-Persistenz
├── types.ts                 PromptState, Settings, Score etc.
├── sections.tsx             Category/Section-Registry pro Modus
├── components/              UI-Komponenten (Header, Sidebar, Modals, Preview)
├── content/
│   ├── CheckList.tsx        zentrale Auswahl-Liste mit Suche
│   ├── registry.tsx         section-id → React-Komponente
│   └── sections/            ~27 Section-Dateien
├── lib/
│   ├── ollama.ts            Fetch + Streaming zu /api/generate
│   ├── llm.ts               runLlmBuilder/Arrangement/Titles/Refine/Variants
│   ├── systemPrompts.ts     SYSTEM_PROMPT_BUILDER + FROM_IDEA
│   ├── promptBuilder.ts     deterministischer Roh-Prompt-Bauer
│   ├── validator.ts         validate/preflightCheck/scorePrompt
│   ├── persistence.ts       localStorage + Full-Backup
│   ├── allGenres.ts         MAIN_GENRES, SUBGENRES
│   ├── knowledge.ts         moods, tags, MOOD_DESCRIPTIONS
│   ├── autoModelRouting.ts  Sprache → Modell
│   ├── urlState.ts          Hash-Fragment-Share
│   ├── variantStats.ts      Winner-Tracking
│   ├── historyStats.ts      Aggregationen fürs Stats-Modal
│   ├── sentenceSplit.ts     Display-Formatter
│   └── backgroundStyles.ts  (ungenutzt, reserviert)
└── resources/               JSON: moods, templates, tags, vocals, genres/*
```

## Konventionen

- UI-Sprache: deutsch
- Code-Bezeichner: englisch
- Commit-Messages: deutsch, Conventional Commits
- Standard: keine externen Cloud-Calls. Cloud-Fallback ist explizit opt-in
  und nutzt deinen eigenen API-Key (im localStorage, nichts geht an Dritte
  außer den Provider selbst).
- `workspace/active/suno-prompt-gen-v2/` lebt im Monorepo `Claude_Code_Projekte`

## Bekannte Quirks

- **Ollama + Gemma4**: `num_predict` nicht setzen — bei langem System-Prompt
  stoppt der Call sofort mit 0 Tokens (inkl. Input-Kontext zählt)
- **Suno-Style-Feld**: 1000-Zeichen-Limit, Fließtext bevorzugt gegenüber Tags
- **Udio-Style-Feld**: ~900 Zeichen, Tag-Liste bevorzugt, keine Struktur-/
  Meta-Tags, Prompt-Strength-Slider (im UI der Udio-Web-Plattform)
- **Lyrics-Generator**: primär Suno-orientiert (Struktur-Tags, Pipe-Syntax);
  für Udio nur den Text-Teil übernehmen, die Tags weglassen
- **SunoStudio-Section**: Meta-Tags funktionieren nur in Suno-Lyrics-Box
- **Service-Worker**: nur in PROD registriert, Dev unregistert aktiv damit
  kein Cache-First-Verhalten vom SW Updates blockiert
- **Cloud-Fallback / OpenAI im Browser**: Anthropic funktioniert direkt via
  `anthropic-dangerous-direct-browser-access`-Header. OpenAI bietet offiziell
  keinen Browser-CORS-Modus — der Fallback kann scheitern, wenn OpenAI die
  Browser-Origin blockt. Für produktiven OpenAI-Einsatz einen eigenen
  CORS-Proxy dazwischen schalten oder Anthropic bevorzugen.
- **Browser-Support**: primär auf Chromium (Chrome/Edge) getestet. Firefox
  und Safari sollten laufen, aber sind nicht systematisch verifiziert.

## Lizenz

MIT — siehe [LICENSE](./LICENSE). Kurz: nutzen, modifizieren, verteilen
erlaubt; keine Gewährleistung, keine Haftung.

## Disclaimer

Dieses Projekt steht in **keiner Verbindung zu Suno Inc., Udio AI,
Anthropic PBC oder OpenAI**. „Suno", „Udio", „Claude" und „GPT" sind
Marken der jeweiligen Inhaber und werden hier ausschließlich nominativ
genannt, um den Einsatzzweck des Tools zu beschreiben.

**Cloud-Fallback**: Wenn du einen Anthropic- oder OpenAI-API-Key
einträgst, werden deine Prompts direkt aus deinem Browser an den
jeweiligen Anbieter geschickt — dein Key bleibt im lokalen `localStorage`.
Abrechnung, Datenschutz und Nutzungsbedingungen liegen ausschließlich
beim gewählten Anbieter.

**Generierte Inhalte**: Das Tool erzeugt ausschließlich Text-Prompts.
Die eigentliche Musikgenerierung erfolgt auf externen Plattformen
(Suno/Udio) und unterliegt deren Nutzungsbedingungen. Für kommerzielle
Nutzung generierter Musik sind die Plattform-AGBs zu beachten.

## Autor

Martin Deppe — martindeppe1@googlemail.com
