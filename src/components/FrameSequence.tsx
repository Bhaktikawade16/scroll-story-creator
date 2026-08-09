import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  frames: string[];
  /** Total scroll height of the pinned section, in vh. */
  heightVh?: number;
  /** Rendered above the canvas inside the pinned viewport. */
  children?: (progress: number) => ReactNode;
  className?: string;
  /** Extra canvas styling driven by progress (scale etc.). */
  canvasStyle?: (progress: number) => React.CSSProperties;
};

export function FrameSequence({
  frames,
  heightVh = 400,
  children,
  className,
  canvasStyle,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(0);

  useEffect(() => {
    imagesRef.current = frames.map((src, i) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        if (i === 0) draw(0);
      };
      return img;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const draw = (index: number) => {
    const canvas = canvasRef.current;
    const img = imagesRef.current[index];
    if (!canvas || !img || !img.complete || !img.naturalWidth) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
  };

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = containerRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const total = el.offsetHeight - window.innerHeight;
        const p = total > 0 ? Math.min(Math.max(-rect.top / total, 0), 1) : 0;
        const idx = Math.min(
          frames.length - 1,
          Math.round(p * (frames.length - 1)),
        );
        draw(idx);
        if (Math.abs(p - progressRef.current) > 0.004) {
          progressRef.current = p;
          setProgress(p);
        }
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative ${className ?? ""}`}
      style={{ height: `${heightVh}vh` }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-background">
        <canvas
          ref={canvasRef}
          className="h-full w-full"
          style={canvasStyle?.(progress)}
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_50%,transparent_35%,var(--color-background)_100%)]" />
        {children?.(progress)}
      </div>
    </div>
  );
}
