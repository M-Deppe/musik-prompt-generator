import type { PromptState } from "@/types";

// Deterministischer Post-Processor fuer LLM-Outputs (Style-Builder + Aus-Idee).
// Greift genre-unabhaengig: keine Sonderfaelle pro Stil, sondern rein regelbasiert.
//
// Regeln:
// 1. BPM-Scrubber     — entfernt halluzinierte BPM-Zahlen, wenn weder Quelle
//                       noch State eine BPM nennt.
// 2. Brand-Scrubber   — entfernt halluzinierte Hersteller-/Modellnamen
//                       (Rhodes, Juno, Moog, Telecaster ...), wenn weder
//                       Quelle noch Instruments-State sie nennt.
// 3. Franchise-Preserver — setzt Franchise-Keyword (Disney, Pixar, Ghibli,
//                          Broadway ...) wieder ein, wenn es in der Quelle
//                          stand aber im Output verloren ging.

// --- BPM Scrubber ---------------------------------------------------------

// Erkennt jede Erwaehnung einer BPM-Zahl (2–3 Ziffern).
const BPM_IN_TEXT_RX = /\b\d{2,3}\s*(?:bpm|beats per minute)\b/i;

// Stripping-Patterns — laengere/spezifischere zuerst, damit "anchored at X BPM"
// als Einheit entfernt wird und nicht nur das "X BPM" uebrig laesst.
// Jedes Pattern endet auf eine BPM-Zahl, d.h. False-Positive-Risiko ist
// minimal: ohne BPM-Zahl greift nichts.
const BPM_STRIP_PATTERNS: RegExp[] = [
  // Anchor-Verben mit optionaler Praeposition und Modifier:
  // "anchored at a steady 120 BPM pulse", "centred on 124 BPM",
  // "set to 140 BPM", "paced at 95 BPM", "running at 128 BPM",
  // "pulsing at 110 BPM", "driven by 120 BPM", "locked at 100 BPM"
  /,?\s*(?:anchored|centered|centred|set|paced|running|pulsing|driven|locked|clocked)(?:\s+(?:at|on|to|by))?\s+(?:a\s+[\w-]+\s+)?\d{2,3}\s*(?:bpm|beats per minute)(?:\s+pulse|\s+tempo|\s+groove)?/gi,
  // "at/around/near a steady 120 BPM" — generische BPM-Anchoring
  /,?\s*(?:at|around|near)\s+(?:a\s+[\w-]+\s+)?\d{2,3}\s*(?:bpm|beats per minute)(?:\s+pulse|\s+tempo|\s+groove)?/gi,
  // "tempo of 120 BPM", "a tempo of 120 BPM"
  /,?\s*(?:a\s+)?tempo\s+of\s+\d{2,3}\s*(?:bpm|beats per minute)/gi,
  // "with a 120 BPM pulse/groove/tempo"
  /,?\s*with\s+(?:a\s+)?\d{2,3}\s*(?:bpm|beats per minute)(?:\s+pulse|\s+tempo|\s+groove)?/gi,
  // stand-alone "120 BPM", "120 BPM tempo", "120 BPM groove"
  /\b\d{2,3}\s*(?:bpm|beats per minute)(?:\s+tempo|\s+pulse|\s+groove)?\b/gi,
];

export const hasBpmMention = (text: string): boolean => BPM_IN_TEXT_RX.test(text);

export const stripBpm = (output: string): string => {
  let result = output;
  for (const rx of BPM_STRIP_PATTERNS) {
    result = result.replace(rx, "");
  }
  return cleanupPunctuation(result);
};

// --- Brand Scrubber -------------------------------------------------------

// Spezifische Hersteller-/Modellnamen, die das Modell gerne halluziniert.
// WICHTIG: nur REINE Markennamen, keine Kombinationen wie "rhodes piano".
// Grund: "warm Rhodes piano" soll zu "warm piano" werden (nur die Marke raus),
// nicht zu "warm " (ganze Phrase raus). Das Anhaengsel "piano/pad/bass" ist
// selbst legitim und soll erhalten bleiben.
//
// Laengere Varianten zuerst, damit "Fender Rhodes" vor "Rhodes" greift und
// "TR-808" vor "808" — so verhindern wir Reste wie "Fender piano".
//
// NICHT aufgenommen (False-Positive-Risiko): "Orange" (Farbe), "Nord"
// (Himmelsrichtung), "Vox" (auch "vocals/voice"), "Mesa", "PRS"
// (Mehrdeutigkeit), "Fender" alleine (nur in Kombi z.B. "Fender Rhodes"),
// reine Zahlen wie "1176" (zu generisch).
const BRAND_TOKENS = [
  // --- E-Pianos / Keys ---
  "fender rhodes", "rhodes",
  "wurlitzer ep", "wurli",
  "clavinet",
  "hohner d6",
  // --- Analog / Polysynths ---
  "minimoog", "polymoog", "memorymoog", "moog",
  "juno-60", "juno-106", "juno-6", "juno",
  "jupiter-8", "jupiter-6", "jupiter-4", "jupiter",
  "prophet-5", "prophet-10", "prophet-6", "prophet-12", "prophet",
  "oberheim ob-x", "oberheim ob-xa", "oberheim ob-6", "oberheim ob-8",
  "oberheim matrix-12", "oberheim matrix-6", "oberheim",
  "sequential six-trak", "sequential pro 3", "sequential pro one",
  "korg polysix", "korg mono/poly", "korg ms-20", "korg ms-10",
  "korg triton", "korg wavestation", "korg kronos", "korg m1",
  "korg prologue", "korg minilogue",
  "roland jx-8p", "roland jx-3p", "roland d-50", "roland jp-8000",
  "roland sh-101", "roland sh-2", "roland jd-800", "roland juno-di",
  "waldorf blofeld", "waldorf pulse", "waldorf q", "waldorf microwave",
  "access virus ti", "access virus",
  "nord lead", "nord stage", "nord wave", "nord electro",
  "arp 2600", "arp odyssey", "arp omni",
  // --- FM / Digital ---
  "yamaha dx7", "yamaha dx9", "yamaha sy77", "yamaha sy99",
  "yamaha cs-80", "yamaha cs-60", "dx7", "dx9",
  // --- Drum Machines ---
  "tr-808", "tr 808", "roland 808",
  "tr-909", "tr 909", "roland 909",
  "tr-707", "tr 707",
  "tr-606", "tr 606",
  "cr-78", "cr 78",
  "linndrum", "linn drum", "linn drums", "lm-1",
  "oberheim dmx", "oberheim dx",
  "simmons sds-v", "simmons sds",
  "e-mu sp-1200", "e-mu sp-12", "sp-1200", "sp-12",
  "akai mpc 3000", "akai mpc 60", "mpc 3000", "mpc 60",
  // --- Samplers ---
  "fairlight cmi", "fairlight",
  "akai s1000", "akai s900",
  "emulator ii", "e-mu emulator",
  "ensoniq mirage",
  // --- Gitarren ---
  "telecaster", "stratocaster", "les paul",
  "gibson sg", "gibson es-335", "gibson flying v", "gibson explorer",
  "fender jaguar", "fender jazzmaster", "fender mustang",
  "rickenbacker 330", "rickenbacker 4001",
  "gretsch white falcon", "gretsch 6120",
  // --- Amps ---
  "marshall stack", "marshall amp", "marshall jcm800", "marshall plexi",
  "vox ac30", "vox ac15",
  "fender twin reverb", "fender deluxe reverb", "fender bassman",
  "mesa boogie", "mesa rectifier", "mesa mark",
  "hiwatt",
  // --- Studio Gear (werden oft als Production-Deskriptoren halluziniert) ---
  "neve 1073", "neve console", "neve preamp",
  "ssl 4000", "ssl console", "ssl bus compressor",
  "api 1608", "api preamp", "api 550",
  "la-2a", "la2a",
  "fairchild 670", "fairchild 660",
  "pultec eq", "pultec eqp-1a",
  "1176 compressor", "1176 peak limiter",
  "distressor", "empirical labs distressor",
  // --- Bass ---
  "fender precision bass", "fender jazz bass", "p-bass", "j-bass",
  "rickenbacker 4001 bass",
  "music man stingray",
];

const escapeRx = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const stripInventedBrands = (output: string, source: string): string => {
  const haystack = source.toLowerCase();
  let result = output;
  for (const token of BRAND_TOKENS) {
    // Wenn das Token in der Quelle vorkommt, ist es legitim — nicht anfassen.
    if (haystack.includes(token)) continue;
    const rx = new RegExp(`\\b${escapeRx(token)}\\b`, "gi");
    result = result.replace(rx, "");
  }
  return cleanupPunctuation(result);
};

// --- Franchise Preserver --------------------------------------------------

// Franchises/Kultur-Referenzen, die literal erhalten bleiben sollen.
// Reihenfolge: spezifischere Varianten (z.B. "Studio Ghibli") vor generischen
// ("Ghibli"), damit wir sie nicht doppelt einfuegen.
//
// NICHT aufgenommen: reine Genres wie "J-pop", "K-pop", "anime" (werden vom
// Genre-Preserver gehandhabt); mehrdeutige Begriffe wie "Western", "Noir",
// "Gothic" (koennen auch Mood/Genre sein).
const FRANCHISES = [
  // --- Animations-Studios ---
  "Studio Ghibli", "Ghibli",
  "Disney", "Pixar", "DreamWorks",
  "Cartoon Network", "Hanna-Barbera",
  "Sesame Street", "Muppets", "Looney Tunes",
  "Nickelodeon",
  // --- Musicals / Theater ---
  "Broadway", "West End",
  // --- Film / TV-Franchises (oft mit starkem musikalischem Stil) ---
  "James Bond",
  "Marvel", "DC",
  "Star Wars", "Star Trek",
  "Lord of the Rings", "Middle-earth",
  "Harry Potter",
  "Indiana Jones",
  "Game of Thrones",
  "Twin Peaks",
  // --- Game-Music-Franchises ---
  "Final Fantasy",
  "Zelda", "Legend of Zelda",
  "Super Mario", "Mario",
  "Pokemon",
  "Metal Gear",
  "Nintendo",
  // --- Regionale Musik-Kulturen (etabliert genug als Franchise-Referenz) ---
  "Bollywood",
  "Motown",
  "Nashville",
  "Tin Pan Alley",
];

export const preserveFranchises = (output: string, source: string): string => {
  if (!source.trim() || !output.trim()) return output;
  const sourceLower = source.toLowerCase();
  let result = output;
  const insertedVariants: string[] = [];
  for (const fr of FRANCHISES) {
    const frLower = fr.toLowerCase();
    if (!sourceLower.includes(frLower)) continue;
    // Bereits im Output? Auch als Teil einer laengeren Variante? → nichts tun.
    if (result.toLowerCase().includes(frLower)) continue;
    // Schon eine laengere Variante eingefuegt, die dieses Keyword enthaelt?
    if (insertedVariants.some((v) => v.toLowerCase().includes(frLower))) continue;
    // Einfuegen nach fuehrendem Artikel "A "/"An ". "An" wird zu "A", weil
    // Franchise-Namen mit Konsonanten beginnen (Disney, Pixar, Bollywood ...).
    const articleRx = /^(A|An)\s+/;
    if (articleRx.test(result)) {
      result = result.replace(articleRx, `A ${fr}-style, `);
    } else {
      result = `${fr}-style. ${result}`;
    }
    insertedVariants.push(fr);
  }
  return result;
};

// --- Punctuation Cleanup --------------------------------------------------

// Nach dem Stripping bleiben oft einsame Kommas, doppelte Spaces oder
// ", ." / ". ," Konstrukte. Das raeumen wir deterministisch auf.
const cleanupPunctuation = (text: string): string =>
  text
    // Komma direkt nach Punkt: ". , word" → ". word"
    .replace(/\.\s*,\s*/g, ". ")
    // Punkt direkt nach Komma: ", . word" → ". word"
    .replace(/,\s*\.\s*/g, ". ")
    // Punkt-Whitespace-Punkt (aus Strip entstandener Leersatz): ". ." → "."
    // (mit Space dazwischen, um legitime Ellipsen "..." nicht zu zerstoeren)
    .replace(/\.\s+\./g, ".")
    // Doppelte Kommas: ", ," → ","
    .replace(/,\s*,/g, ",")
    // Space vor Komma: "word ," → "word,"
    .replace(/\s+,/g, ",")
    // Space vor Punkt: "word ." → "word."
    .replace(/\s+\./g, ".")
    // Mehrfach-Spaces: "a   b" → "a b"
    .replace(/\s{2,}/g, " ")
    // Fuehrende Kommas/Spaces: ", abc" → "abc"
    .replace(/^[,\s]+/, "")
    .trim();

// --- Kombinierter Sanitizer ----------------------------------------------

export type SanitizerContext = {
  // Quelltext, der den Output einschraenkt (Seed, Idea-Text).
  source: string;
  // Weitere Felder, in denen Instrumente/Marken legitim vorkommen koennen
  // (z.B. state.prompt.instruments zusammengefuegt).
  extraInstruments?: string;
  // True, wenn eine BPM ausserhalb der Quelle bereits gesetzt ist
  // (z.B. state.prompt.bpm) — dann ist BPM im Output erlaubt.
  hasExplicitBpm?: boolean;
};

export const sanitizeOutput = (
  output: string,
  ctx: SanitizerContext,
): string => {
  if (!output.trim()) return output;
  let result = output;
  // 1. BPM: nur strippen, wenn weder Quelle noch explizite BPM existieren.
  const hasSourceBpm = hasBpmMention(ctx.source);
  if (!hasSourceBpm && !ctx.hasExplicitBpm) {
    result = stripBpm(result);
  }
  // 2. Marken: mit kombiniertem Haystack aus Quelle + Instruments-State pruefen.
  const haystack = `${ctx.source} ${ctx.extraInstruments ?? ""}`;
  result = stripInventedBrands(result, haystack);
  // 3. Franchise-Preserver: Seed/Idea-Text ist die Quelle der Wahrheit.
  result = preserveFranchises(result, ctx.source);
  return result;
};

// Bequemer Wrapper fuer den Style-Builder, der aus PromptState alle noetigen
// Felder extrahiert (customStylePrompt als Quelle, instruments, bpm).
export const sanitizeBuilderOutput = (
  output: string,
  state: PromptState,
): string =>
  sanitizeOutput(output, {
    source: state.customStylePrompt ?? "",
    extraInstruments: state.instruments.join(" "),
    hasExplicitBpm: typeof state.bpm === "number",
  });
