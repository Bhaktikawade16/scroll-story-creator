import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Atmosphere } from "@/components/Atmosphere";
import { FrameSequence } from "@/components/FrameSequence";
import { Marquee } from "@/components/Marquee";
import { Navbar } from "@/components/Navbar";
import { Reveal } from "@/components/Reveal";
import { ScrollProgress } from "@/components/ScrollProgress";
import { SectionLabel } from "@/components/SectionLabel";
import { Tilt } from "@/components/Tilt";
import { frameUrlsA, frameUrlsB } from "@/lib/frames";
import cpuAsset from "@/assets/cpu_open.jpg.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SETUPVERSE — Build Your Space" },
      {
        name: "description",
        content:
          "Explore a complete gaming workspace in 3D, then design your own. SETUPVERSE is a cinematic setup-building experience.",
      },
      { property: "og:title", content: "SETUPVERSE — Build Your Space" },
      {
        property: "og:description",
        content:
          "Explore a complete gaming workspace in 3D, then design your own setup.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const PARTS = [
  { name: "PC", spec: "CORE ENGINE" },
  { name: "MONITOR", spec: "THE WINDOW" },
  { name: "KEYBOARD", spec: "TOUCH" },
  { name: "MOUSE", spec: "PRECISION" },
  { name: "CHAIR", spec: "POSTURE" },
  { name: "LIGHTING", spec: "ATMOSPHERE" },
];

const MARQUEE = [
  "CINEMATIC 3D",
  "REAL COMPONENTS",
  "INFINITE LAYOUTS",
  "LIGHT & MATERIAL",
  "BUILT YOUR WAY",
];

function Index() {
  return (
    <main className="relative bg-background text-foreground">
      <ScrollProgress />
      <Atmosphere />
      <Navbar />

      <div className="relative z-10">
        {/* SLIDE 1 — OPENING */}
        <section className="relative flex h-screen flex-col items-center justify-center overflow-hidden">
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/12 blur-[140px]" />
          <motion.div
            initial={{ opacity: 0, letterSpacing: "0.9em" }}
            animate={{ opacity: 1, letterSpacing: "0.42em" }}
            transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-luxe text-center text-xs sm:text-sm"
          >
            SETUPVERSE
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 1.4 }}
            className="mt-6 text-[10px] tracking-[0.32em] text-muted-foreground"
          >
            A CINEMATIC SETUP EXPERIENCE
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1.2 }}
            className="absolute bottom-10 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3"
          >
            <span className="text-[10px] tracking-[0.3em] text-muted-foreground">
              SCROLL
            </span>
            <motion.span
              animate={{ scaleY: [0.2, 1, 0.2], opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2.4, repeat: Infinity }}
              className="h-10 w-px origin-top bg-gradient-to-b from-accent to-transparent"
            />
          </motion.div>
        </section>

        <section id="experience">
          <FrameSequence
            frames={frameUrlsA}
            heightVh={420}
            canvasStyle={(p) => ({
              transform: `scale(${1.06 + p * 0.08})`,
              filter: `saturate(${0.9 + p * 0.25}) contrast(${1 + p * 0.08})`,
            })}
          >
            {(p) => (
              <div className="pointer-events-none absolute inset-0 flex flex-col justify-center px-6 sm:px-12 lg:px-20">
                <div
                  style={{
                    opacity: Math.min(1, Math.max(0, 1 - (p - 0.55) / 0.25)),
                    transform: `translateY(${-p * 40}px)`,
                  }}
                >
                  <h1 className="text-cine text-luxe text-[16vw] leading-[0.85] sm:text-[12vw] lg:text-[9vw]">
                    BUILD
                    <br />
                    YOUR SPACE.
                  </h1>
                  <p className="mt-6 max-w-sm text-sm font-light text-muted-foreground sm:text-base">
                    A new way to imagine your perfect setup.
                  </p>
                </div>
                <div
                  className="absolute bottom-12 right-6 hidden text-right sm:right-12 md:block"
                  style={{ opacity: Math.min(1, p * 2) }}
                >
                  <span className="text-[10px] tracking-[0.35em] text-muted-foreground">
                    SEQUENCE 01 / {String(Math.round(p * 100)).padStart(3, "0")}
                  </span>
                </div>
              </div>
            )}
          </FrameSequence>
        </section>

        <Marquee items={MARQUEE} />

        {/* SLIDE 2 — WHAT IS SETUPVERSE */}
        <section
          id="how-it-works"
          className="relative flex min-h-screen items-center overflow-hidden py-32"
        >
          <ParallaxImage />
          <div className="relative z-10 mx-auto w-full max-w-7xl px-6 sm:px-12">
            <Reveal>
              <SectionLabel index="01" label="THE CONCEPT" />
            </Reveal>
            <Reveal>
              <h2 className="text-cine text-luxe text-[13vw] sm:text-[9vw] lg:text-[6.5vw]">
                YOUR SETUP
                <br />
                STARTS WITH
                <br />
                <span className="text-chroma">AN IDEA.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="mt-10 max-w-md text-sm font-light leading-relaxed text-muted-foreground sm:text-base">
                SETUPVERSE lets you explore a complete gaming workspace in 3D
                before creating your own.
              </p>
            </Reveal>
            <Reveal delay={0.25}>
              <div className="mt-14 grid max-w-2xl grid-cols-3 gap-6">
                {[
                  ["06", "CATEGORIES"],
                  ["3D", "EXPLORATION"],
                  ["∞", "COMBINATIONS"],
                ].map(([n, l]) => (
                  <div key={l}>
                    <div className="font-display text-3xl text-foreground sm:text-4xl">
                      {n}
                    </div>
                    <div className="mt-2 text-[9px] tracking-[0.3em] text-muted-foreground">
                      {l}
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* SLIDE 3 — SEE IT DIFFERENTLY */}
        <FrameSequence
          frames={frameUrlsB}
          heightVh={460}
          canvasStyle={(p) => ({
            transform: `scale(${1.15 - p * 0.1})`,
          })}
        >
          {(p) => (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-end justify-center px-6 text-right sm:px-12 lg:px-20">
              {["SEE IT.", "EXPLORE IT.", "MAKE IT YOURS."].map((line, i) => (
                <span
                  key={line}
                  className="text-cine text-luxe block text-[12vw] sm:text-[8vw] lg:text-[6vw]"
                  style={{
                    opacity: Math.min(1, Math.max(0, (p - 0.12 * i) / 0.14)),
                    transform: `translateY(${Math.max(0, 40 - p * 400 + i * 60)}px)`,
                    filter: `blur(${Math.max(0, 14 - p * 120 + i * 18)}px)`,
                  }}
                >
                  {line}
                </span>
              ))}
              <p
                className="mt-8 max-w-sm text-xs font-light leading-relaxed text-muted-foreground sm:text-sm"
                style={{ opacity: Math.min(1, Math.max(0, (p - 0.55) / 0.2)) }}
              >
                Explore how the PC, monitor, keyboard, mouse, chair and
                accessories come together to create one complete workspace.
              </p>
            </div>
          )}
        </FrameSequence>

        {/* SLIDE 4 — MORE THAN A PC */}
        <section className="relative flex min-h-screen items-center overflow-hidden py-32">
          <ParallaxImage align="right" opacity={0.5} />
          <div className="relative z-10 mx-auto w-full max-w-7xl px-6 sm:px-12">
            <Reveal>
              <SectionLabel index="02" label="THE COMPOSITION" />
            </Reveal>
            <Reveal>
              <h2 className="text-cine text-luxe text-[14vw] sm:text-[9vw] lg:text-[7vw]">
                IT&apos;S NOT JUST
                <br />A PC.
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-8 max-w-sm text-sm font-light text-muted-foreground">
                It&apos;s the space where everything comes together.
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <ul className="mt-14 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border/40 sm:grid-cols-3">
                {PARTS.map((p, i) => (
                  <li
                    key={p.name}
                    className="group relative bg-foreground/[0.02] px-5 py-7 transition-colors duration-500 hover:bg-accent/[0.07]"
                  >
                    <span className="text-[9px] tracking-[0.3em] text-muted-foreground">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="mt-3 font-display text-sm tracking-[0.24em] text-foreground/90 transition-colors group-hover:text-accent">
                      {p.name}
                    </div>
                    <div className="mt-1 text-[9px] tracking-[0.28em] text-muted-foreground">
                      {p.spec}
                    </div>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>

        {/* SLIDE 5 — THE IDEA */}
        <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-32 text-center">
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[60vmin] w-[80vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--violet)]/12 blur-[160px]" />
          <Reveal>
            <h2 className="text-cine text-luxe relative text-[13vw] sm:text-[9vw] lg:text-[6.5vw]">
              WHAT IF
              <br />
              YOU COULD
              <br />
              BUILD IT
              <br />
              <span className="text-chroma">YOUR WAY?</span>
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <Tilt className="mx-auto mt-16 w-[min(680px,90vw)]" max={6}>
              <motion.img
                src={cpuAsset.url}
                alt="Open gaming PC build with liquid cooling and RGB lighting"
                loading="lazy"
                className="w-full rounded-2xl opacity-90 mix-blend-screen"
                initial={{ scale: 1 }}
                whileInView={{ scale: 1.05 }}
                viewport={{ once: true }}
                transition={{ duration: 4, ease: "easeOut" }}
              />
            </Tilt>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mx-auto mt-10 max-w-md text-sm font-light text-muted-foreground">
              Choose the components, style, lighting and arrangement that match
              your vision.
            </p>
          </Reveal>
          <motion.div
            animate={{ y: [0, 14, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            className="mt-16 text-2xl text-accent"
            aria-hidden
          >
            ↓
          </motion.div>
        </section>

        {/* SLIDE 6 — THE EXPERIENCE */}
        <section
          id="build"
          className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-32"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_50%,color-mix(in_oklab,var(--color-primary)_14%,transparent),transparent_70%)]" />
          <div className="relative w-full max-w-5xl">
            <Reveal>
              <p className="text-center text-[10px] tracking-[0.35em] text-muted-foreground">
                THIS IS WHERE YOU WILL BUILD YOUR SETUP
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <Tilt className="mt-12" max={7}>
                <div className="glass-panel relative overflow-hidden rounded-3xl">
                  <img
                    src={cpuAsset.url}
                    alt="Gaming setup preview inside the SETUPVERSE configurator"
                    loading="lazy"
                    className="h-[46vh] w-full object-cover opacity-80 sm:h-[58vh]"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                  <div className="pointer-events-none absolute left-6 top-6 flex items-center gap-2 text-[9px] tracking-[0.3em] text-muted-foreground">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
                    LIVE PREVIEW
                  </div>
                </div>
              </Tilt>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="mt-10 flex flex-wrap justify-center gap-3">
                {PARTS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    className="glass-panel rounded-full px-5 py-2.5 text-[10px] tracking-[0.25em] text-foreground/80 transition-all duration-300 hover:scale-105 hover:text-foreground hover:glow-accent sm:text-[11px]"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* SLIDE 7 — MAKE YOUR OWN SETUP */}
        <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-32 text-center">
          <motion.img
            src={cpuAsset.url}
            alt="Complete custom gaming setup"
            loading="lazy"
            initial={{ scale: 1, opacity: 0.25 }}
            whileInView={{ scale: 1.18, opacity: 0.4 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 8, ease: "easeOut" }}
            className="pointer-events-none absolute inset-0 h-full w-full object-cover mix-blend-screen"
          />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_70%_at_50%_50%,transparent_10%,var(--color-background)_85%)]" />

          <div className="relative">
            <Reveal>
              <h2 className="text-cine text-luxe text-[15vw] sm:text-[10vw] lg:text-[7.5vw]">
                MAKE
                <br />
                YOUR OWN
                <br />
                SETUP.
              </h2>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-10 text-sm font-light leading-8 tracking-[0.2em] text-muted-foreground">
                Design it.
                <br />
                Customize it.
                <br />
                Make it yours.
              </p>
            </Reveal>
            <Reveal delay={0.35}>
              <Link
                to="/builder"
                className="group relative mt-16 inline-flex items-center gap-4 overflow-hidden rounded-full border border-accent/40 bg-accent/10 px-10 py-5 font-display text-xs tracking-[0.3em] text-foreground backdrop-blur-xl transition-all duration-500 hover:border-accent hover:bg-accent/20 hover:glow-accent sm:text-sm"
              >
                <span className="relative z-10">START BUILDING</span>
                <span className="relative z-10 transition-transform duration-500 group-hover:translate-x-2">
                  →
                </span>
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-accent/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              </Link>
            </Reveal>
          </div>
        </section>

        <footer className="relative border-t border-border/40 px-6 py-12">
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 text-[10px] tracking-[0.3em] text-muted-foreground sm:flex-row sm:justify-between">
            <span className="font-display text-luxe text-sm tracking-[0.4em]">
              SETUPVERSE
            </span>
            <span>DESIGNED FOR THE SPACE YOU PLAY IN</span>
          </div>
        </footer>
      </div>
    </main>
  );
}

function ParallaxImage({
  align = "left",
  opacity = 0.6,
}: {
  align?: "left" | "right";
  opacity?: number;
}) {
  return (
    <motion.div
      initial={{ y: 60, scale: 1.04, opacity: 0 }}
      whileInView={{ y: -40, scale: 1.12, opacity }}
      viewport={{ once: false, amount: 0.2 }}
      transition={{ duration: 2.4, ease: [0.16, 1, 0.3, 1] }}
      className={`pointer-events-none absolute top-0 h-full w-[85%] ${
        align === "left" ? "right-0" : "left-0"
      }`}
    >
      <img
        src={cpuAsset.url}
        alt="High-end gaming PC interior"
        loading="lazy"
        className="h-full w-full object-cover mix-blend-screen"
      />
      <div className="absolute inset-0 bg-[radial-gradient(70%_70%_at_50%_50%,transparent,var(--color-background))]" />
    </motion.div>
  );
}
