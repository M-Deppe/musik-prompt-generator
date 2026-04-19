import type { PromptScore, PromptState, ValidationIssue } from "@/types";
import { dosDonts, findConflictingMoods } from "./knowledge";
import { getSubgenreById } from "./allGenres";

const STYLE_HARD_LIMIT = 1000;
const DESCRIPTOR_MIN = 4;
const DESCRIPTOR_MAX = 7;
const INSTRUMENTS_MAX = 3;
const FORBIDDEN = ["create", "make", "generate", "compose", "please"];

export const validate = (
  state: PromptState,
  stylePrompt: string,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  if (stylePrompt.length > STYLE_HARD_LIMIT) {
    issues.push({
      severity: "error",
      message: `Style-Prompt ${stylePrompt.length} Zeichen — Suno schneidet bei ${STYLE_HARD_LIMIT} still ab.`,
    });
  }

  const descriptorCount = stylePrompt
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean).length;

  if (descriptorCount > 0 && descriptorCount < DESCRIPTOR_MIN) {
    issues.push({
      severity: "warn",
      message: `Nur ${descriptorCount} Descriptoren — zu generisch. Mindestens ${DESCRIPTOR_MIN} anstreben.`,
    });
  }
  if (descriptorCount > DESCRIPTOR_MAX) {
    issues.push({
      severity: "warn",
      message: `${descriptorCount} Descriptoren — Dilution-Risiko. Sweet Spot: ${DESCRIPTOR_MIN}–${DESCRIPTOR_MAX}.`,
    });
  }

  const conflicts = findConflictingMoods(state.moods);
  conflicts.forEach(([a, b]) =>
    issues.push({
      severity: "warn",
      message: `Widerspruechliche Moods: "${a}" + "${b}"`,
      field: "moods",
    }),
  );

  if (state.instruments.length > INSTRUMENTS_MAX) {
    issues.push({
      severity: "warn",
      message: `${state.instruments.length} Instrumente — Suno kann verwirren. Limit: ${INSTRUMENTS_MAX}.`,
      field: "instruments",
    });
  }

  const lowerPrompt = stylePrompt.toLowerCase();
  const hits = FORBIDDEN.filter((w) => new RegExp(`\\b${w}\\b`).test(lowerPrompt));
  if (hits.length) {
    issues.push({
      severity: "warn",
      message: `Befehls-Keywords gefunden: ${hits.join(", ")} — Suno ignoriert Kommandos.`,
    });
  }

  const allTags = [
    ...state.instruments,
    ...state.production,
    ...(state.customTags ?? []),
  ].map((t) => t.toLowerCase());
  const seen = new Set<string>();
  const dupes = new Set<string>();
  for (const t of allTags) {
    if (seen.has(t)) dupes.add(t);
    else seen.add(t);
  }
  if (dupes.size > 0) {
    issues.push({
      severity: "warn",
      message: `Doppelte Tags: ${[...dupes].join(", ")} — einmal reicht.`,
    });
  }

  if (state.bpm === undefined) {
    issues.push({
      severity: "info",
      message: "Kein BPM angegeben — Groove ist unverankert.",
      field: "bpm",
    });
  } else {
    const sub = getSubgenreById(state.subgenre);
    if (sub && (state.bpm < sub.bpm_min || state.bpm > sub.bpm_max)) {
      issues.push({
        severity: "info",
        message: `${state.bpm} BPM liegt ausserhalb der ueblichen Range ${sub.bpm_min}–${sub.bpm_max} fuer ${sub.name}.`,
        field: "bpm",
      });
    }
  }

  if (!state.mainGenre && !state.subgenre) {
    issues.push({
      severity: "warn",
      message: "Kein Genre gewaehlt — Suno wird generisch.",
      field: "genre",
    });
  }

  // Harmonie-Auswahl ohne Tonart-Info (nur Progression oder Modus)
  const hasProgression = state.production.some((t) => t.startsWith("pr-"));
  const hasKey = state.production.some((t) => t.startsWith("key-"));
  if (hasProgression && !hasKey) {
    issues.push({
      severity: "info",
      message: "Akkordfolge gewaehlt, aber keine Tonart — Suno rateten die Key.",
      field: "harmony",
    });
  }

  // Widersprüchliche Negations vs. Instrumente
  const negSet = new Set(state.negatives.map((n) => n.replace(/^no /, "").toLowerCase()));
  const contraInstruments = state.instruments.filter((i) =>
    [...negSet].some((n) => i.toLowerCase().includes(n)),
  );
  if (contraInstruments.length > 0) {
    issues.push({
      severity: "error",
      message: `Ausschluss kollidiert mit Instrument: ${contraInstruments.join(", ")}.`,
      field: "negatives",
    });
  }

  return issues;
};

export { dosDonts };

// Blockierende Inkonsistenzen, die vor einem LLM-Call erkennbar sind.
// Gibt eine Liste von Nachrichten zurueck — leer bedeutet OK.
export const preflightCheck = (state: PromptState): string[] => {
  const warnings: string[] = [];
  const hasNoVocals = state.negatives.some((n) => /^(no )?vocals?$/i.test(n.trim()));
  if (hasNoVocals && (state.vocalCharacter || state.vocalDelivery || (state.vocalLanguages ?? []).length)) {
    warnings.push(
      "Widerspruch: 'no vocals' im Ausschluss, aber Vocal-Character/Delivery/Language gesetzt. Entscheide dich.",
    );
  }
  if (!state.mainGenre && !state.subgenre && state.instruments.length === 0 && state.moods.length === 0) {
    warnings.push("Keine Auswahl — generiere einen generischen Prompt. Mindestens Genre oder Mood waehlen.");
  }
  if (state.instruments.length > 5) {
    warnings.push(`${state.instruments.length} Instrumente — Suno gibt bei >5 oft zufaellige Prioritaet.`);
  }
  const moodConflict = /\b(calm)\b.*\b(aggressive|intense|harsh)\b|\b(aggressive|intense|harsh)\b.*\b(calm)\b/i;
  const joinedMoods = state.moods.join(" ");
  if (moodConflict.test(joinedMoods)) {
    warnings.push("Widerspruechliche Moods (ruhig + aggressiv) — Suno kann das nicht aufloesen.");
  }
  return warnings;
};

// --- Score-Engine -------------------------------------------------------
// Markenwoerter, die fuer hohe Spezifitaet sprechen. Lowercase-Match.
// Wenn der Style-Prompt "Moog bass synth" enthaelt -> +Bonus gegenueber "synth".
const BRAND_KEYWORDS = [
  "moog","minimoog","telecaster","stratocaster","les paul","gibson","fender",
  "rickenbacker","hofner","precision bass","jazz bass","stingray",
  "rhodes","wurlitzer","hammond","mellotron","clavinet","celesta","harpsichord",
  "juno","jupiter","prophet","dx7","oberheim","supersaw","virus","serum",
  "tb-303","tb303","sh-101","ms-20","ms20","korg","roland","yamaha",
  "808","909","707","linndrum","linn drum","sp-1200","sp1200","mpc",
  "neve","ssl","api","pultec","la-2a","1176",
  "abbey road","motown","stax","muscle shoals","sun studio","trident",
  "amen break","reese","wobble","four-on-the-floor","gated reverb",
  "tape saturation","plate reverb","spring reverb","cathedral reverb",
];

const FORBIDDEN_KEYWORDS = ["create","make","generate","compose","please","write"];

// Reviewer-Filler — typische LLM-Wendungen ohne Substanz. Wenn sie im LLM-Output
// auftauchen, ist das ein Indikator fuer halluziniertes Schwadronieren statt
// dichter Beschreibung. Wird in scorePrompt als zusaetzlicher Penalty erkannt
// (greift NUR wenn der Bewertungstext lang genug fuer Prosa ist).
const REVIEWER_FILLER_WORDS = [
  "vibrant", "exuding", "anchored", "soaring", "pulsating",
  "transcendent", "hauntingly", "mesmerizing", "captivating",
];
const REVIEWER_FILLER_PHRASES = [
  "sonic landscape", "musical journey", "tour de force",
  "tapestry of sound", "sonic palette",
];

// Heuristik: Prosa erkennen — wenn der Text >40 Zeichen pro durchschnittlichem
// Komma-Abschnitt hat oder Saetze mit Punkt vorkommen, ist es kein Tag-String.
const looksLikeProse = (text: string): boolean => {
  if (text.length < 80) return false;
  const segments = text.split(",").map((s) => s.trim()).filter(Boolean);
  if (segments.length === 0) return false;
  const avgLen = segments.reduce((n, s) => n + s.length, 0) / segments.length;
  return avgLen > 30 || /[.!?]\s/.test(text);
};

const findReviewerFiller = (text: string): string[] => {
  const lower = text.toLowerCase();
  const wordHits = REVIEWER_FILLER_WORDS.filter((w) =>
    new RegExp(`\\b${w}\\b`).test(lower),
  );
  const phraseHits = REVIEWER_FILLER_PHRASES.filter((p) => lower.includes(p));
  return [...wordHits, ...phraseHits];
};

const clamp = (n: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, n));

export const scorePrompt = (state: PromptState, stylePrompt: string): PromptScore => {
  const hints: string[] = [];
  const tags = stylePrompt.split(",").map((t) => t.trim()).filter(Boolean);
  const lower = stylePrompt.toLowerCase();
  const sub = getSubgenreById(state.subgenre);

  // --- Genre-Klarheit (0-25) -------------------------------------------
  let genre = 0;
  if (state.subgenre && state.mainGenre) {
    genre = 22;
  } else if (state.subgenre) {
    genre = 18;
  } else if (state.mainGenre) {
    genre = 10;
    hints.push("Subgenre wählen — Suno braucht spezifischere Genre-Info als nur Hauptkategorie.");
  } else {
    genre = 0;
    hints.push("Genre wählen — ohne Genre wird der Output generisch.");
  }
  if (state.secondaryGenre) genre = Math.min(25, genre + 3);
  // Nur dann Penalty wenn 3+ Genres erkennbar (Main+Sub+Secondary+SoundsLike)
  const genreSignals = [state.mainGenre, state.subgenre, state.secondaryGenre,
    state.soundsLike?.trim()].filter(Boolean).length;
  if (genreSignals >= 4) {
    genre = Math.max(0, genre - 5);
    hints.push("Zu viele Genre-Signale — Suno verwässert. Max 2 Genres + optional eine Sound-Referenz.");
  }

  // --- Spezifitaet (0-25) ----------------------------------------------
  // Multi-Wort-Tags und Markennamen geben Punkte. Nur Style-Prompt-Substring zaehlt,
  // damit Routing-Prefixes (key-/pr-/etc.) nicht mitgewichtet werden.
  let specificity = 0;
  if (tags.length === 0) {
    hints.push("Keine Tags — mindestens Genre + Mood + 2 Instrumente waehlen.");
  } else {
    const multiWordTags = tags.filter((t) => t.split(/\s+/).length >= 2).length;
    const brandHits = BRAND_KEYWORDS.filter((k) => lower.includes(k)).length;
    specificity = clamp(multiWordTags * 1.2 + brandHits * 3, 0, 25);
    if (multiWordTags < 3 && tags.length >= 4) {
      hints.push("Tags zu generisch — nutze 'Moog bass' statt 'bass', 'fingerpicked Telecaster' statt 'guitar'.");
    }
    if (brandHits === 0 && tags.length >= 5) {
      hints.push("Keine Markeninstrumente erkannt — spezifische Geräte (Rhodes, 808, Juno...) wirken stärker.");
    }
  }

  // --- Production-Dichte (0-20) ----------------------------------------
  // Production[]-Tags ohne semantische Prefixes (key-/pr-/m-/th-/lt-/narr-/uc-/form-/ft-/sl-/trans-).
  const isPlainProduction = (t: string) => !/^(key-|pr-|m-|th-|lt-|narr-|uc-|form-|ft-|sl-|trans-)/.test(t);
  const plainProdCount = state.production.filter(isPlainProduction).length;
  let production = 0;
  if (plainProdCount === 0) {
    production = 0;
    hints.push("Keine Production-Descriptoren — füge 1-3 hinzu (warm analog, polished mix, dry close-miked...).");
  } else if (plainProdCount <= 3) {
    production = 8 + plainProdCount * 2; // 10/12/14
  } else if (plainProdCount <= 7) {
    production = 20; // Sweet Spot
  } else if (plainProdCount <= 12) {
    production = 14;
    hints.push(`${plainProdCount} Production-Tags — etwas viel, ideal sind 4-7.`);
  } else {
    production = 8;
    hints.push(`${plainProdCount} Production-Tags — Dilution-Risiko, reduziere auf 4-7 Kerntags.`);
  }

  // --- Bonus (0-15) -----------------------------------------------------
  let bonus = 0;
  if (state.bpm) {
    bonus += 4;
    if (sub && state.bpm >= sub.bpm_min && state.bpm <= sub.bpm_max) {
      bonus += 2;
    }
  } else {
    hints.push("BPM angeben — Tempo verankert den Groove.");
  }
  const hasHarmony = state.production.some((t) => /^(key-|pr-|m-)/.test(t));
  if (hasHarmony) bonus += 3;
  const hasVocalDef = !!(state.vocalCharacter || state.vocalDelivery);
  if (hasVocalDef) {
    bonus += 4;
  } else if (!state.negatives.some((n) => /vocals?/i.test(n))) {
    hints.push("Vocal-Charakter oder -Delivery festlegen — sonst rät Suno Geschlecht und Stil.");
  }
  if ((state.vocalLanguages ?? []).length > 0) bonus += 2;
  bonus = clamp(bonus, 0, 15);

  // --- Penalties (subtraktiv) -------------------------------------------
  let penalty = 0;
  if (stylePrompt.length > 1000) {
    penalty -= 15;
    hints.push("Style-Prompt > 1000 Zeichen — Suno schneidet ab. Kürzen.");
  }
  const conflicts = findConflictingMoods(state.moods);
  if (conflicts.length > 0) {
    penalty -= conflicts.length * 5;
    hints.push(`Widersprüchliche Moods: ${conflicts.map(([a, b]) => `${a}+${b}`).join(", ")}`);
  }
  const forbiddenHits = FORBIDDEN_KEYWORDS.filter((w) => new RegExp(`\\b${w}\\b`).test(lower));
  if (forbiddenHits.length > 0) {
    penalty -= forbiddenHits.length * 3;
    hints.push(`Befehlswörter im Prompt: ${forbiddenHits.join(", ")} — Suno ignoriert Kommandos.`);
  }
  // Doppelte Tags
  const seen = new Set<string>();
  let dupes = 0;
  for (const t of tags.map((x) => x.toLowerCase())) {
    if (seen.has(t)) dupes++;
    else seen.add(t);
  }
  if (dupes > 0) {
    penalty -= dupes * 2;
    hints.push(`${dupes} doppelte Tags entfernen.`);
  }
  // Negation kollidiert mit Instrument
  const negSet = new Set(state.negatives.map((n) => n.replace(/^no /, "").toLowerCase()));
  const contraInstruments = state.instruments.filter((i) =>
    [...negSet].some((n) => i.toLowerCase().includes(n)),
  );
  if (contraInstruments.length > 0) {
    penalty -= contraInstruments.length * 6;
    hints.push(`Ausschluss kollidiert mit Instrument: ${contraInstruments.join(", ")}`);
  }
  // Zu viele Instrumente
  if (state.instruments.length > 5) {
    penalty -= (state.instruments.length - 5) * 2;
    hints.push(`${state.instruments.length} Instrumente — Suno priorisiert ab >5 zufällig. Limit 3-5.`);
  }

  // Reviewer-Filler-Penalty — nur wenn der Text wie Prosa aussieht (also ein
  // LLM-Output bewertet wird, nicht der Roh-Tag-String aus dem State).
  if (looksLikeProse(stylePrompt)) {
    const fillerHits = findReviewerFiller(stylePrompt);
    if (fillerHits.length > 0) {
      penalty -= fillerHits.length * 4;
      hints.push(`Reviewer-Filler im Output: ${fillerHits.join(", ")} — durch konkrete Beschreibung ersetzen.`);
    }
  }

  const total = clamp(genre + specificity + production + bonus + penalty, 0, 100);

  return {
    total: Math.round(total),
    parts: {
      genre: Math.round(genre),
      specificity: Math.round(specificity),
      production: Math.round(production),
      bonus: Math.round(bonus),
      penalty: Math.round(penalty),
    },
    hints: hints.slice(0, 6),
  };
};
