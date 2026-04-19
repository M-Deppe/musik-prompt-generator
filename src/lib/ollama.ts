export type OllamaModel = {
  name: string;
  size: number;
  modified_at: string;
  details?: {
    parameter_size?: string;
    family?: string;
  };
};

export type GenerateOptions = {
  baseUrl: string;
  model: string;
  prompt: string;
  system?: string;
  temperature?: number;
  onChunk?: (chunk: string, full: string) => void;
  signal?: AbortSignal;
  // Harte Obergrenze fuer die Token-Generierung (Ollama: num_predict). Als
  // Hardcap zusaetzlich zur Prompt-seitigen Laengen-Regel — kleine Modelle
  // halten die Laenge oft nicht ein.
  maxTokens?: number;
  // Optionaler Cloud-Fallback: wenn der Ollama-Call fehlschlaegt (Netzwerk,
  // Connection refused), wird stattdessen der konfigurierte Cloud-Provider
  // benutzt. Nur aktiv wenn settings.cloudProvider != "none" und Key gesetzt.
  cloudFallback?: import("@/types").Settings;
};

export const listModels = async (baseUrl: string): Promise<OllamaModel[]> => {
  const res = await fetch(`${baseUrl}/api/tags`);
  if (!res.ok) throw new Error(`Ollama ${res.status}`);
  const data = await res.json();
  return (data.models ?? []) as OllamaModel[];
};

export const ping = async (baseUrl: string): Promise<boolean> => {
  try {
    const res = await fetch(`${baseUrl}/api/tags`, { method: "GET" });
    return res.ok;
  } catch {
    return false;
  }
};

// Cloud-Fallback-Helper: versucht Cloud-Call, wenn Provider gesetzt ist.
// Cloud liefert KEIN Streaming — wir emulieren onChunk mit einem Single-Shot.
const tryCloudFallback = async (opts: GenerateOptions): Promise<string> => {
  const cfg = opts.cloudFallback;
  if (!cfg || cfg.cloudProvider === "none" || !cfg.cloudApiKey) {
    throw new Error("Cloud-Fallback nicht konfiguriert");
  }
  const { cloudGenerate } = await import("./cloudApi");
  const text = await cloudGenerate({
    settings: cfg,
    system: opts.system,
    prompt: opts.prompt,
    temperature: opts.temperature,
    signal: opts.signal,
  });
  opts.onChunk?.(text, text);
  return text;
};

export const generate = async (opts: GenerateOptions): Promise<string> => {
  let res: Response;
  try {
    res = await fetch(`${opts.baseUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: opts.model,
        prompt: opts.prompt,
        system: opts.system,
        stream: true,
        options: {
          temperature: opts.temperature ?? 0.7,
          ...(opts.maxTokens ? { num_predict: opts.maxTokens } : {}),
        },
      }),
      signal: opts.signal,
    });
  } catch (e) {
    // Netzwerk-Fehler (Ollama offline) — Fallback pruefen.
    if (opts.cloudFallback && opts.cloudFallback.cloudProvider !== "none") {
      return tryCloudFallback(opts);
    }
    throw e;
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Ollama ${res.status}: ${text || res.statusText}`);
  }
  if (!res.body) throw new Error("Keine Response-Body von Ollama");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let full = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const obj = JSON.parse(line);
        if (obj.response) {
          full += obj.response;
          opts.onChunk?.(obj.response, full);
        }
      } catch {
        // nicht-parsebare Zeile ignorieren
      }
    }
  }
  return full;
};
