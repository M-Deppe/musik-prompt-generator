import type { LucideIcon } from "lucide-react";
import type { PromptTarget } from "./types";
import {
  Music,
  Calendar,
  Activity,
  Waves,
  Clock,
  Sparkles,
  Mic,
  BookOpen,
  Tag,
  Ban,
  FileText,
  Drum,
  Layers,
  Volume2,
  Guitar,
  Piano,
  Sliders,
  FlaskConical,
  Blocks,
  Wind,
  Palette,
  SlidersHorizontal,
  Tags,
  Rocket,
  PenLine,
} from "lucide-react";

export type Mode = "simple" | "custom" | "studio";

export type Section = {
  id: string;
  label: string;
  icon: LucideIcon;
  iconColor?: string;
  // Wenn gesetzt, ist die Section nur bei diesem Ziel-Plattform-Modus
  // sichtbar. Sections ohne onlyFor erscheinen immer.
  onlyFor?: PromptTarget;
};

export type Category = {
  id: string;
  label: string;
  icon: LucideIcon;
  iconColor?: string;
  sections: Section[];
};

// --- Einzelne Sections (wiederverwendet in Modi) -----------------------------

const S = {
  grundstil: { id: "grundstil", label: "Grundstil & Mischung", icon: Music, iconColor: "text-emerald-400" },
  aera: { id: "aera", label: "Äera & Klangepoche", icon: Calendar, iconColor: "text-sky-400" },
  dynamik: { id: "dynamik", label: "Dynamik & Energie-Verlauf", icon: Activity, iconColor: "text-sky-400" },
  emotionen: { id: "emotionen", label: "Emotionen & Einsatz", icon: Waves, iconColor: "text-orange-400" },
  tempo: { id: "tempo", label: "Tempo & Groove", icon: Clock, iconColor: "text-fuchsia-400" },
  soundQuality: { id: "sound-quality", label: "Sound-Qualität & Suno Magic", icon: Sparkles, iconColor: "text-[var(--color-amber)]" },
  gesang: { id: "gesang", label: "Gesang", icon: Mic, iconColor: "text-pink-400" },
  songThema: { id: "song-thema", label: "Song-Thema & Einsatz", icon: BookOpen, iconColor: "text-red-400" },
  styleTags: { id: "style-tags", label: "Style-Tags eingeben", icon: Tag, iconColor: "text-[var(--color-amber)]" },
  excludeStyles: { id: "exclude-styles", label: "Exclude-Styles eingeben", icon: Ban, iconColor: "text-red-500" },
  blueprint: { id: "blueprint", label: "Prompt-Blueprint (KI-Struktur)", icon: FileText, iconColor: "text-sky-400" },
  stuecktyp: { id: "stuecktyp", label: "Stücktyp & Besetzung", icon: Layers, iconColor: "text-fuchsia-400" },
  drums: { id: "drums", label: "Drum & Beatdesign", icon: Drum, iconColor: "text-sky-400" },
  percussion: { id: "percussion", label: "Percussion layern", icon: Drum, iconColor: "text-orange-400" },
  bass: { id: "bass", label: "Bass & Low End", icon: Volume2, iconColor: "text-red-400" },
  guitars: { id: "guitars", label: "Gitarren & Clav", icon: Guitar, iconColor: "text-fuchsia-400" },
  winds: { id: "winds", label: "Bläser & Streicher", icon: Wind, iconColor: "text-amber-400" },
  keys: { id: "keys", label: "Tasten & Synths", icon: Piano, iconColor: "text-emerald-400" },
  earcandy: { id: "earcandy", label: "Earcandy & Kontrast", icon: Sparkles, iconColor: "text-[var(--color-amber)]" },
  harmony: { id: "harmony", label: "Harmonie & Tonalität", icon: Music, iconColor: "text-red-400" },
  // Struktur/Arrangement nutzt Bracket-Syntax — Suno-spezifisch.
  // Udio ignoriert Meta-Tags in der Lyrics-Box komplett.
  structure: { id: "structure", label: "Struktur & Form", icon: Blocks, iconColor: "text-sky-400", onlyFor: "suno" },
  mixMaster: { id: "mix-master", label: "Mix & Master", icon: Sliders, iconColor: "text-[var(--color-amber)]" },
  // Suno Studio: Meta-Tags wie [Drop], [Hyper-Realistic] etc. — nur Suno.
  sunoStudio: { id: "suno-studio", label: "Suno Studio", icon: FlaskConical, iconColor: "text-[var(--color-amber)]", onlyFor: "suno" },
  templates: { id: "templates", label: "Templates", icon: Rocket, iconColor: "text-[var(--color-amber)]" },
  lyrics: { id: "lyrics", label: "Lyrics", icon: PenLine, iconColor: "text-pink-400" },
} satisfies Record<string, Section>;

// --- Kategorien pro Mode -----------------------------------------------------

// Reihenfolge folgt dem Suno-V5.5-Prompt-Element-Order (Research April 2026):
// 1. Genre (+Aera +Fusion) -> 2. Mood -> 3. Song-Typ -> 4. Vocals ->
// 5. Instrumente -> 6. Harmonie/Tonart -> 7. BPM -> 8. Production -> 9. Negationen.

export const SIMPLE_CATEGORIES: Category[] = [
  {
    id: "start",
    label: "Schnellstart",
    icon: Rocket,
    iconColor: "text-[var(--color-amber)]",
    sections: [S.templates],
  },
  {
    id: "genre",
    label: "1. Genre & Aera",
    icon: Music,
    iconColor: "text-emerald-400",
    sections: [S.grundstil, S.aera],
  },
  {
    id: "mood",
    label: "2. Stimmung & Energie",
    icon: Palette,
    iconColor: "text-orange-400",
    sections: [S.emotionen, S.dynamik],
  },
  {
    id: "vocals",
    label: "3. Gesang",
    icon: Mic,
    iconColor: "text-pink-400",
    sections: [S.gesang],
  },
  {
    id: "tempo",
    label: "4. Tempo",
    icon: Clock,
    iconColor: "text-fuchsia-400",
    sections: [S.tempo],
  },
  {
    id: "production",
    label: "5. Sound & Produktion",
    icon: SlidersHorizontal,
    iconColor: "text-[var(--color-amber)]",
    sections: [S.soundQuality],
  },
  {
    id: "lyrics",
    label: "6. Lyrics & Thema",
    icon: PenLine,
    iconColor: "text-pink-400",
    sections: [S.lyrics, S.songThema],
  },
  {
    id: "tags",
    label: "7. Tags & Ausschluss",
    icon: Tags,
    iconColor: "text-[var(--color-amber)]",
    sections: [S.styleTags, S.excludeStyles, S.blueprint],
  },
];

export const CUSTOM_CATEGORIES: Category[] = [
  {
    id: "start",
    label: "Schnellstart",
    icon: Rocket,
    iconColor: "text-[var(--color-amber)]",
    sections: [S.templates],
  },
  {
    id: "genre",
    label: "1. Genre & Aera",
    icon: Music,
    iconColor: "text-emerald-400",
    sections: [S.grundstil, S.aera],
  },
  {
    id: "mood",
    label: "2. Stimmung & Energie",
    icon: Palette,
    iconColor: "text-orange-400",
    sections: [S.emotionen, S.dynamik],
  },
  {
    id: "form",
    label: "3. Song-Typ & Form",
    icon: Blocks,
    iconColor: "text-sky-400",
    sections: [S.stuecktyp, S.structure],
  },
  {
    id: "vocals",
    label: "4. Gesang",
    icon: Mic,
    iconColor: "text-pink-400",
    sections: [S.gesang],
  },
  {
    id: "rhythm",
    label: "5a. Instrumente — Rhythmus",
    icon: Drum,
    iconColor: "text-orange-400",
    sections: [S.drums, S.percussion, S.bass],
  },
  {
    id: "melody",
    label: "5b. Instrumente — Melodie",
    icon: Guitar,
    iconColor: "text-fuchsia-400",
    sections: [S.guitars, S.keys, S.winds, S.earcandy],
  },
  {
    id: "harmony",
    label: "6. Harmonie & Tonart",
    icon: Music,
    iconColor: "text-red-400",
    sections: [S.harmony],
  },
  {
    id: "tempo",
    label: "7. Tempo",
    icon: Clock,
    iconColor: "text-fuchsia-400",
    sections: [S.tempo],
  },
  {
    id: "production",
    label: "8. Sound & Produktion",
    icon: SlidersHorizontal,
    iconColor: "text-[var(--color-amber)]",
    sections: [S.soundQuality, S.mixMaster],
  },
  {
    id: "lyrics",
    label: "9. Lyrics & Thema",
    icon: PenLine,
    iconColor: "text-pink-400",
    sections: [S.lyrics, S.songThema],
  },
  {
    id: "tags",
    label: "10. Tags & Ausschluss",
    icon: Tags,
    iconColor: "text-[var(--color-amber)]",
    sections: [S.styleTags, S.excludeStyles, S.blueprint],
  },
];

export const STUDIO_CATEGORIES: Category[] = [
  {
    id: "studio",
    label: "Studio",
    icon: FlaskConical,
    iconColor: "text-[var(--color-amber)]",
    sections: [S.sunoStudio],
  },
];

const rawCategoriesForMode = (mode: Mode): Category[] =>
  mode === "simple" ? SIMPLE_CATEGORIES : mode === "custom" ? CUSTOM_CATEGORIES : STUDIO_CATEGORIES;

// Filtert Sections raus, die an den aktuellen Target-Modus NICHT gebunden sind.
// Leere Kategorien (nach Filter) werden weggelassen, damit die Sidebar nicht
// "Studio" mit 0 Sections anzeigt wenn man auf Udio umschaltet.
export const getCategoriesForMode = (mode: Mode, target: PromptTarget = "suno"): Category[] =>
  rawCategoriesForMode(mode)
    .map((cat) => ({
      ...cat,
      sections: cat.sections.filter((s) => !s.onlyFor || s.onlyFor === target),
    }))
    .filter((cat) => cat.sections.length > 0);

export const getSectionsForMode = (mode: Mode, target: PromptTarget = "suno"): Section[] =>
  getCategoriesForMode(mode, target).flatMap((c) => c.sections);

export const findCategoryOfSection = (mode: Mode, sectionId: string, target: PromptTarget = "suno"): Category | undefined =>
  getCategoriesForMode(mode, target).find((c) => c.sections.some((s) => s.id === sectionId));
