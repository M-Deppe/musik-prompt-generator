import type { Settings } from "@/types";
import { generate } from "./ollama";

// Genre-Crossover — Fragt das LLM nach Fusion-Elementen fuer zwei Genres.
// Output ist strukturiertes JSON: Bridge-Instrumente, Production-Tricks,
// typische Moods und ein kurzes Fazit was die Kombi ausmacht.

export type CrossoverResult = {
  primary: string;
  secondary: string;
  bridgeInstruments: string[];
  productionHints: string[];
  moodPalette: string[];
  pitfalls: string[];
  summary: string;
};

const SYSTEM_PROMPT_CROSSOVER = `You are a genre-fusion expert. Given two music genres, suggest how to combine them tastefully.

OUTPUT FORMAT — STRICT JSON, no markdown:
{
  "bridgeInstruments": [<3-5 instruments or sonic elements that bridge both genres>],
  "productionHints": [<3-5 production techniques that work for the fusion>],
  "moodPalette": [<3-5 mood/atmosphere words>],
  "pitfalls": [<2-3 things to AVOID that would make the fusion sound cheap>],
  "summary": "<one sentence describing what makes this fusion work>"
}

RULES
- Be specific, not vague ("reverb-soaked Rhodes" not "keyboards").
- No artist names. No song titles. English only.
- Focus on what the two genres share AND what can be added as glue.`;

const parseCrossover = (raw: string): Omit<CrossoverResult, "primary" | "secondary"> | null => {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[0]);
    const arr = (v: unknown): string[] =>
      Array.isArray(v) ? v.filter((x): x is string => typeof x === "string").slice(0, 6) : [];
    return {
      bridgeInstruments: arr(parsed.bridgeInstruments),
      productionHints: arr(parsed.productionHints),
      moodPalette: arr(parsed.moodPalette),
      pitfalls: arr(parsed.pitfalls),
      summary: typeof parsed.summary === "string" ? parsed.summary : "",
    };
  } catch {
    return null;
  }
};

export const runCrossover = async (
  settings: Settings,
  primary: string,
  secondary: string,
  signal?: AbortSignal,
): Promise<CrossoverResult | null> => {
  if (!primary || !secondary) return null;
  try {
    const out = await generate({
      baseUrl: settings.ollamaUrl,
      model: settings.modelStyle || settings.ollamaModel,
      system: SYSTEM_PROMPT_CROSSOVER,
      prompt: `PRIMARY GENRE: ${primary}\nSECONDARY GENRE: ${secondary}\n\nReturn strict JSON.`,
      temperature: 0.6,
      signal,
      cloudFallback: settings,
    });
    const parsed = parseCrossover(out);
    if (!parsed) return null;
    return { ...parsed, primary, secondary };
  } catch {
    return null;
  }
};
