// Persistierter Favoriten-Pool für Song-Titel. User kann im Titel-Generator
// Favoriten markieren, die dann in einer Liste für spätere Tracks verfügbar
// bleiben.
//
// Storage: localStorage als einfaches String-Array (Reihenfolge = Zeitstempel
// aufsteigend, neueste zuletzt).

const STORAGE_KEY = "mps.titleFavorites";
const MAX_FAVORITES = 100;

export const loadFavorites = (): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((t): t is string => typeof t === "string");
  } catch {
    return [];
  }
};

const save = (list: string[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // Storage blockiert — best effort
  }
};

/** Fügt einen Titel hinzu wenn noch nicht vorhanden. Returnt aktuelle Liste. */
export const addFavorite = (title: string): string[] => {
  const t = title.trim();
  if (!t) return loadFavorites();
  const current = loadFavorites();
  if (current.includes(t)) return current;
  const next = [...current, t].slice(-MAX_FAVORITES);
  save(next);
  return next;
};

/** Entfernt einen Titel aus der Liste. */
export const removeFavorite = (title: string): string[] => {
  const current = loadFavorites();
  const next = current.filter((t) => t !== title);
  save(next);
  return next;
};

export const isFavorite = (title: string): boolean =>
  loadFavorites().includes(title.trim());

export const clearFavorites = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // nichts zu tun
  }
};
