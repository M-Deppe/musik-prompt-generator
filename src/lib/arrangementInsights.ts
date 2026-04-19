// Deterministische Heuristik die ein generiertes Arrangement (Section-Tags +
// Production-Notes) auf charakteristische Merkmale prueft und Style-/Production-
// Tags vorschlaegt, die zurueck in den Style-Prompt fliessen sollten.
//
// Bewusst KEINE Abschnittsnamen oder Form-Details werden zurueckgeliefert —
// das gehoert in die Lyrics-/Arrangement-Box, nicht in den Style.
// Zurueckgefuehrt werden ausschliesslich:
//   - Energiecharakter
//   - Dynamikverlauf
//   - Dichte / Layering
//   - Produktionsgroesse / Reverb-Skala
//   - Uebergangsintensitaet
//   - Tempo-Modulation

export type ArrangementSuggestion = {
  /** Tag der vorgeschlagen wird (kommt direkt in production[] bzw. customTags[]) */
  tag: string;
  /** Kurze Begruendung — wird im UI als Tooltip oder Sublabel gezeigt */
  reason: string;
  /** Wohin der Tag dispatched werden soll */
  target: "production" | "customTag";
};

export type ArrangementInsights = {
  sectionCount: number;
  /** Erkannte Pattern-Labels (z.B. "build-heavy", "intimate", "cinematic") */
  patterns: string[];
  /** Konkrete Tag-Vorschlaege fuer Style/Production */
  suggestions: ArrangementSuggestion[];
};

// --- Pattern-Detektoren --------------------------------------------------
// Jeder Detektor prueft das Arrangement (lowercase) auf bestimmte Signale
// und liefert bei Match seine Suggestions zurueck.

const countMatches = (text: string, patterns: RegExp[]): number =>
  patterns.reduce((n, re) => n + (text.match(re)?.length ?? 0), 0);

const countTagOccurrences = (text: string, tagNames: string[]): number => {
  let n = 0;
  for (const t of tagNames) {
    const re = new RegExp(`\\[\\s*${t}[^\\]]*\\]`, "gi");
    n += text.match(re)?.length ?? 0;
  }
  return n;
};

export const analyzeArrangement = (arrangement: string): ArrangementInsights => {
  const text = arrangement.toLowerCase();
  const patterns: string[] = [];
  const suggestions: ArrangementSuggestion[] = [];

  // Section-Count (alle [Tag]-Vorkommen)
  const sectionCount = (text.match(/\[[^\]]+\]/g)?.length ?? 0);

  if (!text.trim()) {
    return { sectionCount: 0, patterns: [], suggestions: [] };
  }

  // --- 1. Build/Drop-Heavy → Festival / High Impact -----------------------
  const buildDrops =
    countTagOccurrences(text, ["build", "drop", "breakdown"]) +
    countMatches(text, [/\bbuild[- ]?up/g, /\bdrop\b/g, /\bbreakdown\b/g]);
  if (buildDrops >= 2) {
    patterns.push("build-heavy");
    suggestions.push(
      { tag: "festival energy", reason: `${buildDrops} Build/Drop-Punkte erkannt`, target: "customTag" },
      { tag: "high impact transitions", reason: "Mehrere energetische Wechsel", target: "customTag" },
      { tag: "anthemic lift", reason: "Build/Drop-Pattern fordert hymnischen Charakter", target: "customTag" },
    );
  }

  // --- 2. Sparse/Intimate → Minimal / Close-Miked -------------------------
  const intimateHits = countMatches(text, [
    /\bsparse\b/g, /\bstripped[- ]back\b/g, /\bintimate\b/g, /\bquiet\b/g,
    /\bsoft\b/g, /\brestrained\b/g, /\bminimal\b/g, /\bwhispered\b/g,
  ]);
  if (intimateHits >= 2) {
    patterns.push("intimate");
    suggestions.push(
      { tag: "minimal arrangement", reason: `${intimateHits} Hinweise auf reduzierte Dynamik`, target: "customTag" },
      { tag: "close-miked intimacy", reason: "Naehe-Charakteristik im Arrangement", target: "customTag" },
      { tag: "restrained dynamics", reason: "Bewusst zurueckgehaltener Energieverlauf", target: "customTag" },
    );
  }

  // --- 3. Cinematic / Lush / Layered -------------------------------------
  const cinematicHits = countMatches(text, [
    /\blayered\b/g, /\bwide\b/g, /\bbig reverb\b/g, /\bstadium\b/g,
    /\bcinematic\b/g, /\banthemic\b/g, /\blush\b/g, /\bfull band\b/g,
    /\bsoaring\b/g, /\bsweeping\b/g,
  ]);
  if (cinematicHits >= 2) {
    patterns.push("cinematic-wide");
    suggestions.push(
      { tag: "cinematic width", reason: `${cinematicHits} weiträumige Production-Hinweise`, target: "customTag" },
      { tag: "stadium-scale reverb", reason: "Grosse Raum-Charakteristik im Arrangement", target: "customTag" },
      { tag: "lush layering", reason: "Geschichtete Texturen erkannt", target: "customTag" },
    );
  }

  // --- 4. Half-Time / Double-Time → Tempo-Modulation ---------------------
  const halfTime = countMatches(text, [/\bhalf[- ]time\b/g]);
  const doubleTime = countMatches(text, [/\bdouble[- ]time\b/g]);
  if (halfTime > 0) {
    patterns.push("half-time-feel");
    suggestions.push({
      tag: "half-time feel",
      reason: `Half-Time ${halfTime}× im Arrangement`,
      target: "customTag",
    });
  }
  if (doubleTime > 0) {
    patterns.push("double-time-feel");
    suggestions.push({
      tag: "double-time bursts",
      reason: `Double-Time ${doubleTime}× im Arrangement`,
      target: "customTag",
    });
  }

  // --- 5. Fade-Out → Fade-Ending ------------------------------------------
  if (countMatches(text, [/\bfade[- ]?out\b/g]) > 0) {
    patterns.push("fade-ending");
    suggestions.push({
      tag: "fade-out ending",
      reason: "Arrangement endet im Fade",
      target: "customTag",
    });
  }

  // --- 6. Key Change ------------------------------------------------------
  if (countMatches(text, [/\bkey change\b/g]) > 0) {
    patterns.push("key-change");
    suggestions.push({
      tag: "final-chorus key change",
      reason: "Key-Change im Arrangement angekuendigt",
      target: "customTag",
    });
  }

  // --- 7. Song-Laenge → Pacing-Hinweise -----------------------------------
  if (sectionCount >= 8) {
    patterns.push("epic-length");
    suggestions.push({
      tag: "extended-form pacing",
      reason: `${sectionCount} Sections — episches Format`,
      target: "customTag",
    });
  } else if (sectionCount > 0 && sectionCount <= 4) {
    patterns.push("short-form");
    suggestions.push({
      tag: "tight short-form pacing",
      reason: `Nur ${sectionCount} Sections — kompakte Form`,
      target: "customTag",
    });
  }

  // --- 8. Vocal-Schwerpunkt vs. Instrumental ------------------------------
  const instrumentalHits = countMatches(text, [
    /\binstrumental\b/g, /\bsolo\b/g, /\bguitar solo\b/g,
  ]);
  if (instrumentalHits >= 2) {
    patterns.push("instrumental-led");
    suggestions.push({
      tag: "instrumental-driven sections",
      reason: `${instrumentalHits} Instrumental-/Solo-Hinweise`,
      target: "customTag",
    });
  }

  // --- 9. Choir / Massive Vocal Layers ------------------------------------
  if (countMatches(text, [/\bchoir\b/g, /\bharmonies\b/g, /\bstacked\b/g]).valueOf() >= 2) {
    patterns.push("vocal-stacks");
    suggestions.push({
      tag: "stacked harmony peaks",
      reason: "Mehrfache Vocal-Layer-Referenzen",
      target: "customTag",
    });
  }

  // Duplikate auf Tag-Ebene rauswerfen (sollte nicht vorkommen, aber safety)
  const seen = new Set<string>();
  const dedupedSuggestions = suggestions.filter((s) => {
    if (seen.has(s.tag)) return false;
    seen.add(s.tag);
    return true;
  });

  return {
    sectionCount,
    patterns,
    suggestions: dedupedSuggestions.slice(0, 8), // max 8 Vorschlaege im UI
  };
};

// Baut den Refine-Feedback-String fuer den optionalen Refine-Pass.
// Bewusst kompakt: pro Pattern eine kurze Charakterisierung, keine Tag-Listen.
export const buildArrangementRefineFeedback = (insights: ArrangementInsights): string => {
  if (insights.suggestions.length === 0) {
    return "";
  }
  const labels = insights.suggestions.map((s) => `${s.tag} (${s.reason})`).join("; ");
  return (
    `The accompanying arrangement reveals these characteristics: ${labels}. ` +
    `Sharpen the style prompt to reflect this energy and production scale, ` +
    `but do NOT introduce section names or form details — those belong in the arrangement.`
  );
};
