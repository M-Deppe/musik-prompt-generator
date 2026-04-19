import type { PromptState } from "@/types";
import { migratePromptState } from "./persistence";

// Kompakte, shareable URL-Repraesentation eines PromptState.
// Design-Entscheidungen:
// - Hash-Fragment (#s=...) statt Query (?s=...): das Fragment wird NICHT an
//   Server gesendet, bleibt rein clientseitig — privacy-friendly.
// - Base64URL-encoded JSON (ohne +/ = damit URL-safe) — kompakt genug fuer
//   typische Prompts, menschenlesbar waere hier nur Clutter.
// - Version-Prefix "v1:" damit spaetere Formate koexistieren koennen.

const HASH_KEY = "s";
const FORMAT_VERSION = "v1";

// Nicht alle PromptState-Felder machen beim Sharing Sinn. Lyrics schon (User
// teilt seinen Song!), aber llmOutput/llmArrangement fliegen aus dem
// PromptState her nicht rein — die werden beim Empfaenger neu generiert.
type SharedPrompt = Partial<PromptState>;

// Base64 fuer URL-Fragment: RFC 4648 "base64url" — +/= ersetzt durch -_ und
// Padding weggelassen. btoa/atob muessen trotzdem klar kommen (brauchen =).
const toBase64Url = (str: string): string => {
  // btoa kann nur Latin-1. Wir UTF-8-encoden vorher.
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const fromBase64Url = (s: string): string => {
  let padded = s.replace(/-/g, "+").replace(/_/g, "/");
  // Padding wiederherstellen — atob braucht Vielfache von 4.
  while (padded.length % 4 !== 0) padded += "=";
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
};

// Minimal-Reduktion: leere Arrays/Strings weglassen, damit die URL kompakt
// bleibt. Der Empfaenger-Migrator fuellt fehlende Felder eh mit Defaults.
const compactPrompt = (prompt: PromptState): SharedPrompt => {
  const out: SharedPrompt = {};
  if (prompt.mainGenre) out.mainGenre = prompt.mainGenre;
  if (prompt.subgenre) out.subgenre = prompt.subgenre;
  if (prompt.secondaryGenre) out.secondaryGenre = prompt.secondaryGenre;
  if (prompt.soundsLike) out.soundsLike = prompt.soundsLike;
  if (prompt.soundsLikeDescription) out.soundsLikeDescription = prompt.soundsLikeDescription;
  if (prompt.bpm) out.bpm = prompt.bpm;
  if (prompt.vocalCharacter) out.vocalCharacter = prompt.vocalCharacter;
  if (prompt.vocalDelivery) out.vocalDelivery = prompt.vocalDelivery;
  if (prompt.vocalEffects) out.vocalEffects = prompt.vocalEffects;
  if (prompt.moods.length > 0) out.moods = prompt.moods;
  if (prompt.instruments.length > 0) out.instruments = prompt.instruments;
  if (prompt.production.length > 0) out.production = prompt.production;
  if (prompt.customTags.length > 0) out.customTags = prompt.customTags;
  if (prompt.negatives.length > 0) out.negatives = prompt.negatives;
  if (prompt.vocalLanguages.length > 0) out.vocalLanguages = prompt.vocalLanguages;
  if (prompt.lyrics) out.lyrics = prompt.lyrics;
  if (prompt.title) out.title = prompt.title;
  return out;
};

/** Encoded Prompt-Repräsentation ohne URL-Prefix — z.B. fuer Tests direkt aufrufbar. */
export const encodePromptState = (prompt: PromptState): string => {
  const compact = compactPrompt(prompt);
  return `${FORMAT_VERSION}:${toBase64Url(JSON.stringify(compact))}`;
};

/** Decode einer encoded-Repraesentation. Null bei unbekannter Version, kaputtem Base64 oder unparsbarem JSON. */
export const decodePromptState = (encoded: string): PromptState | null => {
  try {
    const [version, payload] = encoded.split(":", 2);
    if (version !== FORMAT_VERSION || !payload) return null;
    const json = fromBase64Url(payload);
    const parsed = JSON.parse(json);
    // migratePromptState deckt bereits Typ-Validierung und Default-Befuellung ab.
    return migratePromptState(parsed);
  } catch {
    return null;
  }
};

/** Fertige Share-URL mit aktueller Origin/Path + Hash-Fragment. */
export const buildShareUrl = (prompt: PromptState): string => {
  const encoded = encodePromptState(prompt);
  return `${window.location.origin}${window.location.pathname}#${HASH_KEY}=${encoded}`;
};

/** Liest den aktuellen URL-Hash und parst ihn, wenn er ein geteilter Prompt ist. */
export const readPromptFromUrl = (): PromptState | null => {
  const hash = window.location.hash.replace(/^#/, "");
  if (!hash) return null;
  const params = new URLSearchParams(hash);
  const value = params.get(HASH_KEY);
  if (!value) return null;
  return decodePromptState(value);
};

/** Entfernt den Hash, ohne Reload — nach erfolgreichem Laden eines Shared-Links. */
export const clearUrlHash = (): void => {
  if (typeof window === "undefined") return;
  window.history.replaceState(null, "", window.location.pathname + window.location.search);
};
