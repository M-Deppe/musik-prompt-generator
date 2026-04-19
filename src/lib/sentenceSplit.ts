// Split einer Prosa in einzelne Saetze. Rein fuer UI-Darstellung —
// der State bleibt unveraendert, Kopieren/Export nutzen weiter den Original-
// Fliesstext, damit der Suno-Import nicht beeinflusst wird.
//
// Regex-Strategie: Split nach Interpunktion [.!?] gefolgt von Whitespace +
// Großbuchstaben oder Zeilenende. Abkuerzungen wie "e.g."/"i.e." werden nicht
// erkannt — im Style-Prompt kaum relevant, weil das Modell dort keine nutzt.

const SENTENCE_SPLIT_RE = /(?<=[.!?])\s+(?=[A-ZÄÖÜ])/;

export const splitSentences = (text: string): string[] => {
  if (!text.trim()) return [];
  return text
    .split(SENTENCE_SPLIT_RE)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
};

/** Darstellungs-Variante: jeder Satz auf eigener Zeile, kein Leerraum dazwischen. */
export const formatSentencesForDisplay = (text: string): string =>
  splitSentences(text).join("\n");
