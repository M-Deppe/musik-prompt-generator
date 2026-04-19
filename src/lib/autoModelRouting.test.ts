import { describe, it, expect } from "vitest";
import { resolveLanguage, pickAutoModel } from "./autoModelRouting";

describe("resolveLanguage", () => {
  it("liefert 'german' bei lang-de", () => {
    expect(resolveLanguage(["lang-de"])).toBe("german");
  });

  it("liefert 'english' bei lang-en", () => {
    expect(resolveLanguage(["lang-en"])).toBe("english");
  });

  it("nimmt die erste echte Sprache aus der Liste", () => {
    expect(resolveLanguage(["lang-whisper-only", "lang-de", "lang-en"])).toBe("german");
  });

  it("ignoriert Non-Lexical-Stile und liefert null wenn nur solche da sind", () => {
    expect(resolveLanguage(["lang-whisper-only", "lang-simlish"])).toBeNull();
  });

  it("liefert null bei leerer Liste", () => {
    expect(resolveLanguage([])).toBeNull();
  });

  it("liefert null bei unbekannter Sprach-ID", () => {
    expect(resolveLanguage(["lang-klingon-unknown"])).toBeNull();
  });
});

describe("pickAutoModel — Lyrics", () => {
  const available = ["gemma4:latest", "llama3.1:latest", "qwen2.5:14b", "mistral-nemo:12b"];

  it("waehlt fuer Deutsch qwen2.5:14b vor gemma4", () => {
    expect(pickAutoModel("lyrics", "german", available)).toBe("qwen2.5:14b");
  });

  it("waehlt fuer Englisch llama3.1:latest vor qwen", () => {
    expect(pickAutoModel("lyrics", "english", available)).toBe("llama3.1:latest");
  });

  it("fallback auf default-Liste bei unbekannter Sprache", () => {
    const result = pickAutoModel("lyrics", "swahili", available);
    // default-Liste priorisiert qwen2.5:14b
    expect(result).toBe("qwen2.5:14b");
  });

  it("waehlt gemma4 wenn das einzige verfuegbare Modell ist — und es in der Praef-Liste steht", () => {
    expect(pickAutoModel("lyrics", "german", ["gemma4:latest"])).toBe("gemma4:latest");
  });

  it("liefert null wenn kein verfuegbares Modell in der Praef-Liste ist", () => {
    expect(pickAutoModel("lyrics", "german", ["some-weird-model:1b"])).toBeNull();
  });

  it("liefert null bei leerer available-Liste", () => {
    expect(pickAutoModel("lyrics", "german", [])).toBeNull();
  });
});

describe("pickAutoModel — Non-Lyrics", () => {
  const available = ["gemma4:latest", "llama3.1:latest", "qwen2.5:14b"];

  it("waehlt fuer 'style' das staerkste verfuegbare Modell (qwen2.5:14b)", () => {
    expect(pickAutoModel("style", "german", available)).toBe("qwen2.5:14b");
  });

  it("ignoriert die Sprache bei 'arrangement' (immer English-Output)", () => {
    const a = pickAutoModel("arrangement", "german", available);
    const b = pickAutoModel("arrangement", "english", available);
    expect(a).toBe(b);
  });

  it("ignoriert die Sprache bei 'title'", () => {
    const a = pickAutoModel("title", "german", available);
    const b = pickAutoModel("title", "english", available);
    expect(a).toBe(b);
  });
});

describe("pickAutoModel — Fuzzy-Matching auf Tags", () => {
  it("matched Family-Prefix wenn exakter Tag fehlt", () => {
    // "qwen2.5:14b" in Praef-Liste — available nur "qwen2.5:14b-instruct-q4"
    const result = pickAutoModel("lyrics", "german", ["qwen2.5:14b-instruct-q4"]);
    expect(result).toBe("qwen2.5:14b-instruct-q4");
  });
});
