import { AccordionSection } from "@/components/AccordionSection";
import { CheckList, type CheckItem } from "@/content/CheckList";
import { useStore } from "@/store";

const VOICE_TYPES: CheckItem[] = [
  { id: "soprano-f", label: "Sopran (weiblich)", hint: "hoch, leicht" },
  { id: "mezzo-f", label: "Mezzosopran", hint: "mittleres weibliches Register" },
  { id: "alto-f", label: "Alt (weiblich)", hint: "tief-weiblich, warm" },
  { id: "contralto-f", label: "Kontralto", hint: "tiefste Frauenstimme, selten" },
  { id: "coloratura-soprano", label: "Koloratursopran", hint: "agil, virtuos hoch" },
  { id: "dramatic-soprano", label: "Dramatischer Sopran", hint: "kraftvoll, opernhaft" },
  { id: "lyric-soprano", label: "Lyrischer Sopran", hint: "weich, melodisch" },
  { id: "spinto-soprano", label: "Spinto-Sopran", hint: "zwischen lyrisch und dramatisch" },
  { id: "boy-soprano", label: "Knabensopran", hint: "jugendlich, rein" },
  { id: "girl-soprano", label: "Mädchensopran", hint: "hell, kindlich" },
  { id: "countertenor", label: "Countertenor", hint: "höchste Männerstimme, Falsett" },
  { id: "castrato-style", label: "Castrato-Stil", hint: "historischer Hochton-Stil" },
  { id: "lyric-tenor", label: "Lyrischer Tenor", hint: "weicher Tenor" },
  { id: "dramatic-tenor", label: "Dramatischer Tenor", hint: "kraftvoller Tenor" },
  { id: "heldentenor", label: "Heldentenor", hint: "Wagner-Stil, mächtig" },
  { id: "tenor-m", label: "Tenor (allgemein)", hint: "hohe männliche Stimme" },
  { id: "baritone-m", label: "Bariton", hint: "häufigste Männerstimme" },
  { id: "bass-baritone", label: "Bass-Bariton", hint: "dunkel, tief-mittig" },
  { id: "bass-m", label: "Bass", hint: "tiefes männliches Register" },
  { id: "low-range-bass", label: "Tiefer Bass / Oktavist", hint: "extremes Tiefregister" },
  { id: "androgynous", label: "Androgyn", hint: "geschlechtsneutral" },
  { id: "androgynous-ambiguous", label: "Androgyn-Ambivalent", hint: "nicht eindeutig zuordenbar" },
  { id: "child-voice", label: "Kinderstimme", hint: "jung, unausgebildet" },
  { id: "teen-voice", label: "Teenager-Stimme", hint: "brechend oder frisch" },
  { id: "young-adult", label: "Junge Erwachsene", hint: "20er, klar" },
  { id: "mature-voice", label: "Gereifte Stimme", hint: "Mitte 30–50" },
  { id: "elderly-weathered", label: "Älter, verwittert", hint: "rau, lebenserfahren" },
  { id: "robotic-synthetic", label: "Robotisch / Synthetisch", hint: "AI-Voice, Vocoder-Charakter" },
  { id: "duet", label: "Duett (männlich + weiblich)", hint: "zwei Stimmen" },
  { id: "choir", label: "Chor", hint: "mehrstimmig, ensemble" },
  { id: "instrumental", label: "Instrumental", hint: "kein Gesang" },
];

const DELIVERIES: CheckItem[] = [
  { id: "whispered", label: "Whispered", hint: "geflüstert" },
  { id: "spoken", label: "Spoken Word", hint: "gesprochen" },
  { id: "breathy", label: "Breathy", hint: "hauchig" },
  { id: "belted", label: "Belted", hint: "kraftvoll ausgesungen" },
  { id: "powerful", label: "Powerful", hint: "stark, dominant" },
  { id: "gentle", label: "Gentle", hint: "sanft" },
  { id: "aggressive", label: "Aggressive", hint: "aggressiv" },
  { id: "soulful", label: "Soulful", hint: "seelenvoll" },
  { id: "operatic", label: "Operatic", hint: "opernhaft" },
  { id: "rapped", label: "Rapped", hint: "gerappt" },
  { id: "falsetto", label: "Falsetto", hint: "Kopfstimme" },
  { id: "growled", label: "Growled", hint: "geknurrt" },
  { id: "screamed", label: "Screamed", hint: "geschrien" },
  { id: "melismatic", label: "Melismatic", hint: "vokale Verzierungen" },
  { id: "passionate", label: "Passionate", hint: "leidenschaftlich" },
  { id: "longing", label: "Longing", hint: "sehnsuchtsvoll" },
  { id: "vulnerable", label: "Vulnerable", hint: "verletzlich, offen" },
  { id: "confident", label: "Confident", hint: "selbstsicher" },
  { id: "seductive", label: "Seductive", hint: "verführerisch" },
  { id: "sarcastic", label: "Sarcastic", hint: "sarkastisch, trocken" },
  { id: "playful", label: "Playful", hint: "verspielt" },
  { id: "melancholic-del", label: "Melancholic", hint: "schwermütig" },
  { id: "triumphant-del", label: "Triumphant", hint: "triumphierend" },
  { id: "defeated", label: "Defeated", hint: "gebrochen, aufgegeben" },
  { id: "hopeful", label: "Hopeful", hint: "hoffnungsvoll" },
  { id: "cynical", label: "Cynical", hint: "zynisch" },
  { id: "ethereal", label: "Ethereal", hint: "schwebend, unwirklich" },
  { id: "dreamy", label: "Dreamy", hint: "verträumt" },
  { id: "intense", label: "Intense", hint: "intensiv, fokussiert" },
  { id: "restrained", label: "Restrained", hint: "zurückgehalten, kontrolliert" },
  { id: "loose-laid-back", label: "Loose / Laid-back", hint: "locker, hinter dem Beat" },
  { id: "pushed-urgent", label: "Pushed / Urgent", hint: "drängend, vor dem Beat" },
  { id: "rhythmic-staccato", label: "Rhythmic Staccato", hint: "abgehackt, rhythmisch" },
  { id: "legato-flowing", label: "Legato / Flowing", hint: "fließend, gebunden" },
  { id: "crooning", label: "Crooning", hint: "schmelzend, Sinatra-Stil" },
  { id: "chanting", label: "Chanting", hint: "monoton rezitierend" },
  { id: "yodeling", label: "Yodeling", hint: "Jodeln, Registersprünge" },
  { id: "scatting", label: "Scatting", hint: "Jazz-Improvisation mit Silben" },
  { id: "humming", label: "Humming", hint: "summend, geschlossener Mund" },
];

const VOCAL_FX: CheckItem[] = [
  { id: "reverb-drenched", label: "Reverb-drenched", hint: "hallig" },
  { id: "dry-close-mic", label: "Dry close-mic", hint: "nah, trocken" },
  { id: "auto-tuned", label: "Auto-Tuned", hint: "Pitch-korrigiert" },
  { id: "doubled-harmonies", label: "Doubled Harmonies", hint: "gedoppelt" },
  { id: "layered-harmonies", label: "Layered Harmonies", hint: "geschichtet" },
  { id: "lo-fi-filtered", label: "Lo-Fi Filtered", hint: "bandbegrenzt" },
  { id: "bitcrushed", label: "Bitcrusher", hint: "digital zerstückelt" },
  { id: "reversed", label: "Reversed Vocals", hint: "rückwärts" },
  { id: "harmonizer", label: "Harmonizer", hint: "mehrstimmig" },
  { id: "lo-fi-telephone", label: "Lo-Fi Telephone", hint: "bandpass" },
  { id: "radio-effect", label: "Radio Effect", hint: "knarzig" },
  { id: "flanger", label: "Flanger on Vocals", hint: "phasig" },
  { id: "pitch-down", label: "Pitch Shifted Down", hint: "tiefer" },
  { id: "pitch-up", label: "Pitch Shifted Up", hint: "heller" },
  { id: "formant-shift", label: "Formant Shifted", hint: "andere Klangfarbe" },
  { id: "vocoder", label: "Vocoder", hint: "robotisch" },
  { id: "talkbox", label: "Talkbox", hint: "Daft-Punk-Stil" },
  { id: "cathedral-reverb", label: "Cathedral Reverb", hint: "riesige Hallfahne" },
  { id: "plate-reverb", label: "Plate Reverb", hint: "klassischer Studio-Hall" },
  { id: "spring-reverb", label: "Spring Reverb", hint: "fedrig, vintage" },
  { id: "tape-delay-slap", label: "Tape Delay / Slap", hint: "kurzes Echo, Sun-Records" },
  { id: "ping-pong-delay", label: "Ping-Pong Delay", hint: "links-rechts alternierend" },
  { id: "chorus-vocals", label: "Chorus on Vocals", hint: "schwebend-breit" },
  { id: "double-tracked", label: "Double-Tracked", hint: "leicht verstimmt gedoppelt" },
  { id: "comb-filtered", label: "Comb-Filtered", hint: "kammfilter, metallisch" },
  { id: "ring-modulated", label: "Ring-Modulated", hint: "metallisch-alien" },
  { id: "granular-freeze", label: "Granular Freeze", hint: "eingefrorener Ton" },
  { id: "stutter-edit", label: "Stutter Edit", hint: "rhythmisches Stottern" },
  { id: "gated-vocals", label: "Gated Vocals", hint: "abgehackt durch Noise Gate" },
  { id: "sidechain-vocals", label: "Sidechain Pumping", hint: "pumpt mit dem Kick" },
  { id: "underwater", label: "Underwater", hint: "gedämpft, tief" },
  { id: "distorted-vocals", label: "Distorted Vocals", hint: "verzerrt, roh" },
  { id: "chopped-screwed", label: "Chopped & Screwed", hint: "Houston-Stil, verlangsamt" },
  { id: "slowed-reverb", label: "Slowed + Reverb", hint: "Lo-Fi-Trend, träge" },
  { id: "nightcore-sped", label: "Nightcore / Sped-up", hint: "beschleunigt, heller" },
];

const LANGUAGES: CheckItem[] = [
  { id: "lang-de", label: "Deutsch", hint: "DACH-Raum" },
  { id: "lang-en", label: "Englisch", hint: "global, Pop/Rock-Standard" },
  { id: "lang-es", label: "Spanisch", hint: "Spanien, Lateinamerika" },
  { id: "lang-fr", label: "Französisch", hint: "Chanson, romanisch" },
  { id: "lang-it", label: "Italienisch", hint: "Italo-Pop, Canzone" },
  { id: "lang-pt", label: "Portugiesisch", hint: "Brasilien, Fado, Bossa Nova" },
  { id: "lang-ja", label: "Japanisch", hint: "J-Pop, Anime, City Pop" },
  { id: "lang-ko", label: "Koreanisch", hint: "K-Pop" },
  { id: "lang-zh", label: "Mandarin", hint: "Mandopop, Festland-China" },
  { id: "lang-ar", label: "Arabisch", hint: "Naher Osten, Nordafrika" },
  { id: "lang-hi", label: "Hindi", hint: "Indien, Bollywood" },
  { id: "lang-ru", label: "Russisch", hint: "Russland, Osteuropa" },
  { id: "lang-tr", label: "Türkisch", hint: "Türkei, Balkan" },
  { id: "lang-nl", label: "Niederländisch", hint: "Niederlande, Flandern" },
  { id: "lang-sv", label: "Schwedisch", hint: "Schweden-Pop" },
  { id: "lang-fi", label: "Finnisch", hint: "Finnland, Metal-Traditionen" },
  { id: "lang-no", label: "Norwegisch", hint: "Norwegen, Black Metal" },
  { id: "lang-da", label: "Dänisch", hint: "Dänemark" },
  { id: "lang-el", label: "Griechisch", hint: "Neugriechisch, Laïko" },
  { id: "lang-pl", label: "Polnisch", hint: "Polen" },
  { id: "lang-cs", label: "Tschechisch", hint: "Tschechien" },
  { id: "lang-hu", label: "Ungarisch", hint: "Ungarn, Magyar" },
  { id: "lang-ro", label: "Rumänisch", hint: "Rumänien, Moldau" },
  { id: "lang-bg", label: "Bulgarisch", hint: "Bulgarien, balkanisch" },
  { id: "lang-sr", label: "Serbisch", hint: "Serbien, Balkan" },
  { id: "lang-hr", label: "Kroatisch", hint: "Kroatien, adriatisch" },
  { id: "lang-he", label: "Hebräisch", hint: "Israel" },
  { id: "lang-ta", label: "Tamilisch", hint: "Südindien, Tamil Nadu" },
  { id: "lang-bn", label: "Bengalisch", hint: "Bangladesch, Westbengalen" },
  { id: "lang-th", label: "Thailändisch", hint: "Thailand" },
  { id: "lang-vi", label: "Vietnamesisch", hint: "Vietnam" },
  { id: "lang-id", label: "Indonesisch", hint: "Indonesien, Malaysia" },
  { id: "lang-sw", label: "Swahili", hint: "Ostafrika" },
  { id: "lang-yo", label: "Yoruba", hint: "Westafrika, Nigeria" },
  { id: "lang-xh", label: "Xhosa", hint: "Südafrika, Klick-Laute" },
  { id: "lang-zu", label: "Zulu", hint: "Südafrika" },
  { id: "lang-la", label: "Lateinisch", hint: "Antike, sakral, Choral" },
  { id: "lang-grc", label: "Altgriechisch", hint: "Antike, Klassik" },
  { id: "lang-non", label: "Altisländisch", hint: "Wikinger, Old Norse" },
  { id: "lang-ang", label: "Altenglisch", hint: "Beowulf-Zeit, medieval" },
  { id: "lang-sa", label: "Sanskrit", hint: "indo-arisch, Mantras" },
  { id: "lang-kli", label: "Klingonisch", hint: "Star Trek" },
  { id: "lang-sindarin", label: "Sindarin (Elbisch)", hint: "Tolkien" },
  { id: "lang-enya-gaelic", label: "Enya-Gälisch", hint: "neo-keltisch" },
  { id: "lang-simlish", label: "Simlish", hint: "The Sims, Kunstsprache" },
  { id: "lang-glossolalia", label: "Glossolalie", hint: "Zungenrede, bedeutungslos" },
  { id: "lang-phonetic", label: "Phonetische Laute", hint: "Vokal-Texturen" },
  { id: "lang-scat", label: "Scat / Nonsens", hint: "bedeutungslose Silben" },
  { id: "lang-ooh-aah", label: "Oohs & Aahs", hint: "nur Vokale" },
  { id: "lang-whisper-only", label: "Nur Flüstern", hint: "ASMR-artig" },
];

export const Gesang = () => {
  const { state, dispatch } = useStore();

  return (
    <div className="flex flex-col gap-3">
      <AccordionSection
        title="Stimmtyp"
        defaultOpen
        selectionCount={state.prompt.vocalCharacter ? 1 : 0}
        onClear={() => dispatch({ type: "SET_VOCAL_CHARACTER", value: "" })}
      >
        <CheckList
          items={VOICE_TYPES}
          selected={state.prompt.vocalCharacter ? [state.prompt.vocalCharacter] : []}
          onToggle={(id) =>
            dispatch({
              type: "SET_VOCAL_CHARACTER",
              value: state.prompt.vocalCharacter === id ? "" : id,
            })
          }
         
        />
      </AccordionSection>

      <AccordionSection
        title="Vortragsstil"
        selectionCount={state.prompt.vocalDelivery ? 1 : 0}
        onClear={() => dispatch({ type: "SET_VOCAL_DELIVERY", value: "" })}
      >
        <CheckList
          items={DELIVERIES}
          selected={state.prompt.vocalDelivery ? [state.prompt.vocalDelivery] : []}
          onToggle={(id) =>
            dispatch({
              type: "SET_VOCAL_DELIVERY",
              value: state.prompt.vocalDelivery === id ? "" : id,
            })
          }
          placeholder="Vortragsstil suchen..."
        />
      </AccordionSection>

      <AccordionSection title="Vocal Processing / FX" optional>
        <CheckList
          items={VOCAL_FX}
          selected={state.prompt.vocalEffects ? state.prompt.vocalEffects.split(",").map((s) => s.trim()) : []}
          onToggle={(id) => {
            const current = state.prompt.vocalEffects
              ? state.prompt.vocalEffects.split(",").map((s) => s.trim()).filter(Boolean)
              : [];
            const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
            dispatch({ type: "SET_VOCAL_EFFECTS", value: next.join(", ") });
          }}
          placeholder="FX suchen..."
        />
      </AccordionSection>

      <AccordionSection
        title="Gesangssprache"
        optional
        selectionCount={state.prompt.vocalLanguages?.length ?? 0}
        onClear={() =>
          (state.prompt.vocalLanguages ?? []).forEach((id) =>
            dispatch({ type: "TOGGLE_VOCAL_LANGUAGE", language: id })
          )
        }
      >
        <CheckList
          items={LANGUAGES}
          selected={state.prompt.vocalLanguages ?? []}
          onToggle={(id) => dispatch({ type: "TOGGLE_VOCAL_LANGUAGE", language: id })}
          placeholder="Sprache suchen..."
        />
      </AccordionSection>
    </div>
  );
};
