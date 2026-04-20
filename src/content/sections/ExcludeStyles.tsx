import { AccordionSection } from "@/components/AccordionSection";
import { CheckList, type CheckItem } from "@/content/CheckList";
import { useStore } from "@/store";

const INSTRUMENTS: CheckItem[] = [
  { id: "vocals", label: "vocals", hint: "komplett instrumental, keine Stimme" },
  { id: "guitar", label: "guitar", hint: "jede Art Gitarre" },
  { id: "electric guitar", label: "electric guitar", hint: "nur E-Gitarre, akustische erlaubt" },
  { id: "acoustic guitar", label: "acoustic guitar", hint: "nur akustische, E-Gitarre erlaubt" },
  { id: "guitar solo", label: "guitar solo", hint: "kein Lead-Solo-Part" },
  { id: "bass guitar", label: "bass guitar", hint: "keine E-Bass-Saiten" },
  { id: "piano", label: "piano", hint: "kein Klavier, auch kein E-Piano" },
  { id: "rhodes", label: "rhodes", hint: "kein E-Piano (Fender Rhodes)" },
  { id: "organ", label: "organ", hint: "keine Hammond/Kirchen-Orgel" },
  { id: "strings", label: "strings", hint: "keine Streicher-Sektion" },
  { id: "violin", label: "violin", hint: "keine Geige/Violine" },
  { id: "cello", label: "cello", hint: "kein Violoncello" },
  { id: "brass", label: "brass", hint: "keine Blechbläser-Sektion" },
  { id: "trumpet", label: "trumpet", hint: "keine Trompete" },
  { id: "trombone", label: "trombone", hint: "keine Posaune" },
  { id: "saxophone", label: "saxophone", hint: "kein Sax" },
  { id: "flute", label: "flute", hint: "keine Querflöte/Blockflöte" },
  { id: "harp", label: "harp", hint: "keine Harfe" },
  { id: "synth pad", label: "synth pad", hint: "keine Flächen-Synths" },
  { id: "arpeggiator", label: "arpeggiator", hint: "keine rhythmisch-rotierenden Noten" },
  { id: "synths", label: "synths", hint: "alle Synthesizer raus" },
  { id: "drums", label: "drums", hint: "keine Drums — oft ungewollt destruktiv" },
  { id: "drum machine", label: "drum machine", hint: "keine programmierten Drums" },
  { id: "hihats", label: "hi-hats", hint: "keine Hi-Hat-Rhythmik" },
  { id: "cymbals", label: "cymbals", hint: "keine Becken" },
  { id: "percussion", label: "percussion", hint: "keine zusätzliche Perkussion" },
  { id: "congas", label: "congas", hint: "keine Latin-Handtrommeln" },
  { id: "shaker", label: "shaker", hint: "keine Shaker/Maracas" },
  { id: "bells", label: "bells", hint: "keine Glocken/Glockenspiel" },
  { id: "choir", label: "choir", hint: "keine Chor-Stimmen" },
  { id: "dembow", label: "dembow", hint: "kein Reggaeton-Beat-Muster" },
];

const EFFECTS: CheckItem[] = [
  { id: "reverb", label: "reverb", hint: "kein Hall/Raum-Effekt" },
  { id: "delay", label: "delay", hint: "kein Echo/Wiederholung" },
  { id: "distortion", label: "distortion", hint: "keine Verzerrung" },
  { id: "chorus", label: "chorus", hint: "kein Schweben/Verdopplung" },
  { id: "flanger", label: "flanger", hint: "kein Kamm-Filter-Jet-Effekt" },
  { id: "autotune", label: "autotune", hint: "keine Tonhöhen-Korrektur auf Vocals" },
  { id: "side-chain", label: "side-chain", hint: "kein Pumping-Effekt" },
  { id: "harsh screech leads", label: "harsh screech leads", hint: "keine schrillen Lead-Synths" },
  { id: "vocal chops", label: "vocal chops", hint: "keine zerschnittenen Stimm-Samples" },
  { id: "sub-bass", label: "sub-bass", hint: "keine tiefen Bassfrequenzen (<60 Hz)" },
  { id: "electronic elements", label: "electronic elements", hint: "rein akustisch, keine Synths/Samples" },
  { id: "lofi filter", label: "lo-fi filter", hint: "keine Bandbreiten-Reduktion/Muff" },
  { id: "bit crush", label: "bit crush", hint: "keine digitale Degradierung" },
  { id: "noise", label: "noise", hint: "kein Rauschen (weiß/rosa)" },
  { id: "drone", label: "drone", hint: "kein anhaltender Dauerton" },
  { id: "ambient wash", label: "ambient wash", hint: "keine diffusen Atmosphären-Flächen" },
  { id: "cinematic riser", label: "cinematic riser", hint: "keine ansteigenden Noise-Builds" },
  { id: "dubstep drop", label: "dubstep drop", hint: "kein Wobble-Drop" },
  { id: "tape saturation", label: "tape saturation", hint: "keine Band-Sättigung/Vintage-Wärme" },
  { id: "vintage warble", label: "vintage warble", hint: "kein analoges Wow/Flutter" },
  { id: "pitch shift", label: "pitch shift", hint: "keine Tonhöhen-Verschiebung" },
  { id: "glitch", label: "glitch", hint: "keine digitalen Störungen/Stutter" },
];

const VOCALS: CheckItem[] = [
  { id: "male vocals", label: "male vocals", hint: "keine männlichen Stimmen" },
  { id: "female vocals", label: "female vocals", hint: "keine weiblichen Stimmen" },
  { id: "duet vocals", label: "duet vocals", hint: "kein Duett/zwei Solo-Stimmen" },
  { id: "choir", label: "choir vocals", hint: "keine Chor-Gesangs-Teile" },
  { id: "spoken words", label: "spoken words", hint: "kein gesprochener Text" },
  { id: "rapping", label: "rapping", hint: "kein Rap/rhythmisches Sprechen" },
  { id: "screaming", label: "screaming", hint: "kein Schreien" },
  { id: "growling", label: "growling", hint: "kein tiefes Metal-Growlen" },
  { id: "falsetto", label: "falsetto", hint: "keine Kopfstimme-Höhe" },
  { id: "autotune vocals", label: "autotune vocals", hint: "keine Auto-Tune-Effekte" },
  { id: "whisper", label: "whisper", hint: "kein (übertriebenes) Flüstern" },
  { id: "child vocals", label: "child vocals", hint: "keine Kinderstimmen" },
  { id: "operatic", label: "operatic", hint: "kein klassischer Operngesang" },
  { id: "rock scream", label: "rock scream", hint: "kein Rock-Schrei-Gesang" },
  { id: "harsh vocals", label: "harsh vocals", hint: "keine extremen/kratzigen Vocals" },
  { id: "guttural", label: "guttural", hint: "kein kehliges Death-Metal-Growling" },
  { id: "nasal", label: "nasal", hint: "kein näselnder Stimmklang" },
  { id: "breathy", label: "breathy excessive", hint: "nicht übermäßig hauchig" },
  { id: "harmonies", label: "harmonies", hint: "keine mehrstimmigen Harmonie-Stacks" },
  { id: "gospel vocals", label: "gospel vocals", hint: "kein Gospel-Chor-Stil" },
];

// Typische Suno-Artefakte und Soundprobleme. Quellen: sunoaiwiki.com,
// howtopromptsuno.com, hookgenius.app, jackrighteous.com, neuralanalog.com.
// Stand: Suno v5.5 (April 2026). Pragmatisch gruppiert in drei Blocks:
// 1) Digitale/AI-Artefakte  2) Mix-/Frequenz-Probleme  3) Vocal-Probleme
// 4) Qualitaets-/Stil-Fallen. "no "-Prefix wird im Builder ergaenzt.
const ARTIFACTS: CheckItem[] = [
  // --- 1) Digitale / AI-Artefakte ---
  { id: "ai artifacts", label: "ai artifacts", hint: "typische AI-Generation-Fehler allgemein" },
  { id: "shimmer artifacts", label: "shimmer artifacts", hint: "hochfrequentes Flimmern, sehr haeufig bei Suno" },
  { id: "warbled sound", label: "warbled sound", hint: "Codec-Warbles (Wow/Flutter-Artefakte)" },
  { id: "chirp artifacts", label: "chirp artifacts", hint: "Kompressions-Chirps (MP3-artig)" },
  { id: "metallic sound", label: "metallic sound", hint: "blechern-metallischer AI-Klang" },
  { id: "robotic artifacts", label: "robotic artifacts", hint: "roboterhafter Klang in Instrumenten" },
  { id: "digital artifacts", label: "digital artifacts", hint: "allgemeine digitale Stoerungen" },
  { id: "aliasing", label: "aliasing", hint: "digitale Frequenz-Spiegelungen" },
  { id: "glitch noise", label: "glitch noise", hint: "ungewollte Stutter/Knacks-Stoerer" },
  { id: "stuttering", label: "stuttering", hint: "ungewollte Wiederholungen/Stotterer" },
  { id: "static noise", label: "static noise", hint: "Rauschen/Knistern im Signal" },
  { id: "compression artifacts", label: "compression artifacts", hint: "hoerbare Lossy-Kompressionsreste" },
  { id: "hiss", label: "hiss", hint: "konstantes Hochton-Rauschen" },

  // --- 2) Mix- / Frequenz-Probleme ---
  { id: "muddy mix", label: "muddy mix", hint: "Frequenzbrei, fehlende Trennung" },
  { id: "muddy bass", label: "muddy bass", hint: "undefinierter, verschmierter Bass" },
  { id: "boxy mids", label: "boxy mids", hint: "kartonig klingende Mitten (200-500 Hz)" },
  { id: "harsh highs", label: "harsh highs", hint: "schrille/zischelige Hoehen" },
  { id: "brittle treble", label: "brittle treble", hint: "sproede/ueberbetonte Top-End" },
  { id: "sibilance", label: "sibilance", hint: "scharfe S/Sch-Laute auf Vocals" },
  { id: "phasing", label: "phasing", hint: "unerwuenschte Phasen-Ausloeschungen" },
  { id: "thin sound", label: "thin sound", hint: "duenner Mix, fehlender Koerper" },
  { id: "hollow sound", label: "hollow sound", hint: "hohler, leerer Gesamtklang" },
  { id: "tinny sound", label: "tinny sound", hint: "blechern, ohne Bass-Fundament" },
  { id: "flat mix", label: "flat mix", hint: "leblos, keine Dynamik/Tiefe" },
  { id: "over-compressed", label: "over-compressed", hint: "totkomprimierter, atemloser Mix" },
  { id: "pumping", label: "pumping", hint: "ungewolltes Sidechain-Atmen" },
  { id: "clipping", label: "clipping", hint: "digitale Uebersteuerung/Knacken" },
  { id: "distorted mix", label: "distorted mix", hint: "verzerrter Gesamtmix (nicht Gitarre)" },
  { id: "mono sound", label: "mono sound", hint: "fehlendes Stereo-Bild" },
  { id: "narrow stereo", label: "narrow stereo", hint: "zu enges Stereo-Panorama" },
  { id: "reverb wash", label: "reverb wash", hint: "zu viel diffuser Hall, alles matscht" },
  { id: "background noise", label: "background noise", hint: "Stoergeraeusche im Hintergrund" },

  // --- 3) Vocal-Probleme ---
  { id: "pitchy vocals", label: "pitchy vocals", hint: "unsaubere Intonation" },
  { id: "robotic vocals", label: "robotic vocals", hint: "mechanisch/unmenschlich" },
  { id: "warbled vocals", label: "warbled vocals", hint: "verzittelte, schwimmende Stimme" },
  { id: "slurred vocals", label: "slurred vocals", hint: "verwaschene Aussprache" },
  { id: "mumbled vocals", label: "mumbled vocals", hint: "genuschelt, unverstaendlich" },
  { id: "rushed syllables", label: "rushed syllables", hint: "gehetzte/verschluckte Silben" },
  { id: "mispronunciation", label: "mispronunciation", hint: "falsch ausgesprochene Woerter" },
  { id: "autotune artifacts", label: "autotune artifacts", hint: "hoerbare Pitch-Correction-Kanten" },
  { id: "breathy excessive", label: "breathy excessive", hint: "uebertrieben hauchige Stimme" },
  { id: "nasal vocals", label: "nasal vocals", hint: "naeselnder Stimmklang" },
  { id: "thin vocals", label: "thin vocals", hint: "duenne, kraftlose Stimme" },
  { id: "muffled vocals", label: "muffled vocals", hint: "gedaempft/verschluckt" },
  { id: "off-key vocals", label: "off-key vocals", hint: "schief gesungen" },
  { id: "unnatural phrasing", label: "unnatural phrasing", hint: "unmenschliches Timing/Phrasierung" },

  // --- 4) Qualitaets- / Stil-Fallen ---
  { id: "lo-fi quality", label: "lo-fi quality", hint: "bewusst niedrige Qualitaet raus" },
  { id: "demo quality", label: "demo quality", hint: "unfertig/skizzenhaft" },
  { id: "garage quality", label: "garage quality", hint: "Kellerproduktion, amateurhaft" },
  { id: "raw recording", label: "raw recording", hint: "ungemasterter Rohklang" },
  { id: "dusty sound", label: "dusty sound", hint: "staubiger Lo-Fi-Filter" },
  { id: "generic sound", label: "generic sound", hint: "austauschbarer Default-Klang" },
  { id: "boring arrangement", label: "boring arrangement", hint: "langweiliges, flaches Arrangement" },
  { id: "repetitive loops", label: "repetitive loops", hint: "zu viel Wiederholung ohne Entwicklung" },
  { id: "style drift", label: "style drift", hint: "Genre-Wechsel mittendrin" },
  { id: "abrupt ending", label: "abrupt ending", hint: "harter, unaufgeloester Track-Abbruch" },
  { id: "long fade out", label: "long fade out", hint: "ausgedehntes Fade-Out vermeiden" },
  { id: "dated sound", label: "dated sound", hint: "altmodisch, nicht zeitgemaess" },
  { id: "sheen", label: "sheen", hint: "glatte AI-Politur ueber allem" },
];

const EXCLUDE_GENRES: CheckItem[] = [
  { id: "no trap", label: "no trap" },
  { id: "no edm", label: "no EDM" },
  { id: "no pop", label: "no pop" },
  { id: "no hip hop", label: "no hip-hop" },
  { id: "no rap", label: "no rap" },
  { id: "no rock", label: "no rock" },
  { id: "no metal", label: "no metal" },
  { id: "no heavy metal", label: "no heavy metal" },
  { id: "no country", label: "no country" },
  { id: "no jazz", label: "no jazz" },
  { id: "no classical", label: "no classical" },
  { id: "no reggae", label: "no reggae" },
  { id: "no afrobeat", label: "no afrobeat" },
  { id: "no latin", label: "no latin" },
  { id: "no reggaeton", label: "no reggaeton" },
  { id: "no folk", label: "no folk" },
  { id: "no blues", label: "no blues" },
  { id: "no r&b", label: "no R&B" },
  { id: "no soul", label: "no soul" },
  { id: "no gospel", label: "no gospel" },
  { id: "no dubstep", label: "no dubstep" },
  { id: "no techno", label: "no techno" },
  { id: "no house", label: "no house" },
  { id: "no drum and bass", label: "no drum and bass" },
  { id: "no ambient", label: "no ambient" },
  { id: "no orchestra", label: "no orchestral" },
  { id: "no instrumental", label: "no instrumental only" },
];

export const ExcludeStyles = () => {
  const { state, dispatch } = useStore();

  const isExcluded = (id: string) => state.prompt.negatives.includes(id);
  const sel = (pool: CheckItem[]) => state.prompt.negatives.filter((n) => pool.some((i) => i.id === n));

  return (
    <div className="flex flex-col gap-3">
      <AccordionSection title="Ausgeschlossene Instrumente" defaultOpen selectionCount={sel(INSTRUMENTS).length} onClear={() => sel(INSTRUMENTS).forEach((id) => dispatch({ type: "TOGGLE_NEGATIVE", tag: id }))}>
        <CheckList
          items={INSTRUMENTS}
          selected={INSTRUMENTS.filter((i) => isExcluded(i.id)).map((i) => i.id)}
          onToggle={(id) => dispatch({ type: "TOGGLE_NEGATIVE", tag: id })}
         
        />
      </AccordionSection>

      <AccordionSection title="Ausgeschlossene Effekte" selectionCount={sel(EFFECTS).length} onClear={() => sel(EFFECTS).forEach((id) => dispatch({ type: "TOGGLE_NEGATIVE", tag: id }))}>
        <CheckList items={EFFECTS} selected={EFFECTS.filter((i) => isExcluded(i.id)).map((i) => i.id)} onToggle={(id) => dispatch({ type: "TOGGLE_NEGATIVE", tag: id })} />
      </AccordionSection>

      <AccordionSection title="Ausgeschlossene Vocals" optional selectionCount={sel(VOCALS).length} onClear={() => sel(VOCALS).forEach((id) => dispatch({ type: "TOGGLE_NEGATIVE", tag: id }))}>
        <CheckList items={VOCALS} selected={VOCALS.filter((i) => isExcluded(i.id)).map((i) => i.id)} onToggle={(id) => dispatch({ type: "TOGGLE_NEGATIVE", tag: id })} />
      </AccordionSection>

      <AccordionSection title="Artefakte & Soundprobleme" optional selectionCount={sel(ARTIFACTS).length} onClear={() => sel(ARTIFACTS).forEach((id) => dispatch({ type: "TOGGLE_NEGATIVE", tag: id }))}>
        <CheckList items={ARTIFACTS} selected={ARTIFACTS.filter((i) => isExcluded(i.id)).map((i) => i.id)} onToggle={(id) => dispatch({ type: "TOGGLE_NEGATIVE", tag: id })} />
      </AccordionSection>

      <AccordionSection title="Ausgeschlossene Genres" optional selectionCount={sel(EXCLUDE_GENRES).length} onClear={() => sel(EXCLUDE_GENRES).forEach((id) => dispatch({ type: "TOGGLE_NEGATIVE", tag: id }))}>
        <CheckList items={EXCLUDE_GENRES} selected={EXCLUDE_GENRES.filter((i) => isExcluded(i.id)).map((i) => i.id)} onToggle={(id) => dispatch({ type: "TOGGLE_NEGATIVE", tag: id })} />
      </AccordionSection>

      <div className="rounded border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-2 text-[11px] text-[var(--color-text-dim)]">
        <span className="font-medium text-[var(--color-amber)]">Tipp:</span> Negativ-Tags wirken
        schwächer als Positivformulierungen — max. 2–3 stacken, sonst destabilisiert's den Prompt.
      </div>
    </div>
  );
};
