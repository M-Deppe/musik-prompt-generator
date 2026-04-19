import { describe, it, expect } from "vitest";
import { validate, preflightCheck, scorePrompt } from "./validator";
import type { PromptState } from "@/types";

// Minimal-Factory fuer PromptState — alle Felder mit sinnvollen Defaults,
// damit Tests nur die relevanten Attribute ueberschreiben muessen.
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

// ===========================================================================
// validate()
// ===========================================================================

describe("validate — harte Regeln", () => {
  it("laesst einen minimalen, konsistenten Prompt ohne Errors durch", () => {
    const state = mkPrompt({
      mainGenre: "rock",
      moods: ["happy"],
      instruments: ["guitar", "drums"],
    });
    const issues = validate(state, "rock, happy, guitar, drums");
    const errors = issues.filter((i) => i.severity === "error");
    expect(errors).toHaveLength(0);
  });

  it("meldet Error bei ueber 1000 Zeichen Style-Prompt", () => {
    const state = mkPrompt();
    const longPrompt = "a, ".repeat(400); // 1200 Zeichen
    const issues = validate(state, longPrompt);
    expect(issues.some((i) => i.severity === "error" && /1000/.test(i.message))).toBe(true);
  });

  it("warnt bei weniger als 4 Descriptoren", () => {
    const issues = validate(mkPrompt(), "rock, happy");
    expect(issues.some((i) => i.severity === "warn" && /Descriptor/i.test(i.message))).toBe(true);
  });

  it("warnt bei mehr als 7 Descriptoren (Dilution)", () => {
    const tags = ["a", "b", "c", "d", "e", "f", "g", "h", "i"].join(", ");
    const issues = validate(mkPrompt(), tags);
    expect(issues.some((i) => /Dilution/i.test(i.message))).toBe(true);
  });

  it("warnt nicht bei 4-7 Descriptoren (Sweet Spot)", () => {
    const issues = validate(mkPrompt(), "a, b, c, d, e");
    expect(issues.some((i) => i.severity === "warn" && /Descriptor/.test(i.message))).toBe(false);
  });

  it("warnt bei mehr als 3 Instrumenten", () => {
    const state = mkPrompt({ instruments: ["a", "b", "c", "d", "e"] });
    const issues = validate(state, "test");
    expect(issues.some((i) => i.field === "instruments")).toBe(true);
  });

  it("warnt bei Command-Keywords im Prompt", () => {
    const issues = validate(mkPrompt(), "please create a happy song");
    expect(issues.some((i) => /Befehls/i.test(i.message))).toBe(true);
  });

  it("warnt bei doppelten Tags case-insensitive", () => {
    const state = mkPrompt({
      instruments: ["Guitar", "guitar"],
    });
    const issues = validate(state, "test");
    expect(issues.some((i) => /[Dd]oppelte/.test(i.message))).toBe(true);
  });

  it("Error bei Negation die mit Instrument kollidiert", () => {
    const state = mkPrompt({
      instruments: ["electric guitar"],
      negatives: ["no guitar"],
    });
    const issues = validate(state, "test");
    const errors = issues.filter((i) => i.severity === "error" && i.field === "negatives");
    expect(errors.length).toBeGreaterThan(0);
  });

  it("info nicht error bei BPM 0 — weil undefined vs 0 unterschieden wird", () => {
    const state = mkPrompt({ bpm: 0 });
    const issues = validate(state, "test, test2, test3, test4");
    // BPM 0 soll NICHT die "Kein BPM angegeben"-Info triggern (Fix aus Review)
    expect(issues.some((i) => /Kein BPM/.test(i.message))).toBe(false);
  });

  it("triggert 'Kein BPM'-Info bei undefined BPM", () => {
    const state = mkPrompt({ bpm: undefined });
    const issues = validate(state, "test, test2, test3, test4");
    expect(issues.some((i) => i.severity === "info" && /BPM/.test(i.message))).toBe(true);
  });

  it("warnt bei fehlendem Genre komplett", () => {
    const issues = validate(mkPrompt(), "happy, warm");
    expect(issues.some((i) => i.field === "genre")).toBe(true);
  });

  it("info bei Akkordfolge ohne Tonart", () => {
    const state = mkPrompt({ production: ["pr-ii-V-I"] });
    const issues = validate(state, "test");
    expect(issues.some((i) => i.field === "harmony")).toBe(true);
  });
});

// ===========================================================================
// preflightCheck()
// ===========================================================================

describe("preflightCheck — blockierende Inkonsistenzen", () => {
  it("erkennt Widerspruch: no vocals + Vocal-Character gesetzt", () => {
    const state = mkPrompt({
      negatives: ["no vocals"],
      vocalCharacter: "male baritone",
    });
    const warnings = preflightCheck(state);
    expect(warnings.some((w) => /Widerspruch/.test(w))).toBe(true);
  });

  it("warnt bei leerer Auswahl", () => {
    const warnings = preflightCheck(mkPrompt());
    expect(warnings.some((w) => /Keine Auswahl/.test(w))).toBe(true);
  });

  it("warnt bei mehr als 5 Instrumenten", () => {
    const state = mkPrompt({
      mainGenre: "rock",
      instruments: ["a", "b", "c", "d", "e", "f"],
    });
    const warnings = preflightCheck(state);
    expect(warnings.some((w) => /Instrumente/.test(w))).toBe(true);
  });

  it("erkennt Mood-Konflikt calm + aggressive", () => {
    const state = mkPrompt({
      mainGenre: "rock",
      moods: ["calm", "aggressive"],
    });
    const warnings = preflightCheck(state);
    expect(warnings.some((w) => /[Ww]iderspr/.test(w))).toBe(true);
  });

  it("laesst konsistenten Prompt ohne Warnings durch", () => {
    const state = mkPrompt({
      mainGenre: "rock",
      moods: ["happy"],
      instruments: ["guitar"],
    });
    expect(preflightCheck(state)).toHaveLength(0);
  });
});

// ===========================================================================
// scorePrompt() — Score-Engine
// ===========================================================================

describe("scorePrompt — Genre-Klarheit", () => {
  it("gibt 0 Punkte bei kein Genre", () => {
    const score = scorePrompt(mkPrompt(), "test");
    expect(score.parts.genre).toBe(0);
    expect(score.hints.some((h) => /Genre/i.test(h))).toBe(true);
  });

  it("gibt Teilpunkte bei nur Hauptgenre", () => {
    const score = scorePrompt(mkPrompt({ mainGenre: "rock" }), "rock");
    expect(score.parts.genre).toBe(10);
    expect(score.hints.some((h) => /Subgenre/.test(h))).toBe(true);
  });

  it("gibt volle Punkte bei Main + Subgenre", () => {
    const score = scorePrompt(
      mkPrompt({ mainGenre: "rock", subgenre: "indie-rock" }),
      "indie rock",
    );
    expect(score.parts.genre).toBeGreaterThanOrEqual(22);
  });

  it("penalty bei 4+ Genre-Signalen", () => {
    const score = scorePrompt(
      mkPrompt({
        mainGenre: "rock",
        subgenre: "indie-rock",
        secondaryGenre: "jazz",
        soundsLike: "radiohead",
      }),
      "indie rock",
    );
    expect(score.hints.some((h) => /Genre-Signale|verwaessert|verwässert/i.test(h))).toBe(true);
  });
});

describe("scorePrompt — Spezifitaet", () => {
  it("bestraft generische Tags", () => {
    const score = scorePrompt(
      mkPrompt({ mainGenre: "rock", instruments: ["guitar", "bass", "drums", "piano"] }),
      "rock, guitar, bass, drums, piano",
    );
    expect(score.hints.some((h) => /generisch/i.test(h))).toBe(true);
  });

  it("belohnt Markennamen", () => {
    const richPrompt = "indie rock, Moog bass synth, fingerpicked Telecaster, Rhodes piano, 808 kicks";
    const score = scorePrompt(
      mkPrompt({ mainGenre: "rock", subgenre: "indie-rock" }),
      richPrompt,
    );
    expect(score.parts.specificity).toBeGreaterThan(5);
  });
});

describe("scorePrompt — Penalties", () => {
  it("-15 bei > 1000 Zeichen Style-Prompt", () => {
    const long = "tag, ".repeat(250); // ~1250 Zeichen
    const score = scorePrompt(mkPrompt(), long);
    expect(score.parts.penalty).toBeLessThanOrEqual(-15);
  });

  it("bestraft widerspruechliche Moods", () => {
    const score = scorePrompt(
      mkPrompt({ mainGenre: "rock", moods: ["calm", "aggressive"] }),
      "rock, calm, aggressive",
    );
    expect(score.parts.penalty).toBeLessThan(0);
    expect(score.hints.some((h) => /[Ww]iderspr/.test(h))).toBe(true);
  });

  it("bestraft Command-Keywords", () => {
    const score = scorePrompt(mkPrompt({ mainGenre: "rock" }), "create a rock song please make it happy");
    expect(score.parts.penalty).toBeLessThan(0);
    expect(score.hints.some((h) => /Befehls/i.test(h))).toBe(true);
  });

  it("bestraft Reviewer-Filler nur bei Prosa-Output", () => {
    const prose =
      "This vibrant synthwave track takes you on a musical journey through a mesmerizing sonic landscape of soaring synths.";
    const score = scorePrompt(mkPrompt({ mainGenre: "electronic", subgenre: "synthwave" }), prose);
    expect(score.parts.penalty).toBeLessThan(0);
    expect(score.hints.some((h) => /Filler/i.test(h))).toBe(true);
  });

  it("bestraft Reviewer-Filler NICHT bei Tag-String", () => {
    // Tag-String mit gleichen Woertern — aber kurz, kein Prosa
    const tagString = "rock, vibrant, soaring";
    const score = scorePrompt(mkPrompt({ mainGenre: "rock" }), tagString);
    const fillerHit = score.hints.some((h) => /Filler/i.test(h));
    expect(fillerHit).toBe(false);
  });
});

describe("scorePrompt — Bonus", () => {
  it("BPM gibt Bonus", () => {
    const a = scorePrompt(mkPrompt({ mainGenre: "rock", bpm: 120 }), "rock");
    const b = scorePrompt(mkPrompt({ mainGenre: "rock" }), "rock");
    expect(a.parts.bonus).toBeGreaterThan(b.parts.bonus);
  });

  it("Vocal-Definition gibt Bonus", () => {
    const a = scorePrompt(
      mkPrompt({ mainGenre: "rock", vocalCharacter: "raspy male baritone" }),
      "rock",
    );
    const b = scorePrompt(mkPrompt({ mainGenre: "rock" }), "rock");
    expect(a.parts.bonus).toBeGreaterThan(b.parts.bonus);
  });
});

describe("scorePrompt — Gesamt-Score", () => {
  it("clamped auf 0-100", () => {
    const score = scorePrompt(mkPrompt(), "");
    expect(score.total).toBeGreaterThanOrEqual(0);
    expect(score.total).toBeLessThanOrEqual(100);
  });

  it("liefert maximal 6 Hints", () => {
    const score = scorePrompt(mkPrompt(), "");
    expect(score.hints.length).toBeLessThanOrEqual(6);
  });

  it("rundet alle Punkte", () => {
    const score = scorePrompt(mkPrompt({ mainGenre: "rock" }), "rock, guitar, bass");
    expect(Number.isInteger(score.total)).toBe(true);
    expect(Number.isInteger(score.parts.genre)).toBe(true);
    expect(Number.isInteger(score.parts.specificity)).toBe(true);
    expect(Number.isInteger(score.parts.production)).toBe(true);
  });
});
