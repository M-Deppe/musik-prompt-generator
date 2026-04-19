import type { Settings } from "@/types";

// Cloud-API-Fallback — wird nur benutzt wenn Ollama offline ist UND ein
// Provider + Key gesetzt ist. Mapping auf die gleiche Signatur wie
// ollama.generate, damit der Aufrufer nicht unterscheiden muss.
//
// SICHERHEIT: API-Keys werden NUR im LocalStorage persistiert (via Settings-
// Persistence). Kein Backend, kein Commit. User ist selbst verantwortlich.

export type CloudGenerateOptions = {
  settings: Settings;
  system?: string;
  prompt: string;
  temperature?: number;
  signal?: AbortSignal;
};

const DEFAULT_MODELS: Record<string, string> = {
  anthropic: "claude-haiku-4-5-20251001",
  openai: "gpt-4o-mini",
};

export const cloudGenerate = async (opts: CloudGenerateOptions): Promise<string> => {
  const { settings, system, prompt, temperature = 0.7, signal } = opts;
  if (settings.cloudProvider === "none" || !settings.cloudApiKey) {
    throw new Error("Cloud-Provider nicht konfiguriert");
  }
  const model = settings.cloudModel || DEFAULT_MODELS[settings.cloudProvider];

  if (settings.cloudProvider === "anthropic") {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": settings.cloudApiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model,
        max_tokens: 2048,
        temperature,
        system,
        messages: [{ role: "user", content: prompt }],
      }),
      signal,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Anthropic ${res.status}: ${text || res.statusText}`);
    }
    const data = await res.json();
    const blocks: Array<{ type: string; text?: string }> = data.content ?? [];
    return blocks
      .filter((b) => b.type === "text" && typeof b.text === "string")
      .map((b) => b.text)
      .join("");
  }

  if (settings.cloudProvider === "openai") {
    const messages = [
      ...(system ? [{ role: "system", content: system }] : []),
      { role: "user", content: prompt },
    ];
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${settings.cloudApiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: 2048,
      }),
      signal,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`OpenAI ${res.status}: ${text || res.statusText}`);
    }
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? "";
  }

  throw new Error(`Unbekannter Cloud-Provider: ${settings.cloudProvider}`);
};

// Ping gegen den Cloud-Provider. Nutzt ein minimal-Request um Key und
// Erreichbarkeit zu pruefen. Wird vom Settings-Panel verwendet.
export const cloudPing = async (settings: Settings): Promise<boolean> => {
  if (settings.cloudProvider === "none" || !settings.cloudApiKey) return false;
  try {
    await cloudGenerate({
      settings,
      prompt: "Say OK",
      temperature: 0,
    });
    return true;
  } catch {
    return false;
  }
};
