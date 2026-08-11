import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Atmosphere } from "@/components/Atmosphere";
import { Navbar } from "@/components/Navbar";
import { Tilt } from "@/components/Tilt";
import { Reveal } from "@/components/Reveal";
import cpuAsset from "@/assets/cpu_open.jpg.asset.json";

export const Route = createFileRoute("/builder")({
  head: () => ({
    meta: [
      { title: "Builder — SETUPVERSE" },
      {
        name: "description",
        content:
          "Start building your own setup: choose your PC, monitor, keyboard, mouse, chair and lighting inside SETUPVERSE.",
      },
      { property: "og:title", content: "Builder — SETUPVERSE" },
      {
        property: "og:description",
        content: "Choose your components and design your own setup.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Builder,
});

const PARTS = ["PC", "MONITOR", "KEYBOARD", "MOUSE", "CHAIR", "LIGHTING"];

function Builder() {
  const [active, setActive] = useState("PC");

  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <Atmosphere />
      <Navbar />
      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-24 pt-32 sm:px-12">
        <Reveal>
          <p className="text-[10px] tracking-[0.35em] text-muted-foreground">
            CONFIGURATOR
          </p>
          <h1 className="text-cine text-luxe mt-6 text-[12vw] sm:text-[7vw] lg:text-[5vw]">
            BUILD YOUR SETUP.
          </h1>
        </Reveal>

        <div className="mt-16 grid gap-10 lg:grid-cols-[1fr_280px]">
          <Reveal>
            <Tilt max={6}><div className="glass-panel relative overflow-hidden rounded-3xl">
              <img
                src={cpuAsset.url}
                alt="Setup preview"
                className="h-[50vh] w-full object-cover opacity-85"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
              <span className="absolute bottom-6 left-6 text-[10px] tracking-[0.3em] text-muted-foreground">
                {active}
              </span>
            </div></Tilt>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="flex flex-col gap-3">
              {PARTS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setActive(p)}
                  className={`glass-panel rounded-full px-6 py-3 text-left text-[11px] tracking-[0.25em] transition-all duration-300 hover:scale-[1.02] ${
                    active === p
                      ? "text-foreground glow-accent"
                      : "text-muted-foreground"
                  }`}
                >
                  {p}
                </button>
              ))}
              <p className="mt-4 text-xs font-light leading-relaxed text-muted-foreground">
                Full customization is coming soon. Pick a category to preview
                how your setup comes together.
              </p>
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
