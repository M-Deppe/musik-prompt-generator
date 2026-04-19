// Quickstart-Intent-Layer: ein Klick setzt einen sinnvollen Charakter-Startzustand,
// ohne bestehende User-Auswahl zu zerstoeren.
//
// REGELN:
//   - Settings (creativityMode, arrangementLength) werden UEBERSCHRIEBEN.
//     Der User klickt Intent = "ich will jetzt diesen Modus". Das wird im
//     Report sichtbar gemacht, damit der User es nicht uebersieht.
//   - Moods, customTags, negatives werden nur ADDITIV gesetzt — vorhandene
//     User-Auswahl bleibt unangetastet.
//   - Keine Section-Tag-IDs werden gesetzt, nur freie Klartext-Tags. Das
//     vermeidet versteckte Aenderungen in Sidebar-Countern und laesst dem
//     User die granulare Auswahl.
//   - Tag-Inhalte sind moods.json-konform (kein Konflikt mit conflict_pairs
//     bei isolierter Anwendung).

import type { Dispatch } from "react";
import type { Action, AppState } from "@/store";
import type { ArrangementLength, CreativityMode } from "@/types";

export type Intent = {
  id: string;
  label: string;
  /** Kurze Charakterisierung — wird auf der Karte angezeigt. */
  description: string;
  /** Tailwind-Klasse fuer Akzentfarbe (border/text). */
  accent: string;
  settings: {
    creativityMode: CreativityMode;
    arrangementLength: ArrangementLength;
  };
  moods: string[];
  customTags: string[];
  negatives: string[];
  /**
   * Optional: setzt auch das Hauptgenre. Wenn der User bereits ein anderes
   * Hauptgenre gesetzt hatte, wird Subgenre zurueckgesetzt, weil es nicht
   * mehr zur neuen Hauptrichtung passt.
   */
  mainGenre?: string;
};

export const INTENTS: Intent[] = [
  {
    id: "radio-hit",
    label: "Radio Hit",
    description: "Polierter Mainstream-Sound, breite Stereobuehne, eingaengig.",
    accent: "amber",
    settings: { creativityMode: "balanced", arrangementLength: "standard" },
    moods: ["uplifting", "feel-good", "anthemic"],
    customTags: [
      "polished radio-ready mix",
      "wide stereo field",
      "tight production",
      "modern loud",
    ],
    negatives: ["growled vocals", "harsh distortion", "extreme noise"],
  },
  {
    id: "underground",
    label: "Underground",
    description: "Roh, unpoliert, club-orientiert. Lo-Fi-Charakter erwuenscht.",
    accent: "fuchsia",
    settings: { creativityMode: "creative", arrangementLength: "standard" },
    moods: ["dark", "gritty", "raw"],
    customTags: [
      "lo-fi production",
      "analog warmth",
      "underground feel",
      "raw and unpolished",
    ],
    negatives: ["polished radio-ready mix", "autotune", "modern loud"],
  },
  {
    id: "cinematic",
    label: "Cinematic",
    description: "Episch, breit, orchestrale Schichtung. Trailer-tauglich.",
    accent: "sky",
    settings: { creativityMode: "balanced", arrangementLength: "epic" },
    moods: ["epic", "cinematic", "dramatic"],
    customTags: [
      "stadium-scale reverb",
      "epic orchestral swells",
      "lush layering",
      "cinematic width",
    ],
    negatives: ["edm drops", "lo-fi production", "autotune"],
  },
  {
    id: "experimental",
    label: "Experimental",
    description: "Genre-Fusion, ungewoehnliche Texturen, bewusst riskant.",
    accent: "emerald",
    settings: { creativityMode: "wild", arrangementLength: "epic" },
    moods: ["mysterious", "haunting", "tense"],
    customTags: [
      "genre-fusion textures",
      "unexpected sonic juxtaposition",
      "modular synth feel",
      "broken-form structure",
    ],
    negatives: ["radio-ready", "predictable structure", "polished mix"],
  },
];

// 23 Genre-Quickstart-Intents — pro Hauptgenre ein charakteristisches Setup.
// Alle Moods sind moods.json-konform und verletzen keine conflict_pairs.
// Accent-Farben: amber/fuchsia/sky/emerald/rose/violet/orange/slate.
export const GENRE_INTENTS: Intent[] = [
  {
    id: "quickstart-electronic",
    label: "Electronic / EDM",
    description: "Dancefloor-Energie, synthetisch, tight quantisiert.",
    accent: "amber",
    mainGenre: "electronic",
    settings: { creativityMode: "balanced", arrangementLength: "standard" },
    moods: ["anthemic", "uplifting", "euphoric"],
    customTags: ["sidechain pump", "four-on-the-floor kick", "wide synth leads", "punchy mix"],
    negatives: ["acoustic drums", "analog tape warmth"],
  },
  {
    id: "quickstart-rock",
    label: "Rock",
    description: "Gitarren-dominiert, powerful, analog produziert.",
    accent: "rose",
    mainGenre: "rock",
    settings: { creativityMode: "creative", arrangementLength: "standard" },
    moods: ["powerful", "rebellious", "raw"],
    customTags: ["distorted electric guitars", "tight live drums", "analog warmth", "anthemic chorus"],
    negatives: ["autotune", "trap hi-hats"],
  },
  {
    id: "quickstart-indie",
    label: "Indie / Alternative",
    description: "Lo-Fi-Ästhetik, verträumt, intimate Produktion.",
    accent: "emerald",
    mainGenre: "indie",
    settings: { creativityMode: "balanced", arrangementLength: "standard" },
    moods: ["nostalgic", "melancholy", "wistful", "dreamy"],
    customTags: ["lo-fi texture", "reverb-washed guitars", "close-miked vocals", "tape saturation"],
    negatives: ["polished radio-ready mix", "edm drops"],
  },
  {
    id: "quickstart-metal",
    label: "Metal",
    description: "Massive Gitarrenwand, Doublebass, aggressive Dynamik.",
    accent: "rose",
    mainGenre: "metal",
    settings: { creativityMode: "wild", arrangementLength: "epic" },
    moods: ["aggressive", "intense", "fierce"],
    customTags: ["palm-muted chug", "double-bass drums", "wall of guitars", "heavy compression"],
    negatives: ["acoustic ballad feel", "autotune vocals"],
  },
  {
    id: "quickstart-punk",
    label: "Punk",
    description: "Schnell, roh, garage-authentisch.",
    accent: "rose",
    mainGenre: "punk",
    settings: { creativityMode: "wild", arrangementLength: "short" },
    moods: ["rebellious", "angry", "raw"],
    customTags: ["buzzsaw guitars", "fast tempo", "garage recording", "shouted vocals"],
    negatives: ["pristine production", "orchestral strings"],
  },
  {
    id: "quickstart-pop",
    label: "Pop",
    description: "Mainstream-Hook, polished, radio-ready.",
    accent: "amber",
    mainGenre: "pop",
    settings: { creativityMode: "balanced", arrangementLength: "standard" },
    moods: ["uplifting", "feel-good", "anthemic"],
    customTags: ["hook-forward mix", "polished radio-ready", "sidechain pump", "layered harmonies"],
    negatives: ["harsh distortion", "growled vocals"],
  },
  {
    id: "quickstart-hiphop",
    label: "Hip-Hop / Rap",
    description: "808-Sub, Trap-Hats, Vocal-Chops, urban.",
    accent: "fuchsia",
    mainGenre: "hiphop",
    settings: { creativityMode: "balanced", arrangementLength: "standard" },
    moods: ["confident", "gritty", "powerful"],
    customTags: ["808 sub-bass", "trap hi-hats", "vocal chops", "boom-bap kick"],
    negatives: ["orchestral strings", "acoustic ballad feel"],
  },
  {
    id: "quickstart-rnb",
    label: "R&B",
    description: "Sensual, groovend, smooth electric piano.",
    accent: "fuchsia",
    mainGenre: "rnb",
    settings: { creativityMode: "balanced", arrangementLength: "standard" },
    moods: ["sensual", "intimate", "romantic", "tender"],
    customTags: ["smooth electric piano", "lush harmonies", "tight groove", "warm bass"],
    negatives: ["punk energy", "blast beats"],
  },
  {
    id: "quickstart-soul",
    label: "Soul",
    description: "Gospel-Wurzeln, Hammond-Orgel, Horns.",
    accent: "orange",
    mainGenre: "soul",
    settings: { creativityMode: "balanced", arrangementLength: "standard" },
    moods: ["passionate", "yearning", "sensual"],
    customTags: ["Hammond organ", "horn section", "gospel vocals", "analog warmth"],
    negatives: ["electronic production", "autotune"],
  },
  {
    id: "quickstart-funk",
    label: "Funk",
    description: "Slap-Bass, Wah-Gitarre, tight Groove.",
    accent: "orange",
    mainGenre: "funk",
    settings: { creativityMode: "creative", arrangementLength: "standard" },
    moods: ["confident", "joyful", "powerful"],
    customTags: ["slap bass", "wah guitar", "tight horn stabs", "groove-driven"],
    negatives: ["ballad pace", "orchestral strings"],
  },
  {
    id: "quickstart-jazz",
    label: "Jazz",
    description: "Acoustic, improvisationsnah, warm.",
    accent: "violet",
    mainGenre: "jazz",
    settings: { creativityMode: "balanced", arrangementLength: "standard" },
    moods: ["reflective", "intimate", "wistful"],
    customTags: ["upright bass", "brushed drums", "Rhodes piano", "live room acoustics"],
    negatives: ["trap hi-hats", "edm drops"],
  },
  {
    id: "quickstart-blues",
    label: "Blues",
    description: "12-Bar, Slide-Guitar, call-and-response.",
    accent: "orange",
    mainGenre: "blues",
    settings: { creativityMode: "balanced", arrangementLength: "short" },
    moods: ["melancholy", "somber", "gritty"],
    customTags: ["12-bar structure", "slide guitar", "Hammond organ", "call-and-response"],
    negatives: ["electronic drums", "autotune"],
  },
  {
    id: "quickstart-reggae",
    label: "Reggae / Caribbean",
    description: "Offbeat-Gitarre, Dub-Bass, Spring-Reverb.",
    accent: "emerald",
    mainGenre: "reggae",
    settings: { creativityMode: "balanced", arrangementLength: "standard" },
    moods: ["peaceful", "uplifting", "chill"],
    customTags: ["offbeat rhythm guitar", "dub bass", "spring reverb", "laid-back groove"],
    negatives: ["heavy distortion", "blast beats"],
  },
  {
    id: "quickstart-latin",
    label: "Latin",
    description: "Clave-Rhythmik, Congas, Brass.",
    accent: "orange",
    mainGenre: "latin",
    settings: { creativityMode: "creative", arrangementLength: "standard" },
    moods: ["passionate", "joyful", "romantic"],
    customTags: ["clave rhythm", "congas and bongos", "bright brass section", "syncopated groove"],
    negatives: ["blast beats", "metal guitars"],
  },
  {
    id: "quickstart-world",
    label: "World",
    description: "Cross-Kultur, akustische Texturen.",
    accent: "emerald",
    mainGenre: "world",
    settings: { creativityMode: "creative", arrangementLength: "standard" },
    moods: ["cinematic", "mysterious", "hopeful"],
    customTags: ["traditional acoustic instruments", "cross-cultural fusion", "natural room ambience"],
    negatives: ["edm drops", "trap hi-hats"],
  },
  {
    id: "quickstart-folk",
    label: "Folk",
    description: "Fingerpicked Acoustic, intimate Vocal.",
    accent: "emerald",
    mainGenre: "folk",
    settings: { creativityMode: "balanced", arrangementLength: "short" },
    moods: ["nostalgic", "reflective", "intimate"],
    customTags: ["fingerpicked acoustic guitar", "close-miked vocal", "sparse arrangement", "natural ambience"],
    negatives: ["synth pads", "drum machine"],
  },
  {
    id: "quickstart-country",
    label: "Country / Americana",
    description: "Pedal-Steel, Twang, Storytelling.",
    accent: "orange",
    mainGenre: "country",
    settings: { creativityMode: "balanced", arrangementLength: "standard" },
    moods: ["nostalgic", "reflective", "uplifting"],
    customTags: ["pedal steel guitar", "acoustic guitar", "twangy vocals", "warm analog production"],
    negatives: ["electronic beats", "trap hi-hats"],
  },
  {
    id: "quickstart-classical",
    label: "Classical",
    description: "Full orchestra, dynamische Range.",
    accent: "violet",
    mainGenre: "classical",
    settings: { creativityMode: "balanced", arrangementLength: "epic" },
    moods: ["dramatic", "grand", "epic"],
    customTags: ["full orchestra", "wide dynamic range", "natural concert hall reverb"],
    negatives: ["electronic elements", "drum machine"],
  },
  {
    id: "quickstart-ambient",
    label: "Ambient",
    description: "Atmosphärische Pads, langsame Evolution.",
    accent: "sky",
    mainGenre: "ambient",
    settings: { creativityMode: "conservative", arrangementLength: "epic" },
    moods: ["atmospheric", "dreamy", "serene"],
    customTags: ["ambient pads", "slow evolving textures", "long reverb tails", "drone-like"],
    negatives: ["drums", "vocals"],
  },
  {
    id: "quickstart-experimental",
    label: "Experimental",
    description: "Genre-Fusion, ungewöhnliche Texturen.",
    accent: "violet",
    mainGenre: "experimental",
    settings: { creativityMode: "wild", arrangementLength: "epic" },
    moods: ["mysterious", "haunting", "tense"],
    customTags: ["modular synth feel", "genre-fusion textures", "broken-form structure"],
    negatives: ["predictable structure", "radio-ready mix"],
  },
  {
    id: "quickstart-soundtrack",
    label: "Soundtrack / Cinematic",
    description: "Trailer-tauglich, hybrid Orchestra, Impacts.",
    accent: "sky",
    mainGenre: "soundtrack",
    settings: { creativityMode: "balanced", arrangementLength: "epic" },
    moods: ["cinematic", "epic", "dramatic"],
    customTags: ["hybrid orchestra", "braam impacts", "wide cinematic width", "epic strings"],
    negatives: ["dancefloor energy", "lo-fi production"],
  },
  {
    id: "quickstart-religious",
    label: "Religious / Spiritual",
    description: "Choir, Orgel, sakrale Harmonien.",
    accent: "slate",
    mainGenre: "religious",
    settings: { creativityMode: "balanced", arrangementLength: "standard" },
    moods: ["peaceful", "triumphant", "grand"],
    customTags: ["choir vocals", "pipe organ", "sacred harmonies", "cathedral reverb"],
    negatives: ["explicit content", "distorted guitars"],
  },
  {
    id: "quickstart-novelty",
    label: "Novelty / Meme",
    description: "Playful, überzeichnet, unerwartet.",
    accent: "slate",
    mainGenre: "novelty",
    settings: { creativityMode: "wild", arrangementLength: "short" },
    moods: ["joyful", "feel-good", "uplifting"],
    customTags: ["silly samples", "cartoonish tones", "unexpected sound effects"],
    negatives: ["serious tone", "brooding atmosphere"],
  },
];

export type IntentApplyReport = {
  moodsAdded: number;
  customTagsAdded: number;
  negativesAdded: number;
  creativityModeChanged: boolean;
  arrangementLengthChanged: boolean;
  mainGenreChanged: boolean;
  subgenreReset: boolean;
};

/**
 * Wendet einen Intent auf den aktuellen State an. Settings werden ueberschrieben,
 * alle Tag-Listen nur additiv erweitert. Liefert einen Report mit dem, was
 * tatsaechlich neu gesetzt wurde — UI zeigt das als Status-Zeile.
 */
export const applyIntent = (
  intent: Intent,
  state: AppState,
  dispatch: Dispatch<Action>,
): IntentApplyReport => {
  const report: IntentApplyReport = {
    moodsAdded: 0,
    customTagsAdded: 0,
    negativesAdded: 0,
    creativityModeChanged: false,
    arrangementLengthChanged: false,
    mainGenreChanged: false,
    subgenreReset: false,
  };

  // Genre-Intent: setzt auch das Hauptgenre. Wenn das neue Main sich vom
  // aktuellen unterscheidet, wird das Subgenre mit zurueckgesetzt — es
  // wuerde sonst nicht mehr zur neuen Hauptrichtung passen.
  if (intent.mainGenre) {
    if (state.prompt.mainGenre !== intent.mainGenre) {
      dispatch({ type: "SET_MAIN_GENRE", mainGenre: intent.mainGenre });
      report.mainGenreChanged = true;
      if (state.prompt.subgenre) {
        report.subgenreReset = true;
      }
    }
  }

  // Settings — bewusste Ueberschreibung, da Quickstart-Charakter.
  const settingsPatch: Partial<typeof state.settings> = {};
  if (state.settings.creativityMode !== intent.settings.creativityMode) {
    settingsPatch.creativityMode = intent.settings.creativityMode;
    report.creativityModeChanged = true;
  }
  if (state.settings.arrangementLength !== intent.settings.arrangementLength) {
    settingsPatch.arrangementLength = intent.settings.arrangementLength;
    report.arrangementLengthChanged = true;
  }
  if (Object.keys(settingsPatch).length > 0) {
    dispatch({ type: "SET_SETTINGS", settings: settingsPatch });
  }

  // Moods (additiv)
  for (const m of intent.moods) {
    if (!state.prompt.moods.includes(m)) {
      dispatch({ type: "TOGGLE_MOOD", mood: m });
      report.moodsAdded++;
    }
  }

  // CustomTags (additiv)
  const existingCustom = new Set(state.prompt.customTags ?? []);
  for (const t of intent.customTags) {
    if (!existingCustom.has(t)) {
      dispatch({ type: "TOGGLE_CUSTOM_TAG", tag: t });
      report.customTagsAdded++;
    }
  }

  // Negatives (additiv)
  for (const n of intent.negatives) {
    if (!state.prompt.negatives.includes(n)) {
      dispatch({ type: "TOGGLE_NEGATIVE", tag: n });
      report.negativesAdded++;
    }
  }

  return report;
};
