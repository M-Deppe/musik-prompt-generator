import { describe, it, expect } from "vitest";
import { splitSentences, formatSentencesForDisplay } from "./sentenceSplit";

describe("splitSentences", () => {
  it("splittet einen typischen 3-Satz-Style-Prompt", () => {
    const text =
      "A nostalgic 80s synthwave track with a bittersweet mood. A breathy female vocal sits upfront at 124 BPM. Moog bass synth drives the groove in a minor key.";
    const result = splitSentences(text);
    expect(result).toHaveLength(3);
    expect(result[0]).toMatch(/^A nostalgic/);
    expect(result[2]).toMatch(/Moog bass synth/);
  });

  it("splittet auch Frage- und Ausrufezeichen", () => {
    expect(splitSentences("Calm intro. Loud chorus! What happens next?")).toHaveLength(3);
  });

  it("behaelt Interpunktion am Satzende", () => {
    const result = splitSentences("First sentence. Second sentence.");
    expect(result[0]).toBe("First sentence.");
    expect(result[1]).toBe("Second sentence.");
  });

  it("behandelt Negations-Suffix 'No X. No Y.' korrekt", () => {
    const text =
      "A feel-good track with polished mix. No growled vocals. No harsh distortion.";
    const result = splitSentences(text);
    expect(result).toHaveLength(3);
    expect(result[1]).toBe("No growled vocals.");
    expect(result[2]).toBe("No harsh distortion.");
  });

  it("trimmed Whitespace", () => {
    expect(splitSentences("   A.   B.   ")).toEqual(["A.", "B."]);
  });

  it("liefert leeres Array bei leerem String", () => {
    expect(splitSentences("")).toEqual([]);
    expect(splitSentences("   ")).toEqual([]);
  });

  it("behaelt einen einzelnen Satz bei", () => {
    expect(splitSentences("Just one sentence here.")).toEqual(["Just one sentence here."]);
  });

  it("erkennt deutsche Umlaute am Satzanfang", () => {
    const text = "Erster Satz. Über allem ein Hauch von Nostalgie.";
    expect(splitSentences(text)).toHaveLength(2);
  });
});

describe("formatSentencesForDisplay", () => {
  it("joint Saetze mit einfachem Newline", () => {
    const text = "A. B. C.";
    expect(formatSentencesForDisplay(text)).toBe("A.\nB.\nC.");
  });

  it("liefert leeren String bei leerem Input", () => {
    expect(formatSentencesForDisplay("")).toBe("");
  });
});
