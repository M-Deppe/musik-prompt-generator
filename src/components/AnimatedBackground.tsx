import { useMemo } from "react";
import { useStore } from "@/store";

// Variants-basierter Background. User waehlt in Settings, welcher Stil laeuft:
//   - network: konstellation / Datennetzwerk (default)
//   - liquid:  fliessende Blobs
//   - stream:  horizontale Licht-Bahnen
//   - aurora:  wabernde Lichtbaender
//   - off:     kein Hintergrund (statische Basis)
// Alle Varianten: warme Farbpalette passend zur Amber-UI.

// Gemeinsame dunkle Basis + Noise-Grain.
const Shell = ({ children }: { children: React.ReactNode }) => (
  <div
    aria-hidden="true"
    className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
  >
    <div className="absolute inset-0 bg-[oklch(0.1_0.015_60)] light-mode:bg-[oklch(0.96_0.01_75)]" />
    {children}
    <div
      className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='1'/></svg>\")",
      }}
    />
  </div>
);

// ---------- NETWORK (default) ----------
const NODES: { x: number; y: number }[] = [
  { x: 150, y: 120 }, { x: 450, y: 80 }, { x: 820, y: 160 }, { x: 1180, y: 100 },
  { x: 1520, y: 180 }, { x: 1800, y: 80 },
  { x: 80, y: 380 }, { x: 380, y: 320 }, { x: 680, y: 420 }, { x: 1040, y: 360 },
  { x: 1380, y: 440 }, { x: 1700, y: 340 },
  { x: 220, y: 620 }, { x: 560, y: 680 }, { x: 900, y: 600 }, { x: 1240, y: 700 },
  { x: 1580, y: 640 }, { x: 1820, y: 720 },
  { x: 120, y: 920 }, { x: 460, y: 960 }, { x: 800, y: 900 }, { x: 1160, y: 980 },
  { x: 1520, y: 920 }, { x: 1780, y: 1000 },
];

const CONNECT_MAX_DIST = 420;

const NetworkBg = () => {
  const edges = useMemo(() => {
    const result: { x1: number; y1: number; x2: number; y2: number; key: string }[] = [];
    for (let i = 0; i < NODES.length; i++) {
      for (let j = i + 1; j < NODES.length; j++) {
        const dx = NODES[i].x - NODES[j].x;
        const dy = NODES[i].y - NODES[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < CONNECT_MAX_DIST) {
          result.push({
            x1: NODES[i].x, y1: NODES[i].y,
            x2: NODES[j].x, y2: NODES[j].y,
            key: `${i}-${j}`,
          });
        }
      }
    }
    return result;
  }, []);
  const delays = useMemo(() => {
    let s = 42;
    return edges.map(() => {
      s = (s * 1664525 + 1013904223) % 2 ** 32;
      return (s / 2 ** 32) * 8;
    });
  }, [edges]);

  return (
    <>
      <div
        className="absolute left-1/2 top-1/2 h-[70vh] w-[70vw] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.1]"
        style={{
          background: "radial-gradient(ellipse, oklch(0.55 0.09 70 / 0.7) 0%, transparent 70%)",
          filter: "blur(120px)",
        }}
      />
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
      >
        {edges.map((e, i) => (
          <line
            key={`s-${e.key}`}
            x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
            stroke="oklch(0.55 0.09 70)"
            strokeWidth={0.8}
            opacity={0.14}
            style={{ animation: `edge-pulse 6s ease-in-out ${delays[i]}s infinite` }}
          />
        ))}
        {edges.map((e, i) => {
          if (i % 7 !== 0) return null;
          const len = Math.sqrt((e.x2 - e.x1) ** 2 + (e.y2 - e.y1) ** 2);
          return (
            <line
              key={`f-${e.key}`}
              x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
              stroke="oklch(0.76 0.13 75)"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeDasharray="5 9999"
              style={{
                filter: "drop-shadow(0 0 5px oklch(0.76 0.13 75))",
                animation: `edge-flow ${4 + len / 80}s linear ${delays[i]}s infinite`,
                opacity: 0.7,
              }}
            />
          );
        })}
        {NODES.map((n, i) => {
          const variant = i % 7;
          const color = variant === 6 ? "oklch(0.5 0.1 290)"
            : variant === 3 ? "oklch(0.5 0.08 200)"
            : "oklch(0.65 0.11 70)";
          return (
            <circle
              key={i}
              cx={n.x} cy={n.y}
              r={variant !== 6 && variant !== 3 ? 3 : 2.5}
              fill={color}
              style={{
                animation: `node-pulse 3.5s ease-in-out ${(i * 0.3) % 4}s infinite`,
                filter: `drop-shadow(0 0 4px ${color})`,
                opacity: variant !== 6 && variant !== 3 ? 0.8 : 0.5,
              }}
            />
          );
        })}
      </svg>
    </>
  );
};

// ---------- LIQUID ----------
const LiquidBg = () => (
  <>
    <div
      className="absolute left-[-10%] top-[-15%] h-[70vw] w-[70vw]"
      style={{
        background: "radial-gradient(circle at 45% 45%, oklch(0.5 0.14 60 / 0.55) 0%, transparent 70%)",
        filter: "blur(95px)",
        mixBlendMode: "screen",
        animation: "liquid-morph-1 42s ease-in-out infinite",
      }}
    />
    <div
      className="absolute left-[50%] top-[-10%] h-[60vw] w-[60vw]"
      style={{
        background: "radial-gradient(circle at 45% 45%, oklch(0.45 0.12 40 / 0.5) 0%, transparent 70%)",
        filter: "blur(100px)",
        mixBlendMode: "screen",
        animation: "liquid-morph-2 55s ease-in-out 6s infinite",
      }}
    />
    <div
      className="absolute left-[-20%] top-[40%] h-[65vw] w-[65vw]"
      style={{
        background: "radial-gradient(circle at 45% 45%, oklch(0.45 0.1 80 / 0.45) 0%, transparent 70%)",
        filter: "blur(105px)",
        mixBlendMode: "screen",
        animation: "liquid-morph-3 68s ease-in-out 11s infinite",
      }}
    />
    <div
      className="absolute left-[45%] top-[45%] h-[55vw] w-[55vw]"
      style={{
        background: "radial-gradient(circle at 45% 45%, oklch(0.4 0.08 280 / 0.35) 0%, transparent 70%)",
        filter: "blur(100px)",
        mixBlendMode: "screen",
        animation: "liquid-morph-1 50s ease-in-out 16s infinite",
      }}
    />
  </>
);

// ---------- STREAM ----------
const STREAM_ROWS = [
  { top: 18, height: "3px", color: "oklch(0.6 0.12 75)", opacity: 0.35, duration: 32, delay: 0, dir: "ltr" },
  { top: 32, height: "2px", color: "oklch(0.55 0.1 60)", opacity: 0.25, duration: 45, delay: 6, dir: "rtl" },
  { top: 48, height: "4px", color: "oklch(0.6 0.13 70)", opacity: 0.3, duration: 28, delay: 2, dir: "ltr" },
  { top: 62, height: "2px", color: "oklch(0.5 0.09 80)", opacity: 0.22, duration: 55, delay: 10, dir: "rtl" },
  { top: 78, height: "3px", color: "oklch(0.55 0.12 65)", opacity: 0.28, duration: 38, delay: 4, dir: "ltr" },
  { top: 88, height: "2px", color: "oklch(0.5 0.08 75)", opacity: 0.2, duration: 48, delay: 14, dir: "rtl" },
];

const StreamBg = () => (
  <>
    <div
      className="absolute left-1/2 top-1/2 h-[70vh] w-[70vw] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.1]"
      style={{
        background: "radial-gradient(ellipse, oklch(0.5 0.12 70 / 0.6) 0%, transparent 70%)",
        filter: "blur(100px)",
      }}
    />
    {STREAM_ROWS.map((r, i) => (
      <div
        key={i}
        className="absolute left-0 w-[200%]"
        style={{
          top: `${r.top}%`,
          height: r.height,
          background: `linear-gradient(90deg, transparent 0%, transparent 30%, ${r.color} 50%, transparent 70%, transparent 100%)`,
          filter: "blur(40px)",
          opacity: r.opacity,
          animation: `${r.dir === "ltr" ? "data-stream-ltr" : "data-stream-rtl"} ${r.duration}s linear ${r.delay}s infinite`,
          mixBlendMode: "screen",
        }}
      />
    ))}
  </>
);

// ---------- AURORA ----------
const AURORA_BANDS = [
  { top: 15, rotate: -8, colors: "oklch(0.5 0.15 75 / 0.6), oklch(0.55 0.18 55 / 0.75), oklch(0.45 0.12 30 / 0.45)", height: "35%", blur: 80, duration: 28, delay: 0, anim: "aurora-drift-1", opacity: 0.55 },
  { top: 45, rotate: 6, colors: "oklch(0.45 0.1 80 / 0.4), oklch(0.5 0.15 60 / 0.65), oklch(0.5 0.16 40 / 0.4)", height: "30%", blur: 90, duration: 38, delay: 4, anim: "aurora-drift-2", opacity: 0.5 },
  { top: 70, rotate: -4, colors: "oklch(0.4 0.08 70 / 0.35), oklch(0.45 0.12 55 / 0.6), oklch(0.5 0.13 80 / 0.35)", height: "32%", blur: 85, duration: 34, delay: 8, anim: "aurora-drift-3", opacity: 0.5 },
  { top: 90, rotate: 3, colors: "oklch(0.4 0.1 60 / 0.3), oklch(0.45 0.14 80 / 0.55), oklch(0.4 0.1 40 / 0.3)", height: "28%", blur: 100, duration: 46, delay: 12, anim: "aurora-drift-1", opacity: 0.4 },
];

const AuroraBg = () => (
  <>
    {AURORA_BANDS.map((b, i) => (
      <div
        key={i}
        className="absolute left-1/2"
        style={{
          top: `${b.top}%`,
          width: "160%",
          height: b.height,
          transform: `translateX(-50%) rotate(${b.rotate}deg)`,
          filter: `blur(${b.blur}px)`,
          opacity: b.opacity,
          background: `linear-gradient(90deg, transparent 0%, ${b.colors}, transparent 100%)`,
          animation: `${b.anim} ${b.duration}s ease-in-out ${b.delay}s infinite`,
          mixBlendMode: "screen",
        }}
      />
    ))}
  </>
);

// ---------- Hauptkomponente ----------
export const AnimatedBackground = () => {
  const { state } = useStore();
  const variant = state.settings.backgroundVariant;

  if (variant === "off") {
    // Dezente Ambient-Basis nur, kein Movement.
    return (
      <Shell>
        <div
          className="absolute left-1/2 top-1/2 h-[70vh] w-[70vw] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.08]"
          style={{
            background: "radial-gradient(ellipse, oklch(0.55 0.09 70 / 0.5) 0%, transparent 70%)",
            filter: "blur(120px)",
          }}
        />
      </Shell>
    );
  }

  return (
    <Shell>
      {variant === "network" && <NetworkBg />}
      {variant === "liquid" && <LiquidBg />}
      {variant === "stream" && <StreamBg />}
      {variant === "aurora" && <AuroraBg />}
    </Shell>
  );
};
