import type { PromptState } from "@/types";
import { getSubgenreById, MAIN_GENRES } from "./allGenres";

const joinNonEmpty = (parts: (string | undefined)[]): string =>
  parts.filter((p): p is string => Boolean(p && p.trim())).join(", ");

export const buildStylePrompt = (state: PromptState): string => {
  const subgenre = getSubgenreById(state.subgenre);
  const main = MAIN_GENRES.find((g) => g.id === state.mainGenre);
  // secondaryGenre kann Subgenre-ID (neu) oder Main-Genre-ID (Alt-Daten) sein.
  // Erst als Subgenre aufloesen, dann als Main.
  const secondarySub = getSubgenreById(state.secondaryGenre);
  const secondaryMain = MAIN_GENRES.find((g) => g.id === state.secondaryGenre);
  const secondary: { name: string } | undefined = secondarySub
    ? { name: secondarySub.name }
    : secondaryMain
      ? { name: secondaryMain.name }
      : undefined;

  // Main-Genre + Subgenre kombinieren. Wenn der Subgenre-Name das Main-Genre schon enthaelt,
  // nur Subgenre nennen (z.B. "deep house" enthaelt "house" — Main "electronic" bleibt weg).
  // Sonst beides: "dub, reggae" — damit Suno weiss, zu welcher Familie das Subgenre gehoert.
  const buildGenrePart = (): string | undefined => {
    const subName = subgenre?.name.toLowerCase();
    const mainName = main?.name.toLowerCase().split(" ")[0]; // "Rock", "Reggae", "Electronic / EDM" -> "electronic"
    if (subName && mainName) {
      return subName.includes(mainName) ? subName : `${subName}, ${mainName}`;
    }
    return subName ?? main?.name.toLowerCase();
  };
  const genrePart = buildGenrePart();
  const fusionPart = secondary ? `fusion with ${secondary.name.toLowerCase()}` : undefined;
  const soundsLikePart = state.soundsLikeDescription?.trim()
    ? state.soundsLikeDescription.trim().replace(/\.$/, "")
    : state.soundsLike?.trim()
      ? `reminiscent of ${state.soundsLike.trim()}`
      : undefined;
  const vocalPart = joinNonEmpty([
    state.vocalCharacter,
    state.vocalDelivery,
    state.vocalEffects,
  ]);
  const languagePart = (state.vocalLanguages ?? []).length
    ? `vocals in ${(state.vocalLanguages ?? []).map((l) => l.replace(/^lang-/, "")).join("/")}`
    : undefined;
  const moodPart = state.moods.join(", ");
  const instrumentPart = state.instruments.slice(0, 3).join(", ");
  const bpmPart = state.bpm ? `${state.bpm} BPM` : undefined;

  // Prefix-basiertes Routing der production[]-Tags:
  //   key-* / pr-* / m-*  → Harmonie (Style-Prompt)
  //   th-* / lt-* / narr-* → Lyrics-only (werden hier NICHT eingefuegt)
  //   uc-*                 → Einsatzzweck (Style-Prompt)
  //   (rest)               → plain production
  const isHarmony = (t: string) => /^(key-|pr-|m-)/.test(t);
  const isLyricsOnly = (t: string) => /^(th-|lt-|narr-)/.test(t);
  const isUseCase = (t: string) => t.startsWith("uc-");

  const harmonyPart = state.production
    .filter(isHarmony)
    .map((t) => t.replace(/^(key-|pr-|m-)/, ""))
    .join(", ");
  const useCasePart = state.production
    .filter(isUseCase)
    .map((t) => t.replace(/^uc-/, ""))
    .join(", ");
  const productionPart = state.production
    .filter((t) => !isHarmony(t) && !isLyricsOnly(t) && !isUseCase(t))
    .join(", ");

  const customTagsPart = (state.customTags ?? []).join(", ");
  const negativePart = state.negatives.length
    ? state.negatives.map((n) => (n.startsWith("no ") ? n : `no ${n}`)).join(", ")
    : undefined;

  // Reihenfolge laut Suno-Research (April 2026):
  // 1. Genre (+Aera +Fusion)  2. Fusion  3. Mood  4. Vocals  5. Instrumente
  // 6. Harmonie/Tonart  7. BPM  8. Production  9. Custom-Tags  10. Sound-Ref (end)  11. Negationen (last)
  return joinNonEmpty([
    genrePart,
    fusionPart,
    moodPart,
    useCasePart || undefined,
    vocalPart,
    languagePart,
    instrumentPart,
    harmonyPart || undefined,
    bpmPart,
    productionPart,
    customTagsPart,
    soundsLikePart, // Sound-Referenz ans Ende als Nuance-Modifier
    negativePart,   // Negationen zuletzt
  ]);
};

