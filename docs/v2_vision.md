# Suno Prompt Generator V2 — Vision & Plan

**Projekt:** Windows-native Desktop-App für Suno-Prompt-Erstellung mit lokaler LLM-Anbindung
**Autor:** Martin Deppe
**Datum:** 2026-04-14
**Status:** Vision / Plan

---

## 1. Vision in einem Satz

Die einzige Windows-native Prompt-Workstation für Suno, die eine fundierte Prompt-Methodik (5-Part-Formel + Bracket-Theory) mit lokaler LLM-Ausformulierung und Prompt-Versionierung vereint — komplett offline-fähig.

---

## 2. Zielgruppe & Use Case

- **Primär:** Martin selbst — eigener Musik-Workflow, Suno-Experimente, Filmmusik/Trance/Hip-Hop-Projekte
- **Sekundär (optional):** Musikproduzenten die Suno ernsthaft nutzen wollen, ohne bei Web-Tools mit Paywall und Cloud-Zwang zu stranden

**Kern-Use-Case:** Nutzer startet mit einer Idee („melancholischer Synthwave-Track mit dunkler Atmosphäre"), wird durch strukturierte Eingaben geführt, bekommt am Ende einen validierten, LLM-ausformulierten Suno-Prompt der unter 1000 Zeichen bleibt und die Regeln des Master-Guides respektiert.

---

## 3. USPs gegenüber Konkurrenz

Aus dem Competitor-Report (9 Tools analysiert) resultieren **acht Differenzierungspunkte**, die V2 alle adressiert:

| # | USP | Konkurrenz |
|---|---|---|
| 1 | Vollständig offline-fähig (Ollama lokal) | Alle LLM-Tools sind Cloud-only |
| 2 | 5-Part-Formel als geführter Workflow | Niemand führt methodisch |
| 3 | Visueller Bracket-Notation-Builder | Maximal Presets, kein echter Editor |
| 4 | Negative-Prompts mit Konflikt-Warnung | Nur ein Tool hat Exclude-Feld |
| 5 | Genre → BPM-Range-Empfehlung automatisch | Niemand koppelt das |
| 6 | Lokale Prompt-Historie + Versionierung + Rating | Max. Favoriten ohne Versionen |
| 7 | Kommentierte Genre-Templates mit Erklär-Logik | Templates existieren, aber ohne Warum |
| 8 | Windows-native Desktop (kein Browser) | Alle außer MusicGPT sind Web |

---

## 4. Tech-Stack-Entscheidung

### Empfehlung: **Tauri 2 + React + TypeScript + Rust-Backend**

**Begründung:**
- Binary-Größe ~5–10 MB statt 85 MB wie bisherige NSIS-Bundles (beide vorhandenen .exe-Versionen sind so groß — V2 schlägt das um Faktor 10)
- Native Performance, minimaler RAM-Footprint
- Excellente Ollama-Anbindung via `ollama-rs` Crate
- SQLite integriert via `rusqlite`
- Moderne Web-UI (React) mit Hot-Reload in Entwicklung
- Sicheres IPC-Modell zwischen Frontend und Rust-Backend
- Zukunftssicher: Cross-Platform falls später gewünscht

**Alternativen (verworfen):**
- **Electron + React:** Bekannter, aber 80+ MB, hoher RAM-Verbrauch. Entspricht technisch bestehender .exe.
- **.NET / WPF:** Wirklich native, aber mehr Aufwand bei UI-Komponenten, Rust-Ökosystem ist besser für lokale LLM-Integration.
- **Python + PyQt6:** Schnell zu prototypen, aber Packaging umständlich, keine echte Abgrenzung zu V1.

### Komponenten

| Schicht | Technologie |
|---|---|
| UI | React 18 + TypeScript + Tailwind CSS + shadcn/ui |
| State | Zustand oder TanStack Query |
| Backend (embedded) | Rust via Tauri Commands |
| Persistenz | SQLite via `rusqlite` |
| LLM lokal | Ollama HTTP-API via `ollama-rs` |
| LLM Cloud (optional) | Anthropic/OpenAI/Gemini SDK |
| Secrets | Tauri Stronghold oder OS-Keychain |
| Build/Install | Tauri Bundler (MSI / NSIS) |

---

## 5. Architektur

```
┌────────────────────────────────────────────┐
│  React UI (Tabs: Workflow, Struktur,       │
│             Templates, Lyrics, Historie)   │
└─────────────────┬──────────────────────────┘
                  │ Tauri IPC (invoke)
┌─────────────────▼──────────────────────────┐
│  Rust Core                                 │
│  ├─ PromptBuilder (5-Part-Formel-Engine)   │
│  ├─ StructureAssembler (Bracket-Builder)   │
│  ├─ Validator (Länge, Konflikte, Regeln)   │
│  ├─ LLMDispatcher (Ollama / Cloud)         │
│  ├─ KnowledgeBase (Guide-JSON)             │
│  └─ Repository (SQLite)                    │
└─────────────────┬──────────────────────────┘
                  │
         ┌────────┴─────────┐
         ▼                  ▼
    ┌─────────┐        ┌──────────────┐
    │ SQLite  │        │ Ollama local │
    │ prompts │        │ (RTX 3060)   │
    └─────────┘        └──────────────┘
```

---

## 6. Feature-Roadmap (4 Phasen)

### Phase 1 — MVP (ohne LLM)
**Ziel:** Funktionale App die ohne Cloud/LLM einen validen Suno-Prompt baut.

- Tab „Workflow": Geführter 5-Step-Wizard (Genre → Mood → Vocals → Instrumente → Production)
- Genre-Dropdown mit 30+ Einträgen (aus Master-Guide)
- BPM-Range-Suggest je Genre
- Negative-Prompt-Bereich mit Kategorie-Dropdowns
- Live-Preview des zusammengebauten Roh-Prompts
- Validator (1000-Zeichen-Limit, widersprüchliche Moods, >20 Tags)
- Copy-to-Clipboard
- 10 Genre-Templates aus dem Guide als Starter

### Phase 2 — LLM-Ausformulierung
**Ziel:** LLM formuliert aus strukturierten Eingaben den finalen Prompt aus.

- Ollama-Integration (lokal, RTX 3060, Default: Llama 3.1 8B oder Mistral)
- System-Prompt basiert auf Master-Guide-Regeln
- Zwei Modi: „Strikt nach Formel" vs. „Kreative Interpretation"
- Streaming-Output in UI
- Fallback auf Cloud-LLMs (Claude/OpenAI/Gemini) via Settings
- Prompt-Enhancement: LLM prüft Nutzer-Eingabe auf Lücken und fragt nach

### Phase 3 — Struktur-Builder & Historie
**Ziel:** Power-User-Features.

- Tab „Struktur": Drag-and-Drop-Builder für `[Intro]` `[Verse]` `[Chorus]` mit Descriptoren
- Inline-Vocal-Cues `(whispered)` `(belted)` mit Quick-Insert
- Tab „Lyrics": Editor mit Cue-Snippets, 3000-Zeichen-Zähler
- Tab „Historie": SQLite-Liste, Suche, Tags, 1–5-Sterne-Rating, Notizen nach Suno-Test
- Diff-Ansicht zwischen zwei Prompt-Versionen
- Parent-Child-Beziehung (Prompt → Variante)

### Phase 4 — Stretch-Goals
- Audio-Analyse-Import (Gemini 2.5 Flash wie SunoReferenceArchitect) für Reverse-Engineering
- Eigene Template-Library (Export/Import, teilen)
- Konflikt-Warnung per LLM live während Eingabe
- Prompt-A/B-Generator (3 Varianten automatisch)
- Integration in Martin's bestehenden Knowledge-Hub

---

## 7. UI-Grobkonzept (Tab-Struktur)

| Tab | Inhalt |
|---|---|
| **1. Quickstart** | Freitext-Idee + „Aus Idee generieren" (LLM) oder „Geführter Workflow" |
| **2. Workflow** | 5-Step-Wizard, Schritte einzeln oder alle sichtbar |
| **3. Struktur** | Bracket-Builder, Sektionen drag&drop, Inline-Cues |
| **4. Lyrics** | Text-Editor mit Struktur-Sync und Cue-Insert |
| **5. Templates** | 10 Genre-Templates + eigene, kommentiert |
| **6. Historie** | Alle gespeicherten Prompts, Such-/Filter-/Rating-Leiste |
| **7. Settings** | LLM-Provider, API-Keys, Ollama-Endpoint, Theme |

**Live-Preview-Panel:** immer sichtbar rechts, zeigt aktuellen zusammengebauten Prompt mit Zeichen-Zähler.

---

## 8. Datenmodell (SQLite)

```sql
CREATE TABLE prompts (
  id INTEGER PRIMARY KEY,
  parent_id INTEGER NULL,  -- für Versionierung
  title TEXT,
  style_prompt TEXT,       -- Roh-Output
  llm_prompt TEXT,         -- LLM-ausformulierte Variante
  structure TEXT,          -- Bracket-Sektionen als JSON
  lyrics TEXT,
  negative_prompts TEXT,
  genre TEXT,
  bpm INTEGER,
  rating INTEGER,          -- 1-5
  notes TEXT,              -- nach Suno-Test
  tags TEXT,               -- komma-separiert
  created_at DATETIME,
  updated_at DATETIME
);

CREATE TABLE templates (
  id INTEGER PRIMARY KEY,
  name TEXT,
  genre TEXT,
  style_base TEXT,
  structure_base TEXT,
  explanation TEXT,        -- warum dieses Tag-Set funktioniert
  is_user_template INTEGER
);

CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

CREATE TABLE knowledge (
  id INTEGER PRIMARY KEY,
  category TEXT,           -- genre, bpm, vocal_tag, ...
  key TEXT,
  value TEXT,
  notes TEXT
);
```

---

## 9. LLM-Integration — Details

### Lokal (Default): Ollama
- **Modell:** Llama 3.1 8B Instruct oder Mistral 7B Instruct (passt auf RTX 3060, 12 GB VRAM)
- **Latenz:** ~1–3 s für 400-Token-Output
- **System-Prompt:** enthält komprimierte Version des Master-Guides (Do/Don't, 5-Part-Formel, Tag-Beispiele)
- **Kosten:** 0

### Cloud (Optional)
- **Claude Sonnet 4.6:** höchste Qualität, ~3 ¢ pro Ausformulierung
- **OpenAI GPT-4.1 / Gemini 2.5 Flash:** Alternativen
- **API-Keys:** verschlüsselt in Tauri Stronghold

### LLM-Aufgaben
1. **Ausformulierung:** Struktur-Input → natürlichsprachiger Suno-Prompt (≤1000 Zeichen)
2. **Prompt-Enhancement:** Nutzer-Idee → nachgefragte Präzisierung → strukturierte Eingabe
3. **Konflikt-Erkennung:** Warnt bei widersprüchlichen Moods oder Tags
4. **Lyrics-Vorschläge:** optional, auf Basis Genre + Thema
5. **Übersetzung:** Deutsche Eingabe → englischer Suno-Prompt (Suno funktioniert besser auf Englisch)

---

## 10. Knowledge-Base-Integration

Der vorhandene `Suno_AI_Prompt_Mastery_Guide.md` wird zu strukturierten JSON-Dateien im App-Resource-Bundle:

- `genres.json` — 30+ Genres mit BPM-Ranges, typischen Keywords, Instrumenten
- `moods.json` — Mood-Keywords, Konflikt-Paare
- `vocals.json` — Character/Delivery/Effects-Layer-System
- `instruments.json` — Specific vs. Generic Mapping
- `tags.json` — alle Bracket-Tags kategorisiert
- `templates.json` — die 10 Genre-Templates
- `dos_donts.json` — Validator-Regeln

Diese Dateien sind der „Motor" — App ohne LLM liefert bereits brauchbare Prompts durch regelbasierte Zusammensetzung.

---

## 11. Projektstruktur

```
suno-prompt-gen-v2/
├─ src-tauri/             # Rust-Backend
│  ├─ src/
│  │  ├─ main.rs
│  │  ├─ commands/        # Tauri IPC-Handler
│  │  ├─ core/            # Builder, Validator, Assembler
│  │  ├─ llm/             # Ollama + Cloud-Dispatcher
│  │  └─ db/              # SQLite-Repository
│  └─ tauri.conf.json
├─ src/                   # React-Frontend
│  ├─ components/
│  ├─ pages/              # Workflow, Struktur, Templates, ...
│  ├─ hooks/
│  └─ lib/
├─ resources/             # Knowledge-Base JSON
│  ├─ genres.json
│  ├─ moods.json
│  └─ ...
├─ docs/
│  ├─ v2_vision.md        # dieses Dokument
│  └─ architecture.md
├─ research/
│  └─ competitor_analysis.md
└─ README.md
```

---

## 12. Offene Entscheidungen

Bevor Implementierung startet, Klärung mit Martin:

1. **Stack-Final:** Tauri 2 bestätigt oder Electron/PyQt6 bevorzugt?
2. **Primär-Sprache UI:** Deutsch, Englisch oder beide?
3. **Ollama-Modell-Default:** Llama 3.1 8B vs. Mistral vs. Qwen2.5?
4. **Lizenz:** Privat geschlossen oder Open Source (MIT) zur späteren Veröffentlichung?
5. **Scope MVP:** Nur Suno oder auch Udio/Riffusion mit abweichender Prompt-Syntax?
6. **Installer:** MSI, portable .exe oder beides?
7. **Audio-Analyse (Phase 4):** wirklich gewünscht oder zu spezifisch?

---

## 13. Nächste Schritte

Nach Bestätigung der Vision:

1. **Prototyp-Spike** (2–4 h): Tauri-App mit einem Tab + Ollama-Hello-World
2. **Knowledge-Base-Extraktion** (2–3 h): Master-Guide → strukturierte JSONs
3. **UI-Mockup** (1–2 h): Figma oder ASCII-Wireframes der 7 Tabs
4. **Phase 1 Build** (~15–25 h): MVP ohne LLM
5. **Phase 2 Build** (~10–15 h): Ollama-Anbindung + LLM-Modi

Begleitend: Tests pro Modul, besonders Validator und PromptBuilder (deterministische Logik).

---

## 14. Anhang: Referenzen

- Competitor-Report: `research/competitor_analysis.md`
- Original-Guide: `C:\Users\MaTra\Desktop\Claude code projekte\Suno_AI_Prompt_Mastery_Guide.md`
- Alte Tools: `C:\Users\MaTra\Downloads\SunoPromptGenerator-portable ( K.I. UPDATE ).exe`, `MusicPromptStudio-portable.exe`

