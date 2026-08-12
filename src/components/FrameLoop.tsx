import { useEffect, useRef } from "react";

type Props = {
  frames: string[];
  /** Playback speed in frames per second. */
  fps?: number;
  className?: string;
  style?: React.CSSProperties;
  /** Ping-pong instead of looping back to frame 0. */
  bounce?: boolean;
};

/**
 * Lightweight autoplaying frame-sequence canvas.
 * Only paints while visible, and freezes on the first frame when the
 * visitor prefers reduced motion.
 */
export function FrameLoop({
  frames,
  fps = 18,
  className,
  style,
  bounce = false,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const visibleRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    imagesRef.current = frames.map((src, i) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        if (i === 0) draw(0);
      };
      return img;
    });

    function draw(index: number) {
      const c = canvasRef.current;
      const img = imagesRef.current[index];
      if (!c || !img || !img.complete || !img.naturalWidth) return;
      const ctx = c.getContext("2d");
      if (!ctx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = c.clientWidth;
      const h = c.clientHeight;
      if (!w || !h) return;
      if (c.width !== w * dpr || c.height !== h * dpr) {
        c.width = w * dpr;
        c.height = h * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
      const dw = img.naturalWidth * scale;
      const dh = img.naturalHeight * scale;
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
    }

    const io = new IntersectionObserver(
      ([e]) => {
        visibleRef.current = e.isIntersecting;
      },
      { rootMargin: "10% 0px" },
    );
    io.observe(canvas);

    let raf = 0;
    let last = 0;
    let i = 0;
    let dir = 1;
    const interval = 1000 / fps;

    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      if (!visibleRef.current || reduce) return;
      if (t - last < interval) return;
      last = t;
      draw(i);
      if (bounce) {
        i += dir;
        if (i >= frames.length - 1 || i <= 0) dir *= -1;
      } else {
        i = (i + 1) % frames.length;
      }
    };
    raf = requestAnimationFrame(tick);

    const onResize = () => draw(i);
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <canvas ref={canvasRef} className={className} style={style} aria-hidden />;
}
