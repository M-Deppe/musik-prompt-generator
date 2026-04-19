import { X, Copy } from "lucide-react";
import { useStore } from "@/store";

export const PromptPreviewModal = () => {
  const { state, dispatch } = useStore();
  const p = state.promptPreview;
  if (!p?.visible) return null;

  const close = () => dispatch({ type: "HIDE_PROMPT_PREVIEW" });
  const copyAll = () =>
    navigator.clipboard.writeText(`# SYSTEM\n${p.system}\n\n# USER\n${p.user}`);

  return (
    <div
      onClick={close}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-[var(--color-amber-dim)] bg-[var(--color-panel)]/85 shadow-2xl backdrop-blur-xl"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[var(--color-border)] px-4 py-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-amber)]">
            Prompt-Preview — {p.label}
          </span>
          <div className="flex gap-2">
            <button
              onClick={copyAll}
              className="flex items-center gap-1 rounded-full border border-[var(--color-border)] px-2 py-0.5 text-[11px] text-[var(--color-text-dim)] hover:text-[var(--color-text)]"
            >
              <Copy size={10} />
              Alles kopieren
            </button>
            <button onClick={close} className="rounded-full p-1 text-[var(--color-text-dim)] hover:bg-[var(--color-panel-hover)] hover:text-[var(--color-text)]">
              <X size={14} />
            </button>
          </div>
        </div>
        <div className="grid flex-1 grid-cols-1 gap-3 overflow-y-auto p-3 md:grid-cols-2">
          <section>
            <header className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-amber-dim)]">
              System-Prompt
            </header>
            <pre className="whitespace-pre-wrap rounded border border-[var(--color-border)] bg-[var(--color-bg)] p-2 font-mono text-[10px] leading-relaxed text-[var(--color-text)]">
              {p.system}
            </pre>
          </section>
          <section>
            <header className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-amber-dim)]">
              User-Prompt
            </header>
            <pre className="whitespace-pre-wrap rounded border border-[var(--color-border)] bg-[var(--color-bg)] p-2 font-mono text-[10px] leading-relaxed text-[var(--color-text)]">
              {p.user}
            </pre>
          </section>
        </div>
      </div>
    </div>
  );
};
