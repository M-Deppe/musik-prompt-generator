import { useMemo } from "react";
import { X, BarChart3, TrendingUp, Star, Music, Heart } from "lucide-react";
import { useStore } from "@/store";
import { computeHistoryStats, MIN_ENTRIES_FOR_TRENDS } from "@/lib/historyStats";

// Stats-Modal zeigt History-Aggregationen. Wird ueber das Header-Icon
// geoeffnet und via dispatch({ type: "SET_INFO_MODAL", modal: "stats" })
// getriggert (nachdem wir "stats" als neuen Modal-Typ hinzugefuegt haben).

export const StatsModal = () => {
  const { state, dispatch } = useStore();
  const stats = useMemo(() => computeHistoryStats(state.history), [state.history]);
  const hasTrends = stats.totalEntries >= MIN_ENTRIES_FOR_TRENDS;

  if (state.infoModal !== "stats") return null;
  const close = () => dispatch({ type: "SET_INFO_MODAL", modal: null });

  return (
    <div
      onClick={close}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="stats-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-[var(--color-amber-dim)] bg-[var(--color-panel)]/85 shadow-2xl backdrop-blur-xl"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[var(--color-border)] px-5 py-3">
          <div className="flex items-center gap-2">
            <BarChart3 size={14} className="text-[var(--color-amber)]" />
            <h2
              id="stats-title"
              className="text-sm font-semibold uppercase tracking-wider text-[var(--color-amber)]"
            >
              Deine Statistik
            </h2>
          </div>
          <button
            onClick={close}
            className="rounded-full p-1 text-[var(--color-text-dim)] transition hover:bg-[var(--color-panel-hover)] hover:text-[var(--color-text)]"
            aria-label="Schließen"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-4">
          {stats.totalEntries === 0 && (
            <p className="py-8 text-center text-sm text-[var(--color-text-faint)]">
              Noch keine History-Einträge. Speichere ein paar Prompts über das Stern-Icon im Preview,
              dann wird hier Statistik sichtbar.
            </p>
          )}

          {stats.totalEntries > 0 && (
            <>
              {/* Top-Row: Anzahl, Scores, BPM, Rating */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <StatCard icon={BarChart3} label="Einträge" value={stats.totalEntries} />
                <StatCard
                  icon={TrendingUp}
                  label="Ø Score"
                  value={stats.averageScore !== null ? `${stats.averageScore}/100` : "—"}
                  hint={hasTrends ? undefined : "mehr Daten nötig"}
                />
                <StatCard
                  icon={Music}
                  label="Ø BPM"
                  value={stats.averageBpm !== null ? String(stats.averageBpm) : "—"}
                />
                <StatCard
                  icon={Star}
                  label="Ø Rating"
                  value={
                    stats.averageRating !== null
                      ? `${stats.averageRating.toFixed(1)} (${stats.ratingsGiven})`
                      : "—"
                  }
                />
              </div>

              {/* Top Genres */}
              {stats.topMainGenres.length > 0 && (
                <Section title="Top Hauptgenres" icon={Music}>
                  <RankedList items={stats.topMainGenres.map((g) => ({ label: g.label, count: g.count }))} />
                </Section>
              )}

              {/* Top Subgenres */}
              {stats.topSubgenres.length > 0 && (
                <Section title="Top Subgenres" icon={Music}>
                  <RankedList items={stats.topSubgenres.map((g) => ({ label: g.label, count: g.count }))} />
                </Section>
              )}

              {/* Top Moods */}
              {stats.topMoods.length > 0 && (
                <Section title="Top Stimmungen" icon={Heart}>
                  <RankedList items={stats.topMoods.map((m) => ({ label: m.mood, count: m.count }))} />
                </Section>
              )}

              {/* Highest/Lowest */}
              {stats.highestScore && stats.lowestScore && (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <ExtremumCard
                    label="Bester Score"
                    color="text-[var(--color-success)]"
                    score={stats.highestScore.score}
                    title={stats.highestScore.entry.title || stats.highestScore.entry.stylePrompt.slice(0, 60)}
                    date={stats.highestScore.entry.createdAt}
                  />
                  <ExtremumCard
                    label="Schwächster Score"
                    color="text-[var(--color-danger)]"
                    score={stats.lowestScore.score}
                    title={stats.lowestScore.entry.title || stats.lowestScore.entry.stylePrompt.slice(0, 60)}
                    date={stats.lowestScore.entry.createdAt}
                  />
                </div>
              )}

              {/* Activity — kompakt: Anzahl Tage, Zeitraum */}
              {stats.entriesPerDay.length > 0 && stats.oldestEntry && stats.newestEntry && (
                <Section title="Aktivität">
                  <div className="flex flex-wrap gap-x-6 gap-y-1 text-[11px] text-[var(--color-text-dim)]">
                    <span>
                      <span className="text-[var(--color-text-faint)]">Aktive Tage:</span>{" "}
                      <span className="text-[var(--color-text)]">{stats.entriesPerDay.length}</span>
                    </span>
                    <span>
                      <span className="text-[var(--color-text-faint)]">Von:</span>{" "}
                      <span className="text-[var(--color-text)]">
                        {new Date(stats.oldestEntry.createdAt).toLocaleDateString("de-DE")}
                      </span>
                    </span>
                    <span>
                      <span className="text-[var(--color-text-faint)]">Bis:</span>{" "}
                      <span className="text-[var(--color-text)]">
                        {new Date(stats.newestEntry.createdAt).toLocaleDateString("de-DE")}
                      </span>
                    </span>
                  </div>
                </Section>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Helper-Komponenten ---------------------------------------------------

type StatCardProps = {
  icon: typeof BarChart3;
  label: string;
  value: string | number;
  hint?: string;
};

const StatCard = ({ icon: Icon, label, value, hint }: StatCardProps) => (
  <div className="flex flex-col gap-1 rounded border border-[var(--color-border)] bg-[var(--color-bg)]/60 p-3">
    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[var(--color-text-dim)]">
      <Icon size={10} />
      {label}
    </div>
    <div className="text-base font-bold tabular-nums text-[var(--color-text)]">{value}</div>
    {hint && <div className="text-[10px] text-[var(--color-text-faint)]">{hint}</div>}
  </div>
);

const Section = ({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon?: typeof BarChart3;
  children: React.ReactNode;
}) => (
  <section className="flex flex-col gap-1.5">
    <h3 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-amber-dim)]">
      {Icon && <Icon size={11} />}
      {title}
    </h3>
    {children}
  </section>
);

const RankedList = ({ items }: { items: Array<{ label: string; count: number }> }) => {
  const max = Math.max(...items.map((i) => i.count), 1);
  return (
    <ul className="flex flex-col gap-1">
      {items.map((item, idx) => (
        <li key={`${idx}-${item.label}`} className="flex items-center gap-2 text-[11px]">
          <span className="w-4 shrink-0 text-right text-[10px] text-[var(--color-text-faint)]">
            {idx + 1}
          </span>
          <span className="w-32 shrink-0 truncate text-[var(--color-text)]">{item.label}</span>
          <div className="h-1 flex-1 rounded-full bg-[var(--color-panel)]">
            <div
              className="h-full rounded-full bg-[var(--color-amber)] transition-all"
              style={{ width: `${(item.count / max) * 100}%` }}
            />
          </div>
          <span className="w-8 shrink-0 text-right tabular-nums text-[var(--color-text-dim)]">
            {item.count}
          </span>
        </li>
      ))}
    </ul>
  );
};

type ExtremumCardProps = {
  label: string;
  color: string;
  score: number;
  title: string;
  date: string;
};

const ExtremumCard = ({ label, color, score, title, date }: ExtremumCardProps) => (
  <div className="flex flex-col gap-1 rounded border border-[var(--color-border)] bg-[var(--color-bg)]/60 p-3">
    <div className="flex items-center justify-between">
      <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-dim)]">{label}</span>
      <span className={`text-sm font-bold tabular-nums ${color}`}>{score}/100</span>
    </div>
    <div className="truncate text-[11px] text-[var(--color-text)]" title={title}>
      {title || "—"}
    </div>
    <div className="text-[10px] text-[var(--color-text-faint)]">
      {new Date(date).toLocaleDateString("de-DE")}
    </div>
  </div>
);
