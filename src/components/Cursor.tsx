import { useEffect, useRef, useState } from "react";

/** Minimal dot cursor that expands over interactive elements. Desktop only. */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setEnabled(true);

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let rx = x;
    let ry = y;
    let raf = 0;

    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      const el = e.target as HTMLElement | null;
      setActive(!!el?.closest("a, button, [role='button'], canvas"));
    };

    const tick = () => {
      raf = requestAnimationFrame(tick);
      rx += (x - rx) * 0.16;
      ry += (y - ry) * 0.16;
      if (dot.current) dot.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      if (ring.current)
        ring.current.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
    };
    raf = requestAnimationFrame(tick);
    window.addEventListener("pointermove", move, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[80] hidden md:block" aria-hidden>
      <div
        ref={dot}
        className="absolute -ml-[2px] -mt-[2px] h-1 w-1 rounded-full bg-accent"
      />
      <div
        ref={ring}
        className={`absolute rounded-full border border-accent/50 transition-[width,height,margin,opacity] duration-300 ${
          active
            ? "-ml-6 -mt-6 h-12 w-12 opacity-90"
            : "-ml-3 -mt-3 h-6 w-6 opacity-40"
        }`}
      />
    </div>
  );
}
