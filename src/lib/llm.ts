import type { Dispatch } from "react";
import type { Action, AppState } from "@/store";
import { generate as ollamaGenerate, type GenerateOptions } from "./ollama";

// Wrapper: leitet automatisch den cloudFallback durch, damit bei offline
// Ollama optional Anthropic/OpenAI einspringen kann. Alle internen LLM-Aufrufe
// nutzen diesen Helper — Aufrufer muessen nur state/settings kennen.
const generate = (
  state: AppState,
  opts: Omit<GenerateOptions, "cloudFallback">,
): Promise<string> =>
  ollamaGenerate({ ...opts, cloudFallback: state.settings });
import { buildStylePrompt } from "./promptBuilder";
import { sanitizeBuilderOutput, sanitizeOutput } from "./builderSanitizer";
import { scorePrompt } from "./validator";
import { getTaskTemperature, type ArrangementLength } from "@/types";
import {
  SYSTEM_PROMPT_BUILDER,
  SYSTEM_PROMPT_BUILDER_UDIO,
  SYSTEM_PROMPT_FROM_IDEA,
  SYSTEM_PROMPT_FROM_IDEA_UDIO,
  buildUserPromptFromState,
} from "./systemPrompts";

// Target-spezifische System-Prompts. Suno nimmt Prosa, Udio nimmt Tag-Listen.
const pickBuilderPrompt = (target: AppState["settings"]["target"]): string =>
  target === "udio" ? SYSTEM_PROMPT_BUILDER_UDIO : SYSTEM_PROMPT_BUILDER;

const pickFromIdeaPrompt = (target: AppState["settings"]["target"]): string =>
  target === "udio" ? SYSTEM_PROMPT_FROM_IDEA_UDIO : SYSTEM_PROMPT_FROM_IDEA;
import { pickAutoModel, resolveLanguage } from "./autoModelRouting";

// Abgebrochene Calls sollen keinen Error-State im Store setzen.
// Fetch-Abort wirft DOMException mit name "AbortError", Node mit "ABORT_ERR".
const isAbortError = (e: unknown): boolean =>
  e instanceof Error && (e.name === "AbortError" || e.name === "ABORT_ERR");

// --- Klischee-Detection --------------------------------------------------
// Phrasen die in keinem Output auftauchen sollten. Split nach Sprache.
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
// Reihenfolge der Entscheidungen:
// 1. Explizites User-Override in den Settings (modelLyrics/modelArrangement/modelStyle)
// 2. Auto-Routing: basierend auf Task + Zielsprache + tatsaechlich verfuegbaren
//    Modellen. Gemma ist z.B. auf Deutsch schwach — wenn ein qwen2.5 installiert
//    ist, waehlen wir das automatisch fuer Lyrics in Deutsch.
// 3. Fallback: User-Default (ollamaModel).
const pickModel = (state: AppState, task: "style" | "arrangement" | "lyrics" | "title"): string => {
  const s = state.settings;
  // 1. Override
  if (task === "lyrics" && s.modelLyrics) return s.modelLyrics;
  if (task === "arrangement" && s.modelArrangement) return s.modelArrangement;
  if (task === "style" && s.modelStyle) return s.modelStyle;

  // 2. Auto-Routing — nur wenn die verfuegbare Modellliste bekannt ist
  //    (sonst erster Call vor dem Ping: dann einfach User-Default).
  if (state.availableModels && state.availableModels.length > 0) {
    const language = task === "lyrics" ? resolveLanguage(state.prompt.vocalLanguages ?? []) : null;
    const auto = pickAutoModel(task, language, state.availableModels);
    if (auto) return auto;
  }

  // 3. Fallback
  return s.ollamaModel;
};

// Hinweis: num_predict (maxTokens) wurde zunaechst als Hardcap getestet,
// aber Ollama + Gemma4 interpretieren das Limit inkl. Input-Kontext — bei
// langem System-Prompt stoppt der Call dann sofort mit done_reason "length"
// und 0 Response-Tokens. Wir verlassen uns jetzt auf die Prompt-seitige
// "under 900 characters"-Regel + Suno's 1000-Zeichen-Abschneidung.

// --- Style-Builder --------------------------------------------------------
export const runLlmBuilder = async (
  state: AppState,
  dispatch: Dispatch<Action>,
  signal?: AbortSignal,
): Promise<void> => {
  dispatch({ type: "LLM_START" });
  const sourceStylePrompt = buildStylePrompt(state.prompt);
  // Wenn ein BASE-DESCRIPTION-Seed aus "Aus Idee" vorliegt, drosseln wir die
  // Temperatur aggressiv. Der Job ist dann EDITORIAL (umschreiben, nicht
  // erfinden) und selbst kleine Ollama-Modelle halluzinieren weniger bei
  // 0.25-0.35. Bei User-Mode "wild" maximal 0.4.
  const hasSeed = Boolean(state.prompt.customStylePrompt?.trim());
  const baseTemp = getTaskTemperature(state.settings.creativityMode, "style");
  const temperature = hasSeed ? Math.min(baseTemp, 0.35) : baseTemp;
  try {
    const out = await generate(state, {
      baseUrl: state.settings.ollamaUrl,
      model: pickModel(state, "style"),
      system: pickBuilderPrompt(state.settings.target),
      prompt: buildUserPromptFromState(state.prompt),
      temperature,
      signal,
      onChunk: (chunk) => dispatch({ type: "LLM_CHUNK", chunk }),
    });
    // Sanitizer: entfernt halluzinierte BPM-Zahlen, erfundene Hersteller-/
    // Modellnamen und fuegt verlorene Franchise-Referenzen wieder ein.
    // Deterministisch, greift genre-unabhaengig.
    const trimmed = sanitizeBuilderOutput(out.trim(), state.prompt);
    dispatch({ type: "LLM_DONE", output: trimmed, sourceStylePrompt });

    // Auto-Refine: Score auf Roh-Style-Prompt pruefen. Bei niedrigem Score
    // werden die Hints als Feedback an einen einmaligen Inline-Refine-Pass
    // gegeben. WICHTIG: dieser Pass ist non-destruktiv — er nutzt nicht
    // runRefinement (das wuerde llmOutput per LLM_START zerruecksetzen),
    // sondern eigene REFINE-Actions. Bei Fehler bleibt der erste Output
    // erhalten und es gibt keinen verwirrenden Error-Banner.
    const minScore = state.settings.autoRefineMinScore;
    if (minScore > 0) {
      // Beide Scores pruefen: ROH (State-Schwaechen) und OUTPUT (LLM-Stil,
      // greift Reviewer-Filler-Penalty). Niedrigerer Score triggert.
      const rawScore = scorePrompt(state.prompt, sourceStylePrompt);
      const outputScore = scorePrompt(state.prompt, trimmed);
      const triggerScore = Math.min(rawScore.total, outputScore.total);
      if (triggerScore < minScore) {
        // Hints aus beiden zusammenfuehren, deduplizieren, max 6.
        const allHints = Array.from(new Set([...rawScore.hints, ...outputScore.hints])).slice(0, 6);
        if (allHints.length > 0) {
          const synthScore = { ...outputScore, total: triggerScore, hints: allHints };
          await autoRefineStyleOutput(state, dispatch, trimmed, sourceStylePrompt, synthScore, signal);
        }
      }
    }
  } catch (e) {
    if (isAbortError(e)) return;
    dispatch({
      type: "LLM_ERROR",
      message: e instanceof Error ? e.message : "Unbekannter Fehler",
    });
  }
};

// --- Auto-Refine (intern, non-destruktiv) ---------------------------------
// Eigener Refine-Pfad fuer den Auto-Refine-Loop. Im Gegensatz zu runRefinement
// wird llmOutput waehrend des Calls NICHT ueberschrieben — der erste Output
// bleibt im State sichtbar, bis der Refine-Pass erfolgreich ein neues Resultat
// liefert. Bei Fehler oder leerem Output wird der erste Output beibehalten.
const autoRefineStyleOutput = async (
  state: AppState,
  dispatch: Dispatch<Action>,
  previousOutput: string,
  sourceStylePrompt: string,
  score: ReturnType<typeof scorePrompt>,
  signal?: AbortSignal,
): Promise<void> => {
  dispatch({ type: "LLM_REFINE_START" });
  const feedback = `Score only ${score.total}/100. Improve based on these hints (German allowed): ${score.hints.join(" ")}`;
  const outputLabel = state.settings.target === "udio" ? "tag list" : "prose";
  const system = `${pickBuilderPrompt(state.settings.target)}\n\nYou are refining a previous output. Keep the strong parts; address the feedback. Return only the new ${outputLabel}, no explanation.`;
  const userPrompt = `PREVIOUS OUTPUT:\n${previousOutput}\n\nFEEDBACK: ${feedback}\n\nReturn only the improved ${outputLabel}.`;
  try {
    const refined = await generate(state, {
      baseUrl: state.settings.ollamaUrl,
      model: pickModel(state, "style"),
      system,
      prompt: userPrompt,
      temperature: getTaskTemperature(state.settings.creativityMode, "style"),
      signal,
      // Bewusst KEIN onChunk — sonst wuerden die Chunks via LLM_CHUNK den
      // alten Output ueberschreiben. Wir warten auf das Endergebnis.
    });
    const refinedTrimmed = sanitizeBuilderOutput(refined.trim(), state.prompt);
    if (refinedTrimmed && refinedTrimmed !== previousOutput) {
      dispatch({ type: "LLM_DONE", output: refinedTrimmed, sourceStylePrompt });
      dispatch({ type: "LLM_AUTO_REFINED" });
    } else {
      // Refined-Output leer oder identisch — ersten behalten, kein Auto-Refined-Badge.
      dispatch({ type: "LLM_REFINE_FAIL" });
    }
  } catch (e) {
    // Auto-Refine fehlgeschlagen: ersten Output bewusst behalten, kein Error-State.
    console.warn("Auto-Refine fehlgeschlagen, behalte ersten Output:", e);
    dispatch({ type: "LLM_REFINE_FAIL" });
  }
};

// --- Variants -------------------------------------------------------------
export type VariantId =
  | "safe"
  | "experimental"
  | "minimal"
  | "intense"
  | "vintage"
  | "modern"
  | "cinematic"
  | "lofi";

const VARIANT_CONFIG: Record<VariantId, { temperature: number; hint: string }> = {
  safe: { temperature: 0.35, hint: "Konservative radio-freundliche Version. Klassische Tags, sicher." },
  experimental: { temperature: 1.0, hint: "Pushe Grenzen. Ungewöhnliche Kombinationen, mutige Descriptoren." },
  minimal: { temperature: 0.5, hint: "Minimum-Prompt: nur 3-5 essentielle Descriptoren. Keine optionalen Tags." },
  intense: { temperature: 0.85, hint: "Maximum Intensität: energetisch, extrem, voll aufgedreht." },
  vintage: { temperature: 0.55, hint: "Vintage-Aesthetik: analog warmth, tape saturation, vinyl character, narrow stereo, Studio-Aera vor 1990." },
  modern: { temperature: 0.6, hint: "2025-Pop-Production: -14 LUFS streaming-optimiert, hyper-cleaned, wide stereo, transient-snap, polished." },
  cinematic: { temperature: 0.7, hint: "Filmischer Score-Charakter: orchestral underscore, ambient pads, dynamische Bögen, trailer-tauglich." },
  lofi: { temperature: 0.75, hint: "Bewusst rauhe Lo-Fi-Aesthetik: bedroom-production, cassette-warmth, Bandbreite reduziert, organische Imperfektion." },
};

export const runLlmVariants = async (
  state: AppState,
  dispatch: Dispatch<Action>,
): Promise<void> => {
  dispatch({ type: "LLM_VARIANTS_START" });
  const base = buildUserPromptFromState(state.prompt);
  // Context-Sharing: existierende Prosa als Anker mitgeben — Variants werden
  // dann gezielt zu Variationen DIESER Richtung, nicht komplett neu erfunden.
  // Bleibt der Output leer, faellt der Anker weg und Variants sind from-scratch.
  const styleAnchor = state.llmOutput?.trim()
    ? `\n\nSTYLE ANCHOR (your variant should be a sibling of this approach, NOT a complete reinvention):\n"${state.llmOutput.trim()}"`
    : "";
  const ids: VariantId[] = [
    "safe", "experimental", "minimal", "intense",
    "vintage", "modern", "cinematic", "lofi",
  ];

  await Promise.all(
    ids.map(async (id) => {
      const cfg = VARIANT_CONFIG[id];
      try {
        const out = await generate(state, {
          baseUrl: state.settings.ollamaUrl,
          model: pickModel(state, "style"),
          system: `${pickBuilderPrompt(state.settings.target)}\n\nVARIANT-HINWEIS: ${cfg.hint}`,
          prompt: base + styleAnchor,
          temperature: cfg.temperature,
        });
        dispatch({ type: "LLM_VARIANT_DONE", variant: id, output: out.trim() });
      } catch (e) {
        dispatch({
          type: "LLM_VARIANT_DONE",
          variant: id,
          output: `(Fehler: ${e instanceof Error ? e.message : "?"})`,
        });
      }
    }),
  );
  dispatch({ type: "LLM_VARIANTS_END" });
};

// --- Arrangement ----------------------------------------------------------
// Post-Processor: erzwingt visuelle Struktur — ein Bracket pro Zeile, eine
// Leerzeile zwischen je zwei Bracket-Zeilen. Bewusst als Safety-Net:
// Selbst wenn das Modell die LAYOUT-Regel im System-Prompt ignoriert, liefert
// der Client saubere Struktur. Nebeneffekt: verschluckt keine Nicht-Bracket-
// Zeilen (z.B. versehentlich eingestreuter Fliesstext wuerde erhalten bleiben,
// damit der User sehen kann "hier ist etwas das kein Bracket ist").
export const formatArrangement = (raw: string): string => {
  if (!raw.trim()) return raw;
  const lines = raw
    .split(/\n+/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  return lines.join("\n\n");
};

const ARRANGEMENT_LENGTH_HINT: Record<ArrangementLength, string> = {
  short: "3 to 5 sections for a 1.5 to 2.5 minute song (intro, verse, chorus, maybe bridge, outro).",
  standard: "5 to 8 sections for a 3 to 4 minute song (full form with verses, chorus, pre-chorus, bridge, outro).",
  epic: "8 to 12 sections for a 4 to 6+ minute song (two-part form, extended bridge, interlude, multiple chorus variations).",
};

const buildArrangementSystemPrompt = (length: ArrangementLength): string => `You build Suno AI song arrangements in English. Output is a sequence of section directives — ALL inside square brackets.

PURPOSE
The arrangement can be pasted DIRECTLY into Suno's lyrics box as the structural skeleton. Suno reads anything OUTSIDE [...] as lyrics it should sing. Therefore EVERY non-lyric token must be wrapped in brackets — no exceptions, no plain-text production notes.

TASK
Given the user's style prompt, produce an arrangement. Length: ${ARRANGEMENT_LENGTH_HINT[length]}

TAG VOCABULARY
Base: [Intro], [Verse 1], [Verse 2], [Pre-Chorus], [Chorus], [Post-Chorus], [Bridge], [Outro]
Extended: [Hook], [Interlude], [Instrumental], [Break], [Breakdown], [Solo], [Refrain], [Drop], [Build], [Fade Out]

FORMAT — STRICT (this is the most common mistake — get it right)
EVERY line is one bracket. Bundle the section name AND its production notes into ONE bracket using the pipe character:

   [Section Name | qualifier1 | qualifier2 | instrument/production note | another note]

NEVER write production notes as plain text below a section header. Suno would try to sing those words.

LAYOUT — MANDATORY
Put EXACTLY ONE BLANK LINE between every two bracket lines. The output must read as visually separated blocks, not a wall of brackets. Example structure:

   [Intro | ...]
   <blank line>
   [Verse 1 | ...]
   <blank line>
   [Chorus | ...]

If you concatenate brackets without blank lines, the output is INVALID and will be rejected.

✓ CORRECT:
   [Intro | sparse | low energy | ambient synth pad | filtered kick pulse]

✗ WRONG (Suno will sing "Ambient synth pad, filtered kick pulse"):
   [Intro | sparse | low energy]
   Ambient synth pad, filtered kick pulse

SPARSITY RULE
Maximum 4-5 pipe-elements per bracket. Section name counts. Less is more — Suno follows clear signals better than dense ones. Don't pile every possible descriptor. If you need more than 5 elements, split into Section + a follow-up [...] bracket on the next line.

ENERGY ARC (required)
Intro low → Verse rising → Chorus peak → Bridge valley → Final Chorus highest → Outro fading.
Use qualifier words inside the brackets: sparse, restrained, building, full, anthemic, half-time, stripped back, fade out, etc.

FORBIDDEN
No artist names. No song lyrics. No explanation. No markdown headings. No plain text outside [...] — ever.

EXAMPLE (everything bracketed, pipe-syntax, 3-4 elements per section)
[Intro | sparse | ambient pad | filtered kick]

[Verse 1 | restrained | clean Rhodes | intimate vocals]

[Pre-Chorus | building | rising synth | tight snare]

[Chorus | full | anthemic | layered harmonies | driving four-on-floor]

[Verse 2 | introspective | softer pad | minimal drums]

[Bridge | stripped back | half-time | solo voice | distant pad]

[Final Chorus | highest energy | wider mix | extra harmony layer]

[Outro | fade out | sparse synth bed | reverb tail]

OUTPUT CONTRACT
Return only the arrangement. No introduction. No prose. Every single line must start with [ and end with ].`;

export const runLlmArrangement = async (
  state: AppState,
  dispatch: Dispatch<Action>,
  signal?: AbortSignal,
): Promise<void> => {
  dispatch({ type: "ARRANGEMENT_START" });
  const stylePrompt = buildStylePrompt(state.prompt);
  // Fallback auf llmOutput: wenn der User via "Aus Idee" gestartet hat, ist
  // state.prompt leer, aber llmOutput enthaelt die Prosa — die nehmen wir dann
  // als Style-Quelle, sonst waere Arrangement nach Idea-Flow blockiert.
  const effectiveStyle = stylePrompt.trim() || state.llmOutput.trim();
  if (!effectiveStyle) {
    dispatch({ type: "ARRANGEMENT_ERROR", message: "Erst Style oder Idee erzeugen" });
    return;
  }
  try {
    // Chaining: llmOutput nur als zusaetzlichen Kontext, wenn er sich von der
    // effektiven Quelle unterscheidet (sonst Dopplung bei Idea-Flow).
    const chainContext =
      state.llmOutput && state.llmOutput.trim() !== effectiveStyle
        ? `\n\nCONTEXT — the full style description for the song:\n"${state.llmOutput.trim()}"`
        : "";
    const out = await generate(state, {
      baseUrl: state.settings.ollamaUrl,
      model: pickModel(state, "arrangement"),
      system: buildArrangementSystemPrompt(state.settings.arrangementLength),
      prompt: `Build a song arrangement matching: ${effectiveStyle}${chainContext}`,
      temperature: getTaskTemperature(state.settings.creativityMode, "arrangement"),
      signal,
      onChunk: (chunk) => dispatch({ type: "ARRANGEMENT_CHUNK", chunk }),
    });
    dispatch({
      type: "ARRANGEMENT_DONE",
      output: formatArrangement(out),
      sourceStylePrompt: effectiveStyle,
    });
  } catch (e) {
    if (isAbortError(e)) return;
    dispatch({
      type: "ARRANGEMENT_ERROR",
      message: e instanceof Error ? e.message : "Unbekannter Fehler",
    });
  }
};

// --- Pipeline -------------------------------------------------------------
export const runStyleAndArrangement = async (
  state: AppState,
  dispatch: Dispatch<Action>,
  signal?: AbortSignal,
): Promise<void> => {
  const sourcePrompt = buildStylePrompt(state.prompt);
  if (!sourcePrompt.trim()) {
    dispatch({ type: "LLM_ERROR", message: "Erst Genre/Subgenre/Mood auswaehlen" });
    return;
  }
  await runLlmBuilder(state, dispatch, signal);
  // Bei Abort oder Builder-Fehler nicht weiter — Arrangement-Call wuerde sonst
  // den Error-Banner ueberschreiben oder auf fehlendem Style-Kontext aufsetzen.
  if (signal?.aborted) return;
  await runLlmArrangement(state, dispatch, signal);
};

// --- From Idea ------------------------------------------------------------
// WICHTIG: Der Idea-Flow schreibt bewusst NICHT in state.llmOutput (das Feld,
// das im Preview als "KI-Ausformulierung" erscheint). Die Prosa wird nur als
// Seed in state.prompt.customStylePrompt abgelegt und in der Modal selbst
// vorangezeigt (state.ideaOutput). Der Preview-Bereich fuellt sich erst, wenn
// der User dort separat auf "Generieren" klickt.
export const runLlmFromIdea = async (
  state: AppState,
  idea: string,
  dispatch: Dispatch<Action>,
  signal?: AbortSignal,
): Promise<void> => {
  dispatch({ type: "IDEA_START" });
  // Fuer den Idea-Flow wollen wir reichhaltige, genre-typische Ausformulierung
  // (aehnlich ChatGPT). Deshalb nutzen wir die volle User-Temperatur — die
  // Anti-Halluzinations-Regeln (keine Markennamen, keine BPM-Zahlen, keine
  // Sprache, kein Genre-Swap) stehen im System-Prompt, nicht in der Temp.
  const temperature = getTaskTemperature(state.settings.creativityMode, "style");
  try {
    const out = await generate(state, {
      baseUrl: state.settings.ollamaUrl,
      model: pickModel(state, "style"),
      system: pickFromIdeaPrompt(state.settings.target),
      prompt: `Die Idee: "${idea}". Baue daraus einen optimalen Style-Prompt fuer ${state.settings.target === "udio" ? "Udio (als Tag-Liste)" : "Suno (als Prosa)"}.`,
      temperature,
      signal,
      onChunk: (chunk) => dispatch({ type: "IDEA_CHUNK", chunk }),
    });
    // Sanitizer mit dem Idea-Text als Quelle — greift bei halluzinierten BPM,
    // Markennamen und fehlenden Franchise-Referenzen.
    const trimmed = sanitizeOutput(out.trim(), { source: idea });
    // Seed setzen: das Idea-Ergebnis landet als Basis im Roh-Style-Prompt,
    // damit der User per Section-Auswahl dazubauen kann.
    dispatch({ type: "SET_CUSTOM_STYLE_PROMPT", value: trimmed });
    dispatch({ type: "IDEA_DONE", output: trimmed });
  } catch (e) {
    if (isAbortError(e)) return;
    dispatch({
      type: "IDEA_ERROR",
      message: e instanceof Error ? e.message : "Unbekannter Fehler",
    });
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

export const runLlmTitles = async (
  state: AppState,
  dispatch: Dispatch<Action>,
  signal?: AbortSignal,
): Promise<void> => {
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
    .map((l) => l.replace(/^lang-/, ""))
    .join(", ");
  const userPrompt = [
    style ? `Style: ${style}` : "",
    lyrics ? `Lyrics excerpt:\n${lyrics.slice(0, 400)}` : "",
    langs ? `Language: ${langs}` : "",
    "Generate 5 song titles.",
  ].filter(Boolean).join("\n\n");
  try {
    const out = await generate(state, {
      baseUrl: state.settings.ollamaUrl,
      model: pickModel(state, "title"),
      system: SYSTEM_PROMPT_TITLES,
      prompt: userPrompt,
      temperature: getTaskTemperature(state.settings.creativityMode, "title"),
      signal,
    });
    const titles = out
      .split("\n")
      .map((l) => l.trim().replace(/^[-*0-9.)"'\s]+/, "").replace(/["']+$/, ""))
      .filter((l) => l && l.length < 80)
      .slice(0, 5);
    dispatch({ type: "TITLES_DONE", titles });
  } catch (e) {
    if (isAbortError(e)) return;
    dispatch({
      type: "TITLES_ERROR",
      message: e instanceof Error ? e.message : "Unbekannter Fehler",
    });
  }
};

// --- Refinement -----------------------------------------------------------
// Nutzt ein bestehendes Output + User-Feedback, um es umzuschreiben.
export const runRefinement = async (
  state: AppState,
  dispatch: Dispatch<Action>,
  target: "style" | "arrangement",
  feedback: string,
  signal?: AbortSignal,
): Promise<void> => {
  const current = target === "style" ? state.llmOutput : state.llmArrangement;
  if (!current.trim() || !feedback.trim()) return;
  const system =
    target === "style"
      ? `${pickBuilderPrompt(state.settings.target)}\n\nYou are refining a previous output based on user feedback. Keep the good parts, change what the feedback says.`
      : `${buildArrangementSystemPrompt(state.settings.arrangementLength)}\n\nYou are refining a previous arrangement based on user feedback.`;
  // Context-Sharing: bei Arrangement-Refinement zusaetzlich den globalen
  // Style-Output als Anker mitgeben — sonst kann das Arrangement von der
  // Stil-Vision wegdriften.
  const styleContext =
    target === "arrangement" && state.llmOutput?.trim()
      ? `\n\nGLOBAL STYLE CONTEXT (the song this arrangement belongs to):\n"${state.llmOutput.trim()}"`
      : "";
  const userPrompt = `PREVIOUS OUTPUT:\n${current}\n\nUSER FEEDBACK: ${feedback}${styleContext}\n\nRewrite the output incorporating the feedback. Return only the new version.`;

  if (target === "style") dispatch({ type: "LLM_START" });
  else dispatch({ type: "ARRANGEMENT_START" });

  try {
    const out = await generate(state, {
      baseUrl: state.settings.ollamaUrl,
      model: pickModel(state, target === "style" ? "style" : "arrangement"),
      system,
      prompt: userPrompt,
      temperature: getTaskTemperature(state.settings.creativityMode, target === "style" ? "style" : "arrangement"),
      signal,
      onChunk: (chunk) =>
        dispatch(target === "style" ? { type: "LLM_CHUNK", chunk } : { type: "ARRANGEMENT_CHUNK", chunk }),
    });
    // Race-Schutz: Wenn der Call waehrend eines Resets noch laeuft, wuerde
    // LLM_DONE einen bereits gecleartem Store ueberschreiben.
    if (signal?.aborted) return;
    if (target === "style") {
      // Sanitizer auch hier: Refinement kann neue Halluzinationen einfuehren.
      const clean = sanitizeBuilderOutput(out.trim(), state.prompt);
      dispatch({ type: "LLM_DONE", output: clean, sourceStylePrompt: state.llmSourceStylePrompt });
    } else {
      dispatch({
        type: "ARRANGEMENT_DONE",
        output: formatArrangement(out),
        sourceStylePrompt: state.llmArrangementSourceStylePrompt,
      });
    }
  } catch (e) {
    if (isAbortError(e)) return;
    const msg = e instanceof Error ? e.message : "Unbekannter Fehler";
    if (target === "style") dispatch({ type: "LLM_ERROR", message: msg });
    else dispatch({ type: "ARRANGEMENT_ERROR", message: msg });
  }
};

// --- Self-Critique (Lyrics) -----------------------------------------------
// Zweiter Pass: kritisiert Output, schreibt verletzende Zeilen neu.
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

export const runSelfCritiqueLyrics = async (
  state: AppState,
  dispatch: Dispatch<Action>,
  signal?: AbortSignal,
): Promise<string | null> => {
  const current = state.prompt.lyrics.trim();
  if (!current) return null;
  try {
    const out = await generate(state, {
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
  } catch {
    return null;
  }
};

export { buildArrangementSystemPrompt };
