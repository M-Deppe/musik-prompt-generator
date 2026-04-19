import { AccordionSection } from "@/components/AccordionSection";
import { CheckList, type CheckItem } from "@/content/CheckList";
import { useStore } from "@/store";

const QUALITY: CheckItem[] = [
  // Polished / Professional
  { id: "q-polished", label: "polished production", hint: "makellos, professionell" },
  { id: "q-radio-ready", label: "radio-ready mix", hint: "broadcast-Standard" },
  { id: "q-studio-quality", label: "studio quality", hint: "Studioaufnahme-Standard" },
  { id: "q-broadcast", label: "broadcast quality", hint: "TV-/Radio-Qualität" },
  { id: "q-hifi", label: "high-fidelity", hint: "audiophil" },
  { id: "q-pristine", label: "pristine", hint: "unberührt, sauber" },
  { id: "q-crystal", label: "crystal clear master", hint: "glasklar gemastert" },
  { id: "q-audiophile", label: "audiophile mastered", hint: "max. Dynamik, neutral" },
  { id: "q-superaudio", label: "Super-Audio-CD quality", hint: "SACD-Standard, highend" },
  { id: "q-24bit", label: "24-bit 96kHz", hint: "high-res digital" },
  // Analog / Warm
  { id: "q-tape-warmth", label: "tape warmth", hint: "warme Bandkompression" },
  { id: "q-vintage", label: "vintage analog", hint: "Tape, Tube, Vinyl" },
  { id: "q-analog-warm", label: "analog-warm", hint: "Röhren-Sättigung" },
  { id: "q-abbey-road", label: "Abbey Road 1967 sound", hint: "Beatles-Ära, Valve-Pres" },
  { id: "q-motown", label: "Motown compressed", hint: "Hitsville USA, vintage" },
  { id: "q-70s-riaa", label: "70s vinyl master", hint: "RIAA-Kurve, warm" },
  { id: "q-80s-digital", label: "80s digital cold", hint: "frühe CD-Ära, steril" },
  // Raw / Lo-Fi
  { id: "q-raw", label: "raw and organic", hint: "roh, lebendig" },
  { id: "q-gritty", label: "gritty", hint: "rau, schmutzig" },
  { id: "q-lofi", label: "lo-fi filtered", hint: "bandbegrenzt, verrauscht" },
  { id: "q-demo-quality", label: "demo quality", hint: "DIY, unpoliert" },
  { id: "q-bedroom", label: "bedroom low-budget", hint: "Heimstudio, intim" },
  { id: "q-garage-rough", label: "garage-rough", hint: "Keller-Aufnahme, direkt" },
  { id: "q-punk-demo", label: "punk-demo", hint: "rau, schnell aufgenommen" },
  { id: "q-cassette", label: "cassette-generation", hint: "Kassetten-Rauschen" },
  { id: "q-vhs-audio", label: "VHS-audio", hint: "degradiert, Hi-Cut" },
  { id: "q-am-radio", label: "AM-radio", hint: "stark bandbegrenzt" },
  { id: "q-lofi-bandcamp", label: "lo-fi bedroom indie", hint: "Bandcamp-Bedroom-Wave" },
  // Modern / Mastered
  { id: "q-streaming-mastered", label: "streaming-mastered", hint: "-14 LUFS optimiert" },
  { id: "q-vinyl-master", label: "vinyl-master", hint: "für Schallplatte optimiert" },
  { id: "q-90s-adat", label: "90s ADAT sound", hint: "digital, leicht gritty" },
  { id: "q-2000s-mp3", label: "2000s MP3-compressed", hint: "Encoding-Artefakte" },
  { id: "q-loudness-war", label: "2010s loudness-war", hint: "überkomprimiert, platt" },
  { id: "q-dynamic-streaming", label: "2020s dynamic streaming", hint: "dynamisch, modern" },
  { id: "q-boutique-studio", label: "boutique-studio", hint: "Spezialstudio, Charakter" },
];

const SUNO_MAGIC: CheckItem[] = [
  { id: "m-spacious", label: "spacious", hint: "Frequenzraum für Vocals" },
  { id: "m-vocal-forward", label: "vocal-forward", hint: "Stimme priorisiert" },
  { id: "m-wide-stereo", label: "wide stereo field", hint: "breites Stereobild" },
  { id: "m-crisp-high", label: "crisp high-end", hint: "brillante Höhen" },
  { id: "m-warm-bass", label: "warm bass", hint: "satter, warmer Bass" },
  { id: "m-punchy", label: "punchy", hint: "kräftige Transienten" },
  { id: "m-hyper-realistic", label: "[Hyper-Realistic]", hint: "forciert 48kHz in V5" },
  { id: "m-compressed-vocals", label: "compressed vocals", hint: "moderner Pop-Sound" },
  { id: "m-natural-dynamics", label: "natural vocal dynamics", hint: "organisch" },
  { id: "m-gentle-compression", label: "gentle compression", hint: "subtile Politur" },
  { id: "m-cinematic-wide", label: "cinematic wide", hint: "Filmklang, weit" },
  { id: "m-intimate-close", label: "intimate close-miked", hint: "Nähe, vertraut" },
  { id: "m-radio-ready", label: "radio-ready master", hint: "Broadcast, glatt" },
  { id: "m-festival-loud", label: "festival loud", hint: "Open-Air, maximal" },
  { id: "m-club-loud", label: "club-loud", hint: "Dancefloortauglich" },
  { id: "m-listening-mix", label: "listening mix", hint: "Kopfhörer, Dynamik" },
  { id: "m-balanced", label: "balanced mix", hint: "neutral, ausgewogen" },
  { id: "m-sparkling-top", label: "sparkling top end", hint: "schimmernde Höhen" },
  { id: "m-round-bottom", label: "round bottom end", hint: "satter Tiefbass" },
  { id: "m-dynamic-swing", label: "dynamic swing", hint: "lebendiger Dynamikbereich" },
  { id: "m-modern-loud", label: "modern loud", hint: "zeitgemäß komprimiert" },
  { id: "m-audiophile-balanced", label: "audiophile balanced", hint: "max. Transparenz" },
  { id: "m-lush", label: "lush", hint: "üppig, voll, satt" },
  { id: "m-airy", label: "airy", hint: "leicht, offen, Luft" },
  { id: "m-dry-mix", label: "dry mix", hint: "kein Hall, direkt" },
];

const SPACE: CheckItem[] = [
  { id: "sp-intimate", label: "intimate close", hint: "Nahmikrofonie, trocken" },
  { id: "sp-tight-dry", label: "tight dry room", hint: "minimaler Hall" },
  { id: "sp-bedroom", label: "bedroom recording feel", hint: "lo-fi, nah" },
  { id: "sp-vast", label: "vast expansive", hint: "offene Weite" },
  { id: "sp-cathedral", label: "cathedral reverb", hint: "massiver Naturhall" },
  { id: "sp-stadium", label: "stadium reverb", hint: "Hymnen-Raum" },
  { id: "sp-gated", label: "gated reverb", hint: "80s-typisch, schneidet ab" },
  { id: "sp-plate", label: "plate reverb", hint: "klassisch, vokal" },
  { id: "sp-spring", label: "spring reverb", hint: "surf, dub, retro" },
  { id: "sp-tape-delay", label: "tape delay slap", hint: "Echo, vintage" },
  { id: "sp-small-room", label: "small studio room", hint: "kontrolliert, präsent" },
  { id: "sp-large-hall", label: "large concert hall", hint: "Konzertsaal, natürlich" },
  { id: "sp-chamber", label: "studio chamber", hint: "reflektierend, klar" },
  { id: "sp-ambient", label: "ambient reverb", hint: "diffus, fast ohne Quelle" },
  { id: "sp-basement", label: "basement echo", hint: "betonig, rau" },
  { id: "sp-warehouse", label: "warehouse reverb", hint: "industriell, groß" },
  { id: "sp-vocal-booth", label: "vocal booth", hint: "sehr trocken, abgedämpft" },
  { id: "sp-outdoor", label: "outdoor natural", hint: "keine Reflexionen" },
  { id: "sp-forest", label: "forest distance", hint: "natürlich, entfernt" },
  { id: "sp-telephone", label: "through-telephone", hint: "stark gefiltert" },
  { id: "sp-underwater", label: "underwater effect", hint: "stark gedämpft, verzerrt" },
  { id: "sp-lofi-room", label: "lo-fi room", hint: "kein Raum, stumpf" },
  { id: "sp-short-predelay", label: "short pre-delay reverb", hint: "Separation, Tiefe" },
  { id: "sp-huge-ambient", label: "huge ambient pad reverb", hint: "Drone, endlos" },
  { id: "sp-shimmer", label: "shimmer reverb", hint: "hochgestimmte Obertöne" },
];

export const SoundQuality = () => {
  const { state, dispatch } = useStore();
  const sel = (pool: CheckItem[]) =>
    state.prompt.production.filter((p) => pool.some((i) => i.id === p));

  return (
    <div className="flex flex-col gap-3">
      <AccordionSection
        title="Produktions-Qualität"
        defaultOpen
        selectionCount={sel(QUALITY).length}
        onClear={() => sel(QUALITY).forEach((id) => dispatch({ type: "TOGGLE_PRODUCTION", tag: id }))}
      >
        <CheckList
          items={QUALITY}
          selected={sel(QUALITY)}
          onToggle={(id) => dispatch({ type: "TOGGLE_PRODUCTION", tag: id })}
          placeholder={`${QUALITY.length} Quality-Tags...`}
        />
      </AccordionSection>

      <AccordionSection
        title="Suno Magic Words"
        selectionCount={sel(SUNO_MAGIC).length}
        onClear={() => sel(SUNO_MAGIC).forEach((id) => dispatch({ type: "TOGGLE_PRODUCTION", tag: id }))}
      >
        <CheckList
          items={SUNO_MAGIC}
          selected={sel(SUNO_MAGIC)}
          onToggle={(id) => dispatch({ type: "TOGGLE_PRODUCTION", tag: id })}
         
        />
      </AccordionSection>

      <AccordionSection
        title="Raum & Hall"
        optional
        selectionCount={sel(SPACE).length}
        onClear={() => sel(SPACE).forEach((id) => dispatch({ type: "TOGGLE_PRODUCTION", tag: id }))}
      >
        <CheckList
          items={SPACE}
          selected={sel(SPACE)}
          onToggle={(id) => dispatch({ type: "TOGGLE_PRODUCTION", tag: id })}
         
        />
      </AccordionSection>
    </div>
  );
};
