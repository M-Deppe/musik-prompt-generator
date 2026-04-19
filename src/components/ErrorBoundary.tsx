import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = {
  children: ReactNode;
};

type State = {
  error: Error | null;
  errorInfo: ErrorInfo | null;
};

// Fängt Render-Fehler im Subtree ab, bevor sie zu weißem Screen werden.
// Bietet dem User:
// - Kurze Fehlerbeschreibung
// - "Projekt-State exportieren" — zieht localStorage zusammen in JSON, Disaster-Recovery
// - "App neu laden" — simpler Reload
// - "Weiter versuchen" — soft-Reset der Boundary ohne Reload
// Error Boundaries müssen Klassen-Komponenten sein (React-API-Vorgabe).
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, errorInfo: null };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Dev-Logging — in Production würde hier ggf. ein Error-Tracker hin.
    console.error("[ErrorBoundary] Render-Fehler gefangen:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleRetry = (): void => {
    this.setState({ error: null, errorInfo: null });
  };

  handleReload = (): void => {
    window.location.reload();
  };

  handleExport = (): void => {
    // Disaster-Recovery-Export: alles aus localStorage zusammenfassen + Error-Trace.
    // Falls State nicht lesbar: leere Platzhalter, damit Download trotzdem funktioniert.
    const safeRead = (key: string): unknown => {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    };
    const snapshot = {
      type: "mps-error-recovery",
      captured_at: new Date().toISOString(),
      error: {
        name: this.state.error?.name,
        message: this.state.error?.message,
        stack: this.state.error?.stack,
        componentStack: this.state.errorInfo?.componentStack,
      },
      localStorage: {
        settings: safeRead("mps.settings"),
        history: safeRead("mps.history"),
        presets: safeRead("mps.presets"),
        draft: safeRead("mps.draft"),
        lastBackupAt: safeRead("mps.lastBackupAt"),
      },
      userAgent: navigator.userAgent,
    };
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    a.href = url;
    a.download = `mps-error-recovery-${stamp}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  render(): ReactNode {
    if (!this.state.error) return this.props.children;

    const { error } = this.state;

    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 p-6 text-neutral-100">
        <div className="w-full max-w-xl rounded-lg border border-red-900/50 bg-neutral-900 p-6 shadow-2xl">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10 text-red-400">
              !
            </div>
            <div>
              <h1 className="text-lg font-semibold">App-Fehler</h1>
              <p className="text-xs text-neutral-400">
                Ein unerwarteter Render-Fehler hat die App angehalten. Dein State ist
                noch im localStorage — du kannst ihn sichern bevor du neu lädst.
              </p>
            </div>
          </div>

          <div className="mb-4 rounded border border-red-900/40 bg-red-950/30 p-3 font-mono text-xs leading-relaxed">
            <div className="font-semibold text-red-300">{error.name}</div>
            <div className="mt-1 text-red-200">{error.message}</div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={this.handleExport}
              className="flex-1 rounded border border-amber-500/50 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-300 hover:bg-amber-500/20"
            >
              State + Fehler exportieren
            </button>
            <button
              type="button"
              onClick={this.handleRetry}
              className="flex-1 rounded border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-700"
            >
              Weiter versuchen
            </button>
            <button
              type="button"
              onClick={this.handleReload}
              className="flex-1 rounded border border-sky-500/50 bg-sky-500/10 px-4 py-2 text-sm text-sky-300 hover:bg-sky-500/20"
            >
              App neu laden
            </button>
          </div>

          {this.state.errorInfo?.componentStack && (
            <details className="mt-4 rounded border border-neutral-800 bg-neutral-950/50 p-3">
              <summary className="cursor-pointer text-xs text-neutral-400 hover:text-neutral-200">
                Component Stack (für Entwickler)
              </summary>
              <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap break-all font-mono text-[10px] text-neutral-500">
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
  }
}
