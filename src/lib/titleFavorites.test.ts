/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from "vitest";
import { addFavorite, removeFavorite, loadFavorites, isFavorite, clearFavorites } from "./titleFavorites";

describe("titleFavorites", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("liefert leere Liste initial", () => {
    expect(loadFavorites()).toEqual([]);
  });

  it("addFavorite fuegt Titel hinzu", () => {
    addFavorite("Neon Rain");
    addFavorite("Fading Light");
    expect(loadFavorites()).toEqual(["Neon Rain", "Fading Light"]);
  });

  it("addFavorite dedupliziert", () => {
    addFavorite("Same Title");
    addFavorite("Same Title");
    expect(loadFavorites()).toHaveLength(1);
  });

  it("addFavorite ignoriert leere Strings", () => {
    addFavorite("");
    addFavorite("   ");
    expect(loadFavorites()).toHaveLength(0);
  });

  it("removeFavorite entfernt exakten Titel", () => {
    addFavorite("Keep");
    addFavorite("Remove");
    removeFavorite("Remove");
    expect(loadFavorites()).toEqual(["Keep"]);
  });

  it("isFavorite pruefts korrekt", () => {
    addFavorite("Tracked");
    expect(isFavorite("Tracked")).toBe(true);
    expect(isFavorite("Other")).toBe(false);
  });

  it("clearFavorites leert komplett", () => {
    addFavorite("A");
    addFavorite("B");
    clearFavorites();
    expect(loadFavorites()).toEqual([]);
  });

  it("cap bei 100 (aelteste fliegen raus)", () => {
    for (let i = 0; i < 105; i++) addFavorite(`Title ${i}`);
    const list = loadFavorites();
    expect(list).toHaveLength(100);
    expect(list[0]).toBe("Title 5");
    expect(list[99]).toBe("Title 104");
  });

  it("robust gegen kaputten localStorage", () => {
    localStorage.setItem("mps.titleFavorites", "{nicht json");
    expect(loadFavorites()).toEqual([]);
  });
});
