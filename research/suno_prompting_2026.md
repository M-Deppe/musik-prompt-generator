# Suno Prompting Research — April 2026

Grundlage fuer die drei System-Prompts (Style, Arrangement, Lyrics) in:
- `src/lib/systemPrompts.ts` — SYSTEM_PROMPT_BUILDER + SYSTEM_PROMPT_FROM_IDEA
- `src/lib/llm.ts` — SYSTEM_PROMPT_ARRANGEMENT
- `src/content/sections/Lyrics.tsx` — Songtext-System-Prompt in `LyricsKi`

## Version-Stand

Suno V5.5 (Release Maerz 2026). Prompt-Syntax identisch zu V5. V5.5 bringt nur Stimmen-Klonen und Personalisierung, keine neuen Tag-Regeln.

## Executive Findings

- **Style-Prompt:** Komma-Tags sind robuster als Prosa — aber Prosa funktioniert seit V4.5 ebenfalls. Da der User Prosa will, haelt der System-Prompt die Suno-Regeln (Reihenfolge, Specifitaet, BPM, Production-Descriptoren) inhaltlich ein.
- **Arrangement:** Section-Tags gehoeren in die Lyrics-Box, nicht in die Style-Box. Jeder Tag auf eigener Zeile.
- **Lyrics:** Silbenzahl zwischen Verse (8-10) und Chorus (10-12) MUSS unterschiedlich sein. ABAB fuer Verse + AABB fuer Chorus schlaegt Suno-Default AABB fuer alles.

## Style-Prompt — Kernregeln

1. Reihenfolge: Genre+Subgenre → Mood → Vocal → Instrumente → Production/BPM. Die ersten 2-3 Tags traegt 60-70% des Outputs.
2. Sweet Spot: 6-7 Tags bzw. 2-4 Saetze. Max 1000 Zeichen (wird sonst abgeschnitten).
3. Subgenre zwingend spezifisch ("indie shoegaze", nicht "rock").
4. Instrumente spezifisch ("Moog bass synth", nicht "synth").
5. Production-Descriptoren aktiv nutzen (massiv underused): "warm analog", "polished radio-ready mix", "bedroom lo-fi", "stadium reverb", "dry close-miked", "punchy compression".
6. BPM als Zahl einbauen.
7. Max 2 Primaer-Genres, dominantes zuerst.
8. Negationen max 2, "no X"-Format, am Ende.

**Verboten:** Kuenstlernamen, "create/make/generate/please", vage Genres, widerspruechliche Moods.

## Arrangement — Kernregeln

**Tags in Lyrics-Box:**
- Basis: `[Intro]`, `[Verse 1]`, `[Verse 2]`, `[Pre-Chorus]`, `[Chorus]`, `[Post-Chorus]`, `[Bridge]`, `[Outro]`
- Erweitert: `[Hook]`, `[Interlude]`, `[Instrumental]`, `[Break]`, `[Breakdown]`, `[Solo]`, `[Refrain]`, `[Drop]`, `[Build]`, `[Fade Out]`
- Qualifier: `[Sad Verse]`, `[Happy Chorus]`, `[Rapped Verse]` — genre-spezifisch

**Standard-Struktur (3-4 Min):**
```
[Intro] → [Verse 1] → [Pre-Chorus] → [Chorus] →
[Verse 2] → [Pre-Chorus] → [Chorus] →
[Bridge] → [Break] → [Chorus] → [Outro]
```

**Dynamik-Qualifier in Klammern direkt hinter Tag:**
`(quiet)`, `(half-time)`, `(double-time)`, `(key change)`, `(stripped back)`, `(full)`, `(building)`, `(fade out)`

**Energiebogen zwingend:** Intro niedrig → Verse aufbauend → Chorus Peak → Bridge Valley → Final Chorus Peak → Outro abklingend.

## Lyrics — Kernregeln

**Silben pro Zeile:**
- Verse: 8-10 Silben, 4-8 Zeilen
- Chorus: 10-12 Silben, 2-6 Zeilen
- Pre-Chorus: 6-8 Silben, 2-4 Zeilen
- Verse-Silben ≠ Chorus-Silben (sonst klingen beide gleich)

**Reim-Schemata:** ABAB fuer Verse, AABB fuer Chorus. Gegen Suno-Default AABB (klingt nach Kinderlied).

**Non-lexical Hooks:** "oh-oh-oh", "la la la", "mmm" — als eigene Zeilen im Chorus.

**Inline-Cues:** `(whispered)`, `(belted)`, `(spoken)`, `(falsetto)`, `(harmonized)`, `(ad-lib)`, `(half-time feel)`.

**Mehrsprachigkeit:** `[Verse 1] (German)`, `[Chorus] (Spanish)` — Style-Prompt bleibt Englisch.

**Staerkste Zeile zuerst** in jeder Section.

**Chorus max 3x wiederholen.**

## Widersprueche / Unklarheiten

- **Prosa vs. Tags:** Offizielle Docs bestaetigen Prosa ab V4.5. Empirische Community-Analysen zeigen Tags sind konsistenter. Beides funktioniert.
- **Tag-Anzahl:** Quellen nennen 4-7 (konservativ) oder 8-15 (expansiv). Spezifitaet wichtiger als Anzahl.
- **Inline-Cues:** "hit and miss" — mehrere Generierungen noetig fuer zuverlaessiges Ergebnis.
- **Lyrics-Protection:** `(Do not change any words. Sing exactly as written)` als Direktive wird community-lore als Trick genannt, nicht offiziell bestaetigt.

## Quellen

- Suno Help: V4.5 Style Instructions — https://help.suno.com/en/articles/5782849
- Suno Help: V4.5 Prompts in Lyrics — https://help.suno.com/en/articles/5782977
- Suno Help: Exclude-Funktion — https://help.suno.com/en/articles/3161921
- Suno Blog: V5.5 — https://suno.com/blog/v5-5
- HookGenius Analysis 2026 — https://hookgenius.app/learn/suno-style-tag-research/
- HookGenius Prompt Guide 2026 — https://hookgenius.app/learn/suno-prompt-guide-2026/
- JackRighteous Meta Tags — https://jackrighteous.com/pages/suno-ai-meta-tags-guide
- JackRighteous Negative Prompting V5 — https://jackrighteous.com/en-us/blogs/guides-using-suno-ai-music-creation/negative-prompting-suno-v5-guide
- HowToPromptSuno Voice Tags — https://howtopromptsuno.com/making-music/voice-tags
- HowToPromptSuno Pre-Chorus/Bridge — https://howtopromptsuno.com/making-music/pre-chorus-bridge
- CometAPI Suno V5 Lyrics — https://www.cometapi.com/how-to-instruct-suno-v5-with-lyrics/
- MusicSmith Guide 2026 — https://musicsmith.ai/blog/ai-music-generation-prompts-best-practices
- OpenMusicPrompt Metatags — https://openmusicprompt.com/blog/suno-ai-metatags-guide
