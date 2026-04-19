import { X } from "lucide-react";
import { useStore } from "@/store";

const MANUAL = {
  title: "Handbuch",
  body: [
    { h: "Ziel-Plattform", p: "Oben im Header umschaltbar: Suno (Prosa-Prompt, Struktur-Tags in Lyrics) oder Udio (Tag-Liste, keine Struktur-Tags). Beeinflusst den generierten Output." },
    { h: "Modi", p: "Simple = schneller Prompt, Custom = volle Kontrolle, Studio = erweiterte Meta-Tag-Workflows (Suno-spezifisch)." },
    { h: "Grundstil", p: "Haupt- und Subgenre wählen. Zweitstil optional für Fusionen. 'Klingt wie' nutzt Ollama, um den Sound eines Künstlers zu beschreiben." },
    { h: "Crossover-Assistent", p: "Nur sichtbar wenn Haupt- und Zweitgenre gesetzt sind. Ollama schlägt Bridge-Instrumente, Production-Tricks, Mood-Palette und Pitfalls für die Fusion vor. Je ein Übernehmen-Button pro Kategorie — bestehende Auswahl bleibt." },
    { h: "Gesang", p: "Stimmtyp, Vortragsstil, FX und Sprache wählen. Mehrere Sprachen möglich (Multi-Select)." },
    { h: "KI-Ausformulierung", p: "Rechts im Preview. Generiert aus deinen Auswahlen einen fertigen Style-Prompt — Prosa für Suno, Tag-Liste für Udio. Refine-Feld daneben nimmt freien Feedback-Text für iterative Verbesserung (Verlauf sichtbar)." },
    { h: "Prompt-Score vs. LLM-Bewertung", p: "Deterministischer Score (0–100) bewertet deine Auswahl nach Genre/Specificity/Production/Bonus. 'Bewerten'-Button startet zusätzlich einen LLM-Judge-Pass: 1–10 Score plus Stärken, Schwächen und Fazit aus Modell-Sicht." },
    { h: "Kreativitätsmodus", p: "In Einstellungen: konservativ/balanced/kreativ/wild. Steuert die LLM-Temperatur pro Task — Style niedrig (klar), Lyrics hoch (variantenreich), Critique deterministisch. Nicht ein globaler Schieberegler, sondern aufgabenspezifisch." },
    { h: "Qualitäts-Gates", p: "Drei optionale Auto-Checks (Einstellungen). Auto-Retry bei Klischees: Lyrics werden einmal neu generiert wenn verbotene Phrasen drin sind. Self-Critique: zweiter Pass schreibt schwache Lyric-Zeilen um. Auto-Refine Style: unter Score-Schwelle läuft ein Refinement-Pass mit Hints als Feedback." },
    { h: "Cloud-Fallback", p: "Optional in Einstellungen: Anthropic- oder OpenAI-Key eintragen. Wenn Ollama offline ist, springt der Cloud-Provider automatisch ein. Key bleibt nur im localStorage, wird nicht verschickt außer an den Provider selbst." },
    { h: "Compare-View", p: "In der History zwei Einträge ankreuzen → Vergleichen. Zeigt beide Prompts nebeneinander mit Score-Delta und Apply-Buttons." },
    { h: "Presets", p: "Aktuellen Zustand als Preset speichern (rechts im Preview). Tags vergeben und per Pill filtern. Sofort ladbar." },
    { h: "Auto-Backup", p: "In Einstellungen: alle 7/14/30 Tage lädt die App beim Start automatisch ein JSON-Backup von Settings, History, Presets und Draft herunter. Manuell auch jederzeit möglich." },
    { h: "Tastenkürzel", p: "Ctrl+Enter: Style generieren · Ctrl+S: in History speichern · Ctrl+Z / Ctrl+Shift+Z / Ctrl+Y: Undo/Redo (20 Schritte) · Ctrl+K: Idee-Modal · Ctrl+I: Einstellungen · Ctrl+/: Handbuch · Esc: offenes Modal schließen · Enter im 'Klingt wie'-Feld: Analyse." },
    { h: "Mobile", p: "Auf Screens < 1024px sind Sidebar und Preview ausgeblendet. Menu-Button (Hamburger) und Eye-Button im Header öffnen sie als Overlay. Esc oder Backdrop-Tap schließt." },
    { h: "Barrierefreiheit", p: "Tab-Navigation mit sichtbarem Focus-Ring. Skip-Link springt direkt zum Hauptinhalt. Respektiert prefers-reduced-motion — Hintergrund-Animationen werden dann statisch." },
    { h: "Ollama", p: "Muss lokal unter http://localhost:11434 laufen (oder in Settings andere URL). Status-Dot oben rechts zeigt Verbindung. Bei Offline greift optional Cloud-Fallback." },
  ],
};

const IMPRINT = {
  title: "Impressum",
  body: [
    { h: "Anbieter", p: "Martin Deppe" },
    { h: "Kontakt", p: "martindeppe1@googlemail.com" },
    { h: "Anwendung", p: "Musik Prompt Generator V1 — Open-Source-Tool zur Erstellung von Style-Prompts für AI-Musik-Tools wie Suno und Udio. Lokaler Einsatz, keine Datensammlung. Lizenz: MIT." },
    { h: "Keine Affiliation", p: "Dieses Projekt steht in keiner Verbindung zu Suno Inc., Udio AI, Anthropic PBC oder OpenAI. 'Suno', 'Udio', 'Claude' und 'GPT' sind Marken der jeweiligen Inhaber und werden hier ausschließlich nominativ genannt, um den Einsatzzweck zu beschreiben." },
    { h: "Cloud-Fallback", p: "Wenn ein Anthropic- oder OpenAI-API-Key in den Einstellungen hinterlegt wird, werden Prompts direkt aus dem Browser an den jeweiligen Anbieter geschickt. Der Key bleibt lokal im localStorage. Abrechnung, Datenschutz und Nutzungsbedingungen liegen ausschließlich beim gewählten Anbieter." },
    { h: "Generierte Inhalte", p: "Das Tool erzeugt ausschließlich Text-Prompts. Die eigentliche Musikgenerierung erfolgt auf externen Plattformen (Suno/Udio) und unterliegt deren Nutzungsbedingungen. Für kommerzielle Nutzung generierter Musik sind die Plattform-AGBs zu beachten." },
    { h: "Haftungsausschluss", p: "Die Software wird 'wie besehen' bereitgestellt, ohne Gewährleistung jeder Art. Es wird keine Haftung für Schäden übernommen, die durch die Nutzung der Software entstehen. Siehe MIT-Lizenz im Repository." },
  ],
};

export const InfoModal = () => {
  const { state, dispatch } = useStore();
  // InfoModal kuemmert sich NUR um manual/imprint — andere Modal-Typen (z.B.
  // "stats") haben eigene Components, hier frueh returnen.
  if (state.infoModal !== "manual" && state.infoModal !== "imprint") return null;
  const data = state.infoModal === "manual" ? MANUAL : IMPRINT;
  const close = () => dispatch({ type: "SET_INFO_MODAL", modal: null });

  return (
    <div
      onClick={close}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-xl border border-[var(--color-amber-dim)] bg-[var(--color-panel)]/85 shadow-2xl backdrop-blur-xl"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[var(--color-border)] px-5 py-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-amber)]">
            {data.title}
          </h2>
          <button
            onClick={close}
            className="rounded-full p-1 text-[var(--color-text-dim)] transition hover:bg-[var(--color-panel-hover)] hover:text-[var(--color-text)]"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-4">
          {data.body.map((entry) => (
            <div key={entry.h}>
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-amber-dim)]">
                {entry.h}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-dim)]">
                {entry.p}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
