import { useEffect } from "react";
import { useStore } from "@/store";
import { runLlmBuilder } from "@/lib/llm";
import { buildStylePrompt } from "@/lib/promptBuilder";
import { addHistoryEntry, type HistoryEntry } from "@/lib/persistence";

// Globale Tastenkuerzel fuer den Power-User. Absichtlich dezent: Standards
// die jeder Apple/Windows-User kennt, keine magischen Chords.
//
// - Ctrl/Cmd + Enter: Style generieren (wie Generate-Button rechts)
// - Ctrl/Cmd + S:     Aktuellen Prompt in History speichern
// - Ctrl/Cmd + K:     Idea-Modal oeffnen (schneller Quick-Start)
// - Ctrl/Cmd + I:     Settings oeffnen
// - Ctrl/Cmd + /:     Handbuch oeffnen
// - Esc:              Modale schliessen (wird bereits in einzelnen Modals
//                     behandelt; hier nur Settings und IdeaModal nachgezogen).
//
// Implementierung als leere Komponente, die nur einen useEffect installiert.
// So bleibt die App.tsx uebersichtlich.

export const KeyboardShortcuts = () => {
  const { state, dispatch, undo, redo } = useStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Wenn ein Textfeld Fokus hat, Ctrl+S / Ctrl+Enter trotzdem erlauben,
      // aber einfache Buchstaben-Shortcuts nicht — das wuerde beim Tippen stoeren.
      const tag = (e.target as HTMLElement | null)?.tagName;
      const isInput = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
      const mod = e.ctrlKey || e.metaKey;

      // Ctrl/Cmd + Z — Undo (shift = Redo)
      if (mod && (e.key === "z" || e.key === "Z")) {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }
      // Ctrl/Cmd + Y — Redo (zweite Shortcut-Variante)
      if (mod && (e.key === "y" || e.key === "Y")) {
        e.preventDefault();
        redo();
        return;
      }

      // Ctrl/Cmd + Enter — Generate
      if (mod && e.key === "Enter") {
        e.preventDefault();
        if (!state.llmLoading && buildStylePrompt(state.prompt).trim()) {
          runLlmBuilder(state, dispatch);
        }
        return;
      }

      // Ctrl/Cmd + S — Save to History
      if (mod && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
        const stylePrompt = buildStylePrompt(state.prompt);
        if (!stylePrompt.trim()) return; // kein leerer Eintrag
        const entry: HistoryEntry = {
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          stylePrompt,
          llmOutput: state.llmOutput || undefined,
          llmArrangement: state.llmArrangement || undefined,
          prompt: state.prompt,
          title: state.prompt.title || undefined,
        };
        const next = addHistoryEntry(entry);
        dispatch({ type: "SET_HISTORY", history: next });
        return;
      }

      // Unterhalb: Shortcuts die in Textfeldern NICHT feuern sollen.
      if (isInput) return;

      // Ctrl/Cmd + K — Idee-Modal
      if (mod && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        dispatch({ type: "TOGGLE_IDEA" });
        return;
      }
      // Ctrl/Cmd + I — Settings
      if (mod && (e.key === "i" || e.key === "I")) {
        e.preventDefault();
        dispatch({ type: "TOGGLE_SETTINGS" });
        return;
      }
      // Ctrl/Cmd + / — Handbuch
      if (mod && e.key === "/") {
        e.preventDefault();
        dispatch({ type: "SET_INFO_MODAL", modal: state.infoModal ? null : "manual" });
        return;
      }

      // Esc — offenes Modal schliessen (Settings, Idea)
      if (e.key === "Escape") {
        if (state.settingsOpen) {
          dispatch({ type: "TOGGLE_SETTINGS" });
          return;
        }
        if (state.ideaOpen && !state.llmLoading) {
          dispatch({ type: "TOGGLE_IDEA" });
          return;
        }
        if (state.infoModal) {
          dispatch({ type: "SET_INFO_MODAL", modal: null });
          return;
        }
        if (state.promptPreview?.visible) {
          dispatch({ type: "HIDE_PROMPT_PREVIEW" });
          return;
        }
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [state, dispatch, undo, redo]);

  return null;
};
