import { AccordionSection } from "@/components/AccordionSection";
import { CheckList, type CheckItem } from "@/content/CheckList";
import { useStore } from "@/store";

const THEMES: CheckItem[] = [
  { id: "th-love", label: "Liebe", hint: "romantisch, verliebt" },
  { id: "th-heartbreak", label: "Liebeskummer", hint: "Trennung, Verlust" },
  { id: "th-longing", label: "Sehnsucht", hint: "vermissen, hoffen" },
  { id: "th-unrequited-love", label: "Unerwiderte Liebe", hint: "unerfüllte Gefühle" },
  { id: "th-new-love", label: "Neue Liebe", hint: "Schmetterlinge, Anfang" },
  { id: "th-long-distance", label: "Fernbeziehung", hint: "Abstand, Vermissen" },
  { id: "th-obsession", label: "Obsession", hint: "besessen, nicht loslassen" },
  { id: "th-jealousy", label: "Eifersucht", hint: "Misstrauen, Kontrollverlust" },
  { id: "th-friendship", label: "Freundschaft", hint: "Loyalität, Verbindung" },
  { id: "th-family", label: "Familie", hint: "Eltern, Geschwister, Wurzeln" },
  { id: "th-childhood", label: "Kindheit", hint: "Unschuld, frühe Erinnerungen" },
  { id: "th-nature", label: "Natur", hint: "Landschaft, Jahreszeiten" },
  { id: "th-sea", label: "Meer & Ozean", hint: "Wellen, Tiefe, Weite" },
  { id: "th-mountains", label: "Berge & Gipfel", hint: "Höhe, Wildnis, Stille" },
  { id: "th-forest", label: "Wald & Natur", hint: "grün, ruhig, lebendig" },
  { id: "th-seasons", label: "Jahreszeiten", hint: "Frühling, Sommer, Herbst, Winter" },
  { id: "th-weather", label: "Wetter", hint: "Regen, Sturm, Sonne, Schnee" },
  { id: "th-night", label: "Nacht", hint: "Dunkelheit, Traum, Mond" },
  { id: "th-dawn", label: "Morgengrauen", hint: "Aufgang, Neubeginn" },
  { id: "th-city", label: "Stadt", hint: "urban, Straßen, Neon" },
  { id: "th-suburbia", label: "Vorstadt", hint: "Alltag, Mittelmäßigkeit" },
  { id: "th-road-trip", label: "Road Trip", hint: "Reise, Autobahn, Freiheit" },
  { id: "th-travel", label: "Reisen & Fernweh", hint: "neue Orte, Abenteuer" },
  { id: "th-exile", label: "Exil & Fremde", hint: "Heimatlosigkeit, Fremdheit" },
  { id: "th-homecoming", label: "Heimkehr", hint: "Rückkehr, Ankommen" },
  { id: "th-party", label: "Party", hint: "Club, Feiern, Dancefloor" },
  { id: "th-escape", label: "Flucht", hint: "raus aus dem Alltag" },
  { id: "th-freedom", label: "Freiheit", hint: "Aufbruch, Wind, Weg" },
  { id: "th-rebellion", label: "Rebellion", hint: "Widerstand, Kampf" },
  { id: "th-self-doubt", label: "Selbstzweifel", hint: "innere Unsicherheit" },
  { id: "th-self-discovery", label: "Selbstfindung", hint: "wer bin ich wirklich" },
  { id: "th-identity", label: "Identität", hint: "Zugehörigkeit, Rolle" },
  { id: "th-gender", label: "Geschlecht & Körper", hint: "Gender, Körperbild" },
  { id: "th-growing-up", label: "Erwachsenwerden", hint: "Reifung, Übergang" },
  { id: "th-aging", label: "Altern", hint: "Zeit, Vergänglichkeit" },
  { id: "th-hope", label: "Hoffnung", hint: "Licht, Zuversicht" },
  { id: "th-spiritual", label: "Spiritualität", hint: "Glaube, Transzendenz" },
  { id: "th-religion", label: "Religion & Glaube", hint: "Gottsuche, Ritual" },
  { id: "th-philosophy", label: "Philosophie", hint: "Sinn, Wahrheit, Sein" },
  { id: "th-existential", label: "Existenz & Sinn", hint: "wozu das alles?" },
  { id: "th-money", label: "Geld & Erfolg", hint: "Aufstieg, Hustle" },
  { id: "th-work", label: "Arbeit & Alltag", hint: "9-to-5, Routine" },
  { id: "th-failure", label: "Scheitern", hint: "Rückschlag, Niederlage" },
  { id: "th-story", label: "Geschichte / Narrative", hint: "Erzählung" },
  { id: "th-social", label: "Gesellschaft & Politik", hint: "sozialkritisch" },
  { id: "th-war", label: "Krieg & Konflikt", hint: "Gewalt, Zerstörung" },
  { id: "th-peace", label: "Frieden", hint: "Versöhnung, Harmonie" },
  { id: "th-environment", label: "Umwelt & Klima", hint: "Natur retten, Krise" },
  { id: "th-technology", label: "Technologie", hint: "Zukunft, Maschinen" },
  { id: "th-internet", label: "Internet & Digital", hint: "Online-Welt, Memes" },
  { id: "th-social-media", label: "Social Media", hint: "Likes, Performance, Fake" },
  { id: "th-pandemic", label: "Pandemie & Isolation", hint: "Corona, Lockdown" },
  { id: "th-mental-health", label: "Mental Health", hint: "Psyche, Healing" },
  { id: "th-trauma", label: "Trauma", hint: "Wunde, Verdrängung" },
  { id: "th-healing", label: "Heilung", hint: "Genesung, Weitermachen" },
  { id: "th-addiction", label: "Sucht", hint: "Abhängigkeit, Entzug" },
  { id: "th-nostalgia", label: "Nostalgie", hint: "Kindheit, Vergangenheit" },
  { id: "th-memory", label: "Erinnerung", hint: "Flashback, Verblassen" },
  { id: "th-dreams", label: "Träume", hint: "Schlaf, Unterbewusstsein" },
  { id: "th-visions", label: "Visionen", hint: "Prophetie, Halluzination" },
  { id: "th-memento-mori", label: "Memento Mori", hint: "Vergänglichkeit, Tod" },
  { id: "th-afterlife", label: "Jenseits", hint: "Tod, Transzendenz" },
  { id: "th-fantasy", label: "Fantasy", hint: "Magie, Mythos" },
  { id: "th-scifi", label: "Sci-Fi", hint: "Zukunft, Weltraum" },
  { id: "th-horror", label: "Horror", hint: "Grusel, Albtraum" },
  { id: "th-mythology", label: "Mythologie", hint: "Götter, Legenden" },
  { id: "th-art-music", label: "Kunst & Musik", hint: "kreative Selbstreflexion" },
  { id: "th-dance", label: "Tanz & Bewegung", hint: "Körper, Rhythmus" },
  { id: "th-sport", label: "Sport & Wettkampf", hint: "Sieg, Ausdauer" },
  { id: "th-community", label: "Gemeinschaft", hint: "Zusammenhalt, Einheit" },
  { id: "th-solitude", label: "Einsamkeit", hint: "allein, aber nicht verloren" },
  { id: "th-loneliness", label: "Isolation", hint: "abgeschnitten, unverstanden" },
  { id: "th-power", label: "Macht & Kontrolle", hint: "Dominanz, Hierarchie" },
  { id: "th-justice", label: "Gerechtigkeit", hint: "Recht, Fairness" },
  { id: "th-time", label: "Zeit", hint: "Vergehen, Endlichkeit" },
  { id: "th-parallel-worlds", label: "Parallelwelten", hint: "alternative Realitäten" },
  { id: "th-history", label: "Geschichte & Vergangenheit", hint: "historisch, Epoche" },
  { id: "th-future-vision", label: "Zukunftsvision", hint: "Utopie, Dystopie" },
  { id: "th-pop-culture", label: "Popkultur", hint: "Referenzen, Zitate" },
  { id: "th-night-life", label: "Nachtleben", hint: "Clubs, Bars, Nacht" },
  { id: "th-anonymity", label: "Anonymität", hint: "unsichtbar, namenlos" },
  { id: "th-revenge", label: "Rache", hint: "Vergeltung, Rückkehr" },
  { id: "th-forgiveness", label: "Vergebung", hint: "loslassen, Frieden schließen" },
];

const USE_CASES: CheckItem[] = [
  { id: "uc-club", label: "Club / DJ-Set", hint: "Dancefloor, druckvolle Kick" },
  { id: "uc-radio", label: "Radio-Single", hint: "Hook früh, 3-Minuten-Format" },
  { id: "uc-film", label: "Filmmusik / Score", hint: "dient der Szene, nie dominant" },
  { id: "uc-trailer", label: "Trailer / Cinematic", hint: "Build + Drop, epische Höhen" },
  { id: "uc-videogame", label: "Videospiel-OST", hint: "loopbar, nicht ermüdend" },
  { id: "uc-podcast-intro", label: "Podcast-Intro / Jingle", hint: "5-15 Sek, wiedererkennbar" },
  { id: "uc-radio-jingle", label: "Radio-Jingle", hint: "kurz, einprägsam" },
  { id: "uc-festival-closer", label: "Festival-Closer", hint: "großes Finale" },
  { id: "uc-nightclub", label: "Nightclub / Late Night", hint: "ab 01:00, hypnotisch" },
  { id: "uc-after-hours", label: "After-Hours", hint: "Morgengrauen-Vibe" },
  { id: "uc-chill-lounge", label: "Chill Lounge", hint: "entspannte Bar" },
  { id: "uc-restaurant-bg", label: "Restaurant-Hintergrund", hint: "unaufdringlich, keine Vocals" },
  { id: "uc-spa-yoga", label: "Spa / Yoga", hint: "Wellness, ruhig" },
  { id: "uc-workout", label: "Workout / Gym", hint: "treibend, motivierend" },
  { id: "uc-running", label: "Running / Joggen", hint: "konstantes Tempo 150-170 BPM" },
  { id: "uc-cycling", label: "Cycling / Fahrrad", hint: "Cadence-Unterstützung" },
  { id: "uc-lifting", label: "Lifting / Kraftsport", hint: "harte Hooks, Aggression" },
  { id: "uc-boxing", label: "Boxing / Kampfsport", hint: "hart, aggressiv, anfeuernd" },
  { id: "uc-study", label: "Study / Focus", hint: "instrumental, nicht ablenkend" },
  { id: "uc-sleep", label: "Sleep / Relax", hint: "sehr ruhig, sanft einschlafend" },
  { id: "uc-meditation", label: "Meditation / Yoga", hint: "meditativ, drone-artig" },
  { id: "uc-background", label: "Hintergrund / Café", hint: "dezent, keine Aufmerksamkeit" },
  { id: "uc-commercial", label: "Werbung / Jingle", hint: "einprägsam, 15-30 Sek" },
  { id: "uc-wedding", label: "Hochzeit / Fest", hint: "feierlich, emotional" },
  { id: "uc-funeral", label: "Beerdigung / Trauer", hint: "würdevoll, still" },
  { id: "uc-kids-birthday", label: "Kindergeburtstag", hint: "fröhlich, bunt, einfach" },
  { id: "uc-christmas", label: "Weihnachten / Advent", hint: "besinnlich, Glocken, warm" },
  { id: "uc-halloween", label: "Halloween / Horror-Event", hint: "spooky, unheimlich" },
  { id: "uc-intro", label: "Intro / Outro", hint: "kurz, rahmt Content" },
  { id: "uc-twitch", label: "Twitch-Stream-BG", hint: "loopbar, nicht ablenkend" },
  { id: "uc-youtube-outro", label: "YouTube-Outro", hint: "15-30 Sek, Outro-Stil" },
  { id: "uc-tiktok", label: "TikTok / Social Hook", hint: "15 Sek, sofort fesselnd" },
  { id: "uc-instagram-reel", label: "Instagram Reel", hint: "30 Sek, Hook-driven" },
  { id: "uc-gaming", label: "Gaming / E-Sports", hint: "intensiv, energetisch" },
  { id: "uc-corporate", label: "Corporate / Präsentation", hint: "neutral, motivierend" },
  { id: "uc-documentary", label: "Dokumentarfilm", hint: "zurückhaltend, unterstützend" },
  { id: "uc-fashion-show", label: "Fashion Show / Runway", hint: "pulsierend, markant" },
  { id: "uc-art-installation", label: "Kunstinstallation", hint: "experimentell, loopbar" },
  { id: "uc-theater", label: "Theater / Bühne", hint: "dramatisch, szenisch" },
  { id: "uc-short-film", label: "Kurzfilm", hint: "konzise, emotional tragend" },
  { id: "uc-alarm-ringtone", label: "Klingelton / Alarm", hint: "kurz, sofort auffällig" },
];

const LYRICAL_TONE: CheckItem[] = [
  { id: "lt-poetic", label: "Poetisch", hint: "bildhaft, metaphorisch" },
  { id: "lt-direct", label: "Direkt", hint: "klar, unverblümt" },
  { id: "lt-cryptic", label: "Kryptisch", hint: "rätselhaft" },
  { id: "lt-humorous", label: "Humorvoll", hint: "witzig" },
  { id: "lt-sarcastic", label: "Sarkastisch", hint: "ironisch-beißend" },
  { id: "lt-intimate", label: "Intim", hint: "persönlich, nah" },
  { id: "lt-anthemic", label: "Hymnenhaft", hint: "mitzusingen" },
  { id: "lt-storytelling", label: "Narrativ", hint: "Geschichte erzählend" },
  { id: "lt-stream-of-consciousness", label: "Stream of Consciousness", hint: "frei assoziativ" },
  { id: "lt-vulnerable", label: "Verletzlich", hint: "offen, emotional" },
  { id: "lt-bragging", label: "Bragging", hint: "selbstbewusst, Show-off" },
  { id: "lt-minimalist", label: "Minimalistisch", hint: "wenige Worte" },
  { id: "lt-abstract", label: "Abstrakt", hint: "konzeptuell, nicht konkret" },
  { id: "lt-concrete", label: "Konkret", hint: "spezifisch, bildlich" },
  { id: "lt-nostalgic", label: "Nostalgisch", hint: "sehnsuchtsvoll rückwärtsgewandt" },
  { id: "lt-futuristic", label: "Futuristisch", hint: "vorwärtsgewandt, visionär" },
  { id: "lt-mystical", label: "Mystisch", hint: "übernatürlich, spirituell" },
  { id: "lt-profane", label: "Profan / Vulgär", hint: "explizit, unzensiert" },
  { id: "lt-sacred", label: "Sakral", hint: "heilig, erhaben" },
  { id: "lt-provocative", label: "Provokant", hint: "herausfordernd, anstoßend" },
  { id: "lt-confessional", label: "Beichtend", hint: "geständnisartig, ehrlich" },
  { id: "lt-playful", label: "Verspielt", hint: "leicht, unbeschwert" },
  { id: "lt-dark", label: "Dunkel & Düster", hint: "pessimistisch, nihilistisch" },
  { id: "lt-philosophical", label: "Philosophisch", hint: "tiefgründig, sinnierend" },
  { id: "lt-ironic", label: "Ironisch", hint: "das Gegenteil meinen" },
  { id: "lt-documentary", label: "Dokumentarisch", hint: "faktisch, berichtend" },
];

const NARRATIVE_PERSPECTIVE: CheckItem[] = [
  { id: "narr-first-person", label: "Ich-Perspektive", hint: "persönlich, ich erlebe es" },
  { id: "narr-second-person", label: "Du-Perspektive", hint: "direkt angesprochen" },
  { id: "narr-third-person", label: "Er/Sie-Perspektive", hint: "beobachtend, distanziert" },
  { id: "narr-omniscient", label: "Allwissend", hint: "alles sehender Erzähler" },
  { id: "narr-collective-we", label: "Wir-Perspektive", hint: "kollektiv, gemeinsam" },
  { id: "narr-character", label: "Charakter-Monolog", hint: "eine Figur spricht direkt" },
  { id: "narr-dialog", label: "Dialog", hint: "zwei Stimmen, Gespräch" },
  { id: "narr-observer", label: "Beobachter", hint: "neutrales Sehen von außen" },
  { id: "narr-unreliable", label: "Unzuverlässiger Erzähler", hint: "subjektiv verzerrt" },
  { id: "narr-stream", label: "Bewusstseinsstrom", hint: "ungefilterte Gedanken" },
];

export const SongThema = () => {
  const { state, dispatch } = useStore();
  const sel = (pool: CheckItem[]) =>
    state.prompt.production.filter((p) => pool.some((i) => i.id === p));

  return (
    <div className="flex flex-col gap-3">
      <AccordionSection title="Thema" defaultOpen selectionCount={sel(THEMES).length} onClear={() => sel(THEMES).forEach((id) => dispatch({ type: "TOGGLE_PRODUCTION", tag: id }))}>
        <CheckList items={THEMES} selected={sel(THEMES)} onToggle={(id) => dispatch({ type: "TOGGLE_PRODUCTION", tag: id })} placeholder={`${THEMES.length} Themen...`} />
      </AccordionSection>

      <AccordionSection title="Einsatzzweck" selectionCount={sel(USE_CASES).length} onClear={() => sel(USE_CASES).forEach((id) => dispatch({ type: "TOGGLE_PRODUCTION", tag: id }))}>
        <CheckList items={USE_CASES} selected={sel(USE_CASES)} onToggle={(id) => dispatch({ type: "TOGGLE_PRODUCTION", tag: id })} placeholder={`${USE_CASES.length} Einsatzzwecke...`} />
      </AccordionSection>

      <AccordionSection title="Tonalität des Textes" optional selectionCount={sel(LYRICAL_TONE).length} onClear={() => sel(LYRICAL_TONE).forEach((id) => dispatch({ type: "TOGGLE_PRODUCTION", tag: id }))}>
        <CheckList items={LYRICAL_TONE} selected={sel(LYRICAL_TONE)} onToggle={(id) => dispatch({ type: "TOGGLE_PRODUCTION", tag: id })} placeholder={`${LYRICAL_TONE.length} Tonalitäten...`} />
      </AccordionSection>

      <AccordionSection title="Erzählperspektive" optional selectionCount={sel(NARRATIVE_PERSPECTIVE).length} onClear={() => sel(NARRATIVE_PERSPECTIVE).forEach((id) => dispatch({ type: "TOGGLE_PRODUCTION", tag: id }))}>
        <CheckList items={NARRATIVE_PERSPECTIVE} selected={sel(NARRATIVE_PERSPECTIVE)} onToggle={(id) => dispatch({ type: "TOGGLE_PRODUCTION", tag: id })} />
      </AccordionSection>
    </div>
  );
};
