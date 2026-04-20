import { describe, it, expect } from "vitest";
import {
  hasBpmMention,
  stripBpm,
  stripInventedBrands,
  preserveFranchises,
  sanitizeOutput,
  sanitizeBuilderOutput,
} from "./builderSanitizer";
import type { PromptState } from "@/types";

const makeState = (partial: Partial<PromptState> = {}): PromptState => ({
  moods: [],
  instruments: [],
  production: [],
  customTags: [],
  negatives: [],
  vocalLanguages: [],
  lyrics: "",
  title: "",
  ...partial,
});

describe("hasBpmMention", () => {
  it("findet 'at 120 BPM'", () => {
    expect(hasBpmMention("at 120 BPM")).toBe(true);
  });
  it("findet '85 bpm' case-insensitive", () => {
    expect(hasBpmMention("a steady 85 bpm pulse")).toBe(true);
  });
  it("findet 'beats per minute'", () => {
    expect(hasBpmMention("120 beats per minute")).toBe(true);
  });
  it("findet nichts ohne Zahl", () => {
    expect(hasBpmMention("mid-tempo pacing")).toBe(false);
  });
});

describe("stripBpm", () => {
  it("strippt 'Anchored at 120 BPM'", () => {
    const input = "An uptempo track, Anchored at 120 BPM, with warm pads.";
    expect(stripBpm(input)).toBe("An uptempo track, with warm pads.");
  });
  it("strippt 'at a steady 85 BPM pulse'", () => {
    const input = "A breathy vocal at a steady 85 BPM pulse.";
    expect(stripBpm(input)).toBe("A breathy vocal.");
  });
  it("strippt 'centered on 124 BPM'", () => {
    const input = "Vocals centered on 124 BPM pulse, warm pads.";
    expect(stripBpm(input)).toBe("Vocals, warm pads.");
  });
  it("strippt stand-alone '100 BPM'", () => {
    const input = "A cinematic score. 100 BPM. Emotional.";
    expect(stripBpm(input)).toBe("A cinematic score. Emotional.");
  });
  it("strippt 'set to 140 BPM'", () => {
    const input = "A track, set to 140 BPM, with warm pads.";
    expect(stripBpm(input)).toBe("A track, with warm pads.");
  });
  it("strippt 'paced at 95 BPM'", () => {
    const input = "A groove, paced at 95 BPM.";
    expect(stripBpm(input)).toBe("A groove.");
  });
  it("strippt 'pulsing at 110 BPM'", () => {
    const input = "Synth pads pulsing at 110 BPM drive the track.";
    expect(stripBpm(input)).toBe("Synth pads drive the track.");
  });
  it("strippt 'tempo of 120 BPM'", () => {
    const input = "A rock track, a tempo of 120 BPM, with crunchy guitars.";
    expect(stripBpm(input)).toBe("A rock track, with crunchy guitars.");
  });
  it("strippt 'around 128 BPM'", () => {
    const input = "A house track, around 128 BPM, pumping kick.";
    expect(stripBpm(input)).toBe("A house track, pumping kick.");
  });
  it("strippt 'with a 120 BPM groove'", () => {
    const input = "A track with a 120 BPM groove and warm pads.";
    expect(stripBpm(input)).toBe("A track and warm pads.");
  });
  it("strippt '120 BPM tempo' als stand-alone Phrase", () => {
    const input = "A track. 120 BPM tempo. Smooth.";
    expect(stripBpm(input)).toBe("A track. Smooth.");
  });
  it("behalt Text ohne BPM", () => {
    const input = "A mid-tempo track with warm production.";
    expect(stripBpm(input)).toBe(input);
  });
  it("cleanupt Doppel-Kommas nach Strip", () => {
    const input = "A synthwave track, at 88 BPM, in a minor key.";
    expect(stripBpm(input)).toBe("A synthwave track, in a minor key.");
  });
});

describe("stripInventedBrands", () => {
  it("entfernt 'Rhodes' wenn nicht in source", () => {
    const out = "Warm Rhodes piano and subtle pads.";
    expect(stripInventedBrands(out, "piano and pads")).toBe("Warm piano and subtle pads.");
  });
  it("behaelt 'Rhodes' wenn in source", () => {
    const out = "Warm Rhodes piano and subtle pads.";
    expect(stripInventedBrands(out, "rhodes piano is the core")).toBe(out);
  });
  it("entfernt 'Juno' und 'Telecaster' in einem Durchgang", () => {
    const out = "Deep Juno pad and muted Telecaster arpeggios.";
    expect(stripInventedBrands(out, "warm pads and arpeggios")).toBe("Deep pad and muted arpeggios.");
  });
  it("entfernt 'TR-808' (Modell-Name mit Bindestrich)", () => {
    const out = "Tight TR-808 kicks drive the track.";
    expect(stripInventedBrands(out, "kick drums")).toBe("Tight kicks drive the track.");
  });
  it("entfernt 'Oberheim OB-Xa'", () => {
    const out = "Warm Oberheim OB-Xa pads.";
    expect(stripInventedBrands(out, "synth pads")).toBe("Warm pads.");
  });
  it("entfernt 'Korg Triton'", () => {
    const out = "Bright Korg Triton stabs cut through.";
    expect(stripInventedBrands(out, "synth stabs")).toBe("Bright stabs cut through.");
  });
  it("entfernt 'Wurlitzer' (Wurli)", () => {
    const out = "Warm Wurli and strings.";
    expect(stripInventedBrands(out, "electric piano")).toBe("Warm and strings.");
  });
  it("entfernt 'LA-2A' Compressor-Name", () => {
    const out = "Silky vocals through an LA-2A, polished mix.";
    expect(stripInventedBrands(out, "compressor")).toBe("Silky vocals through an, polished mix.");
  });
  it("entfernt 'Neve 1073' Preamp-Name", () => {
    const out = "Recorded through a Neve 1073 preamp.";
    expect(stripInventedBrands(out, "warm preamp")).toBe("Recorded through a preamp.");
  });
  it("entfernt 'Rickenbacker' Gitarre", () => {
    const out = "Jangly Rickenbacker 330 riffs.";
    expect(stripInventedBrands(out, "guitar riffs")).toBe("Jangly riffs.");
  });
  it("entfernt 'Fender Rhodes' als Ganzes (laengere Variante zuerst)", () => {
    const out = "Classic Fender Rhodes piano.";
    const result = stripInventedBrands(out, "piano");
    expect(result).toBe("Classic piano.");
  });
  it("behaelt Marken, die vom User in Instruments gesetzt wurden", () => {
    const out = "Juno pad and Rhodes piano.";
    // Annahme: beide in source (z.B. aus state.instruments)
    expect(stripInventedBrands(out, "juno rhodes")).toBe(out);
  });
});

describe("preserveFranchises", () => {
  it("fuegt 'Disney-style' ein wenn im Seed aber nicht im Output", () => {
    const out = "An uptempo, bouncy animated musical score.";
    const seed = "ein emotionaler Disney song";
    expect(preserveFranchises(out, seed)).toBe("A Disney-style, uptempo, bouncy animated musical score.");
  });
  it("fuegt nichts ein wenn Franchise schon im Output ist", () => {
    const out = "A Disney-style animated musical.";
    const seed = "Disney song";
    expect(preserveFranchises(out, seed)).toBe(out);
  });
  it("fuegt nichts ein wenn Franchise nicht im Seed ist", () => {
    const out = "An animated musical score.";
    const seed = "emotional ballad";
    expect(preserveFranchises(out, seed)).toBe(out);
  });
  it("handhabt 'Studio Ghibli' + 'Ghibli' ohne doppelt einzufuegen", () => {
    const out = "An orchestral piece.";
    const seed = "Studio Ghibli inspired";
    const result = preserveFranchises(out, seed);
    // Sollte genau einmal "Studio Ghibli-style" stehen
    expect(result.match(/ghibli/gi)?.length).toBe(1);
    expect(result).toContain("Studio Ghibli-style");
  });
  it("prependet als Satz wenn kein fuehrender Artikel", () => {
    const out = "Orchestral arrangements dominate the track.";
    const seed = "Bollywood score";
    expect(preserveFranchises(out, seed)).toBe("Bollywood-style. Orchestral arrangements dominate the track.");
  });
  it("ersetzt 'An' durch 'A' wenn Franchise mit Konsonant beginnt", () => {
    const out = "An uptempo track.";
    const seed = "Disney style";
    expect(preserveFranchises(out, seed)).toBe("A Disney-style, uptempo track.");
  });
  it("fuegt 'James Bond-style' ein", () => {
    const out = "A suspenseful orchestral score.";
    const seed = "James Bond theme-inspired";
    expect(preserveFranchises(out, seed)).toBe("A James Bond-style, suspenseful orchestral score.");
  });
  it("fuegt 'Final Fantasy-style' fuer Game-Music ein", () => {
    const out = "An epic orchestral piece with choirs.";
    const seed = "Final Fantasy boss theme vibe";
    expect(preserveFranchises(out, seed)).toBe("A Final Fantasy-style, epic orchestral piece with choirs.");
  });
  it("erkennt 'Zelda' als Franchise", () => {
    const out = "A whimsical fantasy track.";
    const seed = "Zelda inspired adventure music";
    expect(preserveFranchises(out, seed)).toBe("A Zelda-style, whimsical fantasy track.");
  });
  it("erkennt 'Nashville' Kultur-Referenz", () => {
    const out = "A twangy country ballad.";
    const seed = "classic Nashville session style";
    expect(preserveFranchises(out, seed)).toBe("A Nashville-style, twangy country ballad.");
  });
});

describe("sanitizeOutput (kombiniert)", () => {
  it("BPM und Marke werden zusammen geputzt", () => {
    const out = "An uptempo track, Anchored at 120 BPM, with warm Rhodes piano.";
    const result = sanitizeOutput(out, { source: "" });
    expect(result).toBe("An uptempo track, with warm piano.");
  });
  it("Franchise + BPM + Marke in einem Durchgang", () => {
    const out = "An animated musical, Anchored at 100 BPM, with Juno pads.";
    const result = sanitizeOutput(out, { source: "Disney song idea" });
    expect(result).toBe("A Disney-style, animated musical, with pads.");
  });
  it("BPM bleibt wenn state.bpm gesetzt ist", () => {
    const out = "At 100 BPM, warm pads.";
    const result = sanitizeOutput(out, { source: "", hasExplicitBpm: true });
    expect(result).toContain("100 BPM");
  });
  it("BPM bleibt wenn im Source erwaehnt", () => {
    const out = "At 88 BPM, warm pads.";
    const result = sanitizeOutput(out, { source: "88 BPM reference" });
    expect(result).toContain("88 BPM");
  });
  it("Leerer Output bleibt leer", () => {
    expect(sanitizeOutput("", { source: "Disney" })).toBe("");
  });
});

describe("sanitizeBuilderOutput (PromptState-Wrapper)", () => {
  it("nutzt customStylePrompt als Source", () => {
    const state = makeState({ customStylePrompt: "Disney ballad" });
    const out = "An emotional ballad at 120 BPM with Rhodes piano.";
    const result = sanitizeBuilderOutput(out, state);
    expect(result).toContain("Disney-style");
    expect(result).not.toContain("120 BPM");
    expect(result).not.toContain("Rhodes");
  });
  it("behaelt BPM wenn state.bpm gesetzt", () => {
    const state = makeState({ bpm: 120 });
    const out = "A track at 120 BPM.";
    expect(sanitizeBuilderOutput(out, state)).toContain("120 BPM");
  });
  it("behaelt Marke wenn in state.instruments", () => {
    const state = makeState({ instruments: ["rhodes"] });
    const out = "A track with Rhodes piano.";
    expect(sanitizeBuilderOutput(out, state)).toContain("Rhodes");
  });
  it("putzt alles bei leerem State", () => {
    const state = makeState();
    const out = "A cinematic track at 85 BPM with Moog bass and Telecaster.";
    const result = sanitizeBuilderOutput(out, state);
    expect(result).not.toContain("85 BPM");
    expect(result).not.toContain("Moog");
    expect(result).not.toContain("Telecaster");
  });
});
