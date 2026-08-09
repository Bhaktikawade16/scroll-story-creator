import { Link } from "@tanstack/react-router";

const links = [
  { label: "EXPERIENCE", href: "#experience" },
  { label: "HOW IT WORKS", href: "#how-it-works" },
  { label: "BUILD", href: "#build" },
];

export function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <Link
          to="/"
          className="font-display text-sm tracking-[0.35em] text-foreground/90 sm:text-base"
        >
          SETUPVERSE
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-[11px] tracking-[0.22em] text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <Link
          to="/builder"
          className="group rounded-full border border-border/70 bg-foreground/[0.04] px-4 py-2 text-[10px] tracking-[0.22em] text-foreground/90 backdrop-blur-xl transition-all hover:border-accent/60 hover:bg-accent/10 sm:text-[11px]"
        >
          START BUILDING
          <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">
            →
          </span>
        </Link>
      </div>
    </header>
  );
}
