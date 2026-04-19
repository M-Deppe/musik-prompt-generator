/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from "vitest";
import { encodePromptState, decodePromptState, buildShareUrl, readPromptFromUrl, clearUrlHash } from "./urlState";
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

describe("urlState — encode/decode Roundtrip", () => {
  it("rekonstruiert den Prompt 1:1", () => {
    const original = mkPrompt({
      mainGenre: "rock",
      subgenre: "indie-rock",
      bpm: 120,
      moods: ["melancholy", "nostalgic"],
      instruments: ["Rhodes piano", "Moog bass"],
      vocalLanguages: ["lang-de"],
      title: "Vorort",
    });
    const encoded = encodePromptState(original);
    const decoded = decodePromptState(encoded);
    expect(decoded).not.toBeNull();
    expect(decoded?.mainGenre).toBe("rock");
    expect(decoded?.subgenre).toBe("indie-rock");
    expect(decoded?.bpm).toBe(120);
    expect(decoded?.moods).toEqual(["melancholy", "nostalgic"]);
    expect(decoded?.instruments).toEqual(["Rhodes piano", "Moog bass"]);
    expect(decoded?.vocalLanguages).toEqual(["lang-de"]);
    expect(decoded?.title).toBe("Vorort");
  });

  it("verträgt Umlaute / UTF-8", () => {
    const original = mkPrompt({
      title: "Herbsttage — kühl & rau",
      lyrics: "Stille am Fluss\nDer Himmel grau\nÖl auf Wasser",
    });
    const decoded = decodePromptState(encodePromptState(original));
    expect(decoded?.title).toBe("Herbsttage — kühl & rau");
    expect(decoded?.lyrics).toContain("Fluss");
    expect(decoded?.lyrics).toContain("Öl");
  });

  it("Empty-Prompt laesst sich roundtripen", () => {
    const original = mkPrompt();
    const decoded = decodePromptState(encodePromptState(original));
    expect(decoded).not.toBeNull();
    expect(decoded?.moods).toEqual([]);
    expect(decoded?.instruments).toEqual([]);
  });

  it("produziert URL-sichere Zeichen (kein +/=)", () => {
    const encoded = encodePromptState(mkPrompt({ title: "Test!?/+=" }));
    // Format-Prefix "v1:" plus Payload; der Payload darf keine +/= enthalten
    const payload = encoded.split(":", 2)[1];
    expect(payload).not.toMatch(/[+/=]/);
  });
});

describe("urlState — decode-Fehlerfaelle", () => {
  it("null bei leerem String", () => {
    expect(decodePromptState("")).toBeNull();
  });

  it("null bei unbekannter Version", () => {
    expect(decodePromptState("v99:ZXlvLGhpZGRlbg==")).toBeNull();
  });

  it("null bei kaputtem Base64", () => {
    expect(decodePromptState("v1:!!!nicht-base64!!!")).toBeNull();
  });

  it("null bei gueltigem Base64 aber kaputtem JSON", () => {
    // 'v1:' + base64url(kein JSON)
    expect(decodePromptState("v1:bm90X2pzb24")).toBeNull();
  });
});

describe("urlState — URL Integration", () => {
  beforeEach(() => {
    // jsdom: Hash explizit zuruecksetzen pro Test
    window.history.replaceState(null, "", "/");
  });

  it("buildShareUrl enthaelt Hash mit s=...", () => {
    const url = buildShareUrl(mkPrompt({ mainGenre: "rock" }));
    expect(url).toMatch(/#s=v1:/);
  });

  it("readPromptFromUrl liefert null bei leerem Hash", () => {
    expect(readPromptFromUrl()).toBeNull();
  });

  it("readPromptFromUrl liest einen Shared-Link korrekt", () => {
    const prompt = mkPrompt({ mainGenre: "jazz", bpm: 88 });
    const encoded = encodePromptState(prompt);
    window.history.replaceState(null, "", `/#s=${encoded}`);
    const read = readPromptFromUrl();
    expect(read?.mainGenre).toBe("jazz");
    expect(read?.bpm).toBe(88);
  });

  it("readPromptFromUrl ignoriert fremde Hash-Parameter", () => {
    window.history.replaceState(null, "", "/#something=else");
    expect(readPromptFromUrl()).toBeNull();
  });

  it("clearUrlHash entfernt den Hash, behaelt Path/Search", () => {
    window.history.replaceState(null, "", "/?foo=bar#s=v1:xxx");
    clearUrlHash();
    expect(window.location.hash).toBe("");
    expect(window.location.search).toBe("?foo=bar");
  });
});
