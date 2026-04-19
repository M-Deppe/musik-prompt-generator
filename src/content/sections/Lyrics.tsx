import { useEffect, useRef } from "react";
import { Wand2, Loader2, Blocks } from "lucide-react";
import { AccordionSection } from "@/components/AccordionSection";
import { useStore } from "@/store";
import { generate } from "@/lib/ollama";
import { getSubgenreById, MAIN_GENRES } from "@/lib/allGenres";
import { findCliches, runSelfCritiqueLyrics } from "@/lib/llm";
import { getTaskTemperature } from "@/types";

// Nur echte Sprachen (natuerliche + Conlangs mit Vokabular). Wird als LYRICS LANGUAGE gesetzt.
const REAL_LANGUAGES: Record<string, string> = {
  "lang-de": "German",
  "lang-en": "English",
  "lang-es": "Spanish",
  "lang-fr": "French",
  "lang-it": "Italian",
  "lang-pt": "Portuguese",
  "lang-ja": "Japanese",
  "lang-ko": "Korean",
  "lang-zh": "Mandarin Chinese",
  "lang-ar": "Arabic",
  "lang-hi": "Hindi",
  "lang-ru": "Russian",
  "lang-tr": "Turkish",
  "lang-nl": "Dutch",
  "lang-sv": "Swedish",
  "lang-fi": "Finnish",
  "lang-no": "Norwegian",
  "lang-da": "Danish",
  "lang-el": "Greek",
  "lang-pl": "Polish",
  "lang-cs": "Czech",
  "lang-hu": "Hungarian",
  "lang-ro": "Romanian",
  "lang-bg": "Bulgarian",
  "lang-sr": "Serbian",
  "lang-hr": "Croatian",
  "lang-he": "Hebrew",
  "lang-ta": "Tamil",
  "lang-bn": "Bengali",
  "lang-th": "Thai",
  "lang-vi": "Vietnamese",
  "lang-id": "Indonesian",
  "lang-sw": "Swahili",
  "lang-yo": "Yoruba",
  "lang-xh": "Xhosa",
  "lang-zu": "Zulu",
  "lang-la": "Latin",
  "lang-grc": "Ancient Greek",
  "lang-non": "Old Norse",
  "lang-ang": "Old English",
  "lang-sa": "Sanskrit",
  "lang-kli": "Klingon",
  "lang-sindarin": "Sindarin (Elvish)",
  "lang-enya-gaelic": "Neo-Celtic Gaelic",
};

// Keine echten Sprachen — Gesangsstile / non-lexikalische Texturen.
// Werden NICHT als Sprache ans LLM gegeben, sondern als vokaler Charakter-Hinweis.
const NON_LEXICAL_STYLES: Record<string, string> = {
  "lang-simlish": "Simlish-style gibberish syllables (no semantic meaning)",
  "lang-glossolalia": "glossolalia (speaking-in-tongues, nonsense vocal flow)",
  "lang-phonetic": "pure phonetic vowel textures (no words)",
  "lang-scat": "scat singing (nonsense syllables, jazz-style)",
  "lang-ooh-aah": "only oohs and aahs (no words)",
  "lang-whisper-only": "whispered vocals only (real lyrics, delivered as whispers)",
};

const INLINE_CUES = [
  "(whispered)",
  "(belted)",
  "(spoken)",
  "(falsetto)",
  "(ad-lib)",
  "(harmonized)",
  "(building intensity)",
  "(stripped back)",
  "(key change)",
  "(half-time feel)",
  "(echoing)",
  "(fading)",
  "(raspy)",
  "(breathy)",
  "(double-track)",
  "(choir support)",
  "(call-response)",
  "(spoken aside)",
  "(growled)",
  "(screamed)",
  "(vocoded)",
  "(auto-tuned)",
  "(pitched down)",
  "(pitched up)",
  "(reversed)",
  "(distorted)",
  "(ethereal floaty)",
  "(hymnic powerful)",
  "(intimate close)",
  "(cinematic wide)",
  "(layered stack)",
  "(solo accented)",
];

const STRUCTURE_TAGS = [
  "[Intro]",
  "[Verse 1]",
  "[Verse 2]",
  "[Verse 3]",
  "[Verse 4]",
  "[Pre-Chorus]",
  "[Chorus]",
  "[Post-Chorus]",
  "[Hook]",
  "[Bridge]",
  "[Pre-Bridge]",
  "[Post-Bridge]",
  "[Solo]",
  "[Instrumental]",
  "[Drop]",
  "[Drop 2]",
  "[Build]",
  "[Breakdown]",
  "[Interlude]",
  "[Break]",
  "[Tag]",
  "[Refrain]",
  "[Coda]",
  "[Reprise]",
  "[Ad-lib Section]",
  "[Scat Section]",
  "[Call-Response]",
  "[Answer Phrase]",
  "[False Ending]",
  "[Return]",
  "[Extended Chorus]",
  "[Final Chorus]",
  "[Outro]",
];

export const Lyrics = () => {
  const { state, dispatch } = useStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lyrics = state.prompt.lyrics;
  const MAX = 3000;

  const insert = (token: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const prefix = lyrics.slice(0, start);
    const suffix = lyrics.slice(end);
    const needsNewline = token.startsWith("[") && prefix.length > 0 && !prefix.endsWith("\n");
    const insertion = needsNewline ? `\n${token}\n` : token;
    const next = prefix + insertion + suffix;
    dispatch({ type: "SET_LYRICS", lyrics: next });
    requestAnimationFrame(() => {
      ta.focus();
      const pos = start + insertion.length;
      ta.setSelectionRange(pos, pos);
    });
  };

  const lines = lyrics.split("\n").length;

  return (
    <div className="flex flex-col gap-3">
      <AccordionSection title="Struktur-Tags" defaultOpen>
        <div className="flex flex-wrap gap-1.5">
          {STRUCTURE_TAGS.map((t) => (
            <button
              key={t}
              onClick={() => insert(t)}
              className="rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] px-2.5 py-1 text-[11px] font-mono text-[var(--color-text-dim)] hover:border-[var(--color-amber-dim)] hover:bg-[var(--color-amber)]/5 hover:text-[var(--color-amber)]"
            >
              {t}
            </button>
          ))}
        </div>
      </AccordionSection>

      <AccordionSection title="Inline-Cues (Vokal-Anweisungen)">
        <div className="flex flex-wrap gap-1.5">
          {INLINE_CUES.map((c) => (
            <button
              key={c}
              onClick={() => insert(c + " ")}
              className="rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] px-2.5 py-1 text-[11px] font-mono text-[var(--color-text-dim)] hover:border-[var(--color-success)]/40 hover:text-[var(--color-success)]"
            >
              {c}
            </button>
          ))}
        </div>
      </AccordionSection>

      <AccordionSection title="Lyrics-Text" defaultOpen>
        <div className="flex flex-col gap-2">
          <textarea
            ref={textareaRef}
            value={lyrics}
            onChange={(e) => dispatch({ type: "SET_LYRICS", lyrics: e.target.value })}
            rows={14}
            placeholder={`[Verse 1]\n(whispered) I can still hear your voice\nFading in the neon haze\n\n[Chorus]\n(belted) WE WILL RISE AGAIN\n(harmonized) Together we stand`}
            className="w-full resize-y rounded border border-[var(--color-border)] bg-[var(--color-bg)] p-3 font-mono text-sm leading-relaxed text-[var(--color-text)] placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-amber-dim)] focus:outline-none"
          />
          <div className="flex items-center justify-between text-[11px] text-[var(--color-text-dim)]">
            <span>
              {lines} {lines === 1 ? "Zeile" : "Zeilen"}
            </span>
            <span
              className={`tabular-nums ${
                lyrics.length > MAX ? "text-[var(--color-danger)]" : ""
              }`}
            >
              {lyrics.length} / {MAX}
            </span>
          </div>
        </div>
      </AccordionSection>

      <LyricsKi />
    </div>
  );
};

const LyricsKi = () => {
  const { state, dispatch } = useStore();
  const sub = getSubgenreById(state.prompt.subgenre);

  const running = state.llmLoading;
  // Bei Unmount (z.B. RESET via resetCounter-Key) kein Store-State mehr
  // ueberschreiben — laufende Generation ignoriert weitere Dispatches.
  const cancelledRef = useRef(false);
  useEffect(() => {
    cancelledRef.current = false;
    return () => {
      cancelledRef.current = true;
    };
  }, []);

  const run = async () => {
    dispatch({ type: "LLM_START" });
    try {
      const themes = state.prompt.production.filter((p) => p.startsWith("th-"));
      const tonalities = state.prompt.production.filter((p) => p.startsWith("lt-"));
      const vocal = state.prompt.vocalDelivery;

      const arrangement = state.llmArrangement.trim();
      const hasArrangement = arrangement.length > 0;

      // Tag-Reihenfolge aus Arrangement extrahieren — nur saubere Section-Namen,
      // ohne Modifier oder Production-Notes. Splittet sowohl bei ':' (alte
      // Syntax `[Verse 1: warm piano]`) als auch bei '|' (neue Pipe-Syntax
      // `[Verse 1 | restrained | minimal drums]`). Production-Note-Brackets
      // ohne Section-Tag (z.B. `[ambient pad, filtered kick]`) werden
      // herausgefiltert, weil sie nicht als Lyrics-Section dienen.
      const SECTION_TAG_RE = /^(intro|verse|pre[- ]?chorus|chorus|post[- ]?chorus|hook|bridge|outro|interlude|instrumental|break|breakdown|solo|refrain|drop|build|fade|tag|coda|reprise|final)\b/i;
      const arrangementTags = hasArrangement
        ? Array.from(arrangement.matchAll(/^\s*\[([^\]]+)\]/gm))
            .map((m) => m[1].trim().split(/[|:]/)[0].trim())
            .filter((name) => SECTION_TAG_RE.test(name))
            .map((name) => `[${name}]`)
        : [];
      const structureLine = arrangementTags.join(" -> ");

      // Sprache(n) und Non-Lexical-Stile getrennt behandeln.
      const languageIds = state.prompt.vocalLanguages ?? [];
      const languages = languageIds.map((id) => REAL_LANGUAGES[id]).filter(Boolean);
      const nonLexicalStyles = languageIds.map((id) => NON_LEXICAL_STYLES[id]).filter(Boolean);
      const hasLanguage = languages.length > 0;
      const primaryLanguage = languages[0];
      const isMixed = languages.length > 1;
      const hasNonLexical = nonLexicalStyles.length > 0;

      // Zielsprache bestimmt Example + native-speaker-Anweisung.
      const targetIsGerman = primaryLanguage === "German";

      // Genre-adaptive Extra-Regeln.
      const mainGenreName = MAIN_GENRES.find((g) => g.id === state.prompt.mainGenre)?.name.toLowerCase() ?? "";
      const subName = sub?.name.toLowerCase() ?? "";
      const genreBlob = `${mainGenreName} ${subName}`;

      const genreRules = (() => {
        if (/rap|hip[- ]?hop|trap|drill/.test(genreBlob)) {
          return `GENRE ADDENDUM — RAP / HIP-HOP
- Multisyllabic rhymes required. Rhyme end-of-line AND inside lines (internal rhymes).
- Flow: vary syllable count between lines, play with the beat (on top, ahead, behind).
- Wordplay, punchlines, metaphors, double entendres are required in at least one line per verse.
- Reference concrete places, brands, people (no artist names), numbers — authenticity.
- Verses typically 16 bars, Hook short and catchy.`;
        }
        if (/edm|house|techno|trance|dubstep|dnb|drum.?and.?bass/.test(genreBlob)) {
          return `GENRE ADDENDUM — EDM / DANCE
- Lyrics are texture more than narrative. Short, mantra-like phrases.
- 1-3 lines per section. Heavy repetition is a feature.
- Non-lexical elements (oh-oh, yeah-yeah) carry weight. Use them.
- Avoid long metaphors; use single-image phrases.`;
        }
        if (/country|americana|bluegrass/.test(genreBlob)) {
          return `GENRE ADDENDUM — COUNTRY / AMERICANA
- Narrative arc required: beginning, middle, resolution across the song.
- Rhyme scheme: ABCB (ballad stanza) preferred.
- Concrete rural / small-town imagery (truck, porch, back road, kitchen, county).
- Character with a name or clear identity, not anonymous "she" / "he".
- Moral ambiguity stronger than clean resolution.`;
        }
        if (/metal|hardcore|grindcore|punk/.test(genreBlob)) {
          return `GENRE ADDENDUM — METAL / HEAVY
- Bigger, more violent imagery — but still specific, never abstract.
- Verb-driven lines. Action, not description.
- Choruses are anthemic, callable.
- Dark themes welcome but must be grounded in real situations, not generic "darkness".`;
        }
        if (/ballad|singer.?songwriter|folk|indie/.test(genreBlob)) {
          return `GENRE ADDENDUM — BALLAD / FOLK / INDIE
- Narrative, intimate, specific. First-person observational.
- Slant rhyme strongly preferred over perfect rhyme.
- Oblique imagery allowed — the listener reads between lines.
- Everyday objects carry emotional weight.`;
        }
        if (/rock|alt|grunge/.test(genreBlob)) {
          return `GENRE ADDENDUM — ROCK
- Call-and-response structures work well.
- Chorus bigger statement than verse — anthemic without being vague.
- Verb-heavy, active voice.
- Bridge often a perspective shift or emotional confession.`;
        }
        if (/pop/.test(genreBlob)) {
          return `GENRE ADDENDUM — POP
- Hook density high: catchy phrases in verse, pre-chorus AND chorus.
- Title = hook = first or last line of chorus.
- Syllable economy: no tongue-twisters in the chorus.
- Emotional directness OK, but grounded in a concrete situation.`;
        }
        return "";
      })();

      const fewShotExampleGerman = `Beispiel — genau dieses Niveau ist Pflicht (Indie-Folk, Trennung die leise endet):

[Verse 1]
Dein Kaffee wird kalt auf dem Fensterbrett
Du hast dein Zeug noch nicht abgeholt
Dein Schal liegt zusammengelegt auf dem Bett
Als haettest du ihn dort vergessen gewollt

[Pre-Chorus]
Ich lass das Licht an im Flur
Fuer den Fall, dass du klingelst, nur

[Chorus]
Es ist nicht zu Ende, es ist nur so still
Wir warten, wer zuerst was sagen will
Ich hab aufgeraeumt und die Rechnung bezahlt
Nur dein Name steht noch am Briefkasten in der Wand

[Verse 2]
Die Nachbarn haben ihren Fernseher laut
Ich kenn die Geraeusche, Minute fuer Minute
Ich weiss, wann die Tagesschau kommt, wann es klingt
Deine Seite vom Sofa riecht nach nichts mehr Gutes

[Bridge]
Ich hab auf den Anrufbeantworter gesprochen
Damit du nicht denkst, ich sag gar nichts mehr
Ich hab kein einziges Wort rausgekriegt
Nur einen einzigen, leisen Tag

Warum das funktioniert: Jede Zeile ein echtes Bild (Kaffee, Fensterbrett, Schal, Briefkasten, Tagesschau, Sofa, Anrufbeantworter). Null Klischees. Echte deutsche Woerter, korrekte Grammatik. Saubere Reime (Brett/Bett, abgeholt/gewollt, Flur/nur, still/will, bezahlt/Wand slant). Eine Geschichte, nicht drei Emotionen.`;

      const fewShotExampleEnglish = `Example — this is the required level (Indie folk, a breakup that ends quietly):

[Verse 1]
Your coffee's still cold on the windowsill
You haven't picked up your stuff yet
Your scarf's folded up on the side of the bed
Like you wanted to forget it there

[Pre-Chorus]
I leave the hall light on at night
Just in case you ring the bell, just in case

[Chorus]
It's not over, it's only this quiet
We're waiting to see who will speak first
I've cleaned up the kitchen and paid the rent
Only your name's still there on the mailbox frame

[Verse 2]
The neighbours have their TV on too loud
I know every sound, every minute of their night
I know when the news starts, when the kettle clicks
Your side of the couch doesn't smell like anything now

[Bridge]
I recorded a message on your voicemail once
Just so you wouldn't think I had nothing to say
I couldn't get a single word out
Just a single, quiet day

Why this works: every line a real image (coffee, windowsill, scarf, mailbox, TV, couch, voicemail). Zero clichés. Real words, clean grammar. Audible rhymes. One story, not three emotions.`;

      // Englisches Beispiel ist Default fuer alle Nicht-Deutsch-Sprachen —
      // es vermittelt das gewuenschte Qualitaetsniveau, wenn kein sprach-
      // eigenes Beispiel existiert.
      const fewShotExample = targetIsGerman ? fewShotExampleGerman : fewShotExampleEnglish;

      const systemPrompt = `You are a professional songwriter. You write lyrics at human-release-quality — never AI filler.

${fewShotExample}

${genreRules}

NON-NEGOTIABLE RULES
1. Tell ONE specific story. ONE situation, ONE angle. Not three emotions in parallel.
2. Show, don't tell. Never name an emotion. Always show it via a concrete object, place, number, name, body gesture or small action.
3. Rhyme is mandatory. Verse: ABAB or ABCB. Chorus: AABB or ABAB. Pre-Chorus: AA. No unrhymed sections except Bridge (free form allowed).
4. Use ONLY real dictionary words of the target language. Correct grammar, correct conjugation, correct articles. Never invent compounds or bend grammar for a rhyme — choose another rhyme instead. A native speaker must read every line as natural.
5. Verse syllable count must differ from Chorus syllable count. Verse 8-10, Chorus 10-12, Pre-Chorus 6-8. (Internal rule — do not emit the numbers.)
6. Verses in past tense, Chorus in present tense. This shift carries the emotion.
7. Hook-line = title-close phrase, first OR last line of Chorus. Must be meaningful when read alone.
8. Bridge brings NEW information. Once only. Before final Chorus. Makes the final Chorus bigger.
9. Power positions: strongest word first and last in every line. Never end on "the", "and", "a", "in", "mit", "in", "dem", "und".
10. Concretion test per section: at least 3 of these 7 senses — sight, sound, smell, touch, taste, body (heartbeat/breath), motion. No emotion without a concrete hook.
11. SETUP → PAYOFF: Verse opens a question or shows an unresolved situation. Chorus delivers the answer or the emotional resolution. Without setup, the chorus feels hollow. Treat it like a screenplay scene, not a list of feelings.
12. PHONETIC SPELLING when pronunciation matters. If a word is slang, foreign, a name, or has multiple readings, spell it the way it should sound. Suno follows the spelling, not the dictionary. Examples: "gonna" instead of "going to" for laid-back vocals, "kewl" for casual "cool", "wassup" for "what's up". Use sparingly — only where it changes the delivery.

FORBIDDEN RHYME PAIRS (use a different rhyme instead)
English: fire/desire, heart/apart, love/above, night/light, forever/together, tears/years, rain/pain, dream/seem, soul/whole, shine/mine, eyes/skies, fly/cry.
German: Herz/Schmerz, Zeit/Weit, Zeit/Ewigkeit, Traeume/Raeume, Nacht/gemacht, allein/sein, Regen/Segen, Licht/Gesicht, fuehlen/kuehlen, Liebe/Triebe, weinen/scheinen.

FORBIDDEN PHRASES (never use)
English: "echoes", "shattered dreams", "endless night", "fading light", "whispers in the dark", "burning bridges", "broken chains", "rise above", "set me free", "feel the pain", "by my side", "forever and always", "through the storm", "touch the sky", "reach the stars".
German: "mein Herz brennt", "in dunkler Nacht", "fuer immer und ewig", "Schatten der Vergangenheit", "tief in mir", "das Licht am Ende", "Traeume werden wahr", "Sterne am Himmel".

FORBIDDEN IN OUTPUT
- No syllable numbers like "(11)", no rhyme markers like "(A)", "(B)", "(AABB)".
- No instrument/production descriptions as lyric lines.
- No introduction, no explanation, no "here are the lyrics".
- No duplicate section tags — use [Verse 1] and [Verse 2], not two [Verse].

STRUCTURE TAGS
[Intro], [Verse 1], [Verse 2], [Pre-Chorus], [Chorus], [Post-Chorus], [Bridge], [Break], [Instrumental], [Outro].

PIPE-SYNTAX FOR SECTION HEADERS (PREFERRED for vocal-delivery cues)
Combine the section tag with vocal direction in one bracket:
   [Verse 1 | spoken word | low energy]
   [Chorus | belted | layered]
   [Bridge | whispered | stripped]
This gives Suno a single cohesive instruction. Stronger than separating tags + inline cues.
Limit: 2-3 modifiers per section header. More dilutes the signal.

ALLOWED INLINE CUES (sparingly, max 1-2 per section, in round parentheses)
(whispered), (belted), (spoken), (falsetto), (harmonized), (ad-lib), (soft), (loud), (building intensity), (fading).
Use these IN ADDITION to the pipe-syntax header only when a single line needs a different delivery than the section default.

MULTILINGUAL
Single language specified → every section in that language, no English fallback, no language marker needed.
Multiple languages specified → mark each section with its language: [Verse 1] (German).

${
  hasArrangement
    ? `SONG STRUCTURE (BINDING)
The song structure is FIXED and given below. You MUST:
- Use EXACTLY these section tags, in EXACTLY this order, with NO additions, NO omissions, NO reordering.
- Write lyrics under each tag following the syllable and rhyme rules above.
- Do NOT copy production descriptions into the lyrics — those live in the style prompt.

REQUIRED STRUCTURE:
${structureLine}
`
    : ""
}${
  hasLanguage
    ? `LYRICS LANGUAGE (BINDING — highest priority)
${
  isMixed
    ? `Use these languages only: ${languages.join(", ")}. Mark each section with its language: [Verse 1] (${languages[0]}), [Chorus] (${languages[1] ?? languages[0]}). NEVER introduce a language that is not listed. NEVER mix English in if English is not listed.`
    : `Write EVERY lyric line in ${primaryLanguage}. 100% ${primaryLanguage}. Never a single English word (unless the word is a German/loan-word commonly used in ${primaryLanguage}). Never switch sections to English. Section tags ([Verse 1], [Chorus]) stay in English — the lyric content does NOT. The language marker behind the tag (e.g. "(${primaryLanguage})") is optional and not needed when the entire song is in one language.`
}
`
    : ""
}${
  hasNonLexical
    ? `VOCAL DELIVERY STYLE (not a language — do not treat as one)
The vocals are delivered as: ${nonLexicalStyles.join("; ")}.
${
  hasLanguage
    ? `This is HOW the ${primaryLanguage ?? "lyrics"} are sung — it does NOT replace the language. Write normal ${primaryLanguage ?? "lyric"} words; add the delivery hint once near the top as an inline cue like (whispered) if applicable.`
    : `Since no real language is selected, the "lyrics" are non-lexical vocal textures — output short non-lexical vocal lines (vowels, syllables, whispers) instead of words. Keep structure tags.`
}
`
    : ""
}
OUTPUT CONTRACT
Return only the lyrics. No introduction. No explanation. No summary.`;

      const arrangementBlock = hasArrangement
        ? `\n\nBINDING STRUCTURE — use exactly these tags in this order, no more, no less:\n${structureLine}`
        : `\n\nDEFAULT STRUCTURE:\n[Intro] -> [Verse 1] -> [Pre-Chorus] -> [Chorus] -> [Verse 2] -> [Pre-Chorus] -> [Chorus] -> [Bridge] -> [Chorus] -> [Outro]`;

      const languageBlock = hasLanguage
        ? isMixed
          ? `\n\nLYRICS LANGUAGES (BINDING): ${languages.join(", ")}. Each section must be written in one of these languages. Mark each section with its language in parentheses after the tag. Never introduce any other language. WRITE AS A NATIVE SPEAKER of each language. Every word a real dictionary word. Grammar impeccable.`
          : `\n\nLYRICS LANGUAGE (BINDING): Write the entire songtext in ${primaryLanguage}. Every single lyric line must be in ${primaryLanguage}. Do NOT write any English. Only section tags ([Verse 1], [Chorus], etc.) remain in English. WRITE AS A NATIVE ${primaryLanguage.toUpperCase()} SPEAKER: only real dictionary words, correct grammar, natural word order. Never invent compounds. Never break grammar for a rhyme. If a rhyme requires a fake word, choose another rhyme.`
        : "";
      const nonLexicalBlock = hasNonLexical
        ? `\n\nVOCAL DELIVERY STYLE: ${nonLexicalStyles.join("; ")}. This is a performance style, NOT a language.${
            hasLanguage
              ? ` Write real ${primaryLanguage} lyrics and mention the delivery as inline cue once.`
              : ` Output non-lexical vocal textures only (no words), keep section tags.`
          }`
        : "";

      const userPrompt = `Write a song following these parameters:
Subgenre: ${sub?.name ?? "open"}
Vocal delivery: ${vocal ?? "open"}
Theme(s): ${themes.join(", ") || "open"}
Tonality: ${tonalities.join(", ") || "open"}
Moods: ${state.prompt.moods.join(", ") || "open"}${arrangementBlock}${languageBlock}${nonLexicalBlock}

BEFORE WRITING — briefly (internally, do not output) decide:
1. ONE specific situation or moment this song is about (not an emotion in general).
2. TWO concrete sensory details that anchor that moment (object, place, number, body detail, sound, smell).
3. The hook line — title-close, meaningful on its own.
4. The turn the bridge will take (what new information arrives).

Then write the song. No introduction, no explanation — only the lyrics.`;

      // Chaining: wenn bereits Prose-Style-Prompt und/oder Arrangement-Beschreibung vorhanden,
      // als Stil-Anker an den User-Prompt anhaengen.
      const styleAnchor = state.llmOutput?.trim()
        ? `\n\nSTYLE ANCHOR (match this song's sound and vibe):\n"${state.llmOutput.trim()}"`
        : "";

      const modelForLyrics = state.settings.modelLyrics || state.settings.ollamaModel;
      const temperature = getTaskTemperature(state.settings.creativityMode, "lyrics");

      const runOnce = async (extraPrompt: string): Promise<string> => {
        if (cancelledRef.current) return "";
        dispatch({ type: "SET_LYRICS", lyrics: "" });
        const out = await generate({
          baseUrl: state.settings.ollamaUrl,
          model: modelForLyrics,
          system: systemPrompt,
          prompt: userPrompt + styleAnchor + extraPrompt,
          temperature,
          onChunk: (_, full) => {
            if (!cancelledRef.current) dispatch({ type: "SET_LYRICS", lyrics: full });
          },
        });
        if (cancelledRef.current) return "";
        const trimmed = out.trim();
        dispatch({ type: "SET_LYRICS", lyrics: trimmed });
        return trimmed;
      };

      let lyrics = await runOnce("");
      if (cancelledRef.current) return;

      // Auto-Retry wenn Klischees erkannt werden.
      if (state.settings.autoRetryOnCliche) {
        const hits = findCliches(lyrics);
        if (hits.length) {
          const warning = `\n\nCLICHÉ WARNING: the previous attempt used forbidden phrases: ${hits.join(", ")}. Rewrite the song avoiding ALL of these. Replace each with concrete, specific imagery.`;
          lyrics = await runOnce(warning);
          if (cancelledRef.current) return;
        }
      }

      // Self-Critique zweiter Pass (optional).
      if (state.settings.selfCritiqueLyrics) {
        await runSelfCritiqueLyrics({ ...state, prompt: { ...state.prompt, lyrics } }, dispatch);
        if (cancelledRef.current) return;
      }

      dispatch({ type: "LLM_DONE", output: "Lyrics in Lyrics-Feld eingefügt." });
    } catch (e) {
      if (cancelledRef.current) return;
      dispatch({
        type: "LLM_ERROR",
        message: e instanceof Error ? e.message : "Unbekannt",
      });
    }
  };

  return (
    <AccordionSection title="KI-Lyrics generieren" optional>
      <div className="flex flex-col gap-2">
        <p className="text-xs text-[var(--color-text-dim)]">
          Nutzt Subgenre, Thema, Vortragsstil und Moods. Falls ein KI-Arrangement existiert, wird es als verbindliche Struktur inkl. Beschreibung uebernommen. Ersetzt den aktuellen Lyrics-Text.
        </p>
        {state.llmArrangement && (
          <p className="flex items-center gap-1.5 text-[11px] text-sky-400">
            <Blocks size={11} />
            Arrangement erkannt — Tag-Reihenfolge wird uebernommen (ohne Produktions-Text).
          </p>
        )}
        {(state.prompt.vocalLanguages ?? []).length > 0 && (() => {
          const ids = state.prompt.vocalLanguages ?? [];
          const langs = ids.map((id) => REAL_LANGUAGES[id]).filter(Boolean);
          const styles = ids.map((id) => NON_LEXICAL_STYLES[id]).filter(Boolean);
          return (
            <div className="flex flex-col gap-0.5 text-[11px]">
              {langs.length > 0 && (
                <p className="text-pink-400">Sprache: {langs.join(", ")} — Lyrics komplett in dieser Sprache.</p>
              )}
              {styles.length > 0 && (
                <p className="text-emerald-400">Vokalstil: {styles.join("; ")} (keine Sprache, nur Delivery).</p>
              )}
            </div>
          );
        })()}
        <button
          onClick={run}
          disabled={running}
          className="flex items-center justify-center gap-2 rounded-full border border-[var(--color-amber-dim)] bg-[var(--color-amber)]/10 px-4 py-2 text-sm text-[var(--color-amber)] transition hover:bg-[var(--color-amber)]/20 disabled:opacity-40"
        >
          {running ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
          {running ? "KI schreibt..." : "Songtext generieren"}
        </button>
        {state.llmError && (
          <p className="rounded border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 p-2 text-[11px] text-[var(--color-danger)]">
            {state.llmError}
          </p>
        )}
        {(running || state.prompt.lyrics) && (
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-[var(--color-amber-dim)]">
                Generierter Songtext {running && "(live)"} — editierbar
              </span>
              {state.prompt.lyrics && (
                <button
                  onClick={() => navigator.clipboard.writeText(state.prompt.lyrics)}
                  className="text-[10px] text-[var(--color-text-dim)] hover:text-[var(--color-text)]"
                >
                  kopieren
                </button>
              )}
            </div>
            <textarea
              value={state.prompt.lyrics}
              onChange={(e) => dispatch({ type: "SET_LYRICS", lyrics: e.target.value })}
              rows={12}
              className="w-full resize-y rounded border border-[var(--color-amber-dim)]/40 bg-[var(--color-bg)] p-3 font-mono text-sm leading-relaxed text-[var(--color-text)] focus:border-[var(--color-amber-dim)] focus:outline-none"
            />
          </div>
        )}
      </div>
    </AccordionSection>
  );
};
