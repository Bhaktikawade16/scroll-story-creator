import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

const links = [
  { label: "EXPERIENCE", href: "#experience" },
  { label: "HOW IT WORKS", href: "#how-it-works" },
  { label: "BUILD", href: "#build" },
];

export function Navbar() {
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-5">
      <div
        className={`mx-auto flex max-w-7xl items-center justify-between rounded-full px-4 py-2.5 transition-all duration-700 sm:px-6 sm:py-3 ${
          solid
            ? "glass-panel shadow-[0_20px_60px_-30px_rgba(0,0,0,0.9)]"
            : "border border-transparent"
        }`}
      >
        <Link
          to="/"
          className="group flex items-center gap-3"
          aria-label="SETUPVERSE home"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inset-0 rounded-full bg-accent opacity-70 blur-[3px]" />
            <span className="relative h-2 w-2 rounded-full bg-accent" />
          </span>
          <span className="font-display text-xs tracking-[0.4em] text-foreground/90 sm:text-sm">
            SETUPVERSE
          </span>
        </Link>

        <nav className="hidden items-center gap-9 md:flex">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="group relative text-[10px] tracking-[0.28em] text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
              <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-accent transition-all duration-500 group-hover:w-full" />
            </a>
          ))}
        </nav>

        <Link
          to="/builder"
          className="group relative overflow-hidden rounded-full border border-border/70 px-4 py-2 text-[10px] tracking-[0.24em] text-foreground/90 transition-all duration-500 hover:border-accent/70 sm:text-[11px]"
        >
          <span className="relative z-10">START BUILDING</span>
          <span className="relative z-10 ml-2 inline-block transition-transform duration-500 group-hover:translate-x-1">
            →
          </span>
          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-accent/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
        </Link>
      </div>
    </header>
  );
}
