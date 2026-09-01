import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Atmosphere } from "@/components/Atmosphere";
import { Cursor } from "@/components/Cursor";
import { Navbar } from "@/components/Navbar";
import { Reveal } from "@/components/Reveal";
import { ProductStage } from "@/components/ProductStage";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  isSoundEnabled,
  playClick,
  playThud,
  setAmbientColor,
  setSoundEnabled,
  startAmbient,
  stopAmbient,
} from "@/lib/sound";
import {
  CATEGORIES,
  COLOR_PALETTE,
  MATERIAL_OPTIONS,
  MAX_INTENSITY,
  MIN_INTENSITY,
  VARIANT_OPTIONS,
  defaultConfig,
  type Category,
  type Material,
  type PartConfig,
  type Variant,
} from "@/lib/setup-types";

export const Route = createFileRoute("/builder")({
  head: () => ({
    meta: [
      { title: "Builder — SETUPVERSE" },
      {
        name: "description",
        content:
          "Design your own setup in real time 3D: customize the color and style of your PC, monitor, keyboard, mouse, chair and lighting, then assemble it.",
      },
      { property: "og:title", content: "Builder — SETUPVERSE" },
      {
        property: "og:description",
        content:
          "Assemble and customize your own workspace piece by piece in an interactive 3D configurator.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Builder,
});

const PARTS: readonly Category[] = CATEGORIES;

const SPECS: Record<Category, string> = {
  PC: "CORE ENGINE — click the tower to explode the build",
  MONITOR: "THE WINDOW — pick a size, tune the glow",
  KEYBOARD: "TOUCH — full size or tenkeyless, per-key glow",
  MOUSE: "PRECISION — sculpted shell, sensor rail",
  CHAIR: "POSTURE — high-back comfort or racer bucket",
  LIGHTING: "ATMOSPHERE — pulsing or static ambient bars",
  WEBCAM: "PRESENCE — clip-on, ring light, or stream-ready",
  SPEAKERS: "SOUND — desktop pair, soundbar, or studio monitors",
  MOUSEPAD: "SURFACE — compact, extended, or RGB-rimmed",
};

function initialConfigs(): Record<Category, PartConfig> {
  const init = {} as Record<Category, PartConfig>;
  for (const c of PARTS) init[c] = defaultConfig(c);
  return init;
}

function Builder() {
  const [active, setActive] = useState<Category>("PC");
  const [exploded, setExploded] = useState(false);
  const [mode, setMode] = useState<"COMPONENT" | "SETUP">("COMPONENT");
  const [included, setIncluded] = useState<Category[]>(["PC"]);
  const [configs, setConfigs] = useState<Record<Category, PartConfig>>(initialConfigs);

  const [soundOn, setSoundOn] = useState(true);
  const [ambientOn, setAmbientOn] = useState(false);
  const [showIntro, setShowIntro] = useState(false);

  // Undo history: snapshots of {configs, included} taken before each mutating action.
  const history = useRef<{ configs: Record<Category, PartConfig>; included: Category[] }[]>([]);

  useEffect(() => {
    setSoundOn(isSoundEnabled());
    if (typeof window !== "undefined" && !localStorage.getItem("setupverse-onboarded")) {
      setShowIntro(true);
    }
  }, []);

  useEffect(() => {
    if (ambientOn) setAmbientColor(configs[active].color);
  }, [configs, active, ambientOn]);

  const dismissIntro = () => {
    setShowIntro(false);
    localStorage.setItem("setupverse-onboarded", "1");
  };

  const toggleMute = () => {
    const next = !soundOn;
    setSoundEnabled(next);
    setSoundOn(next);
    if (!next) setAmbientOn(false);
  };

  const toggleAmbient = () => {
    if (!soundOn) return;
    setAmbientOn((on) => {
      if (on) stopAmbient();
      else startAmbient(configs[active].color);
      return !on;
    });
  };

  const pushHistory = () => {
    history.current = [...history.current.slice(-19), { configs, included }];
  };

  const undo = () => {
    const prev = history.current.pop();
    if (!prev) return;
    setConfigs(prev.configs);
    setIncluded(prev.included);
    playClick(420);
  };

  const resetAll = () => {
    pushHistory();
    setConfigs(initialConfigs());
    setIncluded(["PC"]);
    setActive("PC");
    setExploded(false);
    playThud();
    toast.success("Reset to defaults.");
  };

  const randomizeActive = () => {
    pushHistory();
    const palette = COLOR_PALETTE.map((c) => c.value);
    const variants = VARIANT_OPTIONS[active];
    const materials = MATERIAL_OPTIONS.map((m) => m.value);
    updateConfig(active, {
      color: palette[Math.floor(Math.random() * palette.length)]!,
      variant: variants[Math.floor(Math.random() * variants.length)]!.value,
      material: materials[Math.floor(Math.random() * materials.length)]!,
      intensity: Math.round((MIN_INTENSITY + Math.random() * (MAX_INTENSITY - MIN_INTENSITY)) * 10) / 10,
    });
    playClick(880);
  };

  const toggleIncluded = (p: Category) => {
    pushHistory();
    setActive(p);
    setIncluded((c) => (c.includes(p) ? c.filter((x) => x !== p) : [...c, p]));
    playClick(440);
  };

  const updateConfig = (
    p: Category,
    patch: Partial<Pick<PartConfig, "color" | "variant" | "material" | "intensity">>,
  ) => setConfigs((c) => ({ ...c, [p]: { ...c[p], ...patch } }));

  const chosenConfigs: PartConfig[] = included.map((c) => configs[c]);

  // Keyboard shortcuts: 1-6 select category, R randomizes, Ctrl/Cmd+Z undoes, E toggles explode.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        undo();
        return;
      }
      const idx = Number(e.key) - 1;
      if (idx >= 0 && idx < PARTS.length) {
        const p = PARTS[idx]!;
        if (mode === "SETUP") toggleIncluded(p);
        else {
          setActive(p);
          setExploded(false);
          playClick(520);
        }
        return;
      }
      if (e.key.toLowerCase() === "r") randomizeActive();
      if (e.key.toLowerCase() === "e" && active === "PC" && mode === "COMPONENT") {
        setExploded((x) => !x);
        playClick(600);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, active, configs, included]);

  const activeConfig = configs[active];

  return (
    <TooltipProvider delayDuration={200}>
    <main className="relative min-h-screen bg-background text-foreground">
      <Atmosphere />
      <Cursor />
      <Navbar />

      {showIntro && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md px-6">
          <div className="glass-panel max-w-md rounded-[28px] p-8 text-center">
            <p className="text-[9px] tracking-[0.35em] text-accent">WELCOME</p>
            <h2 className="text-cine mt-3 text-2xl">BUILD YOUR SETUP.</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Click a component to select it, then customize its color, style, finish and
              glow below. Switch to SETUP to assemble the pieces together on a desk.
            </p>
            <p className="mt-3 text-[10px] tracking-[0.2em] text-muted-foreground/70">
              SHORTCUTS: 1–6 SELECT · R RANDOMIZE · CTRL+Z UNDO · E EXPLODE
            </p>
            <button
              type="button"
              onClick={dismissIntro}
              className="mt-6 rounded-full bg-accent px-8 py-3 text-[10px] tracking-[0.3em] text-accent-foreground transition-all duration-500 hover:opacity-90"
            >
              LET'S BUILD
            </button>
          </div>
        </div>
      )}

      <section className="relative z-10 mx-auto max-w-[1500px] px-6 pb-20 pt-28 sm:px-10">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-[10px] tracking-[0.35em] text-muted-foreground">
                CONFIGURATOR / LIVE 3D
              </p>
              <h1 className="text-cine text-luxe mt-4 text-[11vw] leading-[0.9] sm:text-[6vw] lg:text-[4.2vw]">
                BUILD YOUR SETUP.
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={undo}
                    aria-label="Undo"
                    className="glass-panel flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-all duration-300 hover:text-accent"
                  >
                    ↺
                  </button>
                </TooltipTrigger>
                <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={randomizeActive}
                    aria-label="Randomize active part"
                    className="glass-panel flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-all duration-300 hover:text-accent"
                  >
                    🎲
                  </button>
                </TooltipTrigger>
                <TooltipContent>Randomize {active} (R)</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={resetAll}
                    aria-label="Reset everything"
                    className="glass-panel flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-all duration-300 hover:text-accent"
                  >
                    ⟲
                  </button>
                </TooltipTrigger>
                <TooltipContent>Reset to defaults</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={toggleAmbient}
                    disabled={!soundOn}
                    aria-label="Toggle ambient sound"
                    className={`glass-panel flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 disabled:opacity-30 ${
                      ambientOn ? "text-accent" : "text-muted-foreground hover:text-accent"
                    }`}
                  >
                    {ambientOn ? "◉" : "○"}
                  </button>
                </TooltipTrigger>
                <TooltipContent>{ambientOn ? "Stop ambient hum" : "Play ambient hum (synced to color)"}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={toggleMute}
                    aria-label="Toggle sound"
                    className="glass-panel flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-all duration-300 hover:text-accent"
                  >
                    {soundOn ? "🔊" : "🔇"}
                  </button>
                </TooltipTrigger>
                <TooltipContent>{soundOn ? "Mute all sound" : "Unmute"}</TooltipContent>
              </Tooltip>
              <div className="glass-panel flex rounded-full p-1">
                {(["COMPONENT", "SETUP"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setMode(m);
                      playClick(500);
                    }}
                    className={`rounded-full px-5 py-2 text-[10px] tracking-[0.28em] transition-all duration-500 ${
                      mode === m
                        ? "bg-accent/15 text-accent glow-accent"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]">
          <Reveal>
            <div className="glass-panel relative overflow-hidden rounded-[28px]">
              <div className="h-[62vh] min-h-[440px] w-full">
                <ProductStage
                  category={active}
                  exploded={exploded}
                  onToggleExplode={() => setExploded((e) => !e)}
                  autoSpin={mode === "SETUP"}
                  setup={mode === "SETUP" ? chosenConfigs : undefined}
                  accent={activeConfig.color}
                  variant={activeConfig.variant}
                  material={activeConfig.material}
                  intensity={activeConfig.intensity}
                />
              </div>
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_80%_at_50%_45%,transparent_65%,var(--color-background)_100%)]" />
              <div className="pointer-events-none absolute left-6 top-6 flex items-center gap-2 text-[9px] tracking-[0.3em] text-muted-foreground">
                <span
                  className="h-1.5 w-1.5 animate-pulse rounded-full"
                  style={{ backgroundColor: activeConfig.color }}
                />
                {mode === "SETUP" ? "ASSEMBLY" : active}
              </div>
              <div className="pointer-events-none absolute bottom-6 left-6 right-6 flex flex-wrap justify-between gap-3 text-[9px] tracking-[0.3em] text-muted-foreground">
                <span>DRAG TO ROTATE</span>
                <span>
                  {mode === "SETUP"
                    ? `${included.length}/${PARTS.length} PIECES PLACED`
                    : active === "PC"
                      ? exploded
                        ? "CLICK TO REBUILD"
                        : "CLICK TO EXPLODE"
                      : SPECS[active]}
                </span>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="flex flex-col gap-2">
              <p className="text-[9px] tracking-[0.3em] text-muted-foreground">
                {mode === "SETUP" ? "TAP TO ADD / SELECT TO CUSTOMIZE" : "INSPECT & CUSTOMIZE"}
              </p>
              {PARTS.map((p) => {
                const inSetup = included.includes(p);
                const isActive = active === p;
                const on = mode === "SETUP" ? inSetup : isActive;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      if (mode === "SETUP") toggleIncluded(p);
                      else {
                        setActive(p);
                        setExploded(false);
                        playClick(520);
                      }
                    }}
                    className={`glass-panel group relative overflow-hidden rounded-2xl px-6 py-2.5 text-left transition-all duration-500 hover:-translate-y-0.5 ${
                      on ? "text-foreground glow-accent" : "text-muted-foreground"
                    } ${mode === "SETUP" && isActive && !inSetup ? "ring-1 ring-accent/40" : ""}`}
                  >
                    <span className="text-[11px] tracking-[0.2em]">{p}</span>
                    <span
                      className="absolute right-5 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full transition-all duration-500"
                      style={{
                        backgroundColor: on ? configs[p].color : "var(--color-foreground)",
                        opacity: on ? 1 : 0.15,
                      }}
                    />
                  </button>
                );
              })}

              {/* Customize panel — always reflects whichever part is currently selected/active */}
              <div className="glass-panel mt-1 flex flex-col gap-3 rounded-2xl p-3.5">
                <p className="text-[9px] tracking-[0.3em] text-muted-foreground">
                  CUSTOMIZE {active}
                </p>

                <div>
                  <p className="mb-2 text-[8px] tracking-[0.25em] text-muted-foreground/70">
                    COLOR
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    {COLOR_PALETTE.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        title={c.label}
                        onClick={() => {
                          pushHistory();
                          updateConfig(active, { color: c.value });
                          playClick(700);
                        }}
                        className={`h-7 w-7 rounded-full border-2 transition-all duration-300 ${
                          activeConfig.color === c.value
                            ? "scale-110 border-foreground"
                            : "border-transparent hover:scale-105"
                        }`}
                        style={{ backgroundColor: c.value }}
                      />
                    ))}
                    {/* Unlimited custom color — native browser color wheel */}
                    <label
                      title="Pick any color"
                      className="relative h-7 w-7 cursor-pointer overflow-hidden rounded-full border-2 border-border/60 transition-all duration-300 hover:scale-105"
                      style={{
                        background:
                          "conic-gradient(from 0deg, #ff5c8a, #ffb84d, #35e28f, #38e1ff, #8b6cff, #ff5c8a)",
                      }}
                    >
                      <input
                        type="color"
                        value={activeConfig.color}
                        onChange={(e) => updateConfig(active, { color: e.target.value })}
                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                      />
                    </label>
                    <input
                      type="text"
                      value={activeConfig.color}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v)) updateConfig(active, { color: v });
                      }}
                      maxLength={7}
                      className="h-7 w-20 rounded-full border border-border/60 bg-transparent px-3 text-[9px] tracking-[0.1em] text-foreground/80 focus:border-accent/60 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-[8px] tracking-[0.25em] text-muted-foreground/70">
                    STYLE
                  </p>
                  <div className="flex gap-2">
                    {VARIANT_OPTIONS[active].map((v) => (
                      <button
                        key={v.value}
                        type="button"
                        onClick={() => {
                          pushHistory();
                          updateConfig(active, { variant: v.value as Variant });
                          playClick(560);
                        }}
                        className={`flex-1 rounded-full border px-2 py-2 text-[9px] tracking-[0.15em] transition-all duration-300 ${
                          activeConfig.variant === v.value
                            ? "border-accent/70 bg-accent/10 text-accent"
                            : "border-border/60 text-muted-foreground hover:border-accent/40"
                        }`}
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-[8px] tracking-[0.25em] text-muted-foreground/70">
                    FINISH
                  </p>
                  <div className="flex gap-2">
                    {MATERIAL_OPTIONS.map((m) => (
                      <button
                        key={m.value}
                        type="button"
                        onClick={() => {
                          pushHistory();
                          updateConfig(active, { material: m.value as Material });
                          playClick(480);
                        }}
                        className={`flex-1 rounded-full border px-2 py-2 text-[9px] tracking-[0.15em] transition-all duration-300 ${
                          activeConfig.material === m.value
                            ? "border-accent/70 bg-accent/10 text-accent"
                            : "border-border/60 text-muted-foreground hover:border-accent/40"
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-[8px] tracking-[0.25em] text-muted-foreground/70">
                      GLOW INTENSITY
                    </p>
                    <span className="text-[9px] tracking-[0.15em] text-accent">
                      {activeConfig.intensity.toFixed(1)}×
                    </span>
                  </div>
                  <input
                    type="range"
                    min={MIN_INTENSITY}
                    max={MAX_INTENSITY}
                    step={0.1}
                    value={activeConfig.intensity}
                    onChange={(e) => updateConfig(active, { intensity: Number(e.target.value) })}
                    className="w-full accent-[color:var(--color-accent)]"
                  />
                </div>
              </div>

              {mode === "SETUP" ? (
                <div className="mt-2 flex flex-col gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIncluded([...PARTS])}
                    className="rounded-full border border-accent/50 px-6 py-3 text-[10px] tracking-[0.3em] text-accent transition-all duration-500 hover:bg-accent/15"
                  >
                    ASSEMBLE EVERYTHING
                  </button>
                </div>
              ) : (
                <p className="mt-2 text-xs font-light leading-relaxed text-muted-foreground">
                  {SPECS[active]}
                </p>
              )}

              <Link
                to="/"
                className="mt-4 text-[10px] tracking-[0.3em] text-accent hover:underline"
              >
                ← BACK TO EXPERIENCE
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
    </TooltipProvider>
  );
}
