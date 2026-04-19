import { useStore } from "@/store";
import { getCategoriesForMode, getSectionsForMode } from "@/sections";
import { OptimalOrderBanner, AvoidBanner } from "./InfoBanner";
import { renderSection } from "@/content/registry";

export const Content = () => {
  const { state } = useStore();
  const sections = getSectionsForMode(state.mode, state.settings.target);
  // Fallback falls Sections leer (sollte nie passieren — App.tsx fixt das via
  // useEffect — aber wir wollen keinen Crash beim transient state).
  if (sections.length === 0) return <div className="flex-1 bg-transparent" />;
  const current = sections.find((s) => s.id === state.activeSection) ?? sections[0];
  const Icon = current.icon;
  const category = getCategoriesForMode(state.mode, state.settings.target).find((c) =>
    c.sections.some((s) => s.id === current.id),
  );

  return (
    <main id="main-content" role="main" className="flex-1 overflow-y-auto bg-transparent">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 p-6">
        <header className="flex items-center gap-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-panel)] ring-1 ring-[var(--color-border)]">
            <Icon size={20} className={current.iconColor ?? "text-[var(--color-amber)]"} />
          </span>
          <div className="flex flex-col leading-tight">
            <h1 className="text-2xl font-semibold text-[var(--color-text)]">{current.label}</h1>
            {category && (
              <span className="text-[11px] uppercase tracking-[0.15em] text-[var(--color-text-faint)]">
                {category.label}
              </span>
            )}
          </div>
        </header>

        <div className="flex flex-col gap-3">
          <OptimalOrderBanner />
          <AvoidBanner />
        </div>

        <div className="mt-2 flex flex-col gap-3">{renderSection(current.id, current.label)}</div>
      </div>
    </main>
  );
};
