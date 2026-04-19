// Genre → Background-Stil-Mapping. Jedes Genre bekommt einen Stil-Charakter,
// Farben, Speed- und Amplitude-Modifier. Ziel: der Hintergrund spiegelt den
// Charakter der Musik wider ohne mit der Amber-UI zu kollidieren.

export type BackgroundStyle =
  | "pulse" // rhythmische Radial-Wellen (EDM-Energie)
  | "heavy-liquid" // langsame schwere Pulses (Hip-Hop)
  | "flicker" // flackernd, glitchy (Metal/Punk)
  | "stage-lights" // horizontale Lichtstreifen (Rock, live-feeling)
  | "shimmer" // weiche Wellen + Sparkles (Pop/R&B/Soul)
  | "nebel" // diffus, sehr langsam (Classical/Ambient/Jazz)
  | "particles-drift"; // Partikelfeld + langsamer Drift (Folk/Country/Reggae)

export type GenreVisual = {
  style: BackgroundStyle;
  primary: string;
  secondary: string;
  tertiary: string;
  speedMultiplier: number;
  amplitudeMultiplier: number;
};

const DEFAULT: GenreVisual = {
  style: "nebel",
  primary: "oklch(0.4 0.12 265)",
  secondary: "oklch(0.42 0.15 305)",
  tertiary: "oklch(0.45 0.1 210)",
  speedMultiplier: 1.0,
  amplitudeMultiplier: 1.0,
};

// Farben sind bewusst GEDÄMPFT (lightness 0.35–0.55, chroma 0.08–0.2).
// Keine Amber/Gelb-Töne im Hintergrund — die UI nutzt sie als Akzent.
const GENRE_VISUALS: Record<string, GenreVisual> = {
  // === PULSE — rhythmische Energie ===
  electronic: {
    style: "pulse",
    primary: "oklch(0.5 0.22 310)",
    secondary: "oklch(0.55 0.2 200)",
    tertiary: "oklch(0.5 0.15 280)",
    speedMultiplier: 1.7,
    amplitudeMultiplier: 1.3,
  },
  funk: {
    style: "pulse",
    primary: "oklch(0.5 0.17 320)",
    secondary: "oklch(0.5 0.15 150)",
    tertiary: "oklch(0.52 0.14 200)",
    speedMultiplier: 1.4,
    amplitudeMultiplier: 1.2,
  },
  latin: {
    style: "pulse",
    primary: "oklch(0.5 0.18 35)",
    secondary: "oklch(0.5 0.16 5)",
    tertiary: "oklch(0.45 0.13 280)",
    speedMultiplier: 1.3,
    amplitudeMultiplier: 1.2,
  },

  // === HEAVY-LIQUID — schwere, tiefe Pulses ===
  hiphop: {
    style: "heavy-liquid",
    primary: "oklch(0.4 0.13 55)",
    secondary: "oklch(0.35 0.13 20)",
    tertiary: "oklch(0.4 0.1 280)",
    speedMultiplier: 0.8,
    amplitudeMultiplier: 1.3,
  },

  // === FLICKER — flackernde Glows, chaotisch ===
  metal: {
    style: "flicker",
    primary: "oklch(0.4 0.2 25)",
    secondary: "oklch(0.48 0.18 40)",
    tertiary: "oklch(0.3 0.1 15)",
    speedMultiplier: 1.6,
    amplitudeMultiplier: 1.5,
  },
  punk: {
    style: "flicker",
    primary: "oklch(0.5 0.22 15)",
    secondary: "oklch(0.55 0.2 50)",
    tertiary: "oklch(0.48 0.18 340)",
    speedMultiplier: 2.0,
    amplitudeMultiplier: 1.5,
  },
  experimental: {
    style: "flicker",
    primary: "oklch(0.5 0.18 130)",
    secondary: "oklch(0.5 0.2 330)",
    tertiary: "oklch(0.5 0.18 230)",
    speedMultiplier: 1.7,
    amplitudeMultiplier: 1.4,
  },

  // === STAGE-LIGHTS — bewegte Lichtstreifen ===
  rock: {
    style: "stage-lights",
    primary: "oklch(0.45 0.17 25)",
    secondary: "oklch(0.45 0.14 300)",
    tertiary: "oklch(0.4 0.12 40)",
    speedMultiplier: 1.2,
    amplitudeMultiplier: 1.2,
  },

  // === SHIMMER — weiche Wellen mit Sparkles ===
  pop: {
    style: "shimmer",
    primary: "oklch(0.5 0.15 330)",
    secondary: "oklch(0.55 0.13 200)",
    tertiary: "oklch(0.5 0.13 280)",
    speedMultiplier: 1.2,
    amplitudeMultiplier: 1.0,
  },
  rnb: {
    style: "shimmer",
    primary: "oklch(0.45 0.12 340)",
    secondary: "oklch(0.42 0.13 300)",
    tertiary: "oklch(0.45 0.1 260)",
    speedMultiplier: 0.8,
    amplitudeMultiplier: 0.9,
  },
  soul: {
    style: "shimmer",
    primary: "oklch(0.45 0.13 60)",
    secondary: "oklch(0.4 0.12 30)",
    tertiary: "oklch(0.42 0.1 280)",
    speedMultiplier: 0.85,
    amplitudeMultiplier: 1.0,
  },

  // === NEBEL — diffus, langsam, atmosphärisch ===
  ambient: {
    style: "nebel",
    primary: "oklch(0.4 0.1 220)",
    secondary: "oklch(0.38 0.1 280)",
    tertiary: "oklch(0.42 0.08 190)",
    speedMultiplier: 0.3,
    amplitudeMultiplier: 0.7,
  },
  classical: {
    style: "nebel",
    primary: "oklch(0.45 0.08 80)",
    secondary: "oklch(0.4 0.1 280)",
    tertiary: "oklch(0.4 0.06 60)",
    speedMultiplier: 0.5,
    amplitudeMultiplier: 0.9,
  },
  soundtrack: {
    style: "nebel",
    primary: "oklch(0.4 0.1 65)",
    secondary: "oklch(0.38 0.12 280)",
    tertiary: "oklch(0.4 0.1 200)",
    speedMultiplier: 0.55,
    amplitudeMultiplier: 1.1,
  },
  religious: {
    style: "nebel",
    primary: "oklch(0.5 0.08 80)",
    secondary: "oklch(0.45 0.08 260)",
    tertiary: "oklch(0.5 0.05 40)",
    speedMultiplier: 0.4,
    amplitudeMultiplier: 0.8,
  },
  blues: {
    style: "nebel",
    primary: "oklch(0.35 0.13 240)",
    secondary: "oklch(0.3 0.1 250)",
    tertiary: "oklch(0.4 0.08 260)",
    speedMultiplier: 0.5,
    amplitudeMultiplier: 0.9,
  },
  indie: {
    style: "nebel",
    primary: "oklch(0.42 0.1 280)",
    secondary: "oklch(0.4 0.08 200)",
    tertiary: "oklch(0.4 0.07 320)",
    speedMultiplier: 0.7,
    amplitudeMultiplier: 0.8,
  },
  jazz: {
    style: "nebel",
    primary: "oklch(0.45 0.1 75)",
    secondary: "oklch(0.4 0.08 45)",
    tertiary: "oklch(0.35 0.06 30)",
    speedMultiplier: 0.6,
    amplitudeMultiplier: 0.8,
  },

  // === PARTICLES-DRIFT — Partikelfeld mit horizontalem Drift ===
  folk: {
    style: "particles-drift",
    primary: "oklch(0.55 0.1 60)",
    secondary: "oklch(0.5 0.08 120)",
    tertiary: "oklch(0.45 0.07 40)",
    speedMultiplier: 0.55,
    amplitudeMultiplier: 0.7,
  },
  country: {
    style: "particles-drift",
    primary: "oklch(0.5 0.12 70)",
    secondary: "oklch(0.45 0.1 30)",
    tertiary: "oklch(0.5 0.08 120)",
    speedMultiplier: 0.7,
    amplitudeMultiplier: 0.8,
  },
  world: {
    style: "particles-drift",
    primary: "oklch(0.45 0.12 60)",
    secondary: "oklch(0.45 0.12 180)",
    tertiary: "oklch(0.4 0.12 30)",
    speedMultiplier: 0.9,
    amplitudeMultiplier: 1.0,
  },
  reggae: {
    style: "particles-drift",
    primary: "oklch(0.45 0.14 140)",
    secondary: "oklch(0.5 0.12 80)",
    tertiary: "oklch(0.4 0.13 30)",
    speedMultiplier: 0.85,
    amplitudeMultiplier: 1.0,
  },
  novelty: {
    style: "particles-drift",
    primary: "oklch(0.55 0.18 330)",
    secondary: "oklch(0.55 0.15 140)",
    tertiary: "oklch(0.55 0.15 60)",
    speedMultiplier: 1.5,
    amplitudeMultiplier: 1.1,
  },
};

export const getGenreVisual = (genreId: string | undefined): GenreVisual =>
  (genreId && GENRE_VISUALS[genreId]) || DEFAULT;

// 120 BPM Referenz. <60 wird auf 0.4, >264 auf 2.2 geclamped.
export const bpmToSpeedFactor = (bpm: number | undefined): number => {
  if (!bpm || bpm <= 0) return 1.0;
  return Math.max(0.4, Math.min(bpm / 120, 2.2));
};
