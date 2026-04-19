import { describe, it, expect } from "vitest";
import { computeHistoryStats, dominantLanguage, presetCount } from "./historyStats";
import type { HistoryEntry } from "./persistence";
import type { PromptState } from "@/types";

const mkPrompt = (overrides: Partial<PromptState> = {}): PromptState => ({
  moods: [],
  instruments: [],
  production: [],
  customTags: [],
  negatives: [],
  vocalLanguages: [],
  lyrics: "",
  title: "",
  ...overrides,
});

const mkEntry = (id: string, overrides: Partial<HistoryEntry> = {}): HistoryEntry => ({
  id,
  createdAt: "2026-04-10T10:00:00.000Z",
  stylePrompt: "rock, guitar, happy",
  prompt: mkPrompt({ mainGenre: "rock", moods: ["happy"] }),
  ...overrides,
});

describe("computeHistoryStats", () => {
  it("liefert Leer-Stats bei leerer History", () => {
    const stats = computeHistoryStats([]);
    expect(stats.totalEntries).toBe(0);
    expect(stats.averageScore).toBeNull();
    expect(stats.topMainGenres).toEqual([]);
    expect(stats.averageBpm).toBeNull();
    expect(stats.oldestEntry).toBeNull();
  });

  it("zaehlt totalEntries korrekt", () => {
    const stats = computeHistoryStats([mkEntry("1"), mkEntry("2"), mkEntry("3")]);
    expect(stats.totalEntries).toBe(3);
  });

  it("berechnet averageScore gerundet", () => {
    const entries = [
      mkEntry("1", { prompt: mkPrompt({ mainGenre: "rock", subgenre: "indie-rock", moods: ["happy"] }) }),
      mkEntry("2", { prompt: mkPrompt({ mainGenre: "rock" }) }),
    ];
    const stats = computeHistoryStats(entries);
    expect(stats.averageScore).not.toBeNull();
    expect(Number.isInteger(stats.averageScore)).toBe(true);
  });

  it("ermittelt highestScore und lowestScore", () => {
    const rich = mkEntry("rich", {
      prompt: mkPrompt({
        mainGenre: "rock",
        subgenre: "indie-rock",
        bpm: 120,
        moods: ["nostalgic"],
        instruments: ["Moog bass"],
        vocalCharacter: "raspy male",
      }),
      stylePrompt: "indie rock, nostalgic, Moog bass, raspy male vocals, warm analog",
    });
    const poor = mkEntry("poor", { prompt: mkPrompt(), stylePrompt: "" });
    const stats = computeHistoryStats([rich, poor]);
    expect(stats.highestScore?.entry.id).toBe("rich");
    expect(stats.lowestScore?.entry.id).toBe("poor");
  });

  it("topMainGenres ranked nach Haeufigkeit", () => {
    const entries = [
      mkEntry("1", { prompt: mkPrompt({ mainGenre: "rock" }) }),
      mkEntry("2", { prompt: mkPrompt({ mainGenre: "rock" }) }),
      mkEntry("3", { prompt: mkPrompt({ mainGenre: "jazz" }) }),
      mkEntry("4", { prompt: mkPrompt({ mainGenre: "electronic" }) }),
    ];
    const stats = computeHistoryStats(entries);
    expect(stats.topMainGenres[0].id).toBe("rock");
    expect(stats.topMainGenres[0].count).toBe(2);
  });

  it("topMoods flattened ueber alle Eintraege", () => {
    const entries = [
      mkEntry("1", { prompt: mkPrompt({ moods: ["happy", "nostalgic"] }) }),
      mkEntry("2", { prompt: mkPrompt({ moods: ["happy"] }) }),
      mkEntry("3", { prompt: mkPrompt({ moods: ["dark"] }) }),
    ];
    const stats = computeHistoryStats(entries);
    const happy = stats.topMoods.find((m) => m.mood === "happy");
    expect(happy?.count).toBe(2);
  });

  it("averageBpm ignoriert fehlende BPMs", () => {
    const entries = [
      mkEntry("1", { prompt: mkPrompt({ bpm: 120 }) }),
      mkEntry("2", { prompt: mkPrompt({ bpm: 140 }) }),
      mkEntry("3", { prompt: mkPrompt({ bpm: undefined }) }),
    ];
    const stats = computeHistoryStats(entries);
    expect(stats.averageBpm).toBe(130);
  });

  it("averageRating nur ueber Entries mit rating", () => {
    const entries = [
      mkEntry("1", { rating: 4 }),
      mkEntry("2", { rating: 5 }),
      mkEntry("3"), // kein rating
    ];
    const stats = computeHistoryStats(entries);
    expect(stats.averageRating).toBe(4.5);
    expect(stats.ratingsGiven).toBe(2);
  });

  it("entriesPerDay gruppiert nach Datum", () => {
    const entries = [
      mkEntry("1", { createdAt: "2026-04-10T10:00:00.000Z" }),
      mkEntry("2", { createdAt: "2026-04-10T15:00:00.000Z" }),
      mkEntry("3", { createdAt: "2026-04-11T09:00:00.000Z" }),
    ];
    const stats = computeHistoryStats(entries);
    expect(stats.entriesPerDay).toEqual([
      { date: "2026-04-10", count: 2 },
      { date: "2026-04-11", count: 1 },
    ]);
  });

  it("oldest/newest nach createdAt", () => {
    const entries = [
      mkEntry("mid", { createdAt: "2026-04-10T12:00:00.000Z" }),
      mkEntry("old", { createdAt: "2026-01-01T00:00:00.000Z" }),
      mkEntry("new", { createdAt: "2026-04-19T12:00:00.000Z" }),
    ];
    const stats = computeHistoryStats(entries);
    expect(stats.oldestEntry?.id).toBe("old");
    expect(stats.newestEntry?.id).toBe("new");
  });
});

describe("dominantLanguage", () => {
  it("liefert null bei leerer History", () => {
    expect(dominantLanguage([])).toBeNull();
  });

  it("liefert die haeufigste Sprache", () => {
    const entries = [
      mkEntry("1", { prompt: mkPrompt({ vocalLanguages: ["lang-de"] }) }),
      mkEntry("2", { prompt: mkPrompt({ vocalLanguages: ["lang-de", "lang-en"] }) }),
      mkEntry("3", { prompt: mkPrompt({ vocalLanguages: ["lang-en"] }) }),
    ];
    expect(dominantLanguage(entries)).toBe("lang-de");
  });
});

describe("presetCount", () => {
  it("liefert 0 bei leerem Array", () => {
    expect(presetCount([])).toBe(0);
  });
});
