import { AccordionSection } from "@/components/AccordionSection";
import { CheckList, type CheckItem } from "@/content/CheckList";
import { useStore } from "@/store";

const GUITAR_TYPE: CheckItem[] = [
  { id: "g-telecaster", label: "Telecaster", hint: "Fender — jangly-hell, Country/Indie" },
  { id: "g-strat", label: "Stratocaster", hint: "Fender — glockig, vielseitig, Classic Rock" },
  { id: "g-lespaul", label: "Les Paul", hint: "Gibson — warm-fett, Rock/Blues/Metal" },
  { id: "g-hollowbody", label: "Hollowbody", hint: "Halbakustik — Jazz, resonant-warm" },
  { id: "g-acoustic-steel", label: "Acoustic Steel-String", hint: "Westerngitarre — Folk, Singer-Songwriter" },
  { id: "g-nylon", label: "Nylon String", hint: "Konzertgitarre — Klassik, Bossa, Flamenco" },
  { id: "g-12-string", label: "12-String", hint: "schimmernd-voll — Byrds, Folk-Rock" },
  { id: "g-baritone", label: "Baritone", hint: "tief gestimmt — Surf, Metal, dunkel" },
  { id: "g-slide", label: "Slide Guitar", hint: "Bottleneck — Blues, Delta, psychedelisch" },
  { id: "g-pedal-steel", label: "Pedal Steel", hint: "Country-typisch, schwebend weinerlich" },
  { id: "g-banjo", label: "Banjo", hint: "pluckernd-percussiv — Bluegrass, Folk" },
  { id: "g-mandolin", label: "Mandoline", hint: "hoch-tremoliert — Folk, italienisch" },
  { id: "g-ukulele", label: "Ukulele", hint: "klein-hawaiianisch — verspielt, Indie-Pop" },
  { id: "g-rhodes-clav", label: "Clavinet", hint: "percussive Tasten — Funk (gehoert eigentlich zu Tasten)" },
];

const PEDAL_AMP: CheckItem[] = [
  { id: "amp-clean", label: "Clean", hint: "unverzerrt — klar, Jazz/Pop" },
  { id: "amp-crunch", label: "Crunch", hint: "leichte Uebersteuerung — Indie, Classic Rock" },
  { id: "amp-overdrive", label: "Overdrive", hint: "warm-offen — Blues, Rock" },
  { id: "amp-distortion", label: "Distortion", hint: "heavy — Metal, Punk" },
  { id: "amp-fuzz", label: "Fuzz", hint: "vintage-buzzy — Hendrix, Stoner" },
  { id: "amp-chorus", label: "Chorus", hint: "breit-schwebend — 80s Clean-Tone" },
  { id: "amp-flanger", label: "Flanger", hint: "metallisch-jet — Retro, Prog" },
  { id: "amp-phaser", label: "Phaser", hint: "pulsierend — Funk, Prog-Rock" },
  { id: "amp-reverb", label: "Spring Reverb", hint: "Federhall — Surf, Vintage" },
  { id: "amp-tremolo", label: "Tremolo", hint: "pulsierende Lautstaerke — Surf, Indie" },
  { id: "amp-wah", label: "Wah", hint: "expressives Filter — Funk, Hendrix-Solo" },
  { id: "amp-delay", label: "Delay", hint: "Echo/Wiederholung — U2, Dream-Pop" },
  { id: "amp-octaver", label: "Octaver", hint: "fuegt Oktave hinzu — bass-schwer, synth-artig" },
];

const PLAYSTYLE: CheckItem[] = [
  { id: "g-fingerpicked", label: "Fingerpicked", hint: "Fingerzupfen — sanft, perlend, Folk" },
  { id: "g-strumming", label: "Strumming", hint: "akkordisches Anschlagen — Indie, Pop" },
  { id: "g-arpeggios", label: "Arpeggios", hint: "Akkordtoene nacheinander — traeumerisch" },
  { id: "g-riff", label: "Riff-driven", hint: "wiederkehrendes Haupt-Motiv — Rock/Metal" },
  { id: "g-power-chords", label: "Power Chords", hint: "Quinten ohne Terz — Punk, Rock" },
  { id: "g-palm-muted", label: "Palm-Muted", hint: "Handballen dampft — chug, Metal" },
  { id: "g-shredding", label: "Shredding", hint: "Highspeed-Solos — Virtuosen-Metal" },
  { id: "g-tapping", label: "Tapping", hint: "beide Haende tippen — Van Halen, Prog" },
  { id: "g-slide-play", label: "Slide Playing", hint: "Bottleneck-Glide — Blues, Country" },
  { id: "g-flamenco", label: "Flamenco", hint: "spanische Rhythmus-Technik, Rasgueado" },
  { id: "g-travis-picking", label: "Travis Picking", hint: "Daumen-Bass + Finger-Melodie — Country" },
];

const ROLE: CheckItem[] = [
  { id: "g-lead", label: "Lead", hint: "fuehrt Melodie/Solo" },
  { id: "g-rhythm", label: "Rhythm", hint: "Akkord-Begleitung, haelt Groove" },
  { id: "g-layered", label: "Doubled/Layered", hint: "mehrfach geschichtet — breit, voll" },
  { id: "g-atmospheric", label: "Atmospheric Pads", hint: "Gitarre als Flaeche statt Motiv" },
  { id: "g-counter", label: "Counter-Melodie", hint: "zweite Stimme unter/ueber Haupt-Melodie" },
];

export const Guitars = () => {
  const { state, dispatch } = useStore();
  const sel = (pool: CheckItem[]) => state.prompt.instruments.filter((p) => pool.some((i) => i.id === p));

  return (
    <div className="flex flex-col gap-3">
      <AccordionSection title="Gitarren-Typ" defaultOpen selectionCount={sel(GUITAR_TYPE).length} onClear={() => sel(GUITAR_TYPE).forEach((id) => dispatch({ type: "TOGGLE_INSTRUMENT", instrument: id }))}>
        <CheckList items={GUITAR_TYPE} selected={sel(GUITAR_TYPE)} onToggle={(id) => dispatch({ type: "TOGGLE_INSTRUMENT", instrument: id })} placeholder="Gitarre suchen..." />
      </AccordionSection>
      <AccordionSection title="Pedalboard & Amp-Sound" selectionCount={sel(PEDAL_AMP).length} onClear={() => sel(PEDAL_AMP).forEach((id) => dispatch({ type: "TOGGLE_INSTRUMENT", instrument: id }))}>
        <CheckList items={PEDAL_AMP} selected={sel(PEDAL_AMP)} onToggle={(id) => dispatch({ type: "TOGGLE_INSTRUMENT", instrument: id })} placeholder="Pedals/Amp..." />
      </AccordionSection>
      <AccordionSection title="Spielweise" selectionCount={sel(PLAYSTYLE).length} onClear={() => sel(PLAYSTYLE).forEach((id) => dispatch({ type: "TOGGLE_INSTRUMENT", instrument: id }))}>
        <CheckList items={PLAYSTYLE} selected={sel(PLAYSTYLE)} onToggle={(id) => dispatch({ type: "TOGGLE_INSTRUMENT", instrument: id })} />
      </AccordionSection>
      <AccordionSection title="Rolle" optional selectionCount={sel(ROLE).length} onClear={() => sel(ROLE).forEach((id) => dispatch({ type: "TOGGLE_INSTRUMENT", instrument: id }))}>
        <CheckList items={ROLE} selected={sel(ROLE)} onToggle={(id) => dispatch({ type: "TOGGLE_INSTRUMENT", instrument: id })} />
      </AccordionSection>
    </div>
  );
};
