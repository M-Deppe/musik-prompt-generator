/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { OnboardingOverlay } from "./OnboardingOverlay";

describe("OnboardingOverlay", () => {
  beforeEach(() => {
    localStorage.clear();
  });
  afterEach(() => {
    cleanup();
  });

  it("zeigt Overlay beim ersten Besuch (kein localStorage-Flag)", () => {
    render(<OnboardingOverlay />);
    expect(screen.getByText(/Willkommen im Musik Prompt Generator/)).toBeTruthy();
  });

  it("versteckt Overlay wenn localStorage-Flag gesetzt ist", () => {
    localStorage.setItem("mps.onboardingSeen", "1");
    const { container } = render(<OnboardingOverlay />);
    expect(container.firstChild).toBeNull();
  });

  it("'Los geht's' schliesst das Overlay und setzt den Flag", () => {
    render(<OnboardingOverlay />);
    fireEvent.click(screen.getByRole("button", { name: /Los geht's/ }));
    expect(localStorage.getItem("mps.onboardingSeen")).toBe("1");
    expect(screen.queryByText(/Willkommen im Musik Prompt Generator/)).toBeNull();
  });

  it("X-Button schliesst das Overlay und setzt den Flag", () => {
    render(<OnboardingOverlay />);
    fireEvent.click(screen.getByRole("button", { name: /Onboarding schließen/ }));
    expect(localStorage.getItem("mps.onboardingSeen")).toBe("1");
  });

  it("zeigt alle 3 Step-Überschriften", () => {
    render(<OnboardingOverlay />);
    expect(screen.getByText(/Genre wählen/)).toBeTruthy();
    expect(screen.getByText(/Stimmung \+ Vocals/)).toBeTruthy();
    expect(screen.getByText("Generieren")).toBeTruthy();
  });

  it("ESC-Taste schliesst das Overlay", () => {
    render(<OnboardingOverlay />);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(localStorage.getItem("mps.onboardingSeen")).toBe("1");
  });
});
