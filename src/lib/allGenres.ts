import electronicData from "@resources/genres/electronic.json";
import rockData from "@resources/genres/rock_metal_pop.json";
import hiphopData from "@resources/genres/hiphop_rnb_jazz_blues.json";
import worldData from "@resources/genres/world_classical_misc.json";

export type Subgenre = {
  id: string;
  name: string;
  parent_main: string;
  parent: string;
  bpm_min: number;
  bpm_max: number;
  keywords: string[];
  origin: string;
};

export type MainGenre = {
  id: string;
  name: string;
  description: string;
};

export const MAIN_GENRES: MainGenre[] = [
  { id: "electronic", name: "Electronic / EDM", description: "Elektronische Musik, Synthesizer und Drum-Machines" },
  { id: "rock", name: "Rock", description: "Gitarren-zentrierte Musik von Classic bis Alternative" },
  { id: "indie", name: "Indie / Alternative", description: "Unabhaengige und alternative Stile, oft mit Lo-Fi-Aesthetik" },
  { id: "metal", name: "Metal", description: "Schwere, verzerrte Gitarren-Musik mit vielen Subgenres" },
  { id: "punk", name: "Punk", description: "Schnelle, raue, rebellische Rock-Musik" },
  { id: "pop", name: "Pop", description: "Mainstream-orientierte Populärmusik in vielen Variationen" },
  { id: "hiphop", name: "Hip-Hop / Rap", description: "Rap, Beats, kulturelle Wurzeln im Hip-Hop" },
  { id: "rnb", name: "R&B", description: "Rhythm & Blues, Contemporary und Neo-Soul" },
  { id: "soul", name: "Soul", description: "Afroamerikanische Vokaltradition mit Gospel-Wurzeln" },
  { id: "funk", name: "Funk", description: "Groove-getriebene, rhythmische Musik" },
  { id: "jazz", name: "Jazz", description: "Improvisationsbasierte Musiktradition mit vielen Schulen" },
  { id: "blues", name: "Blues", description: "Traditionelle afroamerikanische Musikform" },
  { id: "reggae", name: "Reggae / Caribbean", description: "Karibische Musiktraditionen mit Offbeat-Rhythmen" },
  { id: "latin", name: "Latin", description: "Lateinamerikanische Musikformen" },
  { id: "world", name: "World", description: "Regionale und traditionelle Musik weltweit" },
  { id: "folk", name: "Folk", description: "Akustische, traditionelle und Singer-Songwriter-Musik" },
  { id: "country", name: "Country / Americana", description: "US-amerikanische traditionelle Musik" },
  { id: "classical", name: "Classical", description: "Klassische und zeitgenoessische Kunstmusik" },
  { id: "ambient", name: "Ambient", description: "Atmosphaerische, unaufdringliche Klangflaechen" },
  { id: "experimental", name: "Experimental", description: "Avantgarde und experimentelle Klangkunst" },
  { id: "soundtrack", name: "Soundtrack / Cinematic", description: "Film-, Spiel- und Trailermusik" },
  { id: "religious", name: "Religious / Spiritual", description: "Sakrale und spirituelle Musik" },
  { id: "novelty", name: "Novelty / Meme", description: "Kinderlieder, Internet-Memes, Parodien" },
];

const normalize = (list: Subgenre[], fallbackMain?: string): Subgenre[] =>
  list.map((s) => ({ ...s, parent_main: s.parent_main ?? fallbackMain ?? "unknown" }));

export const SUBGENRES: Subgenre[] = [
  ...normalize(electronicData.subgenres as Subgenre[], "electronic"),
  ...normalize(rockData.subgenres as Subgenre[]),
  ...normalize(hiphopData.subgenres as Subgenre[]),
  ...normalize(worldData.subgenres as Subgenre[]),
];

export const getSubgenreById = (id: string | undefined): Subgenre | undefined =>
  id ? SUBGENRES.find((s) => s.id === id) : undefined;

export const getSubgenresByMain = (mainId: string): Subgenre[] =>
  SUBGENRES.filter((s) => s.parent_main === mainId);

export const getMainGenreById = (id: string | undefined): MainGenre | undefined =>
  id ? MAIN_GENRES.find((m) => m.id === id) : undefined;

export const searchSubgenres = (query: string, limit = 50): Subgenre[] => {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return SUBGENRES.filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      s.id.includes(q) ||
      s.keywords.some((k) => k.toLowerCase().includes(q)),
  ).slice(0, limit);
};
