import type { ReactNode } from "react";
import { Grundstil } from "./sections/Grundstil";
import { Emotionen } from "./sections/Emotionen";
import { Tempo } from "./sections/Tempo";
import { Gesang } from "./sections/Gesang";
import { Aera } from "./sections/Aera";
import { Dynamik } from "./sections/Dynamik";
import { SoundQuality } from "./sections/SoundQuality";
import { SongThema } from "./sections/SongThema";
import { StyleTags } from "./sections/StyleTags";
import { ExcludeStyles } from "./sections/ExcludeStyles";
import { Blueprint } from "./sections/Blueprint";
import { SunoStudio } from "./sections/SunoStudio";
import { Drums } from "./sections/Drums";
import { Bass } from "./sections/Bass";
import { Guitars } from "./sections/Guitars";
import { Keys } from "./sections/Keys";
import { Percussion } from "./sections/Percussion";
import { Winds } from "./sections/Winds";
import { Earcandy } from "./sections/Earcandy";
import { Harmony } from "./sections/Harmony";
import { Structure } from "./sections/Structure";
import { MixMaster } from "./sections/MixMaster";
import { Stuecktyp } from "./sections/Stuecktyp";
import { Lyrics } from "./sections/Lyrics";
import { Templates } from "./sections/Templates";
import { Placeholder } from "./sections/Placeholder";

type Entry = { component: () => ReactNode };

const REGISTRY: Record<string, Entry> = {
  // Simple Mode
  grundstil: { component: Grundstil },
  aera: { component: Aera },
  dynamik: { component: Dynamik },
  emotionen: { component: Emotionen },
  tempo: { component: Tempo },
  "sound-quality": { component: SoundQuality },
  gesang: { component: Gesang },
  "song-thema": { component: SongThema },
  "style-tags": { component: StyleTags },
  "exclude-styles": { component: ExcludeStyles },
  blueprint: { component: Blueprint },

  // Studio
  "suno-studio": { component: SunoStudio },

  // Schnellstart + Lyrics
  templates: { component: Templates },
  lyrics: { component: Lyrics },

  // Custom exklusiv
  stuecktyp: { component: Stuecktyp },
  drums: { component: Drums },
  percussion: { component: Percussion },
  bass: { component: Bass },
  guitars: { component: Guitars },
  keys: { component: Keys },
  winds: { component: Winds },
  earcandy: { component: Earcandy },
  harmony: { component: Harmony },
  structure: { component: Structure },
  "mix-master": { component: MixMaster },
};

export const renderSection = (sectionId: string, sectionLabel: string): ReactNode => {
  const entry = REGISTRY[sectionId];
  if (!entry) return <Placeholder sectionLabel={sectionLabel} />;
  const C = entry.component;
  return <C />;
};
