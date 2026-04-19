# UI-Wireframes — Suno Prompt Generator V2

ASCII-Mockups der 7 Tabs. Zweck: Grob-Layout zum Review bevor React-Komponenten gebaut werden.

---

## Globales Layout

```
┌────────────────────────────────────────────────────────────────────────────┐
│ [SUNO PROMPT STUDIO V2]                        [Ollama: ●]  [Settings] [_][X]│
├──────────────────────────────────────────────────────────────────────────────┤
│ [Quickstart] [Workflow] [Struktur] [Lyrics] [Templates] [Historie] [Einst.] │
├──────────────────────────────────────┬───────────────────────────────────────┤
│                                      │  LIVE-PREVIEW                         │
│   Tab-Inhalt hier                    │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━         │
│                                      │  Style-Prompt (Roh):                  │
│                                      │  [text...]                            │
│                                      │  [412 / 1000 Zeichen]                 │
│                                      │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━         │
│                                      │  Struktur-Block:                      │
│                                      │  [Verse], [Chorus], [Bridge]          │
│                                      │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━         │
│                                      │  Warnungen: 0  ✓                      │
│                                      │  [ Kopieren ]  [ LLM-Ausformulieren ] │
├──────────────────────────────────────┴───────────────────────────────────────┤
│ Statusleiste: Prompt ungespeichert · Modell: Llama 3.1 8B · ~2s Latenz       │
└──────────────────────────────────────────────────────────────────────────────┘
```

Links: Tab-Inhalt. Rechts: immer sichtbarer Preview-Stream. Unten: Status.

---

## Tab 1 — Quickstart

```
┌────────────────────────────────────────────────┐
│ QUICKSTART                                     │
├────────────────────────────────────────────────┤
│                                                │
│  Was fuer einen Track moechtest du?            │
│  ┌──────────────────────────────────────────┐  │
│  │ melancholischer synthwave track mit      │  │
│  │ duesterer atmosphaere und weiblichem     │  │
│  │ gesang                                   │  │
│  └──────────────────────────────────────────┘  │
│                                                │
│  [ LLM: Prompt aus Idee bauen ]                │
│  [ Workflow: Schritt-fuer-Schritt ]            │
│                                                │
│  ─── oder starte mit Template ───              │
│                                                │
│  [Synthwave Night-Drive] [Cinematic Trailer]   │
│  [Lo-Fi Study] [Trap Banger] [+7 weitere]      │
│                                                │
└────────────────────────────────────────────────┘
```

---

## Tab 2 — Workflow (5-Part-Wizard)

```
┌────────────────────────────────────────────────┐
│ WORKFLOW                          Schritt 2/5  │
│ ● ● ○ ○ ○                                      │
├────────────────────────────────────────────────┤
│                                                │
│  SCHRITT 1: GENRE                        [✓]   │
│  Synthwave (84-108 BPM)                        │
│  [ aendern ]                                   │
│                                                │
│  SCHRITT 2: MOOD & ENERGIE              [aktiv]│
│  ┌──────────────────────────────────────────┐  │
│  │ [ ] euphoric    [x] nostalgic            │  │
│  │ [x] brooding    [ ] triumphant           │  │
│  │ [ ] calm        [x] dark                 │  │
│  │ + Eigenen Mood eingeben                  │  │
│  └──────────────────────────────────────────┘  │
│  ⚠ Hinweis: "brooding" + "dark" sind aehnlich  │
│                                                │
│  SCHRITT 3: VOCALS                      [leer] │
│  SCHRITT 4: INSTRUMENTE                 [leer] │
│  SCHRITT 5: PRODUKTION                  [leer] │
│                                                │
│  [ Zurueck ]              [ Weiter Schritt 3 ] │
└────────────────────────────────────────────────┘
```

Accordion: aktiver Schritt aufgeklappt, fertige minimiert, kommende Schritte ausgegraut. Pro Schritt Info-Icon mit Erklaerung aus Guide.

---

## Tab 3 — Struktur (Bracket-Builder)

```
┌────────────────────────────────────────────────┐
│ STRUKTUR-BUILDER                               │
├────────────────────────────────────────────────┤
│  Verfuegbare Sektionen:          Deine Struktur│
│  ┌───────────────┐               ┌──────────┐  │
│  │ [Intro]       │    drag →     │[Intro:   │  │
│  │ [Verse]       │               │ Slow Bui.│  │
│  │ [Pre-Chorus]  │               │ Synth Pad│  │
│  │ [Chorus]      │               │ 15s]     │  │
│  │ [Bridge]      │               ├──────────┤  │
│  │ [Drop]        │               │[Verse 1] │  │
│  │ [Solo]        │               ├──────────┤  │
│  │ [Outro]       │               │[Chorus:  │  │
│  │ [Fade Out]    │               │ Exploding│  │
│  └───────────────┘               │ Full Band│  │
│                                  │ Anthemic]│  │
│  Ausgewaehlte Sektion editieren: ├──────────┤  │
│  ┌───────────────────────────┐   │[Verse 2] │  │
│  │ Typ: Chorus               │   ├──────────┤  │
│  │ Descriptoren:             │   │[Bridge]  │  │
│  │ [x] Exploding Energy      │   ├──────────┤  │
│  │ [x] Full Band             │   │[Outro:   │  │
│  │ [x] Anthemic              │   │ Fade Out]│  │
│  │ [ ] Half-Time             │   └──────────┘  │
│  │ + eigener Descriptor      │   [↑][↓][X]    │
│  └───────────────────────────┘                 │
└────────────────────────────────────────────────┘
```

---

## Tab 4 — Lyrics

```
┌────────────────────────────────────────────────┐
│ LYRICS                         1247 / 3000 Z.  │
├────────────────────────────────────────────────┤
│  Inline-Cues: [(whispered)] [(belted)]         │
│  [(spoken)] [(falsetto)] [(ad-lib)] [(harmon.)]│
│                                                │
│  ┌──────────────────────────────────────────┐  │
│  │ [Intro: Slow Build]                      │  │
│  │                                          │  │
│  │ [Verse 1]                                │  │
│  │ (whispered) I can still hear your voice  │  │
│  │ Fading in the neon haze                  │  │
│  │ ...                                      │  │
│  │                                          │  │
│  │ [Chorus: Exploding Energy]               │  │
│  │ (belted) WE WILL RISE AGAIN              │  │
│  │ (harmonized) Together we stand           │  │
│  │ ...                                      │  │
│  └──────────────────────────────────────────┘  │
│                                                │
│  Auto-Sync mit Struktur-Tab: [x]               │
│  [ LLM: Lyrics vorschlagen ]                   │
└────────────────────────────────────────────────┘
```

---

## Tab 5 — Templates

```
┌────────────────────────────────────────────────┐
│ TEMPLATES                    Filter: [Alle▼]   │
├────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────┐    │
│  │ Indie-Pop Anthem              108 BPM  │    │
│  │ indie pop, clean guitar arps, warm...  │    │
│  │ WARUM: Genre fuehrend, dann Instru...  │    │
│  │ [ Laden ]  [ Duplizieren ]             │    │
│  └────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────┐    │
│  │ Lo-Fi Study Beat               76 BPM  │    │
│  │ lofi hip hop, swung drums, vintage...  │    │
│  │ WARUM: Negative 'no vocals' crowdet... │    │
│  │ [ Laden ]  [ Duplizieren ]             │    │
│  └────────────────────────────────────────┘    │
│  ... (10 Standard + eigene)                    │
│                                                │
│  [ + Neues Template aus aktuellem Prompt ]     │
└────────────────────────────────────────────────┘
```

---

## Tab 6 — Historie

```
┌────────────────────────────────────────────────┐
│ HISTORIE              Suche: [_______] [Filter▼]│
├────────────────────────────────────────────────┤
│  ★★★★★ Nocturnal Drive           2026-04-14    │
│       synthwave · 96 BPM · v3                  │
│       Notiz: beste Variante bisher             │
│       [ Laden ]  [ Diff ]  [ Duplizieren ]     │
│  ─────────────────────────────────────────     │
│  ★★★☆☆ Nocturnal Drive           2026-04-14    │
│       synthwave · 96 BPM · v2                  │
│       [ Laden ]  [ Diff zu v3 ]                │
│  ─────────────────────────────────────────     │
│  ★★☆☆☆ Nocturnal Drive           2026-04-13    │
│       synthwave · 96 BPM · v1                  │
│       Notiz: Vocals zu leise                   │
│       [ Laden ]  [ Diff ]                      │
│  ─────────────────────────────────────────     │
│  ★★★★☆ Morning Coffee Lofi       2026-04-12    │
│       lofi · 76 BPM · v1                       │
└────────────────────────────────────────────────┘
```

---

## Tab 7 — Einstellungen

```
┌────────────────────────────────────────────────┐
│ EINSTELLUNGEN                                  │
├────────────────────────────────────────────────┤
│  LLM-PROVIDER                                  │
│  ( ● ) Ollama (lokal)                          │
│  Endpoint: [http://localhost:11434        ]    │
│  Modell:   [llama3.1:8b-instruct         ▼]    │
│  [ Verbindung testen ]                         │
│                                                │
│  ( ○ ) Claude (Cloud)                          │
│  API-Key:  [***********************]           │
│  Modell:   [claude-sonnet-4-6             ▼]   │
│                                                │
│  ( ○ ) OpenAI (Cloud)                          │
│  ( ○ ) Gemini (Cloud)                          │
│                                                │
│  ─────────────────────────────────────────     │
│  PROMPT-VERHALTEN                              │
│  [x] Deutsche Eingabe -> englischer Suno-Promp.│
│  [x] LLM-Modus "Strikt nach 5-Part-Formel"     │
│  [ ] Auto-Validierung live waehrend Eingabe    │
│                                                │
│  ─────────────────────────────────────────     │
│  DATEN                                         │
│  Datenbank: C:\...\suno-prompt-gen\data.db     │
│  [ Oeffnen ]  [ Backup erstellen ]             │
│                                                │
│  ─────────────────────────────────────────     │
│  UI                                            │
│  Theme: [ Dunkel ▼ ]                           │
│  Sprache: [ Deutsch ▼ ]                        │
└────────────────────────────────────────────────┘
```

---

## Interaktionsmuster (Cross-Tab)

1. **Workflow → Struktur**: Nach Schritt 5 bietet Wizard an, Struktur-Tab vorauszufuellen mit Genre-typischer Sektions-Reihenfolge.
2. **Struktur ↔ Lyrics**: Auto-Sync-Checkbox: Sektionen aus Struktur-Tab erscheinen als Bracket-Header in Lyrics.
3. **Preview (rechts)**: immer live, assembliert aus Workflow-State + Struktur-State + negative prompts.
4. **Historie ← alle Tabs**: „Speichern"-Button oben rechts legt aktuellen State als neuen Eintrag an.
5. **LLM-Ausformulieren**: Button im Preview-Panel ruft LLM mit System-Prompt (Guide-Regeln) + aktuellem State auf, streamt Ergebnis in Preview.

---

## Responsive / Fenstergroessen

- **Minimum:** 1280 × 720 (Live-Preview einklappbar unter 1100 px)
- **Empfohlen:** 1600 × 900
- **Maximized:** zwei Editoren nebeneinander (Struktur + Lyrics split)
