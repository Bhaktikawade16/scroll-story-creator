import { useEffect, useRef } from "react";

/**
 * Extremely subtle floating dust field rendered on a single canvas.
 * Density scales down on small screens; disabled for reduced motion.
 */
export function Particles({ density = 1 }: { density?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let dpr = 1;
    type P = { x: number; y: number; z: number; vx: number; vy: number };
    let pts: P[] = [];

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const base = w < 720 ? 26 : 64;
      const count = Math.round(base * density);
      pts = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random(),
        vx: (Math.random() - 0.5) * 0.08,
        vy: -(0.04 + Math.random() * 0.12),
      }));
    };
    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      ctx.clearRect(0, 0, w, h);
      for (const p of pts) {
        p.x += p.vx * (0.4 + p.z);
        p.y += p.vy * (0.4 + p.z);
        if (p.y < -10) {
          p.y = h + 10;
          p.x = Math.random() * w;
        }
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        const r = 0.4 + p.z * 1.6;
        ctx.beginPath();
        ctx.fillStyle = `rgba(190, 232, 255, ${0.05 + p.z * 0.16})`;
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [density]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[5] h-screen w-screen"
    />
  );
}
