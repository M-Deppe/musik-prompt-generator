# Competitor Analysis: Suno Prompt Generatoren

**Erstellt:** 2026-04-14  
**Projekt:** Suno Prompt Generator V2 (Windows-native, lokale LLM-Anbindung)  
**Scope:** Web-Tools, GitHub-Repos, kommerzielle Tools

---

## 1. Analysierte Tools (Primär-Recherche)

### 1.1 MeinHomeStudio Suno Prompt Generator
**URL:** https://www.meinhomestudio.de/suno-prompt-generator-ki-assistent/  
**Plattform:** Web  
**Sprache:** Deutsch

**Features:**
- Zwei Felder: "Styles" und "Exclude Styles" (je max. 1000 Zeichen)
- Zufallsgenerator-Button ("Zufälliger Stil") fuer Inspirationsquelle
- Beschreibt intern Parameter: Genre, Stimmung, Instrumentierung, Arrangement, Produktion, Dynamik
- Video-Walkthrough (Vimeo) eingebettet

**LLM-Integration:** Nicht erkennbar. Kein LLM im Frontend sichtbar.

**Monetarisierung:** Pro-Membership-Paywall fuer vollstaendige Kontrolle. Gratis nur Zufallsfunktion.

**UX-Besonderheiten:** Minimalistische Oberflaeche, kein Formular im eigentlichen Sinne — nur Freitext-Inputs.

**Schwaechen:**
- Keine strukturierten Eingabefelder (kein Dropdown fuer Genre, kein BPM-Slider)
- Kein Echtzeit-Preview
- Keine LLM-Ausformulierung des Prompts
- Transparenz ueber Pro-Features fehlt komplett
- Keine Negative-Prompt-Logik sichtbar
- Keine Prompt-Historie

---

### 1.2 Peak-Studios Suno Prompt Generator
**URL:** https://www.peak-studios.de/en/suno-prompt-generator/  
**Plattform:** Web  
**Sprache:** Englisch (deutsche Firma)

**Features (umfangreichstes Web-Formular der analysierten Tools):**

*Song Basis:*
- Genre-Dropdown: Pop, Rock, Hip Hop, R&B/Soul, Electronic, Dance, Jazz, Classical, Country/Folk, Ambient, Soundtrack
- Topic/Theme (Freitext, 3-8 Woerter)
- Tuning/Mood-Selektor
- Energy Level
- Tempo (numerisch oder konzeptionell)
- Fine Adjustment (Freitext)
- Titel-Feld

*Instruments & Sound:*
- Instrument-Auswahl (0-3 Items): Piano, Acoustic Guitar, Electric Guitar, Synth, Strings, E-Drums
- Sound-Tags (0-5): Clean, Rough, Spacious, Minimal Reverb, Warm, Cinematic
- Song-Structure-Presets: Pop Classical/Modern, EDM, Rock, Rap/Trap, Short
- Editierbares Structure-Feld

*Voice & Text:*
- Instrumental-Toggle (deaktiviert Lyrics-Bereich)
- Auto-Lyrics-Aktivierung mit Thema-Feld
- Voice Type: Vocal, Rap, Speech Song, Choir, Background Vocals, Duet
- Voice Gender
- Voice Feel: Soft, Airy, Strong, Rough, Whispering, Autotuned
- Text-Sprache
- Lyrics-Textarea (5000 Zeichen)

**Zwei Modi:**
- "Hobby (HA)": vereinfacht fuer Einsteiger
- "Ambitious (AA)": granulare Kontrolle

**LLM-Integration:** Keine. Alles laeuft lokal im Browser (laut Eigenaussage).

**Monetarisierung:** Kostenlos. Monetarisierung ueber nachgelagerte Mastering-Dienstleistungen.

**UX-Besonderheiten:**
- "Less is more"-Philosophie, iterativer Aufbau
- Copy-to-Clipboard je Output-Sektion
- Echtzeit-Zeichenzaehler
- Separate "Custom Output" und "Simple Output" Modi
- Reset-Button

**Schwaechen:**
- Keine LLM-Ausformulierung — reines Formular-zu-Tag-Mapping
- Keine Prompt-Historie oder Favoriten
- Kein Negative-Prompt-Bereich (kein dediziertes "Exclude"-Feld)
- Keine Erklaerung warum Kombinationen gut/schlecht funktionieren
- Keine Suno-API-Integration — manuelles Copy-Paste
- Instrument-Auswahl sehr begrenzt (6 Optionen)

---

### 1.3 SunoPrompt.com
**URL:** https://sunoprompt.com/  
**Plattform:** Web  
**Sprache:** Englisch

**Features:**

*Song Style Generator:*
- Freitext (max. 500 Zeichen)
- Selektive Optionen: Theme, Melody, Harmony, Rhythm, Structure/Form, Instrumentation, Style/Genre, Mood, Dynamics, Production, Creativity, Vocal Style

*Lyrics Generator (separat):*
- Freitext-Visionsbeschreibung (max. 500 Zeichen)
- Optionen: Theme, Lyrics Language, Vocal Arrangement, Lyrics Style, Mood, Style/Genre

*Genre-Abdeckung:*
Pop, Hip-Hop, R&B, Rock, Electronic/EDM, Jazz, Classical, Country, Latin, Folk, Metal, Punk, Reggae, Dance, Ambient, African, Asian, Religious/Gospel, Children's, Experimental, Gaming, Gym/Workout, Retro, Soundtrack, Study, Underground/Indie, Viral — ca. 30+ Genres

**Template-Bibliothek:** 50+ vorgefertigte Prompts (Lofi, Workout, Sleep, etc.)

**LLM-Integration:** Ja — KI generiert strukturierte Prompts aus der Nutzerbeschreibung. Welches Modell unklar.

**Monetarisierung:**
- Freemium
- Premium: "Emotional Engineering"-Feature (Breathing, Articulation, Emotional Expression)
- "Prompt-to-Profit"-Programm mit exklusiven Workflows

**UX-Besonderheiten:**
- Zwei separate Generatoren (Style + Lyrics)
- Mehrere Prompt-Variationen fuer A/B-Testing
- "Cut your Suno prompt and lyrics generation time from hours to minutes"

**Schwaechen:**
- Trennung von Style und Lyrics ist umstaendlich — kein einheitlicher Workflow
- Premium-Features unklar dokumentiert
- Kein BPM-Eingabefeld erkennbar
- Keine Bracket-Notation / Struktur-Builder fuer Song-Sections
- Keine lokale Datenspeicherung oder Offline-Faehigkeit

---

## 2. Weitere Recherchierte Tools

### 2.1 HowToPromptSuno.com
**URL:** https://howtopromptsuno.com/  
**Plattform:** Web  
**Sprache:** Englisch

**Features:**
- Prompt-Typ-Selektor: Famous Artist, Custom, Simple
- Quick-Select-Buttons fuer Kuenstler (Taylor Swift, Drake, The Weeknd, etc.)
- Parameter: Tempo, Vocal Approach/Texture, Arrangement/Dynamics, Instrumentierung, Energy
- Output-Variationen: Safe, Experimental, Darker, Brighter, Minimal, Intense
- Optionaler Lyric-Output: Full Song, Hook-Only, Short

**LLM-Integration:** Impliziert ("Instant Co-Writer"). Kein Modell genannt.

**Monetarisierung:**
- Freemium mit Login-Pflicht
- Premium-Guide: $27 (von $99 rabattiert)
- 100 Custom Prompt Generations + 500+ Beispiel-Prompts

**Schwaechen:**
- Kuenstler-Referenz-Ansatz ungeeignet fuer Nutzer die keinen Referenz-Kuenstler wollen
- Kein BPM-Feld
- "Endless trial and error" laut Eigendiagnose

---

### 2.2 AIFreeForever Suno Prompt Generator
**URL:** https://aifreeforever.com/tools/suno-prompt-generator  
**Plattform:** Web  
**Sprache:** Englisch

**Features:**
- Topic/Idea: Freitext
- Genre: 12+ Optionen (Pop, Hip-Hop, Indie, EDM, R&B, Rock, Country, Acoustic, Jazz, Funk, Experimental, Custom)
- Mood: Sad, Uplifting, Chill, Angry, Romantic, Dark, Energetic, Melancholy, Mysterious, Custom
- Vocal Style: Male, Female, Duet, Instrumental, AI Decide
- Advanced Options: Song Structure, Language, Production Tags

**LLM-Integration:** Ja — generiert "rich, descriptive prompts" per KI. Kein Modell genannt.

**Monetarisierung:** Angeblich vollstaendig kostenlos, kein Account noetig.

**Schwaechen:**
- Kein BPM/Tempo-Control
- Generische "Additional Tags" statt strukturierter Produktions-Parameter
- Keine Prompt-Historie
- Keine Version-Vergleich-Funktion

---

### 2.3 JustBuildThings AI Music Prompt Generator
**URL:** https://justbuildthings.com/ai-audio-analysis/ai-music-prompt-generator  
**Plattform:** Web  
**Sprache:** Englisch

**Besonderheit: Audio-zu-Prompt-Ansatz**

**Features:**
- Audio-Upload oder Mikrofon-Aufnahme
- AI Model Selection
- Notizen-Feld fuer Plattform-Angabe (Suno, Udio)
- Analysiert: Genre, Sub-Genres, Instrumentierung, Tempo/BPM, Rhythmische Muster, Melodie, Akkordprogressionen, Produktionsstil, Mood
- Generiert mehrere Prompt-Variationen fuer verschiedene AI-Tools

**LLM-Integration:** Ja — KI analysiert Audiodatei und erzeugt Prompts. Plattform-spezifische Formatierung.

**Monetarisierung:** Pricing-Seite vorhanden, Details unklar.

**Schwaechen:**
- Keine Preistransparenz
- Abhaengig von Upload-Audio-Qualitaet
- Keine strukturierte Eingabe ohne Referenz-Audio

---

### 2.4 Pseuno-AI (GitHub Open Source)
**URL:** https://github.com/ericdjm/pseuno-ai  
**Plattform:** Web (Self-Hosted)  
**Stack:** Python 3.11+, FastAPI, React 18, TypeScript, Vite, Chakra UI, PostgreSQL/SQLite, Docker

**Features:**
- Natuerlichsprachliche Beschreibung als Input
- Spotify-Integration: Personalisierung basierend auf Hoerverlauf
- Lyrik-Kontrollen: Publikum, Direktheit, Humor, Explizitheit, Persona, Reimschema
- Prompt-Bibliothek mit Auto-Speicherung, Favoriten, Tags, teilbare Links
- Instrumental-Modus
- Parallele Generierung Style + Lyrics (laut README ca. 2x schneller)

**LLM-Integration:** Ja — Google Gemini und OpenAI APIs (austauschbar).

**Monetarisierung:** Open Source, kostenlos bei Self-Hosting.

**Schwaechen:**
- Setup-Aufwand (Docker, API-Keys)
- Kein Windows-Installer
- Abhaengig von externen Cloud-APIs (kein Offline-Betrieb)
- Kein dediziertes BPM-Feld oder Bracket-Notation-Builder

---

### 2.5 SunoReferenceArchitect (GitHub)
**URL:** https://github.com/primevxie/SunoReferenceArchitect  
**Plattform:** Web (Streamlit, Self-Hosted)  
**Stack:** Python 3.9+, Streamlit, Google Generative AI API

**Features:**
- Audio-Upload (MP3/WAV)
- KI analysiert: Mix, Vocal Chain, Instrumentierung, BPM, Key, Vokaltextur
- Generiert Suno-Tags: z.B. `[Dark Synthwave, Ethereal Vocals, 140 BPM]`
- Artikulations-Score (1-10): Vokalklarheit-Bewertung
- Syllable Density Check: passt Text zum Beat-Tempo

**LLM-Integration:** Google Gemini 2.5 Flash (multimodal, direkte Audio-Verarbeitung ohne Transkription).

**Monetarisierung:** Open Source.

**Schwaechen:**
- Nur Audio-Reverse-Engineering, kein klassischer Formular-Generator
- Streamlit-UI eingeschraenkt
- Google-API-Abhaengigkeit (kein lokales Modell)
- Kein Windows-Installer

---

### 2.6 MusicGPT (Desktop)
**URL:** https://github.com/gabotechs/MusicGPT  
**Plattform:** Windows / macOS / Linux / Docker  
**Stack:** Lokale ML-Modelle (MusicGen by Meta), kein Python-Requirement

**Features:**
- Vollstaendig lokal, kein Cloud-API noetig
- Textbasierter Prompt -> Audioausgabe direkt (kein Suno-Zwischenschritt)
- Drei Modellgroessen: small, medium, large
- Web-UI (Chat-Verlauf) oder CLI
- GPU-Beschleunigung (CUDA)
- Max. 30 Sekunden Audio pro Generation

**LLM-Integration:** Meta MusicGen (kein LLM im eigentlichen Sinne — Musik-Generierungsmodell).

**Monetarisierung:** Open Source, kostenlos.

**Wichtiger Unterschied:** Generiert Audio direkt, ist kein Prompt-Assistent fuer Suno.

---

## 3. Feature-Matrix

| Tool | Plattform | Genre-Dropdown | BPM/Tempo | Mood | Vocals | Struktur-Builder | Negative Prompts | LLM-Ausformulierung | Lyrics-Editor | Templates | Prompt-Historie | Offline/Lokal | Kostenlos |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| MeinHomeStudio | Web | nein | nein | nein | nein | nein | ja (Exclude-Feld) | nein | nein | nein | nein | nein | Teilweise |
| Peak-Studios | Web | ja (11) | ja | ja | ja | ja (Presets) | nein | nein | ja (5000 Z.) | 5 Presets | nein | ja (Browser) | ja |
| SunoPrompt.com | Web | ja (30+) | nein | ja | ja | nein | nein | ja (unkl. Modell) | ja | 50+ | nein | nein | Freemium |
| HowToPromptSuno | Web | implizit | nein | implizit | nein | nein | nein | ja (implizit) | ja (Varianten) | nein | nein | nein | Freemium |
| AIFreeForever | Web | ja (12) | nein | ja (10) | ja | teilweise | nein | ja (unkl. Modell) | nein | nein | nein | nein | ja |
| JustBuildThings | Web | nein | via Audio | nein | nein | nein | nein | ja (Audio->Prompt) | nein | nein | nein | nein | Unklar |
| Pseuno-AI | Web (Self-Host) | nein | nein | nein | nein | nein | nein | ja (Gemini/OpenAI) | ja | nein | ja | nein | ja (OSS) |
| SunoReferenceArchitect | Web (Self-Host) | via Audio | ja (via Audio) | via Audio | via Audio | nein | nein | ja (Gemini 2.5) | nein | nein | nein | nein | ja (OSS) |
| MusicGPT | Desktop | nein | nein | nein | nein | nein | nein | nein (kein Assistent) | nein | nein | nein | ja | ja (OSS) |

---

## 4. Gemeinsame Luecken / Differenzierungschancen fuer V2

### 4.1 Niemand bietet: Vollstaendige lokale LLM-Ausformulierung ohne Cloud

Alle Tools mit LLM-Integration sind Cloud-abhaengig (Gemini, OpenAI). Kein einziges analysiertes Tool laeuft vollstaendig offline mit lokalem Sprachmodell. MusicGPT laeuft lokal, ist aber kein Prompt-Assistent.

**V2-Chance:** Ollama-Integration (RTX 3060) als einziges vollstaendig offline-faehiges Tool mit echter LLM-Ausformulierung.

### 4.2 Niemand bietet: Bracket-Notation / Metatag-Builder

Kein Tool bietet einen visuellen Builder fuer Suno-Metatags (`[Verse]`, `[Chorus]`, `[Instrumental]`, `[Whispered]`, etc.) als eigenstaendigem Arbeitsbereich. Peak-Studios hat Struktur-Presets, aber keine editierbare Bracket-Ansicht mit Live-Vorschau des assemblierten Prompts.

**V2-Chance:** Drag-and-Drop-Struktur-Editor mit Sektions-Typen und Vocal-Delivery-Cues als eigenstaendiger Tab.

### 4.3 Niemand bietet: Integriertes Negative-Prompt-System mit Erklaerungen

Nur MeinHomeStudio hat ein "Exclude Styles"-Feld. Kein Tool erklaert, welche Negative-Prompt-Kombinationen sinnvoll sind oder zeigt Konflikte (z.B. "no drums" + "energetic" = widerspruechilich).

**V2-Chance:** Negative-Prompt-Bereich mit Kategorien (Instrumente, Effekte, Vokalstil, Genre-Elemente) + Konflikt-Warnung durch LLM.

### 4.4 Niemand bietet: 5-Part-Formel als strukturierter Workflow

Kein Tool fuehrt den Nutzer durch eine musiktheoretisch fundierte Prompt-Architektur. Alle Tools sind entweder reine Formulare (kein Erklaer-Kontext) oder reine LLM-Freitexteingaben.

**V2-Chance:** Die eigene 5-Part-Formel (Genre-Core, Mood-Layer, Instrument-Stack, Production-Tags, Vocal-Definition) als geleiteter, nummerierter Workflow mit Erklaerungstext je Schritt — unique selling point gegenueber allen analysierten Tools.

### 4.5 Niemand bietet: BPM-Range-Empfehlung per Genre

Alle Tools die BPM erwaehnen (Peak-Studios) akzeptieren lediglich freie Eingabe. Kein Tool zeigt automatisch an, welche BPM-Range typisch fuer das gewaehlte Genre ist.

**V2-Chance:** Genre-Auswahl triggert automatisch BPM-Suggest-Range (z.B. Techno: 130-145 BPM) aus der eigenen Knowledge-Base.

### 4.6 Niemand bietet: Prompt-Versionierung und Vergleich

Kein analysiertes Tool (ausser Pseuno-AI teilweise) speichert Prompt-Historien lokal, erlaubt Varianten-Vergleich oder zeigt Diff zwischen zwei Prompt-Versionen.

**V2-Chance:** Lokale SQLite-Datenbank mit Prompt-Verlauf, Tags, Bewertung (1-5 Sterne nach Suno-Test), Diff-Ansicht.

### 4.7 Niemand bietet: Genre-Template-Bibliothek aus validierten Prompts

SunoPrompt.com hat 50+ Templates, aber ohne erklaerte Prompt-Logik dahinter. Kein Tool liefert kommentierte Templates die zeigen, warum ein bestimmtes Tag-Set fuer ein Genre funktioniert.

**V2-Chance:** Die eigenen 10 Genre-Templates aus dem "Suno AI Prompt Mastery Guide" als kommentierte, editierbare Starter-Templates einbauen.

### 4.8 Niemand bietet: Windows-native Desktop-App mit echtem Installer

Alle Tools ausser MusicGPT (das aber kein Prompt-Assistent ist) sind reine Web-Apps. Keine portable .exe oder Windows-Installer mit nativer UI existiert fuer Suno-Prompt-Generierung.

**V2-Chance:** V2 besetzt als einziges Tool die Windows-Desktop-Nische mit Offline-Faehigkeit.

---

## 5. Offene Punkte / Unsicherheiten

- **SunoPrompt.com LLM-Modell:** welches Modell dahinter steckt, ist nicht dokumentiert. Premium-Features (Emotional Engineering) koennen ab-/zugeschaltet sein.
- **HowToPromptSuno.com LLM-Integration:** als "impliziert" eingestuft — keine Bestaetigung aus Quellcode oder Dokumentation.
- **Producer.ai:** URL nicht erreichbar (403 beim Fetch). Laut WebSearch ein "generative AI instrument" fuer Remixing und Studio-Output. Nicht tiefer analysierbar.
- **Suno v4.5 "Prompt Enhancement Helper":** Suno selbst hat ein internes Prompt-Verbesserungs-Feature (laut Suno Hub, Mai 2025). Kein externer Tool-Anbieter hat das bisher repliziert oder integriert.
- **Preismodell JustBuildThings:** Pricing-Seite existiert, Details nicht oeffentlich — koennte Mid-Tier-Konkurrent sein.

---

## 6. Quellen

- https://www.meinhomestudio.de/suno-prompt-generator-ki-assistent/ (2026-04-14)
- https://www.peak-studios.de/en/suno-prompt-generator/ (2026-04-14)
- https://sunoprompt.com/ (2026-04-14)
- https://howtopromptsuno.com/ (2026-04-14)
- https://aifreeforever.com/tools/suno-prompt-generator (2026-04-14)
- https://justbuildthings.com/ai-audio-analysis/ai-music-prompt-generator (2026-04-14)
- https://github.com/ericdjm/pseuno-ai (2026-04-14)
- https://github.com/primevxie/SunoReferenceArchitect (2026-04-14)
- https://github.com/gabotechs/MusicGPT (2026-04-14)
- https://jackrighteous.com/en-us/blogs/guides-using-suno-ai-music-creation/negative-prompting-suno-v5-guide (Recherche-Kontext)
- https://sunoaiwiki.com/tips/2024-05-04-how-to-structure-prompts-for-suno-ai/ (Recherche-Kontext)
