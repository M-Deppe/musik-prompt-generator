// Vergleichs-Metriken fuer die Style-Varianten.
// Zweck: dem User auf einen Blick zeigen, WORIN sich die Varianten unterscheiden,
// nicht nur DASS sie unterschiedlich sind. Reduziert Entscheidungskosten.

import type { PromptScore, PromptState } from "@/types";
import { scorePrompt } from "./validator";
// VariantId zentral aus dem Store importieren — sonst triften die Listen
// auseinander wenn man neue Varianten hinzufuegt.
import type { VariantId } from "@/store";
export type { VariantId };

export type VariantMetrics = {
  score: PromptScore;
  wordCount: number;
  charCount: number;
  /** Menge spezifischer Production-/Brand-Hinweise — Proxy aus scorePrompt.specificity */
  specificityProxy: number;
};

/** Extremum-Label fuer eine einzelne Variante, ausgewaehlt aus Vergleichen ueber alle 4. */
export type VariantLabel =
  | "am höchsten gewertet"
  | "am spezifischsten"
  | "am dichtesten"
  | "am kompaktesten"
  | null;

const wordCount = (text: string): number => {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
};

export const computeVariantMetrics = (state: PromptState, text: string): VariantMetrics => {
  const score = scorePrompt(state, text);
  return {
    score,
    wordCount: wordCount(text),
    charCount: text.length,
    specificityProxy: score.parts.specificity,
  };
};

/**
 * Labelt jede Variante mit ihrem charakteristischen Extremum.
 * Reihenfolge der Vergabe (Prio absteigend), damit jede Variante moeglichst
 * ein eindeutiges Label bekommt:
 *   1. hoechster Total-Score      → "am höchsten gewertet"
 *   2. hoechste Specificity       → "am spezifischsten"
 *   3. hoechste Word-Count        → "am dichtesten"
 *   4. niedrigste Word-Count      → "am kompaktesten"
 *
 * Varianten ohne Output (leerer String) werden uebersprungen — sie bekommen null.
 * Bei Gleichstand gewinnt die Variante in der canonical-Reihenfolge der Liste.
 */
export const labelVariants = (
  entries: { id: VariantId; metrics: VariantMetrics; hasOutput: boolean }[],
): Record<VariantId, VariantLabel> => {
  const result: Record<VariantId, VariantLabel> = {
    safe: null,
    experimental: null,
    minimal: null,
    intense: null,
    vintage: null,
    modern: null,
    cinematic: null,
    lofi: null,
  };
  const valid = entries.filter((e) => e.hasOutput && e.metrics.charCount > 0);
  if (valid.length === 0) return result;

  const used = new Set<VariantId>();

  const pickWinner = (
    scoreFn: (m: VariantMetrics) => number,
    direction: "max" | "min",
  ): VariantId | null => {
    const candidates = valid.filter((e) => !used.has(e.id));
    if (candidates.length === 0) return null;
    let best = candidates[0];
    for (const c of candidates.slice(1)) {
      const cur = scoreFn(c.metrics);
      const bv = scoreFn(best.metrics);
      if ((direction === "max" && cur > bv) || (direction === "min" && cur < bv)) {
        best = c;
      }
    }
    // Gegen irrefuehrende Labels: nur auszeichnen, wenn es ueberhaupt einen
    // Unterschied zu den anderen Kandidaten gibt. Alle gleich → null.
    const bestValue = scoreFn(best.metrics);
    const hasDistinction = candidates.some((c) => c.id !== best.id && scoreFn(c.metrics) !== bestValue);
    if (!hasDistinction) return null;
    return best.id;
  };

  // 1. hoechster Score
  const winnerScore = pickWinner((m) => m.score.total, "max");
  if (winnerScore) {
    result[winnerScore] = "am höchsten gewertet";
    used.add(winnerScore);
  }
  // 2. hoechste Specificity
  const winnerSpec = pickWinner((m) => m.specificityProxy, "max");
  if (winnerSpec) {
    result[winnerSpec] = "am spezifischsten";
    used.add(winnerSpec);
  }
  // 3. hoechste Word-Count
  const winnerDense = pickWinner((m) => m.wordCount, "max");
  if (winnerDense) {
    result[winnerDense] = "am dichtesten";
    used.add(winnerDense);
  }
  // 4. niedrigste Word-Count
  const winnerCompact = pickWinner((m) => m.wordCount, "min");
  if (winnerCompact) {
    result[winnerCompact] = "am kompaktesten";
    used.add(winnerCompact);
  }

  return result;
};
