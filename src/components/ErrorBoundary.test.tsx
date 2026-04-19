/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { ErrorBoundary } from "./ErrorBoundary";

// Komponente die beim Rendern explodiert — nur zum Testen.
const Exploder = ({ msg = "kaputt" }: { msg?: string }) => {
  throw new Error(msg);
};

// Komponente die sauber rendert.
const Safe = () => <div>ich bin ok</div>;

describe("ErrorBoundary", () => {
  // React loggt Errors in componentDidCatch standardmäßig auf console.error.
  // Im Test-Output ist das Noise — wir mocken es.
  let consoleError: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
  });
  afterEach(() => {
    consoleError.mockRestore();
    cleanup(); // DOM zwischen Tests aufraeumen — Vitest macht das nicht automatisch
  });

  it("rendert Children wenn kein Fehler auftritt", () => {
    render(
      <ErrorBoundary>
        <Safe />
      </ErrorBoundary>,
    );
    expect(screen.getByText("ich bin ok")).toBeTruthy();
  });

  it("fängt Render-Fehler und zeigt Fallback-UI", () => {
    render(
      <ErrorBoundary>
        <Exploder msg="testfehler-abc" />
      </ErrorBoundary>,
    );
    expect(screen.getByText(/App-Fehler/)).toBeTruthy();
    expect(screen.getByText(/testfehler-abc/)).toBeTruthy();
  });

  it("zeigt alle drei Action-Buttons", () => {
    render(
      <ErrorBoundary>
        <Exploder />
      </ErrorBoundary>,
    );
    expect(screen.getByText(/State \+ Fehler exportieren/)).toBeTruthy();
    expect(screen.getByText(/Weiter versuchen/)).toBeTruthy();
    expect(screen.getByText(/App neu laden/)).toBeTruthy();
  });

  it("'Weiter versuchen' resettet die Boundary", () => {
    // Dynamisches Verhalten: beim ersten Mount kaputt, nach Reset sauber
    let phase: "broken" | "fixed" = "broken";
    const Dynamic = () => {
      if (phase === "broken") throw new Error("erst kaputt");
      return <div>jetzt heil</div>;
    };
    const { rerender } = render(
      <ErrorBoundary>
        <Dynamic />
      </ErrorBoundary>,
    );
    expect(screen.getByText(/App-Fehler/)).toBeTruthy();
    phase = "fixed";
    fireEvent.click(screen.getByText(/Weiter versuchen/));
    rerender(
      <ErrorBoundary>
        <Dynamic />
      </ErrorBoundary>,
    );
    expect(screen.getByText("jetzt heil")).toBeTruthy();
  });
});
