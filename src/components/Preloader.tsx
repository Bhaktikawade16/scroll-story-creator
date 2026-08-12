import { useEffect, useState } from "react";

/** Cinematic entry: wordmark, progress line, then a soft dissolve. */
export function Preloader() {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let p = 0;
    const id = window.setInterval(() => {
      p = Math.min(100, p + 3 + Math.random() * 7);
      setProgress(p);
      if (p >= 100) {
        window.clearInterval(id);
        window.setTimeout(() => setDone(true), 650);
      }
    }, 70);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    document.body.style.overflow = done ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [done]);

  return (
    <div
      className={`fixed inset-0 z-[90] flex flex-col items-center justify-center bg-background transition-all duration-1000 ${
        done ? "pointer-events-none opacity-0 blur-lg" : "opacity-100"
      }`}
      aria-hidden={done}
    >
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[50vmin] w-[50vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[140px]" />
      <div className="font-display text-luxe relative text-xs tracking-[0.5em] sm:text-sm">
        SETUPVERSE
      </div>
      <div className="relative mt-6 text-[9px] tracking-[0.4em] text-muted-foreground">
        BUILDING YOUR EXPERIENCE
      </div>
      <div className="relative mt-10 h-px w-40 overflow-hidden bg-foreground/10 sm:w-64">
        <div
          className="h-full bg-gradient-to-r from-primary via-accent to-[var(--violet)] transition-[width] duration-200 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="relative mt-4 text-[9px] tracking-[0.3em] text-muted-foreground">
        {String(Math.round(progress)).padStart(3, "0")}
      </div>
    </div>
  );
}
