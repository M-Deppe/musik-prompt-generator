/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { BackupReminderBanner } from "./BackupReminderBanner";

// localStorage/sessionStorage werden durch jsdom bereitgestellt, aber ueber
// Tests hinweg sind sie shared — wir räumen vor jedem Test auf.

describe("BackupReminderBanner", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  afterEach(() => {
    cleanup();
  });

  it("zeigt Banner wenn noch nie ein Backup erstellt wurde", () => {
    render(<BackupReminderBanner />);
    expect(screen.getByText(/Noch kein Backup erstellt/)).toBeTruthy();
    // Button-spezifisch testen, nicht den Fliesstext-Treffer
    expect(screen.getByRole("button", { name: /Jetzt sichern/ })).toBeTruthy();
  });

  it("zeigt Banner wenn Backup aelter als 7 Tage ist", () => {
    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
    localStorage.setItem("mps.lastBackupAt", tenDaysAgo);
    render(<BackupReminderBanner />);
    expect(screen.getByText(/Letztes Backup vor 10 Tagen/)).toBeTruthy();
  });

  it("versteckt Banner wenn Backup juenger als 7 Tage ist", () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    localStorage.setItem("mps.lastBackupAt", threeDaysAgo);
    const { container } = render(<BackupReminderBanner />);
    expect(container.firstChild).toBeNull();
  });

  it("respektiert Session-Dismissal", () => {
    sessionStorage.setItem("mps.backupReminderDismissedSession", "1");
    const { container } = render(<BackupReminderBanner />);
    expect(container.firstChild).toBeNull();
  });
});
