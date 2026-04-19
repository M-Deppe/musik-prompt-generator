import { describe, it, expect } from "vitest";
import { formatArrangement } from "./llm";

describe("formatArrangement", () => {
  it("fuegt Leerzeile zwischen zwei Brackets ein", () => {
    const input = "[Intro | sparse]\n[Verse 1 | clean]";
    const output = formatArrangement(input);
    expect(output).toBe("[Intro | sparse]\n\n[Verse 1 | clean]");
  });

  it("vereinheitlicht mehrfache Leerzeilen zu genau einer", () => {
    const input = "[Intro]\n\n\n\n[Verse 1]\n\n[Chorus]";
    const output = formatArrangement(input);
    const sections = output.split("\n\n");
    expect(sections).toHaveLength(3);
    expect(sections[0]).toBe("[Intro]");
    expect(sections[1]).toBe("[Verse 1]");
    expect(sections[2]).toBe("[Chorus]");
  });

  it("trimmed Zeilen mit Whitespace", () => {
    const input = "  [Intro]  \n   [Verse 1]   ";
    const output = formatArrangement(input);
    expect(output).toBe("[Intro]\n\n[Verse 1]");
  });

  it("entfernt leere Zwischenzeilen", () => {
    const input = "[A]\n   \n\n[B]\n\n   \n[C]";
    expect(formatArrangement(input)).toBe("[A]\n\n[B]\n\n[C]");
  });

  it("liefert leeren String unveraendert bei leerem Input", () => {
    expect(formatArrangement("")).toBe("");
    expect(formatArrangement("   ")).toBe("   ");
  });

  it("behaelt eine einzelne Bracket-Zeile bei", () => {
    expect(formatArrangement("[Solo | expressive]")).toBe("[Solo | expressive]");
  });

  it("erhaelt Reihenfolge bei 12 Sections (user-Beispiel)", () => {
    const input = `[Intro | sparse | low energy | ambient strings pad | distant piano arpeggios | filtered timpani pulse]
[Verse 1 | restrained | melancholic strings | intimate vocals | simple kick drum | piano motif]
[Pre-Chorus | building | rising woodwinds | growing brass swells | steady snare roll | dynamic lift]
[Chorus | anthemic | full orchestra | soaring vocals | sweeping brass ensemble | powerful drums]
[Post-Chorus | expansive | lush strings bed | brass flourish | echoing piano chord | wide stereo reverb]
[Verse 2 | reflective | softer strings | emotive vocals | subtle percussion layer | woodwind counter-melody]`;
    const output = formatArrangement(input);
    const sections = output.split("\n\n");
    expect(sections).toHaveLength(6);
    expect(sections[0]).toMatch(/^\[Intro/);
    expect(sections[3]).toMatch(/^\[Chorus/);
    expect(sections[5]).toMatch(/^\[Verse 2/);
  });
});
