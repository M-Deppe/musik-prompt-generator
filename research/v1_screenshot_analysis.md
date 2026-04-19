# V1 Screenshot-Analyse — "Music Prompt Studio" (by M.Deppe, v1.1.0)

Analyse-Basis: ~22 gesichtete Screenshots aus 123 Aufnahmen (22:25–22:39).
Ziel: Feature-Inventar V1 erfassen, Gap-Analyse gegen V2-MVP, priorisierte Übernahme-Empfehlungen.

---

## 1. App-Übersicht

### Branding & Fenster
- **Name in V1:** `Music Prompt Studio v1.1.0` (by M.DEPPE). Nicht mehr "Suno Prompt Generator" — Rebranding bereits erfolgt.
- **Fenstergröße:** Desktop, ca. 1400×900, Windows-Native-Titleleiste.
- **Navigation oben:** `Handbuch` · `Impressum` (Textlinks), rechts Moduswahl `Simple | Custom | Studio` als Segmented-Button (aktiv = orange/gelb).
- **Theme:** Dunkel, warmer Anthrazit-Hintergrund, Akzentfarbe Bernstein/Gold (nicht Violett wie V2). Equalizer-Logo links.
- **Sprache:** Deutsch für UI-Labels, Englisch für Fach-Tags und Werte-Beispiele. Gemischt konsistent.

### Drei-Modus-Architektur
Klare Progression Simple → Custom → Studio:

| Modus | Sidebar-Einträge | Seitenzähler | Charakter |
|-------|------------------|--------------|-----------|
| **Simple** | 11 (Grundstil, Ära, Dynamik, Emotionen, Tempo, Sound-Qualität, Gesang, Song-Thema, Style-Tags, Exclude-Styles, Prompt-Blueprint) | `1/11` | Einsteiger-Wizard |
| **Custom** | 23 (zusätzlich: Stücktyp & Besetzung, Drum & Beatdesign, Percussion layern, Bass & Low End, Gitarren & Clav, Bläser & Streicher, Tasten & Synths, Earcandy & Kontrast, Harmonie & Tonalität, Struktur & Form, Mix & Master, Ausschlüsse Negativ-Prompt) | `1/23` | Profi-Detailtiefe |
| **Studio** | 1 (Suno Studio) — aber mit vielen kollabierten Tag-Sektionen | `1/1` | Direkt-Tags für Suno 4.5 |

### Rechte Seitenleiste (konstant, modusabhängig)
- **PRESETS** (Dropdown oben) — speicher-/ladbare Konfigurationen.
- **Modus-Badge** (SIMPLE / CUSTOM / STUDIO) + **Export**-Button.
- **STYLE PROMPT**-Card: KI-Model-Dropdown (`KI | 14` → Optionen `1B, 3B, 7B, 12B, Nemo, 14B, Song, Lyric`), `Kopieren`-Button, Textarea mit Counter `0/500` (Simple) bzw. `0/1000` (Custom), `0/5000` (Studio).
- **VERLAUF** (`10`-Badge = Anzahl) — Historie/Prompt-Archiv.
- Counter-Tape (Fortschrittsbalken unter Textarea).

### Dynamische Zusatzkomponenten (nur Custom)
- **"Passend zu: [Subgenre]"-Karte** (grün) mit Smart-Suggestions pro Bereich (Stimmung/Tempo/Drums/Bass/Stimme) + `+ Button` je Vorschlag + `Alle übernehmen`-Knopf.
- **AUFBAU & ARR…** (Violett!) — KI-generierte Song-Struktur mit Zeitstempeln, Lyrics-Platzhaltern, direkt in Suno-Format.
- **4 Variationen generieren (Safe / Experimental / Minimal / Intense)** — KI-Feature mit 4-Karten-Grid, je `Übernehmen`/`Kopieren`.
- **In Suno öffnen**-Button (blauer Direct-Launch).
- Validierungs-Hinweis oben: `● 1 Style-Tags – zu wenig (ideal: 4–12)`.

---

## 2. Feature-Inventar (nach Bereichen)

### 2.1 Simple-Modus — 11 lineare Schritte

**Grundstil & Mischung (1/11):** Hauptgenre (Liste: Reggae, Latin, Brazilian, Afrobeats, Afro Soul, World, Schlager, Fun & Novelty, Ambient, Experimental …). Subgenre (mit `12 passend`-Badge, kontextsensitiv). Zweitstil (optional). Klingt wie… Referenz (optional). Alle mit Suchfeld, Checkbox-Liste, Checkmark-Indikator (`1✓`), Clear-Button (`×`).

**Ära & Klangepoche (2/11):** Dekade/Zeitgeist (optional), Produktionsstil/Ästhetik (Analog–Bandmaschine, Lo-Fi, Hi-Fi, Vintage, DIY/Bedroom, Radiofreundlich, Underground, Hyper-Modern 2024+, Orchestral Recorded …).

**Dynamik & Energie-Verlauf (3/11):** Energie-Bogen, Intro-Charakter (Solo-Instrument, Ambient, Full Band, Riff-getrieben, Vocal-first, Beat-first, Fade-in, Cold Open, Silent Intro…), Breakdown/Bridge-Energie (Kein Breakdown, Instrumental Break, Stripped Back, Emotionale Pause, Chaos/Noise, Spoken Word Insert, Modulationsbridge, Rhythmischer Breakdown), Klimax & Höhepunkt.

**Emotionen & Einsatz (4/11):** (nicht direkt sichtbar, Label in Sidebar).

**Tempo & Groove (5/11):** Tempo (BPM), Groove Feeling (Straight, Slightly swung, Heavy swing–Jazz/Blues, Shuffle, Funky, Push, Laid-back, Glitchy, Half-time feel…), Taktart & Metrik.

**Sound-Qualität & Suno Magic (6/11):** Klangqualität/Production Polish, Melodie-Charakter, Dynamik-Effekte (Crescendo, Decrescendo, Subito Piano/Forte, Sforzando, Plötzliche Kontraste, Terraced Dynamics, Schwellend).

**Gesang (7/11):** Stimmtyp (Weiblich Sopran/Mezzo/Alt/Koloratursopran, Kinderstimme, Androgyne Stimme, Duett männlich+weiblich, Duett zwei Männerstimmen…). Vortragsstil (Unclean/Harsh, Death Growl, Whisper, ASMR-Whisper, Scat Singing, Yodel, Throat Singing, Beatboxing, Talking-Singing…). Vocal Processing/FX (Bitcrusher, Reversed Vocals, Harmonizer, Lo-Fi Telephone, Radio Effect, Flanger, Pitch Shifted Down/Up, Formant Shifted…). Gesangssprache. Vokal-Arrangement (Solo, Duett, Chor, A Cappella, Call & Response, Kanon/Round, Unisono, Kontrapunkt, Layered Vocals). Backing Vocals & Harmonien.

**Song-Thema & Einsatz (8/11):** (Sidebar-Eintrag).

**Style-Tags eingeben (9/11):** Freitext-Tag-Eingabe.

**Exclude-Styles eingeben (10/11):** Ausschluss-Tags (Freitext, kommagetrennt).

**Prompt-Blueprint (KI-Struktur) (11/11):** Textbeschreibung des Prompt-Aufbaus. **Vorlagen laden:** `Dein Beispiel – Cinematic Rock+Dubstep`, `Klassisch – Verse/Chorus Aufbau`, `Crescendo – Von ruhig zu episch`, `A/B Kontrast – Hart & Weich`, `EDM/Club – Build, Drop, Break`, `Chill / Lo-Fi – Entspannt fließend`. Textarea mit ausformuliertem Beispiel.

Footer: `← Zurück` · `1/11` · `Weiter →`.

### 2.2 Custom-Modus — 23 Schritte

Zusätzlich zu Simple:
- **Stücktyp & Besetzung**
- **Drum & Beatdesign:** Kit-Charakter (Breakbeat, Industrial, Jazz Brushes, Reggae One Drop, Latin Percussion, Modular/Eurorack, TR-808, TR-909, Linndrum…). Programmierung & Feel (Streng quantisiert, Leicht humanisiert, Stark humanisiert, Swing-Quantisierung, Ghost Notes, Glitchy, Step-Sequencer-feel, Polyrhythmisch). Hats & Becken (Tight closed hats, Open hats, Rolling hats, Ride dominant–Jazz feel, Splash-Akzente, China-Cymbal, Hi-hat Pedal-Muster, Sweep Rides, Keine Becken).
- **Percussion layern:** World Percussion (Pandeiro, Shekere, Talking Drum, Udu, Frame Drum, Dumbek/Doumbek, Steel Drums, Kanjira…), Color Hits, FX Percussion.
- **Bass & Low End**
- **Gitarren & Clav**
- **Bläser & Streicher:** Streicher, Holzbläser, Blechbläser, Harfe & Zupfinstrumente (Sitar indisch, Oud arabisch/türkisch, Kora westafrikanisch, Balalaika russisch, Charango andino, Theremin, Ondes Martenot…).
- **Tasten & Synths:** Keys, Synth/Arps (Drone, Noise Sweeps, FM-Synth DX7-Style, Wavetable, Reese Bass detuned, Supersaw, Ambient Texture granular, Acid Line 303…), Mallet/Toy.
- **Earcandy & Kontrast**
- **Harmonie & Tonalität**
- **Struktur & Form:** Songform (Verse–Chorus–Verse–Chorus–Bridge–Chorus, AABA Tin Pan Alley, Strophisch, Through-composed, Intro–Vers–Pre-Chorus–Chorus–Outro, Loop-basiert, Suite, Sonatenform klassisch), Solo-Slots, Schluss.
- **Mix & Master:** Raum & Hall, Stereo & Tiefe, Tonalziel, Frequenzprofil/EQ-Charakter (Tiefes Sub-Bass-Fundament, Punchige Bässe mittig+druckvoll, Schlanke Bässe straff, Klare Mitten, Ausgehöhlte Mitten U-Form-EQ, Präsente Hochmitten, Helle Höhen Luft+Brillanz, Sanfte Höhen smooth, Full-Range). Dynamik & Kompression, Aufnahmequalität & Klangstandard, Sättigung & Klangfärbung.
- **Ausschlüsse (Negativ-Prompt)**

### 2.3 Studio-Modus — Direkt-Tag-Baukasten

Eine Seite (`1/1`) mit kollabierten Sektionen, Textarea-Counter `0/5000`:
- **Struktur-Tags (Songaufbau):** `[Verse]`, `[Bridge]`, `[Interlude]`, `[Break]`, `[Drop]`, `[Build]`, `[Breakdown]`, `[Solo]`, `[Guitar Solo]` …
- **Vokal-Tags (Lieferung & Charakter)**
- **Vokal-FX-Tags**
- **Instrument-Tags:** `[Electronic Drums]`, `[Breakbeat]`, `[Synth Bass]`, `[Acid Bass]`, `[Wobble Bass]`, `[Glitch]`, `[Violin]`, `[Strings]`, `[Cello]` …
- **Sound-Effekt-Tags**
- **Stimmungs-Tags**
- **Kreativregler (Suno V4.5+)** — optional
- **Parametrisierte Tags (Pro):** `[Intro: ambient buildup, no drums]`, `[Intro: cold open, single instrument]`, `[Outro: fade out, reverb tail]`, `[Outro: hard cut, abrupt end]`, `[Drop: massive bass, EDM energy]`, `[Build: rising tension, no vocals]`, `[Breakdown: minimal, single element]`, `[Solo: expressive, no backing]`, `[Pre-Chorus: building energy, layered vocals]` …
- **Lyrics (mit Struktur-Tags)**

Rechte Spalte: **PRO-TIPP: Metatags in Lyrics**-Infobox mit Beispiel (`[Verse: Whispered Vocals, Minimal Bass]` etc.) + Hinweis "Klammern (oo) werden zu Ad-Libs, Interpunktion steuert Mikro-Pausen".

### 2.4 KI-Integration (gefunden)
- **Model-Dropdown** oben in Style-Prompt-Card: `1B, 3B, 7B, 12B, Nemo, 14B, Song, Lyric`. Das sind Ollama-Modellgrößen (14 = default).
- **KI-generiertes Arrangement** (`AUFBAU & ARR… generiert…`) — erzeugt fertige `[Intro: 0:00-0:15, …]`-Timelines inkl. Lyrics-Platzhalter.
- **4 Varianten-Generator** — Safe/Experimental/Minimal/Intense, je mit eigenem Prompt-Text.
- **"Passend zu"-Smart-Suggestions** — datengetriebene Vorschläge je Genre (Stimmung/Tempo/Drums/Bass/Stimme).
- Kein sichtbares API-Key-Feld → vermutlich lokal (Ollama) ohne Extra-Config, oder via Settings (nicht in Screenshots).

### 2.5 Output & Export
- **Kopieren**-Button pro Textarea.
- **Export**-Button oben rechts (vermutlich JSON/TXT Export).
- **In Suno öffnen**-Button (direkter Launch).
- **VERLAUF** (10 gespeicherte Einträge sichtbar) — Historie.
- **PRESETS** — eigene Konfigurationen speichern.

### 2.6 Weitere UI-Muster
- **Fehler vermeiden**-Infobox (rot, Top-Bar pro Schritt): "Sätze statt Tags · widersprüchliche Tags · Künstlernamen · 3+ Genres mischen".
- **Optimale Reihenfolge**-Infobox (collapsible): Genre → Mood → Instrumente → Vocals → Production, mit Kurzerklärung je Feld.
- Je Sektion: Checkmark-Count-Badge (`1✓`, `2 Auswahlen`), Clear-Button.
- **Suchfelder** in jeder Liste ("Suchen…").
- **Sort**- und **Farb**-Toggle-Buttons im Custom-Style-Prompt (vermutlich Reihenfolge/Farbmarkierung der Tags).
- **Manuell bearbeitet**-Badge + `Reset` wenn User im Textfeld editiert.
- **-A / -B**-Toggle (zwei Varianten-Vergleich im Custom-Output?).

---

## 3. Gap-Analyse

| Feature | In V1 | In V2-MVP | Status |
|---------|-------|-----------|--------|
| Drei-Modus-Architektur (Simple/Custom/Studio) | ✓ | ~ (Quickstart/Workflow/Templates) | Unterschiedlich strukturiert |
| Quickstart / Simple-Einstieg | ✓ (Simple-Wizard, 11 Steps) | ✓ (Quickstart-Tab) | V2 kompakter |
| Detail-Workflow | ✓ (Custom, 23 Steps) | ✓ (Workflow-Wizard Genre/BPM/Mood/Vocals/Instrumente) | V2 deutlich schlanker |
| Suno-Studio-Tag-Baukasten | ✓ (eigener Modus, parametrisierte Pro-Tags) | ✗ (nur Platzhalter "Struktur-Builder") | **Lücke** |
| Templates / Prompt-Vorlagen | ✓ (6 Blueprints in Prompt-Blueprint-Step) | ✓ (10 kommentierte Templates) | V2 besser kuratiert |
| Live-Preview rechts | ✓ (Style Prompt Card) | ✓ | Gleich |
| Charakter-Counter (500/1000/5000) | ✓ | ✓ (Validator) | Gleich |
| Validator-Regeln | ✓ ("Fehler vermeiden" + "zu wenig Tags") | ✓ (6 Regeln) | Gleich |
| Validator als Banner/Hint | ✓ (rot, prominent) | ✓ | Gleich |
| Kontextsensitive "Passend zu…"-Vorschläge | ✓ (Smart Suggestions pro Genre) | ✗ | **Lücke** |
| 4-Varianten-KI-Generator | ✓ (Safe/Experimental/Minimal/Intense) | ✗ | **Lücke** |
| KI-Arrangement-Generator (mit Timestamps + Lyrics-Placeholder) | ✓ | ✗ | **Lücke** |
| Ollama-Model-Auswahl inline | ✓ (Dropdown in Style-Card) | ✗ (nur Settings-Platzhalter) | **Lücke** |
| Presets speichern/laden | ✓ | ✗ | **Lücke** |
| Verlauf/Historie | ✓ (10 Einträge Badge) | ✗ (Platzhalter) | **Lücke** |
| Export (TXT/JSON) | ✓ | ✗ | **Lücke** |
| "In Suno öffnen"-Direct-Launch | ✓ | ✗ | Lücke (KANN) |
| Exclude-Styles / Negativ-Prompt | ✓ (zweifach: Simple + Custom) | ? | **prüfen** |
| Genre-Breite | sehr breit (Reggae, Latin, Afrobeats, Schlager, Fun & Novelty, World, Experimental …) | 30 Genres | wohl ähnlich |
| Mood-Tags | ~7 Gruppen (geschätzt) | 7 Mood-Gruppen | Gleich |
| Vocal-Layer | 5 Sektionen (Stimmtyp, Vortrag, FX, Sprache, Arrangement, Backing) | 3-Layer-Vocals | V1 detaillierter |
| Instrumenten-Matrix | 8 Instrumenten-Bereiche im Custom | kompakter | V1 weit detaillierter |
| Songform/Struktur (VCVCBC, AABA, Suite, Sonatenform…) | ✓ | ✗ (nur Platzhalter) | **Lücke** |
| Mix/Master-EQ-Profile | ✓ (Full-Range, U-Form, Sub-Bass…) | ✗ | Lücke (SOLLTE) |
| Dynamik-Effekte (Crescendo, Sforzando…) | ✓ | ✗ | Lücke (KANN) |
| Parametrisierte Suno-Tags (`[Drop: massive bass, EDM energy]`) | ✓ (Pro) | ✗ | **Lücke** |
| PRO-TIPP "Metatags in Lyrics" | ✓ (Infobox) | ✗ | Lücke (SOLLTE) |
| Handbuch / Impressum-Links | ✓ | ✗ | KAN |
| Dunkles Theme | ✓ (Bernstein) | ✓ (Violett) | Branding-Entscheidung |
| Deutsch-UI | ✓ | ✓ | Gleich |

---

## 4. Übernahme-Empfehlungen

### MUSS — essentiell für MVP-Parität
1. **Studio-Modus / Suno-Tag-Baukasten.** Der Studio-Tab in V1 ist der eigentliche Power-User-Output. Ohne ihn ist V2 strukturell schwächer als V1. Parametrisierte Tags (`[Drop: massive bass, EDM energy]`) sind der größte Mehrwert. → Struktur-Builder-Platzhalter in V2 zu vollwertigem Tag-Baukasten ausbauen, inkl. Lyrics-Integration mit Struktur-Tags.
2. **Presets speichern/laden.** V1 hat prominentes PRESETS-Dropdown oben rechts. Wer den Workflow mehrmals nutzt, braucht das. Lokal als JSON reicht.
3. **Verlauf/Historie.** V1 zählt 10 Einträge. Nutzer experimentieren, wollen zurückspringen. Lokaler Store (IndexedDB/localStorage) mit Timestamp+Titel.
4. **Export-Button.** Copy reicht nicht, Nutzer wollen .txt/.json speichern. Minimum: Klartext-Export mit Metadaten-Header.
5. **Ollama-Model-Dropdown inline in der Preview-Card.** V1 zeigt das prominent (`KI | 14`). V2 hat "Ollama-Config" nur als Settings-Platzhalter — der Umschaltweg ist zu weit.

### SOLLTE — klare UX-Gewinne
6. **"Passend zu: [Subgenre]"-Smart-Suggestions.** Das ist V1's cleverstes UX-Feature: nach Genre-Wahl erscheint grüne Karte mit Stimmung/Tempo/Drums/Bass/Stimme-Vorschlägen + `Alle übernehmen`. Extrem workflow-beschleunigend. Lässt sich aus der bestehenden Knowledge-Base (30 Genres × Mappings) ableiten.
7. **4-Varianten-Generator (Safe/Experimental/Minimal/Intense).** Killer-Feature für Suno-Remix-Flow: statt einem Prompt vier Varianten in einem Rutsch. Braucht nur 4 Ollama-Calls mit Temperatur/Prompt-Variation.
8. **KI-Arrangement-Generator** mit Timestamps + Lyrics-Platzhaltern im Suno-Format. Hoch wertvoll, braucht Lyrics-Editor-Kopplung.
9. **Songform-Auswahl** (Verse-Chorus-Verse…, AABA, Strophisch, Through-composed, Loop-basiert, Suite, Sonatenform). Sollte in Struktur-Builder mitlaufen.
10. **PRO-TIPP "Metatags in Lyrics"-Infobox.** Kostet nichts, erzieht den Nutzer.
11. **Dreistufige Modusarchitektur beibehalten.** V2's aktuelle Tab-Struktur (Quickstart/Workflow/Templates/Struktur/Lyrics/Historie/Settings) ist flacher — V1's Simple→Custom→Studio-Progression ist mental klarer. Überlegen, ob V2 analog strukturiert wird.

### KAN — Phase 3+
12. Detaillierte Instrumenten-Matrix (8 Custom-Bereiche: Drum, Percussion-Layer, Bass, Gitarren, Bläser/Streicher, Tasten/Synths, Earcandy, Harmonie) — nur für Profi-Nutzer relevant.
13. Mix/Master-EQ-Profile und Dynamik-Effekte.
14. "In Suno öffnen"-Button (Direct-Launch per URL-Scheme oder Clipboard + Browser-Open).
15. "Manuell bearbeitet"-Badge + Reset wenn User im Freitext editiert.
16. Sort/Farb-Toggles für Tag-Liste.
17. Dedizierte Vocal-Subsektionen (Stimmtyp + Vortrag + FX + Sprache + Arrangement + Backing) — V2's 3-Layer-Modell ist bewusst kompakter.
18. -A / -B-Varianten-Vergleich.

### NEIN — V2 lässt bewusst weg
- **11- bzw. 23-Schritte-Linearwizards:** V1's Simple zählt `1/11`, Custom `1/23`. Das ist zu viel. V2's konsolidierter Workflow-Wizard (ein Formular mit Akkordeons) ist besser. Stattdessen: die Informationsdichte erhöhen, nicht die Schritt-Anzahl.
- **Footer-Navigation `← Zurück / Weiter →`:** Tab-basierte Navigation ist moderner und erlaubt free jumping.
- **Bernstein-Gold-Theme:** V2's Violett ist Branding-Entscheidung, nicht tauschen.
- **Sonatenform klassisch** und andere sehr exotische Songformen — selten verwendet, nur im Custom-Deep.
- **Sitar/Oud/Kora/Balalaika/Charango/Theremin/Ondes Martenot** als eigene Checkbox-Liste — das gehört eher in Freitext-Tag-Suche (Suchfeld), nicht in die UI-Hauptliste.
- **Unclear / Harsh Vocals, Death Growl, Yodel, Throat Singing** etc. — Edge-Case-Genres, besser als Freitext-Tag lösbar.

---

## 5. Konkrete Handlungsvorschläge für nächste V2-Iteration

**Sprint 1 (Kernlücken schließen):**
- Studio-Tag-Baukasten (ersetzt Struktur-Builder-Platzhalter) mit Struktur-Tags + parametrisierten Tags + Lyrics-Einbettung.
- Presets (localStorage) + Verlauf (IndexedDB, 20–30 Einträge).
- Export-Button (.txt, .json).
- Ollama-Model-Dropdown inline in Live-Preview.

**Sprint 2 (Wow-Features):**
- "Passend zu"-Smart-Suggestions pro Genre (Mapping-Tabelle in knowledge-base erweitern).
- 4-Varianten-Generator (Safe/Experimental/Minimal/Intense).
- Songform-Auswahl integriert.

**Sprint 3 (Politur):**
- KI-Arrangement-Generator.
- PRO-TIPP-Boxen.
- Sort/Farb-Toggles.

---

## Anmerkungen zu Screenshot-Qualität
- Viele Screenshots zeigen das Snipping-Tool-Overlay unten rechts — Martins eigene Screenshot-Abfolge, nicht App-Teil.
- Sidebar-Text "Zur\u00fcCk" in vielen Screenshots → Codepage-Darstellungs-Artefakt der Taskbar-Preview, im App-Main-View ist "Zurück" korrekt.
- Emotionen & Einsatz, Song-Thema & Einsatz, Earcandy & Kontrast, Harmonie & Tonalität, Mix & Master-Detail-Sektionen — nur Sidebar-Label gesichtet, Detailinhalt nicht explizit gesampelt. Falls wichtig: Nachladerunde empfohlen.
