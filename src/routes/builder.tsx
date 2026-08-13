import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Atmosphere } from "@/components/Atmosphere";
import { Cursor } from "@/components/Cursor";
import { Navbar } from "@/components/Navbar";
import { Reveal } from "@/components/Reveal";
import { ProductStage, type Category } from "@/components/ProductStage";

export const Route = createFileRoute("/builder")({
  head: () => ({
    meta: [
      { title: "Builder — SETUPVERSE" },
      {
        name: "description",
        content:
          "Configure your setup in real time 3D: choose PC, monitor, keyboard, mouse, chair and lighting, then watch it assemble.",
      },
      { property: "og:title", content: "Builder — SETUPVERSE" },
      {
        property: "og:description",
        content:
          "Assemble your own workspace piece by piece in an interactive 3D configurator.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Builder,
});

const PARTS: Category[] = [
  "PC",
  "MONITOR",
  "KEYBOARD",
  "MOUSE",
  "CHAIR",
  "LIGHTING",
];

const SPECS: Record<Category, string> = {
  PC: "CORE ENGINE — click the tower to explode the build",
  MONITOR: "THE WINDOW — ultrawide panel, thin bezel",
  KEYBOARD: "TOUCH — low profile, per-key glow",
  MOUSE: "PRECISION — sculpted shell, sensor rail",
  CHAIR: "POSTURE — five-star base, high back",
  LIGHTING: "ATMOSPHERE — reactive ambient bars",
};

function Builder() {
  const [active, setActive] = useState<Category>("PC");
  const [exploded, setExploded] = useState(false);
  const [mode, setMode] = useState<"COMPONENT" | "SETUP">("COMPONENT");
  const [chosen, setChosen] = useState<Category[]>(["PC"]);

  const toggleChosen = (p: Category) =>
    setChosen((c) => (c.includes(p) ? c.filter((x) => x !== p) : [...c, p]));

  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <Atmosphere />
      <Cursor />
      <Navbar />

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
            <div className="glass-panel flex rounded-full p-1">
              {(["COMPONENT", "SETUP"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
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
        </Reveal>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_300px]">
          <Reveal>
            <div className="glass-panel relative overflow-hidden rounded-[28px]">
              <div className="h-[62vh] min-h-[440px] w-full">
                <ProductStage
                  category={active}
                  exploded={exploded}
                  onToggleExplode={() => setExploded((e) => !e)}
                  autoSpin={mode === "SETUP"}
                  setup={mode === "SETUP" ? chosen : undefined}
                />
              </div>
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(85%_70%_at_50%_45%,transparent_45%,var(--color-background)_100%)]" />
              <div className="pointer-events-none absolute left-6 top-6 flex items-center gap-2 text-[9px] tracking-[0.3em] text-muted-foreground">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
                {mode === "SETUP" ? "ASSEMBLY" : active}
              </div>
              <div className="pointer-events-none absolute bottom-6 left-6 right-6 flex flex-wrap justify-between gap-3 text-[9px] tracking-[0.3em] text-muted-foreground">
                <span>DRAG TO ROTATE</span>
                <span>
                  {mode === "SETUP"
                    ? `${chosen.length}/6 PIECES PLACED`
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
            <div className="flex flex-col gap-3">
              <p className="text-[9px] tracking-[0.3em] text-muted-foreground">
                {mode === "SETUP" ? "ADD TO SETUP" : "INSPECT COMPONENT"}
              </p>
              {PARTS.map((p) => {
                const on = mode === "SETUP" ? chosen.includes(p) : active === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      if (mode === "SETUP") toggleChosen(p);
                      else {
                        setActive(p);
                        setExploded(false);
                      }
                    }}
                    className={`glass-panel group relative overflow-hidden rounded-2xl px-6 py-4 text-left transition-all duration-500 hover:-translate-y-0.5 ${
                      on ? "text-foreground glow-accent" : "text-muted-foreground"
                    }`}
                  >
                    <span className="text-[11px] tracking-[0.28em]">{p}</span>
                    <span
                      className={`absolute right-5 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full transition-all duration-500 ${
                        on ? "bg-accent" : "bg-foreground/15"
                      }`}
                    />
                  </button>
                );
              })}

              {mode === "SETUP" ? (
                <button
                  type="button"
                  onClick={() => setChosen(PARTS)}
                  className="mt-2 rounded-full border border-accent/50 px-6 py-3 text-[10px] tracking-[0.3em] text-accent transition-all duration-500 hover:bg-accent/15"
                >
                  ASSEMBLE EVERYTHING
                </button>
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
  );
}
