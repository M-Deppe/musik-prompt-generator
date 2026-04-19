import { AccordionSection } from "@/components/AccordionSection";
import { CheckList, type CheckItem } from "@/content/CheckList";
import { useStore } from "@/store";

const DECADES: CheckItem[] = [
  { id: "era-1920s", label: "1920er", hint: "Jazz Age, Blues, Tin Pan Alley" },
  { id: "era-1930s", label: "1930er", hint: "Big Band, Swing, Delta Blues" },
  { id: "era-1940s", label: "1940er", hint: "Bebop, Western Swing, Jump Blues" },
  { id: "era-early50s", label: "Frühe 50er", hint: "Doo-Wop, Rhythm & Blues, Boogie" },
  { id: "era-late50s", label: "Späte 50er", hint: "Rock'n'Roll, Rockabilly, Vocal Groups" },
  { id: "era-early60s", label: "Frühe 60er", hint: "Surf, Motown, British Beat" },
  { id: "era-late60s", label: "Späte 60er", hint: "Psychedelic, Soul, Proto-Metal" },
  { id: "era-early70s", label: "Frühe 70er", hint: "Funk, Soul, Prog-Rock, Glam" },
  { id: "era-late70s", label: "Späte 70er", hint: "Disco, Punk, New Wave, Krautrock" },
  { id: "era-early80s", label: "Frühe 80er", hint: "Synth-Pop, Post-Punk, Hip-Hop-Geburt" },
  { id: "era-late80s", label: "Späte 80er", hint: "Hair Metal, House, Acid, Rave-Geburt" },
  { id: "era-early90s", label: "Frühe 90er", hint: "Grunge, G-Funk, Shoegaze, Jungle" },
  { id: "era-late90s", label: "Späte 90er", hint: "Trip-Hop, Eurodance, Nu-Metal, Garage" },
  { id: "era-early2000s", label: "Frühe 2000er", hint: "Emo, Crunk, Electroclash, Microhouse" },
  { id: "era-late2000s", label: "Späte 2000er", hint: "Indie Rock, Dubstep-Geburt, Blog-House" },
  { id: "era-early2010s", label: "Frühe 2010er", hint: "Trap, EDM-Boom, Witch House, Seapunk" },
  { id: "era-late2010s", label: "Späte 2010er", hint: "Future Bass, Bedroom Pop, Emo-Revival" },
  { id: "era-early2020s", label: "Frühe 2020er", hint: "Hyperpop, Drill, Phonk, Amapiano" },
  { id: "era-2020s-now", label: "Gegenwart (2024+)", hint: "AI-Ästhetik, Post-Genre, Hyperfusion" },
  { id: "era-timeless", label: "Zeitlos", hint: "kein eindeutiger Zeitstempel" },
];

const PRODUCTION_ERAS: CheckItem[] = [
  { id: "prod-acoustic-age", label: "Akustisch (vor 1925)", hint: "Trichter-Aufnahme, kein Strom" },
  { id: "prod-early-electric", label: "Früh-Elektrisch (1925–45)", hint: "Mikrofon, Mono, 78rpm" },
  { id: "prod-tape-mono", label: "Tape Mono (1945–60)", hint: "Magnetband, mono, warm" },
  { id: "prod-tape-stereo", label: "Tape Stereo (1960–75)", hint: "Multitrack-Tape, Stereo-Bühne" },
  { id: "prod-70s-warm", label: "70s Studio Warm", hint: "Neve-Konsolen, analoger Glanz" },
  { id: "prod-80s-digital", label: "80s Early Digital", hint: "gated Reverb, MIDI, Drum-Machine" },
  { id: "prod-80s-drum-machine", label: "80s Drum Machine", hint: "TR-808/909, LinnDrum, klinisch" },
  { id: "prod-90s-grunge", label: "90s Grunge/Alt", hint: "Distortion, rohe Energie, Steve Albini" },
  { id: "prod-90s-adat", label: "90s ADAT/DAT", hint: "erstes Digital-Tape, klarer Sound" },
  { id: "prod-90s-sampler", label: "90s Sampler-Ära", hint: "MPC, SP-1200, Vinyl-Chops" },
  { id: "prod-2000s-daw", label: "2000s DAW-Revolution", hint: "Pro Tools, Reason, VST-Plugins" },
  { id: "prod-2000s-loudness", label: "2000s Loudness War", hint: "brickwall-limitiert, komprimiert" },
  { id: "prod-2010s-streaming", label: "2010s Streaming-Master", hint: "LUFS-normiert, -14 LUFS" },
  { id: "prod-2010s-trap-prod", label: "2010s Trap-Produktion", hint: "808-dominant, hi-hat rolls" },
  { id: "prod-vintage", label: "Vintage", hint: "Tape-Saturation, analoge Wärme" },
  { id: "prod-retro", label: "Retro", hint: "klare Epochen-Referenz" },
  { id: "prod-modern", label: "Modern", hint: "aktuelle Produktions-Standards" },
  { id: "prod-lofi", label: "Lo-Fi", hint: "bewusst rau, verrauscht" },
  { id: "prod-hifi", label: "Hi-Fi", hint: "makellos, audiophil" },
  { id: "prod-underground", label: "Underground", hint: "roh, unpoliert" },
  { id: "prod-radio", label: "Radio-Ready", hint: "broadcast-tauglich, geloudet" },
  { id: "prod-bedroom", label: "Bedroom", hint: "intim, DIY-Feel" },
];

const KLANG_REFERENZ: CheckItem[] = [
  { id: "ref-motown-funk-brothers", label: "Motown Funk Brothers", hint: "Hitsville USA, Detroit 1959–72" },
  { id: "ref-wall-of-sound", label: "Wall of Sound", hint: "Phil Spector, layered orchestration" },
  { id: "ref-spector-drums", label: "Spector Drums", hint: "Live-Echo-Chamber, massive Snare" },
  { id: "ref-abbey-road-66", label: "Abbey Road 1966", hint: "Beatles-Ära, EMI TG12345" },
  { id: "ref-studio-one-kingston", label: "Studio One Kingston", hint: "Coxsone Dodd, Reggae-Fundament" },
  { id: "ref-muscle-shoals", label: "Muscle Shoals Sound", hint: "Soul, Swampers, warme Rhythms" },
  { id: "ref-sun-studio", label: "Sun Studio Memphis", hint: "Tape-Slap, rockabilly echo" },
  { id: "ref-fame-studios", label: "FAME Studios", hint: "Aretha, Wilson Pickett, Southern Soul" },
  { id: "ref-stax-memphis", label: "Stax Memphis", hint: "Booker T., raw soul, echokammer" },
  { id: "ref-chess-records", label: "Chess Records Chicago", hint: "Blues, R&B, Chess Studio reverb" },
  { id: "ref-dfa-records", label: "DFA Records 2000s", hint: "LCD Soundsystem, New York groove" },
  { id: "ref-trident-studios", label: "Trident Studios London", hint: "Bowie, Queen, A-Range-Konsole" },
  { id: "ref-electric-lady", label: "Electric Lady Studios", hint: "Hendrix, NYC, warme Akustik" },
  { id: "ref-record-plant", label: "Record Plant NYC", hint: "Lennon, Springsteen, 70s Rock" },
  { id: "ref-compass-point", label: "Compass Point Nassau", hint: "AC/DC, Grace Jones, tropisch" },
  { id: "ref-pye-studios", label: "Pye Studios London", hint: "Kinks, Donovan, British 60s" },
  { id: "ref-conny-plank", label: "Conny Plank Studio", hint: "Kraftwerk, Neu!, Krautrock-Ästhetik" },
  { id: "ref-hansa-berlin", label: "Hansa Studios Berlin", hint: "Bowie Berlin-Trilogie, Iggy Pop" },
  { id: "ref-larrabee-la", label: "Larrabee Studios LA", hint: "West-Coast-Glanz, smooth 90s" },
  { id: "ref-skywalker-sound", label: "Skywalker Sound", hint: "Filmsound, große Akustik" },
  { id: "ref-sarm-west", label: "SARM West London", hint: "Trevor Horn, Frankie, ZTT-Sound" },
  { id: "ref-town-house", label: "Townhouse Studios London", hint: "gated reverb Origin, Phil Collins" },
];

export const Aera = () => {
  const { state, dispatch } = useStore();

  const selectedDecades = state.prompt.production.filter((p) => DECADES.some((d) => d.id === p));
  const selectedProd = state.prompt.production.filter((p) => PRODUCTION_ERAS.some((d) => d.id === p));
  const selectedRef = state.prompt.production.filter((p) => KLANG_REFERENZ.some((d) => d.id === p));

  return (
    <div className="flex flex-col gap-3">
      <AccordionSection
        title="Jahrzehnt / Epoche"
        defaultOpen
        selectionCount={selectedDecades.length}
        onClear={() => selectedDecades.forEach((id) => dispatch({ type: "TOGGLE_PRODUCTION", tag: id }))}
      >
        <CheckList
          items={DECADES}
          selected={selectedDecades}
          onToggle={(id) => dispatch({ type: "TOGGLE_PRODUCTION", tag: id })}
         
        />
      </AccordionSection>

      <AccordionSection
        title="Produktions-Ära"
        selectionCount={selectedProd.length}
        onClear={() => selectedProd.forEach((id) => dispatch({ type: "TOGGLE_PRODUCTION", tag: id }))}
      >
        <CheckList
          items={PRODUCTION_ERAS}
          selected={selectedProd}
          onToggle={(id) => dispatch({ type: "TOGGLE_PRODUCTION", tag: id })}
         
        />
      </AccordionSection>

      <AccordionSection
        title="Klang-Referenz"
        optional
        selectionCount={selectedRef.length}
        onClear={() => selectedRef.forEach((id) => dispatch({ type: "TOGGLE_PRODUCTION", tag: id }))}
      >
        <CheckList
          items={KLANG_REFERENZ}
          selected={selectedRef}
          onToggle={(id) => dispatch({ type: "TOGGLE_PRODUCTION", tag: id })}
         
        />
      </AccordionSection>
    </div>
  );
};
