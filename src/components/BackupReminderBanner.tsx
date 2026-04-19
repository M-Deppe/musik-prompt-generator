import { useEffect, useState } from "react";
import { Database, Download, X } from "lucide-react";
import {
  daysSinceLastBackup,
  exportFullBackup,
  setLastBackupAt,
} from "@/lib/persistence";

// Schwelle ab wann ein Reminder erscheint. 7 Tage ist Standard fuer Auto-
// Backup — danach waren typischerweise mehrere Sessions mit neuen Tracks/
// Presets, der Datenverlust-Schaden bei localStorage-Reset waere echt.
const REMINDER_DAYS = 7;
// Dismiss-Key pro Session — wir speichern dismissal NICHT im localStorage.
// User soll pro Session neu entscheiden, sonst verschwindet der Reminder
// fuer immer beim ersten Wegklick und das eigentliche Risiko bleibt.
const DISMISS_KEY = "mps.backupReminderDismissedSession";

// Banner unter dem Header, wenn das letzte Full-Backup > 7 Tage alt ist
// (oder noch nie gemacht wurde). CTA triggert den Download inline — Settings-
// Panel muss dafuer nicht geoeffnet werden.
export const BackupReminderBanner = () => {
  const [dismissed, setDismissed] = useState<boolean>(() => {
    // sessionStorage: verschwindet beim Tab-close, localStorage: wuerde
    // permanent dismissen und das waer nicht der Sinn der Uebung.
    try {
      return sessionStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      return false;
    }
  });
  // Trigger fuer Re-Render nach erfolgreichem Backup. daysSinceLastBackup()
  // ist kein State — wir brauchen einen Tick damit der Banner verschwindet.
  const [, setTick] = useState(0);

  const daysSince = daysSinceLastBackup();
  const overdue = daysSince === null || daysSince >= REMINDER_DAYS;

  // Session-Dismissal persistieren, damit auch Re-Renders der App den
  // Banner nicht wieder einblenden.
  useEffect(() => {
    if (!dismissed) return;
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // sessionStorage blockiert (Safari privat, etc.) — dismissal bleibt in-memory.
    }
  }, [dismissed]);

  if (dismissed || !overdue) return null;

  const downloadNow = () => {
    const json = exportFullBackup();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    a.href = url;
    a.download = `mps-backup-${stamp}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setLastBackupAt();
    // Re-Render — daysSinceLastBackup ist jetzt 0 → overdue === false → null-return.
    setTick((n) => n + 1);
  };

  const label =
    daysSince === null
      ? "Noch kein Backup erstellt"
      : `Letztes Backup vor ${daysSince} Tagen`;

  return (
    <div className="border-b border-[var(--color-amber-dim)]/40 bg-[var(--color-amber)]/10 px-6 py-2">
      <div className="flex items-center gap-3">
        <Database size={14} className="shrink-0 text-[var(--color-amber)]" />
        <div className="flex-1 text-xs leading-relaxed">
          <span className="font-semibold text-[var(--color-amber)]">{label}</span>
          <span className="ml-2 text-[var(--color-text-dim)]">
            — localStorage kann bei Browser-Reset verloren gehen. Jetzt sichern lohnt sich.
          </span>
        </div>
        <button
          type="button"
          onClick={downloadNow}
          className="flex shrink-0 items-center gap-1.5 rounded border border-[var(--color-amber)] bg-[var(--color-amber)]/15 px-3 py-1 text-[11px] font-medium text-[var(--color-amber)] hover:bg-[var(--color-amber)]/25"
        >
          <Download size={11} />
          Jetzt sichern
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="shrink-0 rounded p-1 text-[var(--color-amber-dim)] hover:bg-[var(--color-amber)]/20 hover:text-[var(--color-amber)]"
          title="Für diese Session ausblenden"
          aria-label="Backup-Reminder ausblenden"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};
