// Auto-Model-Routing: wählt aus den tatsächlich verfügbaren Ollama-Modellen
// das beste fuer einen gegebenen Task und ggf. die Zielsprache. Wird nur
// angewandt wenn der User kein manuelles Override in den Settings gesetzt hat.
//
// Basis: empirische Beobachtungen (Gemma 2/3/4 ist auf Deutsch grammatikalisch
// schwach, Qwen2.5 und Mistral-Nemo deutlich besser; Llama 3.1 hat starke
// englische Schreibqualitaet). Quellen: Community-Benchmarks, eigene Tests.

export type AutoTask = "lyrics" | "style" | "arrangement" | "title";

// Fuzzy-Matcher: matcht z.B. "qwen2.5:14b" auch auf "qwen2.5:14b-instruct-q4"
// oder "qwen2.5:latest" — lokale Modellnamen variieren in Tags.
const matches = (pref: string, available: string[]): string | null => {
  // Exakt
  if (available.includes(pref)) return pref;
  // Family-Prefix ohne Tag (z.B. "qwen2.5:14b" matched "qwen2.5:14b-foo")
  const prefix = pref.split(":")[0];
  const hit = available.find((m) => m.startsWith(pref) || m.startsWith(`${prefix}:`));
  return hit ?? null;
};

// Praeferenz-Listen pro Sprache. Reihenfolge = absteigende Qualitaet.
// Die Listen enthalten bewusst Modelle die Martin real installiert hat oder
// typischerweise installiert werden — plus Fallbacks.
const LANG_PREFS_LYRICS: Record<string, string[]> = {
  german: [
    "qwen2.5:14b",
    "mistral-nemo:12b",
    "qwen2.5:7b",
    "mistral:latest",
    "llama3.1:latest",
    "gemma3:12b",
    "gemma4:latest",
  ],
  english: [
    "llama3.1:latest",
    "qwen2.5:14b",
    "mistral-nemo:12b",
    "gemma4:latest",
    "mistral:latest",
    "qwen2.5:7b",
  ],
  spanish: [
    "qwen2.5:14b",
    "mistral-nemo:12b",
    "llama3.1:latest",
    "gemma4:latest",
  ],
  french: [
    "qwen2.5:14b",
    "mistral-nemo:12b",
    "llama3.1:latest",
    "gemma4:latest",
  ],
  italian: [
    "qwen2.5:14b",
    "mistral-nemo:12b",
    "llama3.1:latest",
    "gemma4:latest",
  ],
  // Fallback fuer alle Sprachen ohne explizite Praeferenz.
  default: [
    "qwen2.5:14b",
    "llama3.1:latest",
    "mistral-nemo:12b",
    "gemma4:latest",
  ],
};

// Fuer Style/Arrangement/Title ist die Zielsprache englisch (System-Prompt
// erzwingt das). Trotzdem hilft ein leistungsfaehiges Modell bei Dichte
// und Konkretion.
const TASK_PREFS_NON_LYRICS: string[] = [
  "qwen2.5:14b",
  "llama3.1:latest",
  "mistral-nemo:12b",
  "gemma4:latest",
  "mistral:latest",
  "qwen2.5:7b",
];

// Normalisiert lang-IDs (z.B. "lang-de" → "german").
const LANG_ID_MAP: Record<string, string> = {
  "lang-de": "german",
  "lang-en": "english",
  "lang-es": "spanish",
  "lang-fr": "french",
  "lang-it": "italian",
  "lang-pt": "portuguese",
  "lang-nl": "dutch",
  "lang-sv": "swedish",
  "lang-ru": "russian",
  "lang-ja": "japanese",
};

// Primaersprache aus der Auswahl ermitteln. Non-lexical-Stile (lang-simlish etc.)
// werden ignoriert — die haben keine Sprache. Ohne echte Sprache → null.
export const resolveLanguage = (vocalLanguages: string[]): string | null => {
  for (const id of vocalLanguages) {
    const lang = LANG_ID_MAP[id];
    if (lang) return lang;
  }
  return null;
};

// Waehlt das beste verfuegbare Modell fuer (task, language, available).
// Liefert null wenn kein passendes Modell gefunden — dann soll der Caller
// auf das User-Default zurueckfallen.
export const pickAutoModel = (
  task: AutoTask,
  language: string | null,
  available: string[],
): string | null => {
  if (available.length === 0) return null;
  if (task === "lyrics") {
    const prefs =
      (language && LANG_PREFS_LYRICS[language]) || LANG_PREFS_LYRICS.default;
    for (const p of prefs) {
      const hit = matches(p, available);
      if (hit) return hit;
    }
    return null;
  }
  // Nicht-Lyrics: sprachunabhaengig — ein generisch starkes Modell.
  for (const p of TASK_PREFS_NON_LYRICS) {
    const hit = matches(p, available);
    if (hit) return hit;
  }
  return null;
};
