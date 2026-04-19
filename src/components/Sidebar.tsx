import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useStore } from "@/store";
import { getCategoriesForMode, type Category } from "@/sections";
import type { PromptState } from "@/types";
import { GROOVES, TIME_SIGNATURES, TEMPO_CHARACTER } from "@/content/sections/Tempo";
import { CINEMATIC_TAGS, EMOTIONAL_ARCS } from "@/content/sections/Emotionen";

// Zentrale ID-Sets fuer Sections deren IDs keinen eindeutigen Prefix haben
// (Tempo-Grooves, Emotionen-Cinematic/Arcs). Prefix-Regex reicht hier nicht.
const TEMPO_PROD_IDS = new Set<string>([
  ...GROOVES.map((i) => i.id),
  ...TIME_SIGNATURES.map((i) => i.id),
  ...TEMPO_CHARACTER.map((i) => i.id),
]);
const EMOTIONEN_PROD_IDS = new Set<string>([
  ...CINEMATIC_TAGS.map((i) => i.id),
  ...EMOTIONAL_ARCS.map((i) => i.id),
]);

const vocalFxCount = (p: PromptState): number =>
  p.vocalEffects ? p.vocalEffects.split(",").filter((s) => s.trim()).length : 0;

// Tag-Prefixes in production[] — welche Section besitzt welchen Prefix.
// Harmony m-: beschraenkt auf 12 explizite Modes (Kollision mit SoundQuality
// m-spacious/m-wide-stereo/etc., die dort eigene IDs haben).
const HARMONY_MODES = new Set([
  "m-ionian", "m-dorian", "m-phrygian", "m-lydian", "m-mixolydian",
  "m-aeolian", "m-locrian", "m-harmonic-minor", "m-melodic-minor",
  "m-pentatonic", "m-blues-scale", "m-chromatic",
]);
const isHarmonyTag = (t: string) => /^(key-|pr-)/.test(t) || HARMONY_MODES.has(t);
const isLyricsTag = (t: string) => /^(th-|lt-|narr-)/.test(t);
const isUseCaseTag = (t: string) => t.startsWith("uc-");
const isFormTag = (t: string) => /^(form-|ft-|sl-|trans-)/.test(t);
const isAeraTag = (t: string) => /^(era-|prod-|ref-)/.test(t);
const isStuecktypTag = (t: string) => /^(dur-|en-|sz-)/.test(t);
const isDynamikTag = (t: string) => /^(flow-|drop-|build-|dyn-|ep-|no-)/.test(t);
const isEmotionenTag = (t: string) => /^ea-/.test(t) || EMOTIONEN_PROD_IDS.has(t);
const isTempoTag = (t: string) => TEMPO_PROD_IDS.has(t);
const isSoundQualityTag = (t: string) =>
  /^(sq-|sound-|q-|sp-)/.test(t) || (t.startsWith("m-") && !HARMONY_MODES.has(t));
const isMixMasterTag = (t: string) => /^(d-|eq-|harm-|loud-|st-)/.test(t);
const isPlainProductionTag = (t: string) => isSoundQualityTag(t) || isMixMasterTag(t);

// Count pro konkreter Section (nicht Kategorie). Nutzt ID-Prefix-Matching
// fuer die production[]- und instruments[]-Tags; direkte Felder fuer Vocal/
// Genre/Lyrics/BPM. Nicht 100% wasserdicht bei Tag-Prefix-Kollisionen —
// ausreichend fuer "siehst du wo deine Auswahl liegt"-Indikatoren.
const countForSection = (sectionId: string, p: PromptState): number => {
  const prod = p.production;
  const instr = p.instruments;
  switch (sectionId) {
    case "grundstil":
      return (p.mainGenre ? 1 : 0) + (p.subgenre ? 1 : 0) + (p.secondaryGenre ? 1 : 0) + (p.soundsLike?.trim() ? 1 : 0);
    case "gesang":
      return (p.vocalCharacter ? 1 : 0) + (p.vocalDelivery ? 1 : 0) + vocalFxCount(p) + (p.vocalLanguages?.length ?? 0);
    case "tempo":
      return (p.bpm ? 1 : 0) + prod.filter(isTempoTag).length;
    case "lyrics":
      return (p.title ? 1 : 0) + (p.lyrics?.trim() ? 1 : 0) + prod.filter((t) => isLyricsTag(t) || isUseCaseTag(t)).length;
    case "emotionen":
      return p.moods.length + prod.filter(isEmotionenTag).length;
    case "song-thema":
      return prod.filter((t) => isLyricsTag(t) || isUseCaseTag(t)).length;
    case "exclude-styles":
      return p.negatives.length;
    case "style-tags":
      return p.customTags.length;
    case "harmony":
      return prod.filter(isHarmonyTag).length;
    case "structure":
      return prod.filter(isFormTag).length;
    case "dynamik":
      return prod.filter(isDynamikTag).length;
    case "aera":
      return prod.filter(isAeraTag).length;
    case "stuecktyp":
      return prod.filter(isStuecktypTag).length;
    case "mix-master":
      return prod.filter(isMixMasterTag).length;
    case "sound-quality":
      return prod.filter(isSoundQualityTag).length;
    case "drums":
      return instr.filter((i) => /^(kick-|snare-|hihat-|drums-|pat-)/.test(i)).length;
    case "percussion":
      return instr.filter((i) => /^(pc-|wp-|fx-|lar-)/.test(i)).length;
    case "bass":
      return instr.filter((i) => /^(bass-|bp-)/.test(i)).length;
    case "guitars":
      return instr.filter((i) => /^(amp-|g-)/.test(i)).length;
    case "keys":
      return instr.filter((i) => /^(k-|l-|p-|s-)/.test(i)).length;
    case "winds":
      return instr.filter((i) => /^(br-|st-|ww-)/.test(i)).length;
    case "earcandy":
      return instr.filter((i) => /^(ec-|tr-|im-|tex-)/.test(i)).length;
    case "suno-studio":
      // Alle Tags die mit [ beginnen = SunoStudio-Meta-Tags
      return prod.filter((t) => t.startsWith("[")).length;
    default:
      return 0;
  }
};

const countForCategory = (cat: Category, p: PromptState): number => {
  const prod = p.production;
  switch (cat.id) {
    case "genre":
      // Genre-Kategorie umfasst Grundstil + Aera-Section.
      return (
        (p.mainGenre ? 1 : 0) +
        (p.subgenre ? 1 : 0) +
        (p.secondaryGenre ? 1 : 0) +
        (p.soundsLike?.trim() ? 1 : 0) +
        prod.filter(isAeraTag).length
      );
    case "mood":
      // Mood-Kategorie umfasst Emotionen (moods + ea-Tags) + Dynamik.
      return p.moods.length + prod.filter((t) => isEmotionenTag(t) || isDynamikTag(t)).length;
    case "form":
      // Form-Kategorie umfasst Stuecktyp (dur-/en-/sz-) + Structure (form-/ft-/sl-/trans-).
      return prod.filter((t) => isStuecktypTag(t) || isFormTag(t)).length;
    case "vocals":
      return (
        (p.vocalCharacter ? 1 : 0) +
        (p.vocalDelivery ? 1 : 0) +
        vocalFxCount(p) +
        (p.vocalLanguages?.length ?? 0)
      );
    case "rhythm":
    case "melody":
      return p.instruments.length; // Shared field — in beiden gezeigt
    case "harmony":
      return prod.filter(isHarmonyTag).length;
    case "tempo":
      return (p.bpm ? 1 : 0) + prod.filter(isTempoTag).length;
    case "production":
      // Production-Kategorie umfasst SoundQuality + MixMaster.
      return prod.filter(isPlainProductionTag).length;
    case "lyrics":
      return (
        (p.title ? 1 : 0) +
        (p.lyrics ? 1 : 0) +
        prod.filter((t) => isLyricsTag(t) || isUseCaseTag(t)).length
      );
    case "tags":
      return p.customTags.length + p.negatives.length;
    case "studio":
      // Studio-Kategorie: Bracket-Tags aus SunoStudio.
      return prod.filter((t) => t.startsWith("[")).length;
    case "start":
      return 0;
    default:
      return 0;
  }
};

export const Sidebar = ({ forceShow = false }: { forceShow?: boolean } = {}) => {
  const { state, dispatch } = useStore();
  const categories = getCategoriesForMode(state.mode, state.settings.target);
  const prompt = state.prompt;
  // Initial alle Kategorien zu. Nutzer klickt, um zu oeffnen.
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => setOpen((o) => ({ ...o, [id]: !o[id] }));

  // Auf Mobile (< lg) wird Sidebar via MobileOverlay gerendert — dann forceShow.
  // Im Hauptlayout unter lg ausblenden (lg:flex), damit nichts doppelt erscheint.
  const visibility = forceShow ? "flex w-full" : "hidden w-64 lg:flex";

  return (
    <aside
      className={`${visibility} shrink-0 flex-col gap-1 overflow-y-auto border-r border-[var(--color-border)] bg-[var(--color-panel)]/60 p-3 backdrop-blur-md`}
      aria-label="Navigation"
    >
      {categories.map((cat) => {
        const CatIcon = cat.icon;
        const isOpen = open[cat.id] ?? false;
        return (
          <div key={cat.id} className="flex flex-col gap-0.5">
            <button
              onClick={() => toggle(cat.id)}
              className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.14em] transition ${
                isOpen
                  ? "bg-[var(--color-bg)]/60 text-[var(--color-text)]"
                  : "text-[var(--color-text-dim)] hover:bg-[var(--color-panel-hover)] hover:text-[var(--color-text)]"
              }`}
            >
              {isOpen ? (
                <ChevronDown size={12} className="text-[var(--color-amber)]" />
              ) : (
                <ChevronRight size={12} className="text-[var(--color-text-faint)]" />
              )}
              <CatIcon size={14} className={cat.iconColor ?? "text-[var(--color-amber)]"} />
              <span className="flex-1 truncate">{cat.label}</span>
              {(() => {
                const n = countForCategory(cat, prompt);
                return n > 0 ? (
                  <span className="rounded-full bg-[var(--color-amber)]/15 px-1.5 text-[10px] font-semibold text-[var(--color-amber)] ring-1 ring-[var(--color-amber-dim)]/40">
                    {n}
                  </span>
                ) : (
                  <span className="rounded-full bg-[var(--color-bg)] px-1.5 text-[10px] text-[var(--color-text-faint)]">
                    0
                  </span>
                );
              })()}
            </button>
            {isOpen && (
              <div className="ml-4 flex flex-col gap-0.5 border-l border-[var(--color-border)] pl-2.5">
                {cat.sections.map((sec) => {
                  const active = state.activeSection === sec.id;
                  const Icon = sec.icon;
                  const secCount = countForSection(sec.id, prompt);
                  return (
                    <button
                      key={sec.id}
                      onClick={() => dispatch({ type: "SET_SECTION", section: sec.id })}
                      className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-[13px] transition ${
                        active
                          ? "bg-gradient-to-r from-[var(--color-amber)]/15 to-transparent text-[var(--color-text)] ring-1 ring-[var(--color-amber-dim)]"
                          : "text-[var(--color-text-dim)] hover:bg-[var(--color-panel-hover)] hover:text-[var(--color-text)]"
                      }`}
                    >
                      <Icon size={14} className={sec.iconColor ?? "text-[var(--color-text-dim)]"} />
                      <span className="flex-1 truncate">{sec.label}</span>
                      {secCount > 0 && (
                        <span className="rounded-full bg-[var(--color-amber)]/20 px-1.5 text-[10px] font-semibold text-[var(--color-amber)]">
                          {secCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </aside>
  );
};
