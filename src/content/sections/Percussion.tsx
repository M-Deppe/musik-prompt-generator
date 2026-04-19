import { AccordionSection } from "@/components/AccordionSection";
import { CheckList, type CheckItem } from "@/content/CheckList";
import { useStore } from "@/store";

const PERCUSSION_LAYERS: CheckItem[] = [
  { id: "pc-shaker", label: "Shaker", hint: "geschüttelte Körner, zart" },
  { id: "pc-tambourine", label: "Tambourine", hint: "Schellenkranz, rhythmisch" },
  { id: "pc-clap", label: "Claps", hint: "Handklatschen als Akzent" },
  { id: "pc-snaps", label: "Finger Snaps", hint: "Fingerschnipsen, laid-back" },
  { id: "pc-cowbell", label: "Cowbell", hint: "metallischer Glockenschlag" },
  { id: "pc-woodblock", label: "Woodblock", hint: "hohler Holzton" },
  { id: "pc-triangle", label: "Triangle", hint: "heller metallischer Klingelklang" },
  { id: "pc-tambourine-roll", label: "Tambourine Roll", hint: "gerolltes Tamburin, Build" },
  { id: "pc-bongos", label: "Bongos", hint: "zwei Handtrommeln, Latin" },
  { id: "pc-congas", label: "Congas", hint: "hohe Standtrommeln, Latin" },
  { id: "pc-claves", label: "Claves", hint: "Holzstäbe, Latin" },
  { id: "pc-maracas", label: "Maracas", hint: "gerollte Rasseln, Latin" },
  { id: "pc-guiro", label: "Güiro", hint: "Schrappe, Latin" },
  { id: "pc-cabasa", label: "Cabasa", hint: "Perlenschnur-Rassel" },
  { id: "pc-rattle", label: "Rattle", hint: "Rassel" },
  { id: "pc-sleigh-bells", label: "Sleigh Bells", hint: "Schellen" },
  { id: "pc-finger-cymbals", label: "Finger Cymbals", hint: "zart, orientalisch" },
  { id: "pc-vibraslap", label: "Vibraslap", hint: "Klapperton" },
  { id: "pc-ratchet", label: "Ratchet / Ratsche", hint: "knarrendes Zahnrad" },
  { id: "pc-cuica", label: "Cuica", hint: "Quietschfell, Samba" },
  { id: "pc-surdo-floor", label: "Surdo / Floor Drum", hint: "tiefer Pulsschlag" },
  { id: "pc-rimshot", label: "Rimshot / Cross-Stick", hint: "Rand-Anschlag" },
  { id: "pc-snare-rim", label: "Snare Rim Click", hint: "Rand-Anschlag statt Fell" },
  { id: "pc-kick-ghost", label: "Kick Ghost Notes", hint: "leise Kick-Varianten" },
  { id: "pc-kick-double", label: "Kick Double Tap", hint: "Doppel-Kick" },
  { id: "pc-brush-snare", label: "Brushed Snare Sweep", hint: "Besen auf Snare" },
  { id: "pc-log-drum", label: "Log Drum", hint: "gestimmtes Holz" },
  { id: "pc-agogo", label: "Agogô Bells", hint: "Doppelglocke, Afrobeat" },
];

const WORLD_PERCUSSION: CheckItem[] = [
  { id: "wp-djembe", label: "Djembe", hint: "West-Afrika" },
  { id: "wp-log-drums", label: "Log Drums", hint: "Amapiano" },
  { id: "wp-talking-drum", label: "Talking Drum", hint: "Nigeria" },
  { id: "wp-tabla", label: "Tabla", hint: "India" },
  { id: "wp-taiko", label: "Taiko", hint: "Japan" },
  { id: "wp-frame-drum", label: "Frame Drum", hint: "Rahmentrommel, offen" },
  { id: "wp-cajón", label: "Cajón", hint: "Peru" },
  { id: "wp-timbales", label: "Timbales", hint: "Latin" },
  { id: "wp-guiro", label: "Güiro", hint: "gerillter Kürbis, Schrappe" },
  { id: "wp-agogo", label: "Agogô Bells", hint: "Doppelglocke, Afro-Brazil" },
  { id: "wp-udu", label: "Udu Drum", hint: "Nigeria, Tonkrug" },
  { id: "wp-hang", label: "Hang Drum", hint: "gestimmte Stahlschale" },
  { id: "wp-dundun", label: "Dundun", hint: "Yoruba-Basstrommel" },
  { id: "wp-dundunba", label: "Dundunba", hint: "Großtrommel, Guinea" },
  { id: "wp-bata", label: "Batá Drums", hint: "Yoruba-Ritualtrommeln" },
  { id: "wp-congas-cuban", label: "Congas (Kubaneisch)", hint: "tumba, conga, quinto" },
  { id: "wp-timbales-latin", label: "Timbales (Latin)", hint: "Pauke + Cowbell" },
  { id: "wp-pandeiro", label: "Pandeiro", hint: "brasilianisches Tamburin" },
  { id: "wp-tamborim", label: "Tamborim", hint: "kleines brasilianisches Fell" },
  { id: "wp-repique", label: "Repique", hint: "Samba-Trommel" },
  { id: "wp-caixa", label: "Caixa", hint: "brasilianische Snare" },
  { id: "wp-surdo", label: "Surdo", hint: "Samba-Bassdrum" },
  { id: "wp-berimbau", label: "Berimbau", hint: "Capoeira, Brasilien" },
  { id: "wp-atabaque", label: "Atabaque", hint: "Candomblé-Trommel" },
  { id: "wp-ashiko", label: "Ashiko", hint: "konische Trommel, Westafrika" },
  { id: "wp-doumbek", label: "Doumbek / Darbuka", hint: "Naher Osten" },
  { id: "wp-riq", label: "Riq", hint: "arabisches Tamburin" },
  { id: "wp-def", label: "Def / Daf", hint: "persische Rahmentrommel" },
  { id: "wp-bendir", label: "Bendir", hint: "nordafrikanisch" },
  { id: "wp-zarb", label: "Zarb / Tombak", hint: "iranisch" },
  { id: "wp-kanjira", label: "Kanjira", hint: "südindisch" },
  { id: "wp-mridangam", label: "Mridangam", hint: "klassisch indisch" },
  { id: "wp-ghatam", label: "Ghatam", hint: "indischer Tonkrug" },
  { id: "wp-bodhran", label: "Bodhrán", hint: "irische Rahmentrommel" },
  { id: "wp-steeldrum", label: "Steel Drum / Pan", hint: "Trinidad, Karibik" },
];

const FX_PERCUSSION: CheckItem[] = [
  { id: "fx-riser", label: "Riser", hint: "aufsteigend" },
  { id: "fx-downlifter", label: "Downlifter", hint: "absteigend" },
  { id: "fx-impact", label: "Impact Hit", hint: "großer Aufprall" },
  { id: "fx-sub-drop", label: "Sub Drop", hint: "tiefer Bass-Einschlag" },
  { id: "fx-whoosh", label: "Whoosh/Sweep", hint: "rauschendes Vorbeiziehen" },
  { id: "fx-reverse-cymbal", label: "Reverse Cymbal", hint: "rückwärts Becken vor Einsatz" },
  { id: "fx-glitch", label: "Glitch Hit", hint: "digitaler Stör-Einschlag" },
  { id: "fx-vinyl-crackle", label: "Vinyl Crackle", hint: "Plattenknistern als Textur" },
  { id: "fx-tape-stop", label: "Tape Stop", hint: "Band bremst ab" },
  { id: "fx-braam", label: "Braam", hint: "dunkles Trailer-Blech" },
  { id: "fx-boom", label: "Boom", hint: "tiefer Aufprall" },
  { id: "fx-cinematic-hit", label: "Cinematic Hit", hint: "Filmtrailer" },
  { id: "fx-orchestral-hit", label: "Orchestral Hit", hint: "klassischer Stab" },
  { id: "fx-gunshot", label: "Gunshot", hint: "knallender Schuss" },
  { id: "fx-thunder", label: "Thunder", hint: "Donnergrollen" },
  { id: "fx-bell-hit", label: "Bell Hit", hint: "einzelner Glockenschlag" },
  { id: "fx-tubular-bells", label: "Tubular Bells Accent", hint: "Röhrenglocke" },
  { id: "fx-gong", label: "Gong", hint: "breiter Metallklang" },
  { id: "fx-crash-reverse", label: "Reverse Crash", hint: "rückwärts Becken" },
  { id: "fx-laser-zap", label: "Laser Zap", hint: "Sci-Fi-Perkussion" },
  { id: "fx-8bit-chip", label: "Retro 8-Bit / Chip Blip", hint: "Spielkonsolen-FX" },
  { id: "fx-noise-sweep", label: "Noise Sweep", hint: "weißes Rauschen aufsteigend" },
  { id: "fx-digital-crackle", label: "Digital Crackle", hint: "Datenfehler-Sound" },
];

const LATIN_AFRO_RHYTHMS: CheckItem[] = [
  { id: "lar-clave-son", label: "Clave Son", hint: "2-3 oder 3-2, Basis Salsa" },
  { id: "lar-clave-rumba", label: "Clave Rumba", hint: "afro-kubanisch" },
  { id: "lar-clave-bossa", label: "Clave Bossa", hint: "brasilianisch" },
  { id: "lar-tresillo", label: "Tresillo", hint: "3+3+2-Pattern" },
  { id: "lar-cascara", label: "Cascara", hint: "Timbales-Shellmuster" },
  { id: "lar-marcha", label: "Marcha", hint: "Mambo-Basslinie" },
  { id: "lar-cha-cha", label: "Chá-Chá-Chá", hint: "Cuban son" },
  { id: "lar-mambo", label: "Mambo-Rhythmus", hint: "synkopiert, Latin" },
  { id: "lar-rumba-col", label: "Rumba Colombiana", hint: "6/8-afro" },
  { id: "lar-palmas", label: "Palmas (Flamenco)", hint: "Handklatschen, Spanien" },
  { id: "lar-batucada", label: "Batucada", hint: "brasilianische Sambaschule" },
  { id: "lar-samba-bateria", label: "Samba-Bateria", hint: "volles Trommler-Ensemble" },
  { id: "lar-candombe", label: "Candombe", hint: "Uruguay, afro-rioplatense" },
  { id: "lar-afrobeat-groove", label: "Afrobeat Groove", hint: "Nigeria, Fela-Stil" },
  { id: "lar-highlife", label: "Highlife-Rhythmus", hint: "Ghana" },
  { id: "lar-baiao", label: "Baião", hint: "nordbrasilianischer Groove" },
  { id: "lar-cumbia", label: "Cumbia-Pattern", hint: "Kolumbien" },
];

export const Percussion = () => {
  const { state, dispatch } = useStore();
  const sel = (pool: CheckItem[]) => state.prompt.instruments.filter((p) => pool.some((i) => i.id === p));

  return (
    <div className="flex flex-col gap-3">
      <AccordionSection title="Perkussions-Layer" defaultOpen selectionCount={sel(PERCUSSION_LAYERS).length} onClear={() => sel(PERCUSSION_LAYERS).forEach((id) => dispatch({ type: "TOGGLE_INSTRUMENT", instrument: id }))}>
        <CheckList items={PERCUSSION_LAYERS} selected={sel(PERCUSSION_LAYERS)} onToggle={(id) => dispatch({ type: "TOGGLE_INSTRUMENT", instrument: id })} placeholder="Layer suchen..." />
      </AccordionSection>
      <AccordionSection title="World-Percussion" selectionCount={sel(WORLD_PERCUSSION).length} onClear={() => sel(WORLD_PERCUSSION).forEach((id) => dispatch({ type: "TOGGLE_INSTRUMENT", instrument: id }))}>
        <CheckList items={WORLD_PERCUSSION} selected={sel(WORLD_PERCUSSION)} onToggle={(id) => dispatch({ type: "TOGGLE_INSTRUMENT", instrument: id })} placeholder="World-Perkussion..." />
      </AccordionSection>
      <AccordionSection title="FX-Perkussion" optional selectionCount={sel(FX_PERCUSSION).length} onClear={() => sel(FX_PERCUSSION).forEach((id) => dispatch({ type: "TOGGLE_INSTRUMENT", instrument: id }))}>
        <CheckList items={FX_PERCUSSION} selected={sel(FX_PERCUSSION)} onToggle={(id) => dispatch({ type: "TOGGLE_INSTRUMENT", instrument: id })} placeholder="FX suchen..." />
      </AccordionSection>
      <AccordionSection title="Latin & Afro-Rhythmen" optional selectionCount={sel(LATIN_AFRO_RHYTHMS).length} onClear={() => sel(LATIN_AFRO_RHYTHMS).forEach((id) => dispatch({ type: "TOGGLE_INSTRUMENT", instrument: id }))}>
        <CheckList items={LATIN_AFRO_RHYTHMS} selected={sel(LATIN_AFRO_RHYTHMS)} onToggle={(id) => dispatch({ type: "TOGGLE_INSTRUMENT", instrument: id })} placeholder="Rhythmus suchen..." />
      </AccordionSection>
    </div>
  );
};
