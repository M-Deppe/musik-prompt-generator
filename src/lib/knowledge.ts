import moodsData from "@resources/moods.json";
import templatesData from "@resources/templates.json";
import dosDontsData from "@resources/dos_donts.json";
import vocalsData from "@resources/vocals.json";
import instrumentsData from "@resources/instruments.json";
import tagsData from "@resources/tags.json";
import type { Template, MoodsData } from "@/types";

export const templates = templatesData.templates as Template[];
export const moods = moodsData as unknown as MoodsData;
export const dosDonts = dosDontsData;
export const vocals = vocalsData;
export const instruments = instrumentsData;
export const tags = tagsData;

// Kurzbeschreibung pro Mood — wird als Hint in der CheckList neben dem Label
// angezeigt. Ziel: 2-5 Woerter, musikalisch-emotional praezise.
export const MOOD_DESCRIPTIONS: Record<string, string> = {
  // uplifting
  "euphoric": "überschäumend, reine Freude",
  "triumphant": "siegreich, hymnisch",
  "uplifting": "beschwingt, hebt die Stimmung",
  "happy": "positiv, heiter",
  "anthemic": "stadionreif, zum Mitsingen",
  "optimistic": "zuversichtlich, hell",
  "joyful": "ausgelassen, fröhlich",
  "hopeful": "voller Zuversicht",
  "confident": "selbstsicher, bestimmt",
  "feel-good": "gute Laune, sorglos",
  // melancholic
  "nostalgic": "sehnsüchtig nach früher",
  "melancholy": "traurig-schön, schwer",
  "bittersweet": "süß und schmerzhaft zugleich",
  "wistful": "wehmütig, nachdenklich",
  "somber": "gedämpft, ernst",
  "longing": "verzehrende Sehnsucht",
  "sad": "traurig, niedergeschlagen",
  "reflective": "nachsinnend, ruhig",
  "introspective": "nach innen gerichtet",
  // dark
  "brooding": "grüblerisch, unterschwellig dunkel",
  "dark": "finster, schattig",
  "menacing": "bedrohlich, gefahrvoll",
  "ominous": "unheilvoll, drohend",
  "mysterious": "rätselhaft, geheimnisvoll",
  "sinister": "böse, unheimlich",
  "haunting": "nachhallend, verfolgend",
  "gritty": "schmutzig, rau",
  "tense": "angespannt, unter Druck",
  // calm
  "peaceful": "friedlich, ruhig",
  "calm": "gelassen, still",
  "serene": "heiter-still, klar",
  "gentle": "sanft, behutsam",
  "soft": "weich, zart",
  "intimate": "vertraulich, nah",
  "dreamy": "verträumt, schwebend",
  "ethereal": "überirdisch, luftig",
  "atmospheric": "stimmungsvoll, weit",
  "chill": "entspannt, laid-back",
  // aggressive
  "aggressive": "angriffslustig, hart",
  "intense": "intensiv, durchdringend",
  "powerful": "kraftvoll, wuchtig",
  "angry": "wütend, zornig",
  "rebellious": "rebellisch, aufmüpfig",
  "raw": "ungeschliffen, direkt",
  "savage": "wild, ungebändigt",
  "fierce": "heftig, leidenschaftlich",
  // romantic
  "romantic": "romantisch, gefühlvoll",
  "passionate": "leidenschaftlich, glühend",
  "sensual": "sinnlich, körperlich",
  "tender": "zärtlich, liebevoll",
  "vulnerable": "verletzlich, offen",
  "yearning": "sehnend, schmachtend",
  // cinematic
  "epic": "episch, groß angelegt",
  "cinematic": "filmisch, breit",
  "dramatic": "dramatisch, zugespitzt",
  "climactic": "auf den Höhepunkt zusteuernd",
  "grand": "großartig, erhaben",
  "sweeping": "schwungvoll, weit ausholend",
};

export const getTemplateById = (id: string): Template | undefined =>
  templates.find((t) => t.id === id);

export const findConflictingMoods = (selected: string[]): [string, string][] =>
  moods.conflict_pairs.filter(
    ([a, b]) => selected.includes(a) && selected.includes(b),
  );

export {
  MAIN_GENRES,
  SUBGENRES,
  getMainGenreById,
  getSubgenreById,
  getSubgenresByMain,
  searchSubgenres,
} from "./allGenres";
export type { MainGenre, Subgenre } from "./allGenres";
