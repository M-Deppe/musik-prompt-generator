export type SuggestionSet = {
  /** Key: Subgenre-Cluster (parent). Z.B. "grunge", "house", "trap" */
  key: string;
  moods: string[];
  drums: string[];
  bass: string[];
  vocals: string[];
  production: string[];
  /**
   * Negative-Vorschlaege pro Cluster — werden NICHT automatisch gesetzt,
   * nur als Empfehlung im UI angezeigt. Format ohne "no "-Prefix; das setzt
   * der Builder beim Zusammenbauen.
   */
  negatives: string[];
};

/**
 * Passend-zu-Empfehlungen pro Subgenre-Cluster.
 * Wird in der Grundstil-Section als grüne "Passend zu: X" Box angezeigt.
 * Nutzer kann per Click alles übernehmen oder einzelne Chips auswählen.
 */
const SUGGESTIONS: SuggestionSet[] = [
  { key: "house", moods: ["euphoric", "feel-good"], drums: ["four-on-the-floor kick", "tight snare"], bass: ["side-chained bass", "warm bass"], vocals: ["soulful female", "vocal chops"], production: ["wide stereo field", "punchy"], negatives: ["acoustic guitar", "live drums", "growled vocals"] },
  { key: "techno", moods: ["hypnotic", "dark"], drums: ["four-on-the-floor kick", "machine hi-hats"], bass: ["sub bass", "rolling bass"], vocals: ["rarely vocal", "vocoder"], production: ["industrial", "dry and tight"], negatives: ["acoustic guitar", "live drums", "soft ballad vocals", "orchestral strings"] },
  { key: "trance", moods: ["euphoric", "uplifting"], drums: ["rolling hats", "snare roll"], bass: ["rolling bass"], vocals: ["ethereal female", "anthemic"], production: ["wide stereo field", "big reverb"], negatives: ["acoustic guitar", "banjo", "growled vocals", "lo-fi production"] },
  { key: "drum_and_bass", moods: ["energetic", "dark"], drums: ["amen break", "breakbeat"], bass: ["reese bass", "rolling bass"], vocals: ["vocal chops", "female"], production: ["punchy", "wide stereo field"], negatives: ["acoustic guitar", "slow ballad", "country instruments"] },
  { key: "dubstep", moods: ["aggressive", "dark"], drums: ["snare hits on 3", "heavy kick"], bass: ["wobble bass", "growly bass"], vocals: ["vocal chops"], production: ["compressed and loud"], negatives: ["acoustic guitar", "soft vocals", "orchestral strings"] },
  { key: "trap", moods: ["confident", "dark"], drums: ["trap hi-hats", "tuned 808"], bass: ["tuned 808", "sub bass"], vocals: ["melodic rap", "confident male"], production: ["punchy compressed mix", "half-time feel"], negatives: ["live drums", "acoustic guitar", "jazz horns", "operatic vocals"] },
  { key: "synthwave", moods: ["nostalgic", "dreamy"], drums: ["gated snare", "analog drums"], bass: ["analog bass", "moog bass"], vocals: ["retro vocals", "airy female"], production: ["80s neon nostalgia", "gated reverb"], negatives: ["acoustic guitar", "banjo", "harsh distortion", "trap hi-hats"] },
  { key: "lofi", moods: ["nostalgic", "chill"], drums: ["swung drums", "dusty samples"], bass: ["soft bass", "warm bass"], vocals: ["no vocals"], production: ["vinyl crackle", "tape warmth"], negatives: ["aggressive vocals", "edm drops", "harsh distortion", "loud master"] },
  { key: "rnb", moods: ["soulful", "intimate"], drums: ["soft swung drums"], bass: ["upright bass", "warm bass"], vocals: ["smooth female", "soulful delivery"], production: ["analog warmth", "intimate close"], negatives: ["harsh distortion", "metal drums", "growled vocals", "hardcore"] },
  { key: "hiphop", moods: ["confident", "dark"], drums: ["boom bap", "tight snare"], bass: ["warm bass", "deep 808"], vocals: ["confident male rapper"], production: ["compressed vocals", "punchy"], negatives: ["acoustic guitar", "orchestral strings", "operatic vocals", "country drawl"] },
  { key: "phonk", moods: ["dark", "aggressive"], drums: ["cowbells", "distorted drums"], bass: ["distorted 808"], vocals: ["pitched-down vocals", "spoken word"], production: ["lo-fi filtered", "tape saturation"], negatives: ["clean vocals", "acoustic guitar", "polished mix"] },
  { key: "rock_classic", moods: ["energetic", "raw"], drums: ["acoustic live drums", "tight snare"], bass: ["electric bass", "punchy bass"], vocals: ["powerful male", "raspy"], production: ["live feel", "warm analog"], negatives: ["808", "trap hi-hats", "edm drops", "autotune"] },
  { key: "metal_heavy", moods: ["aggressive", "intense"], drums: ["double bass kick", "thunderous"], bass: ["distorted bass"], vocals: ["growled", "screamed"], production: ["compressed and loud", "scooped mids"], negatives: ["acoustic ballad", "soft vocals", "edm", "pop production"] },
  { key: "grunge_90s", moods: ["dark", "raw"], drums: ["acoustic drums natural room"], bass: ["reese bass detuned"], vocals: ["male baritone", "raspy"], production: ["raw", "90s production"], negatives: ["autotune", "edm", "trap hi-hats", "polished mix"] },
  { key: "punk", moods: ["rebellious", "raw"], drums: ["fast drums", "tight snare"], bass: ["driving bass"], vocals: ["rebellious punk attitude"], production: ["raw", "unpolished"], negatives: ["autotune", "edm", "orchestral", "polished mix"] },
  { key: "alternative", moods: ["dreamy", "melancholic"], drums: ["tight drums"], bass: ["warm bass"], vocals: ["airy female", "breathy"], production: ["wall of sound", "reverb-drenched"], negatives: ["harsh distortion", "edm drops", "trap hi-hats"] },
  { key: "pop", moods: ["uplifting", "feel-good"], drums: ["tight drums"], bass: ["warm bass"], vocals: ["bright female", "polished"], production: ["polished radio-ready mix"], negatives: ["growled vocals", "harsh distortion", "extreme noise"] },
  { key: "indie", moods: ["nostalgic", "dreamy"], drums: ["soft drums"], bass: ["warm bass"], vocals: ["dreamy female", "intimate"], production: ["intimate close", "warm pads"], negatives: ["edm drops", "harsh distortion", "stadium reverb"] },
  { key: "jazz", moods: ["smoky", "intimate"], drums: ["brushed drums", "swung"], bass: ["upright bass", "walking"], vocals: ["seasoned jazz crooner"], production: ["warm analog", "live feel"], negatives: ["edm drops", "autotune", "trap drums", "808"] },
  { key: "blues", moods: ["soulful", "melancholic"], drums: ["shuffle pattern"], bass: ["walking bass"], vocals: ["weathered", "raspy"], production: ["warm analog", "live feel"], negatives: ["edm", "autotune", "synthwave", "trap"] },
  { key: "classical", moods: ["dramatic", "emotional"], drums: ["timpani"], bass: ["double bass"], vocals: ["soprano", "choir"], production: ["cathedral reverb", "orchestral dynamics"], negatives: ["electric drums", "autotune", "edm", "rapped vocals"] },
  { key: "ambient", moods: ["ethereal", "peaceful"], drums: ["no drums"], bass: ["sub drone"], vocals: ["ethereal", "wordless"], production: ["cathedral reverb", "vast expansive"], negatives: ["aggressive drums", "rapped vocals", "trap hi-hats", "loud master"] },
  { key: "soundtrack", moods: ["cinematic", "epic"], drums: ["taiko hits", "thunderous"], bass: ["sub impact"], vocals: ["ethereal choir", "powerful female"], production: ["stadium reverb", "epic orchestral"], negatives: ["autotune", "edm drops", "lo-fi production"] },
  { key: "reggae", moods: ["feel-good", "intimate"], drums: ["rimshot", "offbeat"], bass: ["warm rolling bass"], vocals: ["warm male", "melodic"], production: ["warm reggae groove"], negatives: ["metal", "edm drops", "trap hi-hats"] },
  { key: "latin", moods: ["passionate", "energetic"], drums: ["clave", "timbales"], bass: ["bassline"], vocals: ["passionate vocals"], production: ["warm", "live feel"], negatives: ["metal", "edm drops", "harsh distortion"] },
  { key: "country", moods: ["storytelling", "warm"], drums: ["shuffle"], bass: ["upright bass"], vocals: ["drawl vocals", "storytelling"], production: ["warm", "live feel"], negatives: ["808", "autotune", "edm", "trap hi-hats"] },
  { key: "folk", moods: ["intimate", "nostalgic"], drums: ["light shaker"], bass: ["soft bass"], vocals: ["warm male", "storytelling"], production: ["intimate close", "warm"], negatives: ["edm drops", "harsh distortion", "808", "autotune"] },
];

const FALLBACK: SuggestionSet = {
  key: "default",
  moods: ["nostalgic", "dreamy"],
  drums: ["tight drums"],
  bass: ["warm bass"],
  vocals: ["smooth vocals"],
  production: ["polished", "wide stereo field"],
  negatives: [],
};

export const getSuggestions = (parent: string | undefined): SuggestionSet => {
  if (!parent) return FALLBACK;
  return SUGGESTIONS.find((s) => s.key === parent) ?? FALLBACK;
};
