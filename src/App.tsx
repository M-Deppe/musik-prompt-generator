import { useEffect } from "react";
import { StoreProvider, useStore } from "@/store";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Content } from "@/components/Content";
import { Preview } from "@/components/Preview";
import { SettingsPanel } from "@/components/SettingsPanel";
import { IdeaModal } from "@/components/IdeaModal";
import { InfoModal } from "@/components/InfoModal";
import { StatsModal } from "@/components/StatsModal";
import { PromptPreviewModal } from "@/components/PromptPreviewModal";
import { OllamaOfflineBanner } from "@/components/OllamaOfflineBanner";
import { BackupReminderBanner } from "@/components/BackupReminderBanner";
import { OnboardingOverlay } from "@/components/OnboardingOverlay";
import { KeyboardShortcuts } from "@/components/KeyboardShortcuts";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { InstallPrompt } from "@/components/InstallPrompt";
import { MobileOverlay } from "@/components/MobileOverlay";
import { listModels } from "@/lib/ollama";
import { readPromptFromUrl, clearUrlHash } from "@/lib/urlState";
import { getSectionsForMode } from "@/sections";
import { daysSinceLastBackup, exportFullBackup, setLastBackupAt } from "@/lib/persistence";

// Polling-Intervall fuer die Modell-Liste. 60s ist genug: neue Modelle werden
// manuell via `ollama pull` hinzugefuegt, kein Echtzeit-Bedarf. Gleichzeitig
// nicht zu selten, sonst stimmt Auto-Routing nicht nach Install.
const MODEL_REFRESH_INTERVAL_MS = 60_000;

const Shell = () => {
  const { state, dispatch } = useStore();
  // key auf resetCounter sorgt dafuer, dass RESET alle lokalen useState (z.B. Accordion-Open)
  // durch Remount zuruecksetzt — sprich: alle Sections/Accordions sind nach Reset geschlossen.
  const k = state.resetCounter;

  // Modell-Liste beim App-Start laden und periodisch refreshen.
  // Dient dem Auto-Model-Routing in llm.ts — je besser die Liste, desto
  // gezielter die Auswahl pro Sprache/Task. Fehler leise schlucken:
  // Ollama kann offline sein, dann bleibt availableModels leer und der
  // pickModel-Fallback greift.
  useEffect(() => {
    let cancelled = false;
    const fetchModels = async () => {
      try {
        const models = await listModels(state.settings.ollamaUrl);
        if (cancelled) return;
        dispatch({ type: "SET_AVAILABLE_MODELS", models: models.map((m) => m.name) });
      } catch {
        // Ollama nicht erreichbar — nichts tun, availableModels bleibt.
      }
    };
    fetchModels();
    const id = setInterval(fetchModels, MODEL_REFRESH_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [state.settings.ollamaUrl, dispatch]);

  // Shared-Link einmalig beim Mount laden und aus der URL entfernen,
  // damit ein nachfolgender Reload nicht wieder den Shared-State ueberschreibt.
  // useEffect mit leerem Dep-Array — das soll genau einmal laufen.
  useEffect(() => {
    const shared = readPromptFromUrl();
    if (shared) {
      dispatch({ type: "LOAD_PROMPT_STATE", prompt: shared });
      clearUrlHash();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Theme-Modus an body-class binden — ermoeglicht Light/Dark-Switch ueber
  // CSS-Variables ohne React-Tree-Rerender.
  useEffect(() => {
    const cls = "light-mode";
    if (state.settings.theme === "light") {
      document.body.classList.add(cls);
    } else {
      document.body.classList.remove(cls);
    }
    return () => {
      document.body.classList.remove(cls);
    };
  }, [state.settings.theme]);

  // Auto-Backup: wenn autoBackupDays > 0 und letztes Backup aelter als N Tage,
  // automatisch JSON-Backup runterladen und Timestamp setzen. Laeuft genau
  // einmal beim Mount — der Prompt-Flow des Users soll nicht gestoert werden.
  useEffect(() => {
    const intervalDays = state.settings.autoBackupDays;
    if (intervalDays <= 0) return;
    const since = daysSinceLastBackup();
    if (since !== null && since < intervalDays) return;
    // Download triggern
    const json = exportFullBackup();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    a.href = url;
    a.download = `mps-auto-backup-${stamp}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setLastBackupAt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Wenn Target wechselt und die aktuelle Section fuer das neue Ziel nicht
  // sichtbar ist (z.B. "suno-studio" nach Wechsel auf udio), springen wir
  // automatisch zur ersten verfuegbaren Section. Studio-Mode enthaelt nur
  // Suno-spezifische Sections — bei Udio fallen alle weg, dann auf custom.
  useEffect(() => {
    const visible = getSectionsForMode(state.mode, state.settings.target);
    if (visible.length === 0) {
      dispatch({ type: "SET_MODE", mode: "custom" });
      return;
    }
    if (!visible.some((s) => s.id === state.activeSection)) {
      dispatch({ type: "SET_SECTION", section: visible[0].id });
    }
  }, [state.settings.target, state.mode, state.activeSection, dispatch]);

  return (
    <div className="flex h-screen flex-col bg-transparent">
      <AnimatedBackground />
      <Header />
      <OllamaOfflineBanner />
      <BackupReminderBanner />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar key={`sidebar-${k}`} />
        <Content key={`content-${k}`} />
        <Preview />
        <MobileOverlay />
      </div>
      <SettingsPanel />
      <IdeaModal />
      <InfoModal />
      <StatsModal />
      <PromptPreviewModal />
      <OnboardingOverlay />
      <KeyboardShortcuts />
      <InstallPrompt />
    </div>
  );
};

export const App = () => (
  <StoreProvider>
    <Shell />
  </StoreProvider>
);
