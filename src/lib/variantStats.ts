import type { VariantId } from "@/store";

// Trackt welche Variant der User als Favoriten markiert. Dient als weiches
// Lern-Signal — nach genug Auswahlen zeigt das UI dem User seine eigene
// Tendenz ("du bevorzugst experimental 45% der Zeit"). Das ist dann eine
// Grundlage fuer spaetere Prompt-Tuning-Entscheidungen (z.B. Default-Temp).

const STORAGE_KEY = "mps.variantWins";

export type VariantStats = Record<VariantId, number>;

const EMPTY: VariantStats = {
  safe: 0, experimental: 0, minimal: 0, intense: 0,
  vintage: 0, modern: 0, cinematic: 0, lofi: 0,
};

export const loadStats = (): VariantStats => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY };
    const parsed = JSON.parse(raw);
    // Defensive: nur bekannte Keys uebernehmen, Zahlen coercen.
    return {
      safe: Number(parsed?.safe) || 0,
      experimental: Number(parsed?.experimental) || 0,
      minimal: Number(parsed?.minimal) || 0,
      intense: Number(parsed?.intense) || 0,
      vintage: Number(parsed?.vintage) || 0,
      modern: Number(parsed?.modern) || 0,
      cinematic: Number(parsed?.cinematic) || 0,
      lofi: Number(parsed?.lofi) || 0,
    };
  } catch {
    return { ...EMPTY };
  }
};

const saveStats = (stats: VariantStats): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // localStorage blockiert — Stats bleiben nur in-memory, kein Crash.
  }
};

/** Incrementiert den Zaehler der gewaehlten Variante um 1. */
export const recordWinner = (variant: VariantId): VariantStats => {
  const current = loadStats();
  const next = { ...current, [variant]: current[variant] + 1 };
  saveStats(next);
  return next;
};

/** Gesamtanzahl der aufgezeichneten Votes. */
export const totalVotes = (stats: VariantStats): number =>
  Object.values(stats).reduce((sum, n) => sum + n, 0);

/**
 * Prozentsaetze pro Variante. Liefert null wenn noch keine Votes aufgezeichnet
 * wurden — dann hat der User kein Muster und wir zeigen auch keines.
 */
export const computePreferences = (
  stats: VariantStats,
): Record<VariantId, number> | null => {
  const total = totalVotes(stats);
  if (total === 0) return null;
  const result = {} as Record<VariantId, number>;
  (Object.keys(stats) as VariantId[]).forEach((id) => {
    result[id] = Math.round((stats[id] / total) * 100);
  });
  return result;
};

/** Liefert die Top-Variante oder null bei keinem Winner / Gleichstand an der Spitze. */
export const topVariant = (stats: VariantStats): VariantId | null => {
  const total = totalVotes(stats);
  if (total === 0) return null;
  const entries = (Object.entries(stats) as [VariantId, number][]).sort(
    (a, b) => b[1] - a[1],
  );
  // Bei Gleichstand an der Spitze kein klarer Favorit.
  if (entries[0][1] === entries[1][1]) return null;
  return entries[0][0];
};

export const resetStats = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // nichts zu tun
  }
};
