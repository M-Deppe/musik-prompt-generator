import type { AppState } from "@/store";
import { generate } from "./ollama";

// LLM-as-Judge — ein zweiter Pass bewertet den Style-Output entlang klarer
// Kriterien. Anders als der heuristische scorePrompt urteilt das LLM ueber
// "weiche" Qualitaetsmerkmale wie Kohaerenz, Bildsprache, Suno-/Udio-Passung.
// Output ist strikt JSON, damit wir mit parse() robust umgehen koennen.

export type JudgeResult = {
  score: number; // 1-10
  strengths: string[];
  weaknesses: string[];
  verdict: string; // 1-Satz-Fazit
  ts: number;
};

const SYSTEM_PROMPT_JUDGE = `You are a strict but fair music-prompt reviewer. You evaluate prompts that will be fed into Suno AI or Udio.

Evaluate on these dimensions:
- Clarity: can Suno/Udio parse the style without ambiguity?
- Specificity: concrete production / mood / instrument details, not vague buzzwords?
- Coherence: does the prompt describe ONE song, not a contradictory mix?
- Target fit: does it match the output format (Suno = prose, Udio = tag list)?
- Originality: avoids clichés and filler ("epic", "amazing", "wonderful journey")?

OUTPUT FORMAT — STRICT JSON, no markdown, no prose outside the JSON:
{
  "score": <number 1-10>,
  "strengths": ["<short phrase>", "<short phrase>"],
  "weaknesses": ["<short phrase>", "<short phrase>"],
  "verdict": "<one sentence summary>"
}

SCORING GUIDE
1-3: unusable, vague or contradictory
4-5: mediocre, needs major work
6-7: solid, would work but has weaknesses
8-9: strong, few minor issues
10: exemplary, publish as-is`;

const parseJudgeResponse = (raw: string): Omit<JudgeResult, "ts"> | null => {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[0]);
    const score = Number(parsed.score);
    if (!Number.isFinite(score) || score < 1 || score > 10) return null;
    return {
      score: Math.round(score),
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 5).map(String) : [],
      weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses.slice(0, 5).map(String) : [],
      verdict: typeof parsed.verdict === "string" ? parsed.verdict : "",
    };
  } catch {
    return null;
  }
};

export const runJudge = async (
  state: AppState,
  signal?: AbortSignal,
): Promise<JudgeResult | null> => {
  const style = state.llmOutput.trim();
  if (!style) return null;
  const target = state.settings.target;
  const userPrompt = `TARGET PLATFORM: ${target.toUpperCase()}\n\nPROMPT TO JUDGE:\n${style}\n\nReturn strict JSON.`;
  try {
    const out = await generate({
      baseUrl: state.settings.ollamaUrl,
      model: state.settings.modelStyle || state.settings.ollamaModel,
      system: SYSTEM_PROMPT_JUDGE,
      prompt: userPrompt,
      temperature: 0.2, // Urteilsaufgabe — niedrige Temperatur fuer Konsistenz.
      signal,
      cloudFallback: state.settings,
    });
    const parsed = parseJudgeResponse(out);
    if (!parsed) return null;
    return { ...parsed, ts: Date.now() };
  } catch {
    return null;
  }
};
