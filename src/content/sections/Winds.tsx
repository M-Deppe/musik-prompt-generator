import { AccordionSection } from "@/components/AccordionSection";
import { CheckList, type CheckItem } from "@/content/CheckList";
import { useStore } from "@/store";

const BRASS: CheckItem[] = [
  { id: "br-trumpet", label: "Trumpet", hint: "Trompete — hell, durchsetzungsstark, Jazz/Pop" },
  { id: "br-trumpet-muted", label: "Muted Trumpet", hint: "gedaempfte Trompete — Noir, Cool Jazz" },
  { id: "br-trombone", label: "Trombone", hint: "Posaune — warm, breit, Big-Band" },
  { id: "br-french-horn", label: "French Horn", hint: "Waldhorn — edel, filmisch-heroisch" },
  { id: "br-tuba", label: "Tuba", hint: "Basslage, Marching-Band, Oompah" },
  { id: "br-flugelhorn", label: "Flügelhorn", hint: "weicher als Trompete — Smooth Jazz" },
  { id: "br-brass-ensemble", label: "Brass Ensemble", hint: "komplette Blechsektion — Soul/Funk" },
  { id: "br-brass-fanfare", label: "Brass Fanfare", hint: "heroische Einleitung — Trailer, Kroenung" },
  { id: "br-brass-stabs", label: "Brass Stabs", hint: "kurze harte Akzente — Funk, Hip-Hop" },
];

const STRINGS: CheckItem[] = [
  { id: "st-violin", label: "Violin", hint: "Geige — hohe Lage, Melodie-Lead" },
  { id: "st-viola", label: "Viola", hint: "Bratsche — mittlere Lage, warm-dunkel" },
  { id: "st-cello", label: "Cello", hint: "Violoncello — tief-lyrisch, emotional" },
  { id: "st-double-bass", label: "Double Bass", hint: "Kontrabass — Jazz-Walking, Klassik-Fundament" },
  { id: "st-string-quartet", label: "String Quartet", hint: "2 Violinen + Viola + Cello — kammermusikalisch" },
  { id: "st-full-strings", label: "Full Strings", hint: "Streichorchester — filmisch, Pop-Ballade" },
  { id: "st-pizzicato", label: "Pizzicato Strings", hint: "gezupft — verspielt, detektivisch" },
  { id: "st-tremolo-strings", label: "Tremolo Strings", hint: "schnelle Wiederholung — Spannung, Horror" },
  { id: "st-staccato-strings", label: "Staccato Strings", hint: "kurz abgehackt — treibend, Action" },
  { id: "st-legato-strings", label: "Legato Strings", hint: "fliessend gebunden — Ballade, Emotional-Peak" },
];

const WOODWINDS: CheckItem[] = [
  { id: "ww-flute", label: "Flute", hint: "Querfloete — hell, luftig, pastoral" },
  { id: "ww-piccolo", label: "Piccolo", hint: "Piccolofloete — sehr hoch, piekend" },
  { id: "ww-clarinet", label: "Clarinet", hint: "warm-flexibel — Jazz, Klezmer, Klassik" },
  { id: "ww-bass-clarinet", label: "Bass Clarinet", hint: "dunkle Bassklarinette — mystisch" },
  { id: "ww-oboe", label: "Oboe", hint: "nasal-durchdringend — Klassik, Filmscore" },
  { id: "ww-bassoon", label: "Bassoon", hint: "Fagott — comedic, dunkel-warm" },
  { id: "ww-saxophone-tenor", label: "Tenor Sax", hint: "klassischer Jazz-Sax — R&B, Rock" },
  { id: "ww-saxophone-alto", label: "Alto Sax", hint: "heller Alto — Pop-Solo, Smooth Jazz" },
  { id: "ww-saxophone-soprano", label: "Soprano Sax", hint: "hoch-nasal — Kenny-G-Stil" },
  { id: "ww-saxophone-baritone", label: "Baritone Sax", hint: "tief-fett — Funk-Riffs" },
  { id: "ww-pan-flute", label: "Pan Flute", hint: "Panfloete — mystisch, andin" },
  { id: "ww-tin-whistle", label: "Tin Whistle", hint: "irische Blechfloete — Celtic, Folk" },
  { id: "ww-shakuhachi", label: "Shakuhachi", hint: "japanische Bambusfloete — meditativ, Zen" },
  { id: "ww-didgeridoo", label: "Didgeridoo", hint: "australisch-aboriginal — drone, erdig" },
];

export const Winds = () => {
  const { state, dispatch } = useStore();
  const sel = (pool: CheckItem[]) => state.prompt.instruments.filter((p) => pool.some((i) => i.id === p));

  return (
    <div className="flex flex-col gap-3">
      <AccordionSection title="Bläser" defaultOpen selectionCount={sel(BRASS).length} onClear={() => sel(BRASS).forEach((id) => dispatch({ type: "TOGGLE_INSTRUMENT", instrument: id }))}>
        <CheckList items={BRASS} selected={sel(BRASS)} onToggle={(id) => dispatch({ type: "TOGGLE_INSTRUMENT", instrument: id })} placeholder="Blech suchen..." />
      </AccordionSection>
      <AccordionSection title="Streicher" selectionCount={sel(STRINGS).length} onClear={() => sel(STRINGS).forEach((id) => dispatch({ type: "TOGGLE_INSTRUMENT", instrument: id }))}>
        <CheckList items={STRINGS} selected={sel(STRINGS)} onToggle={(id) => dispatch({ type: "TOGGLE_INSTRUMENT", instrument: id })} />
      </AccordionSection>
      <AccordionSection title="Holzbläser" optional selectionCount={sel(WOODWINDS).length} onClear={() => sel(WOODWINDS).forEach((id) => dispatch({ type: "TOGGLE_INSTRUMENT", instrument: id }))}>
        <CheckList items={WOODWINDS} selected={sel(WOODWINDS)} onToggle={(id) => dispatch({ type: "TOGGLE_INSTRUMENT", instrument: id })} placeholder="Holz suchen..." />
      </AccordionSection>
    </div>
  );
};
