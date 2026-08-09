import { useEffect, useRef, useState } from "react";
import { frameUrls } from "@/lib/frames";

export function ScrollFrames() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const [, setLoaded] = useState(0);

  useEffect(() => {
    let done = 0;
    imagesRef.current = frameUrls.map((src) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        done += 1;
        setLoaded(done);
        if (done === 1) draw(0);
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
          frameUrls.length - 1,
          Math.round(p * (frameUrls.length - 1)),
        );
        draw(idx);
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
  }, []);

  return (
    <div ref={containerRef} className="relative" style={{ height: "500vh" }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-background">
        <canvas ref={canvasRef} className="h-full w-full" />
      </div>
    </div>
  );
}
