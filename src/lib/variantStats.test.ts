/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from "vitest";
import {
  loadStats,
  recordWinner,
  totalVotes,
  computePreferences,
  topVariant,
  resetStats,
} from "./variantStats";

describe("variantStats", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("liefert initial 0 fuer alle Varianten", () => {
    const stats = loadStats();
    expect(stats).toEqual({ safe: 0, experimental: 0, minimal: 0, intense: 0, vintage: 0, modern: 0, cinematic: 0, lofi: 0 });
    expect(totalVotes(stats)).toBe(0);
  });

  it("recordWinner incrementiert die gewaehlte Variante", () => {
    recordWinner("safe");
    recordWinner("safe");
    recordWinner("experimental");
    const stats = loadStats();
    expect(stats.safe).toBe(2);
    expect(stats.experimental).toBe(1);
    expect(stats.minimal).toBe(0);
    expect(stats.intense).toBe(0);
    expect(totalVotes(stats)).toBe(3);
  });

  it("computePreferences liefert null bei keinen Votes", () => {
    expect(computePreferences(loadStats())).toBeNull();
  });

  it("computePreferences berechnet Prozentsaetze korrekt", () => {
    recordWinner("safe");
    recordWinner("safe");
    recordWinner("experimental");
    recordWinner("minimal");
    const prefs = computePreferences(loadStats());
    expect(prefs).not.toBeNull();
    expect(prefs!.safe).toBe(50);
    expect(prefs!.experimental).toBe(25);
    expect(prefs!.minimal).toBe(25);
    expect(prefs!.intense).toBe(0);
  });

  it("topVariant liefert null bei keinen Votes", () => {
    expect(topVariant(loadStats())).toBeNull();
  });

  it("topVariant liefert den klaren Gewinner", () => {
    recordWinner("intense");
    recordWinner("intense");
    recordWinner("intense");
    recordWinner("safe");
    expect(topVariant(loadStats())).toBe("intense");
  });

  it("topVariant liefert null bei Gleichstand an der Spitze", () => {
    recordWinner("safe");
    recordWinner("safe");
    recordWinner("experimental");
    recordWinner("experimental");
    expect(topVariant(loadStats())).toBeNull();
  });

  it("resetStats raeumt localStorage auf", () => {
    recordWinner("safe");
    recordWinner("intense");
    resetStats();
    expect(loadStats()).toEqual({ safe: 0, experimental: 0, minimal: 0, intense: 0, vintage: 0, modern: 0, cinematic: 0, lofi: 0 });
  });

  it("robust gegen kaputten localStorage-Inhalt", () => {
    localStorage.setItem("mps.variantWins", "{nicht-gueltiges-json");
    const stats = loadStats();
    expect(stats).toEqual({ safe: 0, experimental: 0, minimal: 0, intense: 0, vintage: 0, modern: 0, cinematic: 0, lofi: 0 });
  });

  it("robust gegen teilweise fehlende Felder im localStorage", () => {
    localStorage.setItem("mps.variantWins", JSON.stringify({ safe: 5 }));
    const stats = loadStats();
    expect(stats.safe).toBe(5);
    expect(stats.experimental).toBe(0);
    expect(stats.minimal).toBe(0);
    expect(stats.intense).toBe(0);
  });
});
