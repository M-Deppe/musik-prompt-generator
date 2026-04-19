import type { HistoryEntry, Preset } from "./persistence";
import { scorePrompt } from "./validator";
import { buildStylePrompt } from "./promptBuilder";
import { MAIN_GENRES, getSubgenreById } from "./allGenres";

// Aggregationen über die History. Pure funktionen — kein Store, kein Storage.
// Wird in einem Stats-Modal visualisiert.

export type HistoryStats = {
  totalEntries: number;
  averageScore: number | null;
  medianScore: number | null;
  highestScore: { score: number; entry: HistoryEntry } | null;
  lowestScore: { score: number; entry: HistoryEntry } | null;
  topMainGenres: Array<{ id: string; label: string; count: number }>;
  topSubgenres: Array<{ id: string; label: string; count: number }>;
  topMoods: Array<{ mood: string; count: number }>;
  averageBpm: number | null;
  averageRating: number | null;
  ratingsGiven: number;
  entriesPerDay: Array<{ date: string; count: number }>;
  oldestEntry: HistoryEntry | null;
  newestEntry: HistoryEntry | null;
};

// Schwellwert um trends zu erkennen — bei < MIN_ENTRIES sind statistische
// Aussagen irrefuehrend. Wir liefern trotzdem Werte, das UI kann je nach
// Anzahl unterschiedlich darstellen (z.B. "Noch zu wenige Daten").
export const MIN_ENTRIES_FOR_TRENDS = 3;

// Hilfsfunktion: Score berechnen fuer einen History-Eintrag.
// Nutzt llmOutput wenn vorhanden (dichtere Beschreibung = realistischerer Score),
// sonst den deterministisch gebauten Style-Prompt.
const scoreEntry = (e: HistoryEntry): number => {
  const text = e.llmOutput?.trim() || e.stylePrompt || buildStylePrompt(e.prompt);
  return scorePrompt(e.prompt, text).total;
};

const median = (values: number[]): number | null => {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
};

const countBy = <T extends string>(items: T[]): Map<T, number> => {
  const map = new Map<T, number>();
  for (const item of items) {
    map.set(item, (map.get(item) ?? 0) + 1);
  }
  return map;
};

const topN = <T>(
  map: Map<string, number>,
  n: number,
  mapFn: (id: string, count: number) => T,
): T[] =>
  [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([id, count]) => mapFn(id, count));

/**
 * Aggregiert eine HistoryEntry-Liste zu den Stats-Metriken. Funktioniert
 * auch bei leerer History — dann sind die meisten Felder null oder [].
 */
export const computeHistoryStats = (history: HistoryEntry[]): HistoryStats => {
  if (history.length === 0) {
    return {
      totalEntries: 0,
      averageScore: null,
      medianScore: null,
      highestScore: null,
      lowestScore: null,
      topMainGenres: [],
      topSubgenres: [],
      topMoods: [],
      averageBpm: null,
      averageRating: null,
      ratingsGiven: 0,
      entriesPerDay: [],
      oldestEntry: null,
      newestEntry: null,
    };
  }

  // Scores fuer alle Eintraege berechnen (einmal, wiederverwendet).
  const scored = history.map((e) => ({ entry: e, score: scoreEntry(e) }));
  const scores = scored.map((s) => s.score);
  const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const highest = scored.reduce((a, b) => (b.score > a.score ? b : a));
  const lowest = scored.reduce((a, b) => (b.score < a.score ? b : a));

  // Genre-Zaehlungen: nur Eintraege mit gesetztem mainGenre / subgenre.
  const mainGenreCounts = countBy(
    history.map((e) => e.prompt.mainGenre).filter((g): g is string => !!g),
  );
  const subgenreCounts = countBy(
    history.map((e) => e.prompt.subgenre).filter((g): g is string => !!g),
  );

  // Moods: flatten und zaehlen.
  const moodCounts = countBy(history.flatMap((e) => e.prompt.moods));

  // BPM-Average: nur Entries mit gesetztem BPM.
  const bpms = history.map((e) => e.prompt.bpm).filter((b): b is number => typeof b === "number" && b > 0);
  const averageBpm = bpms.length > 0 ? Math.round(bpms.reduce((a, b) => a + b, 0) / bpms.length) : null;

  // Ratings: nur Entries mit rating gesetzt.
  const ratings = history.map((e) => e.rating).filter((r): r is number => typeof r === "number" && r > 0);
  const averageRating =
    ratings.length > 0 ? Number((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)) : null;

  // Entries-per-Day: gruppiert nach Datum (YYYY-MM-DD).
  const dayCounts = new Map<string, number>();
  for (const e of history) {
    const day = e.createdAt.slice(0, 10);
    dayCounts.set(day, (dayCounts.get(day) ?? 0) + 1);
  }
  const entriesPerDay = [...dayCounts.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, count]) => ({ date, count }));

  // Oldest / newest nach createdAt.
  const sortedByDate = [...history].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const oldestEntry = sortedByDate[0];
  const newestEntry = sortedByDate[sortedByDate.length - 1];

  return {
    totalEntries: history.length,
    averageScore,
    medianScore: median(scores),
    highestScore: { score: highest.score, entry: highest.entry },
    lowestScore: { score: lowest.score, entry: lowest.entry },
    topMainGenres: topN(mainGenreCounts, 5, (id, count) => ({
      id,
      label: MAIN_GENRES.find((g) => g.id === id)?.name ?? id,
      count,
    })),
    topSubgenres: topN(subgenreCounts, 5, (id, count) => ({
      id,
      label: getSubgenreById(id)?.name ?? id,
      count,
    })),
    topMoods: topN(moodCounts, 8, (mood, count) => ({ mood, count })),
    averageBpm,
    averageRating,
    ratingsGiven: ratings.length,
    entriesPerDay,
    oldestEntry,
    newestEntry,
  };
};

/** Sprache aus History ableiten — dominante Vocal-Sprache. Praktisch fuer Modell-Routing-UI-Hinweise. */
export const dominantLanguage = (history: HistoryEntry[]): string | null => {
  const langs = history.flatMap((e) => e.prompt.vocalLanguages ?? []);
  if (langs.length === 0) return null;
  const counts = countBy(langs);
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  return sorted[0][0];
};

/** Anzahl Presets — simple Anzeige im Stats-Modal. */
export const presetCount = (presets: Preset[]): number => presets.length;
