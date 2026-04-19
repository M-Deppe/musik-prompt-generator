/** @vitest-environment jsdom */
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { CheckList, type CheckItem } from "./CheckList";

afterEach(cleanup);

const ITEMS: CheckItem[] = [
  { id: "rock", label: "Rock", hint: "guitar-driven" },
  { id: "pop", label: "Pop", hint: "mainstream" },
  { id: "jazz", label: "Jazz", hint: "improvisation" },
  { id: "indie-rock", label: "Indie Rock", hint: "alternative" },
];

describe("CheckList — Suche", () => {
  it("zeigt initial alle Items", () => {
    render(<CheckList items={ITEMS} selected={[]} onToggle={() => {}} />);
    expect(screen.getByText("Rock")).toBeTruthy();
    expect(screen.getByText("Pop")).toBeTruthy();
    expect(screen.getByText("Jazz")).toBeTruthy();
    expect(screen.getByText("Indie Rock")).toBeTruthy();
  });

  it("filtert auf label", () => {
    render(<CheckList items={ITEMS} selected={[]} onToggle={() => {}} />);
    const input = screen.getByPlaceholderText("Suchen...");
    fireEvent.change(input, { target: { value: "rock" } });
    expect(screen.getByText("Rock")).toBeTruthy();
    expect(screen.getByText("Indie Rock")).toBeTruthy();
    expect(screen.queryByText("Pop")).toBeNull();
    expect(screen.queryByText("Jazz")).toBeNull();
  });

  it("filtert auch auf hint", () => {
    render(<CheckList items={ITEMS} selected={[]} onToggle={() => {}} />);
    const input = screen.getByPlaceholderText("Suchen...");
    fireEvent.change(input, { target: { value: "improvisation" } });
    expect(screen.getByText("Jazz")).toBeTruthy();
    expect(screen.queryByText("Rock")).toBeNull();
  });

  it("zeigt 'Keine Treffer' bei leerem Resultat", () => {
    render(<CheckList items={ITEMS} selected={[]} onToggle={() => {}} />);
    const input = screen.getByPlaceholderText("Suchen...");
    fireEvent.change(input, { target: { value: "xyznotfound" } });
    expect(screen.getByText("Keine Treffer")).toBeTruthy();
  });

  it("Re-Render mit neuer items-Referenz erhaelt query-State", () => {
    const { rerender } = render(<CheckList items={ITEMS} selected={[]} onToggle={() => {}} />);
    const input = screen.getByPlaceholderText("Suchen...") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "jazz" } });
    expect(input.value).toBe("jazz");
    expect(screen.queryByText("Rock")).toBeNull();
    // Items-Array komplett neu erzeugt — wie es Grundstil.tsx bei jedem Render macht.
    const reshuffled: CheckItem[] = [...ITEMS];
    rerender(<CheckList items={reshuffled} selected={[]} onToggle={() => {}} />);
    expect(input.value).toBe("jazz");
    expect(screen.getByText("Jazz")).toBeTruthy();
    expect(screen.queryByText("Rock")).toBeNull();
  });
});
